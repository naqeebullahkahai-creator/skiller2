import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Wallet, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminAgentPayoutsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [processDialog, setProcessDialog] = useState<any>(null);
  const [transactionId, setTransactionId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Get agents map
  const { data: agentsMap = {} } = useQuery({
    queryKey: ["agents-map-payouts"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "support_agent" as any);
      if (!roles?.length) return {};
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", roles.map(r => r.user_id));
      const map: Record<string, string> = {};
      profiles?.forEach(p => { map[p.id] = p.full_name || "Agent"; });
      return map;
    },
  });

  // Get agent saved wallets for payment details
  const { data: agentWallets = [] } = useQuery({
    queryKey: ["agent-saved-wallets-admin"],
    queryFn: async () => {
      const { data } = await supabase.from("agent_saved_wallets").select("*").eq("is_default", true);
      return data || [];
    },
  });

  const getAgentPaymentDetails = (agentId: string) => {
    return agentWallets.find((w: any) => w.agent_id === agentId);
  };

  // Get payouts
  const { data: payouts = [], isLoading } = useQuery({
    queryKey: ["agent-payouts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_payouts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const processPayout = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updates: any = {
        status,
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes || null,
      };
      if (status === "approved" && transactionId) {
        updates.transaction_id = transactionId;
      }
      const { error } = await supabase.from("agent_payouts").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      toast.success(`Payout ${status}`);
      queryClient.invalidateQueries({ queryKey: ["agent-payouts"] });
      setProcessDialog(null);
      setTransactionId("");
      setAdminNotes("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = payouts.filter((p: any) => {
    if (activeTab === "pending") return p.status === "pending";
    if (activeTab === "approved") return p.status === "approved";
    if (activeTab === "rejected") return p.status === "rejected";
    return true;
  });

  const pendingCount = payouts.filter((p: any) => p.status === "pending").length;

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" /> Agent Payouts
        </h1>
        <p className="text-sm text-muted-foreground">Review & process agent withdrawal requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <Clock size={14}/> Pending {pendingCount > 0 && <Badge variant="destructive" className="text-[10px] ml-1">{pendingCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="approved"><CheckCircle size={14} className="mr-1"/> Approved</TabsTrigger>
          <TabsTrigger value="rejected"><XCircle size={14} className="mr-1"/> Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden md:table-cell">Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    {activeTab === "pending" && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>{[...Array(6)].map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-16" /></TableCell>)}</TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No payouts found</TableCell></TableRow>
                  ) : (
                    filtered.map((payout: any) => (
                      <TableRow key={payout.id}>
                        <TableCell className="font-medium text-sm">{(agentsMap as any)[payout.agent_id] || payout.agent_id.slice(0, 8)}</TableCell>
                        <TableCell className="font-bold">{formatPKR(payout.amount)}</TableCell>
                        <TableCell className="text-xs">{format(new Date(payout.created_at), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs font-mono">
                          {payout.transaction_id || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={payout.status === "approved" ? "default" : payout.status === "rejected" ? "destructive" : "secondary"}
                            className={cn("text-xs capitalize", payout.status === "approved" && "bg-green-500")}>
                            {payout.status}
                          </Badge>
                        </TableCell>
                        {activeTab === "pending" && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                onClick={() => setProcessDialog({ ...payout, action: "approved" })}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" className="text-xs h-7"
                                onClick={() => processPayout.mutate({ id: payout.id, status: "rejected" })}>
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog with Transaction ID */}
      <Dialog open={!!processDialog} onOpenChange={(o) => { if (!o) { setProcessDialog(null); setTransactionId(""); setAdminNotes(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Payout — {formatPKR(processDialog?.amount || 0)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Transaction ID (Required proof)</Label>
              <Input value={transactionId} onChange={(e) => setTransactionId(e.target.value)} placeholder="Enter payment transaction ID" />
              <p className="text-xs text-muted-foreground mt-1">This will be shown to the agent as proof of payment</p>
            </div>
            <div>
              <Label>Admin Notes (Optional)</Label>
              <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Any notes..." rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setProcessDialog(null); setTransactionId(""); setAdminNotes(""); }}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700" disabled={!transactionId.trim() || processPayout.isPending}
              onClick={() => processPayout.mutate({ id: processDialog.id, status: "approved" })}>
              {processPayout.isPending ? "Processing..." : "Approve & Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentPayoutsPage;
