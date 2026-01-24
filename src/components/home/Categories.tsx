import { Link } from "react-router-dom";
import { useMainCategories } from "@/hooks/useCategories";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Heart, 
  Dumbbell, 
  ShoppingBasket,
  Baby,
  Car,
  Watch,
  BookOpen,
  Gamepad2,
  Grid3X3,
  Folder,
  type LucideIcon
} from "lucide-react";
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
  Watch,
  BookOpen,
  Gamepad2,
  Refrigerator: Home,
  Folder,
};

const Categories = () => {
  const { data: categories, isLoading } = useMainCategories();
  const isMobile = useIsMobile();

  // Show first 8 categories on mobile for 4x4 grid (2 rows of 4)
  const displayCategories = isMobile ? categories?.slice(0, 8) : categories;
  const hasMore = isMobile && (categories?.length || 0) > 8;

  if (isLoading) {
    return (
      <section className="bg-card py-6">
        <div className="container mx-auto px-4">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12"
          )}>
            {[...Array(isMobile ? 8 : 12)].map((_, i) => (
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
      <div className="container mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 px-4 md:px-0">
          Shop by Category
        </h2>
        
        <div className={cn(
          "grid gap-4 px-4 md:px-0",
          isMobile ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12"
        )}>
          {displayCategories?.map((category) => {
            const IconComponent = iconMap[category.icon] || Folder;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 group active:scale-95 transition-transform duration-200"
              >
                <div className={cn(
                  "w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center",
                  "bg-primary/10 group-hover:bg-primary group-active:bg-primary",
                  "transition-all duration-300 group-hover:scale-105"
                )}>
                  <IconComponent 
                    className={cn(
                      "w-6 h-6 md:w-7 md:h-7",
                      "text-primary group-hover:text-primary-foreground group-active:text-primary-foreground",
                      "transition-colors duration-300"
                    )} 
                  />
                </div>
                <span className="text-[10px] md:text-xs text-center text-foreground font-medium line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* See All Button - Mobile Only */}
        {hasMore && (
          <Link
            to="/categories"
            className={cn(
              "mt-4 mx-4 flex items-center justify-center gap-2 w-[calc(100%-2rem)] py-3 rounded-lg",
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

export default Categories;
