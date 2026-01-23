import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  Upload,
  FileImage,
  Receipt,
  Eye,
  X,
} from "lucide-react";
import { useAdminFinance } from "@/hooks/useAdminFinance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { formatPKR } from "@/hooks/useSellerWallet";
import { SellerProfile } from "@/hooks/useSellerKyc";
import { toast } from "sonner";
import { format } from "date-fns";

const AdminPayoutManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { payoutRequests, payoutsLoading, processPayout, rejectPayout, pendingPayoutsCount, totalPendingAmount } = useAdminFinance();
  const [selectedPayout, setSelectedPayout] = useState<string | null>(null);
  const [transactionRef, setTransactionRef] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const uploadReceipt = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `payout-receipts/${selectedPayout}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from('seller-docs')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      toast.error('Failed to upload receipt');
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('seller-docs')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleApprove = async () => {
    if (!selectedPayout || !transactionRef.trim() || !user?.id) return;

    setIsUploadingReceipt(true);
    
    try {
      let receiptUrl: string | null = null;
      
      // Upload receipt if provided
      if (receiptFile) {
        receiptUrl = await uploadReceipt(receiptFile);
      }

      // Process the payout
      await processPayout.mutateAsync({
        payoutId: selectedPayout,
        transactionReference: transactionRef,
        adminId: user.id,
      });

      // Update with receipt URL if uploaded
      if (receiptUrl) {
        await supabase
          .from('payout_requests')
          .update({ receipt_url: receiptUrl })
          .eq('id', selectedPayout);
        
        queryClient.invalidateQueries({ queryKey: ['admin-payout-requests'] });
      }

      toast.success('Payout marked as paid successfully');
      setShowApproveDialog(false);
      setSelectedPayout(null);
      setTransactionRef("");
      setReceiptFile(null);
      setReceiptPreview(null);
    } catch (error) {
      console.error('Approve error:', error);
    } finally {
      setIsUploadingReceipt(false);
    }
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
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Paid
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
          <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const filteredPayouts = payoutRequests?.filter(p => 
    statusFilter === "all" || p.status === statusFilter
  );

  // Calculate completed payouts stats
  const completedPayouts = payoutRequests?.filter(p => p.status === 'completed') || [];
  const totalPaidOut = completedPayouts.reduce((sum, p) => sum + Number(p.amount), 0);

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
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingPayoutsCount}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
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
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Paid Out</p>
                <p className="text-2xl font-bold text-green-600">{formatPKR(totalPaidOut)}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
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
              <div className="p-3 rounded-full bg-muted">
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payout Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <CardTitle>Payout Requests</CardTitle>
              <CardDescription>Process seller withdrawal requests</CardDescription>
            </div>
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
                  <TableRow className="bg-muted/50">
                    <TableHead>Date</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Receipt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => {
                    const seller = getSellerInfo(payout.seller_id);
                    const payoutWithReceipt = payout as typeof payout & { receipt_url?: string };

                    return (
                      <TableRow key={payout.id}>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(payout.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{seller?.shop_name || "Unknown"}</p>
                            <p className="text-sm text-muted-foreground">
                              {seller?.legal_name}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-lg">
                          {formatPKR(payout.amount)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-0.5">
                            <p className="font-medium">{payout.bank_name}</p>
                            <p className="text-muted-foreground">{payout.account_title}</p>
                            <p className="font-mono text-xs bg-muted px-1 py-0.5 rounded inline-block">
                              {payout.iban}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell>
                          {payout.status === 'completed' && payoutWithReceipt.receipt_url ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => {
                                setViewingReceiptUrl(payoutWithReceipt.receipt_url || null);
                                setShowReceiptDialog(true);
                              }}
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                          ) : payout.status === 'completed' ? (
                            <span className="text-xs text-muted-foreground">No receipt</span>
                          ) : payout.admin_notes ? (
                            <span className="text-xs text-destructive">{payout.admin_notes}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
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
                                Mark as Paid
                              </Button>
                            </div>
                          )}
                          {payout.status === 'completed' && payout.transaction_reference && (
                            <p className="text-xs text-muted-foreground">
                              Ref: {payout.transaction_reference}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payout requests found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve & Mark as Paid Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={(open) => {
        setShowApproveDialog(open);
        if (!open) {
          setReceiptFile(null);
          setReceiptPreview(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-500" />
              Mark as Paid
            </DialogTitle>
            <DialogDescription>
              Enter payment details and optionally upload a receipt screenshot for the seller.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Transaction Reference */}
            <div className="space-y-2">
              <Label htmlFor="txn-ref">Transaction Reference *</Label>
              <Input
                id="txn-ref"
                placeholder="e.g., TXN-123456789 or Bank Ref"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label>Payment Receipt (Optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {receiptPreview ? (
                <div className="relative border rounded-lg overflow-hidden">
                  <img 
                    src={receiptPreview} 
                    alt="Receipt preview" 
                    className="w-full h-40 object-cover"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <FileImage className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload receipt screenshot
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
              <p className="text-sm text-muted-foreground">
                This will deduct the amount from the seller's wallet and update their "Total Withdrawn" amount.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button
              className="bg-green-500 hover:bg-green-600 gap-2"
              onClick={handleApprove}
              disabled={processPayout.isPending || isUploadingReceipt || !transactionRef.trim()}
            >
              {(processPayout.isPending || isUploadingReceipt) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Reject Payout Request
            </DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this payout request. The seller will see this message.
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
              Reject Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Receipt Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Payment Receipt
            </DialogTitle>
          </DialogHeader>
          {viewingReceiptUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img 
                src={viewingReceiptUrl} 
                alt="Payment receipt" 
                className="w-full object-contain max-h-[60vh]"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReceiptDialog(false)}>
              Close
            </Button>
            {viewingReceiptUrl && (
              <Button asChild>
                <a href={viewingReceiptUrl} target="_blank" rel="noopener noreferrer">
                  Open Full Size
                </a>
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayoutManagement;
