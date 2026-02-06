import yaml from 'js-yaml';
import * as dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';

// Standard vRA Resource Types to Icon/Color mapping (simplified)
const RESOURCE_STYLES: Record<string, { label: string; color: string }> = {
    'Cloud.Machine': { label: 'Machine', color: 'bg-blue-100 border-blue-500 text-blue-700' },
    'Cloud.Network': { label: 'Network', color: 'bg-green-100 border-green-500 text-green-700' },
    'Cloud.LoadBalancer': { label: 'Load Balancer', color: 'bg-purple-100 border-purple-500 text-purple-700' },
    'Cloud.vSphere.Machine': { label: 'vSphere Machine', color: 'bg-blue-100 border-blue-500 text-blue-700' },
    'Cloud.NSX.Network': { label: 'NSX Network', color: 'bg-green-100 border-green-500 text-green-700' },
    'Cloud.AWS.EC2.Instance': { label: 'AWS EC2', color: 'bg-orange-100 border-orange-500 text-orange-700' },
    'Cloud.Azure.Machine': { label: 'Azure VM', color: 'bg-sky-100 border-sky-500 text-sky-700' },
    'Cloud.GCP.Machine': { label: 'GCP VM', color: 'bg-yellow-100 border-yellow-500 text-yellow-700' },
};

export interface BlueprintParseResult {
    nodes: Node[];
    edges: Edge[];
    error?: string;
}

const nodeWidth = 220;
const nodeHeight = 80;

export const parseBlueprint = (yamlContent: string): BlueprintParseResult => {
    try {
        const parsed = yaml.load(yamlContent) as any;

        if (!parsed || typeof parsed !== 'object') {
            return { nodes: [], edges: [], error: 'Invalid YAML content' };
        }

        const resources = parsed.resources || {};
        const nodes: Node[] = [];
        const edges: Edge[] = [];
        const resourceKeys = Object.keys(resources);

        // 1. Create Nodes
        resourceKeys.forEach((key) => {
            const resource = resources[key];
            const type = resource.type || 'Unknown';
            const style = RESOURCE_STYLES[type] || { label: type, color: 'bg-slate-100 border-slate-500 text-slate-700' };

            nodes.push({
                id: key,
                type: 'default', // Using default for now, could be custom
                data: {
                    label: `${key} (${style.label})`,
                    originalType: type,
                    customStyle: style.color
                },
                position: { x: 0, y: 0 }, // Will be set by dagre
                style: {
                    width: nodeWidth,
                    border: '1px solid #777',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '12px',
                    background: 'white' // default, will be overridden by custom class logic if we used custom node
                },
                className: `${style.color} shadow-sm` // React Flow supports className
            });
        });

        // 2. Create Edges
        // Look for binding syntax: '${resource.TARGET_NAME.property}'
        resourceKeys.forEach((sourceKey) => {
            const resource = resources[sourceKey];
            const resourceString = JSON.stringify(resource);

            // Regex to find references to other resources
            // Pattern: resource.RESOURCE_NAME.id or similar
            const regex = /\${resource\.([a-zA-Z0-9_.-]+)\.[a-zA-Z0-9_]+}/g;
            let match;

            while ((match = regex.exec(resourceString)) !== null) {
                const targetKey = match[1];
                if (resources[targetKey]) {
                    edges.push({
                        id: `${sourceKey}->${targetKey}`,
                        source: sourceKey,
                        target: targetKey,
                        animated: true,
                        style: { stroke: '#6366f1' }, // Indigo-500
                        type: 'smoothstep',
                    });
                }
            }

            // Also explicit 'dependsOn' array
            if (resource.dependsOn && Array.isArray(resource.dependsOn)) {
                resource.dependsOn.forEach((targetKey: string) => {
                    if (resources[targetKey]) {
                        edges.push({
                            id: `${sourceKey}-depends-${targetKey}`,
                            source: sourceKey, // Logic: Source depends on Target, so Source -> Target or Target -> Source? 
                            // Visual dependency: usually Target (Dependency) -> Source (Dependent) or vice versa.
                            // In blueprints, if A depends on B, B must exist first.
                            // Let's draw arrow from B to A (Data Flow) or A to B (Dependency).
                            // Standard vRA canvas: Arrow points to the dependency.
                            // If Web depends on DB, arrow Web -> DB.
                            target: targetKey,
                            animated: true,
                            label: 'depends on',
                            style: { stroke: '#94a3b8', strokeDasharray: '5,5' },
                            type: 'smoothstep',
                        });
                    }
                });
            }
        });

        // 3. Auto Layout with Dagre
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: 'LR' }); // Left to Right layout
        g.setDefaultEdgeLabel(() => ({}));

        nodes.forEach((node) => {
            g.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        edges.forEach((edge) => {
            g.setEdge(edge.source, edge.target);
        });

        dagre.layout(g);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = g.node(node.id);
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - nodeWidth / 2,
                    y: nodeWithPosition.y - nodeHeight / 2,
                },
                targetPosition: Position.Left,
                sourcePosition: Position.Right,
            };
        });

        return { nodes: layoutedNodes, edges, error: undefined };

    } catch (e: any) {
        return { nodes: [], edges: [], error: e.message || 'Failed to parse YAML' };
    }
};
