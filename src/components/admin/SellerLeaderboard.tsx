import { useState } from "react";
import { Trophy, TrendingUp, Star, CheckCircle, Loader2, Crown, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useSellerLeaderboard, LeaderboardMetric } from "@/hooks/useSellerLeaderboard";

const formatPKR = (amount: number) => {
  if (amount >= 1000000) {
    return `Rs. ${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `Rs. ${(amount / 1000).toFixed(1)}K`;
  }
  return `Rs. ${amount.toLocaleString()}`;
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  }
};

const getRankBadgeColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-400 to-amber-500 text-white";
    case 2:
      return "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800";
    case 3:
      return "bg-gradient-to-r from-amber-500 to-orange-600 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
};

interface SellerLeaderboardProps {
  limit?: number;
}

const SellerLeaderboard = ({ limit = 10 }: SellerLeaderboardProps) => {
  const [metric, setMetric] = useState<LeaderboardMetric>("sales");
  const { leaderboard, isLoading } = useSellerLeaderboard(metric, limit);

  const getMetricValue = (seller: typeof leaderboard[0]) => {
    switch (metric) {
      case "sales":
        return formatPKR(seller.total_sales);
      case "ratings":
        return `${seller.average_rating}/5 (${seller.review_count})`;
      case "fulfillment":
        return `${seller.fulfillment_rate}%`;
    }
  };

  const getMetricProgress = (seller: typeof leaderboard[0]) => {
    const maxSeller = leaderboard[0];
    if (!maxSeller) return 0;

    switch (metric) {
      case "sales":
        return maxSeller.total_sales > 0 
          ? (seller.total_sales / maxSeller.total_sales) * 100 
          : 0;
      case "ratings":
        return (seller.average_rating / 5) * 100;
      case "fulfillment":
        return seller.fulfillment_rate;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Seller Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Seller Leaderboard
          </CardTitle>
          <Tabs value={metric} onValueChange={(v) => setMetric(v as LeaderboardMetric)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Sales
              </TabsTrigger>
              <TabsTrigger value="ratings" className="text-xs">
                <Star className="h-3 w-3 mr-1" />
                Ratings
              </TabsTrigger>
              <TabsTrigger value="fulfillment" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Fulfillment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No verified sellers yet</p>
          </div>
        ) : (
          leaderboard.map((seller) => (
            <div
              key={seller.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                seller.rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30"
              }`}
            >
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(seller.rank)}`}>
                {getRankIcon(seller.rank)}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={seller.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-primary/10">
                  {seller.shop_name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{seller.shop_name}</p>
                  {seller.display_id && (
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      {seller.display_id}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Progress 
                    value={getMetricProgress(seller)} 
                    className="h-1.5 flex-1" 
                  />
                  <span className="text-xs font-semibold text-primary shrink-0">
                    {getMetricValue(seller)}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                <div className="text-center">
                  <p className="font-semibold text-foreground">{seller.total_orders}</p>
                  <p>Orders</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">{seller.products_count}</p>
                  <p>Products</p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default SellerLeaderboard;
