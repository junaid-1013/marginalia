"use client";

import "@blocknote/core/fonts/inter.css";
import { Block } from "@blocknote/core";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/react/style.css";

interface IEditorProps {
  onChange?: (blocks: Block[]) => void;
  initialContent?: Block[];
}
const Editor: React.FC<IEditorProps> = ({ initialContent, onChange }) => {
  const editor = useCreateBlockNote({
    initialContent,
  });

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => onChange && onChange(editor.document)}
      data-theming-css-variables-demo
    />
  );
};

export default Editor;
