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

        // Register completion item provider for YAML
        monaco.languages.registerCompletionItemProvider("yaml", {
            provideCompletionItems: (model, position) => {
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn,
                };

                const suggestions = Object.entries(snippets).map(([_, snippet]) => {
                    const insertText = snippet.body.join('\n');

                    return {
                        label: snippet.prefix,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: insertText,
                        detail: snippet.description,
                        documentation: snippet.description,
                        range: range,
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                    };
                });

                return { suggestions };
            }
        });
    }, []);

    return (
        <div className="h-full w-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
            <div className="h-10 px-4 flex items-center bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Blueprint YAML
            </div>
            <div className="h-[calc(100%-40px)]">
                <Editor
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
                    }}
                />
            </div>
        </div>
    );
}
