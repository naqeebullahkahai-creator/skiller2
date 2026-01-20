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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Wallet,
  TrendingUp,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { useAdminFinance } from "@/hooks/useAdminFinance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/hooks/useSellerWallet";
import { SellerProfile } from "@/hooks/useSellerKyc";

const AdminPayoutManagement = () => {
  const { user } = useAuth();
  const { payoutRequests, payoutsLoading, processPayout, rejectPayout, pendingPayoutsCount, totalPendingAmount } = useAdminFinance();
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch seller profiles for bank details
  const { data: sellerProfiles } = useQuery({
    queryKey: ['admin-seller-profiles-for-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seller_profiles')
        .select('user_id, shop_name, legal_name, bank_name, account_title, iban');
      if (error) throw error;
      return data as Pick<SellerProfile, 'user_id' | 'shop_name' | 'legal_name' | 'bank_name' | 'account_title' | 'iban'>[];
    },
  });

  const getSellerInfo = (sellerId: string) => {
    return sellerProfiles?.find(s => s.user_id === sellerId);
  };

  const handleApprove = async () => {
    if (!selectedPayout || !transactionRef.trim() || !user?.id) return;

    await processPayout.mutateAsync({
      payoutId: selectedPayout,
      transactionReference: transactionRef,
      adminId: user.id,
    });

    setShowApproveDialog(false);
    setSelectedPayout(null);
    setTransactionRef("");
  };

  const handleReject = async () => {
    if (!selectedPayout || !rejectReason.trim()) return;

    await rejectPayout.mutateAsync({
      payoutId: selectedPayout,
      reason: rejectReason,
    });

    setShowRejectDialog(false);
    setSelectedPayout(null);
    setRejectReason("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
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

  const filteredPayouts = payoutRequests?.filter(p => 
    statusFilter === "all" || p.status === statusFilter
  );

  if (payoutsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payout Management</h1>
        <p className="text-muted-foreground">Review and process seller payout requests</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-primary">{pendingPayoutsCount}</p>
              </div>
              <Clock className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold">{formatPKR(totalPendingAmount)}</p>
              </div>
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{payoutRequests?.length || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle>Payout Requests</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPayouts && filteredPayouts.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => {
                    const seller = getSellerInfo(payout.seller_id);

                    return (
                      <TableRow key={payout.id}>
                        <TableCell>
                          {new Date(payout.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{seller?.shop_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">
                              {seller?.legal_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPKR(payout.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{payout.bank_name}</p>
                            <p className="text-muted-foreground">{payout.account_title}</p>
                            <p className="font-mono text-xs">{payout.iban}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.transaction_reference || (
                            payout.admin_notes ? (
                              <span className="text-destructive text-sm">{payout.admin_notes}</span>
                            ) : "-"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {payout.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedPayout(payout.id);
                                  setShowRejectDialog(true);
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => {
                                  setSelectedPayout(payout.id);
                                  setShowApproveDialog(true);
                                }}
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No payout requests found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Mark as Paid</DialogTitle>
            <DialogDescription>
              Enter the bank transfer reference/transaction ID to confirm payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Transaction Reference</label>
              <Input
                placeholder="e.g., TXN-123456789"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                This will deduct the amount from the seller's wallet balance and mark the request as completed.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600"
              onClick={handleApprove}
              disabled={processPayout.isPending || !transactionRef.trim()}
            >
              {processPayout.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Payout Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payout request.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectPayout.isPending || !rejectReason.trim()}
            >
              {rejectPayout.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayoutManagement;
