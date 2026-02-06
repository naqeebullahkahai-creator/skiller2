import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import AdminPaymentMethodsManager from "@/components/dashboard/AdminPaymentMethodsManager";

const AdminDepositSettings = () => {
  const { settings, isLoading, updateSetting } = useSiteSettings();

  const depositEnabled = settings?.find(s => s.setting_key === 'manual_deposits_enabled')?.is_enabled ?? true;

  const handleToggle = async (enabled: boolean) => {
    await updateSetting.mutateAsync({
      key: 'manual_deposits_enabled',
      value: enabled ? 'true' : 'false',
      isEnabled: enabled,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Deposit Settings</h1>
        <p className="text-muted-foreground">
          Configure manual deposit feature and payment methods
        </p>
      </div>

      {/* Feature Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Deposits Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Manual Deposits</Label>
              <p className="text-sm text-muted-foreground">
                Allow users and sellers to submit manual deposit requests
              </p>
            </div>
            <Switch
              checked={depositEnabled}
              onCheckedChange={handleToggle}
              disabled={updateSetting.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Payment Methods Management */}
      <AdminPaymentMethodsManager />
    </div>
  );
};

export default AdminDepositSettings;
