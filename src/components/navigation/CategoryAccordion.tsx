import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
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
  Laptop,
  Tablet,
  Headphones,
  Footprints,
  ShoppingBag,
  Gem,
  Sofa,
  ChefHat,
  Lamp,
  Droplets,
  Palette,
  Flower,
  Folder,
  type LucideIcon
} from "lucide-react";
import { useCategoriesWithSubcategories, type Category } from "@/hooks/useCategories";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  Laptop,
  Tablet,
  Headphones,
  Footprints,
  ShoppingBag,
  Gem,
  Sofa,
  ChefHat,
  Lamp,
  Droplets,
  Palette,
  Flower,
  Folder,
  Refrigerator: Home,
};

interface CategoryAccordionProps {
  onCategoryClick?: () => void;
  className?: string;
}

const CategoryAccordion = ({ onCategoryClick, className }: CategoryAccordionProps) => {
  const { data: categories, isLoading } = useCategoriesWithSubcategories();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (categoryId: string) => {
    setExpandedId((prev) => (prev === categoryId ? null : categoryId));
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <nav className={cn("space-y-1", className)}>
      {categories?.map((category) => {
        const IconComponent = iconMap[category.icon] || Folder;
        const hasSubcategories = category.subcategories && category.subcategories.length > 0;
        const isExpanded = expandedId === category.id;

        return (
          <div key={category.id} className="overflow-hidden">
            {/* Main Category */}
            <div
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer",
                "transition-all duration-300 ease-out",
                "hover:bg-muted/80 active:scale-[0.98]",
                isExpanded && "bg-muted"
              )}
              onClick={() => hasSubcategories && toggleExpand(category.id)}
            >
              <Link
                to={`/category/${category.slug}`}
                onClick={(e) => {
                  if (hasSubcategories) {
                    e.preventDefault();
                  } else {
                    onCategoryClick?.();
                  }
                }}
                className="flex items-center gap-3 flex-1"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <IconComponent size={20} className="text-primary" />
                </div>
                <span className="font-medium text-foreground">{category.name}</span>
              </Link>

              {hasSubcategories && (
                <ChevronDown
                  size={18}
                  className={cn(
                    "text-muted-foreground transition-transform duration-300",
                    isExpanded && "rotate-180"
                  )}
                />
              )}
            </div>

            {/* Subcategories (Animated Accordion) */}
            <div
              className={cn(
                "overflow-hidden transition-all duration-300 ease-out",
                isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="pl-6 py-1 space-y-1">
                {category.subcategories?.map((sub) => {
                  const SubIconComponent = iconMap[sub.icon] || Folder;
                  return (
                    <Link
                      key={sub.id}
                      to={`/category/${sub.slug}`}
                      onClick={onCategoryClick}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-lg",
                        "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        "transition-all duration-200 active:scale-[0.98]"
                      )}
                    >
                      <SubIconComponent size={16} className="text-primary/70" />
                      <span className="text-sm">{sub.name}</span>
                      <ChevronRight size={14} className="ml-auto opacity-50" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
};

export default CategoryAccordion;
