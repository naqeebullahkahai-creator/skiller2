import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Loader2, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const QRConfirmPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { isAuthenticated, isLoading, user, profile } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"checking" | "confirming" | "success" | "error" | "login_required">("checking");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setStatus("login_required");
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMsg("Invalid QR code link");
      return;
    }

    confirmLogin();
  }, [isLoading, isAuthenticated, token]);

  const confirmLogin = async () => {
    setStatus("confirming");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/qr-login?action=confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ session_token: token }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to confirm login");
      }
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4">
      <Card className="w-full max-w-sm shadow-xl border-primary/20">
        <CardContent className="pt-8 pb-6 flex flex-col items-center gap-5">
          {status === "checking" || status === "confirming" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold">Confirming Login...</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Connecting your account to the desktop app
                </p>
              </div>
            </>
          ) : status === "success" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-green-700 dark:text-green-400">Login Confirmed! ✅</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  <Monitor className="inline w-4 h-4 mr-1" />
                  Your desktop app will sign in automatically
                </p>
                {profile?.full_name && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Logged in as <strong>{profile.full_name}</strong>
                  </p>
                )}
              </div>
              <Button onClick={() => navigate("/")} className="w-full mt-2">
                Back to Home
              </Button>
            </>
          ) : status === "login_required" ? (
            <>
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold">Login Required</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Please sign in first, then scan the QR code again
                </p>
              </div>
              <Button onClick={() => navigate("/auth/login")} className="w-full mt-2">
                Sign In
              </Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-center">
                <h2 className="text-lg font-bold text-red-600 dark:text-red-400">Failed</h2>
                <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
              </div>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full mt-2">
                Go Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRConfirmPage;
