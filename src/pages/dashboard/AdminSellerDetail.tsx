import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  ShieldCheck,
  ShieldX,
  Clock,
  Download,
  AlertTriangle,
  User,
  Building2,
  CreditCard,
  FileText,
  Calendar,
  ZoomIn,
  X,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SellerProfile, isCnicExpired } from "@/hooks/useSellerKyc";
import { generateSellerDossierPDF } from "@/utils/generateSellerPDF";
import SellerCommissionManager from "@/components/admin/SellerCommissionManager";

const AdminSellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [fullSizeImage, setFullSizeImage] = useState<{ url: string; label: string } | null>(null);

  const { data: seller, isLoading } = useQuery({
    queryKey: ["seller-profile", sellerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seller_profiles")
        .select("*")
        .eq("id", sellerId)
        .single();

      if (error) throw error;
      return data as SellerProfile;
    },
    enabled: !!sellerId,
  });

  // Get seller email for notifications
  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-user-profile", seller?.user_id],
    queryFn: async () => {
      if (!seller?.user_id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", seller.user_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!seller?.user_id,
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      status,
      reason,
    }: {
      status: "verified" | "rejected";
      reason?: string;
    }) => {
      const updateData: Record<string, any> = {
        verification_status: status,
      };

      if (status === "verified") {
        updateData.verified_at = new Date().toISOString();
        updateData.rejection_reason = null;
      } else if (status === "rejected") {
        updateData.rejection_reason = reason || "Application rejected";
      }

      const { data, error } = await supabase
        .from("seller_profiles")
        .update(updateData)
        .eq("id", sellerId)
        .select()
        .single();

      if (error) throw error;
      return { data, status, reason };
    },
    onSuccess: async (result) => {
      const { status, reason } = result;
      toast.success(
        `Seller ${status === "verified" ? "approved" : "rejected"} successfully`
      );
      
      // Send email notification
      if (sellerProfile?.email) {
        try {
          await supabase.functions.invoke("send-kyc-status-email", {
            body: {
              email: sellerProfile.email,
              sellerName: seller?.legal_name || sellerProfile.full_name || "Seller",
              status,
              rejectionReason: status === "rejected" ? reason : undefined,
            },
          });
          toast.success("Email notification sent to seller");
        } catch (emailError) {
          console.error("Failed to send email:", emailError);
          // Don't show error toast - email is secondary
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ["seller-profile", sellerId] });
      queryClient.invalidateQueries({ queryKey: ["admin-seller-profiles"] });
      setShowRejectDialog(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleApprove = () => {
    updateStatus.mutate({ status: "verified" });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    updateStatus.mutate({ status: "rejected", reason: rejectionReason });
  };

  const handleDownloadPdf = async () => {
    if (!seller) return;
    setIsGeneratingPdf(true);
    try {
      await generateSellerDossierPDF(seller);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-lg px-4 py-1">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Verified
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="text-lg px-4 py-1">
            <ShieldX className="w-4 h-4 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-primary text-primary text-lg px-4 py-1">
            <Clock className="w-4 h-4 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Seller not found</p>
        <Button variant="outline" onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const cnicExpired = isCnicExpired(seller.cnic_expiry_date);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{seller.shop_name}</h1>
            <p className="text-muted-foreground">Seller ID: {seller.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(seller.verification_status)}
          <Button
            variant="outline"
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {/* CNIC Expiry Warning */}
      {cnicExpired && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <div>
                <p className="font-medium">CNIC Expired</p>
                <p className="text-sm">
                  This seller's CNIC expired on{" "}
                  {new Date(seller.cnic_expiry_date!).toLocaleDateString()}. Request updated
                  documents before approval.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Legal Name" value={seller.legal_name} />
            <InfoRow label="Father/Husband Name" value={seller.father_husband_name} />
            <InfoRow label="Gender" value={seller.gender} />
            <InfoRow
              label="Date of Birth"
              value={seller.date_of_birth ? new Date(seller.date_of_birth).toLocaleDateString() : null}
            />
            <InfoRow label="CNIC Number" value={seller.cnic_number} />
            <InfoRow
              label="CNIC Issue Date"
              value={seller.cnic_issue_date ? new Date(seller.cnic_issue_date).toLocaleDateString() : null}
            />
            <InfoRow
              label="CNIC Expiry Date"
              value={
                seller.cnic_expiry_date ? (
                  <span className={cn(cnicExpired && "text-destructive font-medium")}>
                    {new Date(seller.cnic_expiry_date).toLocaleDateString()}
                    {cnicExpired && " (EXPIRED)"}
                  </span>
                ) : null
              }
              highlight={cnicExpired}
            />
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Shop Name" value={seller.shop_name} />
            <InfoRow label="City" value={seller.city} />
            <InfoRow label="Business Address" value={seller.business_address} />
            <InfoRow label="NTN Number" value={seller.ntn_number || "Not Provided"} />
            <InfoRow label="Emergency Contact" value={seller.emergency_contact_name} />
            <InfoRow label="Emergency Phone" value={seller.emergency_contact_phone} />
          </CardContent>
        </Card>

        {/* Banking Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Banking Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow label="Bank Name" value={seller.bank_name} />
            <InfoRow label="Account Title" value={seller.account_title} />
            <InfoRow label="IBAN" value={seller.iban} mono />
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoRow
              label="Submitted On"
              value={new Date(seller.submitted_at).toLocaleString()}
            />
            <InfoRow
              label="Verified On"
              value={seller.verified_at ? new Date(seller.verified_at).toLocaleString() : "Not Yet"}
            />
            {seller.rejection_reason && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                <p className="text-sm text-muted-foreground">{seller.rejection_reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Identity Verification Section */}
      <Card className="border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Identity Verification - Cross Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            Compare the seller's selfie with their CNIC photo for verification. Click any image to view full size.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <DocumentPreview 
              label="Seller Selfie" 
              url={seller.selfie_url} 
              onViewFullSize={setFullSizeImage}
              aspectSquare
            />
            <DocumentPreview 
              label="CNIC Front" 
              url={seller.cnic_front_url} 
              onViewFullSize={setFullSizeImage}
            />
            <DocumentPreview 
              label="CNIC Back" 
              url={seller.cnic_back_url} 
              onViewFullSize={setFullSizeImage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Banking Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Banking Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm">
            <DocumentPreview 
              label="Bank Cheque/Statement" 
              url={seller.bank_cheque_url} 
              onViewFullSize={setFullSizeImage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Commission Management Section */}
      {seller.verification_status === "verified" && (
        <SellerCommissionManager 
          sellerId={seller.user_id} 
          sellerName={seller.shop_name}
        />
      )}

      {/* Action Buttons */}
      {seller.verification_status === "pending" && (
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
                disabled={updateStatus.isPending}
              >
                <ShieldX className="w-4 h-4 mr-2" />
                Reject Application
              </Button>
              <Button
                onClick={handleApprove}
                disabled={updateStatus.isPending || cnicExpired}
                className="bg-green-500 hover:bg-green-600"
              >
                {updateStatus.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Approve Seller
              </Button>
            </div>
            {cnicExpired && (
              <p className="text-sm text-destructive text-right mt-2">
                Cannot approve: CNIC is expired
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this seller application.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Size Image Viewer */}
      <Dialog open={!!fullSizeImage} onOpenChange={() => setFullSizeImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>{fullSizeImage?.label}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFullSizeImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {fullSizeImage && (
            <div className="p-4 flex items-center justify-center bg-muted/50 max-h-[70vh] overflow-auto">
              <img
                src={fullSizeImage.url}
                alt={fullSizeImage.label}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper Components
const InfoRow = ({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  highlight?: boolean;
}) => (
  <div className={cn("flex justify-between", highlight && "text-destructive")}>
    <span className="text-muted-foreground">{label}</span>
    <span className={cn("font-medium text-right", mono && "font-mono text-sm")}>
      {value || "N/A"}
    </span>
  </div>
);

const DocumentPreview = ({ 
  label, 
  url, 
  onViewFullSize,
  aspectSquare = false,
}: { 
  label: string; 
  url: string | null;
  onViewFullSize?: (data: { url: string; label: string }) => void;
  aspectSquare?: boolean;
}) => (
  <div className="space-y-2">
    <p className="text-sm font-medium">{label}</p>
    {url ? (
      <div 
        className={cn(
          "relative group cursor-pointer",
          aspectSquare && "w-40 mx-auto"
        )}
        onClick={() => onViewFullSize?.({ url, label })}
      >
        <img
          src={url}
          alt={label}
          className={cn(
            "rounded-lg border hover:opacity-90 transition-opacity object-cover",
            aspectSquare ? "w-full aspect-square" : "w-full h-40"
          )}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <ZoomIn className="w-5 h-5" />
            View Full Size
          </div>
        </div>
      </div>
    ) : (
      <div className={cn(
        "bg-muted rounded-lg flex items-center justify-center text-muted-foreground",
        aspectSquare ? "w-40 mx-auto aspect-square" : "w-full h-40"
      )}>
        No document uploaded
      </div>
    )}
  </div>
);

export default AdminSellerDetail;
