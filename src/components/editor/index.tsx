"use client";

import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView } from "@blocknote/react";
import "@blocknote/react/style.css";
import { useEffect, useMemo, useState } from "react";

interface IEditorProps {
  onChange?: (blocks: Block[]) => void;
  initialContentt?: Block[];
  onSave?: () => void;
  loadBlock: () => Promise<PartialBlock[] | undefined>;
}
const Editor: React.FC<IEditorProps> = ({
  initialContentt,
  onChange,
  loadBlock,
}) => {
  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >(initialContentt || "loading");

  useEffect(() => {
    loadBlock().then((content) => {
      setInitialContent(content);
    });
  }, []);

  const editor = useMemo(() => {
    if (initialContent === "loading") {
      return undefined;
    }
    return BlockNoteEditor.create({ initialContent });
  }, [initialContent]);

  if (editor === undefined) {
    return "Loading note...";
  }

  // Renders the editor instance.
  return (
    <BlockNoteView
      editor={editor}
      onChange={() => onChange && onChange(editor.document)}
      data-theming-css-variables-demo
    />
  );
};

export default Editor;
