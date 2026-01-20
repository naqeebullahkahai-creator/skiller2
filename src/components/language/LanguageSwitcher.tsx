import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  variant?: "header" | "sidebar" | "compact";
  className?: string;
}

const languages: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو" },
];

const LanguageSwitcher = ({ variant = "header", className }: LanguageSwitcherProps) => {
  const { language, setLanguage, t, isRTL } = useLanguage();

  const currentLang = languages.find((l) => l.code === language);

  if (variant === "sidebar") {
    return (
      <div className={cn("space-y-1", className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
              language === lang.code
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground hover:bg-muted active:bg-muted/80"
            )}
          >
            <Globe size={20} className="text-muted-foreground" />
            <span className={cn(lang.code === "ur" && "font-urdu")}>
              {lang.nativeLabel}
            </span>
            {language === lang.code && (
              <span className="ms-auto text-primary">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary",
              className
            )}
          >
            <Globe size={16} />
            <span className={cn(language === "ur" && "font-urdu")}>
              {currentLang?.nativeLabel}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isRTL ? "start" : "end"} className="min-w-[120px]">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "cursor-pointer",
                language === lang.code && "bg-primary/10 text-primary font-medium"
              )}
            >
              <span className={cn(lang.code === "ur" && "font-urdu")}>
                {lang.nativeLabel}
              </span>
              {language === lang.code && (
                <span className="ms-auto">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Default header variant
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground gap-1",
            className
          )}
        >
          <Globe size={16} />
          <span className={cn(language === "ur" && "font-urdu")}>
            {currentLang?.nativeLabel}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? "start" : "end"} className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={cn(
              "cursor-pointer",
              language === lang.code && "bg-primary/10 text-primary font-medium"
            )}
          >
            <span className={cn(lang.code === "ur" && "font-urdu")}>
              {lang.nativeLabel}
            </span>
            {language === lang.code && (
              <span className="ms-auto">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
