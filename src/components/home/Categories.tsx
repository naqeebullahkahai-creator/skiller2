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
  Folder,
  Refrigerator,
  type LucideIcon
} from "lucide-react";
import { useMainCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

const iconMap: Record<string, LucideIcon> = {
  Smartphone, Shirt, Home, Heart, Dumbbell, ShoppingBasket, Baby, Car, Folder, Refrigerator,
};

const Categories = () => {
  const { data: categories, isLoading } = useMainCategories();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <section className="py-5">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-14 h-14 rounded-2xl" />
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const displayCategories = isMobile ? categories?.slice(0, 8) : categories;

  return (
    <section className="py-5">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="section-divider pt-1">
            <h2 className="text-lg font-display font-bold text-foreground tracking-tight">Shop by Category</h2>
          </div>
          <Link to="/categories" className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
          {displayCategories?.map((category) => {
            const IconComponent = iconMap[category.icon] || Folder;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 py-3 px-1 rounded-2xl transition-all duration-200 group hover:bg-card hover:shadow-md"
              >
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-card border border-border/50 flex items-center justify-center group-hover:border-primary/30 group-hover:shadow-sm transition-all">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/8 to-primary/3 flex items-center justify-center group-hover:from-primary/15 group-hover:to-primary/8 transition-colors">
                      <IconComponent size={22} className="text-primary" />
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-center text-foreground/80 font-medium line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {isMobile && (categories?.length || 0) > 8 && (
          <Link
            to="/categories"
            className="mt-3 flex items-center justify-center w-full py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-medium text-sm transition-colors"
          >
            See All Categories
          </Link>
        )}
      </div>
    </section>
  );
};

export default Categories;
