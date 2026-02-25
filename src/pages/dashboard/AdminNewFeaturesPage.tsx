import { useState } from "react";
import { useAdminCampaigns } from "@/hooks/useCampaigns";
import { useAdminCouriers } from "@/hooks/useCouriers";
import { useAdminDailyCoupons } from "@/hooks/useDailyCoupons";
import { useAdminSpinWheel } from "@/hooks/useSpinWheel";
import { useAdminSizeGuides } from "@/hooks/useSizeGuides";
import { useOfficialBadges } from "@/hooks/useOfficialBadges";
import { useAdminSponsored } from "@/hooks/useSponsoredProducts";
import { useAdminInstallments } from "@/hooks/useInstallments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Truck, Ticket, Gamepad2, Ruler, Award, CreditCard, Megaphone as Ad, Plus, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const AdminNewFeaturesPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">New Features Management</h1>
      
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto">
          <TabsTrigger value="campaigns" className="text-xs"><Megaphone size={14} className="mr-1" />Campaigns</TabsTrigger>
          <TabsTrigger value="coupons" className="text-xs"><Ticket size={14} className="mr-1" />Coupons</TabsTrigger>
          <TabsTrigger value="spinwheel" className="text-xs"><Gamepad2 size={14} className="mr-1" />Spin Wheel</TabsTrigger>
          <TabsTrigger value="couriers" className="text-xs"><Truck size={14} className="mr-1" />Couriers</TabsTrigger>
          <TabsTrigger value="badges" className="text-xs"><Award size={14} className="mr-1" />Badges</TabsTrigger>
          <TabsTrigger value="sizes" className="text-xs"><Ruler size={14} className="mr-1" />Sizes</TabsTrigger>
          <TabsTrigger value="ads" className="text-xs"><Ad size={14} className="mr-1" />Ads</TabsTrigger>
          <TabsTrigger value="installments" className="text-xs"><CreditCard size={14} className="mr-1" />EMI</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns"><CampaignsTab /></TabsContent>
        <TabsContent value="coupons"><DailyCouponsTab /></TabsContent>
        <TabsContent value="spinwheel"><SpinWheelTab /></TabsContent>
        <TabsContent value="couriers"><CouriersTab /></TabsContent>
        <TabsContent value="badges"><BadgesTab /></TabsContent>
        <TabsContent value="sizes"><SizeGuidesTab /></TabsContent>
        <TabsContent value="ads"><SponsoredTab /></TabsContent>
        <TabsContent value="installments"><InstallmentsTab /></TabsContent>
      </Tabs>
    </div>
  );
};

// --- CAMPAIGNS TAB ---
const CampaignsTab = () => {
  const { campaigns, isLoading, createCampaign, deleteCampaign } = useAdminCampaigns();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", campaign_type: "sale", discount_label: "", starts_at: "", ends_at: "", is_active: true, is_featured: false });

  const handleCreate = () => {
    if (!form.title || !form.slug || !form.starts_at || !form.ends_at) return toast.error("Fill all required fields");
    createCampaign.mutate(form);
    setShowForm(false);
    setForm({ title: "", slug: "", campaign_type: "sale", discount_label: "", starts_at: "", ends_at: "", is_active: true, is_featured: false });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sale Campaigns</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" />New Campaign</Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-secondary rounded-lg">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="e.g. 12-12-sale" /></div>
            <div><Label>Type</Label>
              <Select value={form.campaign_type} onValueChange={v => setForm(f => ({ ...f, campaign_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="mega_sale">Mega Sale</SelectItem>
                  <SelectItem value="seasonal">Seasonal</SelectItem>
                  <SelectItem value="brand">Brand</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Discount Label</Label><Input value={form.discount_label} onChange={e => setForm(f => ({ ...f, discount_label: e.target.value }))} placeholder="Up to 70% Off" /></div>
            <div><Label>Start *</Label><Input type="datetime-local" value={form.starts_at} onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} /></div>
            <div><Label>End *</Label><Input type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} /></div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Active</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_featured} onCheckedChange={v => setForm(f => ({ ...f, is_featured: v }))} /><Label>Featured</Label></div>
            </div>
            <div className="flex items-end"><Button onClick={handleCreate}>Create Campaign</Button></div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.title}</TableCell>
                <TableCell><Badge variant="outline">{c.campaign_type}</Badge></TableCell>
                <TableCell className="text-xs">{c.starts_at ? format(new Date(c.starts_at), "PP") : "-"} → {c.ends_at ? format(new Date(c.ends_at), "PP") : "-"}</TableCell>
                <TableCell><Badge variant={c.is_active ? "default" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteCampaign.mutate(c.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- DAILY COUPONS TAB ---
const DailyCouponsTab = () => {
  const { coupons, isLoading, createCoupon, deleteCoupon } = useAdminDailyCoupons();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", discount_type: "percentage", discount_value: 10, min_spend_pkr: 0, valid_for_hours: 24, max_collections: 100, available_date: new Date().toISOString().split("T")[0] });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Daily Coupons</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" />New Coupon</Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-secondary rounded-lg">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Code</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} /></div>
            <div><Label>Discount Type</Label>
              <Select value={form.discount_type} onValueChange={v => setForm(f => ({ ...f, discount_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed PKR</SelectItem></SelectContent>
              </Select>
            </div>
            <div><Label>Discount Value</Label><Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: +e.target.value }))} /></div>
            <div><Label>Min Spend (PKR)</Label><Input type="number" value={form.min_spend_pkr} onChange={e => setForm(f => ({ ...f, min_spend_pkr: +e.target.value }))} /></div>
            <div><Label>Max Collections</Label><Input type="number" value={form.max_collections} onChange={e => setForm(f => ({ ...f, max_collections: +e.target.value }))} /></div>
            <div><Label>Available Date</Label><Input type="date" value={form.available_date} onChange={e => setForm(f => ({ ...f, available_date: e.target.value }))} /></div>
            <div className="flex items-end"><Button onClick={() => { createCoupon(form); setShowForm(false); }}>Create Coupon</Button></div>
          </div>
        )}

        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Code</TableHead><TableHead>Discount</TableHead><TableHead>Collected</TableHead><TableHead>Date</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {coupons.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.title}</TableCell>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.discount_type === "percentage" ? `${c.discount_value}%` : `Rs.${c.discount_value}`}</TableCell>
                <TableCell>{c.current_collections}/{c.max_collections}</TableCell>
                <TableCell className="text-xs">{c.available_date}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteCoupon(c.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- SPIN WHEEL TAB ---
const SpinWheelTab = () => {
  const { segments, isLoading, updateSegment, addSegment, deleteSegment } = useAdminSpinWheel();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Spin Wheel Segments</CardTitle>
        <Button size="sm" onClick={() => addSegment.mutate({ label: "New Prize", reward_type: "coins", reward_value: 5, probability: 10, color: "#F85606" })}>
          <Plus size={16} className="mr-1" />Add Segment
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Label</TableHead><TableHead>Type</TableHead><TableHead>Value</TableHead><TableHead>Probability %</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {segments.map((s: any) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline">{s.reward_type}</Badge></TableCell>
                <TableCell>{s.reward_value}</TableCell>
                <TableCell>{s.probability}%</TableCell>
                <TableCell><Switch checked={s.is_active} onCheckedChange={v => updateSegment.mutate({ id: s.id, is_active: v })} /></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteSegment.mutate(s.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- COURIERS TAB ---
const CouriersTab = () => {
  const { couriers, isLoading, createCourier, updateCourier, deleteCourier } = useAdminCouriers();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", tracking_url_template: "", estimated_days: "3-5 days", supports_cod: true });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Courier Partners</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" />Add Courier</Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-secondary rounded-lg">
            <div><Label>Name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Code</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toLowerCase() }))} /></div>
            <div className="col-span-2"><Label>Tracking URL Template</Label><Input value={form.tracking_url_template} onChange={e => setForm(f => ({ ...f, tracking_url_template: e.target.value }))} placeholder="https://track.example.com/{tracking_id}" /></div>
            <div><Label>Est. Delivery</Label><Input value={form.estimated_days} onChange={e => setForm(f => ({ ...f, estimated_days: e.target.value }))} /></div>
            <div className="flex items-end gap-2"><Switch checked={form.supports_cod} onCheckedChange={v => setForm(f => ({ ...f, supports_cod: v }))} /><Label>Supports COD</Label></div>
            <div className="flex items-end"><Button onClick={() => { createCourier.mutate(form); setShowForm(false); }}>Add Courier</Button></div>
          </div>
        )}

        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Code</TableHead><TableHead>Delivery</TableHead><TableHead>COD</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {couriers.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="font-mono">{c.code}</TableCell>
                <TableCell>{c.estimated_days}</TableCell>
                <TableCell>{c.supports_cod ? "✅" : "❌"}</TableCell>
                <TableCell><Switch checked={c.is_active} onCheckedChange={v => updateCourier.mutate({ id: c.id, is_active: v })} /></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteCourier.mutate(c.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- BADGES TAB ---
const BadgesTab = () => {
  const { sellers, isLoading, updateBadge } = useOfficialBadges();
  const verifiedSellers = sellers.filter((s: any) => s.verification_status === "verified");

  return (
    <Card>
      <CardHeader><CardTitle>Official Store Badges</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Store</TableHead><TableHead>Status</TableHead><TableHead>Badge</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {verifiedSellers.map((s: any) => (
              <TableRow key={s.user_id}>
                <TableCell className="font-medium">{s.store_name || s.profiles?.full_name}</TableCell>
                <TableCell>{s.is_official_store ? <Badge className="bg-yellow-500">Official</Badge> : <Badge variant="secondary">Standard</Badge>}</TableCell>
                <TableCell>
                  <Select value={s.official_store_badge || "none"} onValueChange={v => updateBadge.mutate({ userId: s.user_id, badge: v === "none" ? null : v, isOfficial: v !== "none" })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="mall">🏬 Mall</SelectItem>
                      <SelectItem value="preferred">⭐ Preferred</SelectItem>
                      <SelectItem value="top_rated">🏆 Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Switch checked={s.is_official_store} onCheckedChange={v => updateBadge.mutate({ userId: s.user_id, badge: v ? "preferred" : null, isOfficial: v })} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- SIZE GUIDES TAB ---
const SizeGuidesTab = () => {
  const { guides, isLoading, deleteGuide } = useAdminSizeGuides();

  return (
    <Card>
      <CardHeader><CardTitle>Size Guides</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Category</TableHead><TableHead>Name</TableHead><TableHead>Unit</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {guides.map((g: any) => (
              <TableRow key={g.id}>
                <TableCell className="capitalize">{g.category}</TableCell>
                <TableCell>{g.name}</TableCell>
                <TableCell>{g.measurement_unit}</TableCell>
                <TableCell>{g.is_active ? "✅" : "❌"}</TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteGuide.mutate(g.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- SPONSORED TAB ---
const SponsoredTab = () => {
  const { ads, isLoading, updateAd } = useAdminSponsored();

  return (
    <Card>
      <CardHeader><CardTitle>Sponsored Products / Ads</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Clicks</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
          <TableBody>
            {ads.map((ad: any) => (
              <TableRow key={ad.id}>
                <TableCell>{ad.products?.title?.slice(0, 30)}</TableCell>
                <TableCell>Rs. {ad.budget_pkr}</TableCell>
                <TableCell>Rs. {ad.spent_pkr}</TableCell>
                <TableCell>{ad.clicks}</TableCell>
                <TableCell><Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge></TableCell>
                <TableCell>
                  <Select value={ad.status} onValueChange={v => updateAd.mutate({ id: ad.id, status: v })}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No ads yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// --- INSTALLMENTS TAB ---
const InstallmentsTab = () => {
  const { orders, plans, isLoading, updatePlan } = useAdminInstallments();

  return (
    <Card>
      <CardHeader><CardTitle>Installment Plans & Orders</CardTitle></CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Active Plans</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Plan</TableHead><TableHead>Months</TableHead><TableHead>Interest</TableHead><TableHead>Min Order</TableHead><TableHead>Active</TableHead></TableRow></TableHeader>
            <TableBody>
              {plans.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.months}</TableCell>
                  <TableCell>{p.interest_rate}%</TableCell>
                  <TableCell>Rs. {p.min_order_amount_pkr}</TableCell>
                  <TableCell><Switch checked={p.is_active} onCheckedChange={v => updatePlan.mutate({ id: p.id, is_active: v })} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Active Installment Orders ({orders.length})</h3>
          <Table>
            <TableHeader><TableRow><TableHead>Plan</TableHead><TableHead>Total</TableHead><TableHead>Monthly</TableHead><TableHead>Paid</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {orders.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell>{o.installment_plans?.name}</TableCell>
                  <TableCell>Rs. {o.total_amount_pkr}</TableCell>
                  <TableCell>Rs. {o.monthly_amount_pkr}</TableCell>
                  <TableCell>{o.paid_installments}/{o.total_installments}</TableCell>
                  <TableCell><Badge variant={o.status === "active" ? "default" : o.status === "overdue" ? "destructive" : "secondary"}>{o.status}</Badge></TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No installment orders</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminNewFeaturesPage;
