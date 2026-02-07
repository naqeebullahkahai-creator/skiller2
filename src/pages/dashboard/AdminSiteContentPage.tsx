import { useState } from "react";
import { FileText, Plus, Pencil, Trash2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useManageSiteContent, SiteContent } from "@/hooks/useSiteContent";

const AdminSiteContentPage = () => {
  const { contentList, isLoading, updateContent, addContent, deleteContent } = useManageSiteContent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newForm, setNewForm] = useState({ page: "", section_key: "", title: "", content: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const pages = [...new Set(contentList.map(c => c.page))];

  const handleAdd = () => {
    if (!newForm.page.trim() || !newForm.section_key.trim()) return;
    addContent.mutate(newForm);
    setDialogOpen(false);
    setNewForm({ page: "", section_key: "", title: "", content: "" });
  };

  const handleSave = (id: string) => {
    updateContent.mutate({ id, content: editContent, title: editTitle });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Site Content Manager</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Content Block</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Content Block</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Page</label>
                <Input value={newForm.page} onChange={e => setNewForm(f => ({ ...f, page: e.target.value }))} placeholder="e.g. home, help, policy" />
              </div>
              <div>
                <label className="text-sm font-medium">Section Key</label>
                <Input value={newForm.section_key} onChange={e => setNewForm(f => ({ ...f, section_key: e.target.value }))} placeholder="e.g. hero_title, faq_intro" />
              </div>
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="Display title" />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea value={newForm.content} onChange={e => setNewForm(f => ({ ...f, content: e.target.value }))} rows={4} placeholder="Content text..." />
              </div>
              <Button onClick={handleAdd} className="w-full">Add Block</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {pages.map(page => (
        <div key={page} className="space-y-3">
          <h2 className="text-lg font-semibold capitalize flex items-center gap-2">
            <Badge variant="outline">{page}</Badge>
            Page Content
          </h2>
          {contentList.filter(c => c.page === page).map(item => (
            <Card key={item.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                {editingId === item.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      placeholder="Title"
                      className="font-medium"
                    />
                    <Textarea
                      value={editContent}
                      onChange={e => setEditContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(item.id)}>
                        <Save className="h-4 w-4 mr-1" />Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{item.title || item.section_key}</p>
                        <Badge variant="secondary" className="text-xs">{item.section_key}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-3">{item.content}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingId(item.id); setEditContent(item.content); setEditTitle(item.title || ""); }}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteContent.mutate(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      {!isLoading && contentList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No content blocks yet. Add one to start managing site content.</p>
        </div>
      )}
    </div>
  );
};

export default AdminSiteContentPage;
