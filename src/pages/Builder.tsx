import { useState, useCallback } from 'react';
import yaml from 'js-yaml';
import { Layout } from "@/components/Layout";
import { BlueprintEditor } from "@/components/BlueprintEditor";
import { BlueprintDiagram } from "@/components/BlueprintDiagram";
import { Toolbar } from "@/components/Toolbar";
import { ResourcePalette } from "@/components/ResourcePalette";
import { parseBlueprint } from "@/lib/blueprint-parser";
import { type Node, type Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { SAMPLE_BLUEPRINT_COMPLEX } from '@/data/sample-blueprints';
import { Panel, Group, Separator } from "react-resizable-panels";

export default function BuilderPage() {
    const [yamlContent, setYamlContent] = useState<string>(SAMPLE_BLUEPRINT_COMPLEX);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);
    const [error, setError] = useState<string | undefined>();

    const handleRender = useCallback(() => {
        setError(undefined);
        const result = parseBlueprint(yamlContent);
        if (result.error) {
            setError(result.error);
        } else {
            setNodes(result.nodes);
            setEdges(result.edges);
        }
    }, [yamlContent]);

    // Initial render on mount
    useState(() => {
        const result = parseBlueprint(yamlContent);
        setNodes(result.nodes);
        setEdges(result.edges);
    });

    const handleDownloadYaml = () => {
        const blob = new Blob([yamlContent], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blueprint.yaml';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadPng = async () => {
        const el = document.getElementById('diagram-container');
        if (el) {
            try {
                const dataUrl = await toPng(el, { backgroundColor: '#fff' });
                const a = document.createElement('a');
                a.href = dataUrl;
                a.download = 'topology.png';
                a.click();
            } catch (err) {
                console.error('Failed to generate image', err);
            }
        }
    };

    const handleDeleteNode = useCallback((nodeId: string) => {
        try {
            const parsed = yaml.load(yamlContent) as any;
            if (parsed && parsed.resources && parsed.resources[nodeId]) {
                delete parsed.resources[nodeId];

                // Remove dependency references
                Object.values(parsed.resources).forEach((resource: any) => {
                    if (resource.dependsOn && Array.isArray(resource.dependsOn)) {
                        resource.dependsOn = resource.dependsOn.filter((dep: string) => dep !== nodeId);
                        if (resource.dependsOn.length === 0) delete resource.dependsOn;
                    }
                });

                const newYaml = yaml.dump(parsed, { indent: 2, noRefs: true });
                setYamlContent(newYaml);

                // Update diagram immediately
                const result = parseBlueprint(newYaml);
                setNodes(result.nodes);
                setEdges(result.edges);
            }
        } catch (err) {
            console.error('Failed to delete resource:', err);
            setError('Failed to update YAML after deletion');
        }
    }, [yamlContent, setYamlContent]);

    const handleAddResource = (snippet: string) => {
        setYamlContent(prev => {
            const hasResources = prev.includes('resources:');
            if (hasResources) {
                return prev + '\n' + snippet;
            } else {
                return prev + '\nresources:\n' + snippet;
            }
        });
        // Auto render after adding
        setTimeout(handleRender, 100);
    };

    return (
        <Layout title="Template Builder" description="Design VCF Automation Templates">
            <div className="fixed inset-0 top-16 bg-slate-50 dark:bg-[#0F171C] flex flex-col p-4 md:p-8 overflow-hidden">
                <div className="flex-1 w-full max-w-[95%] mx-auto bg-white dark:bg-[#20333a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden ring-1 ring-slate-200/50 dark:ring-slate-800/50">
                    <Toolbar
                        onRender={handleRender}
                        onDownloadYaml={handleDownloadYaml}
                        onDownloadPng={handleDownloadPng}
                        onLoadSample={(code) => {
                            setYamlContent(code);
                            const result = parseBlueprint(code);
                            setNodes(result.nodes);
                            setEdges(result.edges);
                        }}
                    />

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 text-sm border-b border-red-100 dark:border-red-900/50 flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-hidden">
                        <Group orientation="horizontal">
                            {/* Panel 1: Resource Palette */}
                            <Panel defaultSize={20} minSize={15}>
                                <ResourcePalette onAddResource={handleAddResource} />
                            </Panel>

                            <Separator className="w-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-col-resize flex items-center justify-center">
                                <div className="w-0.5 h-8 bg-slate-400 dark:bg-slate-600 rounded-full" />
                            </Separator>

                            {/* Panel 2: Diagram Canvas */}
                            <Panel defaultSize={50} minSize={30}>
                                <div className="h-full relative overflow-hidden">
                                    <BlueprintDiagram
                                        nodes={nodes}
                                        edges={edges}
                                        onDeleteNode={handleDeleteNode}
                                    />
                                </div>
                            </Panel>

                            <Separator className="w-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-col-resize flex items-center justify-center">
                                <div className="w-0.5 h-8 bg-slate-400 dark:bg-slate-600 rounded-full" />
                            </Separator>

                            {/* Panel 3: YAML Editor */}
                            <Panel defaultSize={30} minSize={20}>
                                <BlueprintEditor value={yamlContent} onChange={(v) => setYamlContent(v || '')} />
                            </Panel>
                        </Group>
                    </div>
                </div>
            </div>
        </Layout>
    );
}
