import { Routes, Route } from "react-router-dom";
import BuilderPage from "@/pages/Builder";
import DocumentationPage from "@/pages/Documentation";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
          VCF Automation Builder
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          Build cloud templates outside of vRA with a modern, intuitive designer.
          Visualize your infrastructure and generate code instantly.
        </p>
        <div className="flex gap-4">
          <Link to="/templates" className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center">
            Get Started
          </Link>
          <Link to="/docs" className="px-6 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center">
            Documentation
          </Link>
        </div>

        {/* Dynamic color tag demo */}
        <div className="flex gap-2 mt-8">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900">Blue Tag</span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">Emerald Tag</span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400 border border-orange-100 dark:border-orange-900">Orange Tag</span>
        </div>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/templates" element={<BuilderPage />} />
      <Route path="/docs" element={<DocumentationPage />} />
    </Routes>
  );
}

export default App;
