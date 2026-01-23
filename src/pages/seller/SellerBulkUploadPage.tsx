import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  X,
  History
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
  parseCSV,
  ProductCSVRow,
  BulkUploadError 
} from "@/hooks/useBulkUpload";
import { format } from "date-fns";

const SellerBulkUploadPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ProductCSVRow[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  const { 
    isUploading, 
    uploadProgress, 
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
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_upload_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setValidationErrors([]);
    
    // Read and parse file
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const rows = parseCSV(content);
      setParsedRows(rows);
      setPreviewMode(true);
    };
    reader.readAsText(file);
  };

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
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "completed_with_errors":
        return <Badge className="bg-yellow-100 text-yellow-800">Completed with Errors</Badge>;
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Upload</h1>
        <p className="text-muted-foreground">
          Upload multiple products at once using a CSV file
        </p>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upload">Upload Products</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Template Download */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Step 1: Download Template
              </CardTitle>
              <CardDescription>
                Download our CSV template to ensure your data is in the correct format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Button onClick={handleDownloadTemplate} variant="outline" className="gap-2">
                  <Download size={18} />
                  Download CSV Template
                </Button>
                <div className="text-sm text-muted-foreground">
                  <p>Template includes columns:</p>
                  <p className="font-mono text-xs mt-1">
                    title, description, price, discount_price, category, stock_quantity, image_url, brand, sku
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Valid Categories:</p>
                <div className="flex flex-wrap gap-2">
                  {["Electronics", "Fashion", "Home & Garden", "Sports", "Beauty", "Books", "Toys", "Automotive", "Health", "Groceries"].map((cat) => (
                    <Badge key={cat} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Step 2: Upload Your File
              </CardTitle>
              <CardDescription>
                Upload your filled CSV file for validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!previewMode ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground mt-1">CSV files only (max 1000 rows)</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{selectedFile?.name}</p>
                        <p className="text-sm text-muted-foreground">{parsedRows.length} products found</p>
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
                      <AlertTitle>Validation Errors Found</AlertTitle>
                      <AlertDescription>
                        <ScrollArea className="h-48 mt-2">
                          <div className="space-y-1">
                            {validationErrors.map((error, idx) => (
                              <p key={idx} className="text-sm">
                                <span className="font-medium">Row {error.row}:</span> {error.field} - {error.message}
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
                            <TableRow>
                              <TableHead>Row</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {parsedRows.slice(0, 10).map((row, idx) => {
                              const errors = getRowErrors(idx);
                              return (
                                <TableRow key={idx} className={errors.length > 0 ? "bg-destructive/10" : ""}>
                                  <TableCell>{idx + 2}</TableCell>
                                  <TableCell className="max-w-48 truncate">{row.title}</TableCell>
                                  <TableCell>Rs. {row.price}</TableCell>
                                  <TableCell>{row.category}</TableCell>
                                  <TableCell>{row.stock_quantity}</TableCell>
                                  <TableCell>
                                    {errors.length > 0 ? (
                                      <Badge variant="destructive" className="gap-1">
                                        <AlertCircle size={12} />
                                        {errors.length} error(s)
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800 gap-1">
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading products...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button onClick={handleCancelUpload} variant="outline" disabled={isUploading}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={isUploading || validationErrors.length > 0}
                      className="gap-2"
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
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Rows</TableHead>
                      <TableHead>Success</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.file_name}</TableCell>
                        <TableCell>{format(new Date(log.created_at), "MMM d, yyyy HH:mm")}</TableCell>
                        <TableCell>{log.total_rows}</TableCell>
                        <TableCell className="text-green-600">{log.successful_rows}</TableCell>
                        <TableCell className="text-destructive">{log.failed_rows}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerBulkUploadPage;
