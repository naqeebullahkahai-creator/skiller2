import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSellerSubscription, PLAN_LABELS } from "@/hooks/useSellerSubscription";
import { formatPKR } from "@/hooks/useSellerWallet";
import { Calendar, Clock, AlertTriangle, Gift, Shield, ArrowRightLeft, Loader2, Ban } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const SellerSubscriptionCard = () => {
  const {
    subscription, globalFees, effectiveFee, perDayFee,
    freePeriodDaysLeft, isLoading, hasPaymentPending, pendingAmount,
    isSuspended, deductionLogs, requestPlanChange, planChangeRequests,
  } = useSellerSubscription();

  const [showPlanChange, setShowPlanChange] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');

  const hasPendingRequest = planChangeRequests?.some((r: any) => r.status === 'pending');

  if (isLoading) return null;
  if (!subscription) return null;

  const handleRequestChange = async () => {
    if (!selectedPlan) return;
    await requestPlanChange.mutateAsync(selectedPlan);
    setShowPlanChange(false);
  };

  return (
    <div className="space-y-4">
      {/* Suspension Alert */}
      {isSuspended && (
        <Alert variant="destructive">
          <Ban className="h-4 w-4" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>
            Your account is suspended due to unpaid fees of <strong>{formatPKR(pendingAmount)}</strong>. 
            Your products are hidden. Add funds to your wallet to reactivate automatically.
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Pending Alert */}
      {hasPaymentPending && !isSuspended && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Payment Pending</AlertTitle>
          <AlertDescription>
            Platform fee of <strong>{formatPKR(pendingAmount)}</strong> is pending. Please add funds.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Subscription Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Subscription Plan
            </CardTitle>
            <Badge variant={subscription.is_in_free_period ? "default" : "outline"} className={subscription.is_in_free_period ? "bg-green-500" : ""}>
              {subscription.is_in_free_period ? "🎉 Free Period" : PLAN_LABELS[subscription.plan_type] || subscription.plan_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Free Period Info */}
          {subscription.is_in_free_period && freePeriodDaysLeft > 0 && (
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Gift className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-400">Free Period Active</span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mb-2">
                {freePeriodDaysLeft} days remaining — No fees until {subscription.free_period_end ? format(new Date(subscription.free_period_end), 'dd MMM yyyy') : ''}
              </p>
              <Progress value={((subscription.free_months * 30 - freePeriodDaysLeft) / (subscription.free_months * 30)) * 100} className="h-2" />
            </div>
          )}

          {/* Fee Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Per Day Fee</p>
              <p className="text-lg font-bold">{formatPKR(perDayFee)}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Current Plan Fee</p>
              <p className="text-lg font-bold">{formatPKR(effectiveFee)}</p>
              <p className="text-[10px] text-muted-foreground">/{PLAN_LABELS[subscription.plan_type]?.toLowerCase()}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Next Billing</p>
              <p className="text-sm font-semibold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {subscription.next_deduction_at ? format(new Date(subscription.next_deduction_at), 'dd MMM yyyy') : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground">Total Paid</p>
              <p className="text-sm font-semibold">{formatPKR(subscription.total_fees_paid)}</p>
            </div>
          </div>

          {/* Plan Change Button */}
          <Button variant="outline" className="w-full" onClick={() => setShowPlanChange(true)} disabled={hasPendingRequest}>
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            {hasPendingRequest ? 'Plan Change Pending...' : 'Request Plan Change'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Deductions */}
      {deductionLogs && deductionLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Fee Deduction History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deductionLogs.slice(0, 10).map(log => (
                <div key={log.id} className="flex items-center justify-between p-2.5 rounded-lg border text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="text-[10px] h-5">
                      {log.status}
                    </Badge>
                    <span className="text-muted-foreground">{format(new Date(log.created_at), 'dd MMM yyyy')}</span>
                  </div>
                  <span className={log.status === 'success' ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                    -{formatPKR(log.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Change Dialog */}
      <Dialog open={showPlanChange} onOpenChange={setShowPlanChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Billing Plan</DialogTitle>
            <DialogDescription>
              Request to change your billing plan. Admin approval required. Per-day fee: {formatPKR(perDayFee)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger><SelectValue placeholder="Select new plan" /></SelectTrigger>
              <SelectContent>
                {['daily', 'half_monthly', 'monthly'].filter(p => p !== subscription.plan_type).map(p => (
                  <SelectItem key={p} value={p}>
                    {PLAN_LABELS[p]} — {formatPKR(perDayFee * (p === 'daily' ? 1 : p === 'half_monthly' ? 15 : 30))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanChange(false)}>Cancel</Button>
            <Button onClick={handleRequestChange} disabled={!selectedPlan || requestPlanChange.isPending}>
              {requestPlanChange.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerSubscriptionCard;
