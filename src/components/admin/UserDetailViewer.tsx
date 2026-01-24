import { useState } from "react";
import { 
  User, Mail, Phone, Calendar, Package, Wallet, 
  FileText, Activity, ShieldCheck, LogIn, X, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserDetails } from "@/hooks/useAdminUsers";
import { useUserStaffRole } from "@/hooks/useRoleManagement";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatPKR = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-red-500 text-white">Admin</Badge>;
    case "seller":
      return <Badge className="bg-blue-500 text-white">Seller</Badge>;
    default:
      return <Badge variant="secondary">Customer</Badge>;
  }
};

interface UserDetailViewerProps {
  userId: string | null;
  onClose: () => void;
}

const UserDetailViewer = ({ userId, onClose }: UserDetailViewerProps) => {
  const { user, isLoading: isLoadingDetails } = useUserDetails(userId || "");
  const { data: staffRole } = useUserStaffRole(userId);
  
  // Fetch activity logs for this user
  const { data: activityLogs = [] } = useQuery({
    queryKey: ["user-activity-logs", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) {
        console.error("Error fetching activity logs:", error);
        return [];
      }
      return data;
    },
    enabled: !!userId,
  });
  
  // Fetch wallet transactions
  const { data: walletTransactions = [] } = useQuery({
    queryKey: ["user-wallet-transactions", userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from("customer_wallet_transactions")
        .select("*")
        .eq("customer_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (error) {
        console.error("Error fetching transactions:", error);
        return [];
      }
      return data;
    },
    enabled: !!userId,
  });
  
  const handleImpersonate = () => {
    // In a real implementation, this would create a secure impersonation session
    // For now, we show a placeholder message
    toast.info("Impersonation feature requires backend implementation for security");
  };
  
  if (!userId) return null;
  
  return (
    <Dialog open={!!userId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>User Profile Details</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          {isLoadingDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : user ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-20 w-20 shrink-0">
                  {user.avatar_url ? (
                    <AvatarImage
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="object-cover aspect-square"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {user.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{user.full_name}</h3>
                    {getRoleBadge(user.role)}
                    {staffRole?.role && (
                      <Badge variant="outline" className="border-primary text-primary">
                        {staffRole.role.name}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={14} />
                      <span className="truncate">{user.email}</span>
                    </div>
                    {user.phone_number && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone size={14} />
                        <span>{user.phone_number}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} />
                      <span>Joined {format(new Date(user.created_at), "MMMM dd, yyyy")}</span>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handleImpersonate} variant="outline" size="sm">
                  <LogIn size={16} className="mr-2" />
                  Login as User
                </Button>
              </div>
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full flex-wrap h-auto">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  {user.seller_profile && (
                    <TabsTrigger value="seller">Seller Info</TabsTrigger>
                  )}
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Package size={14} />
                          <span className="text-xs">Orders</span>
                        </div>
                        <p className="text-2xl font-bold">{user.orders?.length || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Wallet size={14} />
                          <span className="text-xs">Wallet</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {formatPKR(user.wallet?.balance || 0)}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Activity size={14} />
                          <span className="text-xs">Activity</span>
                        </div>
                        <p className="text-2xl font-bold">{activityLogs.length}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Wallet size={14} />
                          <span className="text-xs">Total Spent</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {formatPKR(user.orders?.reduce((sum: number, o: any) => sum + Number(o.total_amount_pkr || 0), 0) || 0)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="orders" className="mt-4">
                  {user.orders?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                  ) : (
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
                        {user.orders?.map((order: any) => (
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
                  )}
                </TabsContent>
                
                <TabsContent value="wallet" className="mt-4">
                  <Card className="mb-4">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Current Balance</p>
                          <p className="text-3xl font-bold text-green-600">
                            {formatPKR(user.wallet?.balance || 0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Refunds</p>
                          <p className="text-xl font-semibold">
                            {formatPKR(user.wallet?.total_refunds || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {walletTransactions.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No transactions yet</p>
                  ) : (
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
                        {walletTransactions.map((tx: any) => (
                          <TableRow key={tx.id}>
                            <TableCell>{format(new Date(tx.created_at), "MMM dd, yyyy")}</TableCell>
                            <TableCell>
                              <Badge variant={tx.transaction_type === 'refund' ? 'default' : 'secondary'}>
                                {tx.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell className={tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {tx.amount >= 0 ? '+' : ''}{formatPKR(tx.amount)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{tx.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                <TabsContent value="activity" className="mt-4">
                  {activityLogs.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No activity logs yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log: any) => (
                          <TableRow key={log.id}>
                            <TableCell>{format(new Date(log.created_at), "MMM dd, HH:mm")}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.action_type}</Badge>
                            </TableCell>
                            <TableCell>{log.action_category}</TableCell>
                            <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>
                
                {user.seller_profile && (
                  <TabsContent value="seller" className="mt-4 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                          <ShieldCheck size={16} />
                          Seller Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Shop Name</p>
                          <p className="font-medium">{user.seller_profile.shop_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Legal Name</p>
                          <p className="font-medium">{user.seller_profile.legal_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">City</p>
                          <p className="font-medium">{user.seller_profile.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Verification Status</p>
                          <Badge className={
                            user.seller_profile.verification_status === "verified"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }>
                            {user.seller_profile.verification_status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">CNIC Number</p>
                          <p className="font-medium">{user.seller_profile.cnic_number || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Bank</p>
                          <p className="font-medium">{user.seller_profile.bank_name || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* CNIC Images */}
                    {(user.seller_profile.cnic_front_url || user.seller_profile.cnic_back_url) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Identity Documents</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 gap-4">
                          {user.seller_profile.cnic_front_url && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">CNIC Front</p>
                              <img 
                                src={user.seller_profile.cnic_front_url} 
                                alt="CNIC Front" 
                                className="rounded-lg border max-h-40 object-contain"
                              />
                            </div>
                          )}
                          {user.seller_profile.cnic_back_url && (
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">CNIC Back</p>
                              <img 
                                src={user.seller_profile.cnic_back_url} 
                                alt="CNIC Back" 
                                className="rounded-lg border max-h-40 object-contain"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Seller Wallet */}
                    {user.seller_wallet && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Seller Wallet</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Current Balance</p>
                            <p className="text-2xl font-bold text-green-600">
                              {formatPKR(user.seller_wallet.current_balance || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Earnings</p>
                            <p className="text-xl font-semibold">
                              {formatPKR(user.seller_wallet.total_earnings || 0)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Withdrawn</p>
                            <p className="text-xl font-semibold">
                              {formatPKR(user.seller_wallet.total_withdrawn || 0)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                )}
              </Tabs>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailViewer;
