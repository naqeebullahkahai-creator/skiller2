import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SystemAnnouncementManager = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value, is_enabled")
        .eq("setting_key", "system_announcement")
        .single();

      if (data) {
        setMessage(data.setting_value || "");
        setIsEnabled(data.is_enabled);
      }
      setIsLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          setting_key: "system_announcement",
          setting_type: "text",
          setting_value: message,
          is_enabled: isEnabled,
          description: "System-wide announcement banner",
        }, { onConflict: "setting_key" });

      if (error) throw error;

      toast({ title: "Announcement updated", description: isEnabled ? "Banner is now live." : "Banner is disabled." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Megaphone className="h-4 w-4" />
          System Announcement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Announcement Message</Label>
          <Input
            placeholder="e.g., Maintenance scheduled for 2 PM today"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{message.length}/200</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            <Label>Show on all pages</Label>
          </div>
          <Button onClick={handleSave} disabled={isSaving} size="sm">
            {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemAnnouncementManager;
