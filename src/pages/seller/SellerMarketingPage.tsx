import { useState } from "react";
import { useSellerBundles } from "@/hooks/useBundleDeals";
import { useSellerSponsored } from "@/hooks/useSponsoredProducts";
import { useSellerGroupBuy } from "@/hooks/useGroupBuy";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Megaphone, Users, Plus, Trash2 } from "lucide-react";
import { formatPKR } from "@/hooks/useProducts";
import { toast } from "sonner";

const SellerMarketingPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketing & Promotions</h1>
      <Tabs defaultValue="bundles">
        <TabsList>
          <TabsTrigger value="bundles"><Package size={14} className="mr-1" />Bundle Deals</TabsTrigger>
          <TabsTrigger value="ads"><Megaphone size={14} className="mr-1" />Sponsored Ads</TabsTrigger>
          <TabsTrigger value="groupbuy"><Users size={14} className="mr-1" />Group Buy</TabsTrigger>
        </TabsList>

        <TabsContent value="bundles"><BundlesTab /></TabsContent>
        <TabsContent value="ads"><AdsTab /></TabsContent>
        <TabsContent value="groupbuy"><GroupBuyTab /></TabsContent>
      </Tabs>
    </div>
  );
};

const BundlesTab = () => {
  const { bundles, isLoading, createBundle, deleteBundle } = useSellerBundles();
  const { user } = useAuth();
  const { products = [] } = useProducts(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", bundle_type: "combo", discount_type: "percentage", discount_value: 10 });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleCreate = () => {
    if (!form.title || selectedProducts.length < 2) return toast.error("Title and at least 2 products required");
    createBundle.mutate({ bundle: form, productIds: selectedProducts });
    setShowForm(false);
    setForm({ title: "", bundle_type: "combo", discount_type: "percentage", discount_value: 10 });
    setSelectedProducts([]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Bundle Deals</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" />Create Bundle</Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="space-y-3 mb-6 p-4 bg-secondary rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bundle Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
              <div><Label>Discount</Label><Input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: +e.target.value }))} /></div>
            </div>
            <div><Label>Select Products (min 2)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-auto">
                {products.map((p: any) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm p-2 bg-card rounded">
                    <input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={e => {
                      setSelectedProducts(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id));
                    }} />
                    {p.title.slice(0, 30)}
                  </label>
                ))}
              </div>
            </div>
            <Button onClick={handleCreate}>Create Bundle</Button>
          </div>
        )}

        <Table>
          <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Products</TableHead><TableHead>Discount</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {bundles.map((b: any) => (
              <TableRow key={b.id}>
                <TableCell>{b.title}</TableCell>
                <TableCell>{b.bundle_items?.length || 0} items</TableCell>
                <TableCell>{b.discount_type === "percentage" ? `${b.discount_value}%` : formatPKR(b.discount_value)}</TableCell>
                <TableCell><Badge variant={b.is_active ? "default" : "secondary"}>{b.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteBundle.mutate(b.id)}><Trash2 size={14} /></Button></TableCell>
              </TableRow>
            ))}
            {bundles.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No bundles yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const AdsTab = () => {
  const { ads, isLoading, createAd } = useSellerSponsored();
  const { user } = useAuth();
  const { products = [] } = useProducts(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id: "", budget_pkr: 200, placement: "search" });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Sponsored Ads</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" />Create Ad</Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-secondary rounded-lg">
            <div><Label>Product</Label>
              <Select value={form.product_id} onValueChange={v => setForm(f => ({ ...f, product_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.title.slice(0, 40)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Budget (PKR)</Label><Input type="number" value={form.budget_pkr} onChange={e => setForm(f => ({ ...f, budget_pkr: +e.target.value }))} /></div>
            <div><Label>Placement</Label>
              <Select value={form.placement} onValueChange={v => setForm(f => ({ ...f, placement: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="search">Search Results</SelectItem>
                  <SelectItem value="home">Homepage</SelectItem>
                  <SelectItem value="category">Category Page</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end"><Button onClick={() => { createAd.mutate(form); setShowForm(false); }}>Create Ad</Button></div>
          </div>
        )}

        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Budget</TableHead><TableHead>Spent</TableHead><TableHead>Clicks</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {ads.map((ad: any) => (
              <TableRow key={ad.id}>
                <TableCell>{ad.products?.title?.slice(0, 30)}</TableCell>
                <TableCell>Rs. {ad.budget_pkr}</TableCell>
                <TableCell>Rs. {ad.spent_pkr}</TableCell>
                <TableCell>{ad.clicks}</TableCell>
                <TableCell><Badge variant={ad.status === "active" ? "default" : "secondary"}>{ad.status}</Badge></TableCell>
              </TableRow>
            ))}
            {ads.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No ads yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const GroupBuyTab = () => {
  const { deals, isLoading, createDeal } = useSellerGroupBuy();
  const { user } = useAuth();
  const { products = [] } = useProducts(user?.id);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ product_id: "", original_price_pkr: 0, group_price_pkr: 0, min_participants: 3, ends_at: "" });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Group Buy Deals</CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-1" />Create Deal</Button>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 bg-secondary rounded-lg">
            <div><Label>Product</Label>
              <Select value={form.product_id} onValueChange={v => {
                const p = products.find((p: any) => p.id === v);
                setForm(f => ({ ...f, product_id: v, original_price_pkr: p?.price_pkr || 0 }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.title.slice(0, 40)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Group Price (PKR)</Label><Input type="number" value={form.group_price_pkr} onChange={e => setForm(f => ({ ...f, group_price_pkr: +e.target.value }))} /></div>
            <div><Label>Min Participants</Label><Input type="number" value={form.min_participants} onChange={e => setForm(f => ({ ...f, min_participants: +e.target.value }))} /></div>
            <div><Label>Ends At</Label><Input type="datetime-local" value={form.ends_at} onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))} /></div>
            <div className="flex items-end"><Button onClick={() => { createDeal.mutate(form); setShowForm(false); }}>Create Deal</Button></div>
          </div>
        )}

        <Table>
          <TableHeader><TableRow><TableHead>Product</TableHead><TableHead>Price</TableHead><TableHead>Group Price</TableHead><TableHead>Participants</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {deals.map((d: any) => (
              <TableRow key={d.id}>
                <TableCell>{d.products?.title?.slice(0, 30)}</TableCell>
                <TableCell>Rs. {d.original_price_pkr}</TableCell>
                <TableCell className="text-primary font-bold">Rs. {d.group_price_pkr}</TableCell>
                <TableCell>{d.current_participants}/{d.min_participants}</TableCell>
                <TableCell><Badge variant={d.status === "active" ? "default" : "secondary"}>{d.status}</Badge></TableCell>
              </TableRow>
            ))}
            {deals.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No group buy deals yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SellerMarketingPage;
