import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Monitor, Download, Copy, Check, ChevronRight, Shield, Users,
  Package, ShoppingCart, DollarSign, RefreshCw, Wifi, WifiOff,
  Database, Settings, HardDrive, Zap, Terminal, Key, HelpCircle,
  CheckCircle2, XCircle, Clock, TrendingUp, Activity
} from "lucide-react";

/* ── Helpers ── */
const CopyBlock = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div className="group relative">
      {label && <p className="text-[11px] font-medium text-muted-foreground mb-1">{label}</p>}
      <div className="flex items-center gap-2 bg-secondary/80 border border-border/60 rounded-lg px-3 py-2.5">
        <code className="text-xs text-foreground font-mono flex-1 break-all">{text}</code>
        <button
          onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 1500); }}
          className="shrink-0 p-1.5 rounded-md hover:bg-primary/10 transition-colors"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-muted-foreground" />}
        </button>
      </div>
    </div>
  );
};

const InfoBox = ({ type = "info", children }: { type?: "info" | "warning" | "success"; children: React.ReactNode }) => {
  const styles = {
    info: "bg-blue-500/5 border-blue-500/20 text-blue-700 dark:text-blue-300",
    warning: "bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-300",
    success: "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  };
  const icons = { info: <Zap size={14} />, warning: <Clock size={14} />, success: <CheckCircle2 size={14} /> };
  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${styles[type]}`}>
      <span className="shrink-0 mt-0.5">{icons[type]}</span>
      <p className="text-xs leading-relaxed">{children}</p>
    </div>
  );
};

/* ── Live Stats Hook ── */
const useLiveStats = () => useQuery({
  queryKey: ["desktop-live-stats"],
  queryFn: async () => {
    const [sellers, products, orders, payouts] = await Promise.all([
      supabase.from("seller_profiles").select("id, verification_status", { count: "exact" }),
      supabase.from("products").select("id, status", { count: "exact" }),
      supabase.from("orders").select("id, total_amount_pkr, order_status", { count: "exact" }),
      supabase.from("payout_requests").select("id, status", { count: "exact" }),
    ]);
    const verified = sellers.data?.filter(s => s.verification_status === "verified").length || 0;
    const active = products.data?.filter(p => p.status === "active").length || 0;
    const delivered = orders.data?.filter(o => o.order_status === "delivered").length || 0;
    const pending = orders.data?.filter(o => o.order_status === "pending").length || 0;
    const revenue = orders.data?.reduce((s, o) => s + Number(o.total_amount_pkr || 0), 0) || 0;
    const pendingPayouts = payouts.data?.filter(p => p.status === "pending").length || 0;
    return {
      totalSellers: sellers.count || 0, verified,
      totalProducts: products.count || 0, active,
      totalOrders: orders.count || 0, delivered, pending,
      revenue, pendingPayouts,
    };
  },
  refetchInterval: 15000,
});

/* ── Stat Card ── */
const StatCard = ({ icon, label, value, sub, gradient }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string; gradient: string;
}) => (
  <div className={`relative overflow-hidden rounded-xl border p-4 ${gradient}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs font-semibold mt-0.5">{label}</p>
        {sub && <p className="text-[10px] opacity-70 mt-0.5">{sub}</p>}
      </div>
      <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">{icon}</div>
    </div>
  </div>
);

/* ── Feature Card ── */
const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl border border-border/60 bg-card hover:bg-accent/30 transition-colors">
    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">{icon}</div>
    <div>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground">{desc}</p>
    </div>
  </div>
);

/* ── Setup Step ── */
const SetupStep = ({ num, title, children }: { num: number; title: string; children: React.ReactNode }) => (
  <div className="relative pl-10">
    <div className="absolute left-0 top-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/20">
      {num}
    </div>
    <div className="pb-6 border-l-2 border-border/40 pl-6 ml-[15px]">
      <h4 className="font-bold text-sm mb-3">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  </div>
);

/* ── Main Page ── */
const AdminDesktopAppPage = () => {
  const { data: stats, isLoading, refetch, dataUpdatedAt } = useLiveStats();
  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("en-PK") : "—";

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 p-6 md:p-8">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
              <Monitor size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">FANZON Desktop Admin</h1>
              <p className="text-white/60 text-xs">Electron.js • Offline + Online • Real-time Sync</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {["Windows .exe", "macOS", "Linux", "Offline Mode", "Auto Sync", "Dark/Light Theme"].map(tag => (
              <Badge key={tag} className="bg-white/10 text-white/80 border-white/10 text-[10px] font-medium">{tag}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Live Stats */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              <h3 className="font-bold text-sm">Live Platform Stats</h3>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">LIVE</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{lastUpdate}</span>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => refetch()}>
                <RefreshCw size={12} /> Refresh
              </Button>
            </div>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={<Users size={20} className="text-white" />} label="Total Sellers" value={stats?.totalSellers || 0} sub={`${stats?.verified || 0} verified`} gradient="bg-gradient-to-br from-violet-500/10 to-purple-500/5 border-violet-500/20" />
              <StatCard icon={<Package size={20} className="text-white" />} label="Products" value={stats?.totalProducts || 0} sub={`${stats?.active || 0} active`} gradient="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20" />
              <StatCard icon={<ShoppingCart size={20} className="text-white" />} label="Orders" value={stats?.totalOrders || 0} sub={`${stats?.pending || 0} pending`} gradient="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20" />
              <StatCard icon={<DollarSign size={20} className="text-white" />} label="Revenue" value={`Rs. ${((stats?.revenue || 0) / 1000).toFixed(1)}K`} sub={`${stats?.delivered || 0} delivered`} gradient="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Zap size={14} className="text-primary" /> Desktop App Features</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FeatureCard icon={<Shield size={18} />} title="Secure Admin Login" desc="Supabase Auth — sirf admin role login kar sakta" />
          <FeatureCard icon={<Users size={18} />} title="Sellers Management" desc="Approve, block, unblock — sab ek jagah" />
          <FeatureCard icon={<Package size={18} />} title="Products Control" desc="Approve/reject products with real-time sync" />
          <FeatureCard icon={<ShoppingCart size={18} />} title="Order Management" desc="Status update — pending se delivered tak" />
          <FeatureCard icon={<DollarSign size={18} />} title="Withdrawal Requests" desc="Seller payouts approve/reject karo" />
          <FeatureCard icon={<Database size={18} />} title="Offline Database" desc="IndexedDB — bina internet bhi kaam karo" />
          <FeatureCard icon={<Wifi size={18} />} title="Auto Sync" desc="Internet milte hi data sync ho jata hai" />
          <FeatureCard icon={<HardDrive size={18} />} title=".exe Installer" desc="Windows, macOS, Linux — sab support" />
          <FeatureCard icon={<Settings size={18} />} title="Dark/Light Theme" desc="Professional look with theme toggle" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="setup">
        <TabsList className="w-full bg-secondary/80 p-1 rounded-xl">
          <TabsTrigger value="setup" className="flex-1 text-xs rounded-lg gap-1.5 data-[state=active]:shadow-sm">
            <Terminal size={13} /> Setup Guide
          </TabsTrigger>
          <TabsTrigger value="api" className="flex-1 text-xs rounded-lg gap-1.5 data-[state=active]:shadow-sm">
            <Key size={13} /> API Config
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex-1 text-xs rounded-lg gap-1.5 data-[state=active]:shadow-sm">
            <HelpCircle size={13} /> FAQ
          </TabsTrigger>
        </TabsList>

        {/* SETUP TAB */}
        <TabsContent value="setup" className="mt-5 space-y-1">
          <SetupStep num={1} title="Node.js Install Karo">
            <p className="text-xs text-muted-foreground">Desktop app chalane ke liye Node.js zaroori hai (free software).</p>
            <CopyBlock text="https://nodejs.org" label="Download Link" />
            <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside mt-2">
              <li>Green <strong>LTS</strong> button click → download karo</li>
              <li>File kholein → <strong>Next → Next → Install</strong></li>
              <li>CMD mein verify karo:</li>
            </ol>
            <CopyBlock text="node --version" />
            <InfoBox type="success">Agar <code className="font-mono bg-white/20 px-1 rounded">v18.x.x</code> ya upar dikhaye — sab theek hai!</InfoBox>
          </SetupStep>

          <SetupStep num={2} title="Admin Panel Download Karo">
            <p className="text-xs text-muted-foreground">Complete ready-made project — bas download aur extract karo.</p>
            <a href="/FANZON-Admin-Panel.zip" download>
              <Button className="w-full gap-2 h-12 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/20 rounded-xl">
                <Download size={18} /> Download FANZON Admin Panel
              </Button>
            </a>
            <InfoBox type="info">Download hone ke baad → <strong>Right Click → Extract All</strong></InfoBox>
          </SetupStep>

          <SetupStep num={3} title="Install & Start Karo">
            <p className="text-xs text-muted-foreground">Extracted folder mein CMD/Terminal kholein aur ye run karo:</p>
            <CopyBlock text="npm install" label="Step 1 — Dependencies install" />
            <InfoBox type="warning">Pehli baar 2-5 minute lag sakta hai</InfoBox>
            <CopyBlock text="npm start" label="Step 2 — App start karo" />
            <InfoBox type="success">Admin Panel window khul jayegi! 🎉</InfoBox>
          </SetupStep>

          <SetupStep num={4} title="Login Karo">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>Admin email aur password se login karo — bilkul web jaise.</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg border bg-card">
                  <p className="font-semibold text-foreground text-[11px]">✅ Kya chahiye</p>
                  <ul className="mt-1 space-y-0.5 text-[10px]">
                    <li>• Admin email</li>
                    <li>• Admin password</li>
                    <li>• Internet (pehli baar)</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg border bg-card">
                  <p className="font-semibold text-foreground text-[11px]">ℹ️ Important</p>
                  <ul className="mt-1 space-y-0.5 text-[10px]">
                    <li>• Sirf admin role</li>
                    <li>• QR Login support</li>
                    <li>• Baad mein offline chalega</li>
                  </ul>
                </div>
              </div>
            </div>
          </SetupStep>

          <SetupStep num={5} title=".exe File Banao (Optional)">
            <p className="text-xs text-muted-foreground">Installer banana chahte ho? Ye commands run karo:</p>
            <CopyBlock text="npm run package:win" label="🪟 Windows .exe" />
            <CopyBlock text="npm run package:mac" label="🍎 macOS App" />
            <CopyBlock text="npm run package:linux" label="🐧 Linux App" />
            <InfoBox type="info">Build 5-10 minute le sakta hai. Output <code className="font-mono bg-white/20 px-1 rounded">release/</code> folder mein milega.</InfoBox>
          </SetupStep>
        </TabsContent>

        {/* API TAB */}
        <TabsContent value="api" className="mt-5 space-y-4">
          <Card className="border-border/60">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Key size={16} className="text-primary" />
                <h3 className="font-bold text-sm">Pre-Configured Keys</h3>
                <Badge variant="outline" className="text-[10px]">Already Set</Badge>
              </div>
              <InfoBox type="success">Ye keys already app mein configured hain — kuch karne ki zaroorat nahi!</InfoBox>
              <CopyBlock text={`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID || "your-project"}.supabase.co`} label="Backend URL" />
              <CopyBlock text={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "Set in .env"} label="Public API Key (Anon)" />
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardContent className="p-5 space-y-3">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Activity size={14} className="text-primary" /> API Endpoints
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Auth Login", method: "POST", path: "/auth/v1/token?grant_type=password" },
                  { label: "Get Sellers", method: "GET", path: "/rest/v1/seller_profiles?select=*" },
                  { label: "Get Products", method: "GET", path: "/rest/v1/products?select=*" },
                  { label: "Get Orders", method: "GET", path: "/rest/v1/orders?select=*" },
                  { label: "Get Payouts", method: "GET", path: "/rest/v1/payout_requests?select=*" },
                ].map((ep, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge variant={ep.method === "POST" ? "default" : "outline"} className="text-[9px] w-11 justify-center shrink-0">
                      {ep.method}
                    </Badge>
                    <code className="text-[11px] text-muted-foreground font-mono truncate">{ep.path}</code>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ TAB */}
        <TabsContent value="faq" className="mt-5 space-y-3">
          {[
            { q: '"npm" command not found', a: "Node.js install nahi hua — Step 1 follow karo", icon: <XCircle size={14} className="text-destructive" /> },
            { q: "npm install fail ho raha", a: "Node version check karo: node --version (18+ chahiye)", icon: <XCircle size={14} className="text-destructive" /> },
            { q: "Login fail ho raha", a: "1) Internet check karo  2) Admin email sahi hai?  3) Sirf admin role login kar sakta", icon: <XCircle size={14} className="text-destructive" /> },
            { q: "Blank/white screen aata hai", a: "Pehli baar internet zaroori hai — data download hota hai", icon: <XCircle size={14} className="text-destructive" /> },
            { q: "Data sync nahi ho raha", a: "Internet check karo. Settings → Sync → 'Sync Now' dabao", icon: <Clock size={14} className="text-amber-500" /> },
            { q: ".exe file kahan milegi?", a: "release/FANZON-Admin-win32-x64/ folder mein hogi", icon: <HelpCircle size={14} className="text-blue-500" /> },
            { q: "Offline mode kaise kaam karta?", a: "Pehli baar sync hone ke baad data IndexedDB mein save hota hai — baad mein internet ki zaroorat nahi", icon: <HelpCircle size={14} className="text-blue-500" /> },
          ].map((item, i) => (
            <Card key={i} className="border-border/60">
              <CardContent className="p-4">
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold">{item.q}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.a}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDesktopAppPage;
