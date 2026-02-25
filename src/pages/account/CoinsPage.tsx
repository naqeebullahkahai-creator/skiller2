import { useCoins } from "@/hooks/useCoins";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, ArrowUp, ArrowDown, Gift, ShoppingCart, Star, Gamepad2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const CoinsPage = () => {
  const { balance, transactions, isLoading } = useCoins();

  const getIcon = (type: string) => {
    switch (type) {
      case "earned_purchase": return <ShoppingCart size={16} className="text-green-500" />;
      case "earned_review": return <Star size={16} className="text-yellow-500" />;
      case "earned_game": return <Gamepad2 size={16} className="text-purple-500" />;
      case "redeemed": return <Gift size={16} className="text-primary" />;
      case "admin_credit": return <ArrowUp size={16} className="text-green-500" />;
      case "admin_debit": return <ArrowDown size={16} className="text-destructive" />;
      default: return <Coins size={16} className="text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6 text-center">
          <Coins size={40} className="mx-auto mb-2" />
          <p className="text-sm opacity-80">Your FANZON Coins</p>
          <p className="text-4xl font-bold">{balance}</p>
          <p className="text-sm opacity-80 mt-1">≈ Rs. {balance} value</p>
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Earn Coins</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {[
            { icon: ShoppingCart, label: "Shop", desc: "1 coin per Rs. 100" },
            { icon: Star, label: "Review", desc: "5 coins per review" },
            { icon: Gamepad2, label: "Spin Wheel", desc: "Up to 20 coins" },
            { icon: Gift, label: "Redeem", desc: "Use at checkout" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
              <item.icon size={20} className="text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No transactions yet. Start shopping to earn coins!</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div className="flex items-center gap-3">
                    {getIcon(tx.transaction_type)}
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.transaction_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(tx.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.amount > 0 ? "text-green-600" : "text-destructive"}`}>
                    {tx.amount > 0 ? "+" : ""}{tx.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoinsPage;
