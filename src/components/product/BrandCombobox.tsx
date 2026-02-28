import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBrands, useCreateBrand } from "@/hooks/useBrands";

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
}

const BrandCombobox = ({ value, onChange }: BrandComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data: brands = [], isLoading } = useBrands();
  const createBrand = useCreateBrand();

  const filtered = useMemo(() => {
    if (!search) return brands;
    const s = search.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(s));
  }, [brands, search]);

  const showAddOption = search.trim() && !brands.some(
    (b) => b.name.toLowerCase() === search.trim().toLowerCase()
  );

  const handleAdd = async () => {
    const name = search.trim();
    if (!name) return;
    await createBrand.mutateAsync(name);
    onChange(name);
    setSearch("");
    setOpen(false);
  };

  const selectedLabel = value || "Select brand";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          <span className="truncate">{selectedLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search or type new brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            autoFocus
          />
        </div>
        <div className="max-h-48 overflow-y-auto">
          {isLoading && (
            <p className="text-sm text-muted-foreground p-2">Loading...</p>
          )}
          {filtered.map((brand) => (
            <button
              key={brand.id}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent cursor-pointer",
                value === brand.name && "bg-accent"
              )}
              onClick={() => {
                onChange(brand.name);
                setSearch("");
                setOpen(false);
              }}
            >
              <Check
                className={cn("h-4 w-4", value === brand.name ? "opacity-100" : "opacity-0")}
              />
              {brand.name}
            </button>
          ))}
          {showAddOption && (
            <button
              className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent text-primary font-medium cursor-pointer border-t"
              onClick={handleAdd}
              disabled={createBrand.isPending}
            >
              <Plus className="h-4 w-4" />
              Add "{search.trim()}"
            </button>
          )}
          {!isLoading && filtered.length === 0 && !showAddOption && (
            <p className="text-sm text-muted-foreground p-3">No brands found</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BrandCombobox;
