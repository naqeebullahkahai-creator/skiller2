import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Percent, Save, AlertCircle } from "lucide-react";
import { useAdminFinance } from "@/hooks/useAdminFinance";
import { toast } from "sonner";

const AdminCommissionSettings = () => {
  const { commissionRate, commissionLoading, updateCommissionRate } = useAdminFinance();
  const [newRate, setNewRate] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  const currentRate = newRate ?? commissionRate ?? 10;

  const handleSliderChange = (value: number[]) => {
    setNewRate(value[0]);
    setHasChanges(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 50) {
      setNewRate(value);
      setHasChanges(true);
    }
  };

  const handleSave = async () => {
    if (newRate === null || newRate === commissionRate) return;

    await updateCommissionRate.mutateAsync(newRate);
    setHasChanges(false);
  };

  if (commissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="w-5 h-5" />
          Sales Commission Settings
        </CardTitle>
        <CardDescription>
          Set the platform commission percentage deducted from each sale (separate from daily/monthly platform fees)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Global Commission Percentage</Label>
            <p className="text-sm text-muted-foreground mb-4">
              This percentage will be applied to all seller earnings when orders are delivered
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <Slider
                value={[currentRate]}
                onValueChange={handleSliderChange}
                min={0}
                max={50}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="w-24">
              <div className="relative">
                <Input
                  type="number"
                  value={currentRate}
                  onChange={handleInputChange}
                  min={0}
                  max={50}
                  step={0.5}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">Commission Preview</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Sale Amount</p>
              <p className="font-medium">Rs. 10,000</p>
            </div>
            <div>
              <p className="text-muted-foreground">Platform Commission ({currentRate}%)</p>
              <p className="font-medium text-primary">Rs. {(10000 * currentRate / 100).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Seller Earnings</p>
              <p className="font-medium text-green-500">Rs. {(10000 - (10000 * currentRate / 100)).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Warning for high rates */}
        {currentRate > 25 && (
          <div className="p-4 bg-primary/10 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary">High Commission Rate</p>
              <p className="text-muted-foreground">
                A commission rate above 25% may discourage sellers from using the platform.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateCommissionRate.isPending}
          >
            {updateCommissionRate.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCommissionSettings;
