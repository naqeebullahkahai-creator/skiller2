import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Loader2, AlertTriangle, Check, X, DollarSign, Save, Users, Ban, Clock, ArrowRightLeft, Gift } from "lucide-react";
import { useAdminSubscriptions } from "@/hooks/useAdminSubscriptions";
import { useAdminSellerProfiles } from "@/hooks/useAdminSellerProfiles";
import { formatPKR } from "@/hooks/useSellerWallet";
import { PLAN_LABELS } from "@/hooks/useSellerSubscription";
import { format } from "date-fns";

const AdminSubscriptionSettings = () => {
  const {
    globalFees, feesLoading, updateGlobalFees,
    subscriptions, subscriptionsLoading,
    deductionLogs, logsLoading,
    planChangeRequests,
    updateSellerSubscription, triggerManualDeduction,
    approvePlanChange, rejectPlanChange,
    pendingPaymentsCount, suspendedCount, totalPendingAmount,
  } = useAdminSubscriptions();

  const { sellerProfiles } = useAdminSellerProfiles();

  const [perDayFee, setPerDayFee] = useState(25);
  const [freeMonths, setFreeMonths] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingSeller, setEditingSeller] = useState<string | null>(null);
  const [sellerCustomFee, setSellerCustomFee] = useState("");
  const [sellerPlan, setSellerPlan] = useState("daily");

  useEffect(() => {
    if (globalFees) {
      setPerDayFee(globalFees.perDay);
      setFreeMonths(globalFees.freeMonths);
    }
  }, [globalFees]);

  const handleSave = async () => {
    await updateGlobalFees.mutateAsync({ perDayFee, freeMonths });
    setHasChanges(false);
  };

  const handleEditSeller = (sellerId: string) => {
    const sub = subscriptions?.find(s => s.seller_id === sellerId);
    setEditingSeller(sellerId);
    setSellerCustomFee(sub?.custom_daily_fee?.toString() ?? "");
    setSellerPlan(sub?.plan_type ?? "daily");
  };

  const handleSaveSellerSettings = async () => {
    if (!editingSeller) return;
    await updateSellerSubscription.mutateAsync({
      sellerId: editingSeller,
      customDailyFee: sellerCustomFee ? parseFloat(sellerCustomFee) : null,
      planType: sellerPlan,
    });
    setEditingSeller(null);
  };

  const getSellerName = (sellerId: string) => {
    const seller = sellerProfiles?.find(p => p.user_id === sellerId);
    return seller?.shop_name || seller?.legal_name || sellerId.slice(0, 8);
  };

  if (feesLoading) {
    return <div className="flex items-center justify-center min-h-[200px]"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Fee Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Per Day Fee (Base Rate)
          </CardTitle>
          <CardDescription>All plans are calculated from this single per-day rate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Per Day Fee (PKR)</Label>
              <Input type="number" value={perDayFee} onChange={(e) => { setPerDayFee(parseFloat(e.target.value) || 0); setHasChanges(true); }} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1"><Gift className="w-3.5 h-3.5" /> Free Months for New Sellers</Label>
              <Input type="number" value={freeMonths} onChange={(e) => { setFreeMonths(parseInt(e.target.value) || 0); setHasChanges(true); }} min={0} max={12} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-muted rounded-lg text-sm">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Daily</p>
              <p className="font-bold">{formatPKR(perDayFee)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">15-Day</p>
              <p className="font-bold">{formatPKR(perDayFee * 15)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Monthly</p>
              <p className="font-bold">{formatPKR(perDayFee * 30)}</p>
            </div>
          </div>

          {hasChanges && (
            <Button onClick={handleSave} disabled={updateGlobalFees.isPending} className="w-full sm:w-auto">
              {updateGlobalFees.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Settings
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold">{subscriptions?.filter(s => s.is_active).length ?? 0}</p><p className="text-xs text-muted-foreground">Active</p></div></Card>
        <Card className={`p-3 ${suspendedCount > 0 ? 'border-destructive' : ''}`}><div className="text-center"><p className="text-2xl font-bold text-destructive">{suspendedCount}</p><p className="text-xs text-muted-foreground">Suspended</p></div></Card>
        <Card className={`p-3 ${pendingPaymentsCount > 0 ? 'border-orange-400' : ''}`}><div className="text-center"><p className="text-2xl font-bold text-orange-500">{pendingPaymentsCount}</p><p className="text-xs text-muted-foreground">Pending</p></div></Card>
        <Card className="p-3"><div className="text-center"><p className="text-2xl font-bold">{formatPKR(totalPendingAmount)}</p><p className="text-xs text-muted-foreground">Owed</p></div></Card>
      </div>

      <Tabs defaultValue="sellers" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="sellers">Sellers</TabsTrigger>
          <TabsTrigger value="requests">Plan Requests {planChangeRequests?.length ? `(${planChangeRequests.length})` : ''}</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Sellers Tab */}
        <TabsContent value="sellers">
          <Card>
            <CardContent className="pt-4">
              {subscriptionsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : !subscriptions?.length ? (
                <p className="text-center text-muted-foreground py-8">No subscriptions yet</p>
              ) : (
                <div className="space-y-2">
                  {subscriptions.map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{getSellerName(sub.seller_id)}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-[10px] h-5">{PLAN_LABELS[sub.plan_type] || sub.plan_type}</Badge>
                          {sub.account_suspended ? (
                            <Badge variant="destructive" className="text-[10px] h-5"><Ban className="h-2.5 w-2.5 mr-0.5" />Suspended</Badge>
                          ) : sub.payment_pending ? (
                            <Badge variant="destructive" className="text-[10px] h-5"><AlertTriangle className="h-2.5 w-2.5 mr-0.5" />{formatPKR(sub.pending_amount)}</Badge>
                          ) : sub.is_in_free_period ? (
                            <Badge className="text-[10px] h-5 bg-green-500"><Gift className="h-2.5 w-2.5 mr-0.5" />Free</Badge>
                          ) : sub.is_active ? (
                            <Badge className="text-[10px] h-5 bg-green-500/10 text-green-600 border-green-200"><Check className="h-2.5 w-2.5 mr-0.5" />Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px] h-5"><X className="h-2.5 w-2.5 mr-0.5" />Off</Badge>
                          )}
                          {sub.custom_daily_fee && <Badge variant="outline" className="text-[10px] h-5">Custom: {formatPKR(sub.custom_daily_fee)}/day</Badge>}
                          <span className="text-[10px] text-muted-foreground">Paid: {formatPKR(sub.total_fees_paid)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={() => handleEditSeller(sub.seller_id)}>Edit</Button>
                        <Button variant="outline" size="sm" className="h-8 px-2 text-xs" onClick={() => triggerManualDeduction.mutate(sub.seller_id)} disabled={triggerManualDeduction.isPending}>
                          {triggerManualDeduction.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Deduct'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Change Requests Tab */}
        <TabsContent value="requests">
          <Card>
            <CardContent className="pt-4">
              {!planChangeRequests?.length ? (
                <p className="text-center text-muted-foreground py-8">No pending plan change requests</p>
              ) : (
                <div className="space-y-2">
                  {planChangeRequests.map((req: any) => (
                    <div key={req.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium text-sm">{getSellerName(req.seller_id)}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowRightLeft className="w-3 h-3" />
                          {PLAN_LABELS[req.current_plan]} → {PLAN_LABELS[req.requested_plan]}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-8 px-3 text-xs" onClick={() => approvePlanChange.mutate({ requestId: req.id, sellerId: req.seller_id, newPlan: req.requested_plan })}>
                          <Check className="w-3 h-3 mr-1" />Approve
                        </Button>
                        <Button variant="destructive" size="sm" className="h-8 px-3 text-xs" onClick={() => rejectPlanChange.mutate({ requestId: req.id, notes: 'Rejected by admin' })}>
                          <X className="w-3 h-3 mr-1" />Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardContent className="pt-4">
              {logsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
              ) : !deductionLogs?.length ? (
                <p className="text-center text-muted-foreground py-8">No deduction logs</p>
              ) : (
                <div className="space-y-1.5">
                  {deductionLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2.5 rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-[10px] h-5">{log.status}</Badge>
                        <span className="text-xs text-muted-foreground">{getSellerName(log.seller_id)}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(log.created_at), 'dd MMM HH:mm')}</span>
                      </div>
                      <span className="font-medium">{formatPKR(log.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Seller Dialog */}
      <Dialog open={!!editingSeller} onOpenChange={() => setEditingSeller(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Seller Subscription</DialogTitle>
            <DialogDescription>Override global fee or change plan for this seller</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Plan Type</Label>
              <Select value={sellerPlan} onValueChange={setSellerPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily — {formatPKR(perDayFee)}/day</SelectItem>
                  <SelectItem value="half_monthly">15-Day — {formatPKR(perDayFee * 15)}</SelectItem>
                  <SelectItem value="monthly">Monthly — {formatPKR(perDayFee * 30)}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Custom Per-Day Fee (PKR) — leave empty for global</Label>
              <Input type="number" value={sellerCustomFee} onChange={(e) => setSellerCustomFee(e.target.value)} placeholder={`Global: ${perDayFee}`} />
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
