import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Store, Mail, Phone, Calendar, Package, Wallet, 
  ShieldCheck, FileText, TrendingUp, CheckCircle, 
  XCircle, AlertCircle, ArrowLeft, CreditCard, ShoppingBag,
  Image, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSellerDetails } from "@/hooks/useAdminSellers";
import SellerPerformanceCharts from "@/components/admin/SellerPerformanceCharts";
import { format } from "date-fns";

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getVerificationBadge = (status: string) => {
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

const AdminSellerDetailPage = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const { seller, isLoading } = useSellerDetails(sellerId || "");
  const [viewingDocument, setViewingDocument] = useState<{ url: string; label: string } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="text-center py-12">
        <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold">Seller not found</h2>
        <p className="text-muted-foreground mt-2">This seller does not exist or you don't have access.</p>
        <Button onClick={() => navigate("/admin/sellers")} className="mt-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Sellers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Seller Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-4">
            <Avatar className="h-20 w-20 shrink-0">
              {seller.profile?.avatar_url ? (
                <AvatarImage
                  src={seller.profile.avatar_url}
                  alt={seller.shop_name}
                  className="object-cover aspect-square"
                />
              ) : null}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {seller.shop_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{seller.shop_name}</h2>
                {getVerificationBadge(seller.verification_status)}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Store size={14} />
                  <span>{seller.profile?.full_name}</span>
                </div>
                {seller.city && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText size={14} />
                    <span>{seller.city}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar size={14} />
                  <span>Joined {format(new Date(seller.created_at), "MMMM dd, yyyy")}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="outline"
              onClick={() => navigate(`/admin/seller-kyc/${seller.id}`)}
            >
              <ShieldCheck size={16} className="mr-2" />
              View KYC Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{seller.products?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatPKR(seller.wallet?.current_balance || 0)}</p>
                <p className="text-xs text-muted-foreground">Balance</p>
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
                <p className="text-2xl font-bold">{formatPKR(seller.wallet?.total_earnings || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Earnings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{seller.orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="kyc">KYC Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <SellerPerformanceCharts sellerId={seller.user_id} />
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          {seller.products?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products listed yet</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seller.products?.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.images?.[0] && (
                            <img 
                              src={product.images[0]} 
                              alt={product.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <span className="font-medium truncate max-w-[200px]">{product.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatPKR(product.price_pkr)}</TableCell>
                      <TableCell>{product.stock_count}</TableCell>
                      <TableCell>
                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          {seller.orders?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seller.orders?.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.order_number}</TableCell>
                      <TableCell>{format(new Date(order.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell>{formatPKR(order.total_amount_pkr)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.order_status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="wallet" className="mt-4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatPKR(seller.wallet?.current_balance || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                  <p className="text-xl font-semibold">
                    {formatPKR(seller.wallet?.total_withdrawn || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {seller.transactions?.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {seller.transactions?.map((tx: any) => (
                    <TableRow key={tx.id}>
                      <TableCell>{format(new Date(tx.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        <Badge variant={tx.net_amount >= 0 ? 'default' : 'secondary'}>
                          {tx.transaction_type}
                        </Badge>
                      </TableCell>
                      <TableCell className={tx.net_amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {tx.net_amount >= 0 ? '+' : ''}{formatPKR(tx.net_amount || 0)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{tx.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="kyc" className="mt-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* CNIC Front */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image size={16} />
                  CNIC Front
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seller.cnic_front_url ? (
                  <div className="relative group">
                    <img 
                      src={seller.cnic_front_url} 
                      alt="CNIC Front"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setViewingDocument({ url: seller.cnic_front_url, label: "CNIC Front" })}
                    >
                      <Eye size={14} className="mr-1" />
                      View Full
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Not uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* CNIC Back */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image size={16} />
                  CNIC Back
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seller.cnic_back_url ? (
                  <div className="relative group">
                    <img 
                      src={seller.cnic_back_url} 
                      alt="CNIC Back"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setViewingDocument({ url: seller.cnic_back_url, label: "CNIC Back" })}
                    >
                      <Eye size={14} className="mr-1" />
                      View Full
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Not uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Selfie */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Image size={16} />
                  Live Selfie
                </CardTitle>
              </CardHeader>
              <CardContent>
                {seller.selfie_url ? (
                  <div className="relative group">
                    <img 
                      src={seller.selfie_url} 
                      alt="Live Selfie"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <Button
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setViewingDocument({ url: seller.selfie_url, label: "Live Selfie" })}
                    >
                      <Eye size={14} className="mr-1" />
                      View Full
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-muted-foreground">Not uploaded</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Banking Info */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CreditCard size={16} />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Bank Name</p>
                  <p className="font-medium">{seller.bank_name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Account Title</p>
                  <p className="font-medium">{seller.account_title || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">IBAN</p>
                  <p className="font-mono text-sm">{seller.iban || "Not provided"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Full-size Document Viewer */}
      <Dialog open={!!viewingDocument} onOpenChange={() => setViewingDocument(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{viewingDocument?.label}</DialogTitle>
          </DialogHeader>
          {viewingDocument && (
            <img 
              src={viewingDocument.url} 
              alt={viewingDocument.label}
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSellerDetailPage;
