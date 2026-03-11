import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, TrendingUp, Clock, Wallet, ArrowDownCircle, Plus, CreditCard, History } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AgentEarningsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("wallet");
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [walletType, setWalletType] = useState("easypaisa");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  // Agent wallet
  const { data: wallet } = useQuery({
    queryKey: ["agent-wallet", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase.from("agent_wallets").select("*").eq("agent_id", user.id).maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ["agent-wallet-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("agent_wallet_transactions" as any)
        .select("*")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []) as any[];
    },
    enabled: !!user,
  });

  // Saved wallets
  const { data: savedWallets = [] } = useQuery({
    queryKey: ["agent-saved-wallets", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("agent_saved_wallets").select("*").eq("agent_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Payouts
  const { data: payouts = [] } = useQuery({
    queryKey: ["agent-payouts", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("agent_payouts").select("*").eq("agent_id", user.id).order("created_at", { ascending: false }).limit(20);
      return data || [];
    },
    enabled: !!user,
  });

  // Withdraw
  const requestWithdraw = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const amount = parseFloat(withdrawAmount);
      if (!amount || amount <= 0) throw new Error("Invalid amount");
      const { data, error } = await supabase.rpc("request_agent_withdrawal", { p_agent_id: user.id, p_amount: amount });
      if (error) throw error;
      const result = data as any;
      if (!result?.success) throw new Error(result?.message || "Failed");
      return result;
    },
    onSuccess: () => {
      toast.success("Withdrawal request submitted!");
      queryClient.invalidateQueries({ queryKey: ["agent-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["agent-wallet-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["agent-payouts"] });
      setShowWithdraw(false);
      setWithdrawAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Save wallet
  const saveWallet = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!accountName || !accountNumber) throw new Error("Fill all fields");
      const { error } = await supabase.from("agent_saved_wallets").insert({
        agent_id: user.id,
        wallet_type: walletType,
        account_name: accountName,
        account_number: accountNumber,
        is_default: savedWallets.length === 0,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Wallet saved!");
      queryClient.invalidateQueries({ queryKey: ["agent-saved-wallets"] });
      setShowAddWallet(false);
      setAccountName("");
      setAccountNumber("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteWallet = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agent_saved_wallets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Wallet removed");
      queryClient.invalidateQueries({ queryKey: ["agent-saved-wallets"] });
    },
  });

  const balance = wallet?.balance || 0;
  const totalEarned = wallet?.total_earned || 0;
  const totalWithdrawn = wallet?.total_withdrawn || 0;

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="h-5 w-5" />
          <h1 className="text-lg font-bold">My Wallet</h1>
        </div>
        <p className="text-3xl font-bold mt-2">{formatPKR(balance)}</p>
        <p className="text-xs opacity-80 mt-1">Available Balance</p>
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="secondary" className="text-xs" onClick={() => setShowWithdraw(true)}>
            <ArrowDownCircle className="h-3.5 w-3.5 mr-1" /> Withdraw
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-2">
        <Card><CardContent className="p-3 text-center">
          <TrendingUp className="h-4 w-4 text-green-500 mx-auto mb-1" />
          <p className="text-sm font-bold">{formatPKR(totalEarned)}</p>
          <p className="text-[10px] text-muted-foreground">Total Earned</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <ArrowDownCircle className="h-4 w-4 text-orange-500 mx-auto mb-1" />
          <p className="text-sm font-bold">{formatPKR(totalWithdrawn)}</p>
          <p className="text-[10px] text-muted-foreground">Withdrawn</p>
        </CardContent></Card>
        <Card><CardContent className="p-3 text-center">
          <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
          <p className="text-sm font-bold">{payouts.filter((p: any) => p.status === "pending").length}</p>
          <p className="text-[10px] text-muted-foreground">Pending</p>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="wallet" className="text-xs gap-1"><History size={14}/> History</TabsTrigger>
          <TabsTrigger value="withdrawals" className="text-xs gap-1"><ArrowDownCircle size={14}/> Withdrawals</TabsTrigger>
          <TabsTrigger value="accounts" className="text-xs gap-1"><CreditCard size={14}/> Accounts</TabsTrigger>
        </TabsList>

        {/* Transaction History */}
        <TabsContent value="wallet" className="mt-3 space-y-2">
          {transactions.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No transactions yet</CardContent></Card>
          ) : (
            transactions.map((t: any) => (
              <Card key={t.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={t.amount > 0 ? "default" : "destructive"} className={cn("text-[10px] h-5", t.amount > 0 && "bg-green-500")}>
                        {t.transaction_type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(t.created_at), "dd MMM yyyy HH:mm")}</span>
                    </div>
                    {t.description && <p className="text-xs text-muted-foreground mt-1 truncate">{t.description}</p>}
                  </div>
                  <p className={cn("font-bold text-sm shrink-0 ml-2", t.amount > 0 ? "text-green-600" : "text-red-500")}>
                    {t.amount > 0 ? "+" : ""}{formatPKR(Math.abs(t.amount))}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Withdrawals */}
        <TabsContent value="withdrawals" className="mt-3 space-y-2">
          {payouts.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No withdrawal requests yet</CardContent></Card>
          ) : (
            payouts.map((p: any) => (
              <Card key={p.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{formatPKR(p.amount)}</p>
                    <p className="text-[10px] text-muted-foreground">{format(new Date(p.created_at), "dd MMM yyyy")}</p>
                    {p.transaction_id && <p className="text-[10px] font-mono text-muted-foreground">TXN: {p.transaction_id}</p>}
                  </div>
                  <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}
                    className={cn("text-xs capitalize", p.status === "approved" && "bg-green-500")}>
                    {p.status}
                  </Badge>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Saved Accounts */}
        <TabsContent value="accounts" className="mt-3 space-y-2">
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowAddWallet(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Payment Account
          </Button>
          {savedWallets.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground text-sm">No saved accounts</CardContent></Card>
          ) : (
            savedWallets.map((w: any) => (
              <Card key={w.id} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{w.wallet_type}</Badge>
                      {w.is_default && <Badge className="bg-primary text-[10px] h-5">Default</Badge>}
                    </div>
                    <p className="text-sm font-medium mt-1">{w.account_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{w.account_number}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive text-xs"
                    onClick={() => { if (confirm("Remove this account?")) deleteWallet.mutate(w.id); }}>
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent>
          <DialogHeader><DialogTitle>Withdraw Funds</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Available: <strong>{formatPKR(balance)}</strong></p>
            <div>
              <Label>Amount (PKR)</Label>
              <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Enter amount" />
            </div>
            {savedWallets.length > 0 && (
              <p className="text-xs text-muted-foreground">Payment will be sent to your saved account. Admin will review and process.</p>
            )}
            {savedWallets.length === 0 && (
              <p className="text-xs text-destructive">⚠️ Please add a payment account first in the Accounts tab.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
            <Button onClick={() => requestWithdraw.mutate()} disabled={requestWithdraw.isPending || !withdrawAmount || savedWallets.length === 0}>
              {requestWithdraw.isPending ? "Processing..." : "Request Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Wallet Dialog */}
      <Dialog open={showAddWallet} onOpenChange={setShowAddWallet}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Payment Account</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Account Type</Label>
              <Select value={walletType} onValueChange={setWalletType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                  <SelectItem value="jazzcash">JazzCash</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Account Holder Name</Label>
              <Input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Full name" />
            </div>
            <div>
              <Label>Account / Mobile Number</Label>
              <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g. 03001234567" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddWallet(false)}>Cancel</Button>
            <Button onClick={() => saveWallet.mutate()} disabled={saveWallet.isPending || !accountName || !accountNumber}>
              {saveWallet.isPending ? "Saving..." : "Save Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentEarningsPage;
