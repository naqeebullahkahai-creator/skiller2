import { useState } from "react";
import { format } from "date-fns";
import { Zap, Plus, Trash2, Calendar, Clock, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAdminFlashSales, useFlashSaleProducts } from "@/hooks/useMarketing";
import { useActiveProducts, formatPKR } from "@/hooks/useProducts";

const FlashSaleManager = () => {
  const { flashSales, isLoading, createFlashSale, addProductToSale, removeProductFromSale, toggleFlashSaleActive } = useAdminFlashSales();
  const { products: availableProducts } = useActiveProducts(100);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [newSale, setNewSale] = useState({
    campaign_name: "",
    start_date: "",
    end_date: "",
  });
  const [newProduct, setNewProduct] = useState({
    product_id: "",
    flash_price_pkr: "",
    stock_limit: "100",
  });

  const { products: saleProducts, isLoading: productsLoading } = useFlashSaleProducts(selectedSaleId || undefined);

  const handleCreateSale = async () => {
    if (!newSale.campaign_name || !newSale.start_date || !newSale.end_date) return;
    
    const result = await createFlashSale({
      campaign_name: newSale.campaign_name,
      start_date: new Date(newSale.start_date).toISOString(),
      end_date: new Date(newSale.end_date).toISOString(),
    });

    if (result) {
      setShowCreateDialog(false);
      setNewSale({ campaign_name: "", start_date: "", end_date: "" });
    }
  };

  const handleAddProduct = async () => {
    if (!selectedSaleId || !newProduct.product_id || !newProduct.flash_price_pkr) return;

    const product = availableProducts.find(p => p.id === newProduct.product_id);
    if (!product) return;

    const success = await addProductToSale({
      flash_sale_id: selectedSaleId,
      product_id: newProduct.product_id,
      flash_price_pkr: parseFloat(newProduct.flash_price_pkr),
      original_price_pkr: product.price_pkr,
      stock_limit: parseInt(newProduct.stock_limit) || 100,
    });

    if (success) {
      setShowAddProductDialog(false);
      setNewProduct({ product_id: "", flash_price_pkr: "", stock_limit: "100" });
    }
  };

  const getSaleStatus = (sale: typeof flashSales[0]) => {
    const now = new Date();
    const start = new Date(sale.start_date);
    const end = new Date(sale.end_date);

    if (!sale.is_active) return { label: "Inactive", variant: "secondary" as const };
    if (now < start) return { label: "Scheduled", variant: "outline" as const };
    if (now > end) return { label: "Ended", variant: "destructive" as const };
    return { label: "Active", variant: "default" as const };
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
            <Zap className="h-6 w-6 text-primary" />
            Flash Sale Manager
          </h1>
          <p className="text-muted-foreground">Create and manage flash sale campaigns</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Flash Sale Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g., 11.11 Mega Sale"
                  value={newSale.campaign_name}
                  onChange={(e) => setNewSale({ ...newSale, campaign_name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newSale.start_date}
                    onChange={(e) => setNewSale({ ...newSale, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={newSale.end_date}
                    onChange={(e) => setNewSale({ ...newSale, end_date: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleCreateSale} className="w-full">
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Flash Sales List */}
      <div className="grid gap-4">
        {flashSales.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Zap size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Flash Sales Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first flash sale campaign to boost sales!</p>
            </CardContent>
          </Card>
        ) : (
          flashSales.map((sale) => {
            const status = getSaleStatus(sale);
            return (
              <Card key={sale.id} className={selectedSaleId === sale.id ? "ring-2 ring-primary" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{sale.campaign_name}</CardTitle>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={sale.is_active}
                        onCheckedChange={(checked) => toggleFlashSaleActive(sale.id, checked)}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSaleId(selectedSaleId === sale.id ? null : sale.id)}
                      >
                        {selectedSaleId === sale.id ? "Hide Products" : "Manage Products"}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {format(new Date(sale.start_date), "MMM d, yyyy")}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {format(new Date(sale.end_date), "MMM d, yyyy HH:mm")}
                    </span>
                  </div>
                </CardHeader>

                {selectedSaleId === sale.id && (
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Package size={16} />
                        Products in this sale
                      </h4>
                      <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus size={14} className="mr-1" />
                            Add Product
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Product to Flash Sale</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Select Product</Label>
                              <Select
                                value={newProduct.product_id}
                                onValueChange={(v) => setNewProduct({ ...newProduct, product_id: v })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableProducts.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      {p.title} - {formatPKR(p.price_pkr)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Flash Sale Price (PKR)</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 999"
                                value={newProduct.flash_price_pkr}
                                onChange={(e) => setNewProduct({ ...newProduct, flash_price_pkr: e.target.value })}
                              />
                            </div>
                            <div>
                              <Label>Stock Limit</Label>
                              <Input
                                type="number"
                                placeholder="e.g., 100"
                                value={newProduct.stock_limit}
                                onChange={(e) => setNewProduct({ ...newProduct, stock_limit: e.target.value })}
                              />
                            </div>
                            <Button onClick={handleAddProduct} className="w-full">
                              Add to Flash Sale
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    {productsLoading ? (
                      <div className="py-4 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </div>
                    ) : saleProducts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">
                        No products added yet
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Original</TableHead>
                            <TableHead>Flash Price</TableHead>
                            <TableHead>Discount</TableHead>
                            <TableHead>Sold/Limit</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {saleProducts.map((sp) => {
                            const discount = Math.round(((sp.original_price_pkr - sp.flash_price_pkr) / sp.original_price_pkr) * 100);
                            const soldPercent = (sp.sold_count / sp.stock_limit) * 100;
                            return (
                              <TableRow key={sp.id}>
                                <TableCell className="font-medium">
                                  {sp.product?.title || "Unknown Product"}
                                </TableCell>
                                <TableCell className="text-muted-foreground line-through">
                                  {formatPKR(sp.original_price_pkr)}
                                </TableCell>
                                <TableCell className="text-primary font-semibold">
                                  {formatPKR(sp.flash_price_pkr)}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="destructive">-{discount}%</Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="text-sm">
                                      {sp.sold_count} / {sp.stock_limit}
                                    </div>
                                    <Progress value={soldPercent} className="h-1.5" />
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => removeProductFromSale(sp.id)}
                                  >
                                    <Trash2 size={16} />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FlashSaleManager;
