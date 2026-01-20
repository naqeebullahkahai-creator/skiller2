import { useState } from "react";
import { format } from "date-fns";
import {
  RotateCcw,
  Loader2,
  Check,
  X,
  MessageSquare,
  Package,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useSellerReturns, RETURN_STATUS_LABELS, RETURN_REASONS } from "@/hooks/useReturns";
import { formatPKR } from "@/hooks/useProducts";
import { cn } from "@/lib/utils";

const SellerReturnsPage = () => {
  const { returns, isLoading, respondToReturn, confirmItemReceived } = useSellerReturns();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRespond = async () => {
    if (!respondingTo || !action) return;
    setProcessingId(respondingTo);
    await respondToReturn(respondingTo, action, response);
    setRespondingTo(null);
    setResponse("");
    setAction(null);
    setProcessingId(null);
  };

  const handleConfirmReceived = async (id: string) => {
    setProcessingId(id);
    await confirmItemReceived(id);
    setProcessingId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "return_requested":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
      case "under_review":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "approved":
        return "bg-green-500/10 text-green-600 border-green-500/30";
      case "rejected":
        return "bg-red-500/10 text-red-600 border-red-500/30";
      case "item_shipped":
        return "bg-purple-500/10 text-purple-600 border-purple-500/30";
      case "item_received":
        return "bg-teal-500/10 text-teal-600 border-teal-500/30";
      case "refund_issued":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const pendingReturns = returns.filter((r) => r.status === "return_requested");
  const activeReturns = returns.filter((r) =>
    ["approved", "item_shipped"].includes(r.status)
  );
  const completedReturns = returns.filter((r) =>
    ["rejected", "item_received", "refund_issued"].includes(r.status)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw size={24} />
          Return Requests
        </h1>
        <Badge variant="secondary">{returns.length} Total</Badge>
      </div>

      {/* Pending Returns */}
      {pendingReturns.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
            Pending Review ({pendingReturns.length})
          </h2>
          {pendingReturns.map((returnReq) => (
            <ReturnCard
              key={returnReq.id}
              returnReq={returnReq}
              getStatusColor={getStatusColor}
              isExpanded={expandedId === returnReq.id}
              onToggleExpand={() => setExpandedId(expandedId === returnReq.id ? null : returnReq.id)}
              onApprove={() => {
                setRespondingTo(returnReq.id);
                setAction("approve");
              }}
              onReject={() => {
                setRespondingTo(returnReq.id);
                setAction("reject");
              }}
              isProcessing={processingId === returnReq.id}
            />
          ))}
        </div>
      )}

      {/* Active Returns */}
      {activeReturns.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Awaiting Item ({activeReturns.length})</h2>
          {activeReturns.map((returnReq) => (
            <ReturnCard
              key={returnReq.id}
              returnReq={returnReq}
              getStatusColor={getStatusColor}
              isExpanded={expandedId === returnReq.id}
              onToggleExpand={() => setExpandedId(expandedId === returnReq.id ? null : returnReq.id)}
              onConfirmReceived={() => handleConfirmReceived(returnReq.id)}
              isProcessing={processingId === returnReq.id}
              showConfirmReceived={returnReq.status === "approved" || returnReq.status === "item_shipped"}
            />
          ))}
        </div>
      )}

      {/* Completed Returns */}
      {completedReturns.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-lg text-muted-foreground">
            Completed ({completedReturns.length})
          </h2>
          {completedReturns.map((returnReq) => (
            <ReturnCard
              key={returnReq.id}
              returnReq={returnReq}
              getStatusColor={getStatusColor}
              isExpanded={expandedId === returnReq.id}
              onToggleExpand={() => setExpandedId(expandedId === returnReq.id ? null : returnReq.id)}
            />
          ))}
        </div>
      )}

      {returns.length === 0 && (
        <div className="text-center py-12">
          <RotateCcw size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Return Requests</h3>
          <p className="text-muted-foreground">
            You haven't received any return requests yet.
          </p>
        </div>
      )}

      {/* Response Modal */}
      <Dialog open={!!respondingTo} onOpenChange={() => setRespondingTo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Return" : "Reject Return"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={
                action === "approve"
                  ? "Add any instructions for the customer (optional)"
                  : "Provide a reason for rejection (required)"
              }
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setRespondingTo(null)} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleRespond}
                disabled={action === "reject" && !response}
                className={cn(
                  "flex-1",
                  action === "reject" && "bg-destructive hover:bg-destructive/90"
                )}
              >
                {processingId ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : null}
                {action === "approve" ? "Approve Return" : "Reject Return"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface ReturnCardProps {
  returnReq: any;
  getStatusColor: (status: string) => string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onConfirmReceived?: () => void;
  isProcessing?: boolean;
  showConfirmReceived?: boolean;
}

const ReturnCard = ({
  returnReq,
  getStatusColor,
  isExpanded,
  onToggleExpand,
  onApprove,
  onReject,
  onConfirmReceived,
  isProcessing,
  showConfirmReceived,
}: ReturnCardProps) => {
  const reasonLabel = RETURN_REASONS.find((r) => r.value === returnReq.reason)?.label || returnReq.reason;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggleExpand}>
      <div className="border border-border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors text-left">
            <img
              src={returnReq.product_image || "/placeholder.svg"}
              alt=""
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium line-clamp-1">{returnReq.product_title}</p>
              <p className="text-sm text-muted-foreground">
                Order: {returnReq.order_number} • Customer: {returnReq.customer_name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(returnReq.status)}>
                  {RETURN_STATUS_LABELS[returnReq.status]}
                </Badge>
                <span className="text-sm font-medium text-primary">
                  {formatPKR(returnReq.refund_amount)}
                </span>
              </div>
            </div>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 border-t border-border bg-muted/30 space-y-4">
            {/* Reason */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Reason</p>
              <p className="font-medium">{reasonLabel}</p>
            </div>

            {/* Comments */}
            {returnReq.additional_comments && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Customer Comments</p>
                <p className="text-sm">{returnReq.additional_comments}</p>
              </div>
            )}

            {/* Photos */}
            {returnReq.photos && returnReq.photos.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <ImageIcon size={12} />
                  Photos ({returnReq.photos.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {returnReq.photos.map((photo: string, i: number) => (
                    <a
                      key={i}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={photo}
                        alt=""
                        className="w-20 h-20 object-cover rounded border hover:border-primary"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <p className="text-xs text-muted-foreground">
              Submitted: {format(new Date(returnReq.created_at), "PPp")}
            </p>

            {/* Actions */}
            {returnReq.status === "return_requested" && onApprove && onReject && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onReject}
                  disabled={isProcessing}
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X size={16} className="mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={onApprove}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  <Check size={16} className="mr-2" />
                  Approve
                </Button>
              </div>
            )}

            {showConfirmReceived && onConfirmReceived && (
              <Button onClick={onConfirmReceived} disabled={isProcessing} className="w-full">
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Package size={16} className="mr-2" />
                )}
                Confirm Item Received
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default SellerReturnsPage;
