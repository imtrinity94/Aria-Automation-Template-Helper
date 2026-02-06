import { useState, useCallback } from 'react';
import { Layout } from "@/components/Layout";
import { BlueprintEditor } from "@/components/BlueprintEditor";
import { BlueprintDiagram } from "@/components/BlueprintDiagram";
import { Toolbar } from "@/components/Toolbar";
import { parseBlueprint } from "@/lib/blueprint-parser";
import { type Node, type Edge } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { SAMPLE_BLUEPRINT_COMPLEX } from '@/data/sample-blueprints';

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

    // Initial render on mount (optional, or wait for user)
    // Let's render immediately so they see something
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
            // Find the react-flow flow pane to capture
            // Usually the whole container is fine but we want to ensure we capture the canvas
            // html-to-image works well with DOM elements.
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

    return (
        <Layout title="Template Builder" description="Design VCF Automation Templates">
            <div className="flex flex-col h-[calc(100vh-140px)] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-900">
                <Toolbar
                    onRender={handleRender}
                    onDownloadYaml={handleDownloadYaml}
                    onDownloadPng={handleDownloadPng}
                    onLoadSample={(code) => {
                        setYamlContent(code);
                        // Auto render on load
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

                <div className="flex-1 flex overflow-hidden">
                    {/* Editor Pane */}
                    <div className="w-1/2 min-w-[300px]">
                        <BlueprintEditor value={yamlContent} onChange={(v) => setYamlContent(v || '')} />
                    </div>

                    {/* Diagram Pane */}
                    <div className="w-1/2 min-w-[300px] border-l border-slate-200 dark:border-slate-800 relative">
                        <BlueprintDiagram nodes={nodes} edges={edges} />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
