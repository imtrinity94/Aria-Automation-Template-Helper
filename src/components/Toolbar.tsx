import { Download, FileDown, Play } from 'lucide-react';
import { SAMPLES } from '@/data/sample-blueprints';

interface ToolbarProps {
    onRender: () => void;
    onDownloadYaml: () => void;
    onDownloadPng: () => void;
    onLoadSample: (code: string) => void;
}

export function Toolbar({ onRender, onDownloadYaml, onDownloadPng, onLoadSample }: ToolbarProps) {
    return (
        <div className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#20333a] flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-100 dark:bg-[#20333a]/50 border border-slate-200 dark:border-slate-800">
                    <select
                        className="bg-transparent text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors uppercase tracking-widest"
                        onChange={(e) => {
                            const sample = SAMPLES.find(s => s.name === e.target.value);
                            if (sample) onLoadSample(sample.code);
                        }}
                        defaultValue=""
                    >
                        <option value="" disabled className="bg-white dark:bg-[#20333a]">Select Template</option>
                        {SAMPLES.map(s => (
                            <option key={s.name} value={s.name} className="bg-white dark:bg-[#20333a] text-slate-700 dark:text-slate-300">{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={onRender}
                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-500/20 active:scale-95 transition-all uppercase tracking-widest"
                >
                    <Play className="w-3 h-3 fill-current" />
                    Sync
                </button>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

                <button
                    onClick={onDownloadYaml}
                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-[#20333a]/50 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-widest"
                    title="Download YAML"
                >
                    <FileDown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">YAML</span>
                </button>

                <button
                    onClick={onDownloadPng}
                    className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 active:scale-95 transition-all uppercase tracking-widest"
                    title="Download PNG"
                >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">PNG</span>
                </button>
            </div>
        </div>
    );
}
