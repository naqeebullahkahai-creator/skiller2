import { Heart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";

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
        <EmptyState type="wishlist" />
      </CardContent>
    </Card>
  );
};

export default WishlistPage;
