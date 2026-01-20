import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, TrendingUp, Tag } from "lucide-react";
import { useActiveProducts } from "@/hooks/useProducts";
import { categories } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchSuggestionsProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const SearchSuggestions = ({ query, isOpen, onClose, onSelect, inputRef }: SearchSuggestionsProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { products } = useActiveProducts(100);
  const containerRef = useRef<HTMLDivElement>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("fanzon_recent_searches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, inputRef]);

  if (!isOpen) return null;

  const normalizedQuery = query.toLowerCase().trim();

  // Filter products by query
  const matchingProducts = normalizedQuery
    ? products
        .filter(
          (p) =>
            p.title.toLowerCase().includes(normalizedQuery) ||
            p.category.toLowerCase().includes(normalizedQuery) ||
            p.brand?.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 5)
    : [];

  // Filter categories by query
  const matchingCategories = normalizedQuery
    ? categories
        .filter((c) => c.name.toLowerCase().includes(normalizedQuery))
        .slice(0, 3)
    : [];

  // Trending searches (static for now)
  const trendingSearches = ["iPhone", "Samsung", "Nike Shoes", "Laptop", "Watch"];

  const handleProductClick = (productSlug: string) => {
    onClose();
    navigate(`/product/${productSlug}`);
  };

  const handleCategoryClick = (categorySlug: string) => {
    onClose();
    navigate(`/category/${categorySlug}`);
  };

  const handleSearchClick = (searchTerm: string) => {
    // Save to recent searches
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("fanzon_recent_searches", JSON.stringify(updated));
    onSelect(searchTerm);
    onClose();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("fanzon_recent_searches");
  };

  const hasResults = matchingProducts.length > 0 || matchingCategories.length > 0;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto"
    >
      {/* Show suggestions based on query */}
      {normalizedQuery ? (
        <>
          {/* Matching Categories */}
          {matchingCategories.length > 0 && (
            <div className="p-2 border-b border-border">
              <p className="text-xs text-muted-foreground px-2 mb-1">{t("search.categories")}</p>
              {matchingCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className="flex items-center gap-2 w-full px-2 py-2 hover:bg-muted rounded text-sm text-start"
                >
                  <Tag size={14} className="text-muted-foreground" />
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Products */}
          {matchingProducts.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-2 mb-1">{t("search.products")}</p>
              {matchingProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductClick(product.slug || product.id)}
                  className="flex items-center gap-3 w-full px-2 py-2 hover:bg-muted rounded text-start"
                >
                  <img
                    src={product.images?.[0] || "/placeholder.svg"}
                    alt={product.title}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    Rs. {(product.discount_price_pkr || product.price_pkr).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!hasResults && (
            <div className="p-4 text-center text-muted-foreground">
              <Search size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">{t("search.no_suggestions")}</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="flex items-center justify-between px-2 mb-1">
                <p className="text-xs text-muted-foreground">{t("search.recent")}</p>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-primary hover:underline"
                >
                  {t("common.clear")}
                </button>
              </div>
              {recentSearches.map((term, index) => (
                <button
                  key={index}
                  onClick={() => handleSearchClick(term)}
                  className="flex items-center gap-2 w-full px-2 py-2 hover:bg-muted rounded text-sm text-start"
                >
                  <Clock size={14} className="text-muted-foreground" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Trending Searches */}
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-2 mb-1">{t("search.trending")}</p>
            {trendingSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handleSearchClick(term)}
                className="flex items-center gap-2 w-full px-2 py-2 hover:bg-muted rounded text-sm text-start"
              >
                <TrendingUp size={14} className="text-primary" />
                <span>{term}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchSuggestions;
