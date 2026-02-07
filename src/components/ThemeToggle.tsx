import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                "p-2 rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800",
                className
            )}
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5 text-indigo-400" />
            ) : (
                <Moon className="h-5 w-5 text-indigo-400" />
            )}
        </button>
    );
}
