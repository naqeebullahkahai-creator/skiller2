import { useState } from "react";
import { format } from "date-fns";
import { Ticket, Plus, Trash2, Percent, DollarSign, Calendar, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAdminVouchers } from "@/hooks/useMarketing";
import { formatPKR } from "@/hooks/useProducts";

const VoucherManager = () => {
  const { vouchers, isLoading, createVoucher, toggleVoucherActive, deleteVoucher } = useAdminVouchers();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    minimum_spend_pkr: "",
    expiry_date: "",
    usage_limit: "",
  });

  const handleCreate = async () => {
    if (!newVoucher.code || !newVoucher.discount_value || !newVoucher.expiry_date) return;

    const success = await createVoucher({
      code: newVoucher.code,
      discount_type: newVoucher.discount_type,
      discount_value: parseFloat(newVoucher.discount_value),
      minimum_spend_pkr: parseFloat(newVoucher.minimum_spend_pkr) || 0,
      expiry_date: new Date(newVoucher.expiry_date).toISOString(),
      usage_limit: newVoucher.usage_limit ? parseInt(newVoucher.usage_limit) : undefined,
    });

    if (success) {
      setShowCreateDialog(false);
      setNewVoucher({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        minimum_spend_pkr: "",
        expiry_date: "",
        usage_limit: "",
      });
    }
  };

  const getVoucherStatus = (voucher: typeof vouchers[0]) => {
    const now = new Date();
    const expiry = new Date(voucher.expiry_date);

    if (!voucher.is_active) return { label: "Inactive", variant: "secondary" as const };
    if (now > expiry) return { label: "Expired", variant: "destructive" as const };
    if (voucher.usage_limit && voucher.used_count >= voucher.usage_limit) {
      return { label: "Limit Reached", variant: "outline" as const };
    }
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
            <Ticket className="h-6 w-6 text-primary" />
            Voucher & Promo Codes
          </h1>
          <p className="text-muted-foreground">Create discount codes for your customers</p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Promo Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Voucher Code</Label>
                <Input
                  placeholder="e.g., WELCOME10"
                  value={newVoucher.code}
                  onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value.toUpperCase() })}
                  className="uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Discount Type</Label>
                  <Select
                    value={newVoucher.discount_type}
                    onValueChange={(v: "percentage" | "fixed") => setNewVoucher({ ...newVoucher, discount_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount (PKR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Discount Value</Label>
                  <Input
                    type="number"
                    placeholder={newVoucher.discount_type === "percentage" ? "e.g., 10" : "e.g., 500"}
                    value={newVoucher.discount_value}
                    onChange={(e) => setNewVoucher({ ...newVoucher, discount_value: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Spend (PKR)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000"
                    value={newVoucher.minimum_spend_pkr}
                    onChange={(e) => setNewVoucher({ ...newVoucher, minimum_spend_pkr: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Usage Limit (optional)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={newVoucher.usage_limit}
                    onChange={(e) => setNewVoucher({ ...newVoucher, usage_limit: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Expiry Date</Label>
                <Input
                  type="datetime-local"
                  value={newVoucher.expiry_date}
                  onChange={(e) => setNewVoucher({ ...newVoucher, expiry_date: e.target.value })}
                />
              </div>
              <Button onClick={handleCreate} className="w-full">
                Create Voucher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {vouchers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Vouchers Yet</h3>
            <p className="text-muted-foreground mb-4">Create promo codes to offer discounts!</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Spend</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Expiry</TableHead>
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
                      <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                        {voucher.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {voucher.discount_type === "percentage" ? (
                          <>
                            <Percent size={14} className="text-primary" />
                            <span className="font-medium">{voucher.discount_value}%</span>
                          </>
                        ) : (
                          <>
                            <span className="font-medium">{formatPKR(voucher.discount_value)}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {voucher.minimum_spend_pkr > 0 ? formatPKR(voucher.minimum_spend_pkr) : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users size={14} className="text-muted-foreground" />
                        {voucher.used_count}
                        {voucher.usage_limit && ` / ${voucher.usage_limit}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar size={14} className="text-muted-foreground" />
                        {format(new Date(voucher.expiry_date), "MMM d, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={voucher.is_active}
                        onCheckedChange={(checked) => toggleVoucherActive(voucher.id, checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
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
        </Card>
      )}
    </div>
  );
};

export default VoucherManager;
