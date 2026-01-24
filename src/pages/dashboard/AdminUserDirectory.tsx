import { useState } from "react";
import { Search, User, Store, Eye, Package, Wallet, Calendar, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminUsers, useUserDetails } from "@/hooks/useAdminUsers";
import { format } from "date-fns";

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

const AdminUserDirectory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { users, isLoading } = useAdminUsers(searchQuery);
  const { user: selectedUser, isLoading: isLoadingDetails } = useUserDetails(selectedUserId || "");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Directory</h1>
          <p className="text-muted-foreground">View and manage all users and sellers</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
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
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Store className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === "seller").length}
                </p>
                <p className="text-xs text-muted-foreground">Sellers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {users.reduce((sum, u) => sum + u.orders_count, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Wallet className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatPKR(users.reduce((sum, u) => sum + u.total_spent, 0))}
                </p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
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
                    <TableCell><Skeleton className="h-10 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          {user.avatar_url ? (
                            <AvatarImage
                              src={user.avatar_url}
                              alt={user.full_name}
                              className="object-cover aspect-square"
                            />
                          ) : null}
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="hidden md:table-cell">{user.orders_count}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatPKR(user.total_spent)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatPKR(user.wallet_balance)}</TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUserId(user.id)}
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

      {/* User Details Dialog */}
      <Dialog open={!!selectedUserId} onOpenChange={() => setSelectedUserId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
          </DialogHeader>

          {isLoadingDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-6">
              {/* User Header */}
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <Avatar className="h-16 w-16 shrink-0">
                  {selectedUser.avatar_url ? (
                    <AvatarImage
                      src={selectedUser.avatar_url}
                      alt={selectedUser.full_name}
                      className="object-cover aspect-square"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {selectedUser.full_name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold">{selectedUser.full_name}</h3>
                    {getRoleBadge(selectedUser.role)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Mail size={14} />
                    <span>{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone_number && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} />
                      <span>{selectedUser.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={14} />
                    <span>Joined {format(new Date(selectedUser.created_at), "MMMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="orders" className="flex-1">Orders</TabsTrigger>
                  {selectedUser.seller_profile && (
                    <TabsTrigger value="seller" className="flex-1">Seller Info</TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{selectedUser.orders?.length || 0}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Wallet Balance</p>
                        <p className="text-2xl font-bold">
                          {formatPKR(selectedUser.wallet?.balance || 0)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  {selectedUser.orders?.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.orders?.map((order: any) => (
                        <Card key={order.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium">#{order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(order.created_at), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{formatPKR(order.total_amount_pkr)}</p>
                              <Badge variant="outline">{order.order_status}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {selectedUser.seller_profile && (
                  <TabsContent value="seller" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Seller Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shop Name</span>
                          <span className="font-medium">{selectedUser.seller_profile.shop_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">City</span>
                          <span>{selectedUser.seller_profile.city}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <Badge className={
                            selectedUser.seller_profile.verification_status === "verified"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }>
                            {selectedUser.seller_profile.verification_status}
                          </Badge>
                        </div>
                        {selectedUser.seller_wallet && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Earnings Balance</span>
                              <span className="font-medium text-green-600">
                                {formatPKR(selectedUser.seller_wallet.balance || 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Total Earnings</span>
                              <span>{formatPKR(selectedUser.seller_wallet.total_earnings || 0)}</span>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUserDirectory;
