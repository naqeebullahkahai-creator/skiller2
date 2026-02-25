import { cn } from "@/lib/utils";

interface FanzonLogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

const FanzonLogo = ({ className, textClassName, size = "md" }: FanzonLogoProps) => {
  const sizeConfig = {
    sm: { text: "text-lg", icon: 20, gap: "gap-1.5" },
    md: { text: "text-xl md:text-2xl", icon: 26, gap: "gap-2" },
    lg: { text: "text-2xl md:text-3xl", icon: 32, gap: "gap-2.5" },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("inline-flex items-center", config.gap, className)}>
      {/* Logo Icon - Abstract "F" mark with layered shapes */}
      <svg
        viewBox="0 0 40 40"
        width={config.icon}
        height={config.icon}
        className="flex-shrink-0"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle cx="20" cy="20" r="20" fill="hsl(var(--primary))" />
        {/* Inner geometric "F" shape */}
        <path
          d="M12 10 L28 10 L28 15 L17 15 L17 18.5 L26 18.5 L26 23 L17 23 L17 30 L12 30 Z"
          fill="white"
          opacity="0.95"
        />
        {/* Accent dot */}
        <circle cx="30" cy="30" r="4" fill="hsl(var(--accent))" />
      </svg>
      
      {/* FANZOON Text */}
      <span className={cn(
        "font-display font-bold tracking-tight leading-none",
        config.text,
        textClassName
      )}>
        FANZOON
      </span>
    </div>
  );
};

export default FanzonLogo;
