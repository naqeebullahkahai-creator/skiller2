import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, ShieldAlert } from "lucide-react";
import { useAdminPaymentMethods } from "@/hooks/useDeposits";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import AdminPaymentMethodsManager from "@/components/dashboard/AdminPaymentMethodsManager";
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

const AdminPaymentSettingsPage = () => {
  const { settings, isLoading: settingsLoading, updateSetting } = useSiteSettings();
  const [showCodConfirm, setShowCodConfirm] = useState(false);

  const codOnlyMode = settings?.find(s => s.setting_key === 'cod_only_mode')?.setting_value === 'true';
  const depositEnabled = settings?.find(s => s.setting_key === 'manual_deposits_enabled')?.is_enabled ?? true;

  const handleCodToggle = () => {
    setShowCodConfirm(true);
  };

  const confirmCodToggle = async () => {
    await updateSetting.mutateAsync({
      key: 'cod_only_mode',
      value: codOnlyMode ? 'false' : 'true',
    });
    setShowCodConfirm(false);
  };

  const handleDepositToggle = async (enabled: boolean) => {
    await updateSetting.mutateAsync({
      key: 'manual_deposits_enabled',
      value: enabled ? 'true' : 'false',
      isEnabled: enabled,
    });
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Payment Settings
        </h1>
        <p className="text-muted-foreground">
          Control payment methods and deposit features
        </p>
      </div>

      {/* COD Only Master Toggle */}
      <Card className={codOnlyMode ? "border-destructive" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert size={20} />
            Cash on Delivery Only Mode
            {codOnlyMode && <Badge variant="destructive">ACTIVE</Badge>}
          </CardTitle>
          <CardDescription>
            When enabled, ALL other payment methods (wallet, deposits, online) will be disabled.
            Only Cash on Delivery will be available for customers and sellers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium">Enable COD-Only Mode</p>
              <p className="text-sm text-muted-foreground">
                One button to disable all payment methods except COD
              </p>
            </div>
            <Switch
              checked={codOnlyMode}
              onCheckedChange={handleCodToggle}
              disabled={updateSetting.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Manual Deposits Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Deposits Feature</CardTitle>
          <CardDescription>Allow users and sellers to submit manual deposit requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <Label>Enable Manual Deposits</Label>
              <p className="text-sm text-muted-foreground">
                Allow manual deposit requests via payment methods below
              </p>
            </div>
            <Switch
              checked={depositEnabled}
              onCheckedChange={handleDepositToggle}
              disabled={updateSetting.isPending || codOnlyMode}
            />
          </div>
          {codOnlyMode && (
            <p className="text-xs text-destructive mt-2">
              Manual deposits are disabled because COD-Only mode is active.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Management */}
      {!codOnlyMode && <AdminPaymentMethodsManager />}

      {/* COD Confirmation */}
      <AlertDialog open={showCodConfirm} onOpenChange={setShowCodConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {codOnlyMode ? "Disable COD-Only Mode?" : "Enable COD-Only Mode?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {codOnlyMode
                ? "All payment methods will become available again for customers and sellers."
                : "This will immediately disable ALL payment methods except Cash on Delivery. Wallet payments, online payments, and manual deposits will be hidden everywhere."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCodToggle}
              className={!codOnlyMode ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {codOnlyMode ? "Enable All Methods" : "Enable COD Only"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPaymentSettingsPage;
