import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useSellerKyc } from "@/hooks/useSellerKyc";
import KycRequiredAlert from "./KycRequiredAlert";
import VerificationPending from "./VerificationPending";

interface VerifiedSellerGuardProps {
  children: ReactNode;
}

const VerifiedSellerGuard = ({ children }: VerifiedSellerGuardProps) => {
  const { sellerProfile, isLoading, isVerified, hasSubmittedKyc } = useSellerKyc();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not submitted KYC yet
  if (!hasSubmittedKyc) {
    return <KycRequiredAlert />;
  }

  // KYC submitted but not verified
  if (!isVerified && sellerProfile) {
    return <VerificationPending sellerProfile={sellerProfile} />;
  }

  // Verified - render children
  return <>{children}</>;
};

export default VerifiedSellerGuard;
