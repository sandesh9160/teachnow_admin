"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import CharacterCount from "@tiptap/extension-character-count";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List, 
  ListOrdered, 
  Undo,
  Redo,
  Link as LinkIcon,
  Code,
  Minus,
  Type,
  Eraser,
  Palette,
  Highlighter,
  ChevronDown,
  Columns,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useCallback, useMemo, useEffect } from "react";

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  className,
  title
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  className?: string;
  title?: string;
}) => (
  <button
    type="button"
    onClick={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={clsx(
      "p-1.5 min-w-[32px] h-8 rounded-sm transition-all hover:bg-surface-100 flex items-center justify-center shrink-0 border border-transparent cursor-pointer",
      isActive ? "bg-white text-primary-600 border-surface-200 shadow-sm" : "text-surface-500",
      disabled && "opacity-30 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-surface-200 mx-1 flex-shrink-0" />;

export function TipTapEditor({ value, onChange, placeholder = "Start typing description..." }: TipTapEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isNofollow, setIsNofollow] = useState(true);

  const extensions = useMemo(() => [
    StarterKit.configure({
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary-600 underline cursor-pointer font-semibold",
        rel: "nofollow"
      },
    }),
    Placeholder.configure({ placeholder }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    CharacterCount,
    Image.configure({ inline: true }),
    Youtube.configure({ inline: false, width: 840, height: 472.5 }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ], [placeholder]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-6 py-5 text-[14px] font-medium text-surface-600 leading-relaxed",
      },
    },
  });

  // Sync external value changes into the editor (e.g., when editing an existing resource)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ 
      href: linkUrl, 
      rel: isNofollow ? "nofollow" : "dofollow" 
    }).run();

    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl, isNofollow]);

  if (!editor) return null;

  return (
    <div className="border border-surface-200 rounded-xl bg-white overflow-hidden shadow-xs transition-all focus-within:border-primary-500/40">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-surface-50/50 border-b border-surface-100 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
             <Bold size={14} />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
             <Italic size={14} />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline">
             <UnderlineIcon size={14} />
           </MenuButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => {}} title="Text Color">
             <Palette size={14} className="text-surface-300" />
           </MenuButton>
           <MenuButton onClick={() => {}} title="Highlight">
             <Highlighter size={14} className="text-surface-300" />
           </MenuButton>
           
           <div className="flex items-center gap-1.5 px-2 py-1 mx-1 rounded-md bg-white border border-surface-200 cursor-pointer hover:bg-surface-50 transition-all group">
              <span className="text-[11px] font-bold text-surface-500 group-hover:text-primary-600">14px</span>
              <ChevronDown size={12} className="text-surface-300" />
           </div>

           <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-white border border-surface-200 cursor-pointer hover:bg-surface-50 transition-all group min-w-[50px]">
              <span className="text-[11px] font-bold text-surface-500 group-hover:text-primary-600">P</span>
              <ChevronDown size={12} className="text-surface-300 ml-auto" />
           </div>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
             <List size={14} />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Ordered List">
             <ListOrdered size={14} />
           </MenuButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => setShowLinkInput(!showLinkInput)} isActive={editor.isActive("link")} title="Link">
             <LinkIcon size={14} />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive("code")} title="Code">
             <Code size={14} />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Format">
             <Eraser size={14} />
           </MenuButton>
        </div>

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">
             <Undo size={14} />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">
             <Redo size={14} />
           </MenuButton>
        </div>

        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => {
             const url = window.prompt("Enter image URL");
             if (url) editor.chain().focus().setImage({ src: url }).run();
           }} title="Insert Image">
             <ImageIcon size={14} />
           </MenuButton>
           <MenuButton onClick={() => {
             const url = window.prompt("Enter YouTube URL");
             if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
           }} title="Insert YouTube Video">
             <VideoIcon size={14} />
           </MenuButton>
           <MenuButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">
             <TableIcon size={14} />
           </MenuButton>
        </div>

        <ToolbarDivider />

        <div className="flex-1" />

        <MenuButton onClick={() => {}} title="Layout">
            <Columns size={14} />
        </MenuButton>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="p-3 bg-white border-b border-surface-100 flex items-center gap-3 animate-in slide-in-from-top-2 duration-200">
           <div className="flex-1 relative">
             <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
             <input 
               autoFocus
               value={linkUrl}
               onChange={(e) => setLinkUrl(e.target.value)}
               placeholder="https://..."
               className="w-full h-9 pl-9 pr-4 rounded-lg border border-surface-200 text-xs font-semibold focus:outline-none focus:border-primary-500"
               onKeyDown={(e) => e.key === 'Enter' && setLink()}
             />
           </div>
           <button onClick={setLink} className="h-9 px-4 bg-primary-600 text-white rounded-lg text-[11px] font-bold hover:bg-primary-700 transition-all">Apply</button>
           <button onClick={() => setShowLinkInput(false)} className="h-9 px-3 text-[11px] font-bold text-surface-400 hover:text-surface-600 transition-all">Cancel</button>
        </div>
      )}
      
      <div className="bg-white min-h-[300px]">
         <EditorContent editor={editor} />
      </div>
      
      {/* Footer */}
      <div className="px-5 py-2.5 bg-surface-50/50 border-t border-surface-100 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-bold text-surface-400">System Ready</span>
            </div>
            <div className="text-[10px] font-bold text-primary-500 uppercase tracking-tight">Auto-save Enabled</div>
         </div>
         <div className="flex items-center gap-4 text-[10px] font-bold text-surface-400">
            <span className="bg-surface-100 px-2 py-0.5 rounded-full">{editor.storage.characterCount?.characters() || 0} Characters</span>
            <div className="flex items-center gap-1">
               <Type size={11} />
               <span>UTF-8 Standard</span>
            </div>
         </div>
      </div>
      
      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #94a3b8;
          pointer-events: none;
          height: 0;
          font-weight: 500;
        }
        .prose a {
          color: var(--color-primary-600);
          text-decoration: underline;
          font-weight: 600;
        }
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
        }
        .prose blockquote {
          border-left: 4px solid var(--color-primary-500);
          padding-left: 1rem;
          font-style: italic;
          color: var(--color-surface-500);
        }
        .prose img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem auto;
        }
        .prose iframe {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem auto;
        }
        .prose table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 1rem 0;
          overflow: hidden;
        }
        .prose table td,
        .prose table th {
          border: 1px solid var(--color-surface-300);
          padding: 0.5rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .prose table th {
          font-weight: bold;
          background-color: var(--color-surface-100);
        }
      `}</style>
    </div>
  );
}
