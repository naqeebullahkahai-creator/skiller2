import { useState, useEffect } from "react";
import { 
  FileSpreadsheet, 
  Loader2, 
  Search, 
  AlertTriangle,
  CheckCircle2,
  User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BulkUploadLog {
  id: string;
  seller_id: string;
  file_name: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  error_log: any[];
  status: string;
  created_at: string;
  completed_at: string | null;
  seller_name?: string;
  seller_email?: string;
}

const AdminBulkUploadLogs = () => {
  const [logs, setLogs] = useState<BulkUploadLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<BulkUploadLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      
      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from("bulk_upload_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (logsError) throw logsError;
      
      // Fetch seller profiles
      const sellerIds = [...new Set(logsData?.map(log => log.seller_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", sellerIds);
      
      // Map profiles to logs
      const logsWithProfiles = (logsData || []).map(log => {
        const profile = profiles?.find(p => p.id === log.seller_id);
        return {
          ...log,
          error_log: Array.isArray(log.error_log) ? log.error_log : [],
          seller_name: profile?.full_name || "Unknown",
          seller_email: profile?.email || ""
        };
      });
      
      setLogs(logsWithProfiles);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.seller_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.seller_email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-800 gap-1">
            <CheckCircle2 size={12} />
            Completed
          </Badge>
        );
      case "completed_with_errors":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 gap-1">
            <AlertTriangle size={12} />
            With Errors
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-blue-100 text-blue-800 gap-1">
            <Loader2 size={12} className="animate-spin" />
            Processing
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Calculate stats
  const stats = {
    total: logs.length,
    today: logs.filter(log => 
      new Date(log.created_at).toDateString() === new Date().toDateString()
    ).length,
    totalProducts: logs.reduce((sum, log) => sum + log.successful_rows, 0),
    withErrors: logs.filter(log => log.failed_rows > 0).length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Upload Monitoring</h1>
        <p className="text-muted-foreground">
          Monitor all seller bulk upload activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Uploads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Uploads</p>
                <p className="text-2xl font-bold">{stats.today}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Products Uploaded</p>
                <p className="text-2xl font-bold">{stats.totalProducts}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-primary opacity-80" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Uploads with Errors</p>
                <p className="text-2xl font-bold">{stats.withErrors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by file name or seller..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="completed_with_errors">With Errors</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Logs ({filteredLogs.length})</CardTitle>
          <CardDescription>
            Recent bulk upload activities from all sellers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upload logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>File</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Rows</TableHead>
                    <TableHead>Success</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User size={14} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{log.seller_name}</p>
                            <p className="text-xs text-muted-foreground">{log.seller_email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm max-w-32 truncate">
                        {log.file_name}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell>{log.total_rows}</TableCell>
                      <TableCell className="text-green-600 font-medium">
                        {log.successful_rows}
                      </TableCell>
                      <TableCell className="text-destructive font-medium">
                        {log.failed_rows}
                      </TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {log.error_log.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            View Errors
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Error Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">File</p>
                <p className="font-medium">{selectedLog?.file_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seller</p>
                <p className="font-medium">{selectedLog?.seller_name}</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Errors ({selectedLog?.error_log.length})</p>
              <ScrollArea className="h-64 border rounded-lg">
                <div className="p-4 space-y-2">
                  {selectedLog?.error_log.map((error: any, idx: number) => (
                    <div key={idx} className="p-3 bg-destructive/10 rounded-lg text-sm">
                      <span className="font-medium">Row {error.row}:</span>{" "}
                      <span className="text-muted-foreground">{error.field}</span> - {error.message}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBulkUploadLogs;
