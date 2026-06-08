import { cn } from "@/lib/utils";
import logoMark from "@/assets/fanzon-logo-mark.png";

interface FanzonLogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  iconOnly?: boolean;
}

const FanzonLogo = ({ className, textClassName, size = "md", showText = true, iconOnly = false }: FanzonLogoProps) => {
  const sizeConfig = {
    sm: { text: "text-lg", icon: "h-7 w-7", gap: "gap-2" },
    md: { text: "text-xl md:text-2xl", icon: "h-8 w-8", gap: "gap-2" },
    lg: { text: "text-2xl md:text-3xl", icon: "h-10 w-10", gap: "gap-2.5" },
  };

  const config = sizeConfig[size];

  if (iconOnly) {
    return (
      <img
        src={logoMark}
        alt="FANZON"
        className={cn(config.icon, "object-contain", className)}
        loading="lazy"
        width={1024}
        height={1024}
      />
    );
  }

  return (
    <div className={cn("inline-flex items-center group", config.gap, className)}>
      <img
        src={logoMark}
        alt="FANZON"
        className={cn(
          config.icon,
          "object-contain flex-shrink-0 drop-shadow-[0_0_12px_hsl(243_75%_59%/0.55)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
        )}
        loading="lazy"
        width={1024}
        height={1024}
      />
      {showText && (
        <span className={cn(
          "font-display font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary-glow",
          config.text,
          textClassName
        )}>
          FANZON
        </span>
      )}
    </div>
  );
};

export default FanzonLogo;
