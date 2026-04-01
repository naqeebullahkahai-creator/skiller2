import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Smartphone, AlertTriangle, ChevronDown, ChevronUp, Info, Terminal, Rocket, Key, Globe, Zap, Package, Play } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

const SUPABASE_URL = "https://faevzfibzcbuqjoatmjm.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXZ6ZmliemNidXFqb2F0bWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTM4OTQsImV4cCI6MjA4NzM2OTg5NH0.1P6q4Xo5xKWHExRnUOaQPjwq-AxmQ6K4Sp4FTpWPXGM";
const SYNC_API = `${SUPABASE_URL}/functions/v1/sync-products`;

const CopyBlock = ({ label, code }: { label?: string; code: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-2">
      {label && <p className="text-xs font-semibold text-foreground mb-1">📋 {label}</p>}
      <div className="relative bg-muted rounded-lg p-3 pr-12 overflow-x-auto border border-border">
        <pre className="text-xs text-foreground whitespace-pre-wrap break-all font-mono">{code}</pre>
        <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </Button>
      </div>
    </div>
  );
};

const InfoBox = ({ children, variant = "info" }: { children: React.ReactNode; variant?: "info" | "warning" | "success" | "tip" }) => {
  const styles = {
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
    tip: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800",
  };
  const icons = {
    info: <Info size={14} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    success: <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
    tip: <Rocket size={14} className="text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />,
  };
  return (
    <div className={`p-3 rounded-lg flex gap-2 border ${styles[variant]} my-2`}>
      {icons[variant]}
      <div className="text-xs text-foreground">{children}</div>
    </div>
  );
};

const StepCard = ({ step, title, icon: Icon, children, defaultOpen = false }: { step: number; title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-border/50">
      <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{step}</div>
            <Icon size={18} className="text-primary" />
            <CardTitle className="text-sm">{title}</CardTitle>
          </div>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </CardHeader>
      {open && <CardContent className="space-y-3 pt-0 px-4 pb-4">{children}</CardContent>}
    </Card>
  );
};

const AdminApkBuildPage = () => {
  return (
    <div className="space-y-4 overflow-x-hidden pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Smartphone className="h-7 w-7" />
          <h1 className="text-xl font-bold">APK Builder</h1>
          <Badge className="bg-white/20 text-white border-0">Ready-Made</Badge>
        </div>
        <p className="text-white/80 text-sm">Download ready-made project → Follow steps → Get APK</p>
      </div>

      {/* Download Section */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-base">Step 1: Download Project Files</h2>
          </div>
          <p className="text-sm text-muted-foreground">Ye ZIP file download karo. Ismein sab kuch ready hai — capacitor config, package.json, setup scripts.</p>
          <a href="/documents/FANZON-APK-Project.zip" download>
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 h-12 text-base">
              <Download size={18} /> Download FANZON-APK-Project.zip
            </Button>
          </a>
          <InfoBox variant="success">
            ZIP mein ye files hain: <code>capacitor.config.ts</code>, <code>package.json</code>, <code>setup.bat</code> (Windows), <code>setup.sh</code> (Mac/Linux), <code>README.md</code>
          </InfoBox>
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card className="border-2 border-amber-300/30 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-600" />
            <h2 className="font-bold text-base">🔑 API Keys (Ye Aapki Hain)</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Aapka project Lovable Cloud pe hai, isliye Supabase ki keys automatically mil gayi hain. Ye keys aapke project ki hain — kisi aur ko na dena!
          </p>

          <CopyBlock label="Supabase URL" code={SUPABASE_URL} />
          <CopyBlock label="Anon Key (Public — safe to use in app)" code={ANON_KEY} />
          <CopyBlock label="Sync API Endpoint" code={SYNC_API} />

          <InfoBox variant="warning">
            <strong>Anon Key public hai</strong> — isko app mein use karna safe hai. Ye key sirf wahi kaam karti hai jo RLS policies allow karti hain. Aapki actual secret key Lovable Cloud mein safe hai.
          </InfoBox>

          <InfoBox variant="info">
            <strong>Supabase Dashboard kahan hai?</strong> Lovable Cloud use kar rahe ho to alag se Supabase account ki zarurat nahi. Sab kuch Lovable ke andar se manage hota hai. Keys yehi hain jo upar di hain.
          </InfoBox>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <StepCard step={2} title="Prerequisites Install Karo" icon={Package} defaultOpen={true}>
        <p className="text-sm text-muted-foreground">Ye 3 cheezein pehle install karo:</p>
        
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">1. Node.js 18+</span>
              <Badge variant="outline" className="text-xs">Required</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">JavaScript runtime</p>
            <CopyBlock code="https://nodejs.org" />
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">2. Java JDK 17</span>
              <Badge variant="outline" className="text-xs">Required</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">Android build ke liye</p>
            <CopyBlock code="https://adoptium.net" />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm">3. Android Studio</span>
              <Badge variant="outline" className="text-xs">Required</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">APK build ke liye</p>
            <CopyBlock code="https://developer.android.com/studio" />
            <InfoBox variant="tip">Install karne ke baad Android Studio kholein → SDK Manager → Android SDK install karo</InfoBox>
          </div>
        </div>
      </StepCard>

      {/* Step 3: Extract & Run */}
      <StepCard step={3} title="ZIP Extract Karo aur Setup Chalao" icon={Terminal}>
        <p className="text-sm text-muted-foreground">Downloaded ZIP ko extract karo, phir terminal/CMD kholein us folder mein:</p>
        
        <CopyBlock label="Windows (CMD mein):" code="cd fanzon-mobile\nsetup.bat" />
        <CopyBlock label="Mac/Linux (Terminal mein):" code="cd fanzon-mobile\nchmod +x setup.sh && ./setup.sh" />
        
        <InfoBox variant="info">
          Setup script automatically ye sab karega: npm install → cap add android → cap sync → Android Studio kholega
        </InfoBox>
      </StepCard>

      {/* Step 4: Build APK */}
      <StepCard step={4} title="APK Build Karo (Android Studio mein)" icon={Play}>
        <p className="text-sm text-muted-foreground">Android Studio khulega automatically. Ab:</p>
        
        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">Debug APK (Testing ke liye):</p>
            <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Build menu click karo</li>
              <li>Build Bundle(s) / APK(s) → Build APK(s)</li>
              <li>Wait karo build hone tak</li>
            </ol>
            <CopyBlock label="APK yahan milega:" code="android/app/build/outputs/apk/debug/app-debug.apk" />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">🏪 Signed APK (Play Store ke liye):</p>
            <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Build → Generate Signed Bundle / APK</li>
              <li>"Create new..." click karo keystore ke liye</li>
              <li>Password set karo (yaad rakhna!)</li>
              <li>APK select karo → Release → Build</li>
            </ol>
            <CopyBlock label="Signed APK yahan milega:" code="android/app/build/outputs/apk/release/app-release.apk" />
          </div>
        </div>
      </StepCard>

      {/* API Endpoints */}
      <StepCard step={5} title="API Endpoints (App Integration)" icon={Globe}>
        <p className="text-sm text-muted-foreground">Agar aap custom app bana rahe hain to ye API endpoints use karo:</p>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">🔐 Seller Login</p>
            <CopyBlock code={`POST ${SYNC_API}?action=login\nHeaders:\n  Authorization: Bearer <access_token>\n  apikey: ${ANON_KEY}`} />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">📦 Sync Products (Bulk Upload)</p>
            <CopyBlock code={`POST ${SYNC_API}?action=sync\nHeaders:\n  Authorization: Bearer <access_token>\n  apikey: ${ANON_KEY}\n  Content-Type: application/json\nBody:\n{\n  "products": [\n    {\n      "local_id": "1",\n      "title": "Product Name",\n      "price_pkr": 500,\n      "stock_count": 10,\n      "category": "Electronics",\n      "description": "Description here"\n    }\n  ]\n}`} />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">🖼️ Upload Image</p>
            <CopyBlock code={`POST ${SYNC_API}?action=upload-image\nHeaders:\n  Authorization: Bearer <access_token>\n  apikey: ${ANON_KEY}\nBody:\n{\n  "base64": "<base64_encoded_image>",\n  "filename": "photo.jpg"\n}`} />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">📋 Get My Products</p>
            <CopyBlock code={`GET ${SYNC_API}?action=seller-products\nHeaders:\n  Authorization: Bearer <access_token>\n  apikey: ${ANON_KEY}`} />
          </div>
        </div>

        <InfoBox variant="info">
          <strong>Access Token kaise milega?</strong> Supabase auth se login karo: <code>supabase.auth.signInWithPassword()</code> — response mein <code>session.access_token</code> milega.
        </InfoBox>
      </StepCard>

      {/* Troubleshooting */}
      <StepCard step={6} title="Troubleshooting" icon={AlertTriangle}>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50 border">
            <p className="font-semibold">❌ "SDK not found"</p>
            <p className="text-xs text-muted-foreground">Android Studio → Settings → SDK Manager → Android SDK install karo</p>
          </div>
          <div className="p-2 rounded bg-muted/50 border">
            <p className="font-semibold">❌ "JDK not found"</p>
            <p className="text-xs text-muted-foreground">JAVA_HOME environment variable set karo pointing to JDK folder</p>
          </div>
          <div className="p-2 rounded bg-muted/50 border">
            <p className="font-semibold">❌ Build fail</p>
            <p className="text-xs text-muted-foreground">Terminal mein <code>npx cap sync</code> dobara chalao</p>
          </div>
          <div className="p-2 rounded bg-muted/50 border">
            <p className="font-semibold">❌ Blank white screen</p>
            <p className="text-xs text-muted-foreground">Internet connection check karo — app live website load karta hai</p>
          </div>
        </div>
      </StepCard>
    </div>
  );
};

export default AdminApkBuildPage;
