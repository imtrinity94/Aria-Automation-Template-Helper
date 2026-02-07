export function Footer() {
    return (
        <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <p>&copy; {new Date().getFullYear()} VCF Automation Builder. All rights reserved.</p>
                    <p>Built with React 19, Vite, Tailwind</p>
                </div>
                <div className="w-full border-t border-slate-200 dark:border-slate-800 my-6" />
                <div className="text-center space-y-2 max-w-3xl mx-auto">
                    <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                        Broadcom, the pulse logo, connecting everything, and VCF Automation are among the trademarks of Broadcom.
                    </p>
                    <p className="text-[10px] text-slate-400/70 dark:text-slate-500/70">
                        The term "Broadcom" refers to Broadcom Inc. and/or its subsidiaries.
                    </p>
                </div>
            </div>
        </footer>
    );
}
