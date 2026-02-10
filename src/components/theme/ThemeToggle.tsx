import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ThemeToggle = ({ variant = "default" }: { variant?: "default" | "compact" }) => {
  const { theme, setTheme } = useTheme();

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  if (variant === "compact") {
    return (
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun size={12} /> : <Moon size={12} />}
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
};

export default ThemeToggle;
