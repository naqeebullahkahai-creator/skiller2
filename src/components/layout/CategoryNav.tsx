import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { useCategoriesWithSubcategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CategoryNav = () => {
  const { data: categories, isLoading } = useCategoriesWithSubcategories();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <nav className="hidden md:block bg-card border-b border-border shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center gap-1 h-10">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-24" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="hidden md:block bg-card border-b border-border shadow-sm relative">
      <div className="container mx-auto">
        <ul className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
          {categories?.map((category) => {
            const hasSubcategories = category.subcategories && category.subcategories.length > 0;
            const isHovered = hoveredId === category.id;

            return (
              <li
                key={category.id}
                className="relative"
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <Link
                  to={`/category/${category.slug}`}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 text-sm font-medium rounded transition-all duration-200 whitespace-nowrap",
                    "text-foreground hover:text-primary hover:bg-muted",
                    isHovered && hasSubcategories && "text-primary bg-muted"
                  )}
                >
                  {category.name}
                  {hasSubcategories && (
                    <ChevronDown 
                      size={14} 
                      className={cn(
                        "text-muted-foreground transition-transform duration-200",
                        isHovered && "rotate-180 text-primary"
                      )} 
                    />
                  )}
                </Link>

                {/* Subcategory Dropdown */}
                {hasSubcategories && (
                  <div
                    className={cn(
                      "absolute top-full left-0 min-w-[200px] bg-card rounded-lg shadow-xl border border-border py-2 z-50",
                      "transform origin-top transition-all duration-200 ease-out",
                      isHovered
                        ? "opacity-100 scale-100 translate-y-0"
                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                    )}
                  >
                    {category.subcategories?.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors duration-150"
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
