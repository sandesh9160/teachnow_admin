"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Image } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
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
  Eraser,
  Palette,
  Highlighter,
  ChevronDown,
  Columns,
  Image as ImageIcon,
  Video as VideoIcon,
  Table as TableIcon,
  Heading1,
  Heading2,
  Heading3,
  Type as TypeIcon
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// Custom FontSize Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize }).run()
      },
      unsetFontSize: () => ({ chain }: any) => {
        return chain().setMark('textStyle', { fontSize: null }).run()
      },
    } as any
  },
})

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  stickyOffset?: number;
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
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={clsx(
      "p-1.5 min-w-[32px] h-8 rounded-md transition-all hover:bg-slate-100 flex items-center justify-center shrink-0 border border-transparent cursor-pointer",
      isActive ? "bg-white text-indigo-600 border-slate-200 shadow-sm" : "text-slate-500",
      disabled && "opacity-30 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

const ToolbarDivider = () => <div className="w-px h-6 bg-slate-200 mx-1 flex-shrink-0" />;

export function TipTapEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing description...",
  stickyOffset = 0 
}: TipTapEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isNofollow, setIsNofollow] = useState(true);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  
  const headingMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extensions = useMemo(() => [
    StarterKit.configure({
      bulletList: { keepMarks: true, keepAttributes: false },
      orderedList: { keepMarks: true, keepAttributes: false },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-indigo-600 underline cursor-pointer font-semibold",
        rel: "nofollow"
      },
    }),
    Placeholder.configure({ placeholder }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    CharacterCount,
    Image.configure({ inline: true, allowBase64: true }),
    Youtube.configure({ inline: false, width: 840, height: 472.5 }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    TextStyle,
    Color,
    Highlight.configure({ multicolor: true }),
    FontSize,
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
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 pt-0 pb-20 text-[14px] font-medium text-slate-600 leading-relaxed",
      },
    },
  });

  // Sync value from parent while preserving selection
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // If the editor is focused, we try to preserve the selection
      // to avoid cursor jumping or selection loss during sync
      if (editor.isFocused) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(value || "", { emitUpdate: false });
        try {
          editor.commands.setTextSelection({ from, to });
        } catch (e) {
          // Fallback if selection is invalid for new content
        }
      } else {
        editor.commands.setContent(value || "", { emitUpdate: false });
      }
    }
  }, [value, editor]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headingMenuRef.current && !headingMenuRef.current.contains(event.target as Node)) {
        setShowHeadingMenu(false);
      }
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(event.target as Node)) {
        setShowSizeMenu(false);
      }
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) {
        setShowColorMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const content = readerEvent.target?.result as string;
        editor.chain().focus().setImage({ src: content }).run();
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-slate-200 rounded-xl bg-white flex flex-col min-h-[500px]">
      {/* Toolbar - Sticky within its container */}
      <div 
        className="sticky z-[40] flex flex-wrap items-center gap-0.5 p-1 bg-white/80 backdrop-blur-md border-b border-slate-100 overflow-visible shadow-sm"
        style={{ top: stickyOffset }}
      >
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
           {/* Color Picker Dropdown */}
           <div className="relative" ref={colorMenuRef}>
              <MenuButton 
                onClick={() => setShowColorMenu(!showColorMenu)} 
                isActive={showColorMenu || !!editor.getAttributes('textStyle').color} 
                title="Text Color"
              >
                <Palette 
                  size={14} 
                  style={{ color: editor.getAttributes('textStyle').color || 'currentColor' }} 
                />
              </MenuButton>

              {showColorMenu && (
                <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-2xl z-[60] p-3 animate-in fade-in zoom-in duration-100">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Text Color</span>
                        <button 
                            type="button"
                            onMouseDown={(e) => { 
                                e.preventDefault(); 
                                editor.chain().focus().unsetColor().run(); 
                                setShowColorMenu(false); 
                            }}
                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            '#000000', '#475569', '#64748b', '#94a3b8', '#cbd5e1',
                            '#dc2626', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
                            '#3b82f6', '#4f46e5', '#8b5cf6', '#d946ef', '#f43f5e'
                        ].map((color) => (
                            <button 
                                key={color}
                                type="button"
                                onMouseDown={(e) => { 
                                    e.preventDefault(); 
                                    editor.chain().focus().setColor(color).run(); 
                                    setShowColorMenu(false); 
                                }}
                                className={clsx(
                                    "w-8 h-8 rounded-lg border border-slate-100 hover:scale-110 transition-all shadow-sm cursor-pointer flex items-center justify-center",
                                    editor.getAttributes('textStyle').color === color && "ring-2 ring-indigo-500 ring-offset-2"
                                )}
                                style={{ backgroundColor: color }}
                                title={color}
                            >
                                {editor.getAttributes('textStyle').color === color && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
              )}
           </div>

           <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
             <Highlighter size={14} />
           </MenuButton>
           
           <ToolbarDivider />

           {/* Font Size Dropdown */}
           <div className="relative" ref={sizeMenuRef}>
              <button 
                type="button"
                onClick={() => setShowSizeMenu(!showSizeMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 transition-all group min-w-[65px]"
              >
                 <span className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-600">
                    {editor.getAttributes('textStyle').fontSize || '14px'}
                 </span>
                 <ChevronDown size={12} className="text-slate-400 ml-auto" />
              </button>

              {showSizeMenu && (
                <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-slate-200 rounded-lg shadow-xl z-[50] py-1">
                    {['12px', '14px', '16px', '18px', '20px', '24px', '32px'].map((size) => (
                        <button 
                            key={size}
                            type="button"
                            onMouseDown={(e) => { 
                                e.preventDefault(); 
                                (editor.commands as any).setFontSize(size); 
                                setShowSizeMenu(false); 
                            }}
                            className="w-full px-3 py-1.5 text-left text-[11px] font-semibold hover:bg-slate-50 text-slate-600 cursor-pointer"
                        >
                            {size}
                        </button>
                    ))}
                </div>
              )}
           </div>

           {/* Paragraph / Heading Dropdown */}
           <div className="relative ml-0.5" ref={headingMenuRef}>
              <button 
                type="button"
                onClick={() => setShowHeadingMenu(!showHeadingMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white border border-slate-200 hover:bg-slate-50 transition-all group min-w-[60px]"
              >
                 <span className="text-[11px] font-bold text-slate-500 group-hover:text-indigo-600 uppercase">
                    {editor.isActive('heading', { level: 1 }) ? 'H1' : 
                     editor.isActive('heading', { level: 2 }) ? 'H2' : 
                     editor.isActive('heading', { level: 3 }) ? 'H3' : 'P'}
                 </span>
                 <ChevronDown size={12} className="text-slate-400 ml-auto" />
              </button>

              {showHeadingMenu && (
                <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl z-[50] py-1">
                    <button 
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }}
                        className="w-full px-3 py-1.5 text-left text-[11px] font-semibold hover:bg-slate-50 text-slate-600 flex items-center gap-2 cursor-pointer"
                    >
                        <TypeIcon size={12} /> Paragraph
                    </button>
                    <button 
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false); }}
                        className="w-full px-3 py-1.5 text-left text-[11px] font-bold hover:bg-slate-50 text-slate-900 flex items-center gap-2 cursor-pointer"
                    >
                        <Heading1 size={12} /> Heading 1
                    </button>
                    <button 
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); }}
                        className="w-full px-3 py-1.5 text-left text-[11px] font-bold hover:bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                        <Heading2 size={12} /> Heading 2
                    </button>
                    <button 
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowHeadingMenu(false); }}
                        className="w-full px-3 py-1.5 text-left text-[11px] font-bold hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                        <Heading3 size={12} /> Heading 3
                    </button>
                </div>
              )}
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

        <ToolbarDivider />

        <div className="flex items-center gap-0.5">
           <MenuButton onClick={() => fileInputRef.current?.click()} title="Upload Image">
             <ImageIcon size={14} />
           </MenuButton>
           <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
           />
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

        <MenuButton onClick={() => {}} title="Layout Settings">
            <Columns size={14} />
        </MenuButton>
      </div>

      {/* Link Input Overlay */}
      {showLinkInput && (
        <div 
          className="sticky z-[35] p-3 bg-white border-b border-slate-100 flex items-center gap-3 shadow-md"
          style={{ top: stickyOffset + 53 }}
        >
           <div className="flex-1 relative">
             <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
             <input 
               autoFocus
               value={linkUrl}
               onChange={(e) => setLinkUrl(e.target.value)}
               placeholder="https://..."
               className="w-full h-9 pl-9 pr-4 rounded-lg border border-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500"
               onKeyDown={(e) => e.key === 'Enter' && setLink()}
             />
           </div>
           <button type="button" onClick={setLink} className="h-9 px-4 bg-indigo-600 text-white rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition-all">Apply</button>
           <button type="button" onClick={() => setShowLinkInput(false)} className="h-9 px-3 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-all">Cancel</button>
        </div>
      )}
      
      {/* Editor Content Area */}
      <div className="flex-1 bg-white overflow-visible">
         <EditorContent editor={editor} />
      </div>
      
      {/* Footer / Stats */}
      <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-bold text-slate-400">Editor Active</span>
            </div>
            <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-tight">Auto-HTML Output</div>
         </div>
         <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">{editor.storage.characterCount?.characters() || 0} Characters</span>
            <div className="flex items-center gap-1">
               <TypeIcon size={11} />
               <span>UTF-8 HTML</span>
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
          color: #4f46e5;
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
          border-left: 4px solid #6366f1;
          padding-left: 1rem;
          font-style: italic;
          color: #64748b;
        }
        .prose img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1.5rem auto;
          display: block;
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
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .prose table th {
          font-weight: bold;
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
