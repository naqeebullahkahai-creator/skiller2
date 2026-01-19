import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const WishlistPage = () => {
  // Wishlist functionality would need a wishlist table
  // For now, show placeholder
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart size={20} />
          My Wishlist
        </CardTitle>
        <CardDescription>
          Products you've saved for later
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <Heart size={64} className="mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">
            Start adding products you love by clicking the heart icon on product cards.
          </p>
          <Button asChild>
            <Link to="/products">
              <ShoppingBag size={16} className="mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WishlistPage;
