import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";

const AdminStoreAddProductPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories } = useCategories();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price_pkr: "",
    compare_at_price_pkr: "",
    stock_count: "",
    category_id: "",
    sku: "",
    images: [] as string[],
  });
  const [imageUrl, setImageUrl] = useState("");

  const addImage = () => {
    if (imageUrl.trim()) {
      setForm(f => ({ ...f, images: [...f.images, imageUrl.trim()] }));
      setImageUrl("");
    }
  };

  const removeImage = (idx: number) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.price_pkr || !user) {
      toast.error("Title and price are required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("products").insert({
        title: form.title,
        description: form.description || null,
        price_pkr: parseFloat(form.price_pkr),
        compare_at_price_pkr: form.compare_at_price_pkr ? parseFloat(form.compare_at_price_pkr) : null,
        stock_count: parseInt(form.stock_count) || 0,
        category_id: form.category_id || null,
        sku: form.sku || null,
        images: form.images,
        seller_id: user.id,
        is_admin_product: true,
        is_active: true,
        approval_status: "approved",
      });
      if (error) throw error;
      toast.success("Product added to your store!");
      navigate("/admin/store/products");
    } catch (e: any) {
      toast.error(e.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/store/products")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Package className="h-6 w-6" /> Add Product</h1>
        <p className="text-white/80 text-sm mt-1">Add a new product to your admin store</p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Product Title *</Label>
            <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter product title" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description" rows={4} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price (PKR) *</Label>
              <Input type="number" value={form.price_pkr} onChange={e => setForm(f => ({ ...f, price_pkr: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>Compare Price</Label>
              <Input type="number" value={form.compare_at_price_pkr} onChange={e => setForm(f => ({ ...f, compare_at_price_pkr: e.target.value }))} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Stock Count</Label>
              <Input type="number" value={form.stock_count} onChange={e => setForm(f => ({ ...f, stock_count: e.target.value }))} placeholder="0" />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="SKU-001" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {categories?.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Product Images (URL)</Label>
            <div className="flex gap-2">
              <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Paste image URL" className="flex-1" />
              <Button type="button" variant="outline" onClick={addImage} className="gap-1"><Upload className="h-4 w-4" /> Add</Button>
            </div>
            {form.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                    <button onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button onClick={handleSubmit} disabled={saving} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Add Product"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStoreAddProductPage;
