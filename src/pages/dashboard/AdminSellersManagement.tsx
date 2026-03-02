import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, Search, Eye, ShieldCheck, XCircle, CheckCircle, AlertCircle,
  TrendingUp, Package, Wallet, Users, FileCheck, Zap, CreditCard,
  BarChart3, Percent, PiggyBank, Settings, ChevronRight, Scale, UserCheck, ArrowLeft
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
import { useAdminSellers } from "@/hooks/useAdminSellers";
import { useAdminSellerProfiles } from "@/hooks/useAdminSellerProfiles";
import { useAdminDepositRequests } from "@/hooks/useDeposits";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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

const AdminSellersManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const { sellers, isLoading, stats } = useAdminSellers(searchQuery);
  const { pendingCount: pendingKyc, verifiedCount, rejectedCount } = useAdminSellerProfiles();
  const { pendingCount: pendingDeposits } = useAdminDepositRequests("seller");

  const statCards = [
    { label: "Total Sellers", value: stats.totalSellers, icon: <Store className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { label: "Verified", value: stats.verifiedSellers, icon: <ShieldCheck className="h-5 w-5 text-white" />, color: "bg-green-500" },
    { label: "Pending KYC", value: pendingKyc, icon: <FileCheck className="h-5 w-5 text-white" />, color: "bg-yellow-500" },
    { label: "Total Earnings", value: formatPKR(stats.totalEarnings), icon: <TrendingUp className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <FileCheck className="w-5 h-5 text-white" />, title: "KYC Approvals", description: "Review seller applications", href: "/admin/seller-kyc", badge: pendingKyc, color: "bg-amber-500" },
    { icon: <UserCheck className="w-5 h-5 text-white" />, title: "Seller Approvals", description: "Approve new registrations", href: "/admin/approvals", color: "bg-primary" },
    { icon: <PiggyBank className="w-5 h-5 text-white" />, title: "Seller Deposits", description: "Approve deposit requests", href: "/admin/deposits/sellers", badge: pendingDeposits, color: "bg-violet-500" },
    { icon: <Package className="w-5 h-5 text-white" />, title: "Product Catalog", description: "Manage seller products", href: "/admin/products", color: "bg-cyan-500" },
    { icon: <Wallet className="w-5 h-5 text-white" />, title: "Payouts", description: "Seller withdrawal requests", href: "/admin/payouts", color: "bg-orange-500" },
    { icon: <Scale className="w-5 h-5 text-white" />, title: "Balance Adjustments", description: "Credit/debit seller wallets", href: "/admin/balance-adjustments", color: "bg-rose-500" },
    { icon: <Percent className="w-5 h-5 text-white" />, title: "Commission & Fees", description: "Manage platform fees", href: "/admin/commission-management", color: "bg-indigo-500" },
    { icon: <CreditCard className="w-5 h-5 text-white" />, title: "Subscriptions", description: "Plans & billing", href: "/admin/subscriptions", color: "bg-teal-500" },
    { icon: <Zap className="w-5 h-5 text-white" />, title: "Flash Sale Nominations", description: "Seller flash sale requests", href: "/admin/flash-nominations", color: "bg-red-500" },
    { icon: <BarChart3 className="w-5 h-5 text-white" />, title: "Performance Analytics", description: "Seller metrics & leaderboard", href: "/admin/analytics", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/dashboard")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
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
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="overview">Quick Actions</TabsTrigger>
          <TabsTrigger value="directory">Seller Directory</TabsTrigger>
        </TabsList>

        {/* Quick Actions Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, i) => <QuickAction key={i} {...action} />)}
          </div>
        </TabsContent>

        {/* Directory Tab */}
        <TabsContent value="directory" className="mt-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by ID, shop, name (FZN-SEL-...)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Seller / Shop</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Products</TableHead>
                    <TableHead className="hidden md:table-cell">Wallet</TableHead>
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
                          <TableCell key={j} className={j > 3 ? "hidden md:table-cell" : ""}><Skeleton className="h-6 w-20" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : sellers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No sellers found</TableCell>
                    </TableRow>
                  ) : (
                    sellers.map((seller) => (
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
                        <TableCell className="hidden md:table-cell">{seller.products_count}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatPKR(seller.wallet_balance)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{seller.city || "-"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{format(new Date(seller.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/sellers/${seller.id}`)}>
                            <Eye size={16} className="mr-1" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSellersManagement;
