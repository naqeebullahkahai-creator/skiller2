import { useState } from "react";
import { Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useManageChatShortcuts, ChatShortcut } from "@/hooks/useSupportChat";

const AdminChatShortcutsPage = () => {
  const { shortcuts, isLoading, addShortcut, updateShortcut, deleteShortcut } = useManageChatShortcuts();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ChatShortcut | null>(null);
  const [form, setForm] = useState({ label: "", message: "", category: "general" });

  const handleSubmit = () => {
    if (!form.label.trim() || !form.message.trim()) return;
    if (editing) {
      updateShortcut.mutate({ id: editing.id, ...form });
    } else {
      addShortcut.mutate(form);
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ label: "", message: "", category: "general" });
  };

  const handleEdit = (s: ChatShortcut) => {
    setEditing(s);
    setForm({ label: s.label, message: s.message, category: s.category });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Chat Shortcuts</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditing(null); setForm({ label: "", message: "", category: "general" }); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Shortcut</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Shortcut" : "Add Shortcut"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Label (chip text)</label>
                <Input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Account Issue" />
              </div>
              <div>
                <label className="text-sm font-medium">Message (auto-sent)</label>
                <Textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="e.g. I need help with my account." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g. general, orders, payment" />
              </div>
              <Button onClick={handleSubmit} className="w-full">{editing ? "Update" : "Add"}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3">
        {shortcuts.map(s => (
          <Card key={s.id} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge variant="outline" className="shrink-0">{s.category}</Badge>
                <div className="min-w-0">
                  <p className="font-medium truncate">{s.label}</p>
                  <p className="text-sm text-muted-foreground truncate">{s.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={s.is_active}
                  onCheckedChange={(checked) => updateShortcut.mutate({ id: s.id, is_active: checked })}
                />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => deleteShortcut.mutate(s.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && shortcuts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No chat shortcuts yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatShortcutsPage;
