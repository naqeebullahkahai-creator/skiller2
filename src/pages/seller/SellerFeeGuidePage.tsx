import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  CreditCard, 
  Calendar, 
  Wallet, 
  AlertTriangle, 
  CheckCircle, 
  HelpCircle,
  ArrowRight,
  Clock,
  Shield
} from "lucide-react";
import { useSellerSubscription } from "@/hooks/useSellerSubscription";
import { formatPKR } from "@/hooks/useSellerWallet";

const SellerFeeGuidePage = () => {
  const { subscription, globalFees, effectiveFee } = useSellerSubscription();

  const dailyFee = globalFees?.perDay ?? 25;
  const monthlyFee = (globalFees?.perDay ?? 25) * 30;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Platform Fee Guide</h1>
        <p className="text-muted-foreground">
          FANZON platform fees ka complete guide — sab kuch detail mein samjhein
        </p>
      </div>

      {/* Your Current Plan */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Your Current Fee Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Plan Type</p>
              <p className="text-xl font-bold capitalize">
                {subscription?.subscription_type || 'Daily'}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Your Fee</p>
              <p className="text-xl font-bold text-primary">
                {formatPKR(effectiveFee)}/{subscription?.subscription_type === 'monthly' ? 'month' : 'day'}
              </p>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Total Paid</p>
              <p className="text-xl font-bold">
                {formatPKR(subscription?.total_fees_paid ?? 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button asChild variant="outline" size="sm">
              <Link to="/seller-center/wallet">
                <Wallet className="w-4 h-4 mr-2" />
                Go to Wallet
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fee Structure Article */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Platform Fee Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Daily Fee */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Daily Platform Fee</h3>
              <Badge>{formatPKR(dailyFee)}/day</Badge>
            </div>
            <div className="pl-7 space-y-2 text-sm text-muted-foreground">
              <p>• Har 24 ghante baad aapki wallet se <strong className="text-foreground">{formatPKR(dailyFee)}</strong> automatically deduct hoga.</p>
              <p>• Ye fee aapko platform par apni shop chalane ke liye di jaati hai.</p>
              <p>• Agar wallet mein balance nahi hai, to fee pending ho jayegi aur aapko notification aayega.</p>
              <p>• Monthly hisaab: {formatPKR(dailyFee)} × 30 days = <strong className="text-foreground">{formatPKR(dailyFee * 30)}</strong></p>
            </div>
          </div>

          <Separator />

          {/* Monthly Fee */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Monthly Platform Fee</h3>
              <Badge variant="secondary">{formatPKR(monthlyFee)}/month</Badge>
            </div>
            <div className="pl-7 space-y-2 text-sm text-muted-foreground">
              <p>• Agar aap monthly plan choose karte hain to har 30 din baad <strong className="text-foreground">{formatPKR(monthlyFee)}</strong> deduct hoga.</p>
              <p>• Monthly plan mein aap <strong className="text-green-600">{formatPKR((dailyFee * 30) - monthlyFee)}</strong> save karte hain daily ke muqablay mein.</p>
              <p>• Monthly plan switch karne ke liye admin se request karein.</p>
            </div>
          </div>

          <Separator />

          {/* How Fee Works */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Fee Kaise Kaam Karti Hai?</h3>
            </div>
            <div className="pl-7 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <p>Jab aapka account verify hota hai, to aapka subscription shuru ho jaata hai.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <p>Har din (ya month) automatically aapki wallet se fee deduct hoti hai.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <p>Agar wallet mein balance nahi hai, to fee pending ho jayegi.</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                <p>Jab aap wallet mein paise add karein ge, to pending fee pehle deduct hogi.</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Insufficient Balance */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold">Balance Kam Ho To Kya Hoga?</h3>
            </div>
            <div className="pl-7 space-y-2 text-sm">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <p className="text-destructive font-medium">⚠️ Agar wallet mein balance nahi hai:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Fee pending mein chali jayegi</li>
                  <li>Aapko notification aayegi</li>
                  <li>Aapki shop restricted ho sakti hai</li>
                  <li>Jitni jaldi balance add karein, utna acha</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Grace Period */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">New Seller Grace Period</h3>
            </div>
            <div className="pl-7 space-y-2 text-sm text-muted-foreground">
              <p>• Naye verified sellers ko admin ki taraf se <strong className="text-foreground">grace period</strong> mil sakta hai.</p>
              <p>• Grace period mein aapki fees kam ya zero ho sakti hain.</p>
              <p>• Grace period khatam hone ke baad normal fees lag jaayengi.</p>
              <p>• Ye benefit automatically milta hai agar admin ne enable kiya ho.</p>
            </div>
          </div>

          <Separator />

          {/* Tips */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold">Tips for Sellers</h3>
            </div>
            <div className="pl-7 space-y-2 text-sm text-muted-foreground">
              <p>✅ Wallet mein hamesha kam se kam 1 hafte ki fee rakhein</p>
              <p>✅ Monthly plan choose karein agar regular seller hain — {formatPKR((dailyFee * 30) - monthlyFee)} save hoga</p>
              <p>✅ Wallet top-up karne ke liye Deposit section use karein</p>
              <p>✅ Fee history check karne ke liye Wallet page par jaayein</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button asChild variant="outline" className="h-auto py-4 justify-between">
          <Link to="/seller-center/wallet">
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Wallet & Deposits</p>
                <p className="text-xs text-muted-foreground">Balance check karein aur top-up karein</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto py-4 justify-between">
          <Link to="/seller-center/settings">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5" />
              <div className="text-left">
                <p className="font-medium">Settings</p>
                <p className="text-xs text-muted-foreground">Apni shop settings manage karein</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SellerFeeGuidePage;
