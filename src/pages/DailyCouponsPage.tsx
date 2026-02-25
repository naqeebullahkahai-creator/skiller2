import { useDailyCoupons } from "@/hooks/useDailyCoupons";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, Clock, Check, Percent } from "lucide-react";
import SEOHead from "@/components/seo/SEOHead";

const DailyCouponsPage = () => {
  const { user } = useAuth();
  const { coupons, collected, isLoading, collectCoupon, isCollected } = useDailyCoupons();

  return (
    <>
      <SEOHead title="Daily Coupons - FANZON" description="Collect free coupons daily!" url="/daily-coupons" />
      <div className="min-h-screen bg-secondary flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">🎫 Daily Coupons</h1>
            <p className="text-muted-foreground">Collect free coupons every day — limited quantities!</p>
          </div>

          {/* Active Coupons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />
              ))
            ) : coupons.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <Ticket size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No coupons available today</p>
                <p className="text-muted-foreground">Check back tomorrow!</p>
              </div>
            ) : (
              coupons.map((coupon: any) => {
                const alreadyCollected = isCollected(coupon.id);
                const soldOut = coupon.max_collections && coupon.current_collections >= coupon.max_collections;

                return (
                  <Card key={coupon.id} className="overflow-hidden border-2 border-dashed border-primary/30 hover:border-primary transition-colors">
                    <CardContent className="p-0">
                      <div className="bg-primary/10 p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Percent size={24} className="text-primary" />
                          <span className="text-3xl font-black text-primary">
                            {coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : `Rs.${coupon.discount_value}`}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{coupon.title}</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Valid {coupon.valid_for_hours}h
                          </span>
                          {coupon.min_spend_pkr > 0 && (
                            <span>Min. Rs. {coupon.min_spend_pkr}</span>
                          )}
                        </div>
                        {coupon.max_collections && (
                          <div className="text-xs text-muted-foreground">
                            {coupon.current_collections}/{coupon.max_collections} collected
                            <div className="h-1.5 bg-muted rounded-full mt-1">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(coupon.current_collections / coupon.max_collections) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        <Button
                          className="w-full"
                          disabled={!user || alreadyCollected || !!soldOut}
                          onClick={() => collectCoupon(coupon.id)}
                          variant={alreadyCollected ? "outline" : "default"}
                        >
                          {!user ? "Login to Collect" : alreadyCollected ? (
                            <><Check size={16} className="mr-1" /> Collected</>
                          ) : soldOut ? "Sold Out" : "Collect Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* My Collected Coupons */}
          {collected.length > 0 && (
            <div className="mt-12 max-w-5xl mx-auto">
              <h2 className="text-xl font-bold mb-4">My Collected Coupons ({collected.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {collected.map((item: any) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-primary">
                          {item.daily_coupons?.discount_type === "percentage"
                            ? `${item.daily_coupons?.discount_value}% OFF`
                            : `Rs. ${item.daily_coupons?.discount_value} OFF`}
                        </p>
                        <p className="text-sm text-muted-foreground">{item.daily_coupons?.title}</p>
                      </div>
                      <Badge variant={item.is_used ? "secondary" : "default"}>
                        {item.is_used ? "Used" : "Active"}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default DailyCouponsPage;
