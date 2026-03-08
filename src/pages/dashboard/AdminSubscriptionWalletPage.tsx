import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useSubscriptionFeeWallet } from "@/hooks/useSubscriptionFeeWallet";
import { formatPKR } from "@/hooks/useProducts";
import {
  Wallet, TrendingUp, Download, Search, ArrowLeft, CreditCard,
  Users, AlertTriangle, CheckCircle, Clock, Gift,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PLAN_LABELS } from "@/hooks/useSellerSubscription";

const AdminSubscriptionWalletPage = () => {
  const {
    wallet, walletLoading, transactions, txnLoading,
    paidSellers, unpaidSellers, freePeriodSellers,
    getSellerName, exportCSV,
  } = useSubscriptionFeeWallet();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("history");

  const filteredTxns = transactions?.filter(t =>
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
              <CreditCard className="text-primary" size={24} />
              Subscription Fee Wallet
            </h1>
            <p className="text-muted-foreground text-sm">
              Platform subscription fee earnings from sellers
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={exportCSV} disabled={!transactions?.length}>
          <Download size={16} className="mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Wallet className="text-primary" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">{formatPKR(wallet?.total_balance || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <TrendingUp className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Earned</p>
                <p className="text-2xl font-bold">{formatPKR(wallet?.total_earned || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active Paid</p>
                <p className="text-2xl font-bold">{paidSellers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/10">
                <AlertTriangle className="text-destructive" size={24} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unpaid / Suspended</p>
                <p className="text-2xl font-bold">{unpaidSellers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">Fee History</TabsTrigger>
          <TabsTrigger value="paid">
            Paid
            <Badge variant="secondary" className="ml-1.5 text-xs">{paidSellers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unpaid">
            Unpaid
            <Badge variant="destructive" className="ml-1.5 text-xs">{unpaidSellers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="free">
            Free Period
            <Badge variant="outline" className="ml-1.5 text-xs">{freePeriodSellers.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Fee History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="text-lg">Transaction History</CardTitle>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input placeholder="Search seller..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {txnLoading ? (
                <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
              ) : filteredTxns.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground">No subscription fee transactions yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Seller</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTxns.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(txn.created_at).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                          </TableCell>
                          <TableCell className="font-medium">{txn.seller_name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{PLAN_LABELS[txn.plan_type] || txn.plan_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={txn.status === 'success' ? 'default' : 'destructive'}>
                              {txn.status === 'success' ? 'Paid' : 'Failed'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            +{formatPKR(txn.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paid Sellers Tab */}
        <TabsContent value="paid">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle size={18} className="text-emerald-600" />
                Active & Paid Sellers ({paidSellers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paidSellers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No active paid sellers</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Next Deduction</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paidSellers.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{getSellerName(s.seller_id)}</TableCell>
                          <TableCell><Badge variant="outline">{PLAN_LABELS[s.plan_type] || s.plan_type}</Badge></TableCell>
                          <TableCell>{formatPKR(s.total_fees_paid || 0)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {s.next_deduction_at ? new Date(s.next_deduction_at).toLocaleDateString("en-PK", { day: "numeric", month: "short" }) : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Unpaid Sellers Tab */}
        <TabsContent value="unpaid">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle size={18} className="text-destructive" />
                Unpaid / Suspended Sellers ({unpaidSellers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unpaidSellers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">All sellers are up to date!</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Pending Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Suspended At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unpaidSellers.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{getSellerName(s.seller_id)}</TableCell>
                          <TableCell><Badge variant="outline">{PLAN_LABELS[s.plan_type] || s.plan_type}</Badge></TableCell>
                          <TableCell className="text-destructive font-semibold">{formatPKR(s.pending_amount || 0)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">
                              {s.account_suspended ? 'Suspended' : 'Payment Pending'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {s.suspended_at ? new Date(s.suspended_at).toLocaleDateString("en-PK") : "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Free Period Tab */}
        <TabsContent value="free">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift size={18} className="text-primary" />
                Free Period Sellers ({freePeriodSellers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {freePeriodSellers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No sellers in free period</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Seller</TableHead>
                        <TableHead>Free Months</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Ends</TableHead>
                        <TableHead>Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {freePeriodSellers.map((s: any) => {
                        const daysLeft = s.free_period_end
                          ? Math.max(0, Math.ceil((new Date(s.free_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                          : 0;
                        return (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">{getSellerName(s.seller_id)}</TableCell>
                            <TableCell>{s.free_months} months</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {s.free_period_start ? new Date(s.free_period_start).toLocaleDateString("en-PK") : "—"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {s.free_period_end ? new Date(s.free_period_end).toLocaleDateString("en-PK") : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={daysLeft <= 7 ? "destructive" : "secondary"}>
                                <Clock size={12} className="mr-1" />
                                {daysLeft} days
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSubscriptionWalletPage;
