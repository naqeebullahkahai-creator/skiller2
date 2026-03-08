import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, TrendingUp, ShoppingCart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStore } from "@/hooks/useAdminStore";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminStoreWalletPage = () => {
  const navigate = useNavigate();
  const { storeWallet, transactions, isLoading } = useAdminStore();

  const exportCSV = () => {
    if (!transactions?.length) return;
    const rows = [["Date", "Description", "Amount", "Type"]];
    transactions.forEach(t => {
      rows.push([
        new Date(t.created_at).toLocaleDateString(),
        t.product_title || t.description || "Sale",
        t.amount.toString(),
        t.transaction_type,
      ]);
    });
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-store-transactions.csv";
    a.click();
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/store")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Wallet className="h-6 w-6" /> Store Wallet</h1>
        <p className="text-white/80 text-sm mt-1">Earnings from admin-owned products only</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl shrink-0 bg-emerald-500"><Wallet className="h-5 w-5 text-white" /></div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-20" /> : <p className="text-xl font-bold">{formatPKR(storeWallet?.total_balance ?? 0)}</p>}
              <p className="text-xs text-muted-foreground">Current Balance</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl shrink-0 bg-violet-500"><TrendingUp className="h-5 w-5 text-white" /></div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-20" /> : <p className="text-xl font-bold">{formatPKR(storeWallet?.total_earnings ?? 0)}</p>}
              <p className="text-xs text-muted-foreground">Total Earnings</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl shrink-0 bg-blue-500"><ShoppingCart className="h-5 w-5 text-white" /></div>
            <div>
              {isLoading ? <Skeleton className="h-7 w-20" /> : <p className="text-xl font-bold">{storeWallet?.total_orders ?? 0}</p>}
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Transaction History</CardTitle>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="divide-y">
              {transactions.map(txn => (
                <div key={txn.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{txn.product_title || txn.description || "Sale"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(txn.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-semibold">
                    +{formatPKR(txn.amount)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStoreWalletPage;
