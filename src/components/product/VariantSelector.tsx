import { useMemo } from "react";
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

  const isSizeVariant = (variantName: string) => {
    return variantName.toLowerCase().includes("size");
  };

  const getColorClass = (value: string): string | null => {
    const normalizedValue = value.toLowerCase().trim();
    return COLOR_MAP[normalizedValue] || null;
  };

  // Calculate unavailable variants based on cross-selection
  // e.g., if "Size L" is selected, grey out colors that have no stock for "Size L"
  const unavailableVariants = useMemo(() => {
    const unavailable = new Set<string>();
    
    // Get all variant types
    const variantTypes = Object.keys(groupedVariants);
    
    if (variantTypes.length < 2) {
      // No cross-variant validation needed for single variant type
      return unavailable;
    }

    // For each variant type, check if there's a valid combination with selected variants
    variantTypes.forEach((variantType) => {
      const otherSelectedVariants = Object.entries(selectedVariants)
        .filter(([key, val]) => key !== variantType && val !== null)
        .map(([key, val]) => ({ type: key, value: val?.variant_value }));

      if (otherSelectedVariants.length === 0) return;

      // For each variant in this type, check if there's stock when combined with other selections
      groupedVariants[variantType]?.forEach((variant) => {
        // Check if this specific combination exists with stock
        const hasValidCombination = checkCombinationStock(
          variant,
          otherSelectedVariants,
          groupedVariants
        );

        if (!hasValidCombination) {
          unavailable.add(`${variantType}:${variant.id}`);
        }
      });
    });

    return unavailable;
  }, [groupedVariants, selectedVariants]);

  // Helper function to check if a variant combination has stock
  const checkCombinationStock = (
    variant: ProductVariant,
    otherSelections: { type: string; value: string | undefined }[],
    allVariants: Record<string, ProductVariant[]>
  ): boolean => {
    // For simplicity, we check individual variant stock
    // A more sophisticated approach would track combined stock in a separate table
    if (variant.stock_count === 0) return false;

    // Check if all other selected variants have stock
    for (const selection of otherSelections) {
      const matchingVariant = allVariants[selection.type]?.find(
        (v) => v.variant_value === selection.value
      );
      if (matchingVariant && matchingVariant.stock_count === 0) {
        return false;
      }
    }

    return true;
  };

  return (
    <div className="space-y-4">
      {Object.entries(groupedVariants).map(([variantName, variants]) => {
        const isColor = isColorVariant(variantName);
        const isSize = isSizeVariant(variantName);
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
                const isUnavailable = unavailableVariants.has(`${variantName}:${variant.id}`);
                const isDisabled = isOutOfStock || isUnavailable;
                const colorClass = isColor ? getColorClass(variant.variant_value) : null;

                if (isColor && colorClass) {
                  // Color swatch
                  return (
                    <button
                      key={variant.id}
                      onClick={() => !isDisabled && onVariantSelect(variantName, variant)}
                      disabled={isDisabled}
                      title={`${variant.variant_value}${isOutOfStock ? " (Out of Stock)" : isUnavailable ? " (Unavailable)" : ""}${variant.additional_price_pkr > 0 ? ` (+Rs. ${variant.additional_price_pkr.toLocaleString()})` : ""}`}
                      className={cn(
                        "w-10 h-10 rounded-full transition-all relative",
                        colorClass,
                        isSelected && "ring-2 ring-primary ring-offset-2",
                        isDisabled && "opacity-40 cursor-not-allowed after:content-[''] after:absolute after:inset-0 after:bg-transparent after:border-2 after:border-destructive after:rounded-full after:rotate-45 after:bg-gradient-to-tr after:from-transparent after:via-destructive/30 after:to-transparent"
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
                    onClick={() => !isDisabled && onVariantSelect(variantName, variant)}
                    disabled={isDisabled}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border hover:border-primary",
                      isDisabled && "opacity-40 cursor-not-allowed line-through decoration-destructive"
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
                    {isUnavailable && !isOutOfStock && (
                      <span className="ml-1 text-xs">(N/A)</span>
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
