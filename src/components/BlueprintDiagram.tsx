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
    onDeleteNode?: (id: string) => void;
}

export function BlueprintDiagram({ nodes: initialNodes, edges: initialEdges, onDeleteNode }: BlueprintDiagramProps) {
    const { theme } = useTheme();
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const nodeTypes = useMemo(() => ({
        resourceNode: ResourceNode
    }), []);

    // Update flow state when props change
    useEffect(() => {
        const nodesWithActions = initialNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onDelete: onDeleteNode
            }
        }));
        setNodes(nodesWithActions);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, onDeleteNode, setNodes, setEdges]);

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden" id="diagram-container">
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Topology Diagram</span>
            </div>
            <div className="flex-1 min-h-0 relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    fitView
                    connectionMode={ConnectionMode.Loose}
                    attributionPosition="bottom-right"
                    colorMode={theme as 'light' | 'dark'}
                    defaultEdgeOptions={{
                        type: 'step',
                        style: {
                            stroke: theme === 'dark' ? '#94a3b8' : '#475569',
                            strokeWidth: 2
                        },
                    }}
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        color={theme === 'dark' ? '#334155' : '#cbd5e1'}
                        gap={20}
                        size={1}
                    />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}
