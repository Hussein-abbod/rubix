import Image from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";

const CustomImageComponent = (props: any) => {
  const { node, updateAttributes } = props;
  
  // Extract styles
  const isBlock = node.attrs.style?.includes('display: block');
  const isCenter = node.attrs.style?.includes('margin-left: auto') && node.attrs.style?.includes('margin-right: auto');
  const isRight = node.attrs.style?.includes('margin-left: auto') && node.attrs.style?.includes('margin-right: 0');
  
  let wrapperClass = "relative group ";
  if (isBlock) {
    wrapperClass += "flex ";
    if (isCenter) wrapperClass += "justify-center";
    else if (isRight) wrapperClass += "justify-end";
    else wrapperClass += "justify-start";
  } else {
    wrapperClass += "inline-block";
  }

  return (
    <NodeViewWrapper className={wrapperClass}>
      <div 
        className="relative group/img inline-block"
        style={{ width: node.attrs.width || '100%' }}
      >
        <img 
          src={node.attrs.src} 
          alt={node.attrs.alt} 
          className="w-full h-auto rounded-lg" 
        />
        
        {/* Hover Menu */}
        <div className="absolute top-2 right-2 opacity-0 group-hover/img:opacity-100 transition-opacity glass-card flex items-center gap-1 p-1.5 rounded-lg border border-outline-variant/20 shadow-md bg-surface z-10">
          <button
            onClick={() => updateAttributes({ width: '25%' })}
            className="px-2 py-1 text-xs text-on-surface hover:bg-surface-container-high rounded transition-colors"
          >
            25%
          </button>
          <button
            onClick={() => updateAttributes({ width: '50%' })}
            className="px-2 py-1 text-xs text-on-surface hover:bg-surface-container-high rounded transition-colors"
          >
            50%
          </button>
          <button
            onClick={() => updateAttributes({ width: '100%' })}
            className="px-2 py-1 text-xs text-on-surface hover:bg-surface-container-high rounded transition-colors"
          >
            100%
          </button>
          <div className="w-px h-4 bg-outline-variant/50 mx-1" />
          <button
            onClick={() => updateAttributes({ style: 'display: block; margin-left: 0; margin-right: auto;' })}
            className="p-1 text-on-surface hover:bg-surface-container-high rounded transition-colors"
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => updateAttributes({ style: 'display: block; margin-left: auto; margin-right: auto;' })}
            className="p-1 text-on-surface hover:bg-surface-container-high rounded transition-colors"
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => updateAttributes({ style: 'display: block; margin-left: auto; margin-right: 0;' })}
            className="p-1 text-on-surface hover:bg-surface-container-high rounded transition-colors"
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) return {};
          return { width: attributes.width };
        }
      },
      style: {
        default: null,
        parseHTML: element => element.getAttribute('style'),
        renderHTML: attributes => {
          if (!attributes.style) return {};
          return { style: attributes.style };
        }
      }
    };
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(CustomImageComponent);
  }
});
