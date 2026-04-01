import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Monitor, AlertTriangle, Info, ChevronDown, ChevronUp, Shield, Database, Wifi, WifiOff, Settings, Users, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const CopyBtn = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative bg-muted rounded-lg p-3 pr-12 border border-border my-1.5">
      <pre className="text-xs text-foreground whitespace-pre-wrap break-all font-mono">{text}</pre>
      <Button size="icon" variant="ghost" className="absolute top-1.5 right-1.5 h-7 w-7" onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied!");
        setTimeout(() => setCopied(false), 2000);
      }}>
        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
      </Button>
    </div>
  );
};

const Tip = ({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" | "success" }) => {
  const cls = {
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
    success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  };
  const icons = {
    info: <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />,
    success: <Check size={14} className="text-emerald-500 shrink-0 mt-0.5" />,
  };
  return <div className={`p-2.5 rounded-lg flex gap-2 border ${cls[type]} my-2`}>{icons[type]}<div className="text-xs">{children}</div></div>;
};

const Step = ({ num, title, children, open: defaultOpen = false }: { num: number; title: string; children: React.ReactNode; open?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{num}</div>
          <span className="font-semibold text-sm">{title}</span>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {open && <CardContent className="pt-0 pb-4 px-4 space-y-2">{children}</CardContent>}
    </Card>
  );
};

const AdminDesktopAppPage = () => {
  return (
    <div className="space-y-3 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-6 w-6" />
          <h1 className="text-lg font-bold">Admin Desktop Panel</h1>
          <Badge className="bg-white/20 text-white border-0 text-[10px]">Ready-Made</Badge>
        </div>
        <p className="text-white/80 text-xs">Complete admin management software — offline + online with auto-sync</p>
      </div>

      {/* Features Overview */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-3">📋 Kiya Kiya Milega (Features)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: <Shield size={16} />, label: "Admin Login", desc: "Secure Supabase Auth" },
              { icon: <Users size={16} />, label: "Sellers Manage", desc: "Approve / Block" },
              { icon: <Package size={16} />, label: "Products", desc: "Approve / Reject" },
              { icon: <ShoppingCart size={16} />, label: "Orders", desc: "Status Updates" },
              { icon: <Database size={16} />, label: "Offline Mode", desc: "IndexedDB Storage" },
              { icon: <Wifi size={16} />, label: "Auto Sync", desc: "60s interval" },
              { icon: <WifiOff size={16} />, label: "Offline Work", desc: "No internet needed" },
              { icon: <Settings size={16} />, label: "Settings", desc: "Theme + Password" },
            ].map((f, i) => (
              <div key={i} className="p-2.5 rounded-lg border bg-muted/30 text-center">
                <div className="flex justify-center mb-1 text-primary">{f.icon}</div>
                <p className="text-xs font-semibold">{f.label}</p>
                <p className="text-[10px] text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="setup">
        <TabsList className="w-full">
          <TabsTrigger value="setup" className="flex-1 text-xs">🚀 Setup Guide</TabsTrigger>
          <TabsTrigger value="api" className="flex-1 text-xs">🔑 API Keys</TabsTrigger>
          <TabsTrigger value="help" className="flex-1 text-xs">❓ Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-3 mt-3">
          {/* Step 1: Requirements */}
          <Step num={1} title="Requirements Install Karo" open={true}>
            <p className="text-xs text-muted-foreground mb-2">Sirf <strong>1 cheez</strong> install karni hai:</p>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">✅ Node.js (v18+)</span>
                <Badge variant="outline" className="text-[10px]">Zaroori</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Free software — desktop app chalane ke liye chahiye</p>
              <p className="text-xs font-semibold mt-2">📥 Install karne ka tareeqa:</p>
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
                <li>Ye link browser mein kholein:</li>
              </ol>
              <CopyBtn text="https://nodejs.org" />
              <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside" start={2}>
                <li>Green <strong>"LTS"</strong> button par click karo — download hoga</li>
                <li>File kholein → <strong>Next → Next → Next → Install</strong></li>
                <li>Check karo — CMD kholein aur ye likhein:</li>
              </ol>
              <CopyBtn text="node --version" />
              <Tip type="success">Agar <code>v18.x.x</code> ya upar aaye to sab theek hai! ✅</Tip>
            </div>
          </Step>

          {/* Step 2: Download */}
          <Step num={2} title="Project Download Karo" open={true}>
            <p className="text-xs text-muted-foreground">Complete admin panel — sab kuch ready hai:</p>
            <a href="/FANZON-Admin-Panel.zip" download className="block">
              <Button className="w-full gap-2 h-11 text-sm mt-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                <Download size={16} /> Download FANZON Admin Panel
              </Button>
            </a>
            <Tip type="info">Download ke baad <strong>Right Click → Extract Here</strong> karo</Tip>
            <p className="text-xs font-semibold mt-2">📁 Folder Structure:</p>
            <div className="bg-muted rounded-lg p-2 text-xs font-mono space-y-0.5">
              <p>📂 fanzon-admin-panel/</p>
              <p className="pl-4">📂 electron/</p>
              <p className="pl-8">📄 main.cjs <span className="text-muted-foreground">(Electron main process)</span></p>
              <p className="pl-8">📄 preload.cjs <span className="text-muted-foreground">(Secure API bridge)</span></p>
              <p className="pl-4">📂 src/</p>
              <p className="pl-8">📂 database/ <span className="text-muted-foreground">(IndexedDB offline storage)</span></p>
              <p className="pl-8">📂 api/ <span className="text-muted-foreground">(Supabase + Sync engine)</span></p>
              <p className="pl-8">📄 index.html <span className="text-muted-foreground">(Admin UI)</span></p>
              <p className="pl-8">📄 app.js <span className="text-muted-foreground">(All page logic)</span></p>
              <p className="pl-4">📄 package.json</p>
              <p className="pl-4">📄 setup.bat / setup.sh</p>
            </div>
          </Step>

          {/* Step 3: Install */}
          <Step num={3} title="Install & Run Karo">
            <p className="text-xs text-muted-foreground mb-2">Extracted folder mein CMD/Terminal kholein:</p>
            
            <p className="text-xs font-semibold">🪟 Windows:</p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mb-2">
              <li>Extracted folder kholein</li>
              <li>Address bar mein <code>cmd</code> likhein → Enter</li>
              <li>Ye commands ek ek paste karo:</li>
            </ol>
            <CopyBtn text="npm install" />
            <p className="text-[10px] text-muted-foreground">⏳ 2-5 minute lagega — Electron download hoga</p>
            <CopyBtn text="npm start" />
            <Tip type="success">Admin Panel window khul jayega! 🎉 Apna admin email/password se login karo</Tip>

            <div className="border-t my-3" />
            <p className="text-xs font-semibold">🍎 Mac / 🐧 Linux:</p>
            <CopyBtn text="cd fanzon-admin-panel && chmod +x setup.sh && ./setup.sh" />
            <p className="text-[10px] text-muted-foreground mt-1">Phir: <code>npm start</code></p>
          </Step>

          {/* Step 4: Login */}
          <Step num={4} title="Login Kaise Karo">
            <p className="text-xs text-muted-foreground mb-2">App khulne ke baad:</p>
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Admin <strong>email</strong> enter karo (jo FANZON mein registered hai)</li>
              <li>Admin <strong>password</strong> enter karo</li>
              <li><strong>Sign In</strong> button dabao</li>
            </ol>
            <Tip type="warning">
              Pehli baar login ke liye <strong>internet zaroori hai</strong>. Uske baad offline bhi kaam karega!
            </Tip>
            <Tip type="info">
              Sirf <strong>admin role</strong> wale users login kar sakte hain. Customer ya seller login nahi hoga.
            </Tip>
          </Step>

          {/* Step 5: Build .exe */}
          <Step num={5} title=".exe File Banao (Installer)">
            <p className="text-xs text-muted-foreground mb-2">Agar <strong>.exe file</strong> chahiye jo bina terminal ke chaley:</p>
            
            <div className="space-y-3">
              <div className="p-2.5 rounded-lg border bg-muted/30">
                <p className="font-semibold text-xs mb-1">🪟 Windows .exe:</p>
                <CopyBtn text="npm run package:win" />
                <p className="text-[10px] text-muted-foreground mt-1">📁 Output: <code>release/FANZON-Admin-win32-x64/</code></p>
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30">
                <p className="font-semibold text-xs mb-1">🍎 macOS:</p>
                <CopyBtn text="npm run package:mac" />
              </div>
              <div className="p-2.5 rounded-lg border bg-muted/30">
                <p className="font-semibold text-xs mb-1">🐧 Linux:</p>
                <CopyBtn text="npm run package:linux" />
              </div>
            </div>
            <Tip type="warning">Build mein 5-10 minute lag sakte hain</Tip>
          </Step>
        </TabsContent>

        <TabsContent value="api" className="space-y-3 mt-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm">🔑 Pre-Configured API Keys</h3>
              <p className="text-xs text-muted-foreground">Ye keys already app mein configured hain — kuch karne ki zaroorat nahi:</p>
              
              <p className="text-[10px] font-semibold mt-2">Backend URL:</p>
              <CopyBtn text="https://faevzfibzcbuqjoatmjm.supabase.co" />
              
              <p className="text-[10px] font-semibold">Public API Key:</p>
              <CopyBtn text="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXZ6ZmliemNidXFqb2F0bWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTM4OTQsImV4cCI6MjA4NzM2OTg5NH0.1P6q4Xo5xKWHExRnUOaQPjwq-AxmQ6K4Sp4FTpWPXGM" />
              
              <Tip type="success">Ye keys public hain aur already app mein set hain. Alag se kuch karne ki zaroorat nahi! ✅</Tip>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm">📡 API Endpoints (Developers Ke Liye)</h3>
              <div className="space-y-2">
                <div className="p-2 rounded border bg-muted/30">
                  <p className="text-[10px] font-semibold">🔐 Auth Login:</p>
                  <CopyBtn text="POST https://faevzfibzcbuqjoatmjm.supabase.co/auth/v1/token?grant_type=password" />
                </div>
                <div className="p-2 rounded border bg-muted/30">
                  <p className="text-[10px] font-semibold">👥 Get Sellers:</p>
                  <CopyBtn text="GET https://faevzfibzcbuqjoatmjm.supabase.co/rest/v1/seller_profiles?select=*" />
                </div>
                <div className="p-2 rounded border bg-muted/30">
                  <p className="text-[10px] font-semibold">📦 Get Products:</p>
                  <CopyBtn text="GET https://faevzfibzcbuqjoatmjm.supabase.co/rest/v1/products?select=*" />
                </div>
                <div className="p-2 rounded border bg-muted/30">
                  <p className="text-[10px] font-semibold">📋 Get Orders:</p>
                  <CopyBtn text="GET https://faevzfibzcbuqjoatmjm.supabase.co/rest/v1/orders?select=*" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-3 mt-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm">❓ Common Problems & Solutions</h3>
              <div className="space-y-2">
                {[
                  { q: '"npm" command not found', a: "Node.js install nahi hua — Step 1 dobara follow karo" },
                  { q: "npm install fail ho raha", a: "Node version check karo: node --version (18+ chahiye)" },
                  { q: "Login fail ho raha", a: "1) Internet check karo  2) Admin email/password sahi hai?  3) Sirf admin role login kar sakta hai" },
                  { q: "Blank/white screen", a: "Internet check karo — pehli baar data download hota hai" },
                  { q: "Offline mode kaam nahi kar raha", a: "Pehle ek baar online login karo — data download hoga, phir offline chalega" },
                  { q: "Data sync nahi ho raha", a: "Internet connection check karo. Sync page par 'Sync Now' button dabao" },
                  { q: "package:win fail ho raha", a: "Pehle npm install karo, phir npm run package:win" },
                  { q: ".exe file kahan hai?", a: "release/FANZON-Admin-win32-x64/ folder mein FANZON-Admin.exe milegi" },
                ].map((item, i) => (
                  <div key={i} className="p-2.5 rounded border bg-muted/30">
                    <p className="text-xs font-semibold">❌ {item.q}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">✅ {item.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDesktopAppPage;
