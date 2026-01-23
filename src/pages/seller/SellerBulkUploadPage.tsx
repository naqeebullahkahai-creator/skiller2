import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  X,
  History,
  FileText,
  Sparkles,
  FileDown,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  ListChecks,
  FileX2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useBulkUpload, BulkUploadError } from "@/hooks/useBulkUpload";
import { 
  generateFanzonTemplate,
  generateInstructionsGuide,
  generateExcelTemplate,
  parseUploadFile,
  isSupportedFileType,
  getFileTypeLabel,
  validateProductRow,
  ParsedProductRow,
  ValidationError,
  CATEGORY_MAPPINGS,
  resolveCategory
} from "@/utils/bulkUploadTemplate";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SellerBulkUploadPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedProductRow[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [localErrors, setLocalErrors] = useState<ValidationError[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [showCategoryRef, setShowCategoryRef] = useState(false);
  
  const { 
    isUploading, 
    uploadProgress, 
    currentBatch,
    totalBatches,
    validationErrors, 
    uploadLogs,
    isLoadingLogs,
    processUpload,
    fetchUploadLogs,
    setValidationErrors
  } = useBulkUpload();

  useEffect(() => {
    fetchUploadLogs();
  }, []);

  const handleDownloadCSVTemplate = () => {
    const template = generateFanzonTemplate();
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FANZON_Bulk_Upload_Template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcelTemplate = () => {
    const blob = generateExcelTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FANZON_Bulk_Upload_Template.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInstructions = () => {
    const instructions = generateInstructionsGuide();
    const blob = new Blob([instructions], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FANZON_Upload_Instructions.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const processFile = useCallback(async (file: File) => {
    // Check if file type is supported
    if (!isSupportedFileType(file.name)) {
      setLocalErrors([{
        row: 0,
        field: "File",
        message: "Unsupported file format. Please use .csv or .xlsx files.",
      }]);
      return;
    }
    
    setSelectedFile(file);
    setLocalErrors([]);
    setValidationErrors([]);
    
    try {
      const rows = await parseUploadFile(file);
      
      if (rows.length === 0) {
        setLocalErrors([{
          row: 0,
          field: "File",
          message: "No valid data rows found. Make sure your file has data after the header row.",
        }]);
        return;
      }
      
      if (rows.length > 1000) {
        setLocalErrors([{
          row: 0,
          field: "File",
          message: `File contains ${rows.length} products. Maximum allowed is 1,000 per upload. Please split your file.`,
        }]);
        return;
      }
      
      // Validate all rows and collect errors
      const allErrors: ValidationError[] = [];
      rows.forEach((row, index) => {
        const rowErrors = validateProductRow(row, index);
        allErrors.push(...rowErrors);
      });
      
      setLocalErrors(allErrors);
      setParsedRows(rows);
      setPreviewMode(true);
    } catch (error: any) {
      setLocalErrors([{
        row: 0,
        field: "File",
        message: error.message || "Failed to parse the file. Please check the format.",
      }]);
    }
  }, [setValidationErrors]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleUpload = async () => {
    if (!selectedFile || parsedRows.length === 0 || localErrors.length > 0) return;
    
    // Convert parsed rows to the format expected by useBulkUpload
    const uploadRows = parsedRows.map(row => ({
      title: row.title,
      description: row.description || "",
      price: row.price,
      discount_price: row.discount_price || "",
      category: resolveCategory(row.category) || row.category,
      stock_quantity: row.stock_quantity,
      image_url: row.image_url || "",
      brand: row.brand || "",
      sku: row.sku || "",
    }));
    
    const result = await processUpload(uploadRows, selectedFile.name);
    
    if (result.success) {
      setSelectedFile(null);
      setParsedRows([]);
      setPreviewMode(false);
      setLocalErrors([]);
      fetchUploadLogs();
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setPreviewMode(false);
    setLocalErrors([]);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRowErrors = (rowIndex: number): ValidationError[] => {
    return localErrors.filter((e) => e.row === rowIndex + 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
      case "completed_with_errors":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Completed with Errors</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const validRowsCount = parsedRows.length - new Set(localErrors.map(e => e.row)).size;

  return (
    <div className="space-y-6">
      {/* Page Header with FANZON branding */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] shadow-lg">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            Bulk Upload
            <Badge className="bg-[#1e3a5f] text-white border-0 text-xs font-bold px-2 py-0.5">
              FANZON
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Upload up to 1,000 products at once using our official template
          </p>
        </div>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <Upload size={16} />
            Upload Products
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History size={16} />
            Upload History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* How to Use Guide */}
          <Collapsible open={showGuide} onOpenChange={setShowGuide}>
            <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
              <CollapsibleTrigger className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                        <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-left">
                        <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                          📖 How to Use Bulk Upload
                        </CardTitle>
                        <CardDescription className="text-blue-700 dark:text-blue-300">
                          Step-by-step guide for successful uploads
                        </CardDescription>
                      </div>
                    </div>
                    {showGuide ? (
                      <ChevronUp className="h-5 w-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex gap-3 p-3 bg-white dark:bg-background rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-sm">Download Template</p>
                        <p className="text-xs text-muted-foreground">Get the official FANZON CSV template</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-white dark:bg-background rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm">Fill Your Data</p>
                        <p className="text-xs text-muted-foreground">Add products (delete example rows first)</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-white dark:bg-background rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm">Upload & Preview</p>
                        <p className="text-xs text-muted-foreground">Review your data before confirming</p>
                      </div>
                    </div>
                    <div className="flex gap-3 p-3 bg-white dark:bg-background rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm">
                        4
                      </div>
                      <div>
                        <p className="font-medium text-sm">Fix Errors (if any)</p>
                        <p className="text-xs text-muted-foreground">We'll show exactly what to fix</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Pro Tips:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-0.5 text-amber-700 dark:text-amber-300">
                          <li>Price must be numbers only (e.g., <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">2500</code> not <code className="bg-amber-100 dark:bg-amber-900/50 px-1 rounded">Rs. 2500</code>)</li>
                          <li>Use category ID (1-10) or name (e.g., "Electronics")</li>
                          <li>Image URLs must be direct links starting with https://</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Template Download Section */}
          <Card className="border-[#1e3a5f]/30 bg-gradient-to-br from-[#1e3a5f]/10 via-[#1e3a5f]/5 to-transparent overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1e3a5f]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#1e3a5f]/10 rounded-full blur-2xl" />
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1e3a5f] text-white">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Step 1: Download FANZON Template</CardTitle>
                  <CardDescription>
                    Official branded template with instructions and category reference
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button 
                  onClick={handleDownloadExcelTemplate} 
                  className="gap-2 shadow-md bg-[#1e3a5f] hover:bg-[#2d5a87]"
                >
                  <Download size={18} />
                  Download Excel Template
                </Button>
                <Button onClick={handleDownloadCSVTemplate} variant="outline" className="gap-2">
                  <FileSpreadsheet size={18} />
                  Download CSV Template
                </Button>
                <Button onClick={handleDownloadInstructions} variant="ghost" className="gap-2">
                  <FileText size={18} />
                  Instructions
                </Button>
              </div>
              
              {/* Field Legend */}
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
                  <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-2 mb-3">
                    <span className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                    Mandatory Fields (Required) *
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-300 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <code className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-xs">Product_Title*</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <code className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-xs">Category*</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <code className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-xs">Price_PKR*</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      <code className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-xs">Stock_Quantity*</code>
                    </li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl">
                  <p className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    Optional Fields
                  </p>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <code className="bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded text-xs">Discount_Price</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <code className="bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded text-xs">Brand_Name</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <code className="bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded text-xs">Product_Description</code>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      <code className="bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded text-xs">Image_URL, SKU</code>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Category Reference - Collapsible */}
              <Collapsible open={showCategoryRef} onOpenChange={setShowCategoryRef}>
                <div className="p-4 bg-muted/50 rounded-xl border border-border">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <ListChecks className="h-4 w-4 text-muted-foreground" />
                        Category Reference (ID or Name)
                      </p>
                      {showCategoryRef ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {CATEGORY_MAPPINGS.map((cat) => (
                        <div 
                          key={cat.id} 
                          className="p-2 bg-background rounded-lg border border-border text-center"
                        >
                          <span className="text-xs font-bold text-[#1e3a5f] dark:text-blue-400">
                            {cat.id}
                          </span>
                          <p className="text-xs font-medium truncate">{cat.name}</p>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                  {!showCategoryRef && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {CATEGORY_MAPPINGS.slice(0, 5).map((cat) => (
                        <Badge key={cat.id} variant="secondary" className="text-xs px-2 py-0.5">
                          {cat.id}={cat.name}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="text-xs px-2 py-0.5">
                        +{CATEGORY_MAPPINGS.length - 5} more
                      </Badge>
                    </div>
                  )}
                </div>
              </Collapsible>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Step 2: Upload Your File</CardTitle>
                  <CardDescription>
                    Drag & drop your filled CSV file or click to browse
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!previewMode ? (
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative overflow-hidden",
                    isDragging 
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5 scale-[1.01] shadow-lg" 
                      : "border-border hover:border-[#1e3a5f]/50 hover:bg-muted/30"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {isDragging && (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/10 to-transparent pointer-events-none" />
                  )}
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className={cn(
                    "mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-4 transition-all",
                    isDragging ? "bg-[#1e3a5f]/20 scale-110" : "bg-muted"
                  )}>
                    <FileDown className={cn(
                      "h-10 w-10 transition-colors",
                      isDragging ? "text-[#1e3a5f]" : "text-muted-foreground"
                    )} />
                  </div>
                  
                  {/* FANZON branding in upload zone */}
                  <div className="mb-3">
                    <Badge className="bg-[#1e3a5f] text-white border-0 text-xs font-bold px-3 py-1">
                      FANZON BULK UPLOAD
                    </Badge>
                  </div>
                  
                  <p className="text-xl font-semibold mb-1">
                    {isDragging ? "Drop your file here!" : "Drag & Drop your CSV file"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or <span className="text-[#1e3a5f] dark:text-blue-400 font-medium underline">click to browse</span>
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      CSV files only
                    </span>
                    <span>•</span>
                    <span>Max 1,000 products</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info Card */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[#1e3a5f]/10">
                        <FileSpreadsheet className="h-6 w-6 text-[#1e3a5f] dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedFile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {parsedRows.length} products found • {validRowsCount} valid
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCancelUpload}>
                      <X size={18} />
                    </Button>
                  </div>

                  {/* Validation Errors - Enhanced */}
                  {localErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center gap-2">
                        Fix These Errors Before Uploading
                        <Badge variant="destructive" className="text-xs">
                          {localErrors.length} error{localErrors.length > 1 ? 's' : ''}
                        </Badge>
                      </AlertTitle>
                      <AlertDescription>
                        <ScrollArea className="h-48 mt-2">
                          <div className="space-y-2">
                            {localErrors.map((error, idx) => (
                              <div 
                                key={idx} 
                                className="p-2 bg-destructive/10 rounded-lg border border-destructive/20"
                              >
                                <p className="text-sm">
                                  <span className="font-bold text-destructive">
                                    Row {error.row}:
                                  </span>{" "}
                                  <span className="font-medium">{error.field}</span>
                                  <span className="text-muted-foreground"> — </span>
                                  {error.message}
                                </p>
                                {error.value && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Current value: <code className="bg-muted px-1 rounded">{error.value}</code>
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Preview Table with status */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">
                        Data Preview 
                        <span className="text-muted-foreground font-normal"> (first 10 rows)</span>
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <CheckCircle2 size={12} className="text-green-500" />
                          {validRowsCount} valid
                        </Badge>
                        {localErrors.length > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle size={12} />
                            {new Set(localErrors.map(e => e.row)).size} with errors
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-72">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-[#1e3a5f] hover:bg-[#1e3a5f]">
                              <TableHead className="w-16 text-white font-bold">Row</TableHead>
                              <TableHead className="text-white font-bold">Product Title</TableHead>
                              <TableHead className="text-white font-bold">Category</TableHead>
                              <TableHead className="text-white font-bold">Price (PKR)</TableHead>
                              <TableHead className="text-white font-bold">Stock</TableHead>
                              <TableHead className="text-right text-white font-bold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedRows.slice(0, 10).map((row, idx) => {
                              const errors = getRowErrors(idx);
                              return (
                                <TableRow 
                                  key={idx} 
                                  className={errors.length > 0 ? "bg-red-50 dark:bg-red-950/20" : ""}
                                >
                                  <TableCell className="font-mono text-muted-foreground">
                                    {idx + 2}
                                  </TableCell>
                                  <TableCell className="max-w-48 truncate font-medium">
                                    {row.title || <span className="text-muted-foreground italic">Empty</span>}
                                  </TableCell>
                                  <TableCell>
                                    {resolveCategory(row.category) || row.category || (
                                      <span className="text-muted-foreground italic">Empty</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="font-mono">
                                    {row.price || <span className="text-muted-foreground italic">Empty</span>}
                                  </TableCell>
                                  <TableCell className="font-mono">
                                    {row.stock_quantity || <span className="text-muted-foreground italic">Empty</span>}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {errors.length > 0 ? (
                                      <Badge variant="destructive" className="gap-1">
                                        <AlertCircle size={12} />
                                        {errors.length} error{errors.length > 1 ? 's' : ''}
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1">
                                        <CheckCircle2 size={12} />
                                        Valid
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </div>
                    {parsedRows.length > 10 && (
                      <p className="text-sm text-muted-foreground mt-2 text-center">
                        ...and {parsedRows.length - 10} more rows
                      </p>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-3 p-4 bg-[#1e3a5f]/5 rounded-lg border border-[#1e3a5f]/20">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading products...
                        </span>
                        <span className="font-mono">{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                      {totalBatches > 0 && (
                        <p className="text-xs text-muted-foreground text-center">
                          Processing batch {currentBatch} of {totalBatches}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleCancelUpload} variant="outline" disabled={isUploading}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={isUploading || localErrors.length > 0}
                      className="gap-2 flex-1 sm:flex-none bg-[#1e3a5f] hover:bg-[#2d5a87]"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload {validRowsCount} Products
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {localErrors.length > 0 && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
                      ⚠️ Fix the {localErrors.length} error{localErrors.length > 1 ? 's' : ''} above to enable upload
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Upload History
              </CardTitle>
              <CardDescription>
                View your past bulk upload activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : uploadLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upload history yet</p>
                  <p className="text-sm">Upload your first batch of products to get started</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>File Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Success</TableHead>
                        <TableHead className="text-center">Failed</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium max-w-48 truncate">
                            {log.file_name}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="text-center font-mono">{log.total_rows}</TableCell>
                          <TableCell className="text-center text-green-600 dark:text-green-400 font-mono">
                            {log.successful_rows}
                          </TableCell>
                          <TableCell className="text-center text-destructive font-mono">
                            {log.failed_rows}
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerBulkUploadPage;
