import yaml from 'js-yaml';
import * as dagre from 'dagre';
import { type Node, type Edge, Position } from '@xyflow/react';
import schemaData from '@/data/schema.json';

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

export interface ValidationMessage {
    level: 'error' | 'warning';
    resource?: string;
    message: string;
}

type SchemaProperty = {
    type?: string;
    description?: string;
    title?: string;
    items?: SchemaProperty;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
    $ref?: string;
    enum?: string[];
    default?: any;
};

type SchemaDefinition = {
    description?: string;
    properties?: Record<string, SchemaProperty>;
    required?: string[];
    title?: string;
    type?: string;
    oneOf?: Array<{ required?: string[] }>;
};

type SchemaRoot = {
    definitions: Record<string, SchemaDefinition>;
};

const fullSchema = schemaData as unknown as SchemaRoot;

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
                        source: targetKey,
                        target: sourceKey,
                        animated: false,
                        type: 'step',
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
                            source: targetKey,
                            target: sourceKey,
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
            const getTier = (t: string): number => {
                const s = t.toLowerCase();
                if (s.includes('network')) return 0;
                if (s.includes('security')) return 1;
                if (s.includes('machine') || s.includes('instance') || s.includes('vm')) return 2;
                if (s.includes('disk') || s.includes('volume') || s.includes('storage')) return 3;
                return 2;
            };
            const tier = getTier(originalType);
            const tierGap = 180;
            const baseY = 60;

            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - 175,
                    y: tier * tierGap + baseY,
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

export const validateBlueprint = (yamlContent: string): ValidationMessage[] => {
    const messages: ValidationMessage[] = [];
    let parsed: any;
    try {
        parsed = yaml.load(yamlContent) as any;
    } catch (e: any) {
        messages.push({ level: 'error', message: e.message || 'Failed to parse YAML' });
        return messages;
    }

    if (!parsed || typeof parsed !== 'object') {
        messages.push({ level: 'error', message: 'Invalid YAML content' });
        return messages;
    }

    const resources = parsed.resources || {};
    const resourceKeys = Object.keys(resources);

    // Check unresolved resource references
    resourceKeys.forEach((sourceKey) => {
        const resource = resources[sourceKey];
        const resourceString = JSON.stringify(resource);
        const regex = /\${resource\.([a-zA-Z0-9_.-]+)\.[a-zA-Z0-9_]+}/g;
        let match;
        while ((match = regex.exec(resourceString)) !== null) {
            const targetKey = match[1];
            if (!resources[targetKey]) {
                messages.push({
                    level: 'warning',
                    resource: sourceKey,
                    message: `References missing resource "${targetKey}"`
                });
            }
        }
    });

    // Schema-based checks
    resourceKeys.forEach((key) => {
        const res = resources[key] || {};
        const type: string = res.type || 'Unknown';
        const def = fullSchema.definitions[type];

        if (!def) {
            messages.push({
                level: 'warning',
                resource: key,
                message: `Unknown resource type "${type}"`
            });
            return;
        }

        const props = (res.properties || {}) as Record<string, any>;
        const schemaProps = def.properties || {};

        // Required properties (direct)
        if (Array.isArray(def.required)) {
            def.required.forEach((req) => {
                if (!(req in props)) {
                    messages.push({
                        level: 'error',
                        resource: key,
                        message: `Missing required property "${req}" for ${type}`
                    });
                }
            });
        }

        // oneOf groups (at least one set of required keys satisfied)
        if (Array.isArray(def.oneOf) && def.oneOf.length > 0) {
            const groupSatisfied = def.oneOf.some((group) => {
                const reqs = group.required || [];
                return reqs.every((r) => r in props);
            });
            if (!groupSatisfied) {
                const variants = def.oneOf
                    .map((g) => (g.required || []).join(' & '))
                    .filter((s) => s.length > 0);
                if (variants.length > 0) {
                    messages.push({
                        level: 'error',
                        resource: key,
                        message: `Must specify one of: ${variants.join(' OR ')}`
                    });
                }
            }
        }

        // Unknown property names
        Object.keys(props).forEach((p) => {
            if (!(p in schemaProps)) {
                messages.push({
                    level: 'warning',
                    resource: key,
                    message: `Unknown property "${p}" for ${type}`
                });
            }
        });
    });

    return messages;
};
