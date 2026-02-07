import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getResourceIcon } from '@/data/resource-icons';

export const ResourceNode = memo(({ data }: any) => {
    const [showMenu, setShowMenu] = useState(false);
    const iconName = getResourceIcon(data.originalType || '');
    const baseUrl = import.meta.env.BASE_URL || '/';
    const iconPath = `${baseUrl}resource-icons/${iconName}`;

    return (
        <div className={cn(
            "group relative flex items-center gap-4 px-6 py-5 min-w-[320px] bg-white dark:bg-[#20333a] rounded-xl border dark:border-2 border-slate-200 dark:border-white shadow-md hover:shadow-xl transition-all duration-200",
            data.isSelected && "ring-2 ring-indigo-500 border-indigo-500"
        )}>
            {/* Target handle on the left */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-2.5 h-2.5 !bg-slate-700 dark:!bg-white border-none"
            />

            <div className="flex items-center justify-center w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800/10 rounded-md p-1.5 border border-slate-100 dark:border-white/50">
                <img
                    src={iconPath}
                    alt={data.originalType}
                    title={`${data.originalType}: ${iconName}`}
                    className="w-full h-full object-contain pointer-events-none dark:icon-blue-tint"
                    onError={(e) => {
                        console.error('Failed to load icon:', iconPath);
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).src = `${baseUrl}resource-icons/compute_helper_allocation_compute.svg`;
                    }}
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="text-xl font-bold text-slate-800 dark:text-white truncate text-left tracking-tight">
                    {data.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-200 truncate uppercase mt-1 font-semibold tracking-wider text-left mb-2">
                    {data.label || data.originalType}
                </div>
                {data.constraints && data.constraints.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {data.constraints.map((tag: string, i: number) => (
                            <span
                                key={i}
                                className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 uppercase tracking-tight"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div
                className="text-slate-400 hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
            >
                <MoreVertical className="w-4 h-4" />
            </div>

            {showMenu && (
                <div className="absolute top-full right-0 mt-1 z-50 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            data.onDelete?.(data.name);
                            setShowMenu(false);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full whitespace-nowrap"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Resource
                    </button>
                </div>
            )}

            {/* Source handle on the right */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-2.5 h-2.5 !bg-slate-700 dark:!bg-white border-none"
            />
        </div>
    );
});
