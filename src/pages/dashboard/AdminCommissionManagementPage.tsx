import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Gift, Search, Percent, Users, Edit2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addMonths } from "date-fns";
import { useAdminFinance } from "@/hooks/useAdminFinance";
import AdminCommissionSettings from "@/components/dashboard/AdminCommissionSettings";
import SellerCommissionManager from "@/components/admin/SellerCommissionManager";

interface SellerWithCommission {
  user_id: string;
  shop_name: string;
  legal_name: string;
  verification_status: string;
  verified_at: string | null;
  created_at: string;
  commission?: {
    custom_commission_percentage: number | null;
    grace_period_months: number | null;
    grace_start_date: string | null;
    grace_commission_percentage: number | null;
    notes: string | null;
  };
}

const AdminCommissionManagementPage = () => {
  const { commissionRate } = useAdminFinance();
  const globalRate = commissionRate ?? 10;

  // Grace policy state
  const [graceEnabled, setGraceEnabled] = useState(false);
  const [graceMonths, setGraceMonths] = useState(3);
  const [graceCommission, setGraceCommission] = useState(0);
  const [policyLoading, setPolicyLoading] = useState(true);
  const [policySaving, setPolicySaving] = useState(false);

  // Sellers state
  const [sellers, setSellers] = useState<SellerWithCommission[]>([]);
  const [sellersLoading, setSellersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingSeller, setEditingSeller] = useState<SellerWithCommission | null>(null);

  useEffect(() => {
    fetchGracePolicy();
    fetchSellers();
  }, []);

  const fetchGracePolicy = async () => {
    setPolicyLoading(true);
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .in("setting_key", [
          "new_seller_grace_enabled",
          "new_seller_grace_months",
          "new_seller_grace_commission",
        ]);
      if (error) throw error;

      const settings = Object.fromEntries((data || []).map((s) => [s.setting_key, s.setting_value]));
      setGraceEnabled(settings.new_seller_grace_enabled === "true");
      setGraceMonths(parseInt(settings.new_seller_grace_months) || 3);
      setGraceCommission(parseFloat(settings.new_seller_grace_commission) || 0);
    } catch (err) {
      console.error("Error fetching grace policy:", err);
    } finally {
      setPolicyLoading(false);
    }
  };

  const saveGracePolicy = async () => {
    setPolicySaving(true);
    try {
      const updates = [
        { setting_key: "new_seller_grace_enabled", setting_value: graceEnabled.toString() },
        { setting_key: "new_seller_grace_months", setting_value: graceMonths.toString() },
        { setting_key: "new_seller_grace_commission", setting_value: graceCommission.toString() },
      ];

      for (const u of updates) {
        const { error } = await supabase
          .from("admin_settings")
          .update({ setting_value: u.setting_value, updated_at: new Date().toISOString() })
          .eq("setting_key", u.setting_key);
        if (error) throw error;
      }
      toast.success("New seller policy saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save policy");
    } finally {
      setPolicySaving(false);
    }
  };

  const fetchSellers = async () => {
    setSellersLoading(true);
    try {
      const { data: sellerProfiles, error: spError } = await supabase
        .from("seller_profiles")
        .select("user_id, shop_name, legal_name, verification_status, verified_at, created_at")
        .eq("verification_status", "verified")
        .order("created_at", { ascending: false });
      if (spError) throw spError;

      const { data: commissions, error: scError } = await supabase
        .from("seller_commissions")
        .select("*");
      if (scError) throw scError;

      const commMap = new Map((commissions || []).map((c) => [c.seller_id, c]));

      const merged: SellerWithCommission[] = (sellerProfiles || []).map((sp) => ({
        ...sp,
        commission: commMap.get(sp.user_id) || undefined,
      }));

      setSellers(merged);
    } catch (err) {
      console.error("Error fetching sellers:", err);
    } finally {
      setSellersLoading(false);
    }
  };

  const getGraceStatus = (s: SellerWithCommission) => {
    const c = s.commission;
    if (!c?.grace_start_date || !c.grace_period_months) return "none";
    const end = addMonths(new Date(c.grace_start_date), c.grace_period_months);
    return new Date() < end ? "active" : "expired";
  };

  const getGraceEndDate = (s: SellerWithCommission) => {
    const c = s.commission;
    if (!c?.grace_start_date || !c.grace_period_months) return null;
    return addMonths(new Date(c.grace_start_date), c.grace_period_months);
  };

  const getEffectiveRate = (s: SellerWithCommission) => {
    const status = getGraceStatus(s);
    if (status === "active") return s.commission?.grace_commission_percentage ?? 0;
    return s.commission?.custom_commission_percentage ?? globalRate;
  };

  const getSellerType = (s: SellerWithCommission) => {
    const graceStatus = getGraceStatus(s);
    if (graceStatus === "active") return "new";
    const threeMonthsAgo = addMonths(new Date(), -3);
    if (new Date(s.created_at) > threeMonthsAgo) return "new";
    return "old";
  };

  const filteredSellers = sellers.filter((s) => {
    const matchesSearch =
      !searchQuery ||
      s.shop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.legal_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === "all") return true;
    if (filterType === "new") return getSellerType(s) === "new";
    if (filterType === "old") return getSellerType(s) === "old";
    if (filterType === "grace_active") return getGraceStatus(s) === "active";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Global Commission Rate */}
      <AdminCommissionSettings />

      {/* New Seller Grace Period Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            New Seller Grace Period Policy
          </CardTitle>
          <CardDescription>
            Automatically give new sellers a free/reduced commission period when they get verified
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {policyLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Auto Grace Period</Label>
                  <p className="text-sm text-muted-foreground">
                    When enabled, newly verified sellers automatically get a grace period with reduced/zero commission
                  </p>
                </div>
                <Switch checked={graceEnabled} onCheckedChange={setGraceEnabled} />
              </div>

              {graceEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label>Grace Period Duration (months)</Label>
                    <Input
                      type="number"
                      value={graceMonths}
                      onChange={(e) => setGraceMonths(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
                      min={1}
                      max={12}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Commission % During Grace</Label>
                    <Input
                      type="number"
                      value={graceCommission}
                      onChange={(e) => setGraceCommission(Math.max(0, Math.min(50, parseFloat(e.target.value) || 0)))}
                      min={0}
                      max={50}
                      step={0.5}
                    />
                  </div>
                </div>
              )}

              {graceEnabled && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <p>
                    <strong>Summary:</strong> New sellers will get{" "}
                    <span className="text-primary font-semibold">{graceCommission}%</span> commission for{" "}
                    <span className="text-primary font-semibold">{graceMonths} months</span> after verification,
                    then revert to{" "}
                    {globalRate}% (or their custom rate).
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={saveGracePolicy} disabled={policySaving}>
                  {policySaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Policy
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Sellers Commission Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Sellers Commission Overview
          </CardTitle>
          <CardDescription>View and manage commission rates for all verified sellers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by seller or shop name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sellers</SelectItem>
                <SelectItem value="new">New Sellers</SelectItem>
                <SelectItem value="old">Old Sellers</SelectItem>
                <SelectItem value="grace_active">Grace Active</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sellersLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No sellers found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seller</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Effective Rate</TableHead>
                    <TableHead>Grace Period</TableHead>
                    <TableHead>Rate Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSellers.map((s) => {
                    const graceStatus = getGraceStatus(s);
                    const graceEnd = getGraceEndDate(s);
                    const sellerType = getSellerType(s);
                    const effectiveRate = getEffectiveRate(s);

                    return (
                      <TableRow key={s.user_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{s.shop_name}</p>
                            <p className="text-xs text-muted-foreground">{s.legal_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sellerType === "new" ? "default" : "secondary"}>
                            {sellerType === "new" ? "New" : "Old"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-primary">{effectiveRate}%</span>
                        </TableCell>
                        <TableCell>
                          {graceStatus === "active" ? (
                            <div>
                              <Badge variant="default" className="bg-green-600">Active</Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                Ends {graceEnd ? format(graceEnd, "MMM dd, yyyy") : "—"}
                              </p>
                            </div>
                          ) : graceStatus === "expired" ? (
                            <Badge variant="outline">Expired</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {graceStatus === "active" ? (
                            <Badge variant="outline"><Gift className="w-3 h-3 mr-1" />Grace</Badge>
                          ) : s.commission?.custom_commission_percentage != null ? (
                            <Badge variant="outline"><Shield className="w-3 h-3 mr-1" />Custom</Badge>
                          ) : (
                            <Badge variant="secondary">Global</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => setEditingSeller(s)}>
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingSeller} onOpenChange={(open) => !open && setEditingSeller(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Commission Settings — {editingSeller?.shop_name}</DialogTitle>
          </DialogHeader>
          {editingSeller && (
            <SellerCommissionManager
              sellerId={editingSeller.user_id}
              sellerName={editingSeller.shop_name}
              globalRate={globalRate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCommissionManagementPage;
