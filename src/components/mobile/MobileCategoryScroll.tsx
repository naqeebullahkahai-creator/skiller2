import { Link } from "react-router-dom";
import {
  Smartphone, Shirt, Home, Heart, Dumbbell, ShoppingBasket,
  Baby, Car, Folder, Refrigerator, Grid3X3, type LucideIcon
} from "lucide-react";
import { useMainCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Smartphone, Shirt, Home, Heart, Dumbbell, ShoppingBasket, Baby, Car, Folder, Refrigerator,
};

const MobileCategoryScroll = () => {
  const { data: categories, isLoading } = useMainCategories();
  const displayCategories = categories?.slice(0, 10) || [];
  const hasMore = (categories?.length || 0) > 10;

  if (isLoading) {
    return (
      <div className="bg-card py-3 px-2">
        <div className="grid grid-cols-5 gap-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Skeleton className="w-11 h-11 rounded-full" />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-card py-3 px-2">
      <div className="grid grid-cols-5 gap-y-3 gap-x-1">
        {displayCategories.map((cat) => {
          const Icon = iconMap[cat.icon] || Folder;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
            >
              <div className="w-11 h-11 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                {cat.image_url ? (
                  <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <Icon size={20} className="text-primary" />
                )}
              </div>
              <span className="text-[9px] text-foreground font-medium text-center line-clamp-1 w-full leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}

        {hasMore && (
          <Link
            to="/categories"
            className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
              <Grid3X3 size={18} className="text-primary" />
            </div>
            <span className="text-[9px] text-foreground font-medium text-center">
              See All
            </span>
          </Link>
        )}
      </div>
    </section>
  );
};

export default MobileCategoryScroll;
