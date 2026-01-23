import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

export interface ProductCSVRow {
  title: string;
  description: string;
  price: string | number;
  discount_price?: string | number;
  category: string;
  stock_quantity: string | number;
  image_url?: string;
  brand?: string;
  sku?: string;
}

const VALID_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Home & Garden",
  "Sports",
  "Beauty",
  "Books",
  "Toys",
  "Automotive",
  "Health",
  "Groceries",
];

// Generate branded FANZON CSV template with instructions
export const generateCSVTemplate = (): string => {
  // Header row with user-friendly names and indicators
  const brandingRow = "# FANZON Bulk Upload Template - Version 1.0";
  const instructionRow = "# Fields marked with * are MANDATORY. Fill all rows starting from row 4.";
  
  const headers = [
    "Product Name*",
    "Description",
    "Price (PKR)*",
    "Sale Price (PKR)",
    "Category*",
    "Stock*",
    "Image URL",
    "Brand",
    "SKU",
  ];
  
  const exampleRow1 = [
    "Wireless Bluetooth Earbuds",
    "Premium quality earbuds with noise cancellation and 24-hour battery life",
    "4500",
    "3999",
    "Electronics",
    "50",
    "https://example.com/earbuds.jpg",
    "TechPro",
    "SKU-EAR-001",
  ];

  const exampleRow2 = [
    "Cotton T-Shirt - Large Blue",
    "100% cotton casual t-shirt, comfortable fit",
    "1200",
    "",
    "Fashion",
    "100",
    "https://example.com/tshirt.jpg",
    "StyleWear",
    "SKU-TSH-002",
  ];
  
  return [
    brandingRow,
    instructionRow,
    headers.join(","),
    exampleRow1.join(","),
    exampleRow2.join(","),
  ].join("\n");
};

// Generate Excel-compatible template with formatting instructions
export const generateExcelInstructions = (): string => {
  return `
╔══════════════════════════════════════════════════════════════════════╗
║                    FANZON BULK UPLOAD GUIDE                          ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  📋 MANDATORY FIELDS (Must be filled):                               ║
║     • Product Name* - Your product title (max 200 characters)        ║
║     • Price (PKR)* - Regular price in Pakistani Rupees               ║
║     • Category* - Must match exactly (see list below)                ║
║     • Stock* - Quantity available (whole number)                     ║
║                                                                      ║
║  📝 OPTIONAL FIELDS:                                                 ║
║     • Description - Product details (max 2000 characters)            ║
║     • Sale Price (PKR) - Discounted price (must be less than Price)  ║
║     • Image URL - Direct link to product image                       ║
║     • Brand - Brand/manufacturer name                                ║
║     • SKU - Your unique product code                                 ║
║                                                                      ║
║  📂 VALID CATEGORIES:                                                ║
║     Electronics, Fashion, Home & Garden, Sports, Beauty,             ║
║     Books, Toys, Automotive, Health, Groceries                       ║
║                                                                      ║
║  ⚠️ IMPORTANT TIPS:                                                  ║
║     • Do not change the header row                                   ║
║     • Delete the example rows before uploading                       ║
║     • Maximum 1000 products per upload                               ║
║     • Image URLs must be publicly accessible                         ║
║     • Use UTF-8 encoding for special characters                      ║
║                                                                      ║
║  ❓ Need Help? Contact seller-support@fanzon.pk                      ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
`.trim();
};

// Map user-friendly headers to internal field names
const HEADER_MAP: Record<string, string> = {
  "product name*": "title",
  "product name": "title",
  "title": "title",
  "description": "description",
  "price (pkr)*": "price",
  "price (pkr)": "price",
  "price*": "price",
  "price": "price",
  "sale price (pkr)": "discount_price",
  "discount_price": "discount_price",
  "discount price": "discount_price",
  "category*": "category",
  "category": "category",
  "stock*": "stock_quantity",
  "stock": "stock_quantity",
  "stock_quantity": "stock_quantity",
  "image url": "image_url",
  "image_url": "image_url",
  "brand": "brand",
  "sku": "sku",
};

export const parseCSV = (content: string): ProductCSVRow[] => {
  const lines = content.trim().split("\n");
  
  // Skip comment lines (starting with #)
  const dataLines = lines.filter(line => !line.trim().startsWith("#"));
  if (dataLines.length < 2) return [];
  
  // Parse headers with mapping
  const rawHeaders = dataLines[0].split(",").map((h) => 
    h.trim().toLowerCase().replace(/"/g, "").replace(/\*/g, "*")
  );
  
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);
  
  return dataLines.slice(1).map((line) => {
    // Handle quoted values with commas
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index]?.replace(/"/g, "") || "";
    });
    
    return {
      title: row.title || "",
      description: row.description || "",
      price: row.price || "",
      discount_price: row.discount_price || "",
      category: row.category || "",
      stock_quantity: row.stock_quantity || "",
      image_url: row.image_url || "",
      brand: row.brand || "",
      sku: row.sku || "",
    };
  });
};

export const validateRow = (
  row: ProductCSVRow,
  rowIndex: number
): BulkUploadError[] => {
  const errors: BulkUploadError[] = [];
  
  // Title validation
  if (!row.title || row.title.trim().length === 0) {
    errors.push({
      row: rowIndex,
      field: "Product Name",
      message: "Product name is required",
    });
  } else if (row.title.trim().length > 200) {
    errors.push({
      row: rowIndex,
      field: "Product Name",
      message: "Product name must be less than 200 characters",
    });
  }
  
  // Price validation
  const price = parseFloat(String(row.price));
  if (isNaN(price) || price <= 0) {
    errors.push({
      row: rowIndex,
      field: "Price",
      message: "Price must be a positive number (e.g., 2500)",
    });
  }
  
  // Discount price validation (optional but must be valid if provided)
  if (row.discount_price && String(row.discount_price).trim() !== "") {
    const discountPrice = parseFloat(String(row.discount_price));
    if (isNaN(discountPrice) || discountPrice < 0) {
      errors.push({
        row: rowIndex,
        field: "Sale Price",
        message: "Sale price must be a non-negative number",
      });
    } else if (!isNaN(price) && discountPrice >= price) {
      errors.push({
        row: rowIndex,
        field: "Sale Price",
        message: "Sale price must be less than regular price",
      });
    }
  }
  
  // Category validation
  const matchedCategory = VALID_CATEGORIES.find(
    (cat) => cat.toLowerCase() === row.category.toLowerCase().trim()
  );
  if (!row.category || !matchedCategory) {
    errors.push({
      row: rowIndex,
      field: "Category",
      message: `Invalid category. Use one of: ${VALID_CATEGORIES.join(", ")}`,
    });
  }
  
  // Stock validation
  const stock = parseInt(String(row.stock_quantity));
  if (isNaN(stock) || stock < 0) {
    errors.push({
      row: rowIndex,
      field: "Stock",
      message: "Stock must be a whole number (0 or more)",
    });
  }
  
  return errors;
};

export const useBulkUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const [validationErrors, setValidationErrors] = useState<BulkUploadError[]>([]);
  const [uploadLogs, setUploadLogs] = useState<BulkUploadLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

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
    rows: ProductCSVRow[],
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
    
    // Validate all rows first (fast validation)
    const allErrors: BulkUploadError[] = [];
    rows.forEach((row, index) => {
      const rowErrors = validateRow(row, index + 2); // +2 for 1-indexed and header row
      allErrors.push(...rowErrors);
    });
    
    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      setIsUploading(false);
      toast({
        title: "Validation Failed",
        description: `Found ${allErrors.length} errors in your file. Fix them and try again.`,
        variant: "destructive",
      });
      return { success: false, successCount: 0, failCount: rows.length };
    }
    
    // Create upload log
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
    
    // Process rows in larger batches for speed (50 per batch for 500+ products)
    const batchSize = 50;
    const batches = Math.ceil(rows.length / batchSize);
    setTotalBatches(batches);
    
    for (let i = 0; i < rows.length; i += batchSize) {
      const batchNumber = Math.floor(i / batchSize) + 1;
      setCurrentBatch(batchNumber);
      
      const batch = rows.slice(i, i + batchSize);
      
      const products = batch.map((row) => ({
        seller_id: user.id,
        title: row.title.trim(),
        description: row.description?.trim() || null,
        price_pkr: parseFloat(String(row.price)),
        discount_price_pkr: row.discount_price && String(row.discount_price).trim() !== ""
          ? parseFloat(String(row.discount_price)) 
          : null,
        category: VALID_CATEGORIES.find(
          (cat) => cat.toLowerCase() === row.category.toLowerCase().trim()
        ) || row.category,
        stock_count: parseInt(String(row.stock_quantity)),
        images: row.image_url?.trim() ? [row.image_url.trim()] : [],
        brand: row.brand?.trim() || null,
        sku: row.sku?.trim() || null,
        status: "pending" as const,
      }));
      
      const { data, error } = await supabase
        .from("products")
        .insert(products)
        .select();
      
      if (error) {
        console.error("Batch insert error:", error);
        failCount += batch.length;
        batch.forEach((_, idx) => {
          uploadErrors.push({
            row: i + idx + 2,
            field: "Database",
            message: error.message,
          });
        });
      } else {
        successCount += data?.length || 0;
        failCount += batch.length - (data?.length || 0);
      }
      
      // Update progress smoothly
      const progress = Math.round(((i + batch.length) / rows.length) * 100);
      setUploadProgress(progress);
    }
    
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

  return {
    isUploading,
    uploadProgress,
    currentBatch,
    totalBatches,
    validationErrors,
    uploadLogs,
    isLoadingLogs,
    processUpload,
    parseCSV,
    generateCSVTemplate,
    generateExcelInstructions,
    fetchUploadLogs,
    setValidationErrors,
  };
};

export const useBulkActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const bulkUpdatePrice = async (
    productIds: string[],
    percentageChange: number
  ): Promise<boolean> => {
    if (!user || productIds.length === 0) return false;
    
    setIsProcessing(true);
    
    try {
      // Fetch current prices
      const { data: products, error: fetchError } = await supabase
        .from("products")
        .select("id, price_pkr, discount_price_pkr")
        .in("id", productIds);
      
      if (fetchError) throw fetchError;
      
      // Update each product
      for (const product of products || []) {
        const multiplier = 1 + percentageChange / 100;
        const newPrice = Math.round(product.price_pkr * multiplier);
        const newDiscountPrice = product.discount_price_pkr 
          ? Math.round(product.discount_price_pkr * multiplier)
          : null;
        
        await supabase
          .from("products")
          .update({ 
            price_pkr: newPrice, 
            discount_price_pkr: newDiscountPrice 
          })
          .eq("id", product.id);
      }
      
      toast({
        title: "Prices Updated",
        description: `Updated prices for ${productIds.length} products by ${percentageChange > 0 ? "+" : ""}${percentageChange}%`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Bulk price update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update prices",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkUpdateStock = async (
    productIds: string[],
    newStock: number
  ): Promise<boolean> => {
    if (!user || productIds.length === 0) return false;
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_count: newStock })
        .in("id", productIds);
      
      if (error) throw error;
      
      toast({
        title: "Stock Updated",
        description: `Updated stock for ${productIds.length} products to ${newStock}`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Bulk stock update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update stock",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const bulkDelete = async (productIds: string[]): Promise<boolean> => {
    if (!user || productIds.length === 0) return false;
    
    setIsProcessing(true);
    
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", productIds);
      
      if (error) throw error;
      
      toast({
        title: "Products Deleted",
        description: `Deleted ${productIds.length} products`,
      });
      
      return true;
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete products",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    bulkUpdatePrice,
    bulkUpdateStock,
    bulkDelete,
  };
};
