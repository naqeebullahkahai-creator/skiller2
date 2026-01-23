import { Link } from "react-router-dom";
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Heart, 
  Dumbbell, 
  ShoppingBasket,
  Baby,
  Car,
  Grid3X3,
  Folder,
  type LucideIcon
} from "lucide-react";
import { useMainCategories, type Category } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Shirt,
  Home,
  Heart,
  Dumbbell,
  ShoppingBasket,
  Baby,
  Car,
  Folder,
};

const MobileCategoryGrid = () => {
  const { data: categories, isLoading } = useMainCategories();

  // Show first 8 categories for 4x4 grid (2 rows of 4)
  const displayCategories = categories?.slice(0, 8) || [];
  const hasMore = (categories?.length || 0) > 8;

  if (isLoading) {
    return (
      <section className="bg-card py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card py-6">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-bold text-foreground mb-4">Shop by Category</h2>
        
        <div className="grid grid-cols-4 gap-4">
          {displayCategories.map((category) => {
            const IconComponent = iconMap[category.icon] || Folder;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform duration-200"
              >
                <div 
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center",
                    "bg-fanzon-orange-light group-hover:bg-primary group-active:bg-primary",
                    "transition-all duration-300"
                  )}
                >
                  <IconComponent 
                    size={24} 
                    className="text-primary group-hover:text-primary-foreground group-active:text-primary-foreground transition-colors duration-300" 
                  />
                </div>
                <span className="text-[11px] text-center text-foreground font-medium line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* See All Button */}
        {hasMore && (
          <Link
            to="/categories"
            className={cn(
              "mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-lg",
              "bg-muted/50 hover:bg-muted text-foreground font-medium text-sm",
              "transition-all duration-300 active:scale-[0.98]"
            )}
          >
            <Grid3X3 size={18} className="text-primary" />
            <span>See All Categories</span>
          </Link>
        )}
      </div>
    </section>
  );
};

export default MobileCategoryGrid;
