import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
  show?: boolean;
}

interface StrengthCheck {
  label: string;
  met: boolean;
}

const getStrengthChecks = (password: string): StrengthCheck[] => [
  { label: "At least 6 characters", met: password.length >= 6 },
  { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
  { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
  { label: "Contains a number", met: /[0-9]/.test(password) },
  { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
];

type StrengthLevel = "weak" | "fair" | "good" | "strong";

const getStrengthLevel = (score: number): { level: StrengthLevel; label: string; color: string } => {
  if (score <= 1) return { level: "weak", label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { level: "fair", label: "Fair", color: "bg-amber-500" };
  if (score <= 3) return { level: "good", label: "Good", color: "bg-yellow-500" };
  return { level: "strong", label: "Strong", color: "bg-emerald-500" };
};

const PasswordStrengthMeter = ({ password, show = true }: PasswordStrengthMeterProps) => {
  const checks = useMemo(() => getStrengthChecks(password), [password]);
  const score = useMemo(() => checks.filter((c) => c.met).length, [checks]);
  const strength = useMemo(() => getStrengthLevel(score), [score]);

  if (!show || !password) return null;

  return (
    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
      {/* Strength Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                i <= score ? strength.color : "bg-muted"
              )}
            />
          ))}
        </div>
        <span
          className={cn(
            "text-xs font-semibold min-w-[48px] text-right",
            strength.level === "weak" && "text-destructive",
            strength.level === "fair" && "text-amber-500",
            strength.level === "good" && "text-yellow-600",
            strength.level === "strong" && "text-emerald-500"
          )}
        >
          {strength.label}
        </span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-1 gap-0.5">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-1.5">
            {check.met ? (
              <Check className="h-3 w-3 text-emerald-500 shrink-0" />
            ) : (
              <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
            )}
            <span
              className={cn(
                "text-[11px] transition-colors",
                check.met ? "text-emerald-600" : "text-muted-foreground/60"
              )}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
