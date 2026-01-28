import { cn } from "@/lib/utils";

interface FanzonLogoProps {
  className?: string;
  textClassName?: string;
  size?: "sm" | "md" | "lg";
}

const FanzonLogo = ({ className, textClassName, size = "md" }: FanzonLogoProps) => {
  const sizeConfig = {
    sm: { text: "text-lg", arrow: { width: 50, height: 10 } },
    md: { text: "text-xl md:text-2xl", arrow: { width: 70, height: 12 } },
    lg: { text: "text-2xl md:text-3xl", arrow: { width: 90, height: 14 } },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)}>
      {/* FANZON Text */}
      <span className={cn("font-bold tracking-tight leading-none", config.text, textClassName)}>
        FANZON
      </span>
      
      {/* Amazon-style smile arrow from F to N */}
      <svg
        viewBox="0 0 70 16"
        width={config.arrow.width}
        height={config.arrow.height}
        className="mt-[-3px]"
        aria-hidden="true"
      >
        {/* Smooth smile curve - Amazon style */}
        <path
          d="M3 4 Q35 14 58 4"
          fill="none"
          stroke="hsl(var(--fanzon-orange))"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Arrow head pointing right-up */}
        <path
          d="M54 6 L62 3 L56 10"
          fill="none"
          stroke="hsl(var(--fanzon-orange))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default FanzonLogo;
