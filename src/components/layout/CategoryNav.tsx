import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useCategoriesWithSubcategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CategoryNav = () => {
  const { data: categories, isLoading } = useCategoriesWithSubcategories();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <nav className="hidden md:block bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="flex items-center gap-1 h-10">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-20 bg-primary-foreground/20" />
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="hidden md:block bg-primary text-primary-foreground relative">
      <div className="container mx-auto">
        <ul className="flex items-center h-10 overflow-x-auto scrollbar-hide">
          <li className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-r border-primary-foreground/20 mr-1">
            <LayoutGrid size={16} />
            All Categories
          </li>
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
                    "flex items-center gap-1 px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150",
                    "hover:bg-primary-foreground/10",
                    isHovered && hasSubcategories && "bg-primary-foreground/10"
                  )}
                >
                  {category.name}
                  {hasSubcategories && (
                    <ChevronDown size={12} className={cn("transition-transform duration-200 opacity-70", isHovered && "rotate-180")} />
                  )}
                </Link>

                {hasSubcategories && (
                  <div
                    className={cn(
                      "absolute top-full left-0 min-w-[220px] bg-card text-foreground rounded-b-lg shadow-xl border border-border py-1 z-50",
                      "transform origin-top transition-all duration-150 ease-out",
                      isHovered ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                    )}
                  >
                    {category.subcategories?.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className="block px-4 py-2 text-sm hover:bg-muted hover:text-primary transition-colors"
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
