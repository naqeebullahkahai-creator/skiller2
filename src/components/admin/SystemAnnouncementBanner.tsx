import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

const SystemAnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("setting_value, is_enabled")
        .eq("setting_key", "system_announcement")
        .single();

      if (data?.is_enabled && data.setting_value) {
        // Check if user already dismissed this specific message
        const dismissedMsg = sessionStorage.getItem("dismissed_announcement");
        if (dismissedMsg !== data.setting_value) {
          setAnnouncement(data.setting_value);
          setDismissed(false);
        }
      }
    };

    fetchAnnouncement();

    // Listen for realtime changes
    const channel = supabase
      .channel("system-announcement")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "site_settings",
        filter: "setting_key=eq.system_announcement",
      }, (payload) => {
        const newData = payload.new as any;
        if (newData?.is_enabled && newData.setting_value) {
          setAnnouncement(newData.setting_value);
          setDismissed(false);
          sessionStorage.removeItem("dismissed_announcement");
        } else {
          setAnnouncement(null);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-center text-sm font-medium relative z-50">
      <div className="container mx-auto flex items-center justify-center gap-2">
        <Megaphone className="w-4 h-4 shrink-0" />
        <span>{announcement}</span>
        <button
          onClick={() => {
            setDismissed(true);
            sessionStorage.setItem("dismissed_announcement", announcement);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-amber-600/30"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SystemAnnouncementBanner;
