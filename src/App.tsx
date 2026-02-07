import { Routes, Route } from "react-router-dom";
import BuilderPage from "@/pages/Builder";
import DocumentationPage from "@/pages/Documentation";
import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

import { HeroShowcase } from "@/components/HeroShowcase";

function Home() {
  return (
    <Layout>
      <div className="flex flex-col lg:flex-row items-center min-h-[calc(100vh-64px)] px-6 lg:px-12 gap-12 overflow-hidden py-12 lg:py-0">
        {/* Left Side: Hero Content */}
        <div className="flex-1 text-left space-y-8 animate-in slide-in-from-left-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            OFFLINE TEMPLATE REFERENCE
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Visualize your <br />
            <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent italic">Infrastructure</span> <br />
            as Code.
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            The ultimate designer for VMware Cloud Foundation Automation.
            Build, visualize, and validate templates with an intelligent designer.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            <Link to="/templates" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group">
              Start Building Now
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link to="/docs" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-[#20333a] text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#2c434b] hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center justify-center">
              View Documentation
            </Link>
          </div>

          <div className="pt-8 grid grid-cols-3 gap-8 border-t border-slate-100 dark:border-slate-800">
            <div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">100%</div>
              <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Offline</div>
            </div>
            <div>
              <div className="text-2xl font-black text-violet-600 dark:text-violet-400">50+</div>
              <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Resources</div>
            </div>
            <div>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Low</div>
              <div className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Training</div>
            </div>
          </div>
        </div>

        {/* Right Side: Showcase */}
        <div className="flex-1 w-full lg:w-1/2 h-[600px] lg:h-[750px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
          <HeroShowcase />
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
