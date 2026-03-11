import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FanzonSpinner } from "@/components/ui/fanzon-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft, User, Mail, Phone, Calendar, Package, Wallet,
  ShoppingCart, MapPin, Heart, Bell, Eye, ShieldAlert
} from "lucide-react";
import { format } from "date-fns";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

interface UserData {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  created_at: string;
  display_id: string | null;
  role: string;
  orders: any[];
  wallet: { balance: number; total_refunds: number; total_spent: number } | null;
  addresses: any[];
  wishlist: any[];
  notifications: any[];
  seller_profile?: any;
  seller_wallet?: { current_balance: number; total_earnings: number; total_withdrawn: number } | null;
}

const AdminViewAsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isSuperAdmin } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userId || !isSuperAdmin) return;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        // Fetch profile, role, orders, wallet, addresses, wishlist, notifications in parallel
        const [profileRes, roleRes, ordersRes, walletRes, addressRes, wishlistRes, notifsRes, sellerProfileRes, sellerWalletRes] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
          supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
          supabase.from("orders").select("*").eq("customer_id", userId).order("created_at", { ascending: false }).limit(50),
          supabase.from("customer_wallets").select("*").eq("customer_id", userId).maybeSingle(),
          supabase.from("user_addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false }),
          supabase.from("wishlists").select("*, product:products(id, title, price_pkr, images)").eq("user_id", userId).limit(50),
          supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
          supabase.from("seller_profiles").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("seller_wallets").select("*").eq("seller_id", userId).maybeSingle(),
        ]);

        if (!profileRes.data) {
          setUserData(null);
          setIsLoading(false);
          return;
        }

        setUserData({
          ...profileRes.data,
          role: roleRes.data?.role || "customer",
          orders: ordersRes.data || [],
          wallet: walletRes.data ? {
            balance: walletRes.data.balance,
            total_refunds: walletRes.data.total_refunds,
            total_spent: walletRes.data.total_spent,
          } : null,
          addresses: addressRes.data || [],
          wishlist: wishlistRes.data || [],
          notifications: notifsRes.data || [],
          seller_profile: sellerProfileRes.data,
          seller_wallet: sellerWalletRes.data ? {
            current_balance: sellerWalletRes.data.current_balance,
            total_earnings: sellerWalletRes.data.total_earnings,
            total_withdrawn: sellerWalletRes.data.total_withdrawn,
          } : null,
        });
      } catch (err) {
        console.error("Error loading user data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [userId, isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only Super Admins can use this feature.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <FanzonSpinner size="lg" />
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">Loading user data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">User Not Found</h2>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const roleBadge = {
    admin: <Badge className="bg-red-500 text-white">Admin</Badge>,
    seller: <Badge className="bg-blue-500 text-white">Seller</Badge>,
    support_agent: <Badge className="bg-purple-500 text-white">Agent</Badge>,
    customer: <Badge variant="secondary">Customer</Badge>,
  }[userData.role] || <Badge variant="secondary">{userData.role}</Badge>;

  const isSeller = userData.role === "seller";

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Banner */}
      <div className="sticky top-0 z-50 bg-destructive/10 border-b border-destructive/20 px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-destructive" />
            <span className="font-medium text-destructive">Admin View Mode</span>
            <span className="text-muted-foreground">— Viewing as <strong>{userData.full_name}</strong></span>
          </div>
          <Button variant="outline" size="sm" onClick={() => window.close()} className="gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Close Tab
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Avatar className="h-20 w-20 shrink-0">
                {userData.avatar_url && <AvatarImage src={userData.avatar_url} alt={userData.full_name} className="object-cover" />}
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {userData.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">{userData.full_name}</h1>
                  {roleBadge}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Mail size={14} />{userData.email}</div>
                  {userData.phone_number && <div className="flex items-center gap-2"><Phone size={14} />{userData.phone_number}</div>}
                  <div className="flex items-center gap-2"><Calendar size={14} />Joined {format(new Date(userData.created_at), "MMM dd, yyyy")}</div>
                  {userData.display_id && <div className="flex items-center gap-2"><User size={14} />{userData.display_id}</div>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{userData.orders.length}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Wallet className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{formatPKR(isSeller ? (userData.seller_wallet?.current_balance || 0) : (userData.wallet?.balance || 0))}</p>
              <p className="text-xs text-muted-foreground">{isSeller ? "Seller Balance" : "Wallet"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Heart className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{userData.wishlist.length}</p>
              <p className="text-xs text-muted-foreground">Wishlist</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <MapPin className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{userData.addresses.length}</p>
              <p className="text-xs text-muted-foreground">Addresses</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="w-full flex-wrap h-auto">
            <TabsTrigger value="orders">Orders ({userData.orders.length})</TabsTrigger>
            <TabsTrigger value="addresses">Addresses</TabsTrigger>
            <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {isSeller && <TabsTrigger value="seller">Seller Info</TabsTrigger>}
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="mt-4">
            {userData.orders.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No orders found</CardContent></Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userData.orders.map((order: any) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">#{order.order_number}</TableCell>
                          <TableCell>{format(new Date(order.created_at), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{formatPKR(order.total_amount_pkr)}</TableCell>
                          <TableCell><Badge variant="outline">{order.order_status}</Badge></TableCell>
                          <TableCell><Badge variant="secondary">{order.payment_method}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="mt-4">
            {userData.addresses.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No addresses saved</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userData.addresses.map((addr: any) => (
                  <Card key={addr.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold">{addr.label || "Address"}</h4>
                        {addr.is_default && <Badge className="bg-primary text-primary-foreground">Default</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{addr.full_name}</p>
                      <p className="text-sm text-muted-foreground">{addr.address_line1}</p>
                      {addr.address_line2 && <p className="text-sm text-muted-foreground">{addr.address_line2}</p>}
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postal_code}</p>
                      {addr.phone && <p className="text-sm text-muted-foreground mt-1">📞 {addr.phone}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="mt-4">
            {userData.wishlist.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">Wishlist is empty</CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userData.wishlist.map((item: any) => (
                  <Card key={item.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      {item.product?.images?.[0] && (
                        <img src={item.product.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.product?.title || "Product"}</p>
                        <p className="text-primary font-semibold">{formatPKR(item.product?.price_pkr || 0)}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-4">
            {userData.notifications.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No notifications</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {userData.notifications.map((notif: any) => (
                  <Card key={notif.id}>
                    <CardContent className="p-3 flex items-start gap-3">
                      <Bell className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{format(new Date(notif.created_at), "MMM dd, yyyy HH:mm")}</p>
                      </div>
                      {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Seller Info Tab */}
          {isSeller && userData.seller_profile && (
            <TabsContent value="seller" className="mt-4 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-base">Business Information</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Business Name</p>
                      <p className="font-medium">{userData.seller_profile.business_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Verification</p>
                      <Badge className={userData.seller_profile.verification_status === "verified" ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                        {userData.seller_profile.verification_status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Store Name</p>
                      <p className="font-medium">{userData.seller_profile.store_name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">City</p>
                      <p className="font-medium">{userData.seller_profile.city || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {userData.seller_wallet && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Seller Wallet</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-600">{formatPKR(userData.seller_wallet.current_balance)}</p>
                        <p className="text-xs text-muted-foreground">Balance</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatPKR(userData.seller_wallet.total_earnings)}</p>
                        <p className="text-xs text-muted-foreground">Earnings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{formatPKR(userData.seller_wallet.total_withdrawn)}</p>
                        <p className="text-xs text-muted-foreground">Withdrawn</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminViewAsPage;
