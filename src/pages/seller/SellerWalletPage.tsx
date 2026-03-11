import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Wallet, TrendingUp, ArrowDownToLine, Clock, Loader2, Send,
  AlertCircle, CheckCircle2, XCircle, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSellerWallet, formatPKR } from "@/hooks/useSellerWallet";
import { useSellerKyc } from "@/hooks/useSellerKyc";
import DepositFundsSection from "@/components/wallet/DepositFundsSection";
import SellerSubscriptionCard from "@/components/seller/SellerSubscriptionCard";
import SellerSavedWallets from "@/components/seller/SellerSavedWallets";
import { useSellerSavedWallets } from "@/hooks/useSellerSavedWallets";
import { useWithdrawalMethods } from "@/hooks/useWithdrawalMethods";

const SellerWalletPage = () => {
  const { wallet, transactions, payoutRequests, isLoading, requestPayout, canRequestPayout, hasPendingPayout } = useSellerWallet();
  const { sellerProfile, isVerified } = useSellerKyc();
  const { savedWallets } = useSellerSavedWallets();
  const { activeMethods } = useWithdrawalMethods();
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [selectedWalletId, setSelectedWalletId] = useState("");

  const selectedSavedWallet = savedWallets.find(w => w.id === selectedWalletId);
  const selectedMethodName = selectedSavedWallet ? activeMethods.find(m => m.id === selectedSavedWallet.method_id)?.name : "";

  const handleRequestPayout = async () => {
    if (!payoutAmount || !selectedSavedWallet) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 1000) return;

    // Use saved wallet details for the payout request
    const fieldValues = selectedSavedWallet.field_values;
    const bankName = selectedMethodName || "Saved Wallet";
    const accountTitle = fieldValues[Object.keys(fieldValues)[0]] || selectedSavedWallet.label;
    const iban = fieldValues[Object.keys(fieldValues)[1]] || "-";

    await requestPayout.mutateAsync({
      amount,
      bankDetails: {
        bank_name: bankName,
        account_title: accountTitle,
        iban: iban,
      },
    });

    setShowPayoutDialog(false);
    setPayoutAmount("");
    setSelectedWalletId("");
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning': return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'withdrawal': return <ArrowDownToLine className="w-4 h-4 text-primary" />;
      case 'refund_deduction': return <ArrowDownRight className="w-4 h-4 text-destructive" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-primary text-primary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isVerified) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Complete KYC First</h2>
            <p className="text-muted-foreground">You need to complete your seller verification before accessing wallet features.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-xl md:text-2xl font-bold">Seller Wallet</h1>
        <p className="text-sm text-muted-foreground">Manage your earnings, payouts & subscription</p>
      </div>

      <SellerSubscriptionCard />

      {/* Earnings Cards */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="col-span-2 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100 text-xs">Current Balance</p>
                <p className="text-2xl md:text-3xl font-bold mt-1">{formatPKR(wallet?.current_balance || 0)}</p>
                <div className="flex items-center gap-1 mt-1.5 text-green-100">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">Available for withdrawal</span>
                </div>
              </div>
              <div className="p-2.5 bg-white/20 rounded-lg"><Wallet className="w-6 h-6" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Total Earnings</p>
            <p className="text-lg md:text-2xl font-bold text-green-500">{formatPKR(wallet?.total_earnings || 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-muted-foreground">Total Withdrawn</p>
            <p className="text-lg md:text-2xl font-bold">{formatPKR(wallet?.total_withdrawn || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <DepositFundsSection requesterType="seller" formatCurrency={formatPKR} />

      {/* Saved Wallets Section */}
      <SellerSavedWallets />

      {/* Request Payout */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Request Payout</h3>
              <p className="text-sm text-muted-foreground">Minimum withdrawal: Rs. 1,000</p>
              {hasPendingPayout && <p className="text-sm text-primary mt-1">You have a pending payout request</p>}
              {savedWallets.length === 0 && <p className="text-sm text-destructive mt-1">Please add a wallet first</p>}
            </div>
            <Button
              onClick={() => setShowPayoutDialog(true)}
              disabled={!canRequestPayout || hasPendingPayout || savedWallets.length === 0}
              className="min-w-[150px]"
            >
              <Send className="w-4 h-4 mr-2" />
              Request Payout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout Requests */}
      {payoutRequests && payoutRequests.length > 0 && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Payout Requests</CardTitle></CardHeader>
          <CardContent>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payoutRequests.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{new Date(payout.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{formatPKR(payout.amount)}</TableCell>
                      <TableCell>{payout.bank_name}</TableCell>
                      <TableCell>{getPayoutStatusBadge(payout.status)}</TableCell>
                      <TableCell>{payout.transaction_reference || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="md:hidden space-y-2">
              {payoutRequests.map((payout) => (
                <div key={payout.id} className="p-3 rounded-lg border bg-muted/30">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-sm">{formatPKR(payout.amount)}</span>
                    {getPayoutStatusBadge(payout.status)}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{payout.bank_name}</p>
                    <p>{new Date(payout.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Commission</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id}>
                        <TableCell>{new Date(txn.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(txn.transaction_type)}
                            <span className="capitalize">{txn.transaction_type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground">
                            {txn.description && <p className="line-clamp-1">{txn.description}</p>}
                            {txn.order_id && (
                              <p className="font-mono text-[10px] mt-0.5">Order: {txn.order_id.slice(0, 8)}...</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{formatPKR(txn.gross_amount)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {txn.commission_amount > 0 ? `${formatPKR(txn.commission_amount)} (${txn.commission_percentage}%)` : "-"}
                        </TableCell>
                        <TableCell className={cn("text-right font-medium", txn.net_amount >= 0 ? "text-green-500" : "text-destructive")}>
                          {txn.net_amount >= 0 ? "+" : ""}{formatPKR(Math.abs(txn.net_amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="md:hidden space-y-2">
                {transactions.map((txn) => (
                  <div key={txn.id} className="p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(txn.transaction_type)}
                        <span className="text-sm font-medium capitalize">{txn.transaction_type.replace('_', ' ')}</span>
                      </div>
                      <span className={cn("text-sm font-bold", txn.net_amount >= 0 ? "text-green-500" : "text-destructive")}>
                        {txn.net_amount >= 0 ? "+" : ""}{formatPKR(Math.abs(txn.net_amount))}
                      </span>
                    </div>
                    {txn.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-0.5">{txn.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground flex items-center justify-between">
                      <span>{new Date(txn.created_at).toLocaleDateString()}</span>
                      {txn.commission_amount > 0 && <span>Commission: {txn.commission_percentage}%</span>}
                    </div>
                    {txn.order_id && (
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">Order: {txn.order_id.slice(0, 8)}...</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No transactions yet. Earnings will appear here after orders are delivered.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Request Dialog */}
      <Dialog open={showPayoutDialog} onOpenChange={setShowPayoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Payout</DialogTitle>
            <DialogDescription>Select a saved wallet and enter the amount to withdraw.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-medium">{formatPKR(wallet?.current_balance || 0)}</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Select Wallet *</label>
              <Select value={selectedWalletId} onValueChange={setSelectedWalletId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose saved wallet" />
                </SelectTrigger>
                <SelectContent>
                  {savedWallets.map(w => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.label || activeMethods.find(m => m.id === w.method_id)?.name || "Wallet"} — {Object.values(w.field_values)[0]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Amount (PKR)</label>
              <Input
                type="number"
                placeholder="Enter amount (min Rs. 1,000)"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min={1000}
                max={wallet?.current_balance || 0}
                className="mt-1"
              />
            </div>

            {selectedSavedWallet && (
              <div className="p-4 bg-muted rounded-lg space-y-1">
                <p className="text-sm font-medium">{selectedMethodName}</p>
                {Object.entries(selectedSavedWallet.field_values).map(([key, value]) => (
                  <p key={key} className="text-sm text-muted-foreground">
                    <span className="capitalize">{key.replace(/_/g, ' ')}</span>: {value}
                  </p>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>Cancel</Button>
            <Button
              onClick={handleRequestPayout}
              disabled={
                requestPayout.isPending || !payoutAmount || !selectedWalletId ||
                parseFloat(payoutAmount) < 1000 ||
                parseFloat(payoutAmount) > (wallet?.current_balance || 0)
              }
            >
              {requestPayout.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerWalletPage;
