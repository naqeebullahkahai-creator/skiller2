import { useState } from "react";
import { Search, Wallet, Plus, Minus, UserCircle, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import { useAdminSellers } from "@/hooks/useAdminSellers";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

type TargetType = "customer" | "seller";

interface AdjustmentTarget {
  id: string;
  name: string;
  email?: string;
  balance: number;
  type: TargetType;
  avatarUrl?: string | null;
}

const AdminBalanceAdjustment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TargetType>("customer");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<AdjustmentTarget | null>(null);
  const [adjustType, setAdjustType] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const { customers, isLoading: customersLoading } = useAdminCustomers(searchQuery);
  const { sellers, isLoading: sellersLoading } = useAdminSellers(searchQuery);

  const adjustMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTarget || !user) throw new Error("Missing data");
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) throw new Error("Invalid amount");
      if (!reason.trim()) throw new Error("Reason is required");

      let data: any;
      let error: any;

      if (selectedTarget.type === "customer") {
        const result = await supabase.rpc("adjust_customer_wallet_balance" as any, {
          p_customer_id: selectedTarget.id,
          p_amount: numAmount,
          p_adjustment_type: adjustType,
          p_reason: reason.trim(),
          p_admin_id: user.id,
        });
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase.rpc("adjust_seller_wallet_balance" as any, {
          p_seller_id: selectedTarget.id,
          p_amount: numAmount,
          p_adjustment_type: adjustType,
          p_reason: reason.trim(),
          p_admin_id: user.id,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error("RPC error:", error);
        throw new Error(error.message || "Database error occurred");
      }
      const result = data as any;
      if (!result?.success) throw new Error(result?.message || "Adjustment failed");
      return result;
    },
    onSuccess: (result) => {
      toast.success(`Balance adjusted! New balance: ${formatPKR(result.new_balance)}`);
      queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
      setSelectedTarget(null);
      setAmount("");
      setReason("");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const isLoading = activeTab === "customer" ? customersLoading : sellersLoading;

  const selectCustomer = (c: any) => setSelectedTarget({
    id: c.id, name: c.full_name, email: c.email, balance: c.wallet_balance, type: "customer", avatarUrl: c.avatar_url,
  });

  const selectSeller = (s: any) => setSelectedTarget({
    id: s.user_id, name: s.shop_name, balance: s.wallet_balance, type: "seller", avatarUrl: s.avatar_url,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-primary" />
          Balance Adjustments
        </h1>
        <p className="text-muted-foreground">Manually add or subtract funds from any user or seller wallet</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as TargetType); setSearchQuery(""); }}>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
              <TabsList>
                <TabsTrigger value="customer" className="gap-2"><UserCircle size={16} /> Customers</TabsTrigger>
                <TabsTrigger value="seller" className="gap-2"><Store size={16} /> Sellers</TabsTrigger>
              </TabsList>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </div>

            <TabsContent value="customer">
              <Table>
                <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Balance</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : customers.map((c) => (
                    <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => selectCustomer(c)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {c.avatar_url && <AvatarImage src={c.avatar_url} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{c.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div><p className="font-medium text-sm">{c.full_name}</p><p className="text-xs text-muted-foreground">{c.email}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPKR(c.wallet_balance)}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); selectCustomer(c); }}><Wallet size={14} className="mr-1" /> Adjust</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="seller">
              <Table>
                <TableHeader><TableRow><TableHead>Seller</TableHead><TableHead>Balance</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {isLoading ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}><TableCell colSpan={3}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                  )) : sellers.map((s) => (
                    <TableRow key={s.id} className="cursor-pointer hover:bg-muted/50" onClick={() => selectSeller(s)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {s.avatar_url && <AvatarImage src={s.avatar_url} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{s.shop_name?.charAt(0) || "S"}</AvatarFallback>
                          </Avatar>
                          <div><p className="font-medium text-sm">{s.shop_name}</p><p className="text-xs text-muted-foreground">{s.full_name}</p></div>
                        </div>
                      </TableCell>
                      <TableCell>{formatPKR(s.wallet_balance)}</TableCell>
                      <TableCell><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); selectSeller(s); }}><Wallet size={14} className="mr-1" /> Adjust</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Adjustment Dialog */}
      <Dialog open={!!selectedTarget} onOpenChange={() => setSelectedTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Wallet size={20} /> Adjust Wallet Balance</DialogTitle>
          </DialogHeader>

          {selectedTarget && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  {selectedTarget.avatarUrl && <AvatarImage src={selectedTarget.avatarUrl} />}
                  <AvatarFallback className="bg-primary/10 text-primary">{selectedTarget.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedTarget.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{selectedTarget.type === "customer" ? "Customer" : "Seller"}</Badge>
                    <span className="text-sm text-muted-foreground">Balance: {formatPKR(selectedTarget.balance)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Adjustment Type</Label>
                <RadioGroup value={adjustType} onValueChange={(v) => setAdjustType(v as "add" | "subtract")} className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="add" id="add" />
                    <Label htmlFor="add" className="flex items-center gap-1 cursor-pointer"><Plus size={14} /> Add Funds</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="subtract" id="subtract" />
                    <Label htmlFor="subtract" className="flex items-center gap-1 cursor-pointer"><Minus size={14} /> Subtract Funds</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label>Amount (PKR)</Label>
                <Input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} min="1" />
              </div>

              <div className="space-y-2">
                <Label>Reason *</Label>
                <Textarea placeholder="e.g. Reward credit, Correction, Promotional bonus..." value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className={cn(
                  "p-3 rounded-lg text-sm font-medium border",
                  adjustType === "add" ? "bg-primary/5 text-primary border-primary/20" : "bg-destructive/5 text-destructive border-destructive/20"
                )}>
                  New balance will be: {formatPKR(selectedTarget.balance + (adjustType === "add" ? parseFloat(amount) : -parseFloat(amount)))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTarget(null)}>Cancel</Button>
            <Button
              onClick={() => adjustMutation.mutate()}
              disabled={adjustMutation.isPending || !amount || parseFloat(amount) <= 0 || !reason.trim()}
              variant={adjustType === "subtract" ? "destructive" : "default"}
            >
              {adjustMutation.isPending ? "Processing..." : adjustType === "add" ? "Add Funds" : "Subtract Funds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBalanceAdjustment;
