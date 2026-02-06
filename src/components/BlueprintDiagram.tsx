import { useEffect, useMemo } from 'react';
import {
    ReactFlow,
    type Node,
    type Edge,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@/hooks/useTheme';
import { ResourceNode } from './ResourceNode';

interface BlueprintDiagramProps {
    nodes: Node[];
    edges: Edge[];
}

export function BlueprintDiagram({ nodes: initialNodes, edges: initialEdges }: BlueprintDiagramProps) {
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({
        resourceNode: ResourceNode
    }), []);

    // Update flow state when props change (re-layout happens in parent, here we just sync)
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <div className="h-full w-full bg-[#f8fafc] dark:bg-slate-950" id="diagram-container">
            <div className="h-10 px-4 flex items-center bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Topology Diagram
            </div>
            <div className="h-[calc(100%-40px)]">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    connectionMode={ConnectionMode.Loose}
                    attributionPosition="bottom-right"
                    defaultEdgeOptions={{
                        type: 'step',
                        style: { stroke: '#475569', strokeWidth: 2 },
                    }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        color={theme === 'dark' ? '#334155' : '#cbd5e1'}
                        gap={20}
                        size={1}
                    />
                    <Controls className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 fill-slate-500 dark:fill-slate-400" />
                </ReactFlow>
            </div>
        </div>
    );
}
