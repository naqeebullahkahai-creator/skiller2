import { useState } from "react";
import { Send, Users, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const AdminGlobalNotification = () => {
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"promotion" | "system">("promotion");

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in both title and message.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Get all user IDs
      const { data: users, error: usersError } = await supabase
        .from("profiles")
        .select("id");

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        toast({
          title: "No Users",
          description: "There are no users to send notifications to.",
          variant: "destructive",
        });
        return;
      }

      // Create notifications for all users
      const notifications = users.map((user) => ({
        user_id: user.id,
        title: title.trim(),
        message: message.trim(),
        notification_type: notificationType,
        is_read: false,
      }));

      const { error: insertError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (insertError) throw insertError;

      toast({
        title: "Notification Sent!",
        description: `Successfully sent to ${users.length} users.`,
      });

      // Reset form
      setTitle("");
      setMessage("");
      setNotificationType("promotion");
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Only render for super admin
  if (!isSuperAdmin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send size={16} />
          Send Global Notification
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users size={20} />
            Send to All Users
          </DialogTitle>
          <DialogDescription>
            Send a notification to all registered FANZON users. Use this for promotions, sales announcements, or important updates.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type">Notification Type</Label>
            <Select value={notificationType} onValueChange={(v) => setNotificationType(v as "promotion" | "system")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promotion">🎉 Promotion</SelectItem>
                <SelectItem value="system">ℹ️ System Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g., Special Eid Sale is Live!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="e.g., Get up to 50% off on all products! Shop now and save big."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendNotification} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send to All Users
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminGlobalNotification;
