import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { CustomImage } from "./CustomImage";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import { EditorToolbar } from "./EditorToolbar";
import { useEffect, useRef } from "react";

interface TiptapEditorProps {
  content: any;
  onChange?: (json: any) => void;
  placeholder?: string;
  editable?: boolean;
}

export function TiptapEditor({ content, onChange, placeholder = "Start writing...", editable = true }: TiptapEditorProps) {
  const prevContentRef = useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      CustomImage.configure({ inline: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight,
    ],
    content: content || "",
    editable,
    onUpdate: ({ editor: ed }) => {
      const json = ed.getJSON();
      prevContentRef.current = json;
      onChange?.(json);
    },
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  useEffect(() => {
    if (editor && JSON.stringify(content) !== JSON.stringify(prevContentRef.current)) {
      editor.commands.setContent(content || "");
      prevContentRef.current = content;
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-wrapper">
      <EditorToolbar editor={editor} />
      <div className="px-4 py-3 min-h-[200px]">
        <EditorContent editor={editor} className="prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-on-surface prose-p:text-on-surface prose-a:text-primary-container focus:outline-none" />
      </div>
    </div>
  );
}
