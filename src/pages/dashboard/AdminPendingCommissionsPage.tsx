import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Check, Clock, Loader2, RefreshCw, Percent, DollarSign, Wallet, Package,
} from "lucide-react";
import { usePendingCommissions } from "@/hooks/usePendingCommissions";

const formatPKR = (amount: number) => `Rs. ${amount.toLocaleString()}`;

const AdminPendingCommissionsPage = () => {
  const {
    pendingSettlements, settledSettlements, isLoading, refetch,
    settleCommission, bulkSettle,
  } = usePendingCommissions();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [settleDialogId, setSettleDialogId] = useState<string | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);

  const filterItems = (items: typeof pendingSettlements) =>
    items.filter(s =>
      (s.product_title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.tracking_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.courier_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredPending = filterItems(pendingSettlements);
  const filteredSettled = filterItems(settledSettlements);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedPendingIds = selectedIds.filter((id) => filteredPending.some((s) => s.id === id));

  const selectAll = () => {
    if (selectedPendingIds.length === filteredPending.length && filteredPending.length > 0) {
      setSelectedIds((prev) => prev.filter((id) => !filteredPending.some((s) => s.id === id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...filteredPending.map((s) => s.id)])]);
    }
  };

  const totalPendingCommission = pendingSettlements.reduce((sum, s) => sum + s.commission_amount, 0);
  const totalPendingPayout = pendingSettlements.reduce((sum, s) => sum + s.seller_payout, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pending Commissions</h1>
          <p className="text-muted-foreground">
            Settle commissions for delivered orders & pay sellers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Clock size={14} /> {pendingSettlements.length} Pending
          </Badge>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw size={16} className="mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        Real-time updates enabled
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Settlements</p>
                <p className="text-2xl font-bold">{pendingSettlements.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Percent className="text-primary" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Commission</p>
                <p className="text-2xl font-bold">{formatPKR(totalPendingCommission)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <Wallet className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Seller Payouts</p>
                <p className="text-2xl font-bold">{formatPKR(totalPendingPayout)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search by product, tracking ID, or courier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({filteredPending.length})</TabsTrigger>
          <TabsTrigger value="settled">Settled ({filteredSettled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {/* Bulk Actions */}
          {selectedPendingIds.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg mb-4">
              <span className="text-sm font-medium">{selectedPendingIds.length} selected</span>
              <Button size="sm" onClick={() => setBulkDialogOpen(true)}>

                <Check size={14} className="mr-1" /> Settle All Selected
              </Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedIds([])}>Clear</Button>
            </div>
          )}

          <SettlementTable
            items={filteredPending}
            isPending
            selectedIds={selectedPendingIds}
            onToggleSelect={toggleSelect}
            onSelectAll={selectAll}
            onSettle={(id) => setSettleDialogId(id)}
          />
        </TabsContent>

        <TabsContent value="settled">
          <SettlementTable items={filteredSettled} isPending={false} />
        </TabsContent>
      </Tabs>

      {/* Single Settle Dialog */}
      <AlertDialog open={!!settleDialogId} onOpenChange={() => setSettleDialogId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Settle Commission?</AlertDialogTitle>
            <AlertDialogDescription>
              Commission will be deducted and remaining amount will be added to seller's wallet in real-time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {settleDialogId && (() => {
            const s = pendingSettlements.find(x => x.id === settleDialogId);
            if (!s) return null;
            return (
              <div className="space-y-2 p-3 bg-muted rounded-lg text-sm">
                <p><strong>Product:</strong> {s.product_title}</p>
                <p><strong>Order Amount:</strong> {formatPKR(s.order_amount)}</p>
                <p><strong>Commission ({s.commission_type === 'percentage' ? s.commission_value + '%' : 'Fixed'}):</strong> {formatPKR(s.commission_amount)}</p>
                <p className="text-green-600 font-semibold"><strong>Seller Will Receive:</strong> {formatPKR(s.seller_payout)}</p>
              </div>
            );
          })()}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (settleDialogId) settleCommission.mutate(settleDialogId); }}
              disabled={settleCommission.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {settleCommission.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Settle & Pay Seller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Settle Dialog */}
      <AlertDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Settle {selectedPendingIds.length} Commissions?</AlertDialogTitle>
            <AlertDialogDescription>
              All selected orders will be settled. Commission will be deducted and sellers will receive their payouts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { bulkSettle.mutate(selectedPendingIds); setBulkDialogOpen(false); setSelectedIds([]); }}
              disabled={bulkSettle.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkSettle.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Settle All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Sub-component for settlement table
interface SettlementTableProps {
  items: any[];
  isPending: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  onSettle?: (id: string) => void;
}

const SettlementTable = ({ items, isPending, selectedIds = [], onToggleSelect, onSelectAll, onSettle }: SettlementTableProps) => {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {isPending ? 'No Pending Commissions' : 'No Settled Commissions'}
          </h3>
          <p className="text-muted-foreground">
            {isPending ? 'All commissions have been settled.' : 'Settled commissions will appear here.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {isPending && onSelectAll && (
                  <TableHead className="w-10">
                    <Checkbox
                      checked={selectedIds.length > 0 && selectedIds.length === items.length}
                      onCheckedChange={onSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Order Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Seller Payout</TableHead>
                <TableHead>Date</TableHead>
                {isPending && <TableHead className="text-right">Action</TableHead>}
                {!isPending && <TableHead>Settled</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  {isPending && onToggleSelect && (
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(s.id)}
                        onCheckedChange={() => onToggleSelect(s.id)}
                      />
                    </TableCell>
                  )}
                  <TableCell>
                    <div>
                      <p className="font-medium line-clamp-1">{s.product_title || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{s.courier_name || 'No courier'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {s.tracking_id ? (
                      <Badge variant="outline" className="font-mono text-xs">{s.tracking_id}</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">No tracking</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{formatPKR(s.order_amount)}</TableCell>
                  <TableCell>
                    <div>
                      <span className="text-destructive font-medium">-{formatPKR(s.commission_amount)}</span>
                      <p className="text-xs text-muted-foreground">
                        {s.commission_type === 'percentage' ? `${s.commission_value}%` : `Fixed`}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-green-600 font-semibold">{formatPKR(s.seller_payout)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(s.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                  </TableCell>
                  {isPending && onSettle && (
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onSettle(s.id)}
                      >
                        <Check size={14} className="mr-1" /> Settle
                      </Button>
                    </TableCell>
                  )}
                  {!isPending && (
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        Settled
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {s.settled_at ? new Date(s.settled_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' }) : ''}
                      </p>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPendingCommissionsPage;
