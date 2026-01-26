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
      
      {/* Amazon-style curved arrow from F to N */}
      <svg
        viewBox="0 0 70 14"
        width={config.arrow.width}
        height={config.arrow.height}
        className="mt-[-2px]"
        aria-hidden="true"
      >
        {/* Curved arrow path - using orange accent color */}
        <path
          d="M5 8 Q35 16 62 6"
          fill="none"
          stroke="hsl(var(--chart-4))"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <polygon
          points="58,2 65,6 58,9"
          fill="hsl(var(--chart-4))"
        />
      </svg>
    </div>
  );
};

export default FanzonLogo;
