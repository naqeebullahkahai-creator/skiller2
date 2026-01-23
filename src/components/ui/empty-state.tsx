import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Heart, Search, Package, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateType = "cart" | "wishlist" | "search" | "orders" | "default";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

const emptyStateConfig: Record<EmptyStateType, { icon: ReactNode; title: string; description: string; actionLabel: string; actionHref: string }> = {
  cart: {
    icon: <ShoppingBag size={56} strokeWidth={1.5} />,
    title: "Your cart is empty",
    description: "Looks like you haven't added anything to your cart yet. Start shopping and discover amazing deals!",
    actionLabel: "Start Shopping",
    actionHref: "/products",
  },
  wishlist: {
    icon: <Heart size={56} strokeWidth={1.5} />,
    title: "Your wishlist is empty",
    description: "Save items you love by tapping the heart icon. They'll be waiting for you here!",
    actionLabel: "Explore Products",
    actionHref: "/products",
  },
  search: {
    icon: <Search size={56} strokeWidth={1.5} />,
    title: "No products found",
    description: "We couldn't find what you're looking for. Try adjusting your search or explore our categories.",
    actionLabel: "Browse All Products",
    actionHref: "/products",
  },
  orders: {
    icon: <Package size={56} strokeWidth={1.5} />,
    title: "No orders yet",
    description: "When you place an order, it will appear here. Start shopping to see your order history!",
    actionLabel: "Shop Now",
    actionHref: "/products",
  },
  default: {
    icon: <FileQuestion size={56} strokeWidth={1.5} />,
    title: "Nothing here yet",
    description: "This section is empty. Check back later or explore other parts of the store.",
    actionLabel: "Go Home",
    actionHref: "/",
  },
};

const EmptyState = ({
  type = "default",
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  className,
}: EmptyStateProps) => {
  const config = emptyStateConfig[type];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayActionLabel = actionLabel || config.actionLabel;
  const displayActionHref = actionHref || config.actionHref;
  const displayIcon = icon || config.icon;

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {/* Animated Icon Container */}
      <div className="relative mb-6">
        {/* Background Glow */}
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl scale-150 animate-pulse" />
        
        {/* Icon Circle */}
        <div className="relative w-28 h-28 bg-gradient-to-br from-muted to-muted/50 rounded-full flex items-center justify-center text-muted-foreground">
          {displayIcon}
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
        <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
      </div>

      {/* Text Content */}
      <h3 className="text-xl font-semibold text-foreground mb-2">{displayTitle}</h3>
      <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">{displayDescription}</p>

      {/* Action Button */}
      {onAction ? (
        <Button 
          onClick={onAction} 
          className="bg-primary hover:bg-fanzon-orange-hover transition-all hover:scale-105 active:scale-95"
        >
          <ShoppingBag size={16} className="mr-2" />
          {displayActionLabel}
        </Button>
      ) : (
        <Button asChild className="bg-primary hover:bg-fanzon-orange-hover transition-all hover:scale-105 active:scale-95">
          <Link to={displayActionHref}>
            <ShoppingBag size={16} className="mr-2" />
            {displayActionLabel}
          </Link>
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
