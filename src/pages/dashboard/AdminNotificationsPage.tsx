import { useState } from "react";
import { Bell, Send, Users, Store, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminNotificationsPage = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");
  const [sending, setSending] = useState(false);

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

      // Insert notifications for all target users
      const notifications = users.map((u) => ({
        user_id: u.user_id,
        title,
        message,
        notification_type: "system" as const,
      }));

      const { error } = await supabase.from("notifications").insert(notifications);
      if (error) throw error;

      toast.success(`Notification sent to ${users.length} users`);
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
        <p className="text-muted-foreground">Broadcast notifications to users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Compose Notification
          </CardTitle>
          <CardDescription>Send a push notification to selected audience</CardDescription>
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

          <Button onClick={handleSend} disabled={sending} className="gap-2">
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotificationsPage;
