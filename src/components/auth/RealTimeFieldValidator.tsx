import { useMemo } from "react";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RealTimeFieldValidatorProps {
  value: string;
  fieldType: "name" | "email" | "confirmPassword";
  compareValue?: string; // for confirmPassword
  show?: boolean;
}

const RealTimeFieldValidator = ({ value, fieldType, compareValue, show = true }: RealTimeFieldValidatorProps) => {
  const validation = useMemo(() => {
    if (!value) return null;

    switch (fieldType) {
      case "name": {
        const trimmed = value.trim();
        if (trimmed.length < 2) return { valid: false, message: "Name too short (min 2 chars)" };
        if (trimmed.length > 50) return { valid: false, message: "Name too long (max 50 chars)" };
        return { valid: true, message: "Name looks good" };
      }
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) return { valid: false, message: "Invalid email format" };
        return { valid: true, message: "Valid email" };
      }
      case "confirmPassword": {
        if (!compareValue) return null;
        if (value !== compareValue) return { valid: false, message: "Passwords don't match" };
        return { valid: true, message: "Passwords match" };
      }
      default:
        return null;
    }
  }, [value, fieldType, compareValue]);

  if (!show || !validation) return null;

  return (
    <div className={cn(
      "flex items-center gap-1 text-[11px] mt-0.5 animate-in fade-in duration-150",
      validation.valid ? "text-emerald-500" : "text-destructive"
    )}>
      {validation.valid ? (
        <Check className="h-3 w-3 shrink-0" />
      ) : (
        <AlertCircle className="h-3 w-3 shrink-0" />
      )}
      {validation.message}
    </div>
  );
};

export default RealTimeFieldValidator;
