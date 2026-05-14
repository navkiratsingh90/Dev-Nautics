"use client";

import { Editor, OnMount, EditorProps } from "@monaco-editor/react";
import React, { useRef, useEffect } from "react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  darkMode: boolean;
  language: string;
}

// ─── Component ────────────────────────────────────────────────────────────
const CodeEditor = React.memo(({ code, onChange, darkMode, language }: CodeEditorProps) => {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  // Update Monaco theme when darkMode changes
  useEffect(() => {
    if (editorRef.current) {
      // Monaco's theme can be set via the editor instance or globally.
      // The easiest is to rely on the `theme` prop of the Editor component,
      // but we also ensure the global theme is set if needed.
      // Monaco automatically updates when the `theme` prop changes.
      // This effect is kept for any additional logic.
    }
  }, [darkMode]);

  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme={darkMode ? "vs-dark" : "light"}
      onMount={handleEditorDidMount}
      onChange={onChange}
      options={{
        fontSize: 14,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        lineNumbers: "on",
        renderWhitespace: "selection",
        tabSize: 2,
      }}
    />
  );
});

CodeEditor.displayName = "CodeEditor";

export default CodeEditor;