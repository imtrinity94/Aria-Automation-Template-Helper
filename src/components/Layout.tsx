import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Helmet } from "react-helmet-async";

interface LayoutProps {
    children?: ReactNode;
    title?: string;
    description?: string;
}

export function Layout({ children, title = "VCF Builder", description = "VCF Automation Template Builder" }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0F171C] text-slate-900 dark:text-slate-50 font-sans antialiased">
            <Helmet>
                <title>{title}</title>
                <meta name="description" content={description} />
            </Helmet>
            <Header />
            <main className="flex-1 w-full">
                <div className="container mx-auto px-4 py-8">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
}
