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
  ChevronRight,
  type LucideIcon
} from "lucide-react";
import { useMainCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, LucideIcon> = {
  Smartphone, Shirt, Home, Heart, Dumbbell, ShoppingBasket, Baby, Car, Folder, Refrigerator,
};

const MobileCategoryScroll = () => {
  const { data: categories, isLoading } = useMainCategories();

  if (isLoading) {
    return (
      <div className="bg-card py-3 px-3">
        <div className="flex gap-4 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-2.5 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="bg-card py-3">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-3" style={{ width: "max-content" }}>
          {categories?.map((cat) => {
            const Icon = iconMap[cat.icon] || Folder;
            return (
              <Link
                key={cat.id}
                to={`/category/${cat.slug}`}
                className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0 active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 rounded-full bg-fanzon-orange-light flex items-center justify-center">
                  <Icon size={20} className="text-primary" />
                </div>
                <span className="text-[10px] text-foreground font-medium text-center line-clamp-1 w-full">
                  {cat.name}
                </span>
              </Link>
            );
          })}

          {/* See All */}
          <Link
            to="/categories"
            className="flex flex-col items-center gap-1.5 w-16 flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">See All</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MobileCategoryScroll;
