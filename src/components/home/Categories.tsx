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
};

const Categories = () => {
  const { data: categories, isLoading } = useMainCategories();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <section className="bg-card py-5 rounded-2xl mx-4 md:mx-0 my-2">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
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
    <section className="bg-card py-5 my-2">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base md:text-lg font-display font-bold text-foreground">Categories</h2>
          <Link 
            to="/categories" 
            className="text-xs md:text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4 md:gap-5">
          {displayCategories?.map((category) => {
            const IconComponent = iconMap[category.icon] || iconMap["Refrigerator"] || Folder;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2.5 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-secondary flex items-center justify-center group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-300">
                  {category.image_url ? (
                    <img
                      src={category.image_url}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                      <IconComponent 
                        size={24} 
                        className="text-primary group-hover:text-primary-foreground transition-colors duration-300" 
                      />
                    </div>
                  )}
                </div>
                <span className="text-[10px] md:text-xs text-center text-foreground font-medium line-clamp-2">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>

        {isMobile && (categories?.length || 0) > 8 && (
          <Link
            to="/categories"
            className="mt-5 flex items-center justify-center w-full py-2.5 rounded-xl bg-secondary hover:bg-muted text-foreground font-semibold text-sm transition-colors"
          >
            See All Categories
          </Link>
        )}
      </div>
    </section>
  );
};

export default Categories;
