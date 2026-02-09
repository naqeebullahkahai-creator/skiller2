import { useState } from "react";
import { Paintbrush, Type, Palette, Sparkles, AlignLeft, AlignCenter, AlignRight, Bold, MousePointerClick } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { HeroBanner } from "@/hooks/useMarketing";
import { cn } from "@/lib/utils";

const FONTS = [
  "Inter", "Georgia", "Playfair Display", "Roboto", "Montserrat", "Oswald",
  "Poppins", "Raleway", "Lora", "Merriweather", "Nunito", "Ubuntu",
  "Bebas Neue", "Anton", "Lobster", "Righteous", "Pacifico", "Abril Fatface",
  "Dancing Script", "Permanent Marker", "Bangers", "Fredoka One", "Russo One",
  "Archivo Black", "Black Ops One", "Bungee", "Passion One", "Orbitron",
];

const SIZES = [
  { value: "sm", label: "Small" },
  { value: "base", label: "Base" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "XL" },
  { value: "2xl", label: "2XL" },
  { value: "3xl", label: "3XL" },
  { value: "4xl", label: "4XL" },
  { value: "5xl", label: "5XL" },
  { value: "6xl", label: "6XL" },
];

const ANIMATIONS = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade In" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom", label: "Zoom In" },
  { value: "bounce", label: "Bounce" },
  { value: "typewriter", label: "Typewriter" },
  { value: "glow", label: "Glow Pulse" },
  { value: "shake", label: "Shake" },
];

const GRADIENTS = [
  { value: "to-t", label: "Bottom → Top" },
  { value: "to-b", label: "Top → Bottom" },
  { value: "to-l", label: "Right → Left" },
  { value: "to-r", label: "Left → Right" },
  { value: "to-br", label: "Diagonal ↘" },
  { value: "to-bl", label: "Diagonal ↙" },
  { value: "none", label: "No Gradient" },
];

const SIZE_MAP: Record<string, string> = {
  sm: "text-sm", base: "text-base", lg: "text-lg", xl: "text-xl",
  "2xl": "text-2xl", "3xl": "text-3xl", "4xl": "text-4xl",
  "5xl": "text-5xl", "6xl": "text-6xl",
};

interface Props {
  banner: HeroBanner;
  onUpdate: (data: Partial<HeroBanner>) => void;
}

const BannerVisualEditor = ({ banner, onUpdate }: Props) => {
  const [localBanner, setLocalBanner] = useState<Partial<HeroBanner>>({
    subtitle: banner.subtitle || "",
    title_font: banner.title_font || "Inter",
    title_size: banner.title_size || "2xl",
    title_color: banner.title_color || "#FFFFFF",
    title_bold: banner.title_bold ?? true,
    subtitle_font: banner.subtitle_font || "Inter",
    subtitle_size: banner.subtitle_size || "base",
    subtitle_color: banner.subtitle_color || "#FFFFFF",
    subtitle_bold: banner.subtitle_bold ?? false,
    overlay_color: banner.overlay_color || "#000000",
    overlay_opacity: banner.overlay_opacity ?? 0.4,
    text_alignment: banner.text_alignment || "left",
    animation_type: banner.animation_type || "fade",
    button_text: banner.button_text || "",
    button_color: banner.button_color || "#F85606",
    button_text_color: banner.button_text_color || "#FFFFFF",
    gradient_direction: banner.gradient_direction || "to-t",
  });

  const update = (field: string, value: any) => {
    setLocalBanner(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onUpdate(localBanner);
  };

  const alignClass = localBanner.text_alignment === "center" ? "items-center text-center"
    : localBanner.text_alignment === "right" ? "items-end text-right" : "items-start text-left";

  const gradientDir = localBanner.gradient_direction === "to-b" ? "to bottom"
    : localBanner.gradient_direction === "to-l" ? "to left"
    : localBanner.gradient_direction === "to-r" ? "to right"
    : localBanner.gradient_direction === "to-br" ? "to bottom right"
    : localBanner.gradient_direction === "to-bl" ? "to bottom left"
    : localBanner.gradient_direction === "none" ? "none" : "to top";

  return (
    <div className="space-y-4">
      {/* Live Preview */}
      <Card className="overflow-hidden">
        <div className="relative aspect-[21/9]">
          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
          {gradientDir !== "none" && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(${gradientDir}, ${localBanner.overlay_color}${Math.round((localBanner.overlay_opacity ?? 0.4) * 255).toString(16).padStart(2, "0")}, transparent)`,
              }}
            />
          )}
          <div className={cn("absolute inset-0 flex flex-col justify-end p-6", alignClass)}>
            <h2
              style={{
                fontFamily: `'${localBanner.title_font}', sans-serif`,
                color: localBanner.title_color,
                fontWeight: localBanner.title_bold ? 700 : 400,
              }}
              className={cn(SIZE_MAP[localBanner.title_size || "2xl"], "drop-shadow-lg")}
            >
              {banner.title || "Banner Title"}
            </h2>
            {localBanner.subtitle && (
              <p
                style={{
                  fontFamily: `'${localBanner.subtitle_font}', sans-serif`,
                  color: localBanner.subtitle_color,
                  fontWeight: localBanner.subtitle_bold ? 700 : 400,
                }}
                className={cn(SIZE_MAP[localBanner.subtitle_size || "base"], "drop-shadow-md mt-1")}
              >
                {localBanner.subtitle}
              </p>
            )}
            {localBanner.button_text && (
              <button
                className="mt-3 px-5 py-2 rounded-md font-semibold text-sm shadow-lg"
                style={{ backgroundColor: localBanner.button_color, color: localBanner.button_text_color }}
              >
                {localBanner.button_text}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Editor Tabs */}
      <Tabs defaultValue="typography" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="typography"><Type className="w-4 h-4 mr-1" />Text</TabsTrigger>
          <TabsTrigger value="colors"><Palette className="w-4 h-4 mr-1" />Colors</TabsTrigger>
          <TabsTrigger value="animation"><Sparkles className="w-4 h-4 mr-1" />Animation</TabsTrigger>
          <TabsTrigger value="button"><MousePointerClick className="w-4 h-4 mr-1" />Button</TabsTrigger>
        </TabsList>

        {/* Typography */}
        <TabsContent value="typography" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Title Font</Label>
              <Select value={localBanner.title_font} onValueChange={v => update("title_font", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {FONTS.map(f => (
                    <SelectItem key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Title Size</Label>
              <Select value={localBanner.title_size} onValueChange={v => update("title_size", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs">Title Bold</Label>
            <Switch checked={localBanner.title_bold} onCheckedChange={v => update("title_bold", v)} />
          </div>

          <div>
            <Label className="text-xs">Subtitle Text</Label>
            <Input value={localBanner.subtitle || ""} onChange={e => update("subtitle", e.target.value)} placeholder="Optional subtitle..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Subtitle Font</Label>
              <Select value={localBanner.subtitle_font} onValueChange={v => update("subtitle_font", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {FONTS.map(f => (
                    <SelectItem key={f} value={f} style={{ fontFamily: `'${f}', sans-serif` }}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Subtitle Size</Label>
              <Select value={localBanner.subtitle_size} onValueChange={v => update("subtitle_size", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SIZES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs">Subtitle Bold</Label>
            <Switch checked={localBanner.subtitle_bold} onCheckedChange={v => update("subtitle_bold", v)} />
          </div>

          <div>
            <Label className="text-xs">Text Alignment</Label>
            <div className="flex gap-2 mt-1">
              {[
                { value: "left", icon: AlignLeft },
                { value: "center", icon: AlignCenter },
                { value: "right", icon: AlignRight },
              ].map(({ value, icon: Icon }) => (
                <Button
                  key={value}
                  variant={localBanner.text_alignment === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => update("text_alignment", value)}
                >
                  <Icon className="w-4 h-4" />
                </Button>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Colors */}
        <TabsContent value="colors" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Title Color</Label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={localBanner.title_color} onChange={e => update("title_color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <Input value={localBanner.title_color} onChange={e => update("title_color", e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Subtitle Color</Label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={localBanner.subtitle_color} onChange={e => update("subtitle_color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <Input value={localBanner.subtitle_color} onChange={e => update("subtitle_color", e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-xs">Overlay Color</Label>
            <div className="flex gap-2 mt-1">
              <input type="color" value={localBanner.overlay_color} onChange={e => update("overlay_color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
              <Input value={localBanner.overlay_color} onChange={e => update("overlay_color", e.target.value)} className="font-mono text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Overlay Opacity: {Math.round((localBanner.overlay_opacity ?? 0.4) * 100)}%</Label>
            <Slider
              value={[localBanner.overlay_opacity ?? 0.4]}
              min={0} max={1} step={0.05}
              onValueChange={([v]) => update("overlay_opacity", v)}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs">Gradient Direction</Label>
            <Select value={localBanner.gradient_direction} onValueChange={v => update("gradient_direction", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {GRADIENTS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </TabsContent>

        {/* Animation */}
        <TabsContent value="animation" className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Text Animation</Label>
            <Select value={localBanner.animation_type} onValueChange={v => update("animation_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ANIMATIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground">Animation plays when the banner slides into view.</p>
        </TabsContent>

        {/* Button */}
        <TabsContent value="button" className="space-y-4 mt-4">
          <div>
            <Label className="text-xs">Button Text (leave empty = no button)</Label>
            <Input value={localBanner.button_text || ""} onChange={e => update("button_text", e.target.value)} placeholder="e.g. Shop Now" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Button Color</Label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={localBanner.button_color} onChange={e => update("button_color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <Input value={localBanner.button_color} onChange={e => update("button_color", e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Button Text Color</Label>
              <div className="flex gap-2 mt-1">
                <input type="color" value={localBanner.button_text_color} onChange={e => update("button_text_color", e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
                <Input value={localBanner.button_text_color} onChange={e => update("button_text_color", e.target.value)} className="font-mono text-xs" />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="w-full">
        <Paintbrush className="w-4 h-4 mr-2" /> Save Visual Changes
      </Button>
    </div>
  );
};

export default BannerVisualEditor;
