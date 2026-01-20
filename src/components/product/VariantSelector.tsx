import { cn } from "@/lib/utils";
import { ProductVariant } from "@/hooks/useProductVariants";

interface VariantSelectorProps {
  groupedVariants: Record<string, ProductVariant[]>;
  selectedVariants: Record<string, ProductVariant | null>;
  onVariantSelect: (variantName: string, variant: ProductVariant) => void;
}

// Common colors mapping for color variants
const COLOR_MAP: Record<string, string> = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  orange: "bg-orange-500",
  purple: "bg-purple-500",
  pink: "bg-pink-500",
  black: "bg-gray-900",
  white: "bg-white border-2 border-gray-300",
  gray: "bg-gray-500",
  grey: "bg-gray-500",
  brown: "bg-amber-800",
  navy: "bg-blue-900",
  beige: "bg-amber-100",
  gold: "bg-yellow-500",
  silver: "bg-gray-400",
  cream: "bg-amber-50",
  maroon: "bg-red-900",
  teal: "bg-teal-500",
  cyan: "bg-cyan-500",
};

const VariantSelector = ({
  groupedVariants,
  selectedVariants,
  onVariantSelect,
}: VariantSelectorProps) => {
  const isColorVariant = (variantName: string) => {
    return variantName.toLowerCase().includes("color") || 
           variantName.toLowerCase().includes("colour");
  };

  const getColorClass = (value: string): string | null => {
    const normalizedValue = value.toLowerCase().trim();
    return COLOR_MAP[normalizedValue] || null;
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedVariants).map(([variantName, variants]) => {
        const isColor = isColorVariant(variantName);
        const selectedVariant = selectedVariants[variantName];

        return (
          <div key={variantName}>
            <label className="text-sm font-medium mb-2 block">
              {variantName}
              {selectedVariant && (
                <span className="text-muted-foreground ml-2">
                  : {selectedVariant.variant_value}
                  {selectedVariant.additional_price_pkr > 0 && (
                    <span className="text-primary ml-1">
                      (+Rs. {selectedVariant.additional_price_pkr.toLocaleString()})
                    </span>
                  )}
                </span>
              )}
            </label>

            <div className="flex flex-wrap gap-2">
              {variants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                const isOutOfStock = variant.stock_count === 0;
                const colorClass = isColor ? getColorClass(variant.variant_value) : null;

                if (isColor && colorClass) {
                  // Color swatch
                  return (
                    <button
                      key={variant.id}
                      onClick={() => !isOutOfStock && onVariantSelect(variantName, variant)}
                      disabled={isOutOfStock}
                      title={`${variant.variant_value}${isOutOfStock ? " (Out of Stock)" : ""}${variant.additional_price_pkr > 0 ? ` (+Rs. ${variant.additional_price_pkr.toLocaleString()})` : ""}`}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all relative",
                        colorClass,
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        isOutOfStock && "opacity-40 cursor-not-allowed after:content-[''] after:absolute after:inset-0 after:bg-transparent after:border-2 after:border-destructive after:rounded-full after:rotate-45 after:bg-gradient-to-tr after:from-transparent after:via-destructive/30 after:to-transparent"
                      )}
                    >
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                }

                // Regular chip/button variant
                return (
                  <button
                    key={variant.id}
                    onClick={() => !isOutOfStock && onVariantSelect(variantName, variant)}
                    disabled={isOutOfStock}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary",
                      isOutOfStock && "opacity-40 cursor-not-allowed line-through decoration-destructive"
                    )}
                  >
                    {variant.variant_value}
                    {variant.additional_price_pkr > 0 && (
                      <span className="ml-1 text-xs">
                        +Rs. {variant.additional_price_pkr.toLocaleString()}
                      </span>
                    )}
                    {isOutOfStock && (
                      <span className="ml-1 text-xs">(Out)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VariantSelector;
