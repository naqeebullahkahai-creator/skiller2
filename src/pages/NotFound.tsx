import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, Search, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* FANZON Logo */}
        <div className="flex justify-center">
          <Link to="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg hover:bg-primary/90 transition-colors">
            <span className="text-3xl font-bold tracking-tight">FANZON</span>
          </Link>
        </div>

        {/* 404 Display */}
        <div className="relative">
          <h1 className="text-[150px] font-bold text-primary/10 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShoppingBag className="w-20 h-20 text-primary" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-foreground">
            Page Not Found
          </h2>
          <p className="text-muted-foreground">
            Oops! The page you're looking for doesn't exist or has been moved.
            Let's get you back to shopping!
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/products">
              <Search className="w-4 h-4 mr-2" />
              Browse Products
            </Link>
          </Button>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>

        {/* Popular Categories */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Popular Categories</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["Electronics", "Fashion", "Home & Living", "Sports"].map((category) => (
              <Link
                key={category}
                to={`/category/${category.toLowerCase().replace(/ & /g, "-")}`}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {category}
              </Link>
            ))}
          </div>
        </div>

        {/* Help */}
        <p className="text-xs text-muted-foreground">
          Need help?{" "}
          <Link to="/help" className="text-primary hover:underline">
            Visit our Help Center
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
