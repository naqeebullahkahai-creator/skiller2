import { useState } from "react";
import { useSellerVouchers, CreateVoucherData } from "@/hooks/useSellerVouchers";
import { useSellerProducts, formatPKR } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Ticket, Trash2, Copy, Percent, Banknote, Gift, Tag } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const SellerVouchersPage = () => {
  const { vouchers, isLoading, createVoucher, isCreating, toggleActive, deleteVoucher } = useSellerVouchers();
  const { products } = useSellerProducts();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateVoucherData>({
    code: "",
    title: "",
    description: "",
    discount_type: "percentage",
    discount_value: 10,
    minimum_spend_pkr: 0,
    expiry_date: "",
    usage_limit: undefined,
    voucher_type: "code",
    one_per_customer: false,
    product_id: undefined,
  });

  const handleCreate = () => {
    if (!formData.code.trim()) {
      toast({
        title: "Error",
        description: "Voucher code is required",
        variant: "destructive",
      });
      return;
    }

    createVoucher(formData, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setFormData({
          code: "",
          title: "",
          description: "",
          discount_type: "percentage",
          discount_value: 10,
          minimum_spend_pkr: 0,
          expiry_date: "",
          usage_limit: undefined,
          voucher_type: "code",
          one_per_customer: false,
          product_id: undefined,
        });
      },
    });
  };

  const getVoucherStatus = (voucher: typeof vouchers[0]) => {
    if (!voucher.is_active) return { label: "Inactive", variant: "secondary" as const };
    if (new Date(voucher.expiry_date) < new Date()) return { label: "Expired", variant: "destructive" as const };
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return { label: "Limit Reached", variant: "outline" as const };
    }
    return { label: "Active", variant: "default" as const };
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!", description: `Code "${code}" copied to clipboard.` });
  };

  const stats = {
    total: vouchers.length,
    active: vouchers.filter(v => v.is_active && new Date(v.expiry_date) > new Date()).length,
    collectible: vouchers.filter(v => v.voucher_type === "collectible").length,
    totalUsed: vouchers.reduce((sum, v) => sum + v.used_count, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vouchers</h1>
          <p className="text-muted-foreground">Create and manage discount vouchers for your customers</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Voucher</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Voucher Type */}
              <div className="space-y-3">
                <Label>Voucher Type</Label>
                <RadioGroup
                  value={formData.voucher_type}
                  onValueChange={(value: "code" | "collectible") => 
                    setFormData({ ...formData, voucher_type: value })
                  }
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="code" id="type-code" />
                    <Label htmlFor="type-code" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Tag size={18} />
                        <span className="font-medium">Code-based</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Users enter the code at checkout
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="collectible" id="type-collectible" />
                    <Label htmlFor="type-collectible" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <Gift size={18} />
                        <span className="font-medium">Collectible</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Users claim from your shop page
                      </p>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Voucher Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., SAVE20"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Display Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Eid Special Discount"
                  />
                </div>
              </div>

              {formData.voucher_type === "collectible" && (
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your offer..."
                    rows={2}
                  />
                </div>
              )}

              {/* Discount Settings */}
              <div className="space-y-3">
                <Label>Discount Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant={formData.discount_type === "percentage" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, discount_type: "percentage" })}
                    className="h-auto py-3"
                  >
                    <Percent size={18} className="mr-2" />
                    Percentage (%)
                  </Button>
                  <Button
                    type="button"
                    variant={formData.discount_type === "fixed" ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, discount_type: "fixed" })}
                    className="h-auto py-3"
                  >
                    <Banknote size={18} className="mr-2" />
                    Fixed Amount (PKR)
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Discount {formData.discount_type === "percentage" ? "(%)" : "(PKR)"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                    min={0}
                    max={formData.discount_type === "percentage" ? 100 : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimum_spend">Minimum Spend (PKR)</Label>
                  <Input
                    id="minimum_spend"
                    type="number"
                    value={formData.minimum_spend_pkr}
                    onChange={(e) => setFormData({ ...formData, minimum_spend_pkr: Number(e.target.value) })}
                    min={0}
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date *</Label>
                  <Input
                    id="expiry_date"
                    type="datetime-local"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usage_limit">Usage Limit (Optional)</Label>
                  <Input
                    id="usage_limit"
                    type="number"
                    value={formData.usage_limit || ""}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      usage_limit: e.target.value ? Number(e.target.value) : undefined 
                    })}
                    placeholder="Unlimited"
                    min={1}
                  />
                </div>
              </div>

              {/* Product-specific */}
              <div className="space-y-2">
                <Label htmlFor="product">Apply to Product (Optional)</Label>
                <Select
                  value={formData.product_id || "all"}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    product_id: value === "all" ? undefined : value 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All my products</SelectItem>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* One per customer */}
              <div className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <Label htmlFor="one_per_customer">One per customer</Label>
                  <p className="text-xs text-muted-foreground">
                    Limit each customer to use this voucher only once
                  </p>
                </div>
                <Switch
                  id="one_per_customer"
                  checked={formData.one_per_customer}
                  onCheckedChange={(checked) => setFormData({ ...formData, one_per_customer: checked })}
                />
              </div>

              <Button onClick={handleCreate} disabled={isCreating} className="w-full">
                {isCreating ? "Creating..." : "Create Voucher"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vouchers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Collectible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.collectible}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalUsed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket size={20} />
            Your Vouchers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Ticket size={48} className="mx-auto mb-4 opacity-50" />
              <p>No vouchers yet. Create your first voucher!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min. Spend</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((voucher) => {
                  const status = getVoucherStatus(voucher);
                  return (
                    <TableRow key={voucher.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {voucher.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCode(voucher.code)}
                          >
                            <Copy size={12} />
                          </Button>
                        </div>
                        {voucher.title && (
                          <p className="text-xs text-muted-foreground mt-1">{voucher.title}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={voucher.voucher_type === "collectible" ? "secondary" : "outline"}>
                          {voucher.voucher_type === "collectible" ? (
                            <><Gift size={12} className="mr-1" /> Collectible</>
                          ) : (
                            <><Tag size={12} className="mr-1" /> Code</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {voucher.discount_type === "percentage"
                          ? `${voucher.discount_value}%`
                          : formatPKR(voucher.discount_value)}
                      </TableCell>
                      <TableCell>
                        {voucher.minimum_spend_pkr > 0
                          ? formatPKR(voucher.minimum_spend_pkr)
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {voucher.used_count}
                        {voucher.usage_limit && ` / ${voucher.usage_limit}`}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(voucher.expiry_date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={voucher.is_active}
                          onCheckedChange={(checked) => toggleActive({ id: voucher.id, isActive: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteVoucher(voucher.id)}
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
      </Card>
    </div>
  );
};

export default SellerVouchersPage;
