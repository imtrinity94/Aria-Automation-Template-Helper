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
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-2">
                <select
                    className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onChange={(e) => {
                        const sample = SAMPLES.find(s => s.name === e.target.value);
                        if (sample) onLoadSample(sample.code);
                    }}
                    defaultValue=""
                >
                    <option value="" disabled>Load Sample...</option>
                    {SAMPLES.map(s => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={onRender}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-sm shadow-indigo-500/30"
                >
                    <Play className="w-4 h-4" />
                    Render Diagram
                </button>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                <button
                    onClick={onDownloadYaml}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    title="Download YAML"
                >
                    <FileDown className="w-4 h-4" />
                    <span className="hidden sm:inline">YAML</span>
                </button>

                <button
                    onClick={onDownloadPng}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all"
                    title="Download PNG"
                >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">PNG</span>
                </button>
            </div>
        </div>
    );
}
