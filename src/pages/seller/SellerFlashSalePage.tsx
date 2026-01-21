import { useState } from "react";
import { format } from "date-fns";
import { Zap, Plus, Trash2, Clock, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSellerFlashNominations } from "@/hooks/useFlashSales";
import { useSellerProducts, formatPKR } from "@/hooks/useProducts";
import VerifiedSellerGuard from "@/components/seller/VerifiedSellerGuard";

const SellerFlashSalePage = () => {
  const { nominations, isLoading, createNomination, deleteNomination } = useSellerFlashNominations();
  const { products: sellerProducts } = useSellerProducts();

  const [showNominateDialog, setShowNominateDialog] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    proposed_price_pkr: "",
    stock_limit: "50",
    time_slot_start: "",
    time_slot_end: "",
  });

  const selectedProduct = sellerProducts.find(p => p.id === formData.product_id);
  const discountPercentage = selectedProduct && formData.proposed_price_pkr
    ? Math.round(((selectedProduct.price_pkr - parseFloat(formData.proposed_price_pkr)) / selectedProduct.price_pkr) * 100)
    : 0;

  const handleSubmit = async () => {
    if (!selectedProduct || !formData.proposed_price_pkr || !formData.time_slot_start || !formData.time_slot_end) return;

    const success = await createNomination({
      product_id: formData.product_id,
      proposed_price_pkr: parseFloat(formData.proposed_price_pkr),
      original_price_pkr: selectedProduct.price_pkr,
      stock_limit: parseInt(formData.stock_limit) || 50,
      time_slot_start: new Date(formData.time_slot_start).toISOString(),
      time_slot_end: new Date(formData.time_slot_end).toISOString(),
    });

    if (success) {
      setShowNominateDialog(false);
      setFormData({
        product_id: "",
        proposed_price_pkr: "",
        stock_limit: "50",
        time_slot_start: "",
        time_slot_end: "",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="border-yellow-500 text-yellow-600"><Clock size={12} className="mr-1" /> Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500"><CheckCircle size={12} className="mr-1" /> Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle size={12} className="mr-1" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <VerifiedSellerGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-destructive" />
              Flash Sale Nominations
            </h1>
            <p className="text-muted-foreground">
              Nominate your products for flash sales with at least 20% discount
            </p>
          </div>

          <Dialog open={showNominateDialog} onOpenChange={setShowNominateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={18} className="mr-2" />
                Nominate Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Nominate Product for Flash Sale</DialogTitle>
                <DialogDescription>
                  Submit your product for admin approval. Minimum 20% discount required.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Flash sale products must have at least 20% discount to participate.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label>Select Product</Label>
                  <Select
                    value={formData.product_id}
                    onValueChange={(v) => setFormData({ ...formData, product_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {sellerProducts
                        .filter(p => p.status === "active")
                        .map((p) => (
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
                    placeholder="Enter flash sale price"
                    value={formData.proposed_price_pkr}
                    onChange={(e) => setFormData({ ...formData, proposed_price_pkr: e.target.value })}
                  />
                  {selectedProduct && formData.proposed_price_pkr && (
                    <p className={`text-sm mt-1 ${discountPercentage >= 20 ? "text-green-600" : "text-destructive"}`}>
                      {discountPercentage}% discount 
                      {discountPercentage < 20 && " (minimum 20% required)"}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Stock Limit for Flash Sale</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 50"
                    value={formData.stock_limit}
                    onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.time_slot_start}
                      onChange={(e) => setFormData({ ...formData, time_slot_start: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>End Time</Label>
                    <Input
                      type="datetime-local"
                      value={formData.time_slot_end}
                      onChange={(e) => setFormData({ ...formData, time_slot_end: e.target.value })}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={!formData.product_id || !formData.proposed_price_pkr || discountPercentage < 20}
                >
                  Submit for Approval
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">
                    {nominations.filter(n => n.status === "pending").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">
                    {nominations.filter(n => n.status === "approved").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold">
                    {nominations.filter(n => n.status === "rejected").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Nominations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Nominations</CardTitle>
            <CardDescription>Track the status of your flash sale nominations</CardDescription>
          </CardHeader>
          <CardContent>
            {nominations.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No nominations yet</h3>
                <p className="text-muted-foreground text-sm">
                  Nominate your first product for a flash sale!
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Original Price</TableHead>
                    <TableHead>Flash Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nominations.map((nom) => {
                    const discount = Math.round(((nom.original_price_pkr - nom.proposed_price_pkr) / nom.original_price_pkr) * 100);
                    return (
                      <TableRow key={nom.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {nom.product?.images?.[0] && (
                              <img 
                                src={nom.product.images[0]} 
                                alt="" 
                                className="w-10 h-10 object-cover rounded"
                              />
                            )}
                            <span className="line-clamp-1">{nom.product?.title || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground line-through">
                          {formatPKR(nom.original_price_pkr)}
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          {formatPKR(nom.proposed_price_pkr)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">-{discount}%</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>
                            {format(new Date(nom.time_slot_start), "MMM d, HH:mm")}
                          </div>
                          <div className="text-muted-foreground">
                            to {format(new Date(nom.time_slot_end), "MMM d, HH:mm")}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(nom.status)}</TableCell>
                        <TableCell>
                          {nom.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => deleteNomination(nom.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          )}
                          {nom.status === "rejected" && nom.admin_notes && (
                            <span className="text-xs text-destructive">{nom.admin_notes}</span>
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
      </div>
    </VerifiedSellerGuard>
  );
};

export default SellerFlashSalePage;
