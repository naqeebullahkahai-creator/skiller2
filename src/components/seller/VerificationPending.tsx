import { Clock, CheckCircle2, FileSearch, UserCheck, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SellerProfile } from "@/hooks/useSellerKyc";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface VerificationPendingProps {
  sellerProfile: SellerProfile;
}

const VerificationPending = ({ sellerProfile }: VerificationPendingProps) => {
  const isPending = sellerProfile.verification_status === "pending";
  const isRejected = sellerProfile.verification_status === "rejected";

  const steps = [
    {
      title: "Application Submitted",
      description: "Your documents have been received",
      icon: CheckCircle2,
      status: "completed" as const,
    },
    {
      title: "Under Review",
      description: "Our team is verifying your details",
      icon: FileSearch,
      status: isPending ? "current" : isRejected ? "rejected" : "completed",
    },
    {
      title: "Account Activation",
      description: "Start selling on FANZON",
      icon: UserCheck,
      status: isPending ? "pending" : isRejected ? "pending" : "completed",
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-green-500",
          text: "text-green-500",
          line: "bg-green-500",
        };
      case "current":
        return {
          bg: "bg-primary",
          text: "text-primary",
          line: "bg-muted-foreground/30",
        };
      case "rejected":
        return {
          bg: "bg-destructive",
          text: "text-destructive",
          line: "bg-muted-foreground/30",
        };
      default:
        return {
          bg: "bg-muted-foreground/30",
          text: "text-muted-foreground",
          line: "bg-muted-foreground/30",
        };
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className={isRejected ? "border-destructive/30" : ""}>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4">
            {isRejected ? (
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className={cn("text-2xl", isRejected && "text-destructive")}>
            {isRejected ? "⚠️ Account Restricted" : "Verification Pending"}
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            {isRejected
              ? "Your account features are restricted. You cannot add products, manage inventory, or apply for flash sales."
              : "Your application is being reviewed. This usually takes 1-2 business days."}
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Timeline */}
          <div className="relative">
            {steps.map((step, index) => {
              const styles = getStatusStyles(step.status);
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex gap-4 pb-8 last:pb-0">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        step.status === "completed" || step.status === "current"
                          ? styles.bg
                          : "bg-muted border-2 border-muted-foreground/30"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          step.status === "completed" || step.status === "current" || step.status === "rejected"
                            ? "text-white"
                            : "text-muted-foreground"
                        )}
                      />
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={cn("w-0.5 flex-1 mt-2", styles.line)}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1.5">
                    <h4
                      className={cn(
                        "font-medium",
                        step.status === "pending"
                          ? "text-muted-foreground"
                          : "text-foreground"
                      )}
                    >
                      {step.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rejection Reason */}
          {isRejected && sellerProfile.rejection_reason && (
            <div className="mt-6 p-4 bg-destructive/10 rounded-lg border border-destructive/20">
              <h4 className="font-medium text-destructive mb-1">
                Rejection Reason
              </h4>
              <p className="text-sm text-muted-foreground">
                {sellerProfile.rejection_reason}
              </p>
            </div>
          )}

          {/* Submitted Details Summary */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-3">Submitted Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Shop Name:</span>
                <p className="font-medium">{sellerProfile.shop_name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">City:</span>
                <p className="font-medium">{sellerProfile.city}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted On:</span>
                <p className="font-medium">
                  {new Date(sellerProfile.submitted_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <p className={cn(
                  "font-medium capitalize",
                  isPending && "text-primary",
                  isRejected && "text-destructive"
                )}>
                  {sellerProfile.verification_status}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" asChild>
              <Link to="/seller/dashboard">Back to Dashboard</Link>
            </Button>
            {isRejected && (
              <Button className="flex-1" asChild>
                <Link to="/seller/kyc">Resubmit Application</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationPending;
