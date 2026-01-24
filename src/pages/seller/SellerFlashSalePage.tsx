import { useState } from "react";
import { format } from "date-fns";
import { Zap, Plus, Trash2, Clock, AlertCircle, CheckCircle, XCircle, Loader2, Wallet, AlertTriangle } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSellerFlashNominations, useActiveFlashSaleSessions, useFlashSaleFee } from "@/hooks/useFlashSales";
import { useSellerProducts, formatPKR } from "@/hooks/useProducts";
import VerifiedSellerGuard from "@/components/seller/VerifiedSellerGuard";
import { Link } from "react-router-dom";

const SellerFlashSalePage = () => {
  const { nominations, isLoading, createNomination, deleteNomination, walletBalance } = useSellerFlashNominations();
  const { products: sellerProducts } = useSellerProducts();
  const { data: activeSessions = [] } = useActiveFlashSaleSessions();
  const { data: feePerProduct = 10 } = useFlashSaleFee();

  const [showNominateDialog, setShowNominateDialog] = useState(false);
  const [formData, setFormData] = useState({
    flash_sale_id: "",
    product_id: "",
    proposed_price_pkr: "",
    stock_limit: "50",
  });

  const selectedSession = activeSessions.find(s => s.id === formData.flash_sale_id);
  const selectedProduct = sellerProducts.find(p => p.id === formData.product_id);
  
  const discountPercentage = selectedProduct && formData.proposed_price_pkr
    ? Math.round(((selectedProduct.price_pkr - parseFloat(formData.proposed_price_pkr)) / selectedProduct.price_pkr) * 100)
    : 0;

  const totalFee = feePerProduct; // Fee per product
  const hasInsufficientBalance = walletBalance < totalFee;

  const handleSubmit = async () => {
    if (!selectedProduct || !formData.proposed_price_pkr || !selectedSession) return;

    const success = await createNomination({
      flash_sale_id: formData.flash_sale_id,
      product_id: formData.product_id,
      proposed_price_pkr: parseFloat(formData.proposed_price_pkr),
      original_price_pkr: selectedProduct.price_pkr,
      stock_limit: parseInt(formData.stock_limit) || 50,
      time_slot_start: selectedSession.start_date,
      time_slot_end: selectedSession.end_date,
      total_fee_pkr: totalFee,
    });

    if (success) {
      setShowNominateDialog(false);
      setFormData({
        flash_sale_id: "",
        product_id: "",
        proposed_price_pkr: "",
        stock_limit: "50",
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-destructive" />
              Flash Sale Applications
            </h1>
            <p className="text-muted-foreground">
              Apply to feature your products in flash sales
            </p>
          </div>

          <Dialog open={showNominateDialog} onOpenChange={setShowNominateDialog}>
            <DialogTrigger asChild>
              <Button disabled={activeSessions.length === 0}>
                <Plus size={18} className="mr-2" />
                Apply for Flash Sale
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Apply for Flash Sale</DialogTitle>
                <DialogDescription>
                  Select a flash sale session and product. Fee: Rs. {feePerProduct} per product.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Wallet Balance Check */}
                <Alert variant={hasInsufficientBalance ? "destructive" : "default"}>
                  <Wallet className="h-4 w-4" />
                  <AlertTitle>Wallet Balance</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>Current Balance: {formatPKR(walletBalance)}</span>
                    {hasInsufficientBalance && (
                      <Link to="/seller/wallet">
                        <Button size="sm" variant="outline">Top Up</Button>
                      </Link>
                    )}
                  </AlertDescription>
                </Alert>

                {hasInsufficientBalance && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient balance. Please top up your wallet to apply. Required: Rs. {totalFee}
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <Label>Select Flash Sale Session</Label>
                  <Select
                    value={formData.flash_sale_id}
                    onValueChange={(v) => setFormData({ ...formData, flash_sale_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a session" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSessions.map((session) => (
                        <SelectItem key={session.id} value={session.id}>
                          {session.campaign_name} ({format(new Date(session.start_date), "MMM d")} - {format(new Date(session.end_date), "MMM d")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                {/* Fee Summary */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Application Fee:</span>
                      <span className="font-bold text-lg">{formatPKR(totalFee)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Fee will be deducted from your wallet upon admin approval.
                    </p>
                  </CardContent>
                </Card>

                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={
                    !formData.flash_sale_id || 
                    !formData.product_id || 
                    !formData.proposed_price_pkr || 
                    discountPercentage < 20 ||
                    hasInsufficientBalance
                  }
                >
                  Submit Application
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Sessions Alert */}
        {activeSessions.length > 0 && (
          <Alert className="border-primary/50 bg-primary/5">
            <Zap className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">Flash Sales Open for Applications!</AlertTitle>
            <AlertDescription>
              {activeSessions.length} session(s) accepting applications. Apply now to feature your products!
            </AlertDescription>
          </Alert>
        )}

        {activeSessions.length === 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>No Active Sessions</AlertTitle>
            <AlertDescription>
              There are no flash sale sessions currently accepting applications. Check back later!
            </AlertDescription>
          </Alert>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Wallet</p>
                  <p className="text-xl font-bold">{formatPKR(walletBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
            <CardTitle>Your Applications</CardTitle>
            <CardDescription>Track the status of your flash sale applications</CardDescription>
          </CardHeader>
          <CardContent>
            {nominations.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground text-sm">
                  Apply for a flash sale to boost your product visibility!
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Flash Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Fee</TableHead>
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
                            <div>
                              <span className="line-clamp-1">{nom.product?.title || "Unknown"}</span>
                              <span className="text-xs text-muted-foreground line-through block">
                                {formatPKR(nom.original_price_pkr)}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">
                          {formatPKR(nom.proposed_price_pkr)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">-{discount}%</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={nom.fee_deducted ? "text-green-600" : ""}>
                            {formatPKR(nom.total_fee_pkr)}
                          </span>
                          {nom.fee_deducted && (
                            <Badge variant="outline" className="ml-2 text-xs">Paid</Badge>
                          )}
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
