import { useState } from "react";
import { format } from "date-fns";
import { Zap, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAdminFlashNominations, FlashSaleNomination } from "@/hooks/useFlashSales";
import { useAdminFlashSales } from "@/hooks/useMarketing";
import { formatPKR } from "@/hooks/useProducts";

const AdminFlashNominations = () => {
  const { nominations, isLoading, approveNomination, rejectNomination } = useAdminFlashNominations();
  const { flashSales } = useAdminFlashSales();

  const [selectedNomination, setSelectedNomination] = useState<FlashSaleNomination | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedFlashSaleId, setSelectedFlashSaleId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const pendingNominations = nominations.filter(n => n.status === "pending");
  const activeFlashSales = flashSales.filter(s => s.is_active);

  const handleApprove = async () => {
    if (!selectedNomination || !selectedFlashSaleId) return;
    
    const success = await approveNomination(selectedNomination, selectedFlashSaleId);
    if (success) {
      setApproveDialogOpen(false);
      setSelectedNomination(null);
      setSelectedFlashSaleId("");
    }
  };

  const handleReject = async () => {
    if (!selectedNomination) return;
    
    const success = await rejectNomination(selectedNomination.id, rejectReason);
    if (success) {
      setRejectDialogOpen(false);
      setSelectedNomination(null);
      setRejectReason("");
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-destructive" />
          Flash Sale Nominations
        </h1>
        <p className="text-muted-foreground">
          Review and approve seller flash sale nominations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{pendingNominations.length}</p>
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
                <p className="text-sm text-muted-foreground">Approved Today</p>
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
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Flash Sales</p>
                <p className="text-2xl font-bold">{activeFlashSales.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Nominations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Pending Nominations
          </CardTitle>
          <CardDescription>
            Review seller submissions for flash sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingNominations.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground text-sm">
                No pending nominations to review.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seller</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Original</TableHead>
                  <TableHead>Flash Price</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingNominations.map((nom) => {
                  const discount = Math.round(((nom.original_price_pkr - nom.proposed_price_pkr) / nom.original_price_pkr) * 100);
                  return (
                    <TableRow key={nom.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{nom.seller?.full_name || "Unknown"}</p>
                          <p className="text-muted-foreground text-xs">{nom.seller?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {nom.product?.images?.[0] && (
                            <img 
                              src={nom.product.images[0]} 
                              alt="" 
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <span className="line-clamp-1 font-medium">{nom.product?.title || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground line-through">
                        {formatPKR(nom.original_price_pkr)}
                      </TableCell>
                      <TableCell className="font-bold text-destructive">
                        {formatPKR(nom.proposed_price_pkr)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">-{discount}%</Badge>
                      </TableCell>
                      <TableCell>{nom.stock_limit} units</TableCell>
                      <TableCell className="text-sm">
                        <div>
                          {format(new Date(nom.time_slot_start), "MMM d, HH:mm")}
                        </div>
                        <div className="text-muted-foreground">
                          to {format(new Date(nom.time_slot_end), "HH:mm")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => {
                              setSelectedNomination(nom);
                              setApproveDialogOpen(true);
                            }}
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
                              setRejectDialogOpen(true);
                            }}
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* All Nominations */}
      <Card>
        <CardHeader>
          <CardTitle>All Nominations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Seller</TableHead>
                <TableHead>Flash Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nominations.map((nom) => {
                const discount = Math.round(((nom.original_price_pkr - nom.proposed_price_pkr) / nom.original_price_pkr) * 100);
                return (
                  <TableRow key={nom.id}>
                    <TableCell className="font-medium">{nom.product?.title || "Unknown"}</TableCell>
                    <TableCell>{nom.seller?.full_name || "Unknown"}</TableCell>
                    <TableCell className="text-destructive font-semibold">
                      {formatPKR(nom.proposed_price_pkr)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">-{discount}%</Badge>
                    </TableCell>
                    <TableCell>
                      {nom.status === "pending" && (
                        <Badge variant="outline" className="border-yellow-500 text-yellow-600">Pending</Badge>
                      )}
                      {nom.status === "approved" && (
                        <Badge className="bg-green-500">Approved</Badge>
                      )}
                      {nom.status === "rejected" && (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(nom.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Flash Sale Nomination</DialogTitle>
            <DialogDescription>
              Select which flash sale campaign to add this product to.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {activeFlashSales.length === 0 ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">No active flash sales</p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Create a flash sale campaign first before approving nominations.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label>Select Flash Sale Campaign</Label>
                  <Select value={selectedFlashSaleId} onValueChange={setSelectedFlashSaleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeFlashSales.map((sale) => (
                        <SelectItem key={sale.id} value={sale.id}>
                          {sale.campaign_name} (ends {format(new Date(sale.end_date), "MMM d")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedNomination && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Product to add:</p>
                    <p className="font-medium">{selectedNomination.product?.title}</p>
                    <p className="text-destructive font-bold">
                      {formatPKR(selectedNomination.proposed_price_pkr)}
                      <span className="text-muted-foreground line-through ml-2 font-normal text-sm">
                        {formatPKR(selectedNomination.original_price_pkr)}
                      </span>
                    </p>
                  </div>
                )}

                <Button onClick={handleApprove} className="w-full" disabled={!selectedFlashSaleId}>
                  <CheckCircle size={16} className="mr-2" />
                  Approve & Add to Campaign
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Nomination</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection (optional but recommended).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rejection Reason</Label>
              <Textarea
                placeholder="e.g., Discount too low, product not suitable, etc."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <Button onClick={handleReject} variant="destructive" className="w-full">
              <XCircle size={16} className="mr-2" />
              Reject Nomination
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFlashNominations;
