import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { DatabaseProduct } from "@/hooks/useProducts";
import { toast } from "@/hooks/use-toast";

const MAX_COMPARISON_ITEMS = 4;

interface ComparisonContextType {
  items: DatabaseProduct[];
  addToCompare: (product: DatabaseProduct) => void;
  removeFromCompare: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<DatabaseProduct[]>([]);

  // Load from session storage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("comparison_items");
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load comparison items:", error);
    }
  }, []);

  // Save to session storage on change
  useEffect(() => {
    try {
      sessionStorage.setItem("comparison_items", JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save comparison items:", error);
    }
  }, [items]);

  const addToCompare = useCallback((product: DatabaseProduct) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        toast({
          title: "Already in comparison",
          description: `${product.title} is already in your comparison list.`,
        });
        return prev;
      }

      if (prev.length >= MAX_COMPARISON_ITEMS) {
        toast({
          title: "Comparison limit reached",
          description: `You can compare up to ${MAX_COMPARISON_ITEMS} products. Remove one to add more.`,
          variant: "destructive",
        });
        return prev;
      }

      toast({
        title: "Added to comparison",
        description: `${product.title} has been added to comparison.`,
      });

      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: string) => {
    setItems((prev) => {
      const product = prev.find((p) => p.id === productId);
      if (product) {
        toast({
          title: "Removed from comparison",
          description: `${product.title} has been removed.`,
        });
      }
      return prev.filter((p) => p.id !== productId);
    });
  }, []);

  const clearComparison = useCallback(() => {
    setItems([]);
    toast({
      title: "Comparison cleared",
      description: "All products have been removed from comparison.",
    });
  }, []);

  const isInComparison = useCallback(
    (productId: string) => items.some((p) => p.id === productId),
    [items]
  );

  const canAddMore = items.length < MAX_COMPARISON_ITEMS;

  return (
    <ComparisonContext.Provider
      value={{
        items,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isInComparison,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};
