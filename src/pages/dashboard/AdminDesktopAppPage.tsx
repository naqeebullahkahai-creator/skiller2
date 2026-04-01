import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Monitor, AlertTriangle, ChevronDown, ChevronUp, Info, Terminal, Rocket, Key, Globe, Zap, Package, Play } from "lucide-react";
import { toast } from "sonner";

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

const AdminDesktopAppPage = () => {
  return (
    <div className="space-y-4 overflow-x-hidden pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl p-5 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Monitor className="h-7 w-7" />
          <h1 className="text-xl font-bold">Desktop App Builder</h1>
          <Badge className="bg-white/20 text-white border-0">Ready-Made</Badge>
        </div>
        <p className="text-white/80 text-sm">Download → Install Node.js → Run setup → Get .exe</p>
      </div>

      {/* Download Section */}
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <h2 className="font-bold text-base">Step 1: Download Project Files</h2>
          </div>
          <p className="text-sm text-muted-foreground">Ye ZIP download karo. Ismein Electron app ka poora setup ready hai — main.cjs, preload.cjs, package.json, setup scripts.</p>
          <a href="/documents/FANZON-Desktop-App.zip" download>
            <Button className="w-full gap-2 bg-primary hover:bg-primary/90 h-12 text-base">
              <Download size={18} /> Download FANZON-Desktop-App.zip
            </Button>
          </a>
          <InfoBox variant="success">
            ZIP mein ye files hain: <code>electron/main.cjs</code>, <code>electron/preload.cjs</code>, <code>package.json</code>, <code>setup.bat</code>, <code>setup.sh</code>, <code>README.md</code>
          </InfoBox>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="border-2 border-amber-300/30 bg-amber-50/50 dark:bg-amber-900/10">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-amber-600" />
            <h2 className="font-bold text-base">🔑 API Keys</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Lovable Cloud mein Supabase automatically setup hai. Ye keys aapke project ki hain:
          </p>
          <CopyBlock label="Supabase URL" code={SUPABASE_URL} />
          <CopyBlock label="Anon Key (Public)" code={ANON_KEY} />
          <CopyBlock label="Sync API" code={SYNC_API} />
          <InfoBox variant="info">
            Anon Key public hai — app mein use karna safe hai. Secret key Lovable Cloud mein protected hai.
          </InfoBox>
        </CardContent>
      </Card>

      {/* Prerequisites */}
      <StepCard step={2} title="Node.js Install Karo" icon={Package} defaultOpen={true}>
        <p className="text-sm text-muted-foreground">Desktop app ke liye sirf Node.js chahiye — bas!</p>
        <div className="p-3 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm">Node.js 18+</span>
            <Badge variant="outline" className="text-xs">Required</Badge>
          </div>
          <CopyBlock code="https://nodejs.org" />
          <p className="text-xs text-muted-foreground mt-1">Download karo → Install karo → Done! Verify: <code>node --version</code></p>
        </div>
      </StepCard>

      {/* Step 3: Run */}
      <StepCard step={3} title="Setup Chalao" icon={Terminal}>
        <p className="text-sm text-muted-foreground">ZIP extract karo, folder mein CMD/Terminal kholein:</p>
        
        <CopyBlock label="Windows:" code={"cd fanzon-seller-center\nsetup.bat"} />
        <CopyBlock label="Mac/Linux:" code={"cd fanzon-seller-center\nchmod +x setup.sh && ./setup.sh"} />
        
        <InfoBox variant="success">
          App automatically khulega! FANZON Seller Center desktop pe dikhai dega.
        </InfoBox>
      </StepCard>

      {/* Step 4: Build .exe */}
      <StepCard step={4} title=".exe / App Build Karo" icon={Play}>
        <p className="text-sm text-muted-foreground">Terminal mein ye command chalao:</p>

        <div className="space-y-2">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">🪟 Windows (.exe)</p>
            <CopyBlock code="npm run package:win" />
            <p className="text-xs text-muted-foreground">Output: <code>release/FANZON-Seller-win32-x64/FANZON-Seller.exe</code></p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">🍎 macOS</p>
            <CopyBlock code="npm run package:mac" />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">🐧 Linux</p>
            <CopyBlock code="npm run package:linux" />
          </div>
        </div>
      </StepCard>

      {/* API Endpoints */}
      <StepCard step={5} title="API Endpoints" icon={Globe}>
        <p className="text-sm text-muted-foreground">Custom desktop app banane ke liye ye APIs use karo:</p>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">🔐 Seller Login</p>
            <CopyBlock code={`// JavaScript / Electron\nconst { data } = await supabase.auth.signInWithPassword({\n  email: 'seller@example.com',\n  password: 'password'\n});\nconst token = data.session.access_token;\n\n// Then verify:\nfetch('${SYNC_API}?action=login', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer ' + token,\n    'apikey': '${ANON_KEY}'\n  }\n})`} />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">📦 Products Sync</p>
            <CopyBlock code={`fetch('${SYNC_API}?action=sync', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer ' + token,\n    'apikey': '${ANON_KEY}',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify({\n    products: [\n      { local_id: '1', title: 'Product', price_pkr: 500, stock_count: 10 }\n    ]\n  })\n})`} />
          </div>

          <div className="p-3 rounded-lg bg-muted/50 border">
            <p className="font-semibold text-sm mb-1">📋 Get My Products</p>
            <CopyBlock code={`fetch('${SYNC_API}?action=seller-products', {\n  headers: {\n    'Authorization': 'Bearer ' + token,\n    'apikey': '${ANON_KEY}'\n  }\n})`} />
          </div>
        </div>
      </StepCard>

      {/* Troubleshooting */}
      <StepCard step={6} title="Troubleshooting" icon={AlertTriangle}>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50 border">
            <p className="font-semibold">❌ Blank white window</p>
            <p className="text-xs text-muted-foreground">Internet connection check karo — app live FANZON website load karta hai</p>
          </div>
          <div className="p-2 rounded bg-muted/50 border">
            <p className="font-semibold">❌ npm install fail</p>
            <p className="text-xs text-muted-foreground">Node.js version check karo: <code>node --version</code> (18+ chahiye)</p>
          </div>
          <div className="p-2 rounded bg-muted/50 border">
            <p className="font-semibold">❌ Package command fail</p>
            <p className="text-xs text-muted-foreground"><code>npm install</code> dobara karo phir <code>npm run package:win</code></p>
          </div>
        </div>
      </StepCard>
    </div>
  );
};

export default AdminDesktopAppPage;
