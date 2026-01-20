import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface LocalVariant {
  id: string;
  variant_name: string;
  variant_value: string;
  additional_price_pkr: number;
  stock_count: number;
}

interface VariantManagerProps {
  variants: LocalVariant[];
  onChange: (variants: LocalVariant[]) => void;
}

const VARIANT_TYPES = [
  "Size",
  "Color",
  "Material",
  "Style",
  "Weight",
  "Capacity",
  "Length",
  "Custom",
];

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const COLOR_PRESETS = ["Black", "White", "Red", "Blue", "Green", "Navy", "Gray", "Brown", "Beige", "Pink"];

const VariantManager = ({ variants, onChange }: VariantManagerProps) => {
  const [newVariant, setNewVariant] = useState<Omit<LocalVariant, "id">>({
    variant_name: "",
    variant_value: "",
    additional_price_pkr: 0,
    stock_count: 0,
  });
  const [customVariantName, setCustomVariantName] = useState("");

  const generateId = () => `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const handleAddVariant = () => {
    const variantName = newVariant.variant_name === "Custom" ? customVariantName : newVariant.variant_name;
    
    if (!variantName || !newVariant.variant_value) return;

    const variant: LocalVariant = {
      id: generateId(),
      variant_name: variantName,
      variant_value: newVariant.variant_value,
      additional_price_pkr: newVariant.additional_price_pkr,
      stock_count: newVariant.stock_count,
    };

    onChange([...variants, variant]);
    setNewVariant({
      variant_name: variantName, // Keep the same type for easier bulk adding
      variant_value: "",
      additional_price_pkr: 0,
      stock_count: 0,
    });
  };

  const handleRemoveVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  const handleUpdateVariant = (id: string, field: keyof LocalVariant, value: string | number) => {
    onChange(
      variants.map((v) =>
        v.id === id ? { ...v, [field]: value } : v
      )
    );
  };

  const getPresets = (variantName: string) => {
    if (variantName.toLowerCase() === "size") return SIZE_PRESETS;
    if (variantName.toLowerCase() === "color") return COLOR_PRESETS;
    return [];
  };

  // Group existing variants by name for display
  const groupedVariants = variants.reduce((acc, variant) => {
    if (!acc[variant.variant_name]) {
      acc[variant.variant_name] = [];
    }
    acc[variant.variant_name].push(variant);
    return acc;
  }, {} as Record<string, LocalVariant[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Product Variants</Label>
        <span className="text-xs text-muted-foreground">
          {variants.length} variant(s) added
        </span>
      </div>

      {/* Add New Variant Form */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-4">
        <h4 className="font-medium text-sm">Add Variant</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">Variant Type</Label>
            <Select
              value={newVariant.variant_name}
              onValueChange={(value) => setNewVariant({ ...newVariant, variant_name: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {VARIANT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newVariant.variant_name === "Custom" && (
            <div className="space-y-2">
              <Label className="text-xs">Custom Type Name</Label>
              <Input
                placeholder="e.g., Flavor, Storage"
                value={customVariantName}
                onChange={(e) => setCustomVariantName(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Presets for Size/Color */}
        {getPresets(newVariant.variant_name).length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Quick Add</Label>
            <div className="flex flex-wrap gap-2">
              {getPresets(newVariant.variant_name).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setNewVariant({ ...newVariant, variant_value: preset })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    newVariant.variant_value === preset
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border hover:border-primary"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label className="text-xs">Value *</Label>
            <Input
              placeholder="e.g., Large"
              value={newVariant.variant_value}
              onChange={(e) => setNewVariant({ ...newVariant, variant_value: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Additional Price (PKR)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
                Rs.
              </span>
              <Input
                type="number"
                placeholder="0"
                className="pl-10"
                value={newVariant.additional_price_pkr || ""}
                onChange={(e) =>
                  setNewVariant({ ...newVariant, additional_price_pkr: Number(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Stock *</Label>
            <Input
              type="number"
              placeholder="0"
              value={newVariant.stock_count || ""}
              onChange={(e) =>
                setNewVariant({ ...newVariant, stock_count: Number(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">&nbsp;</Label>
            <Button
              type="button"
              onClick={handleAddVariant}
              disabled={
                (!newVariant.variant_name || (newVariant.variant_name === "Custom" && !customVariantName)) ||
                !newVariant.variant_value
              }
              className="w-full gap-1"
            >
              <Plus size={16} />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Existing Variants List */}
      {Object.keys(groupedVariants).length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedVariants).map(([variantName, variantList]) => (
            <div key={variantName} className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">
                {variantName} ({variantList.length})
              </Label>
              <div className="space-y-2">
                {variantList.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card"
                  >
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground">Value</span>
                        <p className="font-medium text-sm">{variant.variant_value}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Additional Price</span>
                        <p className="font-medium text-sm">
                          {variant.additional_price_pkr > 0
                            ? `+Rs. ${variant.additional_price_pkr.toLocaleString()}`
                            : "—"}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Stock</span>
                        <Input
                          type="number"
                          className="h-8 mt-1"
                          value={variant.stock_count}
                          onChange={(e) =>
                            handleUpdateVariant(variant.id, "stock_count", Number(e.target.value) || 0)
                          }
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveVariant(variant.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {variants.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No variants added yet. Add variants like Size, Color, etc. to offer different options.
        </p>
      )}
    </div>
  );
};

export default VariantManager;
