import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLoginHistory } from "@/hooks/useLoginSessions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Smartphone, Globe, Clock, MapPin, Trash2, Shield, Loader2 } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const LoginDevicesPage = () => {
  const { user } = useAuth();
  const { data: sessions = [], isLoading } = useUserLoginHistory(user?.id ?? null);
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const activeSessions = sessions.filter(s => s.login_status === "success" && !s.logout_at);
  const pastSessions = sessions.filter(s => s.logout_at || s.login_status !== "success");

  const handleRemoveSession = async (sessionId: string) => {
    setRemovingId(sessionId);
    try {
      const { error } = await supabase
        .from("login_sessions")
        .update({ logout_at: new Date().toISOString() })
        .eq("id", sessionId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["user-login-history"] });
      toast.success("Session removed");
    } catch {
      toast.error("Failed to remove session");
    } finally {
      setRemovingId(null);
    }
  };

  const getDeviceIcon = (type: string | null) => {
    if (type?.toLowerCase().includes("mobile")) return <Smartphone size={18} />;
    return <Monitor size={18} />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Login Devices</h1>
          <p className="text-xs text-muted-foreground">Manage your active sessions and login history</p>
        </div>
      </div>

      {/* Active Sessions */}
      <div>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          Active Sessions ({activeSessions.length})
        </h2>
        {activeSessions.length === 0 ? (
          <Card><CardContent className="p-4 text-sm text-muted-foreground text-center">No active sessions found</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {activeSessions.map(session => (
              <Card key={session.id} className="border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        {getDeviceIcon(session.device_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{session.browser_name || "Unknown Browser"}</span>
                          <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600">Active</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {session.os_name || "Unknown OS"} • {session.device_name || session.device_type || "Unknown Device"}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                          {session.city && (
                            <span className="flex items-center gap-1">
                              <MapPin size={10} />
                              {session.city}{session.country ? `, ${session.country}` : ""}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            {formatDistanceToNow(new Date(session.login_at), { addSuffix: true })}
                          </span>
                          {session.ip_address && (
                            <span className="flex items-center gap-1">
                              <Globe size={10} />
                              {session.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleRemoveSession(session.id)}
                      disabled={removingId === session.id}
                    >
                      {removingId === session.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Sessions */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Recent Login History ({pastSessions.length})</h2>
        {pastSessions.length === 0 ? (
          <Card><CardContent className="p-4 text-sm text-muted-foreground text-center">No history yet</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {pastSessions.slice(0, 20).map(session => (
              <Card key={session.id} className={session.login_status === "failed" ? "border-destructive/20" : ""}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {getDeviceIcon(session.device_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{session.browser_name || "Unknown"}</span>
                        {session.login_status === "failed" && (
                          <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                        )}
                        {session.is_suspicious && (
                          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600">Suspicious</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(session.login_at), "dd MMM yyyy, hh:mm a")}
                        {session.city ? ` • ${session.city}` : ""}
                        {session.ip_address ? ` • ${session.ip_address}` : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginDevicesPage;
