"use client";

import { useEditor, EditorContent, Extension } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { TextAlign } from "@tiptap/extension-text-align";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Youtube } from "@tiptap/extension-youtube";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  List, 
  ListOrdered, 
  Undo,
  Redo,
  Link as LinkIcon,
  Palette,
  Highlighter,
  ChevronDown,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eye,
  Maximize,
  RefreshCw,
  LayoutPanelLeft,
  CodeXml,
  Trash2,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  FileText,
  UploadCloud,
  Plus,
  GripVertical,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom
} from "lucide-react";
import { clsx } from "clsx";
import { useState, useCallback, useMemo, useEffect, useRef } from "react";

// Custom Extensions
const CustomBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: 'disc',
        parseHTML: element => element.style.listStyleType || 'disc',
        renderHTML: attributes => {
          if (!attributes.listStyleType) return {}
          return { style: `list-style-type: ${attributes.listStyleType}` }
        },
      },
    }
  },
})

const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      listStyleType: {
        default: 'decimal',
        parseHTML: element => element.style.listStyleType || 'decimal',
        renderHTML: attributes => {
          if (!attributes.listStyleType) return {}
          return { style: `list-style-type: ${attributes.listStyleType}` }
        },
      },
    }
  },
})

const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: element => element.style.backgroundColor || null,
        renderHTML: attributes => {
          if (!attributes.backgroundColor) return {}
          return { style: `background-color: ${attributes.backgroundColor}` }
        },
      },
    }
  },
})

const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] } },
  addGlobalAttributes() {
    return [{
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
    }]
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: any) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }: any) => chain().setMark('textStyle', { fontSize: null }).run(),
    } as any
  },
})

// Custom SVGs for precise icons
const TxIcon = ({ size = 13 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7V4h16v3"/><path d="M12 4v16"/><path d="M9 20h6"/><path d="m16 16 6 6"/><path d="m22 16-6 6"/>
  </svg>
);
const ImagePlusIcon = ({ size = 13 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M16 3v6"/><path d="M13 6h6"/>
  </svg>
);
const ImageMinusIcon = ({ size = 13 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/><path d="M13 6h6"/>
  </svg>
);

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  stickyOffset?: number;
}

const ButtonGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center border border-[#cbd5e1] rounded-md bg-white shrink-0">
    {children}
  </div>
);

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  className,
  title,
  noBorderRight = false
}: { 
  onClick: () => void; 
  isActive?: boolean; 
  disabled?: boolean; 
  children: React.ReactNode;
  className?: string;
  title?: string;
  noBorderRight?: boolean;
}) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={clsx(
      "h-8 min-w-[30px] px-1.5 transition-all flex items-center justify-center shrink-0 cursor-pointer relative",
      !noBorderRight && "border-r border-[#cbd5e1]",
      isActive ? "bg-[#0ea5e9] text-white" : "bg-white text-slate-500 hover:bg-slate-50 hover:text-[#0ea5e9]",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </button>
);

export function TipTapEditor({ 
  value, 
  onChange, 
  placeholder = "Start typing...",
  stickyOffset = 0 
}: TipTapEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState("nofollow");
  const [linkTarget, setLinkTarget] = useState("_self");
  
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showCellColorMenu, setShowCellColorMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [showBulletMenu, setShowBulletMenu] = useState(false);
  const [showOrderedMenu, setShowOrderedMenu] = useState(false);
  const [showImagePopover, setShowImagePopover] = useState(false);
  
  const [isHtmlView, setIsHtmlView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  // Forces toolbar to re-render whenever selection or formatting changes
  const [_tick, setTick] = useState(0);

  const headingMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const alignMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const bulletMenuRef = useRef<HTMLDivElement>(null);
  const orderedMenuRef = useRef<HTMLDivElement>(null);
  const imagePopoverRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extensions = useMemo(() => [
    StarterKit.configure({
      bulletList: false,
      orderedList: false,
    }),
    CustomBulletList,
    CustomOrderedList,
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-indigo-600 underline cursor-pointer font-semibold",
      },
    }),
    Placeholder.configure({ placeholder }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    CharacterCount,
    TiptapImage.configure({ inline: true, allowBase64: true }),
    Youtube.configure({ inline: false, width: 840, height: 472.5 }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    CustomTableCell,
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
      setTick(t => t + 1);
    },
    onSelectionUpdate: () => {
      setTick(t => t + 1);
    },
    onTransaction: () => {
      setTick(t => t + 1);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] px-8 pt-6 pb-20 text-[14px] font-medium text-slate-700 leading-relaxed",
      },
    },
  });

  // Sync value from parent while preserving selection
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (editor.isFocused) {
        const { from, to } = editor.state.selection;
        editor.commands.setContent(value || "", { emitUpdate: false });
        try {
          editor.commands.setTextSelection({ from, to });
        } catch (e) {}
      } else {
        editor.commands.setContent(value || "", { emitUpdate: false });
      }
    }
  }, [value, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isPreview && !isHtmlView);
    }
  }, [isPreview, isHtmlView, editor]);

  // Handle clicks outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headingMenuRef.current && !headingMenuRef.current.contains(event.target as Node)) setShowHeadingMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(event.target as Node)) setShowSizeMenu(false);
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) setShowColorMenu(false);
      if (alignMenuRef.current && !alignMenuRef.current.contains(event.target as Node)) setShowAlignMenu(false);
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target as Node)) {
        setShowTableMenu(false);
        setShowCellColorMenu(false);
      }
      if (bulletMenuRef.current && !bulletMenuRef.current.contains(event.target as Node)) setShowBulletMenu(false);
      if (orderedMenuRef.current && !orderedMenuRef.current.contains(event.target as Node)) setShowOrderedMenu(false);
      if (imagePopoverRef.current && !imagePopoverRef.current.contains(event.target as Node)) setShowImagePopover(false);
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
      rel: linkType,
      target: linkTarget === "_blank" ? "_blank" : undefined
    }).run();
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl, linkType, linkTarget]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editor) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const content = readerEvent.target?.result as string;
        editor.chain().focus().setImage({ src: content }).run();
        setShowImagePopover(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    if (editor?.isActive('image')) {
      editor.chain().focus().deleteSelection().run();
    }
  };

  if (!editor) return null;

  // Returns the actual font size for the current selection (explicit or node default)
  const getCurrentFontSize = (): string => {
    const explicit = editor.getAttributes('textStyle').fontSize;
    if (explicit) return explicit.replace('px', '');
    if (editor.isActive('heading', { level: 1 })) return '24';
    if (editor.isActive('heading', { level: 2 })) return '20';
    if (editor.isActive('heading', { level: 3 })) return '18';
    return '14'; // default paragraph
  };

  // Returns the current block type label
  const getCurrentHeadingType = (): string => {
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    return 'P';
  };

  const currentFontSize = getCurrentFontSize();
  const currentHeadingType = getCurrentHeadingType();
  const hasExplicitFontSize = !!editor.getAttributes('textStyle').fontSize;

  return (
    <div className={clsx(
      "border border-[#cbd5e1] rounded-md bg-white flex flex-col transition-all relative cursor-text",
      isFullscreen ? "fixed inset-0 z-[100] m-0 rounded-none shadow-2xl overflow-hidden" : "min-h-[500px]"
    )}>
      {/* Toolbar */}
      {!isPreview && (
      <div 
        className="flex flex-wrap items-center gap-1.5 p-2 bg-white border-b border-[#cbd5e1] overflow-visible shadow-sm"
        style={{ top: stickyOffset, position: isFullscreen ? 'static' : 'sticky', zIndex: 40 }}
      >
        <ButtonGroup>
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold"><Bold size={13} /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic"><Italic size={13} /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline"><UnderlineIcon size={13} /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive("strike")} title="Strikethrough" noBorderRight><Strikethrough size={13} /></MenuButton>
        </ButtonGroup>

        <ButtonGroup>
          <div className="relative border-r border-[#cbd5e1]" ref={colorMenuRef}>
            <MenuButton onClick={() => setShowColorMenu(!showColorMenu)} isActive={showColorMenu || !!editor.getAttributes('textStyle').color} title="Text Color" noBorderRight>
              <Palette size={13} style={{ color: editor.getAttributes('textStyle').color }} />
            </MenuButton>
            {showColorMenu && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-[60] p-3">
                  <div className="grid grid-cols-5 gap-2">
                      {['#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#64748b', '#94a3b8', '#cbd5e1'].map((color) => (
                          <button key={color} type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(color).run(); setShowColorMenu(false); }} className="w-6 h-6 rounded border border-slate-200 hover:scale-110" style={{ backgroundColor: color }} />
                      ))}
                      <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColorMenu(false); }} className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-red-500 hover:bg-slate-50"><Trash2 size={12}/></button>
                  </div>
              </div>
            )}
          </div>
          <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight" noBorderRight>
            <Highlighter size={13} />
          </MenuButton>
        </ButtonGroup>
        
        <ButtonGroup>
          <div className="relative" ref={sizeMenuRef}>
            <MenuButton onClick={() => setShowSizeMenu(!showSizeMenu)} isActive={hasExplicitFontSize || showSizeMenu} title="Font Size" noBorderRight>
               <span className="text-[12px] font-medium leading-none">{currentFontSize}</span>
               <ChevronDown size={11} className="opacity-70 ml-1" />
            </MenuButton>
            {showSizeMenu && (
              <div className="absolute top-full left-0 mt-1 w-16 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1">
                  {['11px', '12px', '14px', '16px', '18px', '24px', '32px'].map((size) => (
                      <button key={size} type="button" onMouseDown={(e) => { e.preventDefault(); (editor.commands as any).setFontSize(size); setShowSizeMenu(false); }} className={clsx("w-full px-3 py-1.5 text-center text-[12px] transition-colors", currentFontSize === size.replace('px','') ? "bg-[#0ea5e9] text-white font-semibold" : "hover:bg-slate-50 text-slate-700")}>
                          {size.replace('px', '')}
                      </button>
                  ))}
              </div>
            )}
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <div className="relative" ref={headingMenuRef}>
            <MenuButton onClick={() => setShowHeadingMenu(!showHeadingMenu)} isActive={editor.isActive('heading') || showHeadingMenu} title="Format" noBorderRight>
               <span className="text-[12px] font-medium leading-none">{currentHeadingType}</span>
               <ChevronDown size={11} className="opacity-70 ml-1" />
            </MenuButton>
            {showHeadingMenu && (
              <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setParagraph().run(); setShowHeadingMenu(false); }} className={clsx("w-full px-3 py-1.5 text-left text-[12px] transition-colors", currentHeadingType === 'P' ? "bg-[#0ea5e9] text-white font-semibold" : "hover:bg-slate-50 text-slate-700")}>Paragraph</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run(); setShowHeadingMenu(false); }} className={clsx("w-full px-3 py-1.5 text-left text-[12px] font-bold transition-colors", currentHeadingType === 'H1' ? "bg-[#0ea5e9] text-white" : "hover:bg-slate-50 text-slate-900")}>Heading 1</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run(); setShowHeadingMenu(false); }} className={clsx("w-full px-3 py-1.5 text-left text-[12px] font-bold transition-colors", currentHeadingType === 'H2' ? "bg-[#0ea5e9] text-white" : "hover:bg-slate-50 text-slate-800")}>Heading 2</button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 3 }).run(); setShowHeadingMenu(false); }} className={clsx("w-full px-3 py-1.5 text-left text-[12px] font-bold transition-colors", currentHeadingType === 'H3' ? "bg-[#0ea5e9] text-white" : "hover:bg-slate-50 text-slate-700")}>Heading 3</button>
              </div>
            )}
          </div>
        </ButtonGroup>

        <ButtonGroup>
          {/* Bullet List */}
          <div className="relative border-r border-[#cbd5e1]" ref={bulletMenuRef}>
            <MenuButton onClick={() => setShowBulletMenu(!showBulletMenu)} isActive={editor.isActive('bulletList')} title="Bullet List" noBorderRight>
               <List size={13} onClick={(e) => { e.stopPropagation(); editor.chain().focus().toggleBulletList().run(); }} />
               <ChevronDown size={11} className="opacity-70 ml-1" />
            </MenuButton>
            {showBulletMenu && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1">
                  {[
                    { label: 'Disc', value: 'disc', icon: '•' },
                    { label: 'Circle', value: 'circle', icon: '○' },
                    { label: 'Square', value: 'square', icon: '■' },
                    { label: 'Dash', value: '"\\2014 "', icon: '—' },
                    { label: 'Arrow', value: '"\\2192 "', icon: '→' },
                    { label: 'Check', value: '"\\2713 "', icon: '✓' },
                    { label: 'Star', value: '"\\2605 "', icon: '★' },
                  ].map(style => (
                    <button key={style.value} type="button" onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).toggleBulletList({ listStyleType: style.value }).run(); setShowBulletMenu(false); }} className="w-full px-3 py-1.5 text-left text-[13px] hover:bg-slate-50 text-[#334155] flex items-center gap-3">
                      <span className="w-4 text-center font-bold">{style.icon}</span> {style.label}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Ordered List */}
          <div className="relative" ref={orderedMenuRef}>
            <MenuButton onClick={() => setShowOrderedMenu(!showOrderedMenu)} isActive={editor.isActive('orderedList')} title="Numbered List" noBorderRight>
               <ListOrdered size={13} onClick={(e) => { e.stopPropagation(); editor.chain().focus().toggleOrderedList().run(); }} />
               <ChevronDown size={11} className="opacity-70 ml-1" />
            </MenuButton>
            {showOrderedMenu && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1">
                  {[
                    { label: '1, 2, 3 (Decimal)', value: 'decimal' },
                    { label: '01, 02, 03 (Leading zero)', value: 'decimal-leading-zero' },
                    { label: 'a, b, c (Lower alpha)', value: 'lower-alpha' },
                    { label: 'A, B, C (Upper alpha)', value: 'upper-alpha' },
                    { label: 'i, ii, iii (Lower roman)', value: 'lower-roman' },
                    { label: 'I, II, III (Upper roman)', value: 'upper-roman' },
                  ].map(style => (
                    <button key={style.value} type="button" onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).toggleOrderedList({ listStyleType: style.value }).run(); setShowOrderedMenu(false); }} className="w-full px-3 py-2 text-left text-[13px] hover:bg-slate-50 text-[#334155]">
                      {style.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <div className="relative border-r border-[#cbd5e1]">
            <MenuButton onClick={() => setShowLinkInput(!showLinkInput)} isActive={editor.isActive("link")} title="Link" noBorderRight>
              <LinkIcon size={13} />
            </MenuButton>
            {showLinkInput && !isPreview && (
              <div className="absolute top-full left-0 mt-1 w-[320px] bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col gap-4 p-4 z-[60]">
                 {/* URL Input */}
                 <div>
                   <input 
                     autoFocus
                     value={linkUrl}
                     onChange={(e) => setLinkUrl(e.target.value)}
                     placeholder="https://example.com"
                     className="w-full h-10 px-3 rounded-md border border-[#cbd5e1] text-[14px] text-slate-700 placeholder-[#94a3b8] focus:outline-none focus:border-[#3b82f6]"
                     onKeyDown={(e) => e.key === 'Enter' && setLink()}
                   />
                 </div>
                 
                 {/* Link Type and Target Dropdowns */}
                 <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[14px] font-medium text-[#334155]">Link type</label>
                     <select 
                       value={linkType}
                       onChange={(e) => setLinkType(e.target.value)}
                       className="w-full h-10 px-3 rounded-md border border-[#cbd5e1] text-[14px] text-slate-700 focus:outline-none focus:border-[#3b82f6] bg-white appearance-none cursor-pointer"
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                     >
                       <option value="nofollow">nofollow (default)</option>
                       <option value="dofollow">dofollow</option>
                     </select>
                   </div>
                   <div className="flex flex-col gap-1.5">
                     <label className="text-[14px] font-medium text-[#334155]">Open link in</label>
                     <select 
                       value={linkTarget}
                       onChange={(e) => setLinkTarget(e.target.value)}
                       className="w-full h-10 px-3 rounded-md border border-[#cbd5e1] text-[14px] text-slate-700 focus:outline-none focus:border-[#3b82f6] bg-white appearance-none cursor-pointer"
                       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23475569'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em 1.2em' }}
                     >
                       <option value="_self">Open in Same Tab</option>
                       <option value="_blank">Open in New Tab</option>
                     </select>
                   </div>
                 </div>

                 {/* Buttons */}
                 <div className="flex justify-end gap-2 mt-1">
                   <button type="button" onClick={() => setShowLinkInput(false)} className="h-9 px-4 rounded border border-[#cbd5e1] text-[14px] text-[#334155] bg-white hover:bg-slate-50 transition-all font-medium">Cancel</button>
                   <button type="button" onClick={setLink} className="h-9 px-4 rounded border border-[#0284c7] bg-[#0284c7] text-white text-[14px] hover:bg-[#0369a1] transition-all font-medium">Add Link</button>
                 </div>
              </div>
            )}
          </div>
          <MenuButton onClick={() => {}} title="Refresh">
            <RefreshCw size={13} />
          </MenuButton>
          <MenuButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Format" noBorderRight>
            <TxIcon size={13} />
          </MenuButton>
        </ButtonGroup>

        <ButtonGroup>
          <div className="relative border-r border-[#cbd5e1]" ref={imagePopoverRef}>
             <MenuButton onClick={() => setShowImagePopover(!showImagePopover)} title="Upload Image" noBorderRight>
               <ImagePlusIcon size={13} />
             </MenuButton>
             <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
             
             {showImagePopover && (
                <div className="absolute top-full left-0 mt-1 w-[260px] bg-white border border-slate-200 rounded-lg shadow-lg z-[60] p-4 flex items-center justify-between">
                   <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-md text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-all">
                     <UploadCloud size={16} /> Upload file
                   </button>
                   <button type="button" onClick={() => setShowImagePopover(false)} className="text-[14px] font-medium text-slate-500 hover:text-slate-700">
                     Cancel
                   </button>
                </div>
             )}
          </div>
          <MenuButton onClick={removeSelectedImage} disabled={!editor.isActive('image')} title="Remove Image" noBorderRight>
            <ImageMinusIcon size={13} />
          </MenuButton>
        </ButtonGroup>

        <ButtonGroup>
          <div className="relative" ref={alignMenuRef}>
            <MenuButton onClick={() => setShowAlignMenu(!showAlignMenu)} isActive={editor.isActive({ textAlign: 'center' }) || editor.isActive({ textAlign: 'right' }) || editor.isActive({ textAlign: 'justify' }) || showAlignMenu} title="Text Alignment" noBorderRight>
               {editor.isActive({ textAlign: 'center' }) ? <AlignCenter size={13} /> :
                editor.isActive({ textAlign: 'right' }) ? <AlignRight size={13} /> :
                editor.isActive({ textAlign: 'justify' }) ? <AlignJustify size={13} /> :
                <AlignLeft size={13} />}
               <ChevronDown size={11} className="opacity-70 ml-1" />
            </MenuButton>
            {showAlignMenu && (
              <div className="absolute top-full left-0 mt-1 w-[120px] bg-white border border-slate-200 rounded-md shadow-lg z-[50] p-1 flex justify-between">
                  <MenuButton onClick={() => { editor.chain().focus().setTextAlign('left').run(); setShowAlignMenu(false); }} isActive={editor.isActive({ textAlign: 'left' })} noBorderRight><AlignLeft size={13} /></MenuButton>
                  <MenuButton onClick={() => { editor.chain().focus().setTextAlign('center').run(); setShowAlignMenu(false); }} isActive={editor.isActive({ textAlign: 'center' })} noBorderRight><AlignCenter size={13} /></MenuButton>
                  <MenuButton onClick={() => { editor.chain().focus().setTextAlign('right').run(); setShowAlignMenu(false); }} isActive={editor.isActive({ textAlign: 'right' })} noBorderRight><AlignRight size={13} /></MenuButton>
                  <MenuButton onClick={() => { editor.chain().focus().setTextAlign('justify').run(); setShowAlignMenu(false); }} isActive={editor.isActive({ textAlign: 'justify' })} noBorderRight><AlignJustify size={13} /></MenuButton>
              </div>
            )}
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <div className="relative" ref={tableMenuRef}>
            <MenuButton onClick={() => setShowTableMenu(!showTableMenu)} isActive={editor.isActive('table')} title="Table Operations" noBorderRight>
               <TableIcon size={13} />
               <ChevronDown size={11} className="opacity-70 ml-1" />
            </MenuButton>
            {showTableMenu && (
              <div className="absolute top-full left-0 mt-1 w-[280px] bg-white border border-slate-200 rounded-md shadow-lg z-[60] py-2 flex flex-col text-[13px] text-slate-700">
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setShowTableMenu(false); }} className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3">
                    <Plus size={14} className="text-slate-500" /> Insert Table (3x3)
                  </button>
                  <div className="h-px bg-slate-100 my-1" />
                  <div className="w-full px-4 py-2 text-left text-slate-400 flex items-center gap-3">
                    <GripVertical size={14} className="text-slate-300" /> Drag rows: use the handle on the left of each row.
                  </div>
                  <div className="h-px bg-slate-100 my-1" />
                  <label className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-3 cursor-pointer">
                    <div className="relative w-4 h-4 rounded-[3px] bg-[#fbbf24] overflow-hidden flex-shrink-0">
                      <input 
                        type="color" 
                        defaultValue="#fbbf24"
                        title="Choose cell background color"
                        className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 cursor-pointer"
                        onChange={(e) => { 
                          if (editor.isActive('table')) { 
                            editor.chain().focus().setCellAttribute('backgroundColor', e.target.value).run(); 
                          } 
                        }}
                      /> 
                    </div>
                    <span className="text-slate-700">Cell background color</span>
                  </label>
                  <div className="h-px bg-slate-100 my-1" />
                  
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }} className="w-full px-4 py-2 text-left text-slate-400 hover:bg-slate-50 flex items-center gap-3">
                    <PanelLeft size={14} /> Add Column Before
                  </button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }} className="w-full px-4 py-2 text-left text-slate-400 hover:bg-slate-50 flex items-center gap-3">
                    <PanelRight size={14} /> Add Column After
                  </button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }} className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-50 flex items-center gap-3">
                    <Trash2 size={14} /> Delete Column
                  </button>
                  
                  <div className="h-px bg-slate-100 my-1" />
                  
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }} className="w-full px-4 py-2 text-left text-slate-400 hover:bg-slate-50 flex items-center gap-3">
                    <PanelTop size={14} /> Add Row Before
                  </button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }} className="w-full px-4 py-2 text-left text-slate-400 hover:bg-slate-50 flex items-center gap-3">
                    <PanelBottom size={14} /> Add Row After
                  </button>
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }} className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-50 flex items-center gap-3">
                    <Trash2 size={14} /> Delete Row
                  </button>
                  
                  <div className="h-px bg-slate-100 my-1" />
                  
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }} className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-50 flex items-center gap-3">
                    <Trash2 size={14} /> Delete Table
                  </button>
              </div>
            )}
          </div>
        </ButtonGroup>

        <ButtonGroup>
          <MenuButton onClick={() => {}} title="Layout" noBorderRight>
            <LayoutPanelLeft size={13} /><ChevronDown size={11} className="opacity-70 ml-1" />
          </MenuButton>
        </ButtonGroup>

        <ButtonGroup>
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={13} /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={13} /></MenuButton>
          <MenuButton onClick={() => setIsPreview(!isPreview)} isActive={isPreview} title="Preview Mode"><Eye size={13} /></MenuButton>
          <MenuButton onClick={() => setIsFullscreen(!isFullscreen)} isActive={isFullscreen} title="Fullscreen Mode" noBorderRight><Maximize size={13} /></MenuButton>
        </ButtonGroup>

        <ButtonGroup>
          <MenuButton onClick={() => {}} title="Document"><FileText size={13} /></MenuButton>
          <MenuButton onClick={() => setIsHtmlView(!isHtmlView)} isActive={isHtmlView} title="HTML View" noBorderRight><CodeXml size={13} /></MenuButton>
        </ButtonGroup>

      </div>
      )}

      {/* Editor Content Area */}
      <div className={clsx("flex-1 bg-white overflow-visible transition-all rounded-b-md", isFullscreen && "h-full overflow-y-auto")}>
         {isHtmlView ? (
           <textarea
             className="w-full h-full min-h-[400px] p-6 text-sm font-mono text-slate-700 bg-slate-50 focus:outline-none resize-none rounded-b-md"
             value={editor.getHTML()}
             onChange={(e) => editor.commands.setContent(e.target.value)}
           />
         ) : (
           <EditorContent editor={editor} />
         )}
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
          cursor: text;
        }
        .prose h1 {
          font-size: 24px !important;
          font-weight: 700 !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.3 !important;
          color: #0f172a !important;
        }
        .prose h2 {
          font-size: 20px !important;
          font-weight: 700 !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.35 !important;
          color: #0f172a !important;
        }
        .prose h3 {
          font-size: 18px !important;
          font-weight: 600 !important;
          margin-top: 1.25em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #0f172a !important;
        }
        .prose p {
          font-size: 14px !important;
          line-height: 1.7142857 !important;
          margin-top: 0 !important;
          margin-bottom: 1em !important;
          color: #475569 !important;
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
        .prose img.ProseMirror-selectednode {
          outline: 3px solid #0ea5e9;
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
