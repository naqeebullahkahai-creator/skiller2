import { useState } from "react";
import { format } from "date-fns";
import { Zap, Plus, Trash2, Calendar, Clock, Package, Loader2, Send, CheckCircle, XCircle, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminFlashSales, useFlashSaleProducts } from "@/hooks/useMarketing";
import { useAdminFlashNominations, useFlashSaleFee } from "@/hooks/useFlashSales";
import { useActiveProducts, formatPKR } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const FlashSaleManager = () => {
  const { flashSales, isLoading, createFlashSale, addProductToSale, removeProductFromSale, toggleFlashSaleActive, refetch } = useAdminFlashSales();
  const { nominations, isLoading: nominationsLoading, approveNomination, rejectNomination } = useAdminFlashNominations();
  const { products: availableProducts } = useActiveProducts(100);
  const { data: feePerProduct = 10 } = useFlashSaleFee();
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [selectedNomination, setSelectedNomination] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);
  
  const [newSale, setNewSale] = useState({
    campaign_name: "",
    start_date: "",
    end_date: "",
    application_deadline: "",
    fee_per_product_pkr: feePerProduct.toString(),
  });
  const [newProduct, setNewProduct] = useState({
    product_id: "",
    flash_price_pkr: "",
    stock_limit: "100",
  });

  const { products: saleProducts, isLoading: productsLoading } = useFlashSaleProducts(selectedSaleId || undefined);

  const pendingNominations = nominations.filter(n => n.status === "pending");

  const handleCreateSale = async () => {
    if (!newSale.campaign_name || !newSale.start_date || !newSale.end_date) {
      toast.error("Please fill in campaign name, start date, and end date");
      return;
    }
    
    const feeValue = parseFloat(newSale.fee_per_product_pkr) || feePerProduct;
    
    const result = await createFlashSale({
      campaign_name: newSale.campaign_name,
      start_date: new Date(newSale.start_date).toISOString(),
      end_date: new Date(newSale.end_date).toISOString(),
      application_deadline: newSale.application_deadline ? new Date(newSale.application_deadline).toISOString() : undefined,
      fee_per_product_pkr: feeValue,
    });

    if (result) {
      setShowCreateDialog(false);
      setNewSale({ campaign_name: "", start_date: "", end_date: "", application_deadline: "", fee_per_product_pkr: feePerProduct.toString() });
      toast.success("Campaign created successfully! Click 'Launch & Notify Sellers' to start accepting applications.");
    }
  };

  const handleLaunchSession = async (saleId: string) => {
    setIsLaunching(true);
    try {
      // Call the function to notify all sellers
      const result = await supabase.rpc("notify_sellers_flash_sale", {
        p_flash_sale_id: saleId,
      });

      if (result.error) throw result.error;

      const count = typeof result.data === 'number' ? result.data : 0;
      toast.success(`Flash sale launched! ${count} sellers notified.`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to launch flash sale");
    } finally {
      setIsLaunching(false);
    }
  };

  const handleApproveNomination = async (nomination: any) => {
    if (!nomination.flash_sale_id) {
      toast.error("This nomination is not linked to a flash sale session");
      return;
    }

    try {
      // Deduct fee from seller wallet
      const result = await supabase.rpc("deduct_flash_sale_fee", {
        p_nomination_id: nomination.id,
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
      });

      if (result.error) throw result.error;
      
      const data = result.data as { success: boolean; message: string; amount_deducted?: number } | null;
      
      if (!data?.success) {
        toast.error(data?.message || "Failed to deduct fee");
        return;
      }

      // Add product to flash sale
      await addProductToSale({
        flash_sale_id: nomination.flash_sale_id,
        product_id: nomination.product_id,
        flash_price_pkr: nomination.proposed_price_pkr,
        original_price_pkr: nomination.original_price_pkr,
        stock_limit: nomination.stock_limit,
      });

      toast.success(`Approved! Rs. ${nomination.total_fee_pkr} deducted from seller wallet.`);
    } catch (error: any) {
      toast.error(error.message || "Failed to approve nomination");
    }
  };

  const handleRejectNomination = async () => {
    if (!selectedNomination) return;
    
    await rejectNomination(selectedNomination.id, rejectReason);
    
    // Notify seller
    await supabase.from("notifications").insert({
      user_id: selectedNomination.seller_id,
      title: "Flash Sale Application Rejected",
      message: rejectReason || "Your flash sale application was not approved.",
      notification_type: "promotion",
      link: "/seller/flash-sale",
    });

    setShowRejectDialog(false);
    setSelectedNomination(null);
    setRejectReason("");
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
    if ((sale as any).status === "accepting_applications") return { label: "Open for Applications", variant: "default" as const };
    if (now < start) return { label: "Scheduled", variant: "outline" as const };
    if (now > end) return { label: "Ended", variant: "destructive" as const };
    return { label: "Live", variant: "default" as const };
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
          <p className="text-muted-foreground">Create campaigns, review applications & manage flash sales</p>
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
              <div>
                <Label>Fee per Product (PKR)</Label>
                <Input
                  type="number"
                  value={newSale.fee_per_product_pkr}
                  onChange={(e) => setNewSale({ ...newSale, fee_per_product_pkr: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Amount charged to sellers per product application
                </p>
              </div>
              <Button onClick={handleCreateSale} className="w-full">
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="applications" className="relative">
            Applications
            {pendingNominations.length > 0 && (
              <Badge className="ml-2 bg-destructive">{pendingNominations.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold">
                      {flashSales.filter(s => s.is_active).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <Users className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Apps</p>
                    <p className="text-2xl font-bold">{pendingNominations.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fee/Product</p>
                    <p className="text-2xl font-bold">Rs. {feePerProduct}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold">{flashSales.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Flash Sales List */}
          <div className="grid gap-4">
            {flashSales.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Zap size={48} className="mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Flash Sales Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first flash sale campaign!</p>
                </CardContent>
              </Card>
            ) : (
              flashSales.map((sale) => {
                const status = getSaleStatus(sale);
                const isAcceptingApps = (sale as any).status === "accepting_applications";
                const isDraft = (sale as any).status === "draft";
                
                return (
                  <Card key={sale.id} className={selectedSaleId === sale.id ? "ring-2 ring-primary" : ""}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">{sale.campaign_name}</CardTitle>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {isDraft && (
                            <Button
                              size="sm"
                              onClick={() => handleLaunchSession(sale.id)}
                              disabled={isLaunching}
                            >
                              <Send size={14} className="mr-1" />
                              {isLaunching ? "Launching..." : "Launch & Notify Sellers"}
                            </Button>
                          )}
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
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          Rs. {(sale as any).fee_per_product_pkr || feePerProduct}/product
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
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Seller Applications</CardTitle>
              <CardDescription>Review and approve/reject flash sale applications from sellers</CardDescription>
            </CardHeader>
            <CardContent>
              {nominationsLoading ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              ) : nominations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No Applications</h3>
                  <p className="text-muted-foreground">No seller applications to review</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Seller</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Flash Price</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nominations.map((nom) => {
                      const discount = Math.round(((nom.original_price_pkr - nom.proposed_price_pkr) / nom.original_price_pkr) * 100);
                      return (
                        <TableRow key={nom.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{nom.seller?.full_name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{nom.seller?.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {nom.product?.images?.[0] && (
                                <img src={nom.product.images[0]} alt="" className="w-10 h-10 object-cover rounded" />
                              )}
                              <span className="line-clamp-1">{nom.product?.title || "Unknown"}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-destructive">
                            {formatPKR(nom.proposed_price_pkr)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="destructive">-{discount}%</Badge>
                          </TableCell>
                          <TableCell>
                            {formatPKR(nom.total_fee_pkr)}
                            {nom.fee_deducted && <Badge className="ml-1 bg-green-500 text-xs">Paid</Badge>}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              nom.status === "approved" ? "default" :
                              nom.status === "rejected" ? "destructive" : "outline"
                            }>
                              {nom.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {nom.status === "pending" && (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => handleApproveNomination(nom)}
                                >
                                  <CheckCircle size={14} className="mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-destructive border-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setSelectedNomination(nom);
                                    setShowRejectDialog(true);
                                  }}
                                >
                                  <XCircle size={14} className="mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Rejection (optional)</Label>
              <Textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter reason for rejection..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectNomination}>
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlashSaleManager;
