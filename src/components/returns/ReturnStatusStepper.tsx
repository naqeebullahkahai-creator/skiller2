import { RETURN_STATUS_LABELS } from "@/hooks/useReturns";
import { cn } from "@/lib/utils";
import { Check, Clock, Package, Truck, Wallet, AlertCircle } from "lucide-react";

interface ReturnStatusStepperProps {
  currentStatus: string;
  isRejected?: boolean;
}

const STEPS = [
  { key: "return_requested", label: "Return Requested", icon: Clock },
  { key: "under_review", label: "Under Review", icon: AlertCircle },
  { key: "approved", label: "Approved", icon: Check },
  { key: "item_shipped", label: "Item Shipped", icon: Truck },
  { key: "item_received", label: "Item Received", icon: Package },
  { key: "refund_issued", label: "Refund Issued", icon: Wallet },
];

const getStepIndex = (status: string): number => {
  return STEPS.findIndex((s) => s.key === status);
};

const ReturnStatusStepper = ({ currentStatus, isRejected }: ReturnStatusStepperProps) => {
  const currentIndex = getStepIndex(currentStatus);

  if (isRejected || currentStatus === "rejected") {
    return (
      <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
        <AlertCircle className="text-destructive" size={24} />
        <div>
          <p className="font-semibold text-destructive">Return Request Rejected</p>
          <p className="text-sm text-muted-foreground">
            Your return request was not approved. Please contact support if you have questions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{
              width: `${Math.max(0, (currentIndex / (STEPS.length - 1)) * 100)}%`,
            }}
          />
        </div>

        {/* Steps */}
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className="relative flex flex-col items-center z-10"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-muted-foreground/30 text-muted-foreground"
                )}
              >
                <Icon size={18} />
              </div>
              <span
                className={cn(
                  "text-[10px] sm:text-xs mt-2 text-center max-w-[60px] sm:max-w-[80px] leading-tight",
                  isCurrent
                    ? "font-semibold text-primary"
                    : isCompleted
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReturnStatusStepper;
