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

        // Pre-process snippets for faster context-aware lookups
        const resourceTypes = Object.keys(snippets).map(t => t.replace(':', ''));
        const propertyMap: Record<string, string[]> = {};

        Object.entries(snippets).forEach(([prefixWithColon, s]) => {
            const prefix = prefixWithColon.replace(':', '');
            const typeMatch = s.body.find(l => l.trim().startsWith('type:'));
            const type = typeMatch ? typeMatch.split('type:')[1].trim() : prefix;

            const properties: string[] = [];
            let inProperties = false;
            s.body.forEach(line => {
                const trimmed = line.trim();
                const indent = line.search(/\S/);
                if (trimmed === 'properties:') { inProperties = true; return; }
                if (inProperties) {
                    if (indent <= 4 && trimmed !== '' && indent !== -1) {
                        inProperties = false;
                        return;
                    }
                    if (trimmed.endsWith(':') && indent === 6) {
                        properties.push(trimmed.replace(':', '').trim());
                    }
                }
            });
            propertyMap[type] = properties;
            if (type !== prefix) propertyMap[prefix] = properties;
        });

        // Register completion item provider for YAML
        monaco.languages.registerCompletionItemProvider("yaml", {
            triggerCharacters: [':', ' ', '\n'],
            provideCompletionItems: (model, position) => {
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
                const currentIndent = currentLine.search(/\S/);

                // 1. Context Detection
                let currentSection = '';
                let currentResourceName = '';
                let currentResourceType = '';
                let inPropertiesBlock = false;

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
                        break; // Top level reached
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

                // 3. Root suggestions
                if (currentIndent <= 0) {
                    const roots = [
                        { label: 'resources:', detail: 'Main resources block' },
                        { label: 'inputs:', detail: 'Input parameters' },
                        { label: 'formatVersion: 1', detail: 'Blueprint version' }
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

                // 4. Resource Level suggestions (type, properties, dependsOn)
                if (currentSection === 'resources' && (currentIndent === 4 || (currentIndent === -1 && lines[lines.length - 2]?.search(/\S/) === 2))) {
                    const keys = [
                        { label: 'type:', detail: 'Resource type' },
                        { label: 'properties:', detail: 'Resource properties' },
                        { label: 'dependsOn:', detail: 'Execution dependencies' },
                        { label: 'condition:', detail: 'Conditional deployment' }
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

        // Register hover provider for YAML
        monaco.languages.registerHoverProvider("yaml", {
            provideHover: (model, position) => {
                const word = model.getWordAtPosition(position);
                if (!word) return;

                // Find resource type in snippets
                const snippet = Object.values(snippets).find(s => s.prefix === word.word);
                if (snippet) {
                    return {
                        contents: [
                            { value: `### ${snippet.prefix}` },
                            { value: snippet.description }
                        ]
                    };
                }

                // Check if it's a known property
                const lineContent = model.getLineContent(position.lineNumber);
                if (lineContent.includes(':')) {
                    const key = lineContent.split(':')[0].trim();
                    if (key === word.word) {
                        // We could find which resource this property belongs to, 
                        // but for now just showing it's a property is good.
                    }
                }

                return null;
            }
        });
    }, []);

    return (
        <div className="h-full w-full bg-white dark:bg-[#20333a] flex flex-col overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between bg-slate-50/50 dark:bg-[#20333a] backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
                <span className="text-base font-bold text-slate-800 dark:text-slate-100">Blueprint YAML</span>
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
