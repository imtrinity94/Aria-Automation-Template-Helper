import yaml from 'js-yaml';
import * as dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';

// Standard vRA Resource Types to Icon/Color mapping (simplified)
const RESOURCE_STYLES: Record<string, { label: string; color: string }> = {
    'Cloud.Machine': { label: 'Machine', color: '' },
    'Cloud.Network': { label: 'Network', color: '' },
    'Cloud.LoadBalancer': { label: 'Load Balancer', color: '' },
    'Cloud.vSphere.Machine': { label: 'vSphere Machine', color: '' },
    'Cloud.NSX.Network': { label: 'NSX Network', color: '' },
    'Cloud.AWS.EC2.Instance': { label: 'AWS EC2', color: '' },
    'Cloud.Azure.Machine': { label: 'Azure VM', color: '' },
    'Cloud.GCP.Machine': { label: 'GCP VM', color: '' },
};

export interface BlueprintParseResult {
    nodes: Node[];
    edges: Edge[];
    error?: string;
}

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
            const style = RESOURCE_STYLES[type] || { label: type, color: '' };

            // Extract constraints (tags)
            const nodeConstraints: string[] = [];
            if (resource.properties?.constraints) {
                const c = resource.properties.constraints;
                if (Array.isArray(c)) {
                    c.forEach((item: any) => {
                        if (typeof item === 'string') nodeConstraints.push(item.trim());
                        else if (item.tag) nodeConstraints.push(item.tag.trim());
                    });
                } else if (typeof c === 'string') {
                    nodeConstraints.push(c.trim());
                }
            }

            nodes.push({
                id: key,
                type: 'resourceNode',
                data: {
                    name: key,
                    label: style.label,
                    originalType: type,
                    constraints: nodeConstraints,
                },
                position: { x: 0, y: 0 },
            });
        });

        // 2. Create Edges
        resourceKeys.forEach((sourceKey) => {
            const resource = resources[sourceKey];
            const resourceString = JSON.stringify(resource);
            const regex = /\${resource\.([a-zA-Z0-9_.-]+)\.[a-zA-Z0-9_]+}/g;
            let match;

            while ((match = regex.exec(resourceString)) !== null) {
                const targetKey = match[1];
                if (resources[targetKey]) {
                    edges.push({
                        id: `${sourceKey}-binding-${targetKey}`,
                        source: sourceKey,
                        target: targetKey,
                        animated: false,
                        type: 'smoothstep',
                        data: { type: 'binding' }
                    });
                }
            }

            if (resource.dependsOn) {
                const dependencies = Array.isArray(resource.dependsOn) ? resource.dependsOn : [resource.dependsOn];
                dependencies.forEach((targetKey: string) => {
                    if (resources[targetKey] && targetKey !== sourceKey) {
                        edges.push({
                            id: `${sourceKey}-depends-${targetKey}`,
                            source: sourceKey,
                            target: targetKey,
                            animated: false,
                            type: 'step',
                            data: { type: 'dependsOn' }
                        });
                    }
                });
            }
        });

        // 3. Auto Layout with Dagre
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 60 });
        g.setDefaultEdgeLabel(() => ({}));

        nodes.forEach((node) => {
            g.setNode(node.id, { width: 350, height: 120 });
        });

        edges.forEach((edge) => {
            g.setEdge(edge.source, edge.target);
        });

        dagre.layout(g);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = g.node(node.id);
            const originalType = (node.data.originalType as string) || '';
            const isNetwork = originalType.toLowerCase().includes('network');

            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - 175,
                    y: isNetwork ? 600 : nodeWithPosition.y - 60, // Force networks to the bottom row
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
