export function Footer() {
    return (
        <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-8">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                <p>&copy; {new Date().getFullYear()} VCF Automation Builder. All rights reserved.</p>
                <p>Built with React 19, Vite, Tailwind</p>
            </div>
        </footer>
    );
}
