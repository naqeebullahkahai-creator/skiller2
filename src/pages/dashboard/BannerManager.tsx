import { useState } from "react";
import { Image, Plus, Trash2, GripVertical, ExternalLink, Loader2, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAdminBanners, HeroBanner } from "@/hooks/useMarketing";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BannerVisualEditor from "@/components/admin/BannerVisualEditor";

const BannerManager = () => {
  const { banners, isLoading, createBanner, updateBanner, deleteBanner } = useAdminBanners();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HeroBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: "", image_url: "", link_type: "category", link_value: "", display_order: 0,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      const filePath = `banners/${fileName}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(filePath);
      setNewBanner({ ...newBanner, image_url: publicUrl });
      toast({ title: "Success", description: "Image uploaded!" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!newBanner.title || !newBanner.image_url) return;
    const success = await createBanner({
      title: newBanner.title, image_url: newBanner.image_url,
      link_type: newBanner.link_type,
      link_value: newBanner.link_value || undefined,
      display_order: banners.length,
    });
    if (success) {
      setShowCreateDialog(false);
      setNewBanner({ title: "", image_url: "", link_type: "category", link_value: "", display_order: 0 });
    }
  };

  const handleVisualUpdate = async (data: Partial<HeroBanner>) => {
    if (!editingBanner) return;
    await updateBanner(editingBanner.id, data);
    setEditingBanner(null);
    toast({ title: "Visual styles saved!" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Image className="h-6 w-6 text-primary" /> Banner Management
          </h1>
          <p className="text-muted-foreground">Manage hero banners — fonts, colors, animations & more</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button><Plus size={18} className="mr-2" />Add Banner</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add Hero Banner</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Banner Title</Label>
                <Input placeholder="e.g., Summer Sale 2024" value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} />
              </div>
              <div>
                <Label>Banner Image</Label>
                {newBanner.image_url ? (
                  <div className="relative mt-2">
                    <img src={newBanner.image_url} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                    <Button variant="destructive" size="sm" className="absolute top-2 right-2" onClick={() => setNewBanner({ ...newBanner, image_url: "" })}>Remove</Button>
                  </div>
                ) : (
                  <div className="mt-2">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    {uploading && <p className="text-sm text-muted-foreground mt-1">Uploading...</p>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Link Type</Label>
                  <Select value={newBanner.link_type} onValueChange={(v) => setNewBanner({ ...newBanner, link_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="category">Category</SelectItem>
                      <SelectItem value="flash-sale">Flash Sale</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="url">Custom URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Link Value</Label>
                  <Input
                    placeholder={newBanner.link_type === "category" ? "e.g., electronics" : newBanner.link_type === "url" ? "https://..." : "ID or slug"}
                    value={newBanner.link_value} onChange={(e) => setNewBanner({ ...newBanner, link_value: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full" disabled={!newBanner.image_url}>Add Banner</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {banners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Image size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Banners Yet</h3>
            <p className="text-muted-foreground mb-4">Add hero banners to showcase on the home page!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {banners.map((banner) => (
            <Card key={banner.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="text-muted-foreground cursor-grab"><GripVertical size={20} /></div>
                  <img src={banner.image_url} alt={banner.title} className="w-40 h-20 object-cover rounded" />
                  <div className="flex-1">
                    <h3 className="font-medium">{banner.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{banner.link_type}</Badge>
                      {banner.animation_type && banner.animation_type !== "none" && (
                        <Badge variant="secondary" className="text-xs">{banner.animation_type}</Badge>
                      )}
                      {banner.link_value && (
                        <span className="flex items-center gap-1"><ExternalLink size={12} />{banner.link_value}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditingBanner(banner)}>
                      <Paintbrush size={14} className="mr-1" /> Visual Edit
                    </Button>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Active</Label>
                      <Switch checked={banner.is_active} onCheckedChange={(checked) => updateBanner(banner.id, { is_active: checked })} />
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteBanner(banner.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visual Editor Dialog */}
      <Dialog open={!!editingBanner} onOpenChange={(open) => !open && setEditingBanner(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Paintbrush className="w-5 h-5 text-primary" /> Visual Editor — {editingBanner?.title}
            </DialogTitle>
          </DialogHeader>
          {editingBanner && (
            <BannerVisualEditor banner={editingBanner} onUpdate={handleVisualUpdate} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BannerManager;
