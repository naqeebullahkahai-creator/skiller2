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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Info,
  FileX2,
  Package
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
import { useBulkUpload } from "@/hooks/useBulkUpload";
import { 
  generateFanzonTemplate,
  generateInstructionsGuide,
  generateExcelTemplate,
  parseUploadFile,
  isSupportedFileType,
  validateAllRows,
  ParsedProductRow,
  ValidationError,
  CATEGORY_MAPPINGS,
  resolveCategory,
  TEMPLATE_FIELDS,
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
    progressDetails,
    processUpload,
    fetchUploadLogs,
    setValidationErrors,
    resetProgress,
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
    resetProgress();
    
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
      
      // Validate all rows with row-specific errors
      const allErrors = validateAllRows(rows);
      
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
  }, [setValidationErrors, resetProgress]);

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
    
    const result = await processUpload(parsedRows, selectedFile.name);
    
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
    resetProgress();
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
  const errorRows = new Set(localErrors.map(e => e.row));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a87] shadow-lg">
          <Package className="h-6 w-6 text-white" />
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
          {/* Instructions Guide */}
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
                <CardContent className="pt-0 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {["Download Template", "Fill Your Data", "Upload & Preview", "Fix Errors"].map((step, i) => (
                      <div key={i} className="flex gap-3 p-3 bg-white dark:bg-background rounded-lg border border-blue-100 dark:border-blue-900/30">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center font-bold text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{step}</p>
                          <p className="text-xs text-muted-foreground">
                            {i === 0 && "Get the official FANZON template"}
                            {i === 1 && "Add products with required fields"}
                            {i === 2 && "Review your data before confirming"}
                            {i === 3 && "We show exactly what to fix"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Template Download Section */}
          <Card className="border-[#1e3a5f]/30 bg-gradient-to-br from-[#1e3a5f]/10 via-[#1e3a5f]/5 to-transparent overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#1e3a5f]/10 rounded-full blur-3xl" />
            
            <CardHeader className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#1e3a5f] text-white">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">Step 1: Download FANZON Template</CardTitle>
                  <CardDescription>
                    Clean template with field definitions and category reference
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
                    Required Fields
                  </p>
                  <ul className="text-sm text-red-800 dark:text-red-300 space-y-1.5">
                    {TEMPLATE_FIELDS.filter(f => f.required).map(field => (
                      <li key={field.name} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                        <code className="bg-red-100 dark:bg-red-900/50 px-1.5 py-0.5 rounded text-xs">{field.name}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50 rounded-xl">
                  <p className="font-semibold text-green-700 dark:text-green-400 flex items-center gap-2 mb-3">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    Optional Fields
                  </p>
                  <ul className="text-sm text-green-800 dark:text-green-300 space-y-1.5">
                    {TEMPLATE_FIELDS.filter(f => !f.required).map(field => (
                      <li key={field.name} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <code className="bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded text-xs">{field.name}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Category Reference */}
              <Collapsible open={showCategoryRef} onOpenChange={setShowCategoryRef}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between mt-2">
                    <span className="flex items-center gap-2">
                      <Info size={16} />
                      Category ID Reference
                    </span>
                    {showCategoryRef ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">ID</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead className="hidden sm:table-cell">Examples</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {CATEGORY_MAPPINGS.map(cat => (
                          <TableRow key={cat.id}>
                            <TableCell className="font-mono font-bold">{cat.id}</TableCell>
                            <TableCell>{cat.name}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{cat.examples}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Upload Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Step 2: Upload Your File</CardTitle>
                  <CardDescription>
                    Drag and drop or click to select your filled template
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!previewMode ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                    isDragging 
                      ? "border-primary bg-primary/5 scale-[1.02]" 
                      : "border-muted-foreground/25 hover:border-primary hover:bg-primary/5"
                  )}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                      "p-4 rounded-full transition-colors",
                      isDragging ? "bg-primary/20" : "bg-muted"
                    )}>
                      <Upload className={cn(
                        "h-8 w-8 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div>
                      <p className="font-medium text-lg">
                        {isDragging ? "Drop your file here" : "Drag & drop your file here"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse • Supports .csv and .xlsx
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {parsedRows.length} products found
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCancelUpload}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Real-time Progress Bar */}
                  {isUploading && progressDetails && (
                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="font-medium text-blue-900 dark:text-blue-100">
                            {progressDetails.message}
                          </span>
                        </div>
                        <span className="text-sm font-mono text-blue-700 dark:text-blue-300">
                          {progressDetails.percentage}%
                        </span>
                      </div>
                      <Progress value={progressDetails.percentage} className="h-3" />
                      {progressDetails.stage === "uploading" && (
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Processing {progressDetails.currentRow} of {progressDetails.totalRows} products
                          {progressDetails.totalBatches > 1 && ` (Batch ${progressDetails.currentBatch}/${progressDetails.totalBatches})`}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Validation Summary */}
                  {localErrors.length > 0 ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Validation Errors Found</AlertTitle>
                      <AlertDescription>
                        {localErrors.length} errors in {errorRows.size} rows. Fix these issues and re-upload.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800 dark:text-green-200">Ready to Upload</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        All {parsedRows.length} products passed validation.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error List with Row-Specific Messages */}
                  {localErrors.length > 0 && (
                    <Card className="border-destructive/50">
                      <CardHeader className="py-3">
                        <CardTitle className="text-base flex items-center gap-2 text-destructive">
                          <FileX2 className="h-4 w-4" />
                          Error Details ({localErrors.length} errors)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <ScrollArea className="h-[200px]">
                          <div className="space-y-2">
                            {localErrors.slice(0, 50).map((error, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-start gap-3 p-2 bg-destructive/5 rounded text-sm"
                              >
                                <Badge variant="outline" className="shrink-0 font-mono">
                                  Row {error.row}
                                </Badge>
                                <div>
                                  <span className="font-medium">{error.field}:</span>{" "}
                                  <span className="text-muted-foreground">{error.message}</span>
                                </div>
                              </div>
                            ))}
                            {localErrors.length > 50 && (
                              <p className="text-sm text-muted-foreground text-center py-2">
                                And {localErrors.length - 50} more errors...
                              </p>
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}

                  {/* Preview Table */}
                  <Card>
                    <CardHeader className="py-3">
                      <CardTitle className="text-base">
                        Data Preview (First 10 Rows)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="w-full">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">#</TableHead>
                              <TableHead>Product_Name</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Category_ID</TableHead>
                              <TableHead className="text-right">Base_Price</TableHead>
                              <TableHead className="text-right">Stock</TableHead>
                              <TableHead className="w-[60px]">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedRows.slice(0, 10).map((row, idx) => {
                              const rowErrors = getRowErrors(idx);
                              const hasError = rowErrors.length > 0;
                              return (
                                <TableRow 
                                  key={idx}
                                  className={hasError ? "bg-destructive/5" : ""}
                                >
                                  <TableCell className="font-mono text-xs">{idx + 2}</TableCell>
                                  <TableCell className="max-w-[200px] truncate">{row.title}</TableCell>
                                  <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                                  <TableCell>{row.category}</TableCell>
                                  <TableCell className="text-right font-mono">
                                    {row.price ? `Rs. ${parseFloat(row.price).toLocaleString()}` : "-"}
                                  </TableCell>
                                  <TableCell className="text-right">{row.stock_quantity}</TableCell>
                                  <TableCell>
                                    {hasError ? (
                                      <AlertCircle className="h-4 w-4 text-destructive" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      {parsedRows.length > 10 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          And {parsedRows.length - 10} more products...
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={handleCancelUpload} disabled={isUploading}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={localErrors.length > 0 || isUploading}
                      className="gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload {parsedRows.length} Products
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Upload History
              </CardTitle>
              <CardDescription>
                View your previous bulk upload attempts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : uploadLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No upload history yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Success</TableHead>
                        <TableHead className="text-right">Failed</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {log.file_name}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">{log.total_rows}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            {log.successful_rows}
                          </TableCell>
                          <TableCell className="text-right text-destructive font-medium">
                            {log.failed_rows}
                          </TableCell>
                          <TableCell>{getStatusBadge(log.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerBulkUploadPage;
