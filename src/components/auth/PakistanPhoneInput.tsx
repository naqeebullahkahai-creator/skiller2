import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PakistanPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

/**
 * Phone input with 🇵🇰 +92 prefix. Accepts 10 digits after the code.
 * Stores the full number as +923XXXXXXXXX.
 */
const PakistanPhoneInput = ({ value, onChange, error, className }: PakistanPhoneInputProps) => {
  // Strip +92 prefix for display
  const displayValue = value.startsWith("+92") ? value.slice(3) : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(raw ? `+92${raw}` : "");
  };

  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "flex items-center h-12 rounded-md border bg-secondary border-border focus-within:border-primary transition-colors overflow-hidden",
          error && "border-destructive",
          className
        )}
      >
        {/* Country prefix */}
        <div className="flex items-center gap-1.5 pl-3 pr-2 border-r border-border h-full bg-muted/50 select-none shrink-0">
          <span className="text-base leading-none">🇵🇰</span>
          <span className="text-sm font-medium text-foreground">+92</span>
        </div>
        {/* Number input */}
        <Input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="3XX XXXXXXX"
          value={displayValue}
          onChange={handleChange}
          className="border-0 h-full text-base bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 touch-target"
        />
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
};

export default PakistanPhoneInput;
