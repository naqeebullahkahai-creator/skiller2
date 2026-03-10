import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Grid3X3 } from "lucide-react";
import { useCategoriesWithSubcategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CategoryNav = () => {
  const { data: categories, isLoading } = useCategoriesWithSubcategories();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <nav className="hidden md:block bg-card border-b border-border">
        <div className="container mx-auto">
          <div className="flex items-center gap-1 h-11">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-20" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="hidden md:block bg-card border-b border-border/60 relative">
      <div className="container mx-auto">
        <ul className="flex items-center h-11 overflow-x-auto scrollbar-hide gap-0.5">
          {/* All Categories pill */}
          <li className="flex-shrink-0">
            <span className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-bold text-primary bg-primary/8 rounded-full mr-2">
              <Grid3X3 size={14} />
              All Categories
            </span>
          </li>

          {categories?.map((category) => {
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            const isHovered = hoveredId === category.id;

            return (
              <li
                key={category.id}
                className="relative flex-shrink-0"
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className={cn(
                    "flex items-center gap-1 px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap rounded-full transition-all duration-200",
                    "text-foreground/75 hover:text-foreground hover:bg-muted",
                    isHovered && hasSubcategories && "bg-muted text-foreground"
                  )}
                >
                  {category.name}
                  {hasSubcategories && (
                    <ChevronDown size={11} className={cn("transition-transform duration-200 opacity-50", isHovered && "rotate-180 opacity-100")} />
                  )}
                </Link>

                {hasSubcategories && (
                  <div
                    className={cn(
                      "absolute top-full left-0 min-w-[220px] bg-card text-foreground rounded-xl shadow-xl border border-border/60 py-1.5 z-50 mt-1",
                      "transform origin-top transition-all duration-200 ease-out",
                      isHovered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    )}
                  >
                    {category.subcategories?.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className="block px-4 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary transition-colors rounded-lg mx-1"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
