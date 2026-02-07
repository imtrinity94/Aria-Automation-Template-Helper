import { useEffect, useState } from 'react';
import { BlueprintDiagram } from './BlueprintDiagram';
import { parseBlueprint } from '@/lib/blueprint-parser';
import { type Node, type Edge } from '@xyflow/react';

const DEMO_BLUEPRINT = `name: Demo Infrastructure
version: 1.0
description: Sample VCF Template

resources:
  network:
    type: Cloud.Network
    properties:
      name: app-network
      
  vm-web:
    type: Cloud.Machine
    properties:
      name: web-server
      image: ubuntu
    dependsOn:
      - network`;

export function HeroShowcase() {
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    useEffect(() => {
        const result = parseBlueprint(DEMO_BLUEPRINT);
        setNodes(result.nodes);
        setEdges(result.edges);
    }, []);

    const escapeHtml = (str: string) =>
        str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const highlightYaml = (yaml: string) => {
        let s = escapeHtml(yaml);

        // Highlight resource types like Cloud.Network
        s = s.replace(/(Cloud\.[A-Za-z0-9_.-]+)/g, '<span class="text-violet-600 font-medium">$1</span>');

        // Highlight keys (ending with colon)
        s = s.replace(/^(\s*)([a-zA-Z0-9_-]+:)/gm, '$1<span class="text-indigo-600 font-semibold">$2</span>');

        // Highlight values (after colon) for remaining unstyled values
        s = s.replace(/(:\s*)([^\n\r<]+)/g, (m, p1, p2) => {
            // If value already contains a span, leave it
            if (p2.includes('<span')) return p1 + p2;
            return p1 + '<span class="text-emerald-700">' + p2 + '</span>';
        });

        return s;
    };

    return (
        <div className="relative w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-2xl">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-grid-slate-200 dark:bg-grid-slate-700/25 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.05))]" />

            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Diagram container */}
            <div className="relative w-full h-full p-4 flex flex-col gap-3">
                {/* YAML Code Block */}
                <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden" style={{ height: '35%' }}>
                    <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 ml-1">
                            blueprint.yaml
                        </span>
                    </div>

                                        <div className="pt-8 px-4 pb-3 h-full overflow-auto">
                                                <pre className="text-[10px] md:text-sm leading-relaxed font-mono text-slate-800 dark:text-slate-300">
                                                        <code dangerouslySetInnerHTML={{ __html: highlightYaml(DEMO_BLUEPRINT) }} />
                                                </pre>
                                        </div>
                </div>

                {/* Diagram */}
                <div className="relative flex-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden bg-slate-50 dark:bg-[#0F172A]">
                    <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
                        <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300 ml-1">
                            diagram.view
                        </span>
                    </div>

                    <div className="w-full h-full pt-8">
                        <BlueprintDiagram
                            nodes={nodes}
                            edges={edges}
                            onDeleteNode={() => { }}
                        />
                    </div>
                </div>
            </div>

            {/* Floating badge */}
            <div className="absolute bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold text-sm">Live Preview</span>
            </div>
        </div>
    );
}
