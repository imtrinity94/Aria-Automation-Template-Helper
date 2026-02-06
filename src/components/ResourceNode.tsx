import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getResourceIcon } from '@/data/resource-icons';

export const ResourceNode = memo(({ data }: any) => {
    const iconName = getResourceIcon(data.originalType || '');
    const iconPath = `/resource-icons/${iconName}`;

    return (
        <div className={cn(
            "group relative flex items-center gap-3 px-4 py-3 min-w-[240px] bg-white rounded-lg border-2 border-slate-700 shadow-md hover:shadow-lg transition-all duration-200",
            data.isSelected && "ring-2 ring-indigo-500 ring-offset-2"
        )}>
            {/* Target handle on the left */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-2 h-2 !bg-slate-700 border-none"
            />

            <div className="flex items-center justify-center w-10 h-10 shrink-0">
                <img
                    src={iconPath}
                    alt={data.originalType}
                    className="w-full h-full object-contain pointer-events-none"
                    onError={(e) => {
                        // Fallback if image fails to load
                        (e.target as HTMLImageElement).src = '/resource-icons/machine_helper_allocation_compute.svg';
                    }}
                />
            </div>

            <div className="flex-1 overflow-hidden">
                <div className="text-sm font-semibold text-slate-800 truncate">
                    {data.name}
                </div>
                <div className="text-[10px] text-slate-500 truncate uppercase mt-0.5 font-medium tracking-wide">
                    {data.label || data.originalType}
                </div>
            </div>

            <div className="text-slate-400 group-hover:text-slate-600 transition-colors cursor-pointer">
                <MoreVertical className="w-4 h-4" />
            </div>

            {/* Source handle on the right */}
            <Handle
                type="source"
                position={Position.Right}
                className="w-2 h-2 !bg-slate-700 border-none"
            />
        </div>
    );
});
