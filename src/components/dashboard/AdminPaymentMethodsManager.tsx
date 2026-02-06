import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2, Loader2, Upload, CreditCard } from "lucide-react";
import { useAdminPaymentMethods, PaymentMethod } from "@/hooks/useDeposits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPaymentMethodsManager = () => {
  const { paymentMethods, isLoading, createMethod, updateMethod, deleteMethod } = useAdminPaymentMethods();
  const [showDialog, setShowDialog] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    method_name: '',
    account_name: '',
    account_number: '',
    iban: '',
    till_id: '',
    logo_url: '',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      method_name: '',
      account_name: '',
      account_number: '',
      iban: '',
      till_id: '',
      logo_url: '',
      is_active: true,
      display_order: 0,
    });
    setEditingMethod(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowDialog(true);
  };

  const openEditDialog = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      method_name: method.method_name,
      account_name: method.account_name,
      account_number: method.account_number || '',
      iban: method.iban || '',
      till_id: method.till_id || '',
      logo_url: method.logo_url || '',
      is_active: method.is_active,
      display_order: method.display_order,
    });
    setShowDialog(true);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `payment-method-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo uploaded');
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.method_name || !formData.account_name) {
      toast.error('Method name and account name are required');
      return;
    }

    const payload = {
      method_name: formData.method_name,
      account_name: formData.account_name,
      account_number: formData.account_number || null,
      iban: formData.iban || null,
      till_id: formData.till_id || null,
      logo_url: formData.logo_url || null,
      is_active: formData.is_active,
      display_order: formData.display_order,
    };

    if (editingMethod) {
      await updateMethod.mutateAsync({ id: editingMethod.id, ...payload });
    } else {
      await createMethod.mutateAsync(payload);
    }

    setShowDialog(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteMethod.mutateAsync(deleteId);
    setDeleteId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Payment Methods</h2>
          <p className="text-sm text-muted-foreground">
            Manage payment methods for manual deposits
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Method
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Method Name</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Account Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentMethods?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No payment methods configured yet
                  </TableCell>
                </TableRow>
              ) : (
                paymentMethods?.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      {method.logo_url ? (
                        <img
                          src={method.logo_url}
                          alt={method.method_name}
                          className="w-10 h-10 object-contain rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{method.method_name}</TableCell>
                    <TableCell>{method.account_name}</TableCell>
                    <TableCell>
                      <div className="text-sm space-y-0.5">
                        {method.account_number && <div>Acc: {method.account_number}</div>}
                        {method.iban && <div className="font-mono text-xs">{method.iban}</div>}
                        {method.till_id && <div>Till: {method.till_id}</div>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={method.is_active ? "default" : "secondary"}>
                        {method.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{method.display_order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(method)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(method.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Edit Payment Method' : 'Add Payment Method'}
            </DialogTitle>
            <DialogDescription>
              Configure a payment method for manual deposits
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Method Name *</Label>
              <Input
                placeholder="e.g., JazzCash, Easypaisa, Bank Transfer"
                value={formData.method_name}
                onChange={(e) => setFormData(prev => ({ ...prev, method_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Name *</Label>
              <Input
                placeholder="Account holder name"
                value={formData.account_name}
                onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="e.g., 03001234567"
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>IBAN</Label>
              <Input
                placeholder="e.g., PK36SCBL0000001234567890"
                value={formData.iban}
                onChange={(e) => setFormData(prev => ({ ...prev, iban: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Till ID</Label>
              <Input
                placeholder="For mobile wallets"
                value={formData.till_id}
                onChange={(e) => setFormData(prev => ({ ...prev, till_id: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="w-12 h-12 object-contain rounded border"
                  />
                )}
                <label className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span className="text-sm">Upload Logo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createMethod.isPending || updateMethod.isPending}
            >
              {(createMethod.isPending || updateMethod.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingMethod ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Existing deposit requests using this method will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPaymentMethodsManager;
