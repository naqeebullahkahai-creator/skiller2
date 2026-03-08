import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Plus, Edit, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStore } from "@/hooks/useAdminStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminStoreProductsPage = () => {
  const navigate = useNavigate();
  const { adminProducts, isLoading } = useAdminStore();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const filtered = adminProducts?.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const toggleActive = async (productId: string, currentActive: boolean) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !currentActive })
      .eq("id", productId);
    if (error) {
      toast.error("Failed to update product");
    } else {
      toast.success(currentActive ? "Product hidden" : "Product visible");
      queryClient.invalidateQueries({ queryKey: ["admin-store-products"] });
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) {
      toast.error("Failed to delete");
    } else {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-store-products"] });
    }
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-xl p-5 text-white">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/store")} className="mb-2 text-white/90 hover:text-white hover:bg-white/10 gap-1.5 px-2 h-8">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2"><Package className="h-6 w-6" /> Admin Products</h1>
        <p className="text-white/80 text-sm mt-1">Manage your store's product catalog</p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => navigate("/admin/store/products/new")} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No products yet</p>
            <p className="text-sm mt-1">Add your first product to get started</p>
            <Button onClick={() => navigate("/admin/store/products/new")} className="mt-4 gap-1.5 bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((product: any) => (
            <Card key={product.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-3 p-3">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center shrink-0">
                      <Package className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{product.title}</h3>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">{formatPKR(product.price_pkr)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{product.stock_count} in stock</Badge>
                      <Badge className={cn("text-xs", product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground")}>
                        {product.is_active ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="border-t flex">
                  <Button variant="ghost" size="sm" className="flex-1 rounded-none gap-1 text-xs h-9" onClick={() => toggleActive(product.id, product.is_active)}>
                    {product.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {product.is_active ? "Hide" : "Show"}
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1 rounded-none gap-1 text-xs h-9 text-destructive" onClick={() => deleteProduct(product.id)}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStoreProductsPage;
