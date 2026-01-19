import { Link } from "react-router-dom";
import { navCategories } from "@/data/mockData";
import { ChevronDown } from "lucide-react";

const CategoryNav = () => {
  return (
    <nav className="hidden md:block bg-card border-b border-border shadow-sm">
      <div className="container mx-auto">
        <ul className="flex items-center gap-1 h-10 overflow-x-auto scrollbar-hide">
          {navCategories.map((category) => (
            <li key={category}>
              <Link
                to={`/category/${category.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded transition-colors whitespace-nowrap"
              >
                {category}
                <ChevronDown size={14} className="text-muted-foreground" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryNav;
