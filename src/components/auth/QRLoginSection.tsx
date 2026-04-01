import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw, Monitor, CheckCircle2, Clock, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRLoginSectionProps {
  onLoginSuccess?: () => void;
  className?: string;
}

const QRLoginSection = ({ onLoginSuccess, className }: QRLoginSectionProps) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "confirmed" | "expired" | "error">("loading");
  const [timeLeft, setTimeLeft] = useState(300);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateQR = async () => {
    setStatus("loading");
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/qr-login?action=create&device=Desktop`,
        { headers: { "Content-Type": "application/json" } }
      );
      const data = await res.json();
      if (data.success) {
        setSessionToken(data.session.session_token);
        setStatus("ready");
        setTimeLeft(300);
        startPolling(data.session.session_token);
        startTimer();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const startPolling = (token: string) => {
    stopPolling();
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/qr-login?action=status&token=${token}`
        );
        const data = await res.json();
        if (data.status === "confirmed") {
          setStatus("confirmed");
          stopPolling();
          stopTimer();
          // If we got tokens back, set the session
          if (data.access_token && data.refresh_token) {
            await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            });
            onLoginSuccess?.();
          }
        }
      } catch {}
    }, 2000);
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus("expired");
          stopPolling();
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  useEffect(() => {
    generateQR();
    return () => { stopPolling(); stopTimer(); };
  }, []);

  const qrValue = sessionToken
    ? `${window.location.origin}/qr-confirm?token=${sessionToken}`
    : "";

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Monitor size={16} />
        <span>Desktop QR Login</span>
      </div>

      <div className="relative w-52 h-52 bg-white rounded-2xl p-3 shadow-lg border">
        {status === "loading" && (
          <div className="w-full h-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        {status === "ready" && sessionToken && (
          <>
            <QRCodeSVG
              value={qrValue}
              size={176}
              level="M"
              includeMargin={false}
              fgColor="#0d9488"
              bgColor="#ffffff"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
              <Clock size={12} />
              {formatTime(timeLeft)}
            </div>
          </>
        )}
        {status === "confirmed" && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-green-600">
            <CheckCircle2 size={48} />
            <span className="text-sm font-semibold">Confirmed!</span>
          </div>
        )}
        {(status === "expired" || status === "error") && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground text-center">
              {status === "expired" ? "QR code expired" : "Failed to generate"}
            </p>
            <Button size="sm" onClick={generateQR} className="gap-1.5">
              <RefreshCw size={14} />
              New QR Code
            </Button>
          </div>
        )}
      </div>

      <div className="text-center space-y-1 max-w-[240px]">
        <p className="text-sm font-medium flex items-center justify-center gap-1.5">
          <Smartphone size={14} />
          Scan with FANZON App
        </p>
        <p className="text-xs text-muted-foreground">
          Open the app on your phone → Scan QR → Instantly logged in on desktop
        </p>
      </div>
    </div>
  );
};

export default QRLoginSection;
