import { useState } from "react";
import { 
  Shield, Search, Download, Filter, AlertTriangle, 
  Monitor, Smartphone, Tablet, Globe, Lock, Unlock,
  ChevronDown, ChevronUp, Eye, Clock, Users, Activity,
  XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  useLoginSessions, useLoginStats, useBlockIP, 
  useBlockedIPs, useUnblockIP, useUserLoginHistory,
  LoginSession, LoginFilters 
} from "@/hooks/useLoginSessions";

const DeviceIcon = ({ type }: { type: string | null }) => {
  if (type === "mobile") return <Smartphone size={14} />;
  if (type === "tablet") return <Tablet size={14} />;
  return <Monitor size={14} />;
};

const StatusBadge = ({ session }: { session: LoginSession }) => {
  if (session.is_suspicious) {
    return <Badge variant="destructive" className="text-[10px] px-1.5">⚠ Suspicious</Badge>;
  }
  if (session.is_new_device) {
    return <Badge className="text-[10px] px-1.5 bg-amber-500 text-white">New Device</Badge>;
  }
  if (session.login_status === "failed") {
    return <Badge variant="destructive" className="text-[10px] px-1.5">Failed</Badge>;
  }
  return <Badge variant="secondary" className="text-[10px] px-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">✓ Normal</Badge>;
};

const AdminSecurityPage = () => {
  const [filters, setFilters] = useState<LoginFilters>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [blockIP, setBlockIP] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [showUserHistory, setShowUserHistory] = useState<string | null>(null);
  const [showBlockedIPs, setShowBlockedIPs] = useState(false);

  const { data: sessions = [], isLoading } = useLoginSessions(filters);
  const { data: stats } = useLoginStats();
  const blockMutation = useBlockIP();
  const { data: blockedIPs = [] } = useBlockedIPs();
  const unblockMutation = useUnblockIP();
  const { data: userHistory = [] } = useUserLoginHistory(showUserHistory);

  const handleExportCSV = () => {
    if (sessions.length === 0) return;
    const headers = ["Email", "Role", "IP", "Country", "City", "Device", "Browser", "OS", "Login Time", "Status", "Suspicious"];
    const rows = sessions.map(s => [
      s.user_email, s.user_role, s.ip_address || "", s.country || "", s.city || "",
      s.device_type || "", s.browser_name || "", s.os_name || "",
      format(new Date(s.login_at), "yyyy-MM-dd HH:mm:ss"),
      s.login_status, s.is_suspicious ? "Yes" : "No"
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `login-activity-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBlock = () => {
    if (!blockIP.trim()) return;
    blockMutation.mutate({ ip: blockIP, reason: blockReason }, {
      onSuccess: () => { setShowBlockDialog(false); setBlockIP(""); setBlockReason(""); }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Security & Login Activity
          </h1>
          <p className="text-sm text-muted-foreground">Monitor all login sessions and security events</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBlockedIPs(true)}>
            <Lock size={14} className="mr-1" /> Blocked IPs ({blockedIPs.length})
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download size={14} className="mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Logins", value: stats?.total || 0, icon: Activity, color: "text-primary" },
          { label: "Today", value: stats?.today || 0, icon: Clock, color: "text-blue-600" },
          { label: "Suspicious", value: stats?.suspicious || 0, icon: AlertTriangle, color: "text-red-600" },
          { label: "Failed", value: stats?.failed || 0, icon: XCircle, color: "text-amber-600" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-3 flex items-center gap-3">
              <stat.icon className={cn("h-8 w-8", stat.color)} />
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3">
          <div className="flex flex-wrap gap-2">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search email or IP..."
                value={filters.search || ""}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="h-9"
              />
            </div>
            <Select value={filters.role || "all"} onValueChange={(v) => setFilters(f => ({ ...f, role: v }))}>
              <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="support_agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status || "all"} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
              <SelectTrigger className="w-[120px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
              className="w-[140px] h-9"
            />
            <Button
              variant={filters.suspiciousOnly ? "destructive" : "outline"}
              size="sm"
              className="h-9"
              onClick={() => setFilters(f => ({ ...f, suspiciousOnly: !f.suspiciousOnly }))}
            >
              <AlertTriangle size={14} className="mr-1" />
              Suspicious
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="space-y-2">
        {isLoading ? (
          [...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
        ) : sessions.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">No login sessions found</CardContent></Card>
        ) : (
          sessions.map((session) => (
            <Card 
              key={session.id} 
              className={cn(
                "transition-all",
                session.is_suspicious && "border-destructive/50 bg-destructive/5",
                session.is_new_device && !session.is_suspicious && "border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20"
              )}
            >
              <CardContent className="p-3">
                <button
                  className="w-full text-left"
                  onClick={() => setExpandedId(expandedId === session.id ? null : session.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "p-2 rounded-lg shrink-0",
                        session.is_suspicious ? "bg-destructive/10" : session.is_new_device ? "bg-amber-100 dark:bg-amber-900" : "bg-muted"
                      )}>
                        <DeviceIcon type={session.device_type} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{session.user_email}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-[10px] px-1 py-0">{session.user_role}</Badge>
                          <span>{format(new Date(session.login_at), "MMM dd, HH:mm")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusBadge session={session} />
                      {expandedId === session.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {expandedId === session.id && (
                  <div className="mt-3 pt-3 border-t space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-muted-foreground">IP:</span> <span className="font-mono text-xs">{session.ip_address || "N/A"}</span></div>
                      <div><span className="text-muted-foreground">Location:</span> {session.city || "?"}, {session.country || "?"}</div>
                      <div><span className="text-muted-foreground">Browser:</span> {session.browser_name || "?"}</div>
                      <div><span className="text-muted-foreground">OS:</span> {session.os_name || "?"}</div>
                      <div><span className="text-muted-foreground">Device:</span> {session.device_name || session.device_type || "?"}</div>
                      <div><span className="text-muted-foreground">Logout:</span> {session.logout_at ? format(new Date(session.logout_at), "HH:mm") : "Active"}</div>
                    </div>
                    {session.suspicious_reason && (
                      <div className="p-2 bg-destructive/10 rounded-lg text-destructive text-xs">
                        ⚠ {session.suspicious_reason}
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => setShowUserHistory(session.user_id)}>
                        <Eye size={12} className="mr-1" /> User History
                      </Button>
                      {session.ip_address && (
                        <Button variant="outline" size="sm" className="text-xs h-7 text-destructive" onClick={() => { setBlockIP(session.ip_address!); setShowBlockDialog(true); }}>
                          <Lock size={12} className="mr-1" /> Block IP
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Block IP Dialog */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Block IP Address</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>IP Address</Label>
              <Input value={blockIP} onChange={(e) => setBlockIP(e.target.value)} />
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Why block this IP?" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBlock} disabled={blockMutation.isPending}>Block IP</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blocked IPs Dialog */}
      <Dialog open={showBlockedIPs} onOpenChange={setShowBlockedIPs}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Blocked IP Addresses</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {blockedIPs.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No blocked IPs</p>
            ) : (
              blockedIPs.map((ip: any) => (
                <div key={ip.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-mono text-sm">{ip.ip_address}</p>
                    <p className="text-xs text-muted-foreground">{ip.reason || "No reason"}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => unblockMutation.mutate(ip.id)}>
                    <Unlock size={14} />
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* User History Dialog */}
      <Dialog open={!!showUserHistory} onOpenChange={() => setShowUserHistory(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Login History</DialogTitle></DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {userHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No history found</p>
            ) : (
              userHistory.map((s) => (
                <div key={s.id} className={cn(
                  "p-3 rounded-lg border",
                  s.is_suspicious ? "border-destructive/50 bg-destructive/5" : "bg-muted"
                )}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DeviceIcon type={s.device_type} />
                      <span className="text-sm">{s.browser_name} / {s.os_name}</span>
                    </div>
                    <StatusBadge session={s} />
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{format(new Date(s.login_at), "MMM dd, yyyy HH:mm")}</span>
                    <span className="font-mono">{s.ip_address}</span>
                    <span>{s.city}, {s.country}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSecurityPage;
