import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formatPKR = (amount: number) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);

const AdminAgentSalaryPage = () => {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formAgentId, setFormAgentId] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formFrequency, setFormFrequency] = useState("monthly");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("09:00");

  const { data: agents = [] } = useQuery({
    queryKey: ["agent-list-for-salary"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "support_agent" as any);
      if (!roles?.length) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", roles.map(r => r.user_id));
      return profiles || [];
    },
  });

  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ["agent-salaries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_salaries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Stats
  const totalMonthly = salaries.filter((s: any) => s.is_active).reduce((sum: number, s: any) => {
    const amt = s.amount || 0;
    if (s.frequency === "weekly") return sum + amt * 4;
    if (s.frequency === "biweekly") return sum + amt * 2;
    return sum + amt;
  }, 0);
  const activeCount = salaries.filter((s: any) => s.is_active).length;
  const totalAgents = salaries.length;

  const saveSalary = useMutation({
    mutationFn: async () => {
      if (!formAgentId || !formAmount) throw new Error("Fill all fields");
      const nextPayment = formDate
        ? new Date(`${formDate}T${formTime || "09:00"}`).toISOString()
        : getNextPaymentDate(formFrequency);
      const payload = {
        agent_id: formAgentId,
        amount: parseFloat(formAmount),
        frequency: formFrequency,
        next_payment_at: nextPayment,
        is_active: true,
      };
      if (editId) {
        const { error } = await supabase.from("agent_salaries").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("agent_salaries").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editId ? "Salary updated" : "Salary scheduled");
      queryClient.invalidateQueries({ queryKey: ["agent-salaries"] });
      resetForm();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("agent_salaries").update({ is_active: active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { active }) => {
      toast.success(active ? "Salary activated" : "Salary paused");
      queryClient.invalidateQueries({ queryKey: ["agent-salaries"] });
    },
  });

  const removeSalary = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("agent_salaries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Salary removed");
      queryClient.invalidateQueries({ queryKey: ["agent-salaries"] });
    },
  });

  const getNextPaymentDate = (freq: string) => {
    const now = new Date();
    if (freq === "weekly") now.setDate(now.getDate() + 7);
    else if (freq === "biweekly") now.setDate(now.getDate() + 14);
    else now.setMonth(now.getMonth() + 1);
    return now.toISOString();
  };

  const resetForm = () => {
    setShowDialog(false);
    setEditId(null);
    setFormAgentId("");
    setFormAmount("");
    setFormFrequency("monthly");
    setFormDate("");
    setFormTime("09:00");
  };

  const handleEdit = (salary: any) => {
    setEditId(salary.id);
    setFormAgentId(salary.agent_id);
    setFormAmount(salary.amount.toString());
    setFormFrequency(salary.frequency);
    if (salary.next_payment_at) {
      const d = new Date(salary.next_payment_at);
      setFormDate(format(d, "yyyy-MM-dd"));
      setFormTime(format(d, "HH:mm"));
    }
    setShowDialog(true);
  };

  const getAgentName = (id: string) => agents.find((a: any) => a.id === id)?.full_name || id.slice(0, 8);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" /> Agent Salaries
          </h1>
          <p className="text-sm text-muted-foreground">Schedule & manage agent salary payments</p>
        </div>
        <Button size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Salary
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{totalAgents}</p>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Users size={12}/> Total Scheduled</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formatPKR(totalMonthly)}</p>
          <p className="text-xs text-muted-foreground">Est. Monthly Total</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead className="hidden md:table-cell">Next Payment</TableHead>
                <TableHead className="hidden md:table-cell">Last Paid</TableHead>
                <TableHead>On/Off</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>{[...Array(7)].map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-16" /></TableCell>)}</TableRow>
                ))
              ) : salaries.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No salaries scheduled</TableCell></TableRow>
              ) : (
                salaries.map((salary: any) => (
                  <TableRow key={salary.id} className={cn(!salary.is_active && "opacity-60")}>
                    <TableCell className="font-medium text-sm">{getAgentName(salary.agent_id)}</TableCell>
                    <TableCell className="font-bold text-primary">{formatPKR(salary.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{salary.frequency}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {salary.next_payment_at ? format(new Date(salary.next_payment_at), "MMM dd, yyyy HH:mm") : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {salary.last_paid_at ? format(new Date(salary.last_paid_at), "MMM dd, yyyy") : "Never"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={salary.is_active}
                        onCheckedChange={(checked) => toggleActive.mutate({ id: salary.id, active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(salary)}>
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("Remove this salary schedule?")) removeSalary.mutate(salary.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={(o) => { if (!o) resetForm(); else setShowDialog(true); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Salary" : "Schedule Agent Salary"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Agent</Label>
              <Select value={formAgentId} onValueChange={setFormAgentId}>
                <SelectTrigger><SelectValue placeholder="Select agent" /></SelectTrigger>
                <SelectContent>
                  {agents.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>{a.full_name} ({a.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (PKR)</Label>
              <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} placeholder="e.g. 25000" />
            </div>
            <div>
              <Label>Frequency</Label>
              <Select value={formFrequency} onValueChange={setFormFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Payment Date</Label>
                <Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              </div>
              <div>
                <Label>Payment Time</Label>
                <Input type="time" value={formTime} onChange={(e) => setFormTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={() => saveSalary.mutate()} disabled={saveSalary.isPending}>
              {saveSalary.isPending ? "Saving..." : editId ? "Update" : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentSalaryPage;
