import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Package, Truck, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TrackResult {
  id: string;
  order_number: string | null;
  customer_name: string;
  order_status: string;
  tracking_id: string | null;
  courier_name: string | null;
  shipped_at: string | null;
  total_amount_pkr: number;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const AdminTrackingSearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrackResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, order_status, tracking_id, courier_name, shipped_at, total_amount_pkr, created_at")
        .or(`tracking_id.ilike.%${query}%,order_number.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setResults((data || []) as TrackResult[]);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Track Orders</h1>
        <p className="text-muted-foreground">Search orders by tracking ID or order number</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Enter tracking ID or order number (e.g. FZN-ORD-00001)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isSearching && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      )}

      {hasSearched && !isSearching && results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-muted-foreground">Try a different tracking ID or order number.</p>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck size={20} /> Search Results ({results.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tracking ID</TableHead>
                    <TableHead>Courier</TableHead>
                    <TableHead>Shipped</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.order_number || order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.order_status] || "bg-muted"}>
                          {order.order_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.tracking_id ? (
                          <Badge variant="outline" className="font-mono">{order.tracking_id}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>{order.courier_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.shipped_at ? new Date(order.shipped_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : '—'}
                      </TableCell>
                      <TableCell className="font-medium">Rs. {order.total_amount_pkr.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminTrackingSearchPage;
