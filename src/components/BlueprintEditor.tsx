import Editor, { type Monaco } from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";
import { useCallback } from "react";
import snippetsData from "@/data/snippets.json";

interface BlueprintEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
}

// Type for the snippet file structure
type SnippetMap = Record<string, { prefix: string; body: string[]; description: string }>;
const snippets = snippetsData as SnippetMap;

export function BlueprintEditor({ value, onChange }: BlueprintEditorProps) {
    const { theme } = useTheme();

    const handleEditorWillMount = useCallback((monaco: Monaco) => {
        // Define Custom Themes before editor mounts
        monaco.editor.defineTheme('vcf-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'type', foreground: '818cf8' },
                { token: 'keyword', foreground: 'f472b6' },
                { token: 'string', foreground: '34d399' },
                { token: 'number', foreground: 'fbbf24' },
                { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
            ],
            colors: {
                'editor.background': '#020617',
                'editor.foreground': '#f8fafc',
                'editorCursor.foreground': '#6366f1',
                'editor.lineHighlightBackground': '#0f172a',
                'editorLineNumber.foreground': '#334155',
                'editorIndentGuide.background': '#1e293b',
                'editor.selectionBackground': '#1e293b',
                'editorWidget.background': '#0f172a',
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

        // Pre-process snippets for faster context-aware lookups
        const resourceTypes = Object.keys(snippets);
        const propertyMap: Record<string, string[]> = {};

        Object.entries(snippets).forEach(([key, s]) => {
            const typeMatch = s.body.find(l => l.includes('type:'));
            if (typeMatch) {
                const type = typeMatch.split('type:')[1].trim();
                // Extract keys from body
                const properties: string[] = [];
                let inProperties = false;
                s.body.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed === 'properties:') { inProperties = true; return; }
                    if (inProperties && trimmed.endsWith(':')) {
                        properties.push(trimmed.replace(':', ''));
                    }
                    if (inProperties && (trimmed === '' || !line.startsWith('      '))) {
                        // End of properties or deeper nesting
                    }
                });
                propertyMap[type] = properties;
            }
        });

        // Register completion item provider for YAML
        monaco.languages.registerCompletionItemProvider("yaml", {
            triggerCharacters: [':', ' ', '\n', '-'],
            provideCompletionItems: (model, position) => {
                const lineContent = model.getLineContent(position.lineNumber);
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

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

                // 1. If typing "type:", suggest resource types
                if (currentLine.includes('type:')) {
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

                // 2. Context Detection
                let currentSection = '';
                let currentResourceName = '';
                let currentResourceType = '';

                for (let i = lines.length - 2; i >= 0; i--) {
                    const line = lines[i];
                    const indent = line.search(/\S/);

                    if (indent === 0) {
                        if (line.trim().startsWith('resources:')) currentSection = 'resources';
                        if (line.trim().startsWith('inputs:')) currentSection = 'inputs';
                        if (line.trim().startsWith('formatVersion:')) currentSection = 'metadata';
                    }

                    if (currentSection === 'resources') {
                        // Detect resource name (indent 2)
                        if (indent === 2 && line.trim().endsWith(':')) {
                            if (!currentResourceName) currentResourceName = line.trim().replace(':', '');
                        }
                        // Detect resource type
                        if (indent === 4 && line.trim().startsWith('type:')) {
                            if (!currentResourceType) currentResourceType = line.trim().split('type:')[1].trim();
                        }
                    }
                }

                const currentIndent = currentLine.search(/\S/);

                // 3. Root suggestions (resources, inputs, formatVersion)
                if (currentIndent <= 0 || currentLine.trim() === '') {
                    const roots = ['resources:', 'inputs:', 'formatVersion: 1'];
                    roots.forEach(r => {
                        suggestions.push({
                            label: r.replace(':', ''),
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: r,
                            range: range
                        });
                    });
                }

                // 4. Resource property suggestions
                if (currentSection === 'resources') {
                    // Under resource name (suggest type, properties, dependsOn)
                    if (currentIndent === 4 || (currentLine.trim() === '' && lines[lines.length - 2]?.search(/\S/) === 2)) {
                        const keys = ['type:', 'properties:', 'dependsOn:'];
                        keys.forEach(k => {
                            suggestions.push({
                                label: k.replace(':', ''),
                                kind: monaco.languages.CompletionItemKind.Field,
                                insertText: k,
                                range: range
                            });
                        });
                    }

                    // Under properties (suggest specific properties for the detected type)
                    if (currentResourceType && (currentIndent === 6 || currentLine.trim() === '')) {
                        const props = propertyMap[currentResourceType] || [];
                        props.forEach(p => {
                            suggestions.push({
                                label: p,
                                kind: monaco.languages.CompletionItemKind.Property,
                                insertText: p + ':',
                                range: range
                            });
                        });
                    }
                }

                // 5. Fallback to snippets if not specific context
                if (suggestions.length === 0) {
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
    }, []);

    return (
        <div className="h-full w-full bg-white dark:bg-slate-950 flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Blueprint YAML</span>
            </div>
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
                        wordBasedSuggestions: true,
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
