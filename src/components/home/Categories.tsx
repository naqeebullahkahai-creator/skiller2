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
      <section className="bg-card py-4 my-1">
        <div className="container mx-auto">
          <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-12 h-12 rounded-full" />
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
    <section className="bg-card py-4 my-1">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">Categories</h2>
          <Link to="/categories" className="text-xs text-primary hover:underline font-medium">
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-2">
          {displayCategories?.map((category) => {
            const IconComponent = iconMap[category.icon] || Folder;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-1.5 py-2 px-1 hover:bg-muted rounded-lg transition-colors group"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center group-hover:shadow-md transition-shadow">
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent size={20} className="text-primary" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] md:text-[11px] text-center text-foreground font-medium line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {isMobile && (categories?.length || 0) > 8 && (
          <Link
            to="/categories"
            className="mt-3 flex items-center justify-center w-full py-2 rounded-lg bg-secondary hover:bg-muted text-foreground font-medium text-sm transition-colors"
          >
            See All Categories
          </Link>
        )}
      </div>
    </section>
  );
};

export default Categories;
