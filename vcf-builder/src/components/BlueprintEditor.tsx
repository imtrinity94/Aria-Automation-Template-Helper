import Editor from "@monaco-editor/react";
import { useTheme } from "@/hooks/useTheme";

interface BlueprintEditorProps {
    value: string;
    onChange: (value: string | undefined) => void;
}

export function BlueprintEditor({ value, onChange }: BlueprintEditorProps) {
    const { theme } = useTheme();

    return (
        <div className="h-full w-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="h-10 px-4 flex items-center bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Blueprint YAML
            </div>
            <div className="h-[calc(100%-40px)]">
                <Editor
                    height="100%"
                    defaultLanguage="yaml"
                    value={value}
                    onChange={onChange}
                    theme={theme === "dark" ? "vs-dark" : "light"}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
}
