import { useState, useEffect } from "react";
import { Bell, Lock, Store, User, Save, MapPin, CreditCard, Phone, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSellerKyc } from "@/hooks/useSellerKyc";
import { supabase } from "@/integrations/supabase/client";

const SellerSettingsPage = () => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const { sellerProfile, isLoading: kycLoading } = useSellerKyc();
  
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newProducts: true,
    lowStock: true,
  });
  
  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeDescription: "",
    businessAddress: "",
    city: "",
    contactPhone: "",
    contactEmail: "",
    returnPolicy: "7",
  });
  
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountTitle: "",
    iban: "",
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // Load seller profile data
  useEffect(() => {
    if (sellerProfile) {
      setStoreSettings({
        storeName: sellerProfile.shop_name || "",
        storeDescription: "",
        businessAddress: sellerProfile.business_address || "",
        city: sellerProfile.city || "",
        contactPhone: profile?.phone_number || "",
        contactEmail: profile?.email || "",
        returnPolicy: "7",
      });
      
      setBankDetails({
        bankName: sellerProfile.bank_name || "",
        accountTitle: sellerProfile.account_title || "",
        iban: sellerProfile.iban || "",
      });
    }
  }, [sellerProfile, profile]);

  const handleSaveStore = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Update seller profile with store settings
      const { error } = await supabase
        .from("seller_profiles")
        .update({
          shop_name: storeSettings.storeName,
          business_address: storeSettings.businessAddress,
          city: storeSettings.city,
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Store Settings Saved",
        description: "Your store information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save store settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBank = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    try {
      // Update bank details
      const { error } = await supabase
        .from("seller_profiles")
        .update({
          bank_name: bankDetails.bankName,
          account_title: bankDetails.accountTitle,
          iban: bankDetails.iban,
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Bank Details Saved",
        description: "Your bank information has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save bank details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Preferences Saved",
      description: "Your notification settings have been updated.",
    });
  };

  if (kycLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Seller Settings</h1>
        <p className="text-muted-foreground">
          Manage your store profile, contact info, and bank details
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
          <TabsTrigger value="store" className="gap-2">
            <Store size={16} />
            Store
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone size={16} />
            Contact
          </TabsTrigger>
          <TabsTrigger value="bank" className="gap-2">
            <CreditCard size={16} />
            Bank
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell size={16} />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock size={16} />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Store Tab */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 size={20} />
                Store Information
              </CardTitle>
              <CardDescription>Configure your store profile visible to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input 
                  id="storeName" 
                  value={storeSettings.storeName}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="Your Store Name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeDescription">Store Description</Label>
                <Textarea
                  id="storeDescription"
                  rows={4}
                  value={storeSettings.storeDescription}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, storeDescription: e.target.value }))}
                  placeholder="Describe your store and what you sell..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="returnPolicy">Return Policy</Label>
                <Select 
                  value={storeSettings.returnPolicy}
                  onValueChange={(value) => setStoreSettings(prev => ({ ...prev, returnPolicy: value }))}
                >
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
              <Button onClick={handleSaveStore} disabled={isSaving} className="gap-2">
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Store Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact / Pickup Address Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                Contact & Pickup Address
              </CardTitle>
              <CardDescription>Your business contact information and pickup location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input 
                    id="contactPhone"
                    value={storeSettings.contactPhone}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="+92 300 1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input 
                    id="contactEmail"
                    type="email"
                    value={storeSettings.contactEmail}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="business@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Pickup Address *</Label>
                <Textarea 
                  id="businessAddress"
                  rows={2}
                  value={storeSettings.businessAddress}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, businessAddress: e.target.value }))}
                  placeholder="Enter your complete business/pickup address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city"
                  value={storeSettings.city}
                  onChange={(e) => setStoreSettings(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Karachi"
                />
              </div>
              <Button onClick={handleSaveStore} disabled={isSaving} className="gap-2">
                <Save size={16} />
                {isSaving ? "Saving..." : "Save Contact Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bank Details Tab */}
        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard size={20} />
                Bank Details
              </CardTitle>
              <CardDescription>Your bank account for receiving payouts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning-foreground">
                <strong>Important:</strong> Changes to bank details require KYC re-verification for security purposes.
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input 
                  id="bankName"
                  value={bankDetails.bankName}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g., HBL, MCB, UBL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountTitle">Account Title</Label>
                <Input 
                  id="accountTitle"
                  value={bankDetails.accountTitle}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, accountTitle: e.target.value }))}
                  placeholder="Name on bank account"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="iban">IBAN</Label>
                <Input 
                  id="iban"
                  value={bankDetails.iban}
                  onChange={(e) => setBankDetails(prev => ({ ...prev, iban: e.target.value }))}
                  placeholder="PK00XXXX0000000000000000"
                />
              </div>
              <Button onClick={handleSaveBank} disabled={isSaving} className="gap-2">
                <Save size={16} />
                {isSaving ? "Saving..." : "Update Bank Details"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

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
                  <p className="font-medium">Low Stock Alerts</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified when products are running low on stock
                  </p>
                </div>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, lowStock: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Promotional Emails</p>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about promotions and marketing opportunities
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
                  <p className="font-medium">New Product Features</p>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new seller features and updates
                  </p>
                </div>
                <Switch
                  checked={notifications.newProducts}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, newProducts: checked })
                  }
                />
              </div>
              <Button onClick={handleSaveNotifications} className="gap-2">
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
              <CardDescription>Manage your password and account security</CardDescription>
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
              <Button className="gap-2">
                <Lock size={16} />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerSettingsPage;
