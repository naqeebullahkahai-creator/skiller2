import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Pencil, Loader2, Wallet, CheckCircle2, Star } from "lucide-react";
import { useSellerSavedWallets } from "@/hooks/useSellerSavedWallets";
import { useWithdrawalMethods, WithdrawalMethod } from "@/hooks/useWithdrawalMethods";

const SellerSavedWallets = () => {
  const { savedWallets, isLoading, saveWallet, updateWallet, deleteWallet } = useSellerSavedWallets();
  const { activeMethods, isLoading: methodsLoading } = useWithdrawalMethods();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [label, setLabel] = useState("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const selectedMethod = activeMethods.find(m => m.id === selectedMethodId);

  const resetForm = () => {
    setSelectedMethodId("");
    setLabel("");
    setFieldValues({});
    setEditingId(null);
  };

  const handleOpen = (wallet?: any) => {
    if (wallet) {
      setEditingId(wallet.id);
      setSelectedMethodId(wallet.method_id);
      setLabel(wallet.label);
      setFieldValues(wallet.field_values || {});
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!selectedMethodId || !selectedMethod) return;
    
    // Validate required fields
    const missingFields = selectedMethod.fields
      .filter(f => f.is_required && !fieldValues[f.field_name]?.trim());
    
    if (missingFields.length > 0) return;

    if (editingId) {
      await updateWallet.mutateAsync({ id: editingId, label, field_values: fieldValues });
    } else {
      await saveWallet.mutateAsync({
        method_id: selectedMethodId,
        label: label || selectedMethod.name,
        field_values: fieldValues,
        is_default: savedWallets.length === 0,
      });
    }
    setShowDialog(false);
    resetForm();
  };

  const getMethodName = (methodId: string) => {
    return activeMethods.find(m => m.id === methodId)?.name || "Unknown";
  };

  if (isLoading || methodsLoading) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Saved Wallets
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Save your withdrawal accounts for quick payouts
            </p>
          </div>
          {activeMethods.length > 0 && (
            <Button size="sm" onClick={() => handleOpen()}>
              <Plus className="w-4 h-4 mr-1" />
              Add Wallet
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {activeMethods.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            No withdrawal methods available yet. Please wait for admin to configure them.
          </div>
        ) : savedWallets.length === 0 ? (
          <div className="text-center py-6">
            <Wallet className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground mb-3">No saved wallets yet</p>
            <Button variant="outline" size="sm" onClick={() => handleOpen()}>
              <Plus className="w-4 h-4 mr-1" />
              Add Your First Wallet
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {savedWallets.map((wallet) => (
              <div key={wallet.id} className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{getMethodName(wallet.method_id)}</Badge>
                    {wallet.is_default && (
                      <Badge className="bg-primary/10 text-primary text-[10px]">
                        <Star className="w-3 h-3 mr-0.5" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(wallet)}>
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteWallet.mutate(wallet.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {wallet.label && <p className="text-sm font-medium mb-1">{wallet.label}</p>}
                <div className="space-y-0.5">
                  {Object.entries(wallet.field_values).map(([key, value]) => (
                    <p key={key} className="text-xs text-muted-foreground">
                      <span className="capitalize">{key.replace(/_/g, ' ')}</span>: <span className="text-foreground">{value}</span>
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {!editingId && (
              <div>
                <Label>Withdrawal Method *</Label>
                <Select value={selectedMethodId} onValueChange={(v) => { setSelectedMethodId(v); setFieldValues({}); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeMethods.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedMethod && (
              <>
                <div>
                  <Label>Label (optional)</Label>
                  <Input
                    placeholder={`e.g., My ${selectedMethod.name}`}
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>

                {selectedMethod.fields.map((field) => (
                  <div key={field.field_name}>
                    <Label>
                      {field.field_label} {field.is_required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      placeholder={`Enter ${field.field_label}`}
                      value={fieldValues[field.field_name] || ""}
                      onChange={(e) => setFieldValues({ ...fieldValues, [field.field_name]: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={
                !selectedMethodId ||
                saveWallet.isPending || updateWallet.isPending ||
                (selectedMethod?.fields.some(f => f.is_required && !fieldValues[f.field_name]?.trim()))
              }
            >
              {(saveWallet.isPending || updateWallet.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default SellerSavedWallets;
