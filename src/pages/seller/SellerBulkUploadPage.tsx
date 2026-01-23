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
  FileDown
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
  useBulkUpload, 
  generateCSVTemplate, 
  generateExcelInstructions,
  parseCSV,
  ProductCSVRow,
  BulkUploadError 
} from "@/hooks/useBulkUpload";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const SellerBulkUploadPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ProductCSVRow[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
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

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FANZON_Bulk_Upload_Template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInstructions = () => {
    const instructions = generateExcelInstructions();
    const blob = new Blob([instructions], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "FANZON_Upload_Instructions.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      setValidationErrors([{
        row: 0,
        field: "File",
        message: "Please upload a CSV file only"
      }]);
      return;
    }
    
    setSelectedFile(file);
    setValidationErrors([]);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rows = parseCSV(content);
      
      if (rows.length === 0) {
        setValidationErrors([{
          row: 0,
          field: "File",
          message: "No valid data rows found in the file"
        }]);
        return;
      }
      
      if (rows.length > 1000) {
        setValidationErrors([{
          row: 0,
          field: "File",
          message: "Maximum 1000 products per upload. Please split your file."
        }]);
        return;
      }
      
      setParsedRows(rows);
      setPreviewMode(true);
    };
    reader.readAsText(file);
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
    if (!selectedFile || parsedRows.length === 0) return;
    
    const result = await processUpload(parsedRows, selectedFile.name);
    
    if (result.success) {
      setSelectedFile(null);
      setParsedRows([]);
      setPreviewMode(false);
      fetchUploadLogs();
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setPreviewMode(false);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getRowErrors = (rowIndex: number): BulkUploadError[] => {
    return validationErrors.filter((e) => e.row === rowIndex + 2);
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bulk Upload</h1>
          <p className="text-muted-foreground">
            Upload up to 1,000 products at once using our FANZON template
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
          {/* Template Download Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                Step 1: Download FANZON Template
              </CardTitle>
              <CardDescription>
                Use our branded template for hassle-free uploads. Includes examples and field descriptions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button onClick={handleDownloadTemplate} className="gap-2">
                  <Download size={18} />
                  Download CSV Template
                </Button>
                <Button onClick={handleDownloadInstructions} variant="outline" className="gap-2">
                  <FileText size={18} />
                  Download Instructions
                </Button>
              </div>
              
              {/* Field Legend */}
              <div className="grid sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="font-semibold text-destructive flex items-center gap-2 mb-2">
                    <span className="h-3 w-3 rounded-full bg-destructive" />
                    Mandatory Fields
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Product Name*</li>
                    <li>• Price (PKR)*</li>
                    <li>• Category*</li>
                    <li>• Stock*</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-2">
                    <span className="h-3 w-3 rounded-full bg-green-500" />
                    Optional Fields
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Description</li>
                    <li>• Sale Price (PKR)</li>
                    <li>• Image URL, Brand, SKU</li>
                  </ul>
                </div>
              </div>

              {/* Valid Categories */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Valid Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {["Electronics", "Fashion", "Home & Garden", "Sports", "Beauty", "Books", "Toys", "Automotive", "Health", "Groceries"].map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 2: Upload Your File
              </CardTitle>
              <CardDescription>
                Drag & drop your filled CSV file or click to browse
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!previewMode ? (
                <div 
                  className={cn(
                    "border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer",
                    isDragging 
                      ? "border-primary bg-primary/5 scale-[1.02]" 
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <FileDown className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">
                    {isDragging ? "Drop your file here!" : "Drag & Drop your CSV file"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or <span className="text-primary font-medium">click to browse</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    CSV files only • Maximum 1,000 products per upload
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Info Card */}
                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileSpreadsheet className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{selectedFile?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {parsedRows.length} products ready to upload
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleCancelUpload}>
                      <X size={18} />
                    </Button>
                  </div>

                  {/* Validation Errors */}
                  {validationErrors.length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Fix These Errors Before Uploading</AlertTitle>
                      <AlertDescription>
                        <ScrollArea className="h-48 mt-2">
                          <div className="space-y-1">
                            {validationErrors.map((error, idx) => (
                              <p key={idx} className="text-sm font-mono">
                                <span className="font-bold">Row {error.row}:</span>{" "}
                                <span className="text-destructive">{error.field}</span> — {error.message}
                              </p>
                            ))}
                          </div>
                        </ScrollArea>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Preview Table */}
                  <div>
                    <h4 className="font-medium mb-2">Preview (first 10 rows)</h4>
                    <div className="border rounded-lg overflow-hidden">
                      <ScrollArea className="h-64">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="w-16">Row</TableHead>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedRows.slice(0, 10).map((row, idx) => {
                              const errors = getRowErrors(idx);
                              return (
                                <TableRow key={idx} className={errors.length > 0 ? "bg-destructive/10" : ""}>
                                  <TableCell className="font-mono text-muted-foreground">{idx + 2}</TableCell>
                                  <TableCell className="max-w-48 truncate font-medium">{row.title}</TableCell>
                                  <TableCell>Rs. {row.price}</TableCell>
                                  <TableCell>{row.category}</TableCell>
                                  <TableCell>{row.stock_quantity}</TableCell>
                                  <TableCell className="text-right">
                                    {errors.length > 0 ? (
                                      <Badge variant="destructive" className="gap-1">
                                        <AlertCircle size={12} />
                                        {errors.length} error(s)
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
                      <p className="text-sm text-muted-foreground mt-2">
                        ...and {parsedRows.length - 10} more rows
                      </p>
                    )}
                  </div>

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
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
                      disabled={isUploading || validationErrors.length > 0}
                      className="gap-2 flex-1 sm:flex-none"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
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
                      <TableRow>
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
