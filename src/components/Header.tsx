import { ThemeToggle } from "./ThemeToggle";
import { Link } from "react-router-dom";

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0F171C] backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-6">
                    <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                        <img src="/logo.svg" alt="VCF Logo" className="h-8 w-8" />
                        <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-100 bg-clip-text text-transparent">VCF Automation Template Builder</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-200">
                        <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Home</Link>
                        <Link to="/templates" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Templates</Link>
                        <Link to="/docs" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Documentation</Link>
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
