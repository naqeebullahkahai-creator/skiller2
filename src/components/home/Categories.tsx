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
  ChevronRight,
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

  const displayCategories = isMobile ? categories?.slice(0, 8) : categories;
  const hasMore = isMobile && (categories?.length || 0) > 8;

  if (isLoading) {
    return (
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-4" : "grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
          )}>
            {[...Array(isMobile ? 8 : 10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-2xl" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Shop by Category
            </h2>
            <p className="text-sm text-muted-foreground mt-1 hidden md:block">
              Find exactly what you need
            </p>
          </div>
          <Link 
            to="/categories" 
            className="flex items-center gap-1 text-primary text-sm font-medium hover:underline"
          >
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Categories Grid */}
        <div className={cn(
          "grid gap-4 md:gap-6",
          isMobile ? "grid-cols-4" : "grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10"
        )}>
          {displayCategories?.map((category) => {
            const IconComponent = iconMap[category.icon] || Folder;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-3 group"
              >
                <div className={cn(
                  "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br from-primary/5 to-primary/15",
                  "group-hover:from-primary group-hover:to-primary/90",
                  "transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20",
                  "active:scale-95"
                )}>
                  <IconComponent 
                    className={cn(
                      "w-7 h-7 md:w-8 md:h-8",
                      "text-primary group-hover:text-primary-foreground",
                      "transition-colors duration-300"
                    )} 
                  />
                </div>
                <span className="text-xs md:text-sm text-center text-foreground font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Mobile See All */}
        {hasMore && (
          <Link
            to="/categories"
            className={cn(
              "mt-6 flex items-center justify-center gap-2 w-full py-3.5 rounded-xl",
              "bg-primary/5 hover:bg-primary/10 text-primary font-medium text-sm",
              "transition-all duration-300 active:scale-[0.98] border border-primary/20"
            )}
          >
            <Grid3X3 size={18} />
            <span>See All Categories</span>
          </Link>
        )}
      </div>
    </section>
  );
};

export default Categories;
