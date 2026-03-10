import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Loader2, GripVertical, Wallet } from "lucide-react";
import { useWithdrawalMethods, WithdrawalMethodField } from "@/hooks/useWithdrawalMethods";

const AdminWithdrawalMethodsPage = () => {
  const { methods, isLoading, createMethod, updateMethod, toggleMethod, deleteMethod } = useWithdrawalMethods();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [methodName, setMethodName] = useState("");
  const [fields, setFields] = useState<WithdrawalMethodField[]>([]);
  const [newFieldLabel, setNewFieldLabel] = useState("");

  const resetForm = () => {
    setMethodName("");
    setFields([]);
    setNewFieldLabel("");
    setEditingId(null);
  };

  const handleOpen = (method?: any) => {
    if (method) {
      setEditingId(method.id);
      setMethodName(method.name);
      setFields(method.fields || []);
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const addField = () => {
    if (!newFieldLabel.trim()) return;
    const fieldName = newFieldLabel.trim().toLowerCase().replace(/\s+/g, '_');
    setFields([...fields, { field_name: fieldName, field_label: newFieldLabel.trim(), is_required: true }]);
    setNewFieldLabel("");
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!methodName.trim() || fields.length === 0) return;
    
    if (editingId) {
      await updateMethod.mutateAsync({ id: editingId, name: methodName, fields: fields as any });
    } else {
      await createMethod.mutateAsync({ name: methodName, fields });
    }
    setShowDialog(false);
    resetForm();
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[300px]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Withdrawal Methods
          </h1>
          <p className="text-muted-foreground">Manage withdrawal methods for sellers</p>
        </div>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Method
        </Button>
      </div>

      {methods.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No withdrawal methods configured yet.</p>
            <p className="text-sm">Add methods like EasyPaisa, JazzCash, Bank Transfer etc.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {methods.map((method) => (
            <Card key={method.id} className={!method.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">
                      {method.fields.length} field(s)
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={method.is_active ? "default" : "secondary"}>
                      {method.is_active ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  {method.fields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{field.field_label}</span>
                      {field.is_required && <span className="text-destructive text-xs">*</span>}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={method.is_active}
                      onCheckedChange={(checked) => toggleMethod.mutate({ id: method.id, is_active: checked })}
                    />
                    <span className="text-xs text-muted-foreground">
                      {method.is_active ? "On" : "Off"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleOpen(method)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMethod.mutate(method.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} Withdrawal Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Wallet Name *</Label>
              <Input
                placeholder="e.g., EasyPaisa, JazzCash, Bank Transfer"
                value={methodName}
                onChange={(e) => setMethodName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Fields (boxes seller will fill)</Label>
              <div className="space-y-2 mt-2">
                {fields.map((field, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{field.field_label}</span>
                    <Badge variant="outline" className="text-xs">Required</Badge>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeField(i)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Box name e.g., Account Name"
                  value={newFieldLabel}
                  onChange={(e) => setNewFieldLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addField())}
                />
                <Button type="button" variant="outline" onClick={addField} disabled={!newFieldLabel.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!methodName.trim() || fields.length === 0 || createMethod.isPending || updateMethod.isPending}
            >
              {(createMethod.isPending || updateMethod.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminWithdrawalMethodsPage;
