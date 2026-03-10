import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Plus, Edit, Clock, CalendarCheck } from "lucide-react";
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

  // Get agents
  const { data: agents = [] } = useQuery({
    queryKey: ["agent-list-for-salary"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "support_agent" as any);
      if (!roles?.length) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email").in("id", roles.map(r => r.user_id));
      return profiles || [];
    },
  });

  // Get salaries
  const { data: salaries = [], isLoading } = useQuery({
    queryKey: ["agent-salaries"],
    queryFn: async () => {
      const { data, error } = await supabase.from("agent_salaries").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const saveSalary = useMutation({
    mutationFn: async () => {
      if (!formAgentId || !formAmount) throw new Error("Fill all fields");
      const payload = {
        agent_id: formAgentId,
        amount: parseFloat(formAmount),
        frequency: formFrequency,
        next_payment_at: getNextPaymentDate(formFrequency),
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
  };

  const handleEdit = (salary: any) => {
    setEditId(salary.id);
    setFormAgentId(salary.agent_id);
    setFormAmount(salary.amount.toString());
    setFormFrequency(salary.frequency);
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
                <TableHead>Status</TableHead>
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
                  <TableRow key={salary.id}>
                    <TableCell className="font-medium text-sm">{getAgentName(salary.agent_id)}</TableCell>
                    <TableCell className="font-bold text-primary">{formatPKR(salary.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">{salary.frequency}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {salary.next_payment_at ? format(new Date(salary.next_payment_at), "MMM dd, yyyy") : "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {salary.last_paid_at ? format(new Date(salary.last_paid_at), "MMM dd, yyyy") : "Never"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={salary.is_active ? "default" : "secondary"} className={cn("text-xs", salary.is_active && "bg-green-500")}>
                        {salary.is_active ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(salary)}>
                        <Edit size={14} />
                      </Button>
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
