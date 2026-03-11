import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminAgentSalaryPage = () => {
  const queryClient = useQueryClient();
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payAgentId, setPayAgentId] = useState("");
  const [payAmount, setPayAmount] = useState("");

  const { data: agents = [] } = useQuery({
    queryKey: ["agent-list-for-salary"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "support_agent" as any);
      if (!roles?.length) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", roles.map(r => r.user_id));
      return profiles || [];
    },
  });

  // Get agent wallets for balance display
  const { data: agentWallets = [] } = useQuery({
    queryKey: ["agent-wallets-salary"],
    queryFn: async () => {
      const { data } = await supabase.from("agent_wallets").select("*");
      return data || [];
    },
  });

  // Payment history from agent_wallet_transactions where type is salary
  const { data: paymentHistory = [], isLoading } = useQuery({
    queryKey: ["agent-salary-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_wallet_transactions")
        .select("*")
        .eq("transaction_type", "salary")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const paySalary = useMutation({
    mutationFn: async () => {
      if (!payAgentId || !payAmount) throw new Error("Select agent and enter amount");
      const amount = parseFloat(payAmount);
      if (isNaN(amount) || amount <= 0) throw new Error("Enter a valid amount");

      // First check/create wallet
      const { data: existingWallet } = await supabase
        .from("agent_wallets")
        .select("id, balance")
        .eq("agent_id", payAgentId)
        .maybeSingle();

      if (existingWallet) {
        await supabase
          .from("agent_wallets")
          .update({
            balance: existingWallet.balance + amount,
            total_earned: (existingWallet as any).total_earned + amount,
            updated_at: new Date().toISOString(),
          })
          .eq("agent_id", payAgentId);
      } else {
        await supabase.from("agent_wallets").insert({
          agent_id: payAgentId,
          balance: amount,
          total_earned: amount,
        });
      }

      // Log transaction
      const { error } = await supabase.from("agent_wallet_transactions").insert({
        agent_id: payAgentId,
        amount,
        transaction_type: "salary",
        description: `Salary payment of ${formatPKR(amount)}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Salary paid successfully!`);
      queryClient.invalidateQueries({ queryKey: ["agent-salary-history"] });
      queryClient.invalidateQueries({ queryKey: ["agent-wallets-salary"] });
      setShowPayDialog(false);
      setPayAgentId("");
      setPayAmount("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const getAgentName = (id: string) => agents.find((a: any) => a.id === id)?.full_name || id.slice(0, 8);
  const getAgentBalance = (id: string) => {
    const w = agentWallets.find((w: any) => w.agent_id === id);
    return w ? (w as any).balance : 0;
  };

  const totalPaid = paymentHistory.reduce((sum: number, t: any) => sum + t.amount, 0);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Agent Salaries
          </h1>
          <p className="text-sm text-muted-foreground">Pay agents manually</p>
        </div>
        <Button size="sm" onClick={() => setShowPayDialog(true)}>
          <DollarSign className="h-4 w-4 mr-1" /> Pay Salary
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{agents.length}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Users size={12}/> Total Agents</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formatPKR(totalPaid)}</p>
          <p className="text-xs text-muted-foreground">Total Paid</p>
        </CardContent></Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-sm">Payment History</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-16" /></TableCell>)}</TableRow>
                ))
              ) : paymentHistory.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No payments yet</TableCell></TableRow>
              ) : (
                paymentHistory.map((txn: any) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-medium text-sm">{getAgentName(txn.agent_id)}</TableCell>
                    <TableCell className="font-bold text-primary">{formatPKR(txn.amount)}</TableCell>
                    <TableCell className="text-xs">{format(new Date(txn.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{txn.description || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pay Dialog */}
      <Dialog open={showPayDialog} onOpenChange={(o) => { if (!o) { setShowPayDialog(false); setPayAgentId(""); setPayAmount(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Agent Salary</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Agent</Label>
              <Select value={payAgentId} onValueChange={setPayAgentId}>
                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {agents.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.full_name} ({a.email}) — Balance: {formatPKR(getAgentBalance(a.id))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (PKR)</Label>
              <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 25000" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowPayDialog(false); setPayAgentId(""); setPayAmount(""); }}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (confirm(`Pay ${formatPKR(parseFloat(payAmount || "0"))} to ${getAgentName(payAgentId)}?`)) {
                  paySalary.mutate();
                }
              }}
              disabled={paySalary.isPending || !payAgentId || !payAmount}
            >
              {paySalary.isPending ? "Paying..." : "Pay Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentSalaryPage;
