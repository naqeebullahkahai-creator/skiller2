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
  Grid3X3,
  type LucideIcon
} from "lucide-react";
import { useMainCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Smartphone, Shirt, Home, Heart, Dumbbell, ShoppingBasket, Baby, Car, Folder, Refrigerator,
};

const MobileCategoryScroll = () => {
  const { data: categories, isLoading } = useMainCategories();

  const displayCategories = categories?.slice(0, 8) || [];
  const hasMore = (categories?.length || 0) > 8;

  if (isLoading) {
    return (
      <div className="bg-card py-4 px-3">
        <div className="grid grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="w-14 h-14 rounded-xl" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-card py-4 px-3">
      <div className="grid grid-cols-4 gap-3">
        {displayCategories.map((cat) => {
          const Icon = iconMap[cat.icon] || Folder;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                {cat.image_url ? (
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-fanzon-orange-light flex items-center justify-center">
                    <Icon size={24} className="text-primary" />
                  </div>
                )}
              </div>
              <span className="text-[10px] text-foreground font-medium text-center line-clamp-1 w-full">
                {cat.name}
              </span>
            </Link>
          );
        })}
      </div>

      {/* See All Button */}
      {hasMore && (
        <Link
          to="/categories"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-lg bg-muted/50 hover:bg-muted text-foreground font-medium text-xs transition-colors active:scale-[0.98]"
        >
          <Grid3X3 size={14} className="text-primary" />
          See All Categories
        </Link>
      )}
    </section>
  );
};

export default MobileCategoryScroll;
