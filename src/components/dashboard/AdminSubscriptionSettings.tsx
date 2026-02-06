import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Calendar, Settings, AlertTriangle, Check, X, CreditCard, DollarSign, Save, Users, History } from "lucide-react";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useAdminSellerProfiles } from "@/hooks/useAdminSellerProfiles";
import { formatPKR } from "@/hooks/useSellerWallet";
import { format } from "date-fns";

const AdminSubscriptionSettings = () => {
  const {
    globalFees,
    feesLoading,
    updateGlobalFees,
    subscriptions,
    subscriptionsLoading,
    deductionLogs,
    logsLoading,
    updateSellerSubscription,
    triggerManualDeduction,
    pendingPaymentsCount,
    totalPendingAmount,
  } = useAdminSubscriptions();

  const { sellerProfiles } = useAdminSellerProfiles();

  const [dailyFee, setDailyFee] = useState<number>(20);
  const [monthlyFee, setMonthlyFee] = useState<number>(500);
  const [hasChanges, setHasChanges] = useState(false);

  // Edit seller modal state
  const [editingSeller, setEditingSeller] = useState<string | null>(null);
  const [sellerCustomDaily, setSellerCustomDaily] = useState<string>("");
  const [sellerCustomMonthly, setSellerCustomMonthly] = useState<string>("");
  const [sellerSubType, setSellerSubType] = useState<'daily' | 'monthly'>('daily');

  useEffect(() => {
    if (globalFees) {
      setDailyFee(globalFees.daily);
      setMonthlyFee(globalFees.monthly);
    }
  }, [globalFees]);

  const handleSaveGlobalFees = async () => {
    await updateGlobalFees.mutateAsync({ dailyFee, monthlyFee });
    setHasChanges(false);
  };

  const handleEditSeller = (sellerId: string) => {
    const sub = subscriptions?.find(s => s.seller_id === sellerId);
    setEditingSeller(sellerId);
    setSellerCustomDaily(sub?.custom_daily_fee?.toString() ?? "");
    setSellerCustomMonthly(sub?.custom_monthly_fee?.toString() ?? "");
    setSellerSubType(sub?.subscription_type ?? 'daily');
  };

  const handleSaveSellerSettings = async () => {
    if (!editingSeller) return;
    
    await updateSellerSubscription.mutateAsync({
      sellerId: editingSeller,
      customDailyFee: sellerCustomDaily ? parseFloat(sellerCustomDaily) : null,
      customMonthlyFee: sellerCustomMonthly ? parseFloat(sellerCustomMonthly) : null,
      subscriptionType: sellerSubType,
    });
    
    setEditingSeller(null);
  };

  const getSellerName = (sellerId: string) => {
    const seller = sellerProfiles?.find(p => p.user_id === sellerId);
    return seller?.shop_name || seller?.legal_name || 'Unknown Seller';
  };

  if (feesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daily Fee</p>
                <p className="text-2xl font-bold">{formatPKR(globalFees?.daily ?? 0)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Fee</p>
                <p className="text-2xl font-bold">{formatPKR(globalFees?.monthly ?? 0)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{subscriptions?.filter(s => s.is_active).length ?? 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={pendingPaymentsCount > 0 ? "border-destructive" : ""}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-destructive">{pendingPaymentsCount}</p>
                <p className="text-xs text-muted-foreground">{formatPKR(totalPendingAmount)}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Global Settings
          </TabsTrigger>
          <TabsTrigger value="sellers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Seller Subscriptions
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Deduction Logs
          </TabsTrigger>
        </TabsList>

        {/* Global Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Platform Subscription Fees
              </CardTitle>
              <CardDescription>
                Set the global platform fees that will be charged to all sellers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Daily Platform Fee (PKR)</Label>
                  <Input
                    type="number"
                    value={dailyFee}
                    onChange={(e) => {
                      setDailyFee(parseFloat(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    min={0}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Amount charged to sellers every 24 hours
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Monthly Platform Fee (PKR)</Label>
                  <Input
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => {
                      setMonthlyFee(parseFloat(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    min={0}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Discounted rate for monthly billing (charged every 30 days)
                  </p>
                </div>
              </div>

              {/* Savings preview */}
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-3">Billing Comparison</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Daily × 30 days</p>
                    <p className="font-medium">{formatPKR(dailyFee * 30)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Monthly Rate</p>
                    <p className="font-medium text-green-500">{formatPKR(monthlyFee)}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Sellers save {formatPKR((dailyFee * 30) - monthlyFee)} with monthly billing
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleSaveGlobalFees}
                  disabled={!hasChanges || updateGlobalFees.isPending}
                >
                  {updateGlobalFees.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Seller Subscriptions Tab */}
        <TabsContent value="sellers">
          <Card>
            <CardHeader>
              <CardTitle>Seller Subscriptions</CardTitle>
              <CardDescription>
                Manage individual seller subscription settings and override global fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Custom Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Deduction</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions?.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">
                          {getSellerName(sub.seller_id)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {sub.subscription_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sub.subscription_type === 'daily' 
                            ? (sub.custom_daily_fee ? formatPKR(sub.custom_daily_fee) : 'Global')
                            : (sub.custom_monthly_fee ? formatPKR(sub.custom_monthly_fee) : 'Global')
                          }
                        </TableCell>
                        <TableCell>
                          {sub.payment_pending ? (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" />
                              Pending ({formatPKR(sub.pending_amount)})
                            </Badge>
                          ) : sub.is_active ? (
                            <Badge variant="default" className="flex items-center gap-1 w-fit">
                              <Check className="h-3 w-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                              <X className="h-3 w-3" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {sub.next_deduction_at 
                            ? format(new Date(sub.next_deduction_at), 'dd MMM yyyy HH:mm')
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{formatPKR(sub.total_fees_paid)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSeller(sub.seller_id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => triggerManualDeduction.mutate(sub.seller_id)}
                              disabled={triggerManualDeduction.isPending}
                            >
                              {triggerManualDeduction.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Deduct Now'
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!subscriptions || subscriptions.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No seller subscriptions found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deduction Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Deduction History</CardTitle>
              <CardDescription>
                View all subscription fee deductions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Balance Before</TableHead>
                      <TableHead>Balance After</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deductionLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {format(new Date(log.created_at), 'dd MMM yyyy HH:mm')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {getSellerName(log.seller_id)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.deduction_type}</Badge>
                        </TableCell>
                        <TableCell>{formatPKR(log.amount)}</TableCell>
                        <TableCell>
                          {log.status === 'success' ? (
                            <Badge variant="default" className="flex items-center gap-1 w-fit">
                              <Check className="h-3 w-3" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                              <X className="h-3 w-3" />
                              Failed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatPKR(log.wallet_balance_before)}</TableCell>
                        <TableCell>{formatPKR(log.wallet_balance_after)}</TableCell>
                      </TableRow>
                    ))}
                    {(!deductionLogs || deductionLogs.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No deduction logs found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Seller Dialog */}
      <Dialog open={!!editingSeller} onOpenChange={() => setEditingSeller(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Seller Subscription</DialogTitle>
            <DialogDescription>
              Override global fees for this specific seller
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subscription Type</Label>
              <Select value={sellerSubType} onValueChange={(v) => setSellerSubType(v as 'daily' | 'monthly')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Custom Daily Fee (PKR)</Label>
              <Input
                type="number"
                value={sellerCustomDaily}
                onChange={(e) => setSellerCustomDaily(e.target.value)}
                placeholder={`Global: ${globalFees?.daily ?? 20}`}
              />
              <p className="text-xs text-muted-foreground">Leave empty to use global rate</p>
            </div>
            
            <div className="space-y-2">
              <Label>Custom Monthly Fee (PKR)</Label>
              <Input
                type="number"
                value={sellerCustomMonthly}
                onChange={(e) => setSellerCustomMonthly(e.target.value)}
                placeholder={`Global: ${globalFees?.monthly ?? 500}`}
              />
              <p className="text-xs text-muted-foreground">Leave empty to use global rate</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingSeller(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSellerSettings}
              disabled={updateSellerSubscription.isPending}
            >
              {updateSellerSubscription.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptionSettings;
