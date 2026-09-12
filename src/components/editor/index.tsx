"use client";

import { useMemo } from "react";
import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useTheme } from "next-themes";

interface IEditorProps {
  initialContent?: PartialBlock[];
  onChange?: (blocks: Block[]) => void;
}

/** The notes editor. It reads its content once, so mount it after the note has loaded. */
const Editor: React.FC<IEditorProps> = ({ initialContent, onChange }) => {
  const { resolvedTheme } = useTheme();
  const editor = useMemo(
    () => BlockNoteEditor.create({ initialContent }),
    // the initial content is only read when the editor is created
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <BlockNoteView
      editor={editor}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      onChange={() => onChange?.(editor.document)}
    />
  );
};

export default Editor;
