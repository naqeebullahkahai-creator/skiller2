import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, Search, Plus, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { SUPER_ADMIN_EMAIL } from "@/contexts/AuthContext";

const AdminAgentRolePage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAssign, setShowAssign] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  // Current agents
  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["admin-agent-roles"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role", "support_agent" as any);
      if (!roles?.length) return [];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, created_at").in("id", roles.map(r => r.user_id)).neq("email", SUPER_ADMIN_EMAIL);
      return profiles || [];
    },
  });

  // Search users for assignment
  const { data: searchResults = [] } = useQuery({
    queryKey: ["user-search-agent", userSearch],
    queryFn: async () => {
      if (!userSearch || userSearch.length < 2) return [];
      const { data } = await supabase.from("profiles").select("id, full_name, email").neq("email", SUPER_ADMIN_EMAIL).or(`full_name.ilike.%${userSearch}%,email.ilike.%${userSearch}%`).limit(10);
      return data || [];
    },
    enabled: userSearch.length >= 2,
  });

  const assignRole = useMutation({
    mutationFn: async (userId: string) => {
      // Update existing role to support_agent
      const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", userId).single();
      if (existing) {
        const { error } = await supabase.from("user_roles").update({ role: "support_agent" as any }).eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "support_agent" as any });
        if (error) throw error;
      }
      // Create agent_online_status entry
      await supabase.from("agent_online_status").upsert({ user_id: userId, is_online: false }, { onConflict: "user_id" });
      // Create agent wallet
      await supabase.from("agent_wallets").upsert({ agent_id: userId }, { onConflict: "agent_id" });
    },
    onSuccess: () => {
      toast.success("Agent role assigned! User will now see the Agent Dashboard.");
      queryClient.invalidateQueries({ queryKey: ["admin-agent-roles"] });
      setShowAssign(false);
      setSelectedUserId(null);
      setUserSearch("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeRole = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("user_roles").update({ role: "customer" as any }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Agent role removed. User reverted to customer.");
      queryClient.invalidateQueries({ queryKey: ["admin-agent-roles"] });
      setConfirmRemove(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = searchQuery
    ? agents.filter((a: any) => a.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.email?.toLowerCase().includes(searchQuery.toLowerCase()))
    : agents;

  const agentIds = agents.map((a: any) => a.id);

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Agent Role Assignment
          </h1>
          <p className="text-sm text-muted-foreground">Assign or remove the support_agent role</p>
        </div>
        <Button size="sm" onClick={() => setShowAssign(true)}>
          <Plus className="h-4 w-4 mr-1" /> Assign Agent Role
        </Button>
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>{[...Array(4)].map((_, j) => <TableCell key={j}><Skeleton className="h-6 w-20" /></TableCell>)}</TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No agents found. Click "Assign Agent Role" to add one.</TableCell></TableRow>
              ) : (
                filtered.map((agent: any) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-indigo-100 text-indigo-600 text-xs">{agent.full_name?.charAt(0)?.toUpperCase() || "A"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{agent.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{agent.email}</TableCell>
                    <TableCell><Badge className="bg-indigo-500 text-xs">support_agent</Badge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setConfirmRemove(agent.id)}>
                        <Trash2 size={14} className="mr-1" /> Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Agent Role</DialogTitle>
            <DialogDescription>Search for a user and assign them the support_agent role. This will restrict them to the Agent Dashboard.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" />
            </div>
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto space-y-1 border rounded-lg p-2">
                {searchResults.filter((u: any) => !agentIds.includes(u.id)).map((user: any) => (
                  <button key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full text-left p-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${selectedUserId === user.id ? "bg-primary/10 border border-primary" : "hover:bg-muted"}`}>
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-muted">{user.full_name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {selectedUserId && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">This action will change the user's role to <strong>support_agent</strong>. They will only have access to the Agent Dashboard and its features.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button disabled={!selectedUserId || assignRole.isPending} onClick={() => selectedUserId && assignRole.mutate(selectedUserId)}>
              {assignRole.isPending ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <Dialog open={!!confirmRemove} onOpenChange={(o) => !o && setConfirmRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Agent Role?</DialogTitle>
            <DialogDescription>This will revert the user to a customer role. They will lose access to the Agent Dashboard.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove(null)}>Cancel</Button>
            <Button variant="destructive" disabled={removeRole.isPending} onClick={() => confirmRemove && removeRole.mutate(confirmRemove)}>
              {removeRole.isPending ? "Removing..." : "Remove Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAgentRolePage;
