import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Percent, Save, Calendar, Gift, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";

interface SellerCommission {
  id: string;
  seller_id: string;
  custom_commission_percentage: number | null;
  grace_period_months: number;
  grace_start_date: string | null;
  grace_commission_percentage: number;
  notes: string | null;
}

interface SellerCommissionManagerProps {
  sellerId: string;
  sellerName: string;
  globalRate?: number;
}

const SellerCommissionManager = ({ sellerId, sellerName, globalRate = 10 }: SellerCommissionManagerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [commission, setCommission] = useState<SellerCommission | null>(null);
  
  // Form state
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customRate, setCustomRate] = useState(globalRate);
  const [enableGracePeriod, setEnableGracePeriod] = useState(false);
  const [gracePeriodMonths, setGracePeriodMonths] = useState(3);
  const [graceCommission, setGraceCommission] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchCommission();
  }, [sellerId]);

  const fetchCommission = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("seller_commissions")
        .select("*")
        .eq("seller_id", sellerId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCommission(data);
        setUseCustomRate(data.custom_commission_percentage !== null);
        setCustomRate(data.custom_commission_percentage ?? globalRate);
        setEnableGracePeriod(data.grace_period_months > 0);
        setGracePeriodMonths(data.grace_period_months || 3);
        setGraceCommission(data.grace_commission_percentage || 0);
        setNotes(data.notes || "");
      }
    } catch (err) {
      console.error("Error fetching commission:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        seller_id: sellerId,
        custom_commission_percentage: useCustomRate ? customRate : null,
        grace_period_months: enableGracePeriod ? gracePeriodMonths : 0,
        grace_start_date: enableGracePeriod && !commission?.grace_start_date 
          ? new Date().toISOString() 
          : commission?.grace_start_date || null,
        grace_commission_percentage: enableGracePeriod ? graceCommission : 0,
        notes: notes || null,
      };

      if (commission) {
        const { error } = await supabase
          .from("seller_commissions")
          .update(payload)
          .eq("id", commission.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("seller_commissions")
          .insert(payload);
        if (error) throw error;
      }

      toast.success("Commission settings saved successfully");
      fetchCommission();
    } catch (err: any) {
      toast.error(err.message || "Failed to save commission settings");
    } finally {
      setIsSaving(false);
    }
  };

  const getEffectiveRate = () => {
    if (enableGracePeriod && commission?.grace_start_date) {
      const graceEnd = addMonths(new Date(commission.grace_start_date), gracePeriodMonths);
      if (new Date() < graceEnd) {
        return graceCommission;
      }
    }
    return useCustomRate ? customRate : globalRate;
  };

  const getGraceEndDate = () => {
    if (!commission?.grace_start_date || !enableGracePeriod) return null;
    return addMonths(new Date(commission.grace_start_date), gracePeriodMonths);
  };

  const isGraceActive = () => {
    const graceEnd = getGraceEndDate();
    return graceEnd && new Date() < graceEnd;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Fee Settings for {sellerName}
        </CardTitle>
        <CardDescription>
          Configure custom fee rates and grace periods for this seller
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Effective Rate Display */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Effective Rate</p>
              <p className="text-3xl font-bold text-primary">{getEffectiveRate()}%</p>
            </div>
            {isGraceActive() && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-green-600">
                  <Gift className="w-4 h-4" />
                  <span className="text-sm font-medium">Grace Period Active</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Ends {format(getGraceEndDate()!, "MMM dd, yyyy")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Custom Commission Rate */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Custom Commission Rate</Label>
              <p className="text-sm text-muted-foreground">
                Override the global rate ({globalRate}%) for this seller
              </p>
            </div>
            <Switch checked={useCustomRate} onCheckedChange={setUseCustomRate} />
          </div>

          {useCustomRate && (
            <div className="pl-4 border-l-2 border-primary/20 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    value={[customRate]}
                    onValueChange={(v) => setCustomRate(v[0])}
                    min={0}
                    max={50}
                    step={0.5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                  </div>
                </div>
                <div className="w-20">
                  <div className="relative">
                    <Input
                      type="number"
                      value={customRate}
                      onChange={(e) => setCustomRate(parseFloat(e.target.value) || 0)}
                      min={0}
                      max={50}
                      step={0.5}
                      className="pr-6"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grace Period */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Grace Period
              </Label>
              <p className="text-sm text-muted-foreground">
                Offer reduced commission for a limited time
              </p>
            </div>
            <Switch checked={enableGracePeriod} onCheckedChange={setEnableGracePeriod} />
          </div>

          {enableGracePeriod && (
            <div className="pl-4 border-l-2 border-green-500/20 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (months)</Label>
                  <Input
                    type="number"
                    value={gracePeriodMonths}
                    onChange={(e) => setGracePeriodMonths(parseInt(e.target.value) || 1)}
                    min={1}
                    max={24}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Commission during grace (%)</Label>
                  <Input
                    type="number"
                    value={graceCommission}
                    onChange={(e) => setGraceCommission(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={50}
                    step={0.5}
                  />
                </div>
              </div>

              {commission?.grace_start_date && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm">
                  <p className="text-green-700 dark:text-green-400">
                    Grace period started: {format(new Date(commission.grace_start_date), "MMM dd, yyyy")}
                  </p>
                  <p className="text-green-600 dark:text-green-500">
                    Ends: {format(addMonths(new Date(commission.grace_start_date), gracePeriodMonths), "MMM dd, yyyy")}
                  </p>
                </div>
              )}

              {!commission?.grace_start_date && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Grace period will start from today when you save
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2 pt-4 border-t">
          <Label>Notes (Internal)</Label>
          <Textarea
            placeholder="Add notes about this seller's commission arrangement..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Fee Preview</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Sale Amount</p>
              <p className="font-medium">Rs. 10,000</p>
            </div>
            <div>
              <p className="text-muted-foreground">Platform ({getEffectiveRate()}%)</p>
              <p className="font-medium text-primary">Rs. {(10000 * getEffectiveRate() / 100).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Seller Earnings</p>
              <p className="font-medium text-green-600">Rs. {(10000 - (10000 * getEffectiveRate() / 100)).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Fee Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SellerCommissionManager;
