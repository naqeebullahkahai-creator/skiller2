import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Store, Search, Eye, ShieldCheck, XCircle, CheckCircle, AlertCircle,
  TrendingUp, Package, Wallet, Users, FileCheck, CreditCard,
  BarChart3, Percent, PiggyBank, Settings, ChevronRight, Scale, UserCheck, ArrowLeft, RotateCcw,
  ShoppingCart, ArrowUpRight, Calendar, DollarSign, Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useAdminSellers, useSellerDetails } from "@/hooks/useAdminSellers";
import { useAdminSellerProfiles } from "@/hooks/useAdminSellerProfiles";
import { useAdminDepositRequests } from "@/hooks/useDeposits";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SellerPerformanceCharts from "@/components/admin/SellerPerformanceCharts";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const getVerificationBadge = (status: string | undefined) => {
  switch (status) {
    case "verified":
      return <Badge className="bg-green-500 text-white gap-1"><CheckCircle size={12} /> Verified</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="gap-1"><XCircle size={12} /> Rejected</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500 text-white gap-1"><AlertCircle size={12} /> Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Inline Seller Detail Dialog
const SellerDetailDialog = ({ sellerId, open, onOpenChange }: { sellerId: string; open: boolean; onOpenChange: (o: boolean) => void }) => {
  const { seller, isLoading } = useSellerDetails(sellerId);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Seller Details
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : seller ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <Avatar className="h-16 w-16">
                {seller.profile?.avatar_url && <AvatarImage src={seller.profile.avatar_url} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                  {seller.shop_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold">{seller.shop_name}</h3>
                <p className="text-sm text-muted-foreground">{seller.profile?.full_name}</p>
                <p className="text-xs text-muted-foreground font-mono">ID: {seller.user_id}</p>
                <p className="text-xs text-muted-foreground">{seller.profile?.email}</p>
                <div className="mt-1">{getVerificationBadge(seller.verification_status)}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="p-3 text-center">
                <Package className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-xl font-bold">{seller.products?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <ShoppingCart className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                <p className="text-xl font-bold">{seller.orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <Wallet className="h-5 w-5 mx-auto text-green-500 mb-1" />
                <p className="text-xl font-bold">{formatPKR(seller.wallet?.current_balance || 0)}</p>
                <p className="text-xs text-muted-foreground">Balance</p>
              </CardContent></Card>
              <Card><CardContent className="p-3 text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
                <p className="text-xl font-bold">{formatPKR(seller.wallet?.total_earnings || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </CardContent></Card>
            </div>

            {/* KYC Info */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">KYC Information</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Legal Name:</span> {seller.legal_name}</div>
                  <div><span className="text-muted-foreground">CNIC:</span> {seller.cnic_number}</div>
                  <div><span className="text-muted-foreground">City:</span> {seller.city}</div>
                  <div><span className="text-muted-foreground">Bank:</span> {seller.bank_name}</div>
                  <div><span className="text-muted-foreground">IBAN:</span> {seller.iban}</div>
                  <div><span className="text-muted-foreground">Account:</span> {seller.account_title}</div>
                </div>
                {/* KYC Documents */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {seller.cnic_front_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CNIC Front</p>
                      <img src={seller.cnic_front_url} alt="CNIC Front" className="w-full aspect-video object-cover rounded border" />
                    </div>
                  )}
                  {seller.cnic_back_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">CNIC Back</p>
                      <img src={seller.cnic_back_url} alt="CNIC Back" className="w-full aspect-video object-cover rounded border" />
                    </div>
                  )}
                  {seller.selfie_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Selfie</p>
                      <img src={seller.selfie_url} alt="Selfie" className="w-full aspect-square object-cover rounded border" />
                    </div>
                  )}
                  {seller.bank_cheque_url && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Bank Cheque</p>
                      <img src={seller.bank_cheque_url} alt="Bank Cheque" className="w-full aspect-video object-cover rounded border" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            {seller.products && seller.products.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Products ({seller.products.length})</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {seller.products.map((p: any) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium truncate max-w-[200px]">{p.title}</TableCell>
                          <TableCell>{formatPKR(p.price_pkr)}</TableCell>
                          <TableCell>{p.stock_count}</TableCell>
                          <TableCell><Badge variant={p.status === 'active' ? 'default' : 'secondary'}>{p.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Recent Orders */}
            {seller.orders && seller.orders.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Recent Orders ({seller.orders.length})</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Order #</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {seller.orders.map((o: any) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">#{o.order_number}</TableCell>
                          <TableCell>{format(new Date(o.created_at), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{formatPKR(o.total_amount_pkr)}</TableCell>
                          <TableCell><Badge variant="outline">{o.order_status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Wallet Transactions */}
            {seller.transactions && seller.transactions.length > 0 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Wallet Transactions</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Amount</TableHead><TableHead>Description</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {seller.transactions.map((tx: any) => (
                        <TableRow key={tx.id}>
                          <TableCell>{format(new Date(tx.created_at), "MMM dd")}</TableCell>
                          <TableCell><Badge variant={tx.net_amount >= 0 ? 'default' : 'secondary'}>{tx.transaction_type}</Badge></TableCell>
                          <TableCell className={tx.net_amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {tx.net_amount >= 0 ? '+' : ''}{formatPKR(tx.net_amount || 0)}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">{tx.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">Seller not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
};

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  badge?: number;
  color: string;
}

const QuickAction = ({ icon, title, description, href, badge, color }: QuickActionProps) => {
  const navigate = useNavigate();
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98]" onClick={() => navigate(href)}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2.5 rounded-xl shrink-0", color)}>{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{title}</h3>
            {badge && badge > 0 ? <Badge variant="destructive" className="text-xs">{badge}</Badge> : null}
          </div>
          <p className="text-xs text-muted-foreground truncate">{description}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
      </CardContent>
    </Card>
  );
};

const SellerTable = ({ 
  sellers, isLoading, onViewSeller, searchQuery, showUnreject, onUnreject 
}: {
  sellers: any[];
  isLoading: boolean;
  onViewSeller: (seller: any) => void;
  searchQuery: string;
  showUnreject?: boolean;
  onUnreject?: (seller: any) => void;
}) => {
  const filtered = searchQuery
    ? sellers.filter(s =>
        s.shop_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.display_id?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sellers;

  return (
    <>
      {/* Desktop Table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Seller / Shop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Wallet</TableHead>
                <TableHead className="hidden lg:table-cell">City</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(8)].map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-6 w-20" /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No sellers found</TableCell>
                </TableRow>
              ) : (
                filtered.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-mono text-xs text-primary">
                      {seller.display_id || `FZN-SEL-${seller.id.slice(0, 5).toUpperCase()}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          {seller.avatar_url && <AvatarImage src={seller.avatar_url} alt={seller.shop_name} className="object-cover aspect-square" />}
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{seller.shop_name?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{seller.shop_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{seller.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getVerificationBadge(seller.verification_status)}</TableCell>
                    <TableCell>{seller.products_count}</TableCell>
                    <TableCell>{formatPKR(seller.wallet_balance)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{seller.city || "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell">{format(new Date(seller.created_at), "MMM dd, yyyy")}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onViewSeller(seller)}>
                          <Eye size={16} className="mr-1" /> View
                        </Button>
                        {showUnreject && seller.verification_status === "rejected" && onUnreject && (
                          <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); onUnreject(seller); }}>
                            <RotateCcw size={14} className="mr-1" /> Unreject
                          </Button>
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card><CardContent className="p-6 text-center text-muted-foreground">No sellers found</CardContent></Card>
        ) : (
          filtered.map((seller) => (
            <Card key={seller.id} className="border-0 shadow-sm active:scale-[0.98] transition-transform cursor-pointer" onClick={() => onViewSeller(seller)}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    {seller.avatar_url && <AvatarImage src={seller.avatar_url} alt={seller.shop_name} className="object-cover aspect-square" />}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">{seller.shop_name?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{seller.shop_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{seller.full_name}</p>
                  </div>
                  {getVerificationBadge(seller.verification_status)}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Products</p>
                    <p className="text-sm font-bold">{seller.products_count}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">Wallet</p>
                    <p className="text-sm font-bold truncate">{formatPKR(seller.wallet_balance)}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2">
                    <p className="text-xs text-muted-foreground">City</p>
                    <p className="text-sm font-bold truncate">{seller.city || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-muted-foreground font-mono">{seller.display_id || `FZN-SEL-${seller.id.slice(0, 5).toUpperCase()}`}</p>
                  {showUnreject && seller.verification_status === "rejected" && onUnreject && (
                    <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50 h-7 text-xs" onClick={(e) => { e.stopPropagation(); onUnreject(seller); }}>
                      <RotateCcw size={12} className="mr-1" /> Unreject
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
};

const AdminSellersManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const adminBasePath = location.pathname.startsWith("/admin-app") ? "/admin-app" : "/admin";
  const toAdminPath = (path: string) => path.replace(/^\/admin/, adminBasePath);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { sellers, isLoading, stats } = useAdminSellers();
  const { pendingCount: pendingKyc, updateStatus } = useAdminSellerProfiles();
  const { pendingCount: pendingDeposits } = useAdminDepositRequests("seller");
  const [unrejectSeller, setUnrejectSeller] = useState<any>(null);
  const [viewingSellerId, setViewingSellerId] = useState<string | null>(null);

  // Analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ["sellers-analytics-overview"],
    queryFn: async () => {
      const [ordersRes, withdrawalsRes, depositsRes, recentSellersRes] = await Promise.all([
        supabase.from("orders").select("total_amount_pkr, order_status, created_at, items"),
        supabase.from("wallet_transactions").select("net_amount, transaction_type, created_at").eq("transaction_type", "withdrawal"),
        supabase.from("deposit_requests").select("amount, status, created_at").eq("requester_type", "seller"),
        supabase.from("seller_profiles").select("created_at").order("created_at", { ascending: false }).limit(30),
      ]);

      const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.total_amount_pkr), 0) || 0;
      const deliveredOrders = ordersRes.data?.filter(o => o.order_status === "delivered").length || 0;
      const pendingOrders = ordersRes.data?.filter(o => o.order_status === "pending" || o.order_status === "processing").length || 0;
      const totalWithdrawals = withdrawalsRes.data?.reduce((sum, w) => sum + Math.abs(Number(w.net_amount)), 0) || 0;
      const pendingDepositsAmount = depositsRes.data?.filter(d => d.status === "pending").reduce((sum, d) => sum + Number(d.amount), 0) || 0;
      const approvedDeposits = depositsRes.data?.filter(d => d.status === "approved").length || 0;
      const pendingDepositsCount = depositsRes.data?.filter(d => d.status === "pending").length || 0;

      // New registrations this month
      const now = new Date();
      const thisMonth = recentSellersRes.data?.filter(s => {
        const d = new Date(s.created_at);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length || 0;

      return {
        totalRevenue,
        deliveredOrders,
        pendingOrders,
        totalWithdrawals,
        pendingDepositsAmount,
        approvedDeposits,
        pendingDepositsCount,
        newRegistrationsThisMonth: thisMonth,
      };
    },
  });

  const verifiedSellers = sellers.filter(s => s.verification_status === "verified");
  const pendingSellers = sellers.filter(s => s.verification_status === "pending");
  const rejectedSellers = sellers.filter(s => s.verification_status === "rejected");

  const handleUnreject = () => {
    if (!unrejectSeller) return;
    updateStatus.mutate(
      { id: unrejectSeller.id, status: "verified" },
      { onSettled: () => setUnrejectSeller(null) }
    );
  };

  const handleViewSeller = (seller: any) => {
    setViewingSellerId(seller.id);
  };

  const statCards = [
    { label: "Total Sellers", value: stats.totalSellers, icon: <Store className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { label: "Verified", value: stats.verifiedSellers, icon: <ShieldCheck className="h-5 w-5 text-white" />, color: "bg-green-500" },
    { label: "Unverified", value: pendingSellers.length, icon: <AlertCircle className="h-5 w-5 text-white" />, color: "bg-yellow-500" },
    { label: "Rejected", value: rejectedSellers.length, icon: <XCircle className="h-5 w-5 text-white" />, color: "bg-red-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: "KYC Approvals", description: "Review seller applications", href: "/admin/seller-kyc", badge: pendingKyc, color: "bg-amber-500" },
    { icon: <UserCheck className="w-5 h-5 text-white" />, title: "Seller Approvals", description: "Approve new registrations", href: "/admin/approvals", color: "bg-primary" },
    { icon: <PiggyBank className="w-5 h-5 text-white" />, title: "Seller Deposits", description: "Approve deposit requests", href: "/admin/deposits/sellers", badge: pendingDeposits, color: "bg-violet-500" },
    { icon: <ShoppingCart className="w-5 h-5 text-white" />, title: "Seller Orders", description: "View seller marketplace orders", href: "/admin/seller-orders", color: "bg-purple-500" },
    { icon: <Package className="w-5 h-5 text-white" />, title: "Product Catalog", description: "Manage seller products", href: "/admin/products", color: "bg-cyan-500" },
    { icon: <Wallet className="w-5 h-5 text-white" />, title: "Payouts", description: "Seller withdrawal requests", href: "/admin/payouts", color: "bg-orange-500" },
    { icon: <Scale className="w-5 h-5 text-white" />, title: "Balance Adjustments", description: "Credit/debit seller wallets", href: "/admin/balance-adjustments", color: "bg-rose-500" },
    { icon: <Percent className="w-5 h-5 text-white" />, title: "Pending Commissions", description: "Settle delivered order commissions", href: "/admin/pending-commissions", color: "bg-indigo-500" },
    { icon: <CreditCard className="w-5 h-5 text-white" />, title: "Subscriptions", description: "Plans & billing", href: "/admin/subscriptions", color: "bg-teal-500" },
    { icon: <BarChart3 className="w-5 h-5 text-white" />, title: "Performance Analytics", description: "Seller metrics & leaderboard", href: "/admin/analytics", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Inline Seller Detail Dialog */}
      {viewingSellerId && (
        <SellerDetailDialog
          sellerId={viewingSellerId}
          open={!!viewingSellerId}
          onOpenChange={(o) => { if (!o) setViewingSellerId(null); }}
        />
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate(toAdminPath("/admin/dashboard"))} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Return to Admin Panel
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Store className="h-6 w-6" />
          Sellers Management
        </h1>
        <p className="text-white/80 text-sm mt-1">Complete seller lifecycle management — KYC, products, earnings, subscriptions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl shrink-0", card.color)}>{card.icon}</div>
              <div>
                <p className="text-lg font-bold">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="verified" className="gap-1">
            Verified
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{verifiedSellers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unverified" className="gap-1">
            Pending
            <Badge className="bg-yellow-500 text-white text-[10px] px-1.5 py-0 h-4">{pendingSellers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1">
            Rejected
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">{rejectedSellers.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {/* Search (shared) */}
        {activeTab !== "overview" && (
          <div className="relative w-full sm:w-80 mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by ID, shop, name (FZN-SEL-...)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
        )}

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4 space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Total Revenue</span>
                </div>
                <p className="text-lg font-bold">{formatPKR(analyticsData?.totalRevenue || 0)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="h-4 w-4 text-purple-500" />
                  <span className="text-xs text-muted-foreground">Delivered Orders</span>
                </div>
                <p className="text-lg font-bold">{analyticsData?.deliveredOrders || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight className="h-4 w-4 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Total Withdrawals</span>
                </div>
                <p className="text-lg font-bold">{formatPKR(analyticsData?.totalWithdrawals || 0)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground">New This Month</span>
                </div>
                <p className="text-lg font-bold">{analyticsData?.newRegistrationsThisMonth || 0}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">Pending Orders</span>
                </div>
                <p className="text-lg font-bold">{analyticsData?.pendingOrders || 0}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <PiggyBank className="h-4 w-4 text-violet-500" />
                  <span className="text-xs text-muted-foreground">Pending Deposits</span>
                </div>
                <p className="text-lg font-bold">{analyticsData?.pendingDepositsCount || 0} ({formatPKR(analyticsData?.pendingDepositsAmount || 0)})</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground">Approved Deposits</span>
                </div>
                <p className="text-lg font-bold">{analyticsData?.approvedDeposits || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">QUICK ACTIONS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, i) => <QuickAction key={i} {...action} href={toAdminPath(action.href)} />)}
            </div>
          </div>
        </TabsContent>

        {/* Verified Tab */}
        <TabsContent value="verified" className="mt-4">
          <SellerTable sellers={verifiedSellers} isLoading={isLoading} onViewSeller={handleViewSeller} searchQuery={searchQuery} />
        </TabsContent>

        {/* Unverified Tab (pending only) */}
        <TabsContent value="unverified" className="mt-4">
          <SellerTable sellers={pendingSellers} isLoading={isLoading} onViewSeller={handleViewSeller} searchQuery={searchQuery} />
        </TabsContent>

        {/* Rejected Tab */}
        <TabsContent value="rejected" className="mt-4">
          <SellerTable sellers={rejectedSellers} isLoading={isLoading} onViewSeller={handleViewSeller} searchQuery={searchQuery} showUnreject onUnreject={(seller) => setUnrejectSeller(seller)} />
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="mt-4">
          <SellerTable sellers={sellers} isLoading={isLoading} onViewSeller={handleViewSeller} searchQuery={searchQuery} showUnreject onUnreject={(seller) => setUnrejectSeller(seller)} />
        </TabsContent>
      </Tabs>

      {/* Unreject Dialog */}
      <AlertDialog open={!!unrejectSeller} onOpenChange={() => setUnrejectSeller(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Un-reject this seller?</AlertDialogTitle>
            <AlertDialogDescription>
              This will change <strong>{unrejectSeller?.shop_name}</strong> from <em>Rejected</em> to <em>Verified</em>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnreject} className="bg-green-600 hover:bg-green-700">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSellersManagement;
