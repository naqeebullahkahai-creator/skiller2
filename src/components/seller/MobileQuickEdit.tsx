import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Save, X, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  title: string;
  images: string[] | null;
  price_pkr: number;
  discount_price_pkr: number | null;
  stock_count: number;
  status: string;
}

interface MobileQuickEditProps {
  products: Product[];
  onRefetch: () => void;
}

interface EditingState {
  [productId: string]: {
    price?: number;
    stock?: number;
    inStock?: boolean;
    saving?: boolean;
  };
}

const MobileQuickEdit = ({ products, onRefetch }: MobileQuickEditProps) => {
  const [editing, setEditing] = useState<EditingState>({});

  const getProductImage = (images: string[] | null) => {
    if (images && images.length > 0) return images[0];
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop";
  };

  const startEditing = (product: Product) => {
    setEditing(prev => ({
      ...prev,
      [product.id]: {
        price: product.discount_price_pkr || product.price_pkr,
        stock: product.stock_count,
        inStock: product.stock_count > 0,
      }
    }));
  };

  const cancelEditing = (productId: string) => {
    setEditing(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
  };

  const handleToggleStock = async (product: Product) => {
    const newStock = product.stock_count > 0 ? 0 : 10;
    
    setEditing(prev => ({
      ...prev,
      [product.id]: { ...prev[product.id], saving: true }
    }));

    try {
      const { error } = await supabase
        .from("products")
        .update({ stock_count: newStock })
        .eq("id", product.id);

      if (error) throw error;
      
      toast.success(newStock > 0 ? "Product marked as In Stock" : "Product marked as Out of Stock");
      onRefetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock");
    } finally {
      setEditing(prev => {
        const newState = { ...prev };
        delete newState[product.id];
        return newState;
      });
    }
  };

  const handleSave = async (productId: string) => {
    const editState = editing[productId];
    if (!editState) return;

    setEditing(prev => ({
      ...prev,
      [productId]: { ...prev[productId], saving: true }
    }));

    try {
      const updates: any = {};
      
      if (editState.price !== undefined) {
        updates.discount_price_pkr = editState.price;
      }
      
      if (editState.stock !== undefined) {
        updates.stock_count = editState.stock;
      }

      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId);

      if (error) throw error;
      
      toast.success("Product updated successfully");
      cancelEditing(productId);
      onRefetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update product");
      setEditing(prev => ({
        ...prev,
        [productId]: { ...prev[productId], saving: false }
      }));
    }
  };

  const activeProducts = products.filter(p => p.status === "active" || p.status === "pending");

  if (activeProducts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">No products to edit</h3>
          <p className="text-sm text-muted-foreground">
            Add products to start managing your inventory
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          Quick Edit Products
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Quickly update prices and stock status
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {activeProducts.map((product) => {
            const isEditing = !!editing[product.id];
            const editState = editing[product.id];
            const isSaving = editState?.saving;

            return (
              <div key={product.id} className="p-4">
                <div className="flex gap-3">
                  {/* Product Image */}
                  <img
                    src={getProductImage(product.images)}
                    alt={product.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {product.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          product.stock_count > 0 
                            ? "border-green-500 text-green-600" 
                            : "border-red-500 text-red-600"
                        )}
                      >
                        {product.stock_count > 0 ? `${product.stock_count} in stock` : "Out of Stock"}
                      </Badge>
                      {product.status === "pending" && (
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      )}
                    </div>

                    {!isEditing ? (
                      /* View Mode */
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-primary">
                            {formatPKR(product.discount_price_pkr || product.price_pkr)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={product.stock_count > 0}
                            onCheckedChange={() => handleToggleStock(product)}
                            disabled={isSaving}
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => startEditing(product)}
                            disabled={isSaving}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground">Price (PKR)</label>
                            <Input
                              type="number"
                              value={editState?.price || 0}
                              onChange={(e) => setEditing(prev => ({
                                ...prev,
                                [product.id]: {
                                  ...prev[product.id],
                                  price: parseFloat(e.target.value) || 0
                                }
                              }))}
                              className="h-8 text-sm"
                              disabled={isSaving}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Stock</label>
                            <Input
                              type="number"
                              value={editState?.stock || 0}
                              onChange={(e) => setEditing(prev => ({
                                ...prev,
                                [product.id]: {
                                  ...prev[product.id],
                                  stock: parseInt(e.target.value) || 0
                                }
                              }))}
                              className="h-8 text-sm"
                              disabled={isSaving}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(product.id)}
                            disabled={isSaving}
                            className="flex-1"
                          >
                            {isSaving ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelEditing(product.id)}
                            disabled={isSaving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default MobileQuickEdit;
