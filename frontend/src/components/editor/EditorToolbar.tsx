import { useRef } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline, Strikethrough, Code, Heading1, Heading2, Heading3,
  List, ListOrdered, ListCheck, Quote, Code2, Table, Image, Link, AlignLeft,
  AlignCenter, AlignRight, Undo, Redo, Minus,
} from "lucide-react";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          editor.chain().focus().setImage({ src: reader.result }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const ToolBtn = ({ onClick, active, children, title }: {
    onClick: () => void; active?: boolean; children: React.ReactNode; title?: string;
  }) => (
    <button
      title={title}
      type="button"
      onMouseDown={(e) => {
        // Prevent editor from losing focus when clicking toolbar buttons
        e.preventDefault();
        onClick();
      }}
      className={`p-1.5 rounded-md transition-all text-sm ${
        active
          ? "bg-primary-fixed text-primary"
          : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      {children}
    </button>
  );

  const Divider = () => <div className="w-px h-5 bg-outline-variant/50 mx-1" />;

  return (
    <div className="glass-card rounded-xl px-2 py-1.5 flex items-center gap-0.5 flex-wrap sticky top-0 z-10 border-b border-outline-variant/20">
      <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <Bold size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <Italic size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
        <Underline size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <Strikethrough size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code">
        <Code size={16} />
      </ToolBtn>

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="Heading 1">
        <Heading1 size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
        <Heading2 size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
        <Heading3 size={16} />
      </ToolBtn>

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
        <List size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
        <ListOrdered size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task List">
        <ListCheck size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
        <Quote size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
        <Code2 size={16} />
      </ToolBtn>

      <Divider />

      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
        <AlignLeft size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
        <AlignCenter size={16} />
      </ToolBtn>
      <ToolBtn onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
        <AlignRight size={16} />
      </ToolBtn>

      <Divider />

      <ToolBtn onClick={() => {
        fileInputRef.current?.click();
      }} title="Upload Image">
        <Image size={16} />
      </ToolBtn>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />

      <ToolBtn onClick={() => {
        const url = window.prompt("Enter link URL:");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      }} active={editor.isActive("link")} title="Link">
        <Link size={16} />
      </ToolBtn>

      <ToolBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table">
        <Table size={16} />
      </ToolBtn>

      <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
        <Minus size={16} />
      </ToolBtn>

      <div className="ml-auto flex items-center gap-0.5">
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo">
          <Undo size={16} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo">
          <Redo size={16} />
        </ToolBtn>
      </div>
    </div>
  );
}
