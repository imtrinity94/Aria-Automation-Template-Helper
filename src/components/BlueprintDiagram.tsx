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
    BackgroundVariant,
    ReactFlowProvider,
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTheme } from '@/hooks/useTheme';
import { ResourceNode } from './ResourceNode';

interface BlueprintDiagramProps {
    nodes: Node[];
    edges: Edge[];
    onDeleteNode?: (id: string) => void;
}

function FlowInner({ nodes: initialNodes, edges: initialEdges, onDeleteNode }: BlueprintDiagramProps) {
    const { theme } = useTheme();
    const { fitView } = useReactFlow();
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

        // Auto-fit after a small delay to allow for rendering/layout
        const timer = setTimeout(() => {
            fitView({ padding: 0.05, duration: 400 });
        }, 100);
        return () => clearTimeout(timer);
    }, [initialNodes, initialEdges, onDeleteNode, setNodes, setEdges, fitView]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.05, maxZoom: 2 }}
            connectionMode={ConnectionMode.Loose}
            attributionPosition="bottom-right"
            colorMode={theme as 'light' | 'dark'}
            defaultEdgeOptions={{
                style: {
                    stroke: theme === 'dark' ? '#ffffff' : '#64748b',
                    strokeWidth: 4.0,
                },
            }}
        >
            <Background
                variant={BackgroundVariant.Dots}
                color={theme === 'dark' ? '#ffffff' : '#64748b'}
                gap={24}
                size={1.5}
            />
            <Controls />
        </ReactFlow>
    );
}

export function BlueprintDiagram(props: BlueprintDiagramProps) {
    return (
        <div className="h-full w-full bg-slate-50 dark:bg-[#20333a] flex flex-col overflow-hidden" id="diagram-container">
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-[#20333a] backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <span className="text-base font-bold text-slate-800 dark:text-slate-100">Topology Diagram</span>
            </div>
            <div className="flex-1 min-h-0 relative">
                <ReactFlowProvider>
                    <FlowInner {...props} />
                </ReactFlowProvider>
            </div>
        </div>
    );
}
