import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wallet, TrendingUp, Download } from "lucide-react";
import { useAdminWallet } from "@/hooks/useAdminWallet";
import { formatPKR } from "@/hooks/useSellerWallet";
import { format } from "date-fns";

const AdminWalletPage = () => {
  const { wallet, walletLoading, transactions, txnLoading, exportCSV } = useAdminWallet();

  if (walletLoading) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Wallet</h1>
          <p className="text-muted-foreground">Platform earnings & financial overview</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={!transactions?.length}>
          <Download className="w-4 h-4 mr-2" />Export CSV
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm opacity-80">Total Balance</p>
                <p className="text-3xl font-bold mt-1">{formatPKR(wallet?.total_balance || 0)}</p>
              </div>
              <div className="p-3 bg-white/20 rounded-lg"><Wallet className="w-8 h-8" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Subscription Earnings</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatPKR(wallet?.total_subscription_earnings || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">From seller platform fees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Commission Earnings</p>
            <p className="text-2xl font-bold mt-1">{formatPKR(wallet?.total_commission_earnings || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">From product commissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {txnLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : !transactions?.length ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet</p>
          ) : (
            <div className="space-y-1.5">
              {transactions.map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] h-5 capitalize">{txn.transaction_type.replace('_', ' ')}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(txn.created_at), 'dd MMM yyyy HH:mm')}</span>
                    </div>
                    {txn.description && <p className="text-xs text-muted-foreground mt-1">{txn.description}</p>}
                  </div>
                  <span className="font-semibold text-green-600">+{formatPKR(txn.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWalletPage;
