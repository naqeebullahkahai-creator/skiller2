import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, Download, Monitor, AlertTriangle, Info, ChevronDown, ChevronUp, Shield, Database, Wifi, WifiOff, Settings, Users, Package, ShoppingCart, RefreshCw, TrendingUp, Wallet, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

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

// Real-time stats from Supabase
const useLiveStats = () => {
  return useQuery({
    queryKey: ["desktop-app-live-stats"],
    queryFn: async () => {
      const [sellersRes, productsRes, ordersRes] = await Promise.all([
        supabase.from("seller_profiles").select("id, verification_status", { count: "exact" }),
        supabase.from("products").select("id, status", { count: "exact" }),
        supabase.from("orders").select("id, total_amount_pkr, order_status", { count: "exact" }),
      ]);

      const totalSellers = sellersRes.count || 0;
      const verifiedSellers = sellersRes.data?.filter(s => s.verification_status === "verified").length || 0;
      const totalProducts = productsRes.count || 0;
      const activeProducts = productsRes.data?.filter(p => p.status === "approved").length || 0;
      const totalOrders = ordersRes.count || 0;
      const deliveredOrders = ordersRes.data?.filter(o => o.order_status === "delivered").length || 0;
      const totalRevenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.total_amount_pkr || 0), 0) || 0;

      return { totalSellers, verifiedSellers, totalProducts, activeProducts, totalOrders, deliveredOrders, totalRevenue };
    },
    refetchInterval: 30000, // Auto-refresh every 30s
  });
};

const StatCard = ({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) => (
  <div className={`p-3 rounded-xl border ${color} text-center`}>
    <div className="flex justify-center mb-1.5">{icon}</div>
    <p className="text-lg font-bold">{value}</p>
    <p className="text-xs font-medium">{label}</p>
    {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
  </div>
);

const AdminDesktopAppPage = () => {
  const { data: stats, isLoading: statsLoading, refetch } = useLiveStats();

  return (
    <div className="space-y-3 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="h-6 w-6" />
          <h1 className="text-lg font-bold">Admin Desktop Panel</h1>
          <Badge className="bg-white/20 text-white border-0 text-[10px]">Live Data</Badge>
        </div>
        <p className="text-white/80 text-xs">Complete admin software — real-time Supabase + offline sync</p>
      </div>

      {/* Real-Time Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">📊 Live Platform Stats</h3>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => refetch()}>
              <RefreshCw size={12} /> Refresh
            </Button>
          </div>
          {statsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <StatCard icon={<Users size={18} className="text-primary" />} label="Total Sellers" value={stats?.totalSellers || 0} sub={`${stats?.verifiedSellers || 0} verified`} color="bg-primary/5 border-primary/20" />
              <StatCard icon={<Package size={18} className="text-emerald-600" />} label="Products" value={stats?.totalProducts || 0} sub={`${stats?.activeProducts || 0} active`} color="bg-emerald-500/5 border-emerald-500/20" />
              <StatCard icon={<ShoppingCart size={18} className="text-blue-600" />} label="Orders" value={stats?.totalOrders || 0} sub={`${stats?.deliveredOrders || 0} delivered`} color="bg-blue-500/5 border-blue-500/20" />
              <StatCard icon={<DollarSign size={18} className="text-amber-600" />} label="Revenue" value={`Rs. ${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`} sub="Total order value" color="bg-amber-500/5 border-amber-500/20" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-bold text-sm mb-3">📋 Features</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { icon: <Shield size={16} />, label: "Admin Login", desc: "Supabase Auth" },
              { icon: <Users size={16} />, label: "Sellers Manage", desc: "Approve / Block" },
              { icon: <Package size={16} />, label: "Products", desc: "Approve / Reject" },
              { icon: <ShoppingCart size={16} />, label: "Orders", desc: "Real-time Status" },
              { icon: <Database size={16} />, label: "Offline Mode", desc: "IndexedDB" },
              { icon: <Wifi size={16} />, label: "Auto Sync", desc: "30s interval" },
              { icon: <WifiOff size={16} />, label: "Offline Work", desc: "No internet needed" },
              { icon: <Settings size={16} />, label: "Settings", desc: "Theme + API" },
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
          <TabsTrigger value="setup" className="flex-1 text-xs">🚀 Setup</TabsTrigger>
          <TabsTrigger value="api" className="flex-1 text-xs">🔑 API</TabsTrigger>
          <TabsTrigger value="help" className="flex-1 text-xs">❓ Help</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-3 mt-3">
          <Step num={1} title="Requirements Install Karo" open={true}>
            <p className="text-xs text-muted-foreground mb-2">Sirf <strong>1 cheez</strong> install karni hai:</p>
            <div className="p-3 rounded-lg border bg-muted/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">✅ Node.js (v18+)</span>
                <Badge variant="outline" className="text-[10px]">Zaroori</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Free software — desktop app chalane ke liye chahiye</p>
              <CopyBtn text="https://nodejs.org" />
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Green <strong>"LTS"</strong> button par click karo → download</li>
                <li>File kholein → <strong>Next → Next → Install</strong></li>
                <li>CMD kholein aur check karo:</li>
              </ol>
              <CopyBtn text="node --version" />
              <Tip type="success">Agar <code>v18.x.x</code> ya upar aaye to theek hai! ✅</Tip>
            </div>
          </Step>

          <Step num={2} title="Project Download Karo" open={true}>
            <p className="text-xs text-muted-foreground">Complete admin panel — sab ready hai:</p>
            <a href="/FANZON-Admin-Panel.zip" download className="block">
              <Button className="w-full gap-2 h-11 text-sm mt-1 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600">
                <Download size={16} /> Download FANZON Admin Panel
              </Button>
            </a>
            <Tip type="info">Download ke baad <strong>Right Click → Extract Here</strong></Tip>
          </Step>

          <Step num={3} title="Install & Run Karo">
            <p className="text-xs text-muted-foreground mb-2">Extracted folder mein CMD kholein:</p>
            <CopyBtn text="npm install" />
            <p className="text-[10px] text-muted-foreground">⏳ 2-5 minute lagega</p>
            <CopyBtn text="npm start" />
            <Tip type="success">Admin Panel khul jayega! 🎉</Tip>
          </Step>

          <Step num={4} title="Login Kaise Karo">
            <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Admin <strong>email</strong> enter karo</li>
              <li>Admin <strong>password</strong> enter karo</li>
              <li><strong>Sign In</strong> dabao</li>
            </ol>
            <Tip type="warning">Pehli baar login ke liye <strong>internet zaroori hai</strong></Tip>
            <Tip type="info">Sirf <strong>admin role</strong> wale users login kar sakte hain</Tip>
          </Step>

          <Step num={5} title=".exe File Banao (Installer)">
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
              <p className="text-xs text-muted-foreground">Ye keys already app mein set hain:</p>
              
              <p className="text-[10px] font-semibold mt-2">Backend URL:</p>
              <CopyBtn text={`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co`} />
              
              <p className="text-[10px] font-semibold">Public API Key:</p>
              <CopyBtn text={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "Check .env file"} />
              
              <Tip type="success">Ye keys public hain — already app mein configured! ✅</Tip>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm">📡 API Endpoints</h3>
              <div className="space-y-2">
                {[
                  { label: "🔐 Auth Login", url: `POST ${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password` },
                  { label: "👥 Get Sellers", url: `GET ${import.meta.env.VITE_SUPABASE_URL}/rest/v1/seller_profiles?select=*` },
                  { label: "📦 Get Products", url: `GET ${import.meta.env.VITE_SUPABASE_URL}/rest/v1/products?select=*` },
                  { label: "📋 Get Orders", url: `GET ${import.meta.env.VITE_SUPABASE_URL}/rest/v1/orders?select=*` },
                  { label: "💰 Get Wallets", url: `GET ${import.meta.env.VITE_SUPABASE_URL}/rest/v1/seller_wallets?select=*` },
                ].map((ep, i) => (
                  <div key={i} className="p-2 rounded border bg-muted/30">
                    <p className="text-[10px] font-semibold">{ep.label}</p>
                    <CopyBtn text={ep.url} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-3 mt-3">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-sm">❓ Common Problems</h3>
              <div className="space-y-2">
                {[
                  { q: '"npm" command not found', a: "Node.js install nahi hua — Step 1 follow karo" },
                  { q: "npm install fail", a: "Node version check karo: node --version (18+ chahiye)" },
                  { q: "Login fail", a: "1) Internet check karo  2) Admin email sahi hai?  3) Sirf admin role login hoga" },
                  { q: "Blank/white screen", a: "Internet check karo — pehli baar data download hota hai" },
                  { q: "Data sync nahi ho raha", a: "Internet check karo. Sync page par 'Sync Now' dabao" },
                  { q: ".exe file kahan hai?", a: "release/FANZON-Admin-win32-x64/ folder mein milegi" },
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
