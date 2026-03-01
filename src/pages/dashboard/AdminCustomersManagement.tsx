import { useState } from "react";
import {
  User, Search, Eye, Package, Wallet, Calendar, ShoppingCart,
  PiggyBank, Scale, ChevronRight, Download, BarChart3, Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { useAdminDepositRequests } from "@/hooks/useDeposits";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import UserDetailViewer from "@/components/admin/UserDetailViewer";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

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

const AdminCustomersManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { customers, isLoading, stats } = useAdminCustomers(searchQuery);
  const { pendingCount: pendingDeposits } = useAdminDepositRequests("customer");

  const statCards = [
    { label: "Total Customers", value: stats.totalCustomers, icon: <User className="h-5 w-5 text-white" />, color: "bg-cyan-500" },
    { label: "Total Orders", value: stats.totalOrders, icon: <Package className="h-5 w-5 text-white" />, color: "bg-blue-500" },
    { label: "Total Revenue", value: formatPKR(stats.totalSpent), icon: <Wallet className="h-5 w-5 text-white" />, color: "bg-emerald-500" },
    { label: "New This Month", value: stats.newThisMonth, icon: <Calendar className="h-5 w-5 text-white" />, color: "bg-violet-500" },
  ];

  const quickActions: QuickActionProps[] = [
    { icon: <ShoppingCart className="w-5 h-5 text-white" />, title: "All Orders", description: "View all customer orders", href: "/admin/orders", color: "bg-blue-500" },
    { icon: <PiggyBank className="w-5 h-5 text-white" />, title: "Customer Deposits", description: "Approve deposit requests", href: "/admin/deposits/users", badge: pendingDeposits, color: "bg-violet-500" },
    { icon: <Scale className="w-5 h-5 text-white" />, title: "Balance Adjustments", description: "Credit/debit customer wallets", href: "/admin/balance-adjustments", color: "bg-rose-500" },
    { icon: <BarChart3 className="w-5 h-5 text-white" />, title: "Analytics", description: "Customer insights & trends", href: "/admin/analytics", color: "bg-amber-500" },
    { icon: <Shield className="w-5 h-5 text-white" />, title: "Security & Logins", description: "Login sessions & IP tracking", href: "/admin/security", color: "bg-slate-700" },
    { icon: <Package className="w-5 h-5 text-white" />, title: "Returns & Refunds", description: "Handle customer returns", href: "/admin/returns", color: "bg-orange-500" },
  ];

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Orders", "Total Spent", "Wallet", "Joined"];
    const rows = customers.map(c => [
      c.display_id || c.id, c.full_name, c.email,
      c.orders_count, c.total_spent, c.wallet_balance,
      format(new Date(c.created_at), "yyyy-MM-dd"),
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `customers-${format(new Date(), "yyyy-MM-dd")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-xl p-5 text-white">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <User className="h-6 w-6" />
          Customers Management
        </h1>
        <p className="text-white/80 text-sm mt-1">Customer directory, orders, wallets, deposits & support</p>
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
          <TabsTrigger value="directory">Customer Directory</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action, i) => <QuickAction key={i} {...action} />)}
          </div>
        </TabsContent>

        <TabsContent value="directory" className="mt-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by ID, name or email (FZN-USR-...)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Orders</TableHead>
                    <TableHead className="hidden md:table-cell">Spent</TableHead>
                    <TableHead className="hidden lg:table-cell">Wallet</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(7)].map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-6 w-20" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No customers found</TableCell>
                    </TableRow>
                  ) : (
                    customers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs text-primary">
                          {user.display_id || `FZN-USR-${user.id.slice(0, 6).toUpperCase()}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 shrink-0">
                              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.full_name} className="object-cover aspect-square" />}
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">{user.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{user.orders_count}</TableCell>
                        <TableCell className="hidden md:table-cell">{formatPKR(user.total_spent)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{formatPKR(user.wallet_balance)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{format(new Date(user.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUserId(user.id)}>
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

      <UserDetailViewer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </div>
  );
};

export default AdminCustomersManagement;
