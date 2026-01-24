import { useState, useMemo } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Loader2, Upload, Package } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import BulkActionsToolbar from "@/components/dashboard/BulkActionsToolbar";
import { useSellerProducts, formatPKR } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SellerProductsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const { products, isLoading, refetch } = useSellerProducts();

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      .filter((product) => statusFilter === "all" || product.status === statusFilter);
  }, [products, searchQuery, statusFilter]);

  const handleDelete = async () => {
    if (!deleteProductId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteProductId);

      if (error) throw error;

      toast({
        title: "Product Deleted",
        description: "Product has been removed successfully.",
      });

      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setDeleteProductId(null);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds((prev) => [...prev, productId]);
    } else {
      setSelectedProductIds((prev) => prev.filter((id) => id !== productId));
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; label: string }> = {
      active: { class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Active" },
      pending: { class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pending Approval" },
      rejected: { class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Rejected" },
    };
    return styles[status] || styles.pending;
  };

  const getProductImage = (images: string[] | null) => {
    if (images && images.length > 0) {
      return images[0];
    }
    return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop";
  };

  const isAllSelected = filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length;
  const isSomeSelected = selectedProductIds.length > 0 && selectedProductIds.length < filteredProducts.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Products</h1>
            <p className="text-muted-foreground">
              Manage your product inventory
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/seller/bulk-upload">
              <Upload size={18} />
              Bulk Upload
            </Link>
          </Button>
          <Button onClick={() => navigate("/seller/products/new")} className="gap-2">
            <Plus size={18} />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      <BulkActionsToolbar
        selectedIds={selectedProductIds}
        onClearSelection={() => setSelectedProductIds([])}
        onActionComplete={() => {
          refetch();
          setSelectedProductIds([]);
        }}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Products ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">
                Start selling by adding your first product
              </p>
              <Button onClick={() => navigate("/seller/products/new")} className="gap-2">
                <Plus size={18} />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                        className={isSomeSelected ? "data-[state=checked]:bg-primary" : ""}
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const statusInfo = getStatusBadge(product.status);
                    const isSelected = selectedProductIds.includes(product.id);
                    return (
                      <TableRow key={product.id} className={isSelected ? "bg-muted/50" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleSelectProduct(product.id, !!checked)}
                            aria-label={`Select ${product.title}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={getProductImage(product.images)}
                              alt={product.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-medium line-clamp-1">{product.title}</p>
                              <p className="text-xs text-muted-foreground">{product.brand || "No brand"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{product.sku || "-"}</TableCell>
                        <TableCell className="text-sm">{product.category}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {formatPKR(product.discount_price_pkr || product.price_pkr)}
                            </p>
                            {product.discount_price_pkr && product.discount_price_pkr < product.price_pkr && (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatPKR(product.price_pkr)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "font-medium",
                            product.stock_count === 0 && "text-destructive"
                          )}>
                            {product.stock_count}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.class}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="gap-2"
                                onClick={() => navigate(`/product/${product.slug || product.id}`)}
                              >
                                <Eye size={14} /> View on Store
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit size={14} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="gap-2 text-destructive"
                                onClick={() => setDeleteProductId(product.id)}
                              >
                                <Trash2 size={14} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SellerProductsPage;
