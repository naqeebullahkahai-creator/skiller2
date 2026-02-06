import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Check,
  X,
  Search,
} from "lucide-react";
import { useAdminDepositRequests, DepositRequest } from "@/hooks/useDeposits";
import { formatPKR } from "@/hooks/useSellerWallet";

interface AdminDepositApprovalsProps {
  requesterType: 'customer' | 'seller';
}

const AdminDepositApprovals = ({ requesterType }: AdminDepositApprovalsProps) => {
  const { depositRequests, isLoading, approveDeposit, rejectDeposit, pendingCount } = useAdminDepositRequests(requesterType);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<DepositRequest | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const filteredRequests = depositRequests?.filter(request => {
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesSearch = !searchQuery || 
      request.transaction_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  const handleApprove = async (request: DepositRequest) => {
    await approveDeposit.mutateAsync({
      depositId: request.id,
      adminNotes: adminNotes || undefined,
    });
    setSelectedRequest(null);
    setAdminNotes('');
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason) return;
    
    await rejectDeposit.mutateAsync({
      depositId: selectedRequest.id,
      reason: rejectReason,
    });
    
    setShowRejectDialog(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-primary text-primary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {requesterType === 'seller' ? 'Seller' : 'Customer'} Deposit Approvals
          </h1>
          <p className="text-muted-foreground">
            Review and approve manual deposit requests
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge className="text-lg px-4 py-2 bg-primary">
            {pendingCount} Pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by reference or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Requests Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No deposit requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {request.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {request.payment_methods?.method_name || 'Unknown'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPKR(request.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.transaction_reference || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleApprove(request)}
                              disabled={approveDeposit.isPending}
                              className="text-green-500 hover:text-green-600 hover:bg-green-50"
                            >
                              {approveDeposit.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectDialog(true);
                              }}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={!!selectedRequest && !showRejectDialog} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deposit Request Details</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Request ID</span>
                  <p className="font-mono text-xs mt-1">{selectedRequest.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">User ID</span>
                  <p className="font-mono text-xs mt-1">{selectedRequest.user_id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Amount</span>
                  <p className="font-bold text-lg mt-1">{formatPKR(selectedRequest.amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="mt-1">{getStatusBadge(selectedRequest.status)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payment Method</span>
                  <p className="mt-1">{selectedRequest.payment_methods?.method_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Reference</span>
                  <p className="mt-1">{selectedRequest.transaction_reference || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Submitted</span>
                  <p className="mt-1">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
                {selectedRequest.processed_at && (
                  <div>
                    <span className="text-muted-foreground">Processed</span>
                    <p className="mt-1">{new Date(selectedRequest.processed_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Payment Screenshot</span>
                <img
                  src={selectedRequest.screenshot_url}
                  alt="Payment screenshot"
                  className="mt-2 w-full max-h-64 object-contain border rounded-lg"
                />
              </div>

              {selectedRequest.admin_notes && (
                <div>
                  <span className="text-sm text-muted-foreground">Admin Notes</span>
                  <p className="mt-1 p-3 bg-muted rounded">{selectedRequest.admin_notes}</p>
                </div>
              )}

              {selectedRequest.status === 'pending' && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Add Notes (Optional)</span>
                  <Textarea
                    placeholder="Add notes for this approval..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectDialog(true);
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => selectedRequest && handleApprove(selectedRequest)}
                  disabled={approveDeposit.isPending}
                  className="bg-green-500 hover:bg-green-600"
                >
                  {approveDeposit.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Approve & Credit Wallet
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Deposit Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this deposit request. The user will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason || rejectDeposit.isPending}
            >
              {rejectDeposit.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDepositApprovals;
