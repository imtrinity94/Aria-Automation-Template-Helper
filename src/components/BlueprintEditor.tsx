import Editor, { type Monaco } from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";
import { useCallback } from "react";
import snippetsData from "@/data/snippets.json";
import schemaData from "@/data/schema.json";
import yaml from "js-yaml";

interface BlueprintEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
    hideHeader?: boolean;
}

// Type for the snippet file structure
type SnippetMap = Record<string, { prefix: string; body: string[]; description: string }>;
const snippets = snippetsData as SnippetMap;

export function BlueprintEditor({ value, onChange, hideHeader }: BlueprintEditorProps) {
    const { theme } = useTheme();

    const handleEditorWillMount = useCallback((monaco: Monaco) => {
        // Define Custom Themes before editor mounts
        monaco.editor.defineTheme('vcf-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'type', foreground: 'c7d2fe' },
                { token: 'keyword', foreground: '2dd4bf' },
                { token: 'string', foreground: 'a7f3d0' },
                { token: 'number', foreground: 'fde68a' },
                { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
            ],
            colors: {
                'editor.background': '#20333a',
                'editor.foreground': '#f8fafc',
                'editorCursor.foreground': '#2dd4bf',
                'editor.lineHighlightBackground': '#2c434b',
                'editorLineNumber.foreground': '#4a6b75',
                'editorIndentGuide.background': '#2c434b',
                'editor.selectionBackground': '#2c434b',
                'editorWidget.background': '#20333a',
            }
        });

        monaco.editor.defineTheme('vcf-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'type', foreground: '4f46e5' },
                { token: 'keyword', foreground: 'db2777' },
                { token: 'string', foreground: '059669' },
                { token: 'number', foreground: 'd97706' },
                { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },
            ],
            colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#0f172a',
                'editorCursor.foreground': '#4f46e5',
                'editor.lineHighlightBackground': '#f1f5f9',
                'editorLineNumber.foreground': '#cbd5e1',
                'editorIndentGuide.background': '#e2e8f0',
                'editor.selectionBackground': '#e2e8f0',
                'editorWidget.background': '#ffffff',
            }
        });

        const fullSchema = schemaData as unknown as { definitions: Record<string, any> };
        const resourceTypes = Object.keys(fullSchema.definitions)
            .filter(k => (k.startsWith('Cloud.') || k.startsWith('Allocations.')) && !k.includes('_'))
            .sort();
        const propertyMap: Record<string, string[]> = {};
        const enumMap: Record<string, string[]> = {};

        Object.entries(fullSchema.definitions).forEach(([type, def]) => {
            const props = (def.properties || {}) as Record<string, any>;
            const keys = Object.keys(props);
            propertyMap[type] = keys;
            keys.forEach(k => {
                const p = props[k];
                if (p && Array.isArray(p.enum)) {
                    enumMap[`${type}.${k}`] = p.enum;
                }
            });
        });

        // Global constants for IntelliSense
        const ENV_VARS = ['orgId', 'projectId', 'projectName', 'deploymentId', 'deploymentName', 'blueprintId', 'blueprintVersion', 'blueprintName', 'requestedBy', 'requestedAt'];
        const FUNCTIONS = ['to_lower', 'to_upper', 'to_string', 'to_integer', 'base64_encode', 'base64_decode', 'replace', 'substring', 'length', 'map_by', 'filter_by', 'map_to_object'];
        const INPUT_SCHEMA = ['type', 'title', 'description', 'default', 'enum', 'oneOf', 'encrypted', 'maxLength', 'minLength', 'pattern', 'minItems', 'maxItems'];
        const RESOURCE_FLAGS = ['count', 'allocate', 'allocatePerInstance', 'preventDelete', 'condition', 'dependsOn'];

        // Register completion item provider for YAML
        monaco.languages.registerCompletionItemProvider("yaml", {
            triggerCharacters: [':', ' ', '\n', '$', '{', '.', '('],
            provideCompletionItems: (model: any, position: any) => {
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

                const fullText = model.getValue();
                let doc: any = {};
                try {
                    doc = yaml.load(fullText) as any;
                } catch { }
                const inputKeys: string[] = Object.keys(doc?.inputs || {});
                const resourceEntries: Array<{ name: string; type: string }> = Object.entries(doc?.resources || {}).map(
                    ([name, r]: [string, any]) => ({ name, type: r?.type || '' })
                );
                const resourceNames = resourceEntries.map(r => r.name);

                const lines = textUntilPosition.split('\n');
                const currentLine = lines[lines.length - 1];
                const word = model.getWordUntilPosition(position);

                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const suggestions: any[] = [];
                const currentIndent = currentLine.search(/\S/);

                // 1. Context Detection
                let currentSection = '';
                let currentResourceName = '';
                let currentResourceType = '';
                let inPropertiesBlock = false;
                let currentPropertyKey = '';

                for (let i = lines.length - 2; i >= 0; i--) {
                    const line = lines[i];
                    if (line.trim() === '') continue;
                    const indent = line.search(/\S/);

                    if (indent === 0) {
                        if (!currentSection) {
                            if (line.trim().startsWith('resources:')) currentSection = 'resources';
                            else if (line.trim().startsWith('inputs:')) currentSection = 'inputs';
                            else currentSection = 'metadata';
                        }
                        break;
                    }

                    if (!currentSection || currentSection === 'resources') {
                        if (indent === 2 && line.trim().endsWith(':')) {
                            if (!currentResourceName) currentResourceName = line.trim().replace(':', '');
                        }
                        if (indent === 4 && line.trim().startsWith('type:')) {
                            if (!currentResourceType) currentResourceType = line.trim().split('type:')[1].trim();
                        }
                        if (indent === 4 && line.trim().startsWith('properties:')) {
                            inPropertiesBlock = true;
                        }
                        if (indent === 6 && line.trim().endsWith(':')) {
                            currentPropertyKey = line.trim().replace(':', '');
                        }
                    }
                }

                // Identify if we are actually under properties (based on indent)
                if (currentSection === 'resources' && currentIndent >= 6) {
                    inPropertiesBlock = true;
                }

                // 2. Typing "type:" - show resource types
                if (currentLine.trim().startsWith('type:')) {
                    resourceTypes.forEach(type => {
                        suggestions.push({
                            label: type,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: type,
                            detail: 'vRA Resource Type',
                            range: range
                        });
                    });
                    return { suggestions };
                }

                // 2b. Placeholder Detection (${...})
                if (currentLine.includes('${')) {
                    const textAfterBrace = currentLine.split('${').pop() || '';
                    if (!textAfterBrace.includes('}')) {
                        // Environment vars
                        if (textAfterBrace.startsWith('env.')) {
                            ENV_VARS.forEach(v => {
                                suggestions.push({
                                    label: v,
                                    kind: monaco.languages.CompletionItemKind.Variable,
                                    insertText: v,
                                    detail: 'Environment Variable',
                                    range: range
                                });
                            });
                            return { suggestions };
                        }
                        // Functions
                        FUNCTIONS.forEach(f => {
                            suggestions.push({
                                label: f,
                                kind: monaco.languages.CompletionItemKind.Function,
                                insertText: f + '(',
                                detail: 'Blueprint Function',
                                range: range
                            });
                        });
                        // Roots
                        ['env.', 'input.', 'resource.', 'self.', 'secret.', 'propgroup.', 'count.'].forEach(r => {
                            suggestions.push({
                                label: r,
                                kind: monaco.languages.CompletionItemKind.Keyword,
                                insertText: r,
                                detail: 'vRA Reference',
                                range: range
                            });
                        });
                        if (textAfterBrace.startsWith('input.')) {
                            inputKeys.forEach(k => {
                                suggestions.push({
                                    label: k,
                                    kind: monaco.languages.CompletionItemKind.Variable,
                                    insertText: k,
                                    detail: 'Input key',
                                    range: range
                                });
                            });
                            return { suggestions };
                        }
                        if (textAfterBrace.startsWith('resource.')) {
                            const afterRoot = textAfterBrace.slice('resource.'.length);
                            const parts = afterRoot.split('.');
                            if (parts.length <= 1) {
                                resourceNames.forEach(n => {
                                    suggestions.push({
                                        label: n,
                                        kind: monaco.languages.CompletionItemKind.Variable,
                                        insertText: n + '.',
                                        detail: 'Resource name',
                                        range: range
                                    });
                                });
                                return { suggestions };
                            } else {
                                const resName = parts[0];
                                const resType = resourceEntries.find(r => r.name === resName)?.type || '';
                                const props = propertyMap[resType] || [];
                                ['id', 'address', 'name', 'properties.'].forEach(k => {
                                    suggestions.push({
                                        label: k,
                                        kind: monaco.languages.CompletionItemKind.Property,
                                        insertText: k,
                                        detail: 'Resource field',
                                        range: range
                                    });
                                });
                                props.forEach(p => {
                                    suggestions.push({
                                        label: `properties.${p}`,
                                        kind: monaco.languages.CompletionItemKind.Property,
                                        insertText: `properties.${p}`,
                                        detail: `Property of ${resType}`,
                                        range: range
                                    });
                                });
                                return { suggestions };
                            }
                        }
                        return { suggestions };
                    }
                }

                // 3. Root suggestions
                if (currentIndent <= 0) {
                    const roots = [
                        { label: 'resources:', detail: 'Main resources block' },
                        { label: 'inputs:', detail: 'Input parameters' },
                        { label: 'formatVersion: 1', detail: 'Blueprint version' },
                        { label: 'name:', detail: 'Template name' }
                    ];
                    roots.forEach(r => {
                        suggestions.push({
                            label: r.label.replace(':', ''),
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: r.label,
                            detail: r.detail,
                            range: range
                        });
                    });
                }

                // 3b. Input Schema suggestions
                if (currentSection === 'inputs' && currentIndent >= 2) {
                    INPUT_SCHEMA.forEach(s => {
                        suggestions.push({
                            label: s,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: s + ':',
                            detail: 'Input Schema Attribute',
                            range: range
                        });
                    });
                    return { suggestions };
                }

                // 4. Resource Level suggestions (type, properties, flags)
                if (currentSection === 'resources' && (currentIndent === 4 || (currentIndent === -1 && lines[lines.length - 2]?.search(/\S/) === 2))) {
                    const keys = [
                        { label: 'type:', detail: 'Resource type' },
                        { label: 'properties:', detail: 'Resource properties' }
                    ];
                    keys.forEach(k => {
                        suggestions.push({
                            label: k.label.replace(':', ''),
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: k.label,
                            detail: k.detail,
                            range: range
                        });
                    });
                    RESOURCE_FLAGS.forEach(f => {
                        suggestions.push({
                            label: f,
                            kind: monaco.languages.CompletionItemKind.Field,
                            insertText: f + ':',
                            detail: 'Resource Flag',
                            range: range
                        });
                    });
                }

                // 5. Property suggestions (Object-type aware)
                if (currentSection === 'resources' && inPropertiesBlock && currentResourceType) {
                    const props = propertyMap[currentResourceType] || [];
                    props.forEach(p => {
                        suggestions.push({
                            label: p,
                            kind: monaco.languages.CompletionItemKind.Property,
                            insertText: p + ':',
                            detail: `Property for ${currentResourceType}`,
                            range: range
                        });
                    });

                    if (currentPropertyKey) {
                        const enums = enumMap[`${currentResourceType}.${currentPropertyKey}`] || [];
                        enums.forEach(val => {
                            suggestions.push({
                                label: val,
                                kind: monaco.languages.CompletionItemKind.EnumMember,
                                insertText: val,
                                detail: 'Allowed value',
                                range: range
                            });
                        });
                    }

                    if (currentPropertyKey === 'network') {
                        const nets = resourceEntries.filter(r => r.type && r.type.toLowerCase().includes('network'));
                        nets.forEach(n => {
                            suggestions.push({
                                label: `\${resource.${n.name}.id}`,
                                kind: monaco.languages.CompletionItemKind.Reference,
                                insertText: `\${resource.${n.name}.id}`,
                                detail: 'Reference network id',
                                range: range
                            });
                        });
                    }
                }

                // 6. Snippets Fallback
                if (suggestions.length === 0 || currentLine.trim() === '') {
                    Object.entries(snippets).forEach(([_, snippet]) => {
                        suggestions.push({
                            label: snippet.prefix,
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: snippet.body.join('\n'),
                            detail: snippet.description,
                            range: range,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                        });
                    });
                }

                return { suggestions };
            }
        });

        // Documentation Map for Hover Provider
        const HOVER_DOCS: Record<string, string> = {
            'formatVersion': 'The version of the blueprint format. Standard version is 1.',
            'inputs': 'Defines parameters that users can provide during placement.',
            'resources': 'Defines the infrastructure components (VMS, networks, etc.) to be deployed.',
            'dependsOn': 'Explicit dependency. Deployment will wait for the target resource to be ready.',
            'condition': 'Boolean expression for conditional deployment.',
            'count': 'Clustering index. Specifies the number of instances for the resource.',
            'preventDelete': 'If true, prevents the resource from being deleted during updates.',
            'allocatePerInstance': 'Specifies if allocation should happen per instance in a cluster.',
            'orgId': 'The ID of the organization where the template is deployed.',
            'projectId': 'The ID of the project associated with the deployment.',
            'image': 'The operating system image name or reference.',
            'flavor': 'The hardware size configuration (e.g., small, medium).',
            'to_lower': 'Converts a string to lowercase. usage: `${to_lower(resource.Machine.name)}`',
            'to_upper': 'Converts a string to uppercase.',
            'base64_encode': 'Encodes a string into Base64 format.',
            'map_to_object': 'Transforms an array into an object mapping. usage: `${map_to_object(resource.Disk[*].id, "source")}`',
            'length': 'Returns the number of items in an array or length of a string.',
            'enum': 'Provides a fixed list of values for an input.',
            'oneOf': 'Provides a list of objects with title (display) and const (value) for dropdowns.'
        };

        // Register hover provider for YAML
        monaco.languages.registerHoverProvider("yaml", {
            provideHover: (model: any, position: any) => {
                const word = model.getWordAtPosition(position);
                if (!word) return;

                const lookupWord = word.word;

                // 1. Check Custom Hover Docs
                if (HOVER_DOCS[lookupWord]) {
                    return {
                        contents: [
                            { value: `### ${lookupWord}` },
                            { value: HOVER_DOCS[lookupWord] }
                        ]
                    };
                }

                // 2. Find resource type in snippets
                const snippet = Object.values(snippets).find(s => s.prefix === lookupWord);
                if (snippet) {
                    return {
                        contents: [
                            { value: `### ${snippet.prefix}` },
                            { value: snippet.description }
                        ]
                    };
                }

                return null;
            }
        });
    }, []);

    return (
        <div className="h-full w-full bg-white dark:bg-[#20333a] flex flex-col overflow-hidden">
            {!hideHeader && (
                <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-[#20333a] backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                    <span className="text-base font-bold text-slate-800 dark:text-slate-100">Blueprint YAML</span>
                </div>
            )}
            <div className="flex-1 min-h-0">
                <Editor
                    key={theme}
                    height="100%"
                    defaultLanguage="yaml"
                    value={value}
                    onChange={onChange}
                    beforeMount={handleEditorWillMount}
                    theme={theme === "dark" ? "vcf-dark" : "vcf-light"}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                        tabSize: 2,
                        quickSuggestions: {
                            other: true,
                            comments: true,
                            strings: true
                        },
                        suggestOnTriggerCharacters: true,
                        acceptSuggestionOnEnter: "on",
                        tabCompletion: "on",
                        wordBasedSuggestions: "currentDocument",
                        parameterHints: { enabled: true },
                        suggest: {
                            snippetsPreventQuickSuggestions: false,
                            localityBonus: true,
                        }
                    }}
                />
            </div>
        </div>
    );
}
