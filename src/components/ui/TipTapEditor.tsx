"use client";

import { useEditor, EditorContent, Extension, Node } from "@tiptap/react";
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
import { NodeViewWrapper, ReactNodeViewRenderer, NodeViewProps } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
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
  FileText,
  UploadCloud,
  Plus,
  GripVertical,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Sparkles,
  SlidersHorizontal
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

const CustomTableHeader = TableHeader.extend({
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

const CustomTableRow = TableRow.extend({
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

const TableEnterKey = Extension.create({
  name: 'tableEnterKey',
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        if (this.editor.isActive('table')) {
          const { state } = this.editor;
          const { $from } = state.selection;
          
          let tableDepth = -1;
          for (let d = $from.depth; d > 0; d--) {
            if ($from.node(d).type.name === 'table') {
              tableDepth = d;
              break;
            }
          }

          if (tableDepth > 0) {
            const tableNode = $from.node(tableDepth);
            const rowIndex = $from.index(tableDepth);
            const rowNode = $from.node(tableDepth + 1);
            
            if (rowNode && rowNode.type.name === 'tableRow') {
              const cellIndex = $from.index(tableDepth + 1);
              
              // Check if it's the last row and last cell
              if (rowIndex === tableNode.childCount - 1 && cellIndex === rowNode.childCount - 1) {
                this.editor.commands.addRowAfter();
                return true; // prevent default
              }
            }
          }
        }
        return false; // let default behavior handle it (add newline) for other cells
      },
      'Shift-Enter': () => {
        if (this.editor.isActive('table')) {
          this.editor.commands.splitBlock();
          return true;
        }
        return false;
      }
    };
  },
});

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

// React Image NodeView to handle resizable, cropable, movable, and auto-fit functionalities
const ImageNodeView = (props: NodeViewProps) => {
  const { node, updateAttributes, selected } = props;
  const [isCropping, setIsCropping] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Crop percentages
  const [cropLeft, setCropLeft] = useState(0);
  const [cropRight, setCropRight] = useState(0);
  const [cropTop, setCropTop] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);

  const width = node.attrs.width || '100%';
  const alignment = node.attrs.alignment || 'center';
  const float = node.attrs.float || 'none';
  const src = node.attrs.src;

  const handleAlign = (align: 'left' | 'center' | 'right') => {
    updateAttributes({ alignment: align, float: 'none' });
  };

  const handleFloat = (fl: 'left' | 'right' | 'none') => {
    updateAttributes({ float: fl, alignment: fl === 'none' ? 'center' : 'left' });
  };

  const handleResize = (pct: string) => {
    updateAttributes({ width: pct });
  };

  const handleApplyCrop = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;

      const x = (cropLeft / 100) * originalWidth;
      const y = (cropTop / 100) * originalHeight;
      const w = originalWidth - x - ((cropRight / 100) * originalWidth);
      const h = originalHeight - y - ((cropBottom / 100) * originalHeight);

      if (w <= 0 || h <= 0) return;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
        try {
          const croppedSrc = canvas.toDataURL();
          updateAttributes({ src: croppedSrc });
        } catch (e) {
          console.error("Failed to crop image (likely CORS canvas taint):", e);
        }
      }
      setIsCropping(false);
      // Reset sliders
      setCropLeft(0);
      setCropRight(0);
      setCropTop(0);
      setCropBottom(0);
    };
    img.src = src;
  };

  // Drag to resize handler
  const handleDragResizeStart = (e: React.MouseEvent, direction: 'e' | 's' | 'se' | 'w' | 'n' | 'nw' | 'ne' | 'sw') => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = imgRef.current ? imgRef.current.clientWidth : 300;

    const onMouseMove = (moveEvent: MouseEvent) => {
      let deltaX = moveEvent.clientX - startX;
      let newWidth = startWidth;

      if (direction.includes('e')) {
        newWidth = Math.max(40, startWidth + deltaX);
      } else if (direction.includes('w')) {
        newWidth = Math.max(40, startWidth - deltaX);
      }

      // Convert width to pixel representation to set it explicitly
      updateAttributes({ width: `${newWidth}px` });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const displayStyle = alignment === 'center' ? 'block' : 'inline-block';
  const floatStyle = alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'none';
  const marginStyle = alignment === 'left' 
    ? '0.5rem 1.5rem 1rem 0' 
    : alignment === 'right' 
      ? '0.5rem 0 1rem 1.5rem' 
      : '1.5rem auto';

  return (
    <NodeViewWrapper 
      as="span"
      contentEditable={false} 
      className="transition-all inline-block align-middle" 
      style={{ 
        display: displayStyle,
        float: floatStyle !== 'none' ? floatStyle : undefined,
        margin: marginStyle,
        width: width,
        maxWidth: '100%'
      }}
    >
      <span className="relative group block w-full max-w-full rounded-lg">
        {isCropping ? (
          <div className="bg-slate-900 p-4 rounded-lg text-white max-w-[400px] mx-auto space-y-4">
            <div className="text-xs font-bold text-sky-400">Visual Crop Adjuster</div>
            
            <div className="relative border border-slate-700 bg-slate-950 rounded overflow-hidden flex items-center justify-center h-48">
              <img src={src} className="max-h-full max-w-full opacity-30" />
              <div 
                className="absolute border-2 border-dashed border-sky-400 bg-sky-400/10 transition-all pointer-events-none"
                style={{
                  left: `${cropLeft}%`,
                  right: `${cropRight}%`,
                  top: `${cropTop}%`,
                  bottom: `${cropBottom}%`
                }}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span>Trim Left: {cropLeft}%</span>
                <input type="range" min="0" max="80" value={cropLeft} onChange={e => setCropLeft(Number(e.target.value))} className="w-2/3 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400" />
              </div>
              <div className="flex justify-between items-center">
                <span>Trim Right: {cropRight}%</span>
                <input type="range" min="0" max="80" value={cropRight} onChange={e => setCropRight(Number(e.target.value))} className="w-2/3 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400" />
              </div>
              <div className="flex justify-between items-center">
                <span>Trim Top: {cropTop}%</span>
                <input type="range" min="0" max="80" value={cropTop} onChange={e => setCropTop(Number(e.target.value))} className="w-2/3 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400" />
              </div>
              <div className="flex justify-between items-center">
                <span>Trim Bottom: {cropBottom}%</span>
                <input type="range" min="0" max="80" value={cropBottom} onChange={e => setCropBottom(Number(e.target.value))} className="w-2/3 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400" />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setIsCropping(false)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs rounded transition cursor-pointer">Cancel</button>
              <button type="button" onClick={handleApplyCrop} className="px-3 py-1 bg-sky-500 hover:bg-sky-600 text-xs text-white rounded transition cursor-pointer font-bold">Apply Crop</button>
            </div>
          </div>
        ) : (
          <span className={clsx("relative block w-full max-w-full rounded-lg", selected ? "ring-2 ring-sky-500 ring-offset-2" : "")}>
            <img 
              ref={imgRef}
              src={src} 
              style={{ 
                width: '100%', 
                maxWidth: '100%', 
                height: 'auto',
                display: 'block',
                margin: 0
              }} 
              className="max-w-full height-auto block rounded-lg cursor-default"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (props.editor) {
                  const { state, view } = props.editor;
                  const pos = props.getPos();
                  if (typeof pos === 'number') {
                    const transaction = state.tr.setSelection(NodeSelection.create(state.doc, pos));
                    view.dispatch(transaction);
                  }
                }
              }}
            />

            {/* Bounding Box Visuals with Grab Handles matching the user's uploaded mock exactly */}
            {selected && (
              <>
                {/* 8 Bounding Resizing Handle Dots */}
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 'nw')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Top-Left"
                />
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 'n')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Top-Center"
                />
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 'ne')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 cursor-nesw-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Top-Right"
                />
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 'w')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Middle-Left"
                />
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 'e')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 cursor-ew-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Middle-Right"
                />
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 'sw')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 cursor-nesw-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Bottom-Left"
                />
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 's')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Bottom-Center"
                />
                <div 
                  onMouseDown={(e) => handleDragResizeStart(e, 'se')}
                  className="w-3 h-3 bg-white border-2 border-[#0284c7] rounded-full absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 cursor-nwse-resize z-30 hover:bg-[#0284c7] transition-all"
                  title="Resize Bottom-Right"
                />
              </>
            )}
          </span>
        )}
      </span>
    </NodeViewWrapper>
  );
};

const CustomImage = TiptapImage.extend({
  inline: true,
  group: 'inline',
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '50%',
        parseHTML: element => element.getAttribute('width') || element.style.width || '50%',
        renderHTML: attributes => ({
          width: attributes.width
        })
      },
      alignment: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-alignment') || 'left',
        renderHTML: attributes => ({
          'data-alignment': attributes.alignment,
        })
      },
      float: {
        default: 'left',
        parseHTML: element => element.style.float || 'left',
        renderHTML: attributes => ({
          'data-float': attributes.float
        })
      }
    };
  },
  renderHTML({ HTMLAttributes }) {
    const alignment = HTMLAttributes['data-alignment'] || 'left';
    const width = HTMLAttributes['width'] || '50%';
    
    let floatStyle = '';
    let marginStyle = '';
    let displayStyle = '';
    
    if (alignment === 'left') {
      floatStyle = 'float: left;';
      marginStyle = 'margin: 0.5rem 1.5rem 1rem 0;';
      displayStyle = 'display: inline-block;';
    } else if (alignment === 'right') {
      floatStyle = 'float: right;';
      marginStyle = 'margin: 0.5rem 0 1rem 1.5rem;';
      displayStyle = 'display: inline-block;';
    } else {
      floatStyle = 'float: none;';
      marginStyle = 'margin: 1.5rem auto;';
      displayStyle = 'display: block;';
    }
    
    const style = `${displayStyle} ${floatStyle} ${marginStyle} width: ${width}; max-width: 100%; height: auto;`;
    
    return ['img', {
      ...HTMLAttributes,
      style: style.trim()
    }];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  }
});

// React NodeView for the Image Upload Placeholder
const PlaceholderNodeView = (props: NodeViewProps) => {
  const { node, selected } = props;
  const alignment = node.attrs.alignment || 'left';
  const width = node.attrs.width || '300px';

  const displayStyle = alignment === 'center' ? 'block' : 'inline-block';
  const floatStyle = alignment === 'left' ? 'left' : alignment === 'right' ? 'right' : 'none';
  const marginStyle = alignment === 'left' 
    ? '0.5rem 1.5rem 1rem 0' 
    : alignment === 'right' 
      ? '0.5rem 0 1rem 1.5rem' 
      : '1.5rem auto';

  return (
    <NodeViewWrapper
      contentEditable={false}
      style={{
        display: displayStyle,
        float: floatStyle !== 'none' ? floatStyle : undefined,
        margin: marginStyle,
        width: width,
        maxWidth: '100%',
        verticalAlign: 'top'
      }}
      className="transition-all"
    >
      <div 
        className={clsx(
          "border-2 border-dashed border-[#0284c7] bg-[#f0f9ff] hover:bg-[#e0f2fe] rounded-lg p-6 text-center cursor-pointer transition-colors flex flex-col items-center justify-center min-h-[140px] select-none",
          selected ? "ring-2 ring-sky-500 ring-offset-2" : ""
        )}
      >
        <UploadCloud size={24} className="text-[#0284c7] mb-2 animate-bounce" />
        <span className="text-[13px] text-[#0284c7] font-bold block">Click to Upload Image</span>
        <span className="text-[10px] text-slate-500 mt-1 block">
          {alignment === 'left' ? 'Image Left Layout' : alignment === 'right' ? 'Image Right Layout' : 'Center Image Layout'}
        </span>
      </div>
    </NodeViewWrapper>
  );
};

const ImageUploadPlaceholder = Node.create({
  name: 'imageUploadPlaceholder',
  inline: true,
  group: 'inline',
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      alignment: {
        default: 'left',
        parseHTML: element => element.getAttribute('data-alignment') || 'left',
        renderHTML: attributes => ({
          'data-alignment': attributes.alignment,
        })
      },
      width: {
        default: '300px',
        parseHTML: element => element.getAttribute('width') || element.style.width || '300px',
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}; max-width: 100%;`
        })
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'image-upload-placeholder',
      }
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['image-upload-placeholder', HTMLAttributes];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PlaceholderNodeView);
  }
});


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
  minHeight?: string;
}

const MenuButton = ({ 
  onClick, 
  isActive = false, 
  disabled = false, 
  children,
  className,
  title,
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
      "h-8 min-w-[32px] px-2 transition-all flex items-center justify-center shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
      isActive 
        ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" 
        : "bg-white border-[#cbd5e1] hover:bg-slate-50 hover:border-[#0284c7]",
      disabled && "opacity-40 cursor-not-allowed",
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
  stickyOffset = 0,
  minHeight = "400px"
}: TipTapEditorProps) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkType, setLinkType] = useState("nofollow");
  const [linkTarget, setLinkTarget] = useState("_self");
  
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showAlignMenu, setShowAlignMenu] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [tableGridHover, setTableGridHover] = useState({ rows: 0, cols: 0 });
  const [showBulletMenu, setShowBulletMenu] = useState(false);
  const [showOrderedMenu, setShowOrderedMenu] = useState(false);
  const [showImagePopover, setShowImagePopover] = useState(false);
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showSliderMenu, setShowSliderMenu] = useState(false);
  const [showSparklesMenu, setShowSparklesMenu] = useState(false);
  
  const [isHtmlView, setIsHtmlView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [_tick, setTick] = useState(0);

  const handleAlignSelect = (align: 'left' | 'center' | 'right' | 'justify') => {
    if (!editor) return;
    const targetAlign = align === 'justify' ? 'center' : align;
    if (editor.isActive('image')) {
      editor.chain().focus().updateAttributes('image', { alignment: targetAlign }).run();
    } else if (editor.isActive('imageUploadPlaceholder')) {
      editor.chain().focus().updateAttributes('imageUploadPlaceholder', { alignment: targetAlign }).run();
    } else {
      editor.chain().focus().setTextAlign(align).run();
    }
    setShowAlignMenu(false);
  };

  const headingMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);
  const alignMenuRef = useRef<HTMLDivElement>(null);
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const bulletMenuRef = useRef<HTMLDivElement>(null);
  const orderedMenuRef = useRef<HTMLDivElement>(null);
  const imagePopoverRef = useRef<HTMLDivElement>(null);
  const layoutMenuRef = useRef<HTMLDivElement>(null);
  const sliderMenuRef = useRef<HTMLDivElement>(null);
  const sparklesMenuRef = useRef<HTMLDivElement>(null);
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
    CustomImage,
    ImageUploadPlaceholder,
    Youtube.configure({ inline: false, width: 840, height: 472.5 }),
    Table.configure({ resizable: true }),
    CustomTableRow,
    CustomTableHeader,
    CustomTableCell,
    TableEnterKey,
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
        class: "prose prose-sm max-w-none focus:outline-none px-8 pt-6 pb-20 text-[14px] font-medium text-slate-700 leading-relaxed min-h-[400px]",
        style: `min-height: ${minHeight};`,
      },
      handleClick(view, pos, event) {
        const target = event.target as HTMLElement;
        const placeholder = target.closest('image-upload-placeholder') || target.closest('.image-upload-placeholder');
        if (placeholder) {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (readerEvent) => {
                const src = readerEvent.target?.result as string;
                
                // Get the exact node start position in Prosemirror
                let nodePos = pos;
                try {
                  nodePos = view.posAtDOM(placeholder, 0);
                } catch (err) {
                  // Fallback to resolved position depth if posAtDOM fails
                  const $pos = view.state.doc.resolve(pos);
                  nodePos = $pos.before($pos.depth);
                }
                
                const node = view.state.doc.nodeAt(nodePos);
                if (node && node.type.name === 'imageUploadPlaceholder') {
                  const imgNode = view.state.schema.nodes.image.create({
                    src: src,
                    alignment: node.attrs.alignment,
                    width: node.attrs.width || '300px'
                  });
                  const textNode = view.state.schema.text(' ');
                  const transaction = view.state.tr.replaceWith(
                    nodePos,
                    nodePos + node.nodeSize,
                    [imgNode, textNode]
                  );
                  view.dispatch(transaction);
                } else {
                  // Fallback replacement if it's the old raw class
                  const $pos = view.state.doc.resolve(pos);
                  const from = $pos.before($pos.depth);
                  const to = $pos.after($pos.depth);
                  const imgNode = view.state.schema.nodes.image.create({ src: src });
                  const textNode = view.state.schema.text(' ');
                  const transaction = view.state.tr.replaceWith(
                    from,
                    to,
                    [imgNode, textNode]
                  );
                  view.dispatch(transaction);
                }
              };
              reader.readAsDataURL(file);
            }
          };
          input.click();
          return true; // prevent text focus / select triggers inside the placeholder
        }
        return false;
      }
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
      const target = event.target as globalThis.Node;
      if (headingMenuRef.current && !headingMenuRef.current.contains(target)) setShowHeadingMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(target)) setShowSizeMenu(false);
      if (colorMenuRef.current && !colorMenuRef.current.contains(target)) setShowColorMenu(false);
      if (alignMenuRef.current && !alignMenuRef.current.contains(target)) setShowAlignMenu(false);
      if (tableMenuRef.current && !tableMenuRef.current.contains(target)) setShowTableMenu(false);
      if (bulletMenuRef.current && !bulletMenuRef.current.contains(target)) setShowBulletMenu(false);
      if (orderedMenuRef.current && !orderedMenuRef.current.contains(target)) setShowOrderedMenu(false);
      if (imagePopoverRef.current && !imagePopoverRef.current.contains(target)) setShowImagePopover(false);
      if (layoutMenuRef.current && !layoutMenuRef.current.contains(target)) setShowLayoutMenu(false);
      if (sliderMenuRef.current && !sliderMenuRef.current.contains(target)) setShowSliderMenu(false);
      if (sparklesMenuRef.current && !sparklesMenuRef.current.contains(target)) setShowSparklesMenu(false);
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
        editor.chain().focus().setImage({ src: content }).insertContent(' ').run();
        setShowImagePopover(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    if (!editor) return;
    if (editor.isActive('image') || editor.isActive('imageUploadPlaceholder')) {
      editor.chain().focus().deleteSelection().run();
    }
  };

  const getCurrentFontSize = (): string => {
    if (!editor) return '11';
    const explicit = editor.getAttributes('textStyle').fontSize;
    if (explicit) return explicit.replace('px', '');
    if (editor.isActive('heading', { level: 1 })) return '24';
    if (editor.isActive('heading', { level: 2 })) return '20';
    if (editor.isActive('heading', { level: 3 })) return '18';
    return '11'; 
  };

  const getCurrentHeadingType = (): string => {
    if (!editor) return 'H';
    if (editor.isActive('heading', { level: 1 })) return 'H1';
    if (editor.isActive('heading', { level: 2 })) return 'H2';
    if (editor.isActive('heading', { level: 3 })) return 'H3';
    if (editor.isActive('heading', { level: 4 })) return 'H4';
    if (editor.isActive('heading', { level: 5 })) return 'H5';
    if (editor.isActive('heading', { level: 6 })) return 'H6';
    return 'H';
  };

  const currentFontSize = getCurrentFontSize();
  const currentHeadingType = getCurrentHeadingType();

  if (!editor) {
    return (
      <div 
        className={clsx(
          "border border-[#cbd5e1] rounded-md bg-slate-50/50 animate-pulse",
          isFullscreen ? "fixed inset-0 z-[100] m-0 rounded-none" : ""
        )}
        style={{ minHeight }}
      />
    );
  }

  return (
    <div className={clsx(
      "border border-[#cbd5e1] rounded-md bg-white flex flex-col transition-all relative cursor-text",
      isFullscreen ? "fixed inset-0 z-[100] m-0 rounded-none shadow-2xl overflow-hidden" : ""
    )}>
      {/* Dynamic Global Custom Styles injected directly to make sure styles render correctly */}
      <style dangerouslySetInnerHTML={{ __html: `
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
          color: #0f172a;
          border-left: 4px solid #0284c7 !important;
          padding-left: 12px !important;
        }
        .prose h2 {
          font-size: 20px !important;
          font-weight: 700 !important;
          margin-top: 1.5em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.35 !important;
          color: #0f172a;
          border-left: 4px solid #0284c7 !important;
          padding-left: 12px !important;
        }
        .prose h3 {
          font-size: 18px !important;
          font-weight: 600 !important;
          margin-top: 1.25em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #0f172a;
        }
        .prose h4 {
          font-size: 16px !important;
          font-weight: 600 !important;
          margin-top: 1.25em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #0f172a;
        }
        .prose h5 {
          font-size: 14px !important;
          font-weight: 600 !important;
          margin-top: 1.25em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #0f172a;
        }
        .prose h6 {
          font-size: 12px !important;
          font-weight: 600 !important;
          margin-top: 1.25em !important;
          margin-bottom: 0.5em !important;
          line-height: 1.4 !important;
          color: #0f172a;
        }
        .prose p {
          font-size: 14px !important;
          line-height: 1.7142857 !important;
          margin-top: 0 !important;
          margin-bottom: 1em !important;
          color: #475569;
        }
        .prose ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .prose ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 1rem 0 !important;
        }
        .prose blockquote {
          border-left: 4px solid #0284c7;
          padding-left: 1rem;
          font-style: italic;
          color: #64748b;
          margin: 1rem 0;
        }
        .prose img {
          max-width: 100% !important;
          height: auto !important;
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
        }
        .prose table tr:not([style*="background-color"]) th:not([style*="background-color"]) {
          background-color: #f8fafc;
        }
        .custom-slider-block {
          transition: all 0.3s ease;
        }
        .custom-slider-block:hover {
          background-color: #e0f2fe !important;
        }
      `}} />

      {/* Toolbar */}
      {!isPreview && (
        <div 
          className="flex flex-wrap items-center gap-1.5 p-2 bg-[#f8fafc] border-b border-[#cbd5e1] overflow-visible shadow-sm rounded-t-md"
          style={{ top: stickyOffset, position: isFullscreen ? 'static' : 'sticky', zIndex: 40 }}
        >
          {/* Format controls */}
          <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold"><Bold size={13} /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic"><Italic size={13} /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive("underline")} title="Underline"><UnderlineIcon size={13} /></MenuButton>

          {/* Color & Highlight */}
          <div className="relative" ref={colorMenuRef}>
            <MenuButton onClick={() => setShowColorMenu(!showColorMenu)} isActive={showColorMenu || !!editor.getAttributes('textStyle').color} title="Text Color">
              <Palette size={13} style={{ color: editor.getAttributes('textStyle').color || '#0284c7' }} />
            </MenuButton>
            {showColorMenu && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-[60] p-3">
                <div className="grid grid-cols-5 gap-2">
                  {['#000000', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#64748b', '#94a3b8', '#cbd5e1'].map((color) => (
                    <button key={color} type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().setColor(color).run(); setShowColorMenu(false); }} className="w-6 h-6 rounded border border-slate-200 hover:scale-110 cursor-pointer" style={{ backgroundColor: color }} />
                  ))}
                  <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().unsetColor().run(); setShowColorMenu(false); }} className="w-6 h-6 rounded border border-slate-200 flex items-center justify-center text-red-500 hover:bg-slate-50 cursor-pointer"><Trash2 size={12}/></button>
                </div>
              </div>
            )}
          </div>

          <MenuButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight">
            <Highlighter size={13} />
          </MenuButton>

          {/* Font Size Dropdown */}
          <div className="relative" ref={sizeMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowSizeMenu(!showSizeMenu)} 
              className={clsx(
                "h-8 min-w-[48px] px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                showSizeMenu || !!editor.getAttributes('textStyle').fontSize ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
            >
              <span className="text-[12px] font-bold leading-none">{currentFontSize}</span>
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
            {showSizeMenu && (
              <div className="absolute top-full left-0 mt-1 w-20 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1 max-h-48 overflow-y-auto">
                {['11px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'].map((size) => (
                  <button key={size} type="button" onMouseDown={(e) => { e.preventDefault(); (editor.commands as any).setFontSize(size); setShowSizeMenu(false); }} className={clsx("w-full px-3 py-1.5 text-center text-[12px] transition-colors cursor-pointer", currentFontSize === size.replace('px','') ? "bg-[#0ea5e9] text-white font-semibold" : "hover:bg-slate-50 text-slate-700")}>
                    {size.replace('px', '')}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Paragraph (Separate Button) */}
          <MenuButton 
            onClick={() => editor.chain().focus().setParagraph().run()} 
            isActive={editor.isActive('paragraph')} 
            title="Paragraph"
            className="font-bold text-[12px]"
          >
            P
          </MenuButton>

          {/* Heading Dropdown (H1 - H6) */}
          <div className="relative" ref={headingMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowHeadingMenu(!showHeadingMenu)} 
              className={clsx(
                "h-8 min-w-[44px] px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                editor.isActive('heading') || showHeadingMenu ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
            >
              <span className="text-[12px] font-bold leading-none">{editor.isActive('heading') ? currentHeadingType : 'H'}</span>
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
            {showHeadingMenu && (
              <div className="absolute top-full left-0 mt-1 w-28 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1">
                {[1, 2, 3, 4, 5, 6].map((level) => (
                  <button 
                    key={level} 
                    type="button" 
                    onMouseDown={(e) => { 
                      e.preventDefault(); 
                      editor.chain().focus().toggleHeading({ level: level as any }).run(); 
                      setShowHeadingMenu(false); 
                    }} 
                    className={clsx(
                      "w-full px-3 py-1.5 text-left text-[12px] font-bold transition-colors cursor-pointer", 
                      editor.isActive('heading', { level }) ? "bg-[#0ea5e9] text-white" : "hover:bg-slate-50 text-slate-800"
                    )}
                  >
                    Heading {level}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bullet List Dropdown */}
          <div className="relative" ref={bulletMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowBulletMenu(!showBulletMenu)} 
              className={clsx(
                "h-8 px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                editor.isActive('bulletList') || showBulletMenu ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
            >
              <List size={13} onClick={(e) => { e.stopPropagation(); editor.chain().focus().toggleBulletList().run(); }} />
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
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
                  <button key={style.value} type="button" onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).toggleBulletList({ listStyleType: style.value }).run(); setShowBulletMenu(false); }} className="w-full px-3 py-1.5 text-left text-[13px] hover:bg-slate-50 text-[#334155] flex items-center gap-3 cursor-pointer">
                    <span className="w-4 text-center font-bold">{style.icon}</span> {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Ordered List Dropdown */}
          <div className="relative" ref={orderedMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowOrderedMenu(!showOrderedMenu)} 
              className={clsx(
                "h-8 px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                editor.isActive('orderedList') || showOrderedMenu ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
            >
              <ListOrdered size={13} onClick={(e) => { e.stopPropagation(); editor.chain().focus().toggleOrderedList().run(); }} />
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
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
                  <button key={style.value} type="button" onMouseDown={(e) => { e.preventDefault(); (editor.chain().focus() as any).toggleOrderedList({ listStyleType: style.value }).run(); setShowOrderedMenu(false); }} className="w-full px-3 py-2 text-left text-[13px] hover:bg-slate-50 text-[#334155] cursor-pointer">
                    {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div className="relative">
            <MenuButton onClick={() => setShowLinkInput(!showLinkInput)} isActive={editor.isActive("link")} title="Link">
              <LinkIcon size={13} />
            </MenuButton>
            {showLinkInput && !isPreview && (
              <div className="absolute top-full left-0 mt-1 w-[320px] bg-white border border-slate-200 rounded-lg shadow-xl flex flex-col gap-4 p-4 z-[60]">
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

                <div className="flex justify-end gap-2 mt-1">
                  <button type="button" onClick={() => setShowLinkInput(false)} className="h-9 px-4 rounded border border-[#cbd5e1] text-[14px] text-[#334155] bg-white hover:bg-slate-50 transition-all font-medium cursor-pointer">Cancel</button>
                  <button type="button" onClick={setLink} className="h-9 px-4 rounded border border-[#0284c7] bg-[#0284c7] text-white text-[14px] hover:bg-[#0369a1] transition-all font-medium cursor-pointer">Add Link</button>
                </div>
              </div>
            )}
          </div>

          {/* Sparkles / Wand for Magic Formatting */}
          <div className="relative" ref={sparklesMenuRef}>
            <MenuButton onClick={() => setShowSparklesMenu(!showSparklesMenu)} isActive={showSparklesMenu} title="AI Sparkles/Enhance">
              <Sparkles size={13} />
            </MenuButton>
            {showSparklesMenu && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1 text-slate-700">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    if (editor) {
                      const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ');
                      if (text) {
                        editor.chain().focus().insertContent(`<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem; border-radius: 4px; margin: 1rem 0; color: #166534;">💡 <strong>Professional Highlight:</strong> ${text}</div>`).run();
                      } else {
                        editor.chain().focus().insertContent(`<div style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 1rem; border-radius: 4px; margin: 1rem 0; color: #166534;">💡 <strong>Professional Highlight:</strong> Insert key takeaway here...</div>`).run();
                      }
                    }
                    setShowSparklesMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  ✨ Wrap in Callout Box
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().toggleBold().toggleItalic().run();
                    setShowSparklesMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  ⚡ Make Emphasized
                </button>
              </div>
            )}
          </div>

          {/* Clear Format */}
          <MenuButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Format">
            <TxIcon size={13} />
          </MenuButton>

          {/* Image Uploading / Deleting */}
          <div>
            <MenuButton onClick={() => fileInputRef.current?.click()} title="Upload Image">
              <ImagePlusIcon size={13} />
            </MenuButton>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
          </div>
          <MenuButton onClick={removeSelectedImage} disabled={!editor.isActive('image') && !editor.isActive('imageUploadPlaceholder')} title="Remove Image">
            <ImageMinusIcon size={13} />
          </MenuButton>
          
          {/* Alignment */}
          <div className="relative" ref={alignMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowAlignMenu(!showAlignMenu)} 
              className={clsx(
                "h-8 px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                editor.isActive({ textAlign: 'center' }) || editor.isActive({ textAlign: 'right' }) || editor.isActive({ textAlign: 'justify' }) || 
                editor.isActive('image', { alignment: 'center' }) || editor.isActive('image', { alignment: 'right' }) ||
                editor.isActive('imageUploadPlaceholder', { alignment: 'center' }) || editor.isActive('imageUploadPlaceholder', { alignment: 'right' }) ||
                showAlignMenu ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
            >
              {editor.isActive({ textAlign: 'center' }) || editor.isActive('image', { alignment: 'center' }) || editor.isActive('imageUploadPlaceholder', { alignment: 'center' }) ? <AlignCenter size={13} /> :
               editor.isActive({ textAlign: 'right' }) || editor.isActive('image', { alignment: 'right' }) || editor.isActive('imageUploadPlaceholder', { alignment: 'right' }) ? <AlignRight size={13} /> :
               editor.isActive({ textAlign: 'justify' }) ? <AlignJustify size={13} /> :
               <AlignLeft size={13} />}
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
            {showAlignMenu && (
              <div className="absolute top-full left-0 mt-1 w-[120px] bg-white border border-slate-200 rounded-md shadow-lg z-[50] p-1 flex justify-between">
                <button type="button" onClick={() => handleAlignSelect('left')} className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-50 cursor-pointer text-[#0284c7]"><AlignLeft size={13} /></button>
                <button type="button" onClick={() => handleAlignSelect('center')} className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-50 cursor-pointer text-[#0284c7]"><AlignCenter size={13} /></button>
                <button type="button" onClick={() => handleAlignSelect('right')} className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-50 cursor-pointer text-[#0284c7]"><AlignRight size={13} /></button>
                <button type="button" onClick={() => handleAlignSelect('justify')} className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-50 cursor-pointer text-[#0284c7]"><AlignJustify size={13} /></button>
              </div>
            )}
          </div>

          {/* Layout Columns */}
          <div className="relative" ref={layoutMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowLayoutMenu(!showLayoutMenu)} 
              className={clsx(
                "h-8 px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                showLayoutMenu ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
              title="Insert Layout Columns"
            >
              <LayoutPanelLeft size={13} />
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
            {showLayoutMenu && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1 text-slate-700">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().insertContent(`
                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin: 1.5rem 0;">
                        <div style="border: 1px dashed #cbd5e1; padding: 1rem; border-radius: 6px;">Column 1 content...</div>
                        <div style="border: 1px dashed #cbd5e1; padding: 1rem; border-radius: 6px;">Column 2 content...</div>
                      </div>
                    `).run();
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  📰 2 Columns Layout
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().insertContent(`
                      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin: 1.5rem 0;">
                        <div style="border: 1px dashed #cbd5e1; padding: 1rem; border-radius: 6px;">Column 1 content...</div>
                        <div style="border: 1px dashed #cbd5e1; padding: 1rem; border-radius: 6px;">Column 2 content...</div>
                        <div style="border: 1px dashed #cbd5e1; padding: 1rem; border-radius: 6px;">Column 3 content...</div>
                      </div>
                    `).run();
                    setShowLayoutMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  📰 3 Columns Layout
                </button>
                <div className="h-px bg-slate-100 my-1" />
                 <button
                   type="button"
                   onMouseDown={(e) => {
                     e.preventDefault();
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.accept = 'image/*';
                     input.onchange = (uploadEvent: any) => {
                       const file = uploadEvent.target.files?.[0];
                       if (file && editor) {
                         const reader = new FileReader();
                         reader.onload = (readerEvent) => {
                           const src = readerEvent.target?.result as string;
                           editor.chain().focus().insertContent([
                             {
                               type: 'paragraph',
                               content: [
                                 {
                                   type: 'image',
                                   attrs: {
                                     src: src,
                                     alignment: 'left',
                                     width: '300px'
                                   }
                                 }
                               ]
                             },
                             {
                               type: 'heading',
                               attrs: { level: 3 },
                               content: [{ type: 'text', text: 'Heading Title' }]
                             },
                             {
                               type: 'paragraph',
                               content: [{ type: 'text', text: '✍️ Type your text content next to the image here...' }]
                             }
                           ]).run();
                         };
                         reader.readAsDataURL(file);
                       }
                     };
                     input.click();
                     setShowLayoutMenu(false);
                   }}
                   className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium text-sky-700"
                 >
                   🖼️ Image Left, Content Right
                 </button>
                 <button
                   type="button"
                   onMouseDown={(e) => {
                     e.preventDefault();
                     const input = document.createElement('input');
                     input.type = 'file';
                     input.accept = 'image/*';
                     input.onchange = (uploadEvent: any) => {
                       const file = uploadEvent.target.files?.[0];
                       if (file && editor) {
                         const reader = new FileReader();
                         reader.onload = (readerEvent) => {
                           const src = readerEvent.target?.result as string;
                           editor.chain().focus().insertContent([
                             {
                               type: 'paragraph',
                               content: [
                                 {
                                   type: 'image',
                                   attrs: {
                                     src: src,
                                     alignment: 'right',
                                     width: '300px'
                                   }
                                 }
                               ]
                             },
                             {
                               type: 'heading',
                               attrs: { level: 3 },
                               content: [{ type: 'text', text: 'Heading Title' }]
                             },
                             {
                               type: 'paragraph',
                               content: [{ type: 'text', text: '✍️ Type your text content next to the image here...' }]
                             }
                           ]).run();
                         };
                         reader.readAsDataURL(file);
                       }
                     };
                     input.click();
                     setShowLayoutMenu(false);
                   }}
                   className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium text-sky-700"
                 >
                   🖼️ Content Left, Image Right
                 </button>
              </div>
            )}
          </div>

          {/* Slider Dropdown */}
          <div className="relative" ref={sliderMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowSliderMenu(!showSliderMenu)} 
              className={clsx(
                "h-8 px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                showSliderMenu ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
              title="Insert Content Slider"
            >
              <SlidersHorizontal size={13} />
              <span className="text-[12px] font-bold ml-1">Slider</span>
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
            {showSliderMenu && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-slate-200 rounded-md shadow-lg z-[50] py-1 text-slate-700">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    editor.chain().focus().insertContent(`
                      <div class="custom-slider-block" style="border: 2px dashed #0284c7; padding: 2rem; background-color: #f0f9ff; border-radius: 8px; text-align: center; margin: 1.5rem 0;">
                        <div style="font-weight: 700; color: #0369a1; margin-bottom: 0.5rem; font-size: 15px;">📷 Image Carousel / Slider Container</div>
                        <div style="font-size: 12px; color: #0284c7; margin-bottom: 1rem;">Placeholder for slides structure</div>
                        <div style="display: flex; gap: 0.5rem; justify-content: center;">
                          <div style="width: 60px; height: 40px; background-color: #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b;">Slide 1</div>
                          <div style="width: 60px; height: 40px; background-color: #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b;">Slide 2</div>
                          <div style="width: 60px; height: 40px; background-color: #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #64748b;">Slide 3</div>
                        </div>
                      </div>
                    `).run();
                    setShowSliderMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                >
                  ⭐ Insert Interactive Slider
                </button>
              </div>
            )}
          </div>

          {/* Table operations */}
          <div className="relative" ref={tableMenuRef}>
            <button 
              type="button" 
              onClick={() => setShowTableMenu(!showTableMenu)} 
              className={clsx(
                "h-8 px-2 transition-all flex items-center justify-between shrink-0 cursor-pointer rounded-md border text-[#0284c7]",
                editor.isActive('table') || showTableMenu ? "bg-[#f0f9ff] border-[#0284c7] font-semibold" : "bg-white border-[#cbd5e1]"
              )}
            >
              <TableIcon size={13} />
              <ChevronDown size={11} className="opacity-70 ml-1" />
            </button>
            {showTableMenu && (
              <div className="absolute top-full left-0 mt-1 w-[240px] bg-white border border-slate-200 rounded-lg shadow-xl z-[60] flex flex-col text-[12px] text-slate-700 overflow-hidden">
                <div className="max-h-[340px] overflow-y-auto py-1">
                  <div className="px-3 py-1.5">
                    <div className="text-[10px] text-slate-400 mb-1.5 font-bold flex justify-between items-center h-4 uppercase tracking-wider">
                      <span>Insert Table</span>
                      {tableGridHover.rows > 0 && tableGridHover.cols > 0 && (
                        <span className="text-[#0284c7] bg-[#f0f9ff] px-1.5 py-0.5 rounded">{tableGridHover.cols}x{tableGridHover.rows}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5" onMouseLeave={() => setTableGridHover({ rows: 0, cols: 0 })}>
                      {Array.from({ length: 8 }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex gap-0.5 justify-center">
                          {Array.from({ length: 10 }).map((_, colIndex) => {
                            const isHovered = rowIndex < tableGridHover.rows && colIndex < tableGridHover.cols;
                            return (
                              <div 
                                key={colIndex}
                                onMouseEnter={() => setTableGridHover({ rows: rowIndex + 1, cols: colIndex + 1 })}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  editor.chain().focus().insertTable({ rows: rowIndex + 1, cols: colIndex + 1, withHeaderRow: true }).run();
                                  setShowTableMenu(false);
                                  setTableGridHover({ rows: 0, cols: 0 });
                                }}
                                className={clsx(
                                  "w-[18px] h-[18px] border rounded-[2px] cursor-pointer transition-all",
                                  isHovered ? "bg-sky-100 border-sky-400" : "bg-white border-slate-200 hover:border-sky-300"
                                )}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <div className="w-full px-3 py-1.5 text-left text-slate-400 flex items-center gap-2 text-[11px]">
                    <GripVertical size={12} className="text-slate-300 shrink-0" /> Drag rows using the left handle.
                  </div>
                  <div className="h-px bg-slate-100 my-1 mx-2" />
                  <div className="w-full px-3 py-1.5 hover:bg-slate-50 flex flex-col gap-1.5 group transition-colors">
                    <label className="flex items-center gap-2.5 cursor-pointer w-full">
                    <div className="relative w-4 h-4 rounded-[3px] bg-[#fbbf24] overflow-hidden flex-shrink-0">
                      <input 
                        type="color" 
                        defaultValue="#fbbf24"
                        title="Choose cell background color"
                        className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 cursor-pointer"
                        onChange={(e) => { 
                          editor.chain().focus().setCellAttribute('backgroundColor', e.target.value).run(); 
                        }}
                      /> 
                    </div>
                    <span className="text-slate-700 font-medium">Cell background color</span>
                  </label>
                  <div className="flex items-center pl-6 pr-1 gap-2">
                    <span className="text-[9px] text-slate-400 font-bold tracking-wider">HEX</span>
                    <input 
                      type="text" 
                      placeholder="#000000" 
                      maxLength={7}
                      className="w-full h-6 text-[11px] border border-slate-200 rounded px-1.5 text-slate-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all bg-white shadow-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
                            editor.chain().focus().setCellAttribute('backgroundColor', val).run();
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
                          editor.chain().focus().setCellAttribute('backgroundColor', val).run();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="w-full px-3 py-1.5 hover:bg-slate-50 flex flex-col gap-1.5 group transition-colors">
                  <label className="flex items-center gap-2.5 cursor-pointer w-full">
                    <div className="relative w-3.5 h-3.5 rounded-[3px] bg-[#34d399] overflow-hidden flex-shrink-0">
                      <input 
                        type="color" 
                        defaultValue="#34d399"
                        title="Choose row background color"
                        className="absolute w-[200%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 cursor-pointer"
                        onChange={(e) => { 
                          editor.chain().focus().updateAttributes('tableRow', { backgroundColor: e.target.value }).run(); 
                        }}
                      /> 
                    </div>
                    <span className="text-slate-700 font-medium">Row background color</span>
                  </label>
                  <div className="flex items-center pl-6 pr-1 gap-2">
                    <span className="text-[9px] text-slate-400 font-bold tracking-wider">HEX</span>
                    <input 
                      type="text" 
                      placeholder="#000000" 
                      maxLength={7}
                      className="w-full h-6 text-[11px] border border-slate-200 rounded px-1.5 text-slate-600 focus:outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all bg-white shadow-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.currentTarget.value.trim();
                          if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
                            editor.chain().focus().updateAttributes('tableRow', { backgroundColor: val }).run();
                          }
                        }
                      }}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (/^#([0-9A-F]{3}){1,2}$/i.test(val)) {
                          editor.chain().focus().updateAttributes('tableRow', { backgroundColor: val }).run();
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnBefore().run(); }} className="w-full px-3 py-1.5 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors">
                  <PanelLeft size={13} className="text-slate-400" /> Add Column Before
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addColumnAfter().run(); }} className="w-full px-3 py-1.5 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors">
                  <PanelRight size={13} className="text-slate-400" /> Add Column After
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteColumn().run(); }} className="w-full px-3 py-1.5 text-left text-red-500 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors">
                  <Trash2 size={13} className="text-red-400" /> Delete Column
                </button>
                
                <div className="h-px bg-slate-100 my-1 mx-2" />
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowBefore().run(); }} className="w-full px-3 py-1.5 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors">
                  <PanelTop size={13} className="text-slate-400" /> Add Row Before
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().addRowAfter().run(); }} className="w-full px-3 py-1.5 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer transition-colors">
                  <PanelBottom size={13} className="text-slate-400" /> Add Row After
                </button>
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteRow().run(); }} className="w-full px-3 py-1.5 text-left text-red-500 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors">
                  <Trash2 size={13} className="text-red-400" /> Delete Row
                </button>
                
                <div className="h-px bg-slate-100 my-1 mx-2" />
                
                <button type="button" onMouseDown={(e) => { e.preventDefault(); editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }} className="w-full px-3 py-1.5 text-left text-red-500 hover:bg-red-50 flex items-center gap-2.5 cursor-pointer transition-colors font-semibold">
                  <Trash2 size={13} className="text-red-500" /> Delete Table
                </button>
              </div>
              </div>
            )}
          </div>

          {/* Undo/Redo/Eye/Maximize controls */}
          <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={13} /></MenuButton>
          <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={13} /></MenuButton>
          <MenuButton onClick={() => setIsPreview(!isPreview)} isActive={isPreview} title="Preview Mode"><Eye size={13} /></MenuButton>
          <MenuButton onClick={() => setIsFullscreen(!isFullscreen)} isActive={isFullscreen} title="Fullscreen Mode"><Maximize size={13} /></MenuButton>

          {/* Spacer to push modes selector to far right */}
          <div className="flex-grow" />

          {/* Document & HTML raw source mode buttons group matching the right side selector */}
          <div className="flex items-center bg-white border border-[#cbd5e1] rounded-lg overflow-hidden p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setIsHtmlView(false)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                !isHtmlView ? "bg-[#f0f9ff] text-[#0284c7] border border-[#0284c7]/20" : "text-slate-500 hover:bg-slate-50"
              )}
              title="Rich Text Document View"
            >
              <FileText size={13} />
            </button>
            <button
              type="button"
              onClick={() => setIsHtmlView(true)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                isHtmlView ? "bg-[#f0f9ff] text-[#0284c7] border border-[#0284c7]/20" : "text-slate-500 hover:bg-slate-50"
              )}
              title="Raw HTML Code View"
            >
              <CodeXml size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Content Area */}
      <div 
        onClick={(e) => {
          if (editor && editor.isEditable) {
            const target = e.target as HTMLElement;
            if (!target.closest('button') && !target.closest('input') && !target.closest('select') && !target.closest('option')) {
              if (editor.isActive('image') || editor.isActive('imageUploadPlaceholder')) {
                const { selection } = editor.state;
                if (selection && 'node' in selection) {
                  editor.commands.setTextSelection(selection.to);
                } else {
                  editor.commands.focus('end');
                }
              }
            }
          }
        }}
        className={clsx("flex-1 bg-white overflow-visible transition-all rounded-b-md", isFullscreen && "h-full overflow-y-auto")}
      >
        {isHtmlView ? (
          <textarea
            className="w-full h-full p-6 text-sm font-mono text-slate-700 bg-slate-50 focus:outline-none resize-none rounded-b-md"
            style={{ minHeight }}
            value={editor.getHTML()}
            onChange={(e) => editor.commands.setContent(e.target.value)}
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
}
