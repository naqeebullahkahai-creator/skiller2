import { useGroupBuyDeals, useJoinGroupBuy } from "@/hooks/useGroupBuy";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, Percent } from "lucide-react";
import { formatPKR } from "@/hooks/useProducts";
import SEOHead from "@/components/seo/SEOHead";
import { formatDistanceToNow } from "date-fns";

const GroupBuyPage = () => {
  const { user } = useAuth();
  const { deals, isLoading } = useGroupBuyDeals();
  const joinMutation = useJoinGroupBuy();

  return (
    <>
      <SEOHead title="Group Buy - FANZON" description="Buy together, save together!" url="/group-buy" />
      <div className="min-h-screen bg-secondary flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">🤝 Group Buy</h1>
            <p className="text-muted-foreground">Join together for bigger discounts!</p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <div key={i} className="h-64 bg-card rounded-xl animate-pulse" />)}
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-16">
              <Users size={48} className="mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No group buy deals available</p>
              <p className="text-muted-foreground">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal: any) => {
                const discount = Math.round(((deal.original_price_pkr - deal.group_price_pkr) / deal.original_price_pkr) * 100);
                const progress = (deal.current_participants / deal.min_participants) * 100;

                return (
                  <Card key={deal.id} className="overflow-hidden">
                    {deal.products?.images?.[0] && (
                      <div className="aspect-square bg-muted">
                        <img src={deal.products.images[0]} alt={deal.products?.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-medium text-sm line-clamp-2">{deal.products?.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">{formatPKR(deal.group_price_pkr)}</span>
                        <span className="text-sm text-muted-foreground line-through">{formatPKR(deal.original_price_pkr)}</span>
                        <Badge variant="destructive" className="text-xs">-{discount}%</Badge>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span className="flex items-center gap-1"><Users size={12} /> {deal.current_participants}/{deal.min_participants} joined</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatDistanceToNow(new Date(deal.ends_at))} left</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, progress)}%` }} />
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        disabled={!user || joinMutation.isPending}
                        onClick={() => joinMutation.mutate(deal.id)}
                      >
                        {!user ? "Login to Join" : "Join Group Buy"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default GroupBuyPage;
