import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Store, Search, Eye, ShieldCheck, XCircle, CheckCircle, AlertCircle,
  TrendingUp, Package, Wallet, Users, FileCheck, Zap, CreditCard,
  BarChart3, Percent, PiggyBank, Settings, ChevronRight, Scale, UserCheck, ArrowLeft, RotateCcw
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

const SellerTable = ({ 
  sellers, isLoading, navigate, toAdminPath, searchQuery, showUnreject, onUnreject 
}: {
  sellers: any[];
  isLoading: boolean;
  navigate: any;
  toAdminPath: (p: string) => string;
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
                        <Button variant="ghost" size="sm" onClick={() => navigate(toAdminPath(`/admin/sellers/${seller.id}`))}>
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
            <Card key={seller.id} className="border-0 shadow-sm active:scale-[0.98] transition-transform cursor-pointer" onClick={() => navigate(toAdminPath(`/admin/sellers/${seller.id}`))}>
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

  const verifiedSellers = sellers.filter(s => s.verification_status === "verified");
  const pendingSellers = sellers.filter(s => s.verification_status === "pending");
  const rejectedSellers = sellers.filter(s => s.verification_status === "rejected");

  const handleUnreject = () => {
    if (!unrejectSeller) return;
    // Find the seller_profile id from useAdminSellerProfiles or use the seller.id (which is seller_profile.id)
    updateStatus.mutate(
      { id: unrejectSeller.id, status: "verified" },
      { onSettled: () => setUnrejectSeller(null) }
    );
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
            Unverified
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
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, i) => <QuickAction key={i} {...action} href={toAdminPath(action.href)} />)}
          </div>
        </TabsContent>

        {/* Verified Tab */}
        <TabsContent value="verified" className="mt-4">
          <SellerTable sellers={verifiedSellers} isLoading={isLoading} navigate={navigate} toAdminPath={toAdminPath} searchQuery={searchQuery} />
        </TabsContent>

        {/* Unverified Tab (pending + rejected) */}
        <TabsContent value="unverified" className="mt-4">
          <SellerTable sellers={unverifiedSellers} isLoading={isLoading} navigate={navigate} toAdminPath={toAdminPath} searchQuery={searchQuery} showUnreject onUnreject={(seller) => setUnrejectSeller(seller)} />
        </TabsContent>

        {/* All Tab */}
        <TabsContent value="all" className="mt-4">
          <SellerTable sellers={sellers} isLoading={isLoading} navigate={navigate} toAdminPath={toAdminPath} searchQuery={searchQuery} showUnreject onUnreject={(seller) => setUnrejectSeller(seller)} />
        </TabsContent>
      </Tabs>

      {/* Unreject Confirmation Dialog */}
      <AlertDialog open={!!unrejectSeller} onOpenChange={(open) => !open && setUnrejectSeller(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unreject & Verify Seller</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unreject <strong>{unrejectSeller?.shop_name}</strong> and change their status to <strong>Verified</strong>? This will allow the seller to operate on the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnreject} className="bg-green-600 hover:bg-green-700">
              <ShieldCheck size={16} className="mr-1" /> Verify Seller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminSellersManagement;
