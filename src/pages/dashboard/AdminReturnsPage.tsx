import { useState } from "react";
import { format } from "date-fns";
import {
  RotateCcw,
  Loader2,
  Check,
  X,
  Wallet,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Gavel,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminReturns, RETURN_STATUS_LABELS, RETURN_REASONS } from "@/hooks/useReturns";
import { formatPKR } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const AdminReturnsPage = () => {
  const { user } = useAuth();
  const { returns, isLoading, adminOverride, processRefund } = useAdminReturns();
  const [overrideModal, setOverrideModal] = useState<{ id: string; action: "approve" | "reject" } | null>(null);
  const [decision, setDecision] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleOverride = async () => {
    if (!overrideModal || !user) return;
    setProcessingId(overrideModal.id);
    await adminOverride(overrideModal.id, overrideModal.action, decision, user.id);
    setOverrideModal(null);
    setDecision("");
    setProcessingId(null);
  };

  const handleProcessRefund = async (id: string) => {
    if (!user) return;
    setProcessingId(id);
    await processRefund(id, user.id);
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
      case "item_received":
        return "bg-teal-500/10 text-teal-600 border-teal-500/30";
      case "refund_issued":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const pendingReturns = returns.filter((r) =>
    ["return_requested", "rejected"].includes(r.status) && !r.admin_decision
  );
  const awaitingRefund = returns.filter((r) => r.status === "item_received");
  const completedReturns = returns.filter((r) => r.status === "refund_issued");

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
          Returns Management
        </h1>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{returns.length} Total</Badge>
          {awaitingRefund.length > 0 && (
            <Badge className="bg-teal-500">{awaitingRefund.length} Awaiting Refund</Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Needs Attention ({pendingReturns.length + awaitingRefund.length})
          </TabsTrigger>
          <TabsTrigger value="all">All Returns ({returns.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedReturns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {/* Awaiting Refund - Priority */}
          {awaitingRefund.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Wallet size={20} className="text-teal-600" />
                Ready for Refund ({awaitingRefund.length})
              </h2>
              {awaitingRefund.map((returnReq) => (
                <ReturnCard
                  key={returnReq.id}
                  returnReq={returnReq}
                  getStatusColor={getStatusColor}
                  isExpanded={expandedId === returnReq.id}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === returnReq.id ? null : returnReq.id)
                  }
                  onProcessRefund={() => handleProcessRefund(returnReq.id)}
                  isProcessing={processingId === returnReq.id}
                  showRefundButton
                />
              ))}
            </div>
          )}

          {/* Disputes / Need Admin Review */}
          {pendingReturns.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Gavel size={20} />
                Needs Review ({pendingReturns.length})
              </h2>
              {pendingReturns.map((returnReq) => (
                <ReturnCard
                  key={returnReq.id}
                  returnReq={returnReq}
                  getStatusColor={getStatusColor}
                  isExpanded={expandedId === returnReq.id}
                  onToggleExpand={() =>
                    setExpandedId(expandedId === returnReq.id ? null : returnReq.id)
                  }
                  onAdminApprove={() => setOverrideModal({ id: returnReq.id, action: "approve" })}
                  onAdminReject={() => setOverrideModal({ id: returnReq.id, action: "reject" })}
                  isProcessing={processingId === returnReq.id}
                  showAdminActions
                />
              ))}
            </div>
          )}

          {pendingReturns.length === 0 && awaitingRefund.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No returns need attention right now.
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-3 mt-4">
          {returns.map((returnReq) => (
            <ReturnCard
              key={returnReq.id}
              returnReq={returnReq}
              getStatusColor={getStatusColor}
              isExpanded={expandedId === returnReq.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === returnReq.id ? null : returnReq.id)
              }
              onProcessRefund={
                returnReq.status === "item_received"
                  ? () => handleProcessRefund(returnReq.id)
                  : undefined
              }
              showRefundButton={returnReq.status === "item_received"}
              isProcessing={processingId === returnReq.id}
            />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3 mt-4">
          {completedReturns.map((returnReq) => (
            <ReturnCard
              key={returnReq.id}
              returnReq={returnReq}
              getStatusColor={getStatusColor}
              isExpanded={expandedId === returnReq.id}
              onToggleExpand={() =>
                setExpandedId(expandedId === returnReq.id ? null : returnReq.id)
              }
            />
          ))}
          {completedReturns.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No completed returns yet.
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Admin Override Modal */}
      <Dialog open={!!overrideModal} onOpenChange={() => setOverrideModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Admin {overrideModal?.action === "approve" ? "Approve" : "Reject"} Return
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will override any seller decision. Please provide a reason.
            </p>
            <Textarea
              placeholder="Enter your decision reason..."
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setOverrideModal(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOverride}
                disabled={!decision}
                className={cn(
                  "flex-1",
                  overrideModal?.action === "reject" && "bg-destructive hover:bg-destructive/90"
                )}
              >
                {processingId ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                {overrideModal?.action === "approve" ? "Approve" : "Reject"}
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
  onAdminApprove?: () => void;
  onAdminReject?: () => void;
  onProcessRefund?: () => void;
  isProcessing?: boolean;
  showAdminActions?: boolean;
  showRefundButton?: boolean;
}

const ReturnCard = ({
  returnReq,
  getStatusColor,
  isExpanded,
  onToggleExpand,
  onAdminApprove,
  onAdminReject,
  onProcessRefund,
  isProcessing,
  showAdminActions,
  showRefundButton,
}: ReturnCardProps) => {
  const reasonLabel =
    RETURN_REASONS.find((r) => r.value === returnReq.reason)?.label || returnReq.reason;

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
                Order: {returnReq.order_number} • {returnReq.customer_name}
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
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="font-medium">{reasonLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity</p>
                <p className="font-medium">{returnReq.quantity}</p>
              </div>
            </div>

            {returnReq.additional_comments && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Comments</p>
                <p className="text-sm bg-card p-2 rounded">{returnReq.additional_comments}</p>
              </div>
            )}

            {returnReq.photos && returnReq.photos.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Photos</p>
                <div className="flex flex-wrap gap-2">
                  {returnReq.photos.map((photo: string, i: number) => (
                    <a key={i} href={photo} target="_blank" rel="noopener noreferrer">
                      <img
                        src={photo}
                        alt=""
                        className="w-16 h-16 object-cover rounded border hover:border-primary"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {returnReq.seller_response && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Seller Response</p>
                <p className="text-sm">{returnReq.seller_response}</p>
              </div>
            )}

            {returnReq.admin_decision && (
              <div className="bg-primary/10 border border-primary/20 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Admin Decision</p>
                <p className="text-sm">{returnReq.admin_decision}</p>
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              Submitted: {format(new Date(returnReq.created_at), "PPp")}
            </p>

            {showAdminActions && onAdminApprove && onAdminReject && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={onAdminReject}
                  disabled={isProcessing}
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X size={16} className="mr-2" />
                  Reject
                </Button>
                <Button onClick={onAdminApprove} disabled={isProcessing} className="flex-1">
                  <Check size={16} className="mr-2" />
                  Approve
                </Button>
              </div>
            )}

            {showRefundButton && onProcessRefund && (
              <Button
                onClick={onProcessRefund}
                disabled={isProcessing}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {isProcessing ? (
                  <Loader2 size={16} className="animate-spin mr-2" />
                ) : (
                  <Wallet size={16} className="mr-2" />
                )}
                Process Refund ({formatPKR(returnReq.refund_amount)})
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default AdminReturnsPage;
