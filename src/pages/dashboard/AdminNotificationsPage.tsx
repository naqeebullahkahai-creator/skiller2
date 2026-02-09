import { useState } from "react";
import { Bell, Send, Users, Store, Megaphone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminNotificationsPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);
  const [sendEmail, setSendEmail] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }

    setSending(true);
    try {
      // Get target user IDs based on audience
      let query = supabase.from("user_roles").select("user_id");
      if (audience === "customers") query = query.eq("role", "customer");
      if (audience === "sellers") query = query.eq("role", "seller");

      const { data: users, error: usersError } = await query;
      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast.error("No users found for selected audience");
        setSending(false);
        return;
      }

      // Insert in-app notifications for all target users
      const notifications = users.map((u) => ({
        user_id: u.user_id,
        title,
        message,
        notification_type: "system" as const,
      }));

      const { error } = await supabase.from("notifications").insert(notifications);
      if (error) throw error;

      // Also send emails if toggled on
      if (sendEmail) {
        const userIds = users.map((u) => u.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("email")
          .in("id", userIds);

        if (profiles && profiles.length > 0) {
          const emails = profiles.map((p) => p.email).filter(Boolean);
          if (emails.length > 0) {
            supabase.functions.invoke("send-order-emails", {
              body: {
                type: "admin_broadcast",
                broadcastSubject: title,
                broadcastMessage: message,
                recipientEmails: emails,
              },
            }).then(() => {
              toast.success(`Email sent to ${emails.length} users`);
            }).catch((e) => {
              console.error("Broadcast email failed:", e);
              toast.error("Email broadcast partially failed");
            });
          }
        }
      }

      toast.success(`Notification sent to ${users.length} users${sendEmail ? " + emails queued" : ""}`);
      setTitle("");
      setMessage("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Send Notification</h1>
        <p className="text-muted-foreground">Broadcast notifications & emails to users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Compose Notification
          </CardTitle>
          <CardDescription>Send push notifications and optional emails to selected audience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> All Users</span>
                </SelectItem>
                <SelectItem value="customers">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> Customers Only</span>
                </SelectItem>
                <SelectItem value="sellers">
                  <span className="flex items-center gap-2"><Store className="h-4 w-4" /> Sellers Only</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notif-title">Title</Label>
            <Input
              id="notif-title"
              placeholder="e.g., 🎉 Big Sale Starting Tomorrow!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notif-message">Message</Label>
            <Textarea
              id="notif-message"
              rows={4}
              placeholder="Write your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
            <Switch checked={sendEmail} onCheckedChange={setSendEmail} id="send-email" />
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <Label htmlFor="send-email" className="cursor-pointer text-sm font-medium">
                Also send via Email
              </Label>
            </div>
          </div>

          <Button onClick={handleSend} disabled={sending} className="gap-2">
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : `Send Notification${sendEmail ? " + Email" : ""}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationsPage;
