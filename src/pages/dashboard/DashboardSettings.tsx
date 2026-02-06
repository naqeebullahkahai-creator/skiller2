import { useState, useEffect } from "react";
import { Bell, Lock, Store, User, Globe, Save, Wrench, AlertTriangle, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDashboard } from "@/contexts/DashboardContext";
import { useToast } from "@/hooks/use-toast";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import SystemAnnouncementManager from "@/components/admin/SystemAnnouncementManager";

const DashboardSettings = () => {
  const { role } = useDashboard();
  const { toast } = useToast();
  const { isMaintenanceMode, toggleMaintenanceMode, isLoading: isMaintenanceLoading } = useMaintenanceMode();
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false);
  const [pendingMaintenanceState, setPendingMaintenanceState] = useState(false);
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    sellerApprovals: true,
  });

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    });
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    setPendingMaintenanceState(checked);
    setShowMaintenanceConfirm(true);
  };

  const confirmMaintenanceToggle = () => {
    toggleMaintenanceMode.mutate(pendingMaintenanceState);
    setShowMaintenanceConfirm(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and {role === "admin" ? "store" : "seller"} settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profile" className="gap-2">
            <User size={16} />
            Profile
          </TabsTrigger>
          {role === "seller" && (
            <TabsTrigger value="store" className="gap-2">
              <Store size={16} />
              Store
            </TabsTrigger>
          )}
          <TabsTrigger value="notifications" className="gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock size={16} />
            Security
          </TabsTrigger>
          {role === "admin" && (
            <TabsTrigger value="general" className="gap-2">
              <Globe size={16} />
              General
            </TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                  <User size={32} className="text-primary" />
                </div>
                <Button variant="outline">Change Photo</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={role === "admin" ? "Admin" : "TechZone"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={role === "admin" ? "User" : "Store"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@fanzon.pk" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" defaultValue="+92 300 1234567" />
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Save size={16} />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Store Tab (Seller Only) */}
        {role === "seller" && (
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle>Store Settings</CardTitle>
                <CardDescription>Configure your seller store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input id="storeName" defaultValue="TechZone Store" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    rows={4}
                    defaultValue="Your one-stop shop for all tech gadgets and electronics."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input id="businessAddress" defaultValue="Karachi, Pakistan" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="returnPolicy">Return Policy (Days)</Label>
                    <Select defaultValue="7">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 Days</SelectItem>
                        <SelectItem value="7">7 Days</SelectItem>
                        <SelectItem value="14">14 Days</SelectItem>
                        <SelectItem value="30">30 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleSave} className="gap-2">
                  <Save size={16} />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Order Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new orders and status changes
                  </p>
                </div>
                <Switch
                  checked={notifications.orderUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, orderUpdates: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotional Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about promotions and marketing
                  </p>
                </div>
                <Switch
                  checked={notifications.promotions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, promotions: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New Products</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new products are added
                  </p>
                </div>
                <Switch
                  checked={notifications.newProducts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newProducts: checked })
                  }
                />
              </div>
              {role === "admin" && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Seller Approvals</p>
                    <p className="text-sm text-muted-foreground">
                      Notifications for pending seller applications
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sellerApprovals}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, sellerApprovals: checked })
                    }
                  />
                </div>
              )}
              <Button onClick={handleSave} className="gap-2">
                <Save size={16} />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your password and security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              <Button onClick={handleSave} className="gap-2">
                <Lock size={16} />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Tab (Admin Only) */}
        {role === "admin" && (
          <TabsContent value="general">
            <div className="space-y-6">
              {/* System Announcement */}
              <SystemAnnouncementManager />

              {/* Maintenance Mode Card */}
              <Card className={isMaintenanceMode ? "border-destructive" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench size={20} />
                    Maintenance Mode
                    {isMaintenanceMode && (
                      <Badge variant="destructive">ACTIVE</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    When enabled, all non-admin users will see a maintenance page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Enable Maintenance Mode</p>
                      <p className="text-sm text-muted-foreground">
                        Temporarily disable the storefront for all users
                      </p>
                    </div>
                    <Switch
                      checked={isMaintenanceMode}
                      onCheckedChange={handleMaintenanceToggle}
                      disabled={isMaintenanceLoading || toggleMaintenanceMode.isPending}
                    />
                  </div>
                  
                  {isMaintenanceMode && (
                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="text-destructive shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-medium text-destructive">Maintenance Mode is Active</p>
                        <p className="text-sm text-muted-foreground">
                          All customers and sellers are currently seeing the maintenance page. 
                          Only super admins can access the dashboard.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* General Store Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>General Store Settings</CardTitle>
                  <CardDescription>Configure global store settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select defaultValue="pkr">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pkr">PKR (Rs.)</SelectItem>
                          <SelectItem value="usd">USD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select defaultValue="pkt">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pkt">Pakistan Time (PKT)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleSave} className="gap-2">
                    <Save size={16} />
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Maintenance Mode Confirmation Dialog */}
      <AlertDialog open={showMaintenanceConfirm} onOpenChange={setShowMaintenanceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Wrench size={20} />
              {pendingMaintenanceState ? "Enable Maintenance Mode?" : "Disable Maintenance Mode?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingMaintenanceState 
                ? "This will immediately redirect all customers and sellers to the maintenance page. Only super admins will be able to access the site."
                : "This will restore normal access to all users. The storefront will be fully operational."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmMaintenanceToggle}
              className={pendingMaintenanceState ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {pendingMaintenanceState ? "Enable Maintenance" : "Disable Maintenance"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardSettings;
