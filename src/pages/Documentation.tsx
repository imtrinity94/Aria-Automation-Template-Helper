import { useState, useMemo } from 'react';
import { Layout } from "@/components/Layout";
import schemaData from "@/data/schema.json";
import { Search, Box, Info, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced Type definitions
interface SchemaProperty {
    type?: string;
    description?: string;
    title?: string;
    items?: SchemaProperty;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
    $ref?: string;
    enum?: string[];
    default?: any;
}

interface SchemaDefinition {
    description?: string;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
    title?: string;
    type?: string;
}

interface SchemaRoot {
    definitions: Record<string, SchemaDefinition>;
}

const fullSchema = schemaData as unknown as SchemaRoot;

const PropertyRow = ({
    name,
    details,
    required = false,
    depth = 0
}: {
    name: string,
    details: SchemaProperty,
    required?: boolean,
    depth?: number
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Determine if this property has nested structure to show
    const nestedProperties = details.properties || (details.items && details.items.properties);
    const isComplex = !!nestedProperties;
    const isArray = !!details.items;

    // Resolve the actual type label
    let typeLabel = details.type;
    if (details.$ref) typeLabel = details.$ref.split('.').pop();
    if (!typeLabel && details.items) typeLabel = 'array';
    if (!typeLabel && details.properties) typeLabel = 'object';

    return (
        <>
            <tr className={cn(
                "hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors",
                depth > 0 && "bg-slate-50/30 dark:bg-slate-800/10"
            )}>
                <td className="px-6 py-4 align-top">
                    <div className="flex items-start gap-2" style={{ paddingLeft: `${depth * 20}px` }}>
                        {isComplex && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-1 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500"
                            >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                            </button>
                        )}
                        {!isComplex && <span className="w-4 inline-block" />} {/* spacer for alignment */}

                        <div>
                            <div className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                                {name}
                            </div>
                            {required && (
                                <div className="text-[10px] uppercase text-red-500 font-bold tracking-wider mt-0.5">
                                    Required
                                </div>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 align-top">
                    <div className="flex flex-col gap-1 items-start">
                        <span className={cn(
                            "inline-block px-2 py-0.5 rounded text-xs font-medium border",
                            isComplex
                                ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                                : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        )}>
                            {typeLabel}
                            {isArray && '[]'}
                        </span>
                        {details.enum && (
                            <div className="text-xs text-slate-400 max-w-xs break-words">
                                <span className="font-semibold">Enum:</span> {details.enum.join(', ')}
                            </div>
                        )}
                        {details.default !== undefined && (
                            <div className="text-xs text-slate-400">
                                <span className="font-semibold">Default:</span> {String(details.default)}
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 align-top leading-relaxed text-sm">
                    {details.description || details.title || '-'}
                </td>
            </tr>

            {/* Nested Row */}
            {isExpanded && nestedProperties && (
                <tr>
                    <td colSpan={3} className="p-0 border-b border-slate-100 dark:border-slate-800">
                        <div className="w-full bg-slate-50/50 dark:bg-slate-900/30 border-y border-slate-100 dark:border-slate-800/50">
                            <table className="w-full text-left text-sm">
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {Object.entries(nestedProperties).map(([childName, childDetails]) => (
                                        <PropertyRow
                                            key={childName}
                                            name={childName}
                                            details={childDetails}
                                            required={details.required?.includes(childName) || details.items?.required?.includes(childName)}
                                            depth={depth + 1}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

export default function DocumentationPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedKey, setSelectedKey] = useState<string | null>('Cloud.Machine');

    const resourceTypes = useMemo(() => {
        const keys = Object.keys(fullSchema.definitions);
        return keys.filter(k =>
            (k.startsWith('Cloud.') || k.startsWith('Allocations.')) &&
            !k.includes('_')
        ).sort();
    }, []);

    const filteredTypes = useMemo(() => {
        if (!searchTerm) return resourceTypes;
        return resourceTypes.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [resourceTypes, searchTerm]);

    const selectedDef = selectedKey ? fullSchema.definitions[selectedKey] : null;

    return (
        <Layout title="Schema Documentation" description="vRA/VCF Automation YAML Property Reference">
            <div className="flex h-[calc(100vh-140px)] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">

                {/* Sidebar */}
                <div className="w-1/4 min-w-[250px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredTypes.map(type => (
                            <button
                                key={type}
                                onClick={() => setSelectedKey(type)}
                                className={cn(
                                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                                    selectedKey === type
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 font-medium"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                            >
                                <Box className="w-3.5 h-3.5 opacity-70" />
                                <span className="truncate">{type}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {selectedDef ? (
                        <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedKey}</h1>
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-500 border border-slate-200 dark:border-slate-700">
                                    {selectedDef.type || 'Object'}
                                </span>
                            </div>

                            {selectedDef.description && (
                                <p className="text-slate-600 dark:text-slate-400 mb-8 border-l-4 border-indigo-500 pl-4 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-r-lg">
                                    {selectedDef.description}
                                </p>
                            )}

                            <div className="mb-6">
                                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                                    <Info className="w-5 h-5 text-indigo-500" />
                                    Properties
                                </h2>

                                <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-6 py-3 font-medium text-slate-700 dark:text-slate-200 w-[250px]">Name</th>
                                                <th className="px-6 py-3 font-medium text-slate-700 dark:text-slate-200 w-[200px]">Type</th>
                                                <th className="px-6 py-3 font-medium text-slate-700 dark:text-slate-200">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {Object.entries(selectedDef.properties || {}).map(([propName, propDetails]) => (
                                                <PropertyRow
                                                    key={propName}
                                                    name={propName}
                                                    details={propDetails}
                                                    required={selectedDef.required?.includes(propName)}
                                                />
                                            ))}
                                            {Object.keys(selectedDef.properties || {}).length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">
                                                        No properties defined for this resource type.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <Box className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a resource type to view details</p>
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
}
