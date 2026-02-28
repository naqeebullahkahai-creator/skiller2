import { cn } from "@/lib/utils";

interface FanzonLogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  iconOnly?: boolean;
}

const FanzonLogo = ({ className, textClassName, size = "md", showText = true, iconOnly = false }: FanzonLogoProps) => {
  const sizeConfig = {
    sm: { text: "text-lg", icon: "h-6 w-6", gap: "gap-1.5" },
    md: { text: "text-xl md:text-2xl", icon: "h-8 w-8", gap: "gap-2" },
    lg: { text: "text-2xl md:text-3xl", icon: "h-10 w-10", gap: "gap-2.5" },
  };

  const config = sizeConfig[size];

  if (iconOnly) {
    return (
      <img
        src="/fanzoon-icon.png"
        alt="FANZOON"
        className={cn(config.icon, "object-contain", className)}
      />
    );
  }

  return (
    <div className={cn("inline-flex items-center", config.gap, className)}>
      <img
        src="/fanzoon-icon.png"
        alt="FANZOON"
        className={cn(config.icon, "object-contain flex-shrink-0")}
      />
      {showText && (
        <span className={cn(
          "font-display font-bold tracking-tight leading-none",
          config.text,
          textClassName
        )}>
          FANZOON
        </span>
      )}
    </div>
  );
};

export default FanzonLogo;
