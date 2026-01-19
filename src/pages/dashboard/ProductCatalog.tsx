import { useState } from "react";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDashboard } from "@/contexts/DashboardContext";
import { dashboardProducts, formatPKR, DashboardProduct } from "@/data/dashboardData";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import AddProductForm from "@/components/dashboard/AddProductForm";

const ProductCatalog = () => {
  const { role, currentSellerId } = useDashboard();
  const { toast } = useToast();
  const [products, setProducts] = useState<DashboardProduct[]>(dashboardProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Filter products for seller view
  const filteredProducts = products
    .filter((product) => role === "admin" || product.sellerId === currentSellerId)
    .filter((product) =>
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((product) => statusFilter === "all" || product.status === statusFilter);

  const handleApprove = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: "active" as const } : p
      )
    );
    toast({
      title: "Product Approved",
      description: "Product is now live on the store.",
    });
  };

  const handleReject = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, status: "rejected" as const } : p
      )
    );
    toast({
      title: "Product Rejected",
      description: "Product has been rejected.",
      variant: "destructive",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { class: string; label: string }> = {
      active: { class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", label: "Active" },
      pending: { class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", label: "Pending Approval" },
      out_of_stock: { class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", label: "Out of Stock" },
      rejected: { class: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", label: "Rejected" },
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {role === "admin" ? "Product Catalog" : "My Products"}
          </h1>
          <p className="text-muted-foreground">
            Manage {role === "seller" ? "your " : "all "}products
          </p>
        </div>
        <Button onClick={() => setShowAddProduct(true)} className="gap-2">
          <Plus size={18} />
          Add New Product
        </Button>
      </div>

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
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  {role === "admin" && <TableHead>Seller</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const statusInfo = getStatusBadge(product.status);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="text-sm">{product.category}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatPKR(product.discountedPrice)}</p>
                          {product.originalPrice > product.discountedPrice && (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatPKR(product.originalPrice)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          "font-medium",
                          product.stock === 0 && "text-destructive"
                        )}>
                          {product.stock}
                        </span>
                      </TableCell>
                      {role === "admin" && (
                        <TableCell className="text-sm">{product.sellerName}</TableCell>
                      )}
                      <TableCell>
                        <Badge className={statusInfo.class}>{statusInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {role === "admin" && product.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(product.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-destructive border-destructive hover:bg-destructive/10"
                                onClick={() => handleReject(product.id)}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye size={14} /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2">
                                <Edit size={14} /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="gap-2 text-destructive">
                                <Trash2 size={14} /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={role === "admin" ? 8 : 7} className="text-center py-8 text-muted-foreground">
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <AddProductForm onClose={() => setShowAddProduct(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductCatalog;
