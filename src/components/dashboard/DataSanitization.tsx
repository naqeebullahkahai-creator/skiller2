import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DataSanitization = () => {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [deletedCounts, setDeletedCounts] = useState<Record<string, number>>({});
  
  const [options, setOptions] = useState({
    testOrders: true,
    testProducts: true,
    testMessages: true,
    testNotifications: true,
  });

  const handleSanitize = async () => {
    setIsLoading(true);
    setConfirmOpen(false);
    const counts: Record<string, number> = {};

    try {
      // Delete test orders (orders with 'test' or 'sample' in customer name)
      if (options.testOrders) {
        const { data: orders } = await supabase
          .from("orders")
          .select("id")
          .or("customer_name.ilike.%test%,customer_name.ilike.%sample%,customer_name.ilike.%demo%");
        
        if (orders && orders.length > 0) {
          const orderIds = orders.map(o => o.id);
          
          // Delete related order items first
          await supabase.from("order_items").delete().in("order_id", orderIds);
          
          // Delete orders
          const { error } = await supabase.from("orders").delete().in("id", orderIds);
          if (!error) counts.orders = orders.length;
        }
      }

      // Delete test products (products with 'test', 'sample', or 'demo' in title)
      if (options.testProducts) {
        const { data: products } = await supabase
          .from("products")
          .select("id")
          .or("title.ilike.%test%,title.ilike.%sample%,title.ilike.%demo%");
        
        if (products && products.length > 0) {
          const productIds = products.map(p => p.id);
          
          // Delete related product variants first
          await supabase.from("product_variants").delete().in("product_id", productIds);
          
          // Delete products
          const { error } = await supabase.from("products").delete().in("id", productIds);
          if (!error) counts.products = products.length;
        }
      }

      // Delete test messages (keep last 7 days of real messages)
      if (options.testMessages) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { data: messages } = await supabase
          .from("messages")
          .select("id")
          .or("content.ilike.%test%,content.ilike.%demo%")
          .lt("created_at", sevenDaysAgo.toISOString());
        
        if (messages && messages.length > 0) {
          const { error } = await supabase
            .from("messages")
            .delete()
            .in("id", messages.map(m => m.id));
          if (!error) counts.messages = messages.length;
        }
      }

      // Delete test notifications (promotional/test notifications)
      if (options.testNotifications) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: notifications } = await supabase
          .from("notifications")
          .select("id")
          .eq("is_read", true)
          .lt("created_at", thirtyDaysAgo.toISOString());
        
        if (notifications && notifications.length > 0) {
          const { error } = await supabase
            .from("notifications")
            .delete()
            .in("id", notifications.map(n => n.id));
          if (!error) counts.notifications = notifications.length;
        }
      }

      setDeletedCounts(counts);
      setCompleted(true);
      toast.success("Test data cleaned successfully!");
    } catch (error) {
      console.error("Sanitization error:", error);
      toast.error("Failed to clean test data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setCompleted(false);
    setDeletedCounts({});
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetState(); }}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm" className="gap-2">
            <Trash2 size={16} />
            Clean Test Data
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Database Sanitization
            </DialogTitle>
            <DialogDescription>
              Remove test/demo data before going live. This will NOT delete verified seller or admin accounts.
            </DialogDescription>
          </DialogHeader>

          {!completed ? (
            <>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="testOrders"
                    checked={options.testOrders}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, testOrders: !!checked }))
                    }
                  />
                  <Label htmlFor="testOrders" className="text-sm">
                    Delete test orders (customer name contains 'test', 'sample', or 'demo')
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="testProducts"
                    checked={options.testProducts}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, testProducts: !!checked }))
                    }
                  />
                  <Label htmlFor="testProducts" className="text-sm">
                    Delete test products (title contains 'test', 'sample', or 'demo')
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="testMessages"
                    checked={options.testMessages}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, testMessages: !!checked }))
                    }
                  />
                  <Label htmlFor="testMessages" className="text-sm">
                    Delete old test messages (older than 7 days)
                  </Label>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="testNotifications"
                    checked={options.testNotifications}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, testNotifications: !!checked }))
                    }
                  />
                  <Label htmlFor="testNotifications" className="text-sm">
                    Delete old read notifications (older than 30 days)
                  </Label>
                </div>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-xs text-destructive font-medium">
                  ⚠️ This action cannot be undone. Make sure you have backups if needed.
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmOpen(true)}
                  disabled={isLoading || !Object.values(options).some(Boolean)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Cleaning...
                    </>
                  ) : (
                    "Clean Selected Data"
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-lg">Cleanup Complete!</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                {deletedCounts.orders && <p>Deleted {deletedCounts.orders} test orders</p>}
                {deletedCounts.products && <p>Deleted {deletedCounts.products} test products</p>}
                {deletedCounts.messages && <p>Deleted {deletedCounts.messages} old messages</p>}
                {deletedCounts.notifications && <p>Deleted {deletedCounts.notifications} old notifications</p>}
                {Object.keys(deletedCounts).length === 0 && (
                  <p>No test data found to delete</p>
                )}
              </div>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected test data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSanitize}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Clean Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DataSanitization;
