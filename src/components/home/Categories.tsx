import { Link } from "react-router-dom";
import { categories } from "@/data/mockData";
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
  type LucideIcon
} from "lucide-react";

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
  Refrigerator: Home,
};

const Categories = () => {
  return (
    <section className="bg-card py-6">
      <div className="container mx-auto">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4 px-4 md:px-0">
          Shop by Category
        </h2>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-4 px-4 md:px-0">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon] || Smartphone;
            return (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-fanzon-orange-light flex items-center justify-center group-hover:bg-primary group-hover:scale-105 transition-all duration-200">
                  <IconComponent 
                    className="w-6 h-6 md:w-7 md:h-7 text-primary group-hover:text-primary-foreground transition-colors" 
                  />
                </div>
                <span className="text-[10px] md:text-xs text-center text-foreground font-medium line-clamp-2">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
