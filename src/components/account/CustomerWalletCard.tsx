import { Wallet, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCustomerWallet } from "@/hooks/useReturns";
import { formatPKR } from "@/hooks/useProducts";
import { format } from "date-fns";

const CustomerWalletCard = () => {
  const { wallet, transactions, isLoading, refetch } = useCustomerWallet();

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Wallet Balance Header */}
      <div className="bg-gradient-to-r from-primary to-fanzon-orange-hover p-6 text-primary-foreground">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Wallet size={24} />
            <span className="font-medium">FANZON Wallet</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={refetch}
            className="text-primary-foreground hover:bg-white/20"
          >
            <RefreshCw size={18} />
          </Button>
        </div>
        <p className="text-3xl font-bold">{formatPKR(wallet?.balance || 0)}</p>
        <p className="text-sm opacity-80 mt-1">Available Balance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-border">
        <div className="bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Refunds</p>
          <p className="text-lg font-semibold text-fanzon-success">
            {formatPKR(wallet?.total_refunds || 0)}
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-lg font-semibold">{formatPKR(wallet?.total_spent || 0)}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="p-4">
        <h4 className="font-semibold mb-3">Recent Transactions</h4>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      txn.amount > 0
                        ? "bg-fanzon-success/10 text-fanzon-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {txn.amount > 0 ? (
                      <ArrowDownRight size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {txn.transaction_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(txn.created_at), "PP")}
                    </p>
                  </div>
                </div>
                <span
                  className={`font-semibold ${
                    txn.amount > 0 ? "text-fanzon-success" : "text-destructive"
                  }`}
                >
                  {txn.amount > 0 ? "+" : ""}
                  {formatPKR(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No transactions yet
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomerWalletCard;
