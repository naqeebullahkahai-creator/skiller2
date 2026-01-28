import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Store, Eye, Package, Wallet, ShieldCheck, XCircle, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSellers } from "@/hooks/useAdminSellers";
import { format } from "date-fns";

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getVerificationBadge = (status: string | undefined) => {
  if (!status) return null;
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

const AdminSellersDirectory = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { sellers, isLoading, stats } = useAdminSellers(searchQuery);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            Seller Directory
          </h1>
          <p className="text-muted-foreground">Manage all registered sellers and their stores</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID, shop or email (FZN-SEL-...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalSellers}</p>
                <p className="text-xs text-muted-foreground">Total Sellers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.verifiedSellers}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingSellers}</p>
                <p className="text-xs text-muted-foreground">Pending KYC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPKR(stats.totalEarnings)}</p>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sellers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Seller / Shop</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Products</TableHead>
                <TableHead className="hidden md:table-cell">Wallet Balance</TableHead>
                <TableHead className="hidden lg:table-cell">City</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : sellers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No sellers found
                  </TableCell>
                </TableRow>
              ) : (
                sellers.map((seller) => (
                  <TableRow key={seller.id}>
                    <TableCell className="font-mono text-xs text-primary">
                      {seller.display_id || `FZN-SEL-${seller.id.slice(0, 5).toUpperCase()}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          {seller.avatar_url ? (
                            <AvatarImage
                              src={seller.avatar_url}
                              alt={seller.shop_name}
                              className="object-cover aspect-square"
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {seller.shop_name?.charAt(0).toUpperCase() || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{seller.shop_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{seller.full_name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVerificationBadge(seller.verification_status)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{seller.products_count}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatPKR(seller.wallet_balance)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{seller.city || "-"}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {format(new Date(seller.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/sellers/${seller.id}`)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSellersDirectory;
