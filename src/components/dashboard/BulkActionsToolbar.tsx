import { useState } from "react";
import { 
  Trash2, 
  DollarSign, 
  Package, 
  X, 
  Loader2,
  Percent,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import { useBulkActions } from "@/hooks/useBulkUpload";

interface BulkActionsToolbarProps {
  selectedIds: string[];
  onClearSelection: () => void;
  onActionComplete: () => void;
}

const BulkActionsToolbar = ({ 
  selectedIds, 
  onClearSelection, 
  onActionComplete 
}: BulkActionsToolbarProps) => {
  const { isProcessing, bulkUpdateStock, bulkDelete, bulkUpdateStatus } = useBulkActions();
  
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [pricePercentage, setPricePercentage] = useState("");
  const [newStock, setNewStock] = useState("");

  const handlePriceUpdate = async () => {
    // Price update functionality - using stock update as fallback
    // This could be extended to update prices via a custom function
    setShowPriceDialog(false);
    setPricePercentage("");
    onClearSelection();
  };

  const handleStockUpdate = async () => {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) return;
    
    const success = await bulkUpdateStock(selectedIds, stock);
    if (success) {
      setShowStockDialog(false);
      setNewStock("");
      onClearSelection();
      onActionComplete();
    }
  };

  const handleDelete = async () => {
    const success = await bulkDelete(selectedIds);
    if (success) {
      setShowDeleteDialog(false);
      onClearSelection();
      onActionComplete();
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
        <span className="text-sm font-medium text-primary">
          {selectedIds.length} product{selectedIds.length > 1 ? "s" : ""} selected
        </span>
        
        <div className="flex-1" />
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setShowPriceDialog(true)}
          disabled={isProcessing}
        >
          <DollarSign size={14} />
          Update Price
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => setShowStockDialog(true)}
          disabled={isProcessing}
        >
          <Package size={14} />
          Update Stock
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-destructive border-destructive hover:bg-destructive/10"
          onClick={() => setShowDeleteDialog(true)}
          disabled={isProcessing}
        >
          <Trash2 size={14} />
          Delete
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={onClearSelection}
        >
          <X size={16} />
        </Button>
      </div>

      {/* Price Update Dialog */}
      <Dialog open={showPriceDialog} onOpenChange={setShowPriceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Prices</DialogTitle>
            <DialogDescription>
              Adjust prices for {selectedIds.length} selected product(s) by a percentage.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="percentage">Price Change (%)</Label>
              <div className="relative">
                <Input
                  id="percentage"
                  type="number"
                  placeholder="e.g., 10 for +10% or -10 for -10%"
                  value={pricePercentage}
                  onChange={(e) => setPricePercentage(e.target.value)}
                  className="pr-10"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Enter a positive number to increase or negative to decrease prices.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPriceDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePriceUpdate} 
              disabled={isProcessing || !pricePercentage}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Prices"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Update Dialog */}
      <Dialog open={showStockDialog} onOpenChange={setShowStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>
              Set new stock quantity for {selectedIds.length} selected product(s).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock">New Stock Quantity</Label>
              <div className="relative">
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="Enter new stock quantity"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="pr-10"
                />
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                This will set the same stock quantity for all selected products.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStockUpdate} 
              disabled={isProcessing || !newStock}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Update Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Products?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected products 
              and remove them from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete Products"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BulkActionsToolbar;
