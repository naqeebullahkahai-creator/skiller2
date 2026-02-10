import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, Calendar, AlertTriangle, Check, X, DollarSign, Save, Users } from "lucide-react";
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
    updateSellerSubscription,
    triggerManualDeduction,
    pendingPaymentsCount,
    totalPendingAmount,
  } = useAdminSubscriptions();

  const { sellerProfiles } = useAdminSellerProfiles();

  const [dailyFee, setDailyFee] = useState<number>(25);
  const [monthlyFee, setMonthlyFee] = useState<number>(600);
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
    <div className="space-y-4">
      {/* Global Fees Card - Simple */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Platform Fees
          </CardTitle>
          <CardDescription>Set fees charged to all sellers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Daily Fee (PKR)</Label>
              <Input
                type="number"
                value={dailyFee}
                onChange={(e) => { setDailyFee(parseFloat(e.target.value) || 0); setHasChanges(true); }}
                min={0}
                step={1}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Monthly Fee (PKR)</Label>
              <Input
                type="number"
                value={monthlyFee}
                onChange={(e) => { setMonthlyFee(parseFloat(e.target.value) || 0); setHasChanges(true); }}
                min={0}
                step={1}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
            <span className="text-muted-foreground">Monthly saves sellers</span>
            <span className="font-semibold text-green-600">{formatPKR((dailyFee * 30) - monthlyFee)}</span>
          </div>

          {hasChanges && (
            <Button onClick={handleSaveGlobalFees} disabled={updateGlobalFees.isPending} className="w-full sm:w-auto">
              {updateGlobalFees.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Fees
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3">
          <div className="text-center">
            <p className="text-2xl font-bold">{subscriptions?.filter(s => s.is_active).length ?? 0}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </Card>
        <Card className={`p-3 ${pendingPaymentsCount > 0 ? 'border-destructive' : ''}`}>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{pendingPaymentsCount}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-center">
            <p className="text-2xl font-bold">{formatPKR(totalPendingAmount)}</p>
            <p className="text-xs text-muted-foreground">Owed</p>
          </div>
        </Card>
      </div>

      {/* Seller List - Simple Cards */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Seller Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscriptionsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
          ) : !subscriptions || subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No seller subscriptions yet</p>
          ) : (
            <div className="space-y-2">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{getSellerName(sub.seller_id)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] h-5">
                        {sub.subscription_type}
                      </Badge>
                      {sub.payment_pending ? (
                        <Badge variant="destructive" className="text-[10px] h-5">
                          <AlertTriangle className="h-2.5 w-2.5 mr-0.5" />
                          {formatPKR(sub.pending_amount)}
                        </Badge>
                      ) : sub.is_active ? (
                        <Badge className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-200">
                          <Check className="h-2.5 w-2.5 mr-0.5" />Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          <X className="h-2.5 w-2.5 mr-0.5" />Off
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        Paid: {formatPKR(sub.total_fees_paid)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleEditSeller(sub.seller_id)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => triggerManualDeduction.mutate(sub.seller_id)}
                      disabled={triggerManualDeduction.isPending}
                    >
                      {triggerManualDeduction.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Deduct'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Seller Dialog */}
      <Dialog open={!!editingSeller} onOpenChange={() => setEditingSeller(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Seller Fee</DialogTitle>
            <DialogDescription>Override global fees for this seller</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Billing Type</Label>
              <Select value={sellerSubType} onValueChange={(v) => setSellerSubType(v as 'daily' | 'monthly')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Custom Daily Fee (PKR)</Label>
              <Input type="number" value={sellerCustomDaily} onChange={(e) => setSellerCustomDaily(e.target.value)} placeholder={`Global: ${globalFees?.daily ?? 25}`} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Custom Monthly Fee (PKR)</Label>
              <Input type="number" value={sellerCustomMonthly} onChange={(e) => setSellerCustomMonthly(e.target.value)} placeholder={`Global: ${globalFees?.monthly ?? 600}`} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingSeller(null)}>Cancel</Button>
            <Button size="sm" onClick={handleSaveSellerSettings} disabled={updateSellerSubscription.isPending}>
              {updateSellerSubscription.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptionSettings;
