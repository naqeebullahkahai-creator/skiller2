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
      <div className="bg-card py-3 px-4">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-4" style={{ width: "max-content" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 w-[56px]">
                <Skeleton className="w-12 h-12 rounded-full" />
                <Skeleton className="h-2 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-card py-3 px-4">
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex gap-3" style={{ width: "max-content" }}>
          {displayCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || Folder;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-1.5 w-[56px] active:scale-95 transition-transform touch-target"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center elevation-1">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <Icon size={22} className="text-primary" />
                  )}
                </div>
                <span className="text-[10px] text-foreground font-medium text-center line-clamp-1 w-full leading-tight">
                  {cat.name}
                </span>
              </Link>
            );
          })}

          {hasMore && (
            <Link
              to="/categories"
              className="flex flex-col items-center gap-1.5 w-[56px] active:scale-95 transition-transform touch-target"
            >
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center elevation-1">
                <Grid3X3 size={20} className="text-primary" />
              </div>
              <span className="text-[10px] text-foreground font-medium text-center">
                See All
              </span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default MobileCategoryScroll;
