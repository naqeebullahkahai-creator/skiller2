import { HeroBanner } from "@/hooks/useMarketing";

export const SIZE_MAP: Record<string, string> = {
  sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl",
  "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl",
  "5xl": "text-5xl", "6xl": "text-6xl",
};

export const getGradientCSS = (banner: HeroBanner) => {
  const dir = banner.gradient_direction || "to-t";
  if (dir === "none") return "transparent";
  const dirMap: Record<string, string> = {
    "to-t": "to top", "to-b": "to bottom", "to-l": "to left",
    "to-r": "to right", "to-br": "to bottom right", "to-bl": "to bottom left",
  };
  const color = banner.overlay_color || "#000000";
  const opacity = Math.round((banner.overlay_opacity ?? 0.4) * 255).toString(16).padStart(2, "0");
  return `linear-gradient(${dirMap[dir] || "to top"}, ${color}${opacity}, transparent)`;
};

export const getAnimationClass = (animation?: string, isActive?: boolean) => {
  if (!isActive || !animation || animation === "none") return "";
  const map: Record<string, string> = {
    fade: "animate-fade-in",
    "slide-up": "animate-[slideUp_0.6s_ease-out]",
    "slide-left": "animate-[slideLeft_0.6s_ease-out]",
    "slide-right": "animate-[slideRight_0.6s_ease-out]",
    zoom: "animate-[zoomIn_0.5s_ease-out]",
    bounce: "animate-[bounceIn_0.8s_ease-out]",
    typewriter: "animate-[typewriter_1s_steps(20)]",
    glow: "animate-[glowPulse_2s_ease-in-out_infinite]",
    shake: "animate-[shake_0.6s_ease-in-out]",
  };
  return map[animation] || "";
};

export const getAlignmentClass = (alignment?: string) => {
  if (alignment === "center") return "items-center text-center";
  if (alignment === "right") return "items-end text-right";
  return "items-start text-left";
};

export const getTitleStyle = (banner: HeroBanner): React.CSSProperties => ({
  fontFamily: `'${banner.title_font || "Inter"}', sans-serif`,
  color: banner.title_color || "#FFFFFF",
  fontWeight: banner.title_bold !== false ? 700 : 400,
});

export const getSubtitleStyle = (banner: HeroBanner): React.CSSProperties => ({
  fontFamily: `'${banner.subtitle_font || "Inter"}', sans-serif`,
  color: banner.subtitle_color || "#FFFFFF",
  fontWeight: banner.subtitle_bold ? 700 : 400,
});
