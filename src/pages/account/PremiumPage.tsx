import { usePremiumMembership } from "@/hooks/usePremiumMembership";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Truck, Headphones, Coins, Tag, Check } from "lucide-react";
import { format } from "date-fns";

const PremiumPage = () => {
  const { membership, isPremium, isLoading, subscribe } = usePremiumMembership();

  const benefits = [
    { icon: Truck, label: "Free Delivery", desc: "On all orders, no minimum" },
    { icon: Headphones, label: "Priority Support", desc: "24/7 dedicated support" },
    { icon: Coins, label: "2x Coins", desc: "Double coins on every purchase" },
    { icon: Tag, label: "Exclusive Deals", desc: "Members-only flash sales" },
  ];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      {isPremium ? (
        <Card className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
          <CardContent className="p-6 text-center">
            <Crown size={40} className="mx-auto mb-2" />
            <p className="text-2xl font-bold">FANZON Plus Member</p>
            <p className="opacity-80">
              Expires: {membership?.expires_at ? format(new Date(membership.expires_at), "PPP") : "N/A"}
            </p>
            <Badge className="mt-2 bg-white/20">{membership?.plan_type === "yearly" ? "Annual" : "Monthly"}</Badge>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <CardContent className="p-6 text-center">
            <Crown size={40} className="mx-auto mb-2" />
            <p className="text-2xl font-bold">Join FANZON Plus</p>
            <p className="opacity-80">Unlock premium benefits today!</p>
          </CardContent>
        </Card>
      )}

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Premium Benefits</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {benefits.map((b) => (
            <div key={b.label} className="flex items-start gap-3 p-3 rounded-lg bg-secondary">
              <b.icon size={24} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Plans */}
      {!isPremium && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardContent className="p-6 text-center">
              <p className="text-lg font-bold">Monthly</p>
              <p className="text-3xl font-black text-primary mt-2">Rs. 299</p>
              <p className="text-sm text-muted-foreground">/month</p>
              <Button className="w-full mt-4" onClick={() => subscribe("monthly")}>
                Subscribe Monthly
              </Button>
            </CardContent>
          </Card>
          <Card className="border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary">BEST VALUE</Badge>
            </div>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-bold">Yearly</p>
              <p className="text-3xl font-black text-primary mt-2">Rs. 2,499</p>
              <p className="text-sm text-muted-foreground">/year (save 30%)</p>
              <Button className="w-full mt-4" onClick={() => subscribe("yearly")}>
                Subscribe Yearly
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PremiumPage;
