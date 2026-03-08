import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useCommissionWallet } from "@/hooks/useCommissionWallet";
import { formatPKR } from "@/hooks/useProducts";
import {
  Wallet, TrendingUp, Download, Search, ArrowLeft, Percent, DollarSign, Package,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminCommissionWalletPage = () => {
  const { wallet, walletLoading, transactions, txnLoading, exportCSV } = useCommissionWallet();
  const [search, setSearch] = useState("");

  const filteredTxns = transactions?.filter(t =>
    (t.product_title || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.seller_name || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (walletLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/admin/finance-management">
            <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Percent className="text-primary" size={24} />
              Commission Wallet
            </h1>
            <p className="text-muted-foreground text-sm">
              Per-product commission earnings from seller sales
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={!transactions?.length}>
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold">{formatPKR(wallet?.total_balance || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earned</p>
                <p className="text-3xl font-bold">{formatPKR(wallet?.total_earned || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Commission History
              </CardTitle>
              <CardDescription>{filteredTxns.length} transactions</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="Search product or seller..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {txnLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="text-center py-12">
              <Percent className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No commission transactions yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Sale Amount</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxns.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(txn.created_at).toLocaleDateString("en-PK", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {txn.product_title || "—"}
                      </TableCell>
                      <TableCell>{txn.seller_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          {txn.commission_type === 'percentage' ? (
                            <><Percent size={12} />{txn.commission_value}%</>
                          ) : (
                            <><DollarSign size={12} />Rs. {txn.commission_value}</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatPKR(txn.sale_amount)}</TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        +{formatPKR(txn.commission_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommissionWalletPage;
