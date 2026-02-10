import { useState } from "react";
import { Copy, Check, Users, DollarSign, Share2, Gift } from "lucide-react";
import { useReferralCode, useReferralTracking } from "@/hooks/useReferral";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";

const ReferralPage = () => {
  const { referralCode, isLoading, createCode } = useReferralCode();
  const { referrals } = useReferralTracking();
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode
    ? `${window.location.origin}?ref=${referralCode.code}`
    : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join FANZON!",
        text: `Shop at Pakistan's best marketplace! Use my referral code ${referralCode?.code} to get started.`,
        url: referralLink,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refer & Earn</h1>
        <p className="text-muted-foreground mt-1">
          Share FANZON with friends and earn commission on every purchase they make!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Referrals</p>
              <p className="text-2xl font-bold">{referralCode?.total_referrals || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign size={24} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-2xl font-bold">Rs. {referralCode?.total_earnings_pkr || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Gift size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="text-2xl font-bold">{referralCode?.commission_percentage || 5}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 size={20} /> Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!referralCode ? (
            <div className="text-center py-6">
              <Gift className="h-12 w-12 mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground mb-4">
                Generate your unique referral code to start earning!
              </p>
              <Button onClick={() => createCode.mutate()} disabled={createCode.isPending || isLoading}>
                {createCode.isPending ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Your Code</p>
                  <p className="text-2xl font-bold font-mono tracking-wider text-primary">
                    {referralCode.code}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopy}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                  <Button size="sm" onClick={handleShare}>
                    <Share2 size={16} className="mr-1" /> Share
                  </Button>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Referral Link</p>
                <p className="text-sm font-mono break-all">{referralLink}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      {referrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.map(ref => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Referral #{ref.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(ref.created_at), "dd MMM yyyy")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">+Rs. {ref.commission_amount_pkr}</p>
                    <p className="text-xs capitalize text-muted-foreground">{ref.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReferralPage;
