import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight } from 'lucide-react';
import snippetsData from "@/data/snippets.json";
import { getResourceIcon } from '@/data/resource-icons';

interface ResourcePaletteProps {
    onAddResource: (snippet: string) => void;
}

type Snippet = {
    prefix: string;
    body: string[];
    description: string;
};

export function ResourcePalette({ onAddResource }: ResourcePaletteProps) {
    const [search, setSearch] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
        "Cloud Agnostic": true,
        "Allocation Helpers": true
    });

    const categories = useMemo(() => {
        const grouped: Record<string, Snippet[]> = {};
        Object.entries(snippetsData).forEach(([_, snippet]) => {
            const cat = snippet.description || "Other";
            if (!grouped[cat]) grouped[cat] = [];
            grouped[cat].push(snippet as Snippet);
        });
        return grouped;
    }, []);

    const filteredCategories = useMemo(() => {
        if (!search) return categories;
        const filtered: Record<string, Snippet[]> = {};
        Object.entries(categories).forEach(([cat, list]) => {
            const matches = list.filter(s =>
                s.prefix.toLowerCase().includes(search.toLowerCase()) ||
                cat.toLowerCase().includes(search.toLowerCase())
            );
            if (matches.length > 0) filtered[cat] = matches;
        });
        return filtered;
    }, [categories, search]);

    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [cat]: !prev[cat]
        }));
    };



    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 select-none overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Resource Palette</span>
            </div>

            {/* Search Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
                <div className="relative group text-left">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700/50 rounded py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-200"
                    />
                </div>
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {Object.entries(filteredCategories).sort().map(([cat, list]) => (
                    <div key={cat} className="group/cat text-left">
                        <button
                            onClick={() => toggleCategory(cat)}
                            className="flex items-center gap-2 w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 border-b border-slate-100 dark:border-slate-800/30"
                        >
                            <div className="w-4 h-4 flex items-center justify-center">
                                {expandedCategories[cat] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </div>
                            {cat}
                        </button>

                        {expandedCategories[cat] && (
                            <div className="py-1 bg-slate-50/30 dark:bg-slate-900/20">
                                {list.map((snippet) => {
                                    const iconName = getResourceIcon(snippet.prefix);
                                    const baseUrl = import.meta.env.BASE_URL || '/';

                                    return (
                                        <button
                                            key={snippet.prefix}
                                            onClick={() => onAddResource(snippet.body.join('\n'))}
                                            className="flex items-center gap-3 w-full px-8 py-2 hover:bg-slate-100 dark:hover:bg-indigo-500/10 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all text-xs group/item text-left relative overflow-hidden"
                                        >
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 scale-y-0 group-hover/item:scale-y-100 transition-transform origin-top" />
                                            <div className="w-5 h-5 flex items-center justify-center bg-slate-200/50 dark:bg-slate-800/50 rounded p-1 group-hover/item:bg-indigo-100 dark:group-hover/item:bg-indigo-500/20 transition-colors">
                                                <img
                                                    src={`${baseUrl}resource-icons/${iconName}`}
                                                    alt=""
                                                    className="w-3.5 h-3.5 object-contain"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <span className="truncate font-medium">{snippet.prefix.split('.').pop()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
