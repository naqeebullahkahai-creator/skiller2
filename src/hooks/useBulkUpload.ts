import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ParsedProductRow,
  ValidationError,
  validateAllRows,
  resolveCategory,
  CATEGORY_MAPPINGS,
} from "@/utils/bulkUploadTemplate";

export interface BulkUploadError {
  row: number;
  field: string;
  message: string;
}

export interface BulkUploadLog {
  id: string;
  seller_id: string;
  file_name: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  error_log: BulkUploadError[];
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface UploadProgress {
  stage: "validating" | "uploading" | "complete" | "error";
  currentRow: number;
  totalRows: number;
  currentBatch: number;
  totalBatches: number;
  percentage: number;
  message: string;
}

const VALID_CATEGORIES = CATEGORY_MAPPINGS.map(c => c.name);

export const useBulkUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [uploadLogs, setUploadLogs] = useState<BulkUploadLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [progressDetails, setProgressDetails] = useState<UploadProgress | null>(null);

  const fetchUploadLogs = async () => {
    if (!user) return;
    
    try {
      setIsLoadingLogs(true);
      const { data, error } = await supabase
        .from("bulk_upload_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      const mappedLogs: BulkUploadLog[] = (data || []).map(log => ({
        id: log.id,
        seller_id: log.seller_id,
        file_name: log.file_name,
        total_rows: log.total_rows,
        successful_rows: log.successful_rows,
        failed_rows: log.failed_rows,
        error_log: Array.isArray(log.error_log) 
          ? (log.error_log as unknown as BulkUploadError[]) 
          : [],
        status: log.status,
        created_at: log.created_at,
        completed_at: log.completed_at,
      }));
      
      setUploadLogs(mappedLogs);
    } catch (error) {
      console.error("Error fetching upload logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const processUpload = async (
    rows: ParsedProductRow[],
    fileName: string
  ): Promise<{ success: boolean; successCount: number; failCount: number }> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to upload products",
        variant: "destructive",
      });
      return { success: false, successCount: 0, failCount: 0 };
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setValidationErrors([]);
    setCurrentBatch(0);
    
    // Stage 1: Validation with row-specific errors
    setProgressDetails({
      stage: "validating",
      currentRow: 0,
      totalRows: rows.length,
      currentBatch: 0,
      totalBatches: 0,
      percentage: 0,
      message: "Validating data...",
    });
    
    const allErrors = validateAllRows(rows);
    
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      setIsUploading(false);
      setProgressDetails({
        stage: "error",
        currentRow: 0,
        totalRows: rows.length,
        currentBatch: 0,
        totalBatches: 0,
        percentage: 0,
        message: `Found ${allErrors.length} errors. Fix them and try again.`,
      });
      toast({
        title: "Validation Failed",
        description: `Found ${allErrors.length} errors in your file. Fix them and try again.`,
        variant: "destructive",
      });
      return { success: false, successCount: 0, failCount: rows.length };
    }

    // Check for duplicate SKUs in database
    setProgressDetails({
      stage: "validating",
      currentRow: 0,
      totalRows: rows.length,
      currentBatch: 0,
      totalBatches: 0,
      percentage: 10,
      message: "Checking for existing SKUs...",
    });

    const skus = rows.map(r => r.sku.trim()).filter(s => s.length > 0);
    if (skus.length > 0) {
      const { data: existingProducts } = await supabase
        .from("products")
        .select("sku")
        .eq("seller_id", user.id)
        .in("sku", skus);
      
      if (existingProducts && existingProducts.length > 0) {
        const existingSkus = new Set(existingProducts.map(p => p.sku?.toLowerCase()));
        const duplicateErrors: ValidationError[] = [];
        
        rows.forEach((row, index) => {
          if (row.sku && existingSkus.has(row.sku.trim().toLowerCase())) {
            duplicateErrors.push({
              row: index + 2,
              field: "SKU",
              message: `Row ${index + 2}: SKU "${row.sku}" already exists in your product catalog`,
              value: row.sku,
            });
          }
        });
        
        if (duplicateErrors.length > 0) {
          setValidationErrors(duplicateErrors);
          setIsUploading(false);
          setProgressDetails({
            stage: "error",
            currentRow: 0,
            totalRows: rows.length,
            currentBatch: 0,
            totalBatches: 0,
            percentage: 0,
            message: `Found ${duplicateErrors.length} duplicate SKUs`,
          });
          toast({
            title: "Duplicate SKUs Found",
            description: `${duplicateErrors.length} products have SKUs that already exist in your catalog.`,
            variant: "destructive",
          });
          return { success: false, successCount: 0, failCount: rows.length };
        }
      }
    }
    
    // Stage 2: Create upload log
    const { data: logData, error: logError } = await supabase
      .from("bulk_upload_logs")
      .insert({
        seller_id: user.id,
        file_name: fileName,
        total_rows: rows.length,
        status: "processing",
      })
      .select()
      .single();
    
    if (logError) {
      console.error("Error creating upload log:", logError);
    }
    
    const logId = logData?.id;
    let successCount = 0;
    let failCount = 0;
    const uploadErrors: BulkUploadError[] = [];
    
    // Stage 3: Process in batches with real-time progress
    const batchSize = 25;
    const batches = Math.ceil(rows.length / batchSize);
    setTotalBatches(batches);
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      setCurrentBatch(batchNumber);
      
      const batch = rows.slice(i, i + batchSize);
      const progress = Math.round(20 + ((i / rows.length) * 75)); // 20-95% for uploading
      
      setProgressDetails({
        stage: "uploading",
        currentRow: i + batch.length,
        totalRows: rows.length,
        currentBatch: batchNumber,
        totalBatches: batches,
        percentage: progress,
        message: `Uploading batch ${batchNumber} of ${batches}...`,
      });
      setUploadProgress(progress);
      
      const products = batch.map((row) => {
        const categoryId = parseInt(row.category);
        const resolvedCategory = !isNaN(categoryId) 
          ? CATEGORY_MAPPINGS.find(c => c.id === categoryId)?.name 
          : resolveCategory(row.category);
        
        return {
          seller_id: user.id,
          title: row.title.trim(),
          description: row.description?.trim() || null,
          price_pkr: parseFloat(row.price),
          discount_price_pkr: row.discount_price && row.discount_price.trim() !== ""
            ? parseFloat(row.discount_price) 
            : null,
          category: resolvedCategory || row.category,
          stock_count: parseInt(row.stock_quantity),
          images: [],
          brand: null,
          sku: row.sku?.trim() || null,
          status: "pending" as const,
        };
      });
      
      const { data, error } = await supabase
        .from("products")
        .insert(products)
        .select();
      
      if (error) {
        console.error("Batch insert error:", error);
        failCount += batch.length;
        batch.forEach((row, idx) => {
          uploadErrors.push({
            row: i + idx + 2,
            field: "Database",
            message: `Row ${i + idx + 2}: ${error.message}`,
          });
        });
      } else {
        successCount += data?.length || 0;
        failCount += batch.length - (data?.length || 0);
      }
    }
    
    // Stage 4: Complete
    setProgressDetails({
      stage: "complete",
      currentRow: rows.length,
      totalRows: rows.length,
      currentBatch: batches,
      totalBatches: batches,
      percentage: 100,
      message: successCount > 0 
        ? `Successfully uploaded ${successCount} products!` 
        : "Upload failed",
    });
    
    // Update upload log
    if (logId) {
      const errorLogJson = uploadErrors.map(e => ({
        row: e.row,
        field: e.field,
        message: e.message
      }));
      
      await supabase
        .from("bulk_upload_logs")
        .update({
          successful_rows: successCount,
          failed_rows: failCount,
          error_log: errorLogJson,
          status: failCount === 0 ? "completed" : "completed_with_errors",
          completed_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }
    
    setIsUploading(false);
    setUploadProgress(100);
    setCurrentBatch(0);
    setTotalBatches(0);
    
    toast({
      title: successCount > 0 ? "Upload Complete! 🎉" : "Upload Failed",
      description: `Successfully uploaded ${successCount} products${failCount > 0 ? `, ${failCount} failed` : ""}`,
      variant: successCount > 0 ? "default" : "destructive",
    });
    
    return { success: successCount > 0, successCount, failCount };
  };

  const resetProgress = useCallback(() => {
    setProgressDetails(null);
    setUploadProgress(0);
    setCurrentBatch(0);
    setTotalBatches(0);
  }, []);

  return {
    isUploading,
    uploadProgress,
    currentBatch,
    totalBatches,
    validationErrors,
    uploadLogs,
    isLoadingLogs,
    progressDetails,
    processUpload,
    fetchUploadLogs,
    setValidationErrors,
    resetProgress,
  };
};

export const useBulkActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkUpdateStock = async (productIds: string[], newStock: number) => {
    if (!user || productIds.length === 0) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_count: newStock, updated_at: new Date().toISOString() })
        .in("id", productIds)
        .eq("seller_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Stock Updated",
        description: `Updated stock for ${productIds.length} products`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkUpdateStatus = async (productIds: string[], status: "active" | "pending" | "rejected") => {
    if (!user || productIds.length === 0) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", productIds)
        .eq("seller_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `Set ${productIds.length} products to ${status}`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkDelete = async (productIds: string[]) => {
    if (!user || productIds.length === 0) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", productIds)
        .eq("seller_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Products Deleted",
        description: `Deleted ${productIds.length} products`,
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    bulkUpdateStock,
    bulkUpdateStatus,
    bulkDelete,
  };
};
