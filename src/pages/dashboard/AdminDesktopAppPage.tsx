import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Monitor, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const PUBLISHED_URL = "https://fanzoon.lovable.app";
const SUPABASE_URL = "https://faevzfibzcbuqjoatmjm.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhZXZ6ZmliemNidXFqb2F0bWptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTM4OTQsImV4cCI6MjA4NzM2OTg5NH0.1P6q4Xo5xKWHExRnUOaQPjwq-AxmQ6K4Sp4FTpWPXGM";
const SYNC_API = `${SUPABASE_URL}/functions/v1/sync-products`;

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
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Monitor className="h-6 w-6" />
          <h1 className="text-lg font-bold">Desktop App Setup</h1>
          <Badge className="bg-white/20 text-white border-0 text-[10px]">Ready-Made</Badge>
        </div>
        <p className="text-white/80 text-xs">Sirf 4 steps mein apna desktop app banao — sab kuch ready hai</p>
      </div>

      {/* ===== REQUIREMENTS ===== */}
      <Step num={1} title="Requirements (Kiya Chahiye?)" open={true}>
        <p className="text-xs text-muted-foreground mb-2">Desktop app banane ke liye sirf <strong>1 cheez</strong> install karni hai:</p>
        
        <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm">✅ Node.js (v18 ya usse zyada)</span>
            <Badge variant="outline" className="text-[10px]">Zaroori</Badge>
          </div>
          <p className="text-xs text-muted-foreground">Ye ek free software hai jo desktop app chalane ke liye chahiye</p>
          
          <p className="text-xs font-semibold mt-2">📥 Kaise install karein:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Ye link kholein browser mein:</li>
          </ol>
          <CopyBtn text="https://nodejs.org" />
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside" start={2}>
            <li>Green button <strong>"LTS"</strong> par click karo — download hoga</li>
            <li>Download hone ke baad file kholein aur <strong>Next Next Next</strong> karke install karo</li>
            <li>Install hone ke baad check karo — CMD/Terminal kholein aur ye likho:</li>
          </ol>
          <CopyBtn text="node --version" />
          <Tip type="success">Agar <code>v18.x.x</code> ya usse zyada aaye to sab sahi hai! ✅</Tip>
        </div>
      </Step>

      {/* ===== DOWNLOAD ===== */}
      <Step num={2} title="Project Download Karo" open={true}>
        <p className="text-xs text-muted-foreground">Ye file download karo — ismein sab kuch ready hai, kuch banane ki zaroorat nahi:</p>
        
        <a href="/FANZON-Desktop-App.zip" download className="block">
          <Button className="w-full gap-2 h-11 text-sm mt-1">
            <Download size={16} /> Download FANZON-Desktop-App
          </Button>
        </a>
        
        <Tip type="info">
          Download ke baad file ko <strong>Extract/Unzip</strong> karo. Right click → Extract Here
        </Tip>
        
        <p className="text-xs font-semibold mt-2">📁 Ismein ye files hain (ready-made):</p>
        <div className="bg-muted rounded-lg p-2 text-xs font-mono space-y-0.5">
          <p>📂 fanzon-desktop-app/</p>
          <p className="pl-4">📂 electron/</p>
          <p className="pl-8">📄 main.cjs <span className="text-muted-foreground">(app ka main code)</span></p>
          <p className="pl-8">📄 preload.cjs <span className="text-muted-foreground">(security file)</span></p>
          <p className="pl-4">📄 package.json <span className="text-muted-foreground">(settings)</span></p>
          <p className="pl-4">📄 setup.bat <span className="text-muted-foreground">(Windows ke liye)</span></p>
          <p className="pl-4">📄 setup.sh <span className="text-muted-foreground">(Mac/Linux ke liye)</span></p>
        </div>
      </Step>

      {/* ===== RUN ===== */}
      <Step num={3} title="App Chalao (Run Karo)">
        <p className="text-xs text-muted-foreground mb-2">Ab extracted folder mein jaake CMD/Terminal kholein:</p>
        
        <p className="text-xs font-semibold">🪟 Windows users:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mb-2">
          <li>Extracted folder kholein</li>
          <li>Address bar mein <code>cmd</code> likhein aur Enter dabao</li>
          <li>Ye commands paste karo ek ek karke:</li>
        </ol>
        <CopyBtn text="npm install" />
        <p className="text-[10px] text-muted-foreground">⏳ Ye 2-3 minute lega — wait karo</p>
        <CopyBtn text="npm start" />
        <Tip type="success">App khul jayega! FANZON Seller Center desktop pe dikhai dega 🎉</Tip>

        <div className="border-t my-3" />
        
        <p className="text-xs font-semibold">🍎 Mac/Linux users:</p>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside mb-2">
          <li>Terminal kholein</li>
          <li>Folder mein jaayein aur ye chalao:</li>
        </ol>
        <CopyBtn text="cd fanzon-desktop-app && npm install && npm start" />
      </Step>

      {/* ===== BUILD EXE ===== */}
      <Step num={4} title=".exe File Banao (Optional)">
        <p className="text-xs text-muted-foreground mb-2">Agar aap chahte hain ke <strong>.exe file</strong> baney jo bina terminal ke chale, to ye command chalao:</p>
        
        <div className="space-y-3">
          <div className="p-2.5 rounded-lg border bg-muted/30">
            <p className="font-semibold text-xs mb-1">🪟 Windows .exe banane ke liye:</p>
            <CopyBtn text="npm run package:win" />
            <p className="text-[10px] text-muted-foreground mt-1">📁 Output: <code>release/FANZON-Seller-win32-x64/</code> folder mein .exe milegi</p>
          </div>

          <div className="p-2.5 rounded-lg border bg-muted/30">
            <p className="font-semibold text-xs mb-1">🍎 macOS app banane ke liye:</p>
            <CopyBtn text="npm run package:mac" />
          </div>

          <div className="p-2.5 rounded-lg border bg-muted/30">
            <p className="font-semibold text-xs mb-1">🐧 Linux app banane ke liye:</p>
            <CopyBtn text="npm run package:linux" />
          </div>
        </div>
        
        <Tip type="warning">
          .exe build mein 5-10 minute lag sakte hain — patience rakhein
        </Tip>
      </Step>

      {/* ===== API KEYS ===== */}
      <Step num={5} title="🔑 API Keys (Developers Ke Liye)">
        <p className="text-xs text-muted-foreground mb-2">Agar aap custom app bana rahe hain ya API connect karna hai to ye keys use karo:</p>
        
        <p className="text-[10px] font-semibold">Backend URL:</p>
        <CopyBtn text={SUPABASE_URL} />
        
        <p className="text-[10px] font-semibold">Public API Key:</p>
        <CopyBtn text={ANON_KEY} />
        
        <p className="text-[10px] font-semibold">Products Sync API:</p>
        <CopyBtn text={SYNC_API} />

        <Tip type="info">
          Ye keys public hain — app mein use karna safe hai. Secret key Lovable Cloud mein protected hai.
        </Tip>

        <div className="border-t my-3" />
        <p className="text-xs font-semibold mb-1">API Endpoints:</p>
        
        <div className="space-y-2">
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-[10px] font-semibold">🔐 Seller Login Verify:</p>
            <CopyBtn text={`POST ${SYNC_API}?action=login`} />
          </div>
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-[10px] font-semibold">📦 Bulk Product Sync:</p>
            <CopyBtn text={`POST ${SYNC_API}?action=sync`} />
          </div>
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-[10px] font-semibold">📋 Get Seller Products:</p>
            <CopyBtn text={`GET ${SYNC_API}?action=seller-products`} />
          </div>
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-[10px] font-semibold">🖼️ Upload Image (base64):</p>
            <CopyBtn text={`POST ${SYNC_API}?action=upload-image`} />
          </div>
        </div>
      </Step>

      {/* ===== TROUBLESHOOTING ===== */}
      <Step num={6} title="❓ Masla Aaye To (Troubleshooting)">
        <div className="space-y-2">
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-xs font-semibold">❌ "npm" command not found</p>
            <p className="text-[10px] text-muted-foreground">Node.js install nahi hua — Step 1 dobara karo</p>
          </div>
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-xs font-semibold">❌ Blank/white screen aaye</p>
            <p className="text-[10px] text-muted-foreground">Internet connection check karo — app online FANZON load karta hai</p>
          </div>
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-xs font-semibold">❌ npm install fail ho raha</p>
            <p className="text-[10px] text-muted-foreground">Node version check karo: <code>node --version</code> (18+ chahiye). Purana ho to nodejs.org se naya install karo</p>
          </div>
          <div className="p-2 rounded border bg-muted/30">
            <p className="text-xs font-semibold">❌ package:win command fail</p>
            <p className="text-[10px] text-muted-foreground">Pehle <code>npm install</code> karo, phir <code>npm run package:win</code></p>
          </div>
        </div>
      </Step>
    </div>
  );
};

export default AdminDesktopAppPage;
