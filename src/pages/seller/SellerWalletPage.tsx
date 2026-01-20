import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  Clock,
  Loader2,
  Send,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSellerWallet, formatPKR } from "@/hooks/useSellerWallet";
import { useSellerKyc } from "@/hooks/useSellerKyc";

const SellerWalletPage = () => {
  const { wallet, transactions, payoutRequests, isLoading, requestPayout, canRequestPayout, hasPendingPayout } = useSellerWallet();
  const { sellerProfile, isVerified } = useSellerKyc();
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");

  const handleRequestPayout = async () => {
    if (!sellerProfile || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount < 1000) {
      return;
    }

    await requestPayout.mutateAsync({
      amount,
      bankDetails: {
        bank_name: sellerProfile.bank_name,
        account_title: sellerProfile.account_title,
        iban: sellerProfile.iban,
      },
    });

    setShowPayoutDialog(false);
    setPayoutAmount("");
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <ArrowUpRight className="w-4 h-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowDownToLine className="w-4 h-4 text-primary" />;
      case 'refund_deduction':
        return <ArrowDownRight className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPayoutStatusBadge = (status: string) => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Complete KYC First</h2>
            <p className="text-muted-foreground">
              You need to complete your seller verification before accessing wallet features.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Seller Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and payouts</p>
      </div>

      {/* Earnings Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Current Balance Card - Highlighted */}
        <Card className="md:col-span-2 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100 text-sm">Current Balance</p>
                <p className="text-3xl font-bold mt-1">
                  {formatPKR(wallet?.current_balance || 0)}
                </p>
                <div className="flex items-center gap-1 mt-2 text-green-100">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Available for withdrawal</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-lg">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-green-500">
                  {formatPKR(wallet?.total_earnings || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                <p className="text-2xl font-bold">
                  {formatPKR(wallet?.total_withdrawn || 0)}
                </p>
              </div>
              <ArrowDownToLine className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout Button */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">Request Payout</h3>
              <p className="text-sm text-muted-foreground">
                Minimum withdrawal amount: Rs. 1,000
              </p>
              {hasPendingPayout && (
                <p className="text-sm text-primary mt-1">
                  You have a pending payout request
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowPayoutDialog(true)}
              disabled={!canRequestPayout || hasPendingPayout}
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
          <CardHeader>
            <CardTitle>Payout Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reference</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {new Date(payout.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPKR(payout.amount)}
                    </TableCell>
                    <TableCell>{payout.bank_name}</TableCell>
                    <TableCell>{getPayoutStatusBadge(payout.status)}</TableCell>
                    <TableCell>
                      {payout.transaction_reference || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions && transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead className="text-right">Gross Amount</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead className="text-right">Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      {new Date(txn.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(txn.transaction_type)}
                        <span className="capitalize">
                          {txn.transaction_type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {txn.order_id ? txn.order_id.slice(0, 8) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatPKR(txn.gross_amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {txn.commission_amount > 0 
                        ? `${formatPKR(txn.commission_amount)} (${txn.commission_percentage}%)`
                        : "-"
                      }
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      txn.net_amount >= 0 ? "text-green-500" : "text-destructive"
                    )}>
                      {txn.net_amount >= 0 ? "+" : ""}{formatPKR(Math.abs(txn.net_amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
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
            <DialogDescription>
              Enter the amount you want to withdraw. The funds will be transferred to your registered bank account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available Balance</span>
                <span className="font-medium">{formatPKR(wallet?.current_balance || 0)}</span>
              </div>
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

            <div className="p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-medium">Bank Details</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Bank: {sellerProfile?.bank_name}</p>
                <p>Account: {sellerProfile?.account_title}</p>
                <p className="font-mono">{sellerProfile?.iban}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestPayout}
              disabled={
                requestPayout.isPending ||
                !payoutAmount ||
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
