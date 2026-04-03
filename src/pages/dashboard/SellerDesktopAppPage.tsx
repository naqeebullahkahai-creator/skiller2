import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Monitor, Download, Copy, Check, Package, ShoppingCart,
  DollarSign, RefreshCw, Wifi, Activity, Terminal, CheckCircle2,
  Clock, Laptop, Shield, Zap, Store, TrendingUp
} from "lucide-react";

const CopyBlock = ({ text, label }: { text: string; label?: string }) => {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      {label && <p className="text-[11px] font-medium text-muted-foreground mb-1">{label}</p>}
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2.5">
        <code className="text-xs font-mono flex-1 break-all text-foreground">{text}</code>
        <button
          onClick={() => { navigator.clipboard.writeText(text); setCopied(true); toast.success("Copied!"); setTimeout(() => setCopied(false), 1500); }}
          className="shrink-0 p-1.5 rounded-md hover:bg-primary/10"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-muted-foreground" />}
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, loading }: any) => (
  <Card className="border-border/50">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="h-6 w-16 mt-1" /> : (
            <p className="text-xl font-bold text-foreground">{value}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
);

const SellerDesktopAppPage = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["seller-desktop-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return { products: 0, orders: 0, revenue: 0 };
      const [products, orders, revenue] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }).eq("seller_id", user.id).eq("status", "active"),
        supabase.from("orders").select("items").contains("items", JSON.stringify([{ seller_id: user.id }])),
        supabase.from("wallet_transactions").select("net_amount").eq("seller_id", user.id).eq("transaction_type", "earning"),
      ]);
      const totalRevenue = revenue.data?.reduce((s, t) => s + Number(t.net_amount || 0), 0) || 0;
      return {
        products: products.count || 0,
        orders: orders.data?.length || 0,
        revenue: totalRevenue,
      };
    },
    refetchInterval: 15000,
    enabled: !!user?.id,
  });

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("en-PK") : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl">
            <Store size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Seller Desktop App</h1>
            <p className="text-sm text-muted-foreground">Apni dukaan desktop se chalayein</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50">
            <Wifi size={12} /> Live
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Live Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Package} label="My Products" value={stats?.products} color="bg-emerald-500" loading={isLoading} />
        <StatCard icon={ShoppingCart} label="My Orders" value={stats?.orders} color="bg-purple-500" loading={isLoading} />
        <StatCard icon={DollarSign} label="Earnings" value={`₨${((stats?.revenue || 0) / 1000).toFixed(0)}K`} color="bg-orange-500" loading={isLoading} />
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
        <Activity size={10} /> Last updated: {lastUpdate}
      </p>

      {/* Tabs */}
      <Tabs defaultValue="download">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="download"><Download size={14} className="mr-1" /> Download</TabsTrigger>
          <TabsTrigger value="setup"><Terminal size={14} className="mr-1" /> Setup</TabsTrigger>
          <TabsTrigger value="api"><Shield size={14} className="mr-1" /> API Info</TabsTrigger>
        </TabsList>

        <TabsContent value="download" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Laptop size={18} /> Download Seller Desktop App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">v2.0 — Sirf Node.js chahiye!</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Koi extra tools install karne ki zaroorat nahi. Download karein, extract karein, setup.bat chalayein!
                    </p>
                  </div>
                </div>
              </div>

              <a href="/FANZON-Seller-Desktop.zip" download className="block">
                <Button className="w-full gap-2 h-12 text-base">
                  <Download size={18} /> Download Seller Desktop v2.0
                </Button>
              </a>

              <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="font-medium text-foreground">Windows</p>
                  <p>.exe</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="font-medium text-foreground">macOS</p>
                  <p>.dmg</p>
                </div>
                <div className="p-2 bg-muted/30 rounded-lg">
                  <p className="font-medium text-foreground">Linux</p>
                  <p>.AppImage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setup" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Setup Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { n: 1, t: "Node.js Install", d: "nodejs.org se download karein", c: "node --version" },
                { n: 2, t: "ZIP Download", d: "Download button se ZIP lein", c: null },
                { n: 3, t: "Extract & Run", d: "ZIP extract kar ke setup.bat chalayein", c: "setup.bat" },
                { n: 4, t: ".exe Banana Ho (Optional)", d: "Installer build karein", c: "npm run build" },
              ].map((s) => (
                <div key={s.n} className="flex gap-3">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{s.n}</div>
                  <div className="flex-1 space-y-1.5">
                    <p className="text-sm font-semibold text-foreground">{s.t}</p>
                    <p className="text-xs text-muted-foreground">{s.d}</p>
                    {s.c && <CopyBlock text={s.c} />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield size={18} /> API Keys (Pre-configured)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <Zap size={14} className="text-emerald-600 mt-0.5" />
                <p className="text-xs text-emerald-700 dark:text-emerald-300">Sab keys already code mein hain — kuch karne ki zaroorat nahi!</p>
              </div>
              <CopyBlock label="Backend URL" text="https://faevzfibzcbuqjoatmjm.supabase.co" />
              <CopyBlock label="Anon Key (Publishable)" text="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellerDesktopAppPage;
