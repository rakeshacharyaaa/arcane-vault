import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { FileText, Download, Maximize2, X, Info } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const FileComponent = (props: any) => {
    const { src, title, size } = props.node.attrs;
    const isImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(src) || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(title);

    // Lightbox State
    const [isOpen, setIsOpen] = useState(false);

    // Holographic Tilt State
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current || isOpen) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Max 10deg rotation
        const rotateY = ((x - centerX) / centerX) * 10;

        setRotate({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        setDimensions({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight
        });
    };

    return (
        <NodeViewWrapper className="file-component my-8 perspective-1000">
            {isImage ? (
                <>
                    {/* Card Container */}
                    <div
                        ref={cardRef}
                        className="relative group rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ease-out"
                        style={{
                            transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg) scale3d(1, 1, 1)`,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => setIsOpen(true)}
                    >
                        {/* Glass Shine */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />

                        {/* Image */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden aspect-video md:aspect-auto md:max-h-[500px] flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-transparent transition-colors" />
                            <img
                                src={src}
                                alt={title}
                                onLoad={handleImageLoad}
                                className="max-w-full max-h-full object-contain shadow-2xl"
                            />
                        </div>

                        {/* Metadata HUD (Slide up) */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/60 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 border-t border-white/10 flex items-center justify-between">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-sm font-medium text-white truncate max-w-[200px]">{title}</span>
                                <div className="flex items-center gap-3 text-xs text-neutral-400">
                                    <span>{dimensions.width} x {dimensions.height}px</span>
                                    {size && <span>• {size}</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Download" onClick={(e) => { e.stopPropagation(); window.open(src, '_blank'); }}>
                                    <Download className="w-4 h-4" />
                                </button>
                                <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors" title="Fullscreen">
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lightbox Modal */}
                    {isOpen && (
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsOpen(false);
                            }}
                        >
                            <button
                                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-8 h-8" />
                            </button>

                            <img
                                src={src}
                                alt={title}
                                className="max-w-[95vw] max-h-[95vh] object-contain drop-shadow-2xl animate-in zoom-in-95 duration-200"
                                onClick={(e) => e.stopPropagation()}
                            />

                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur border border-white/10 rounded-full text-white/80 text-sm">
                                {title}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-emerald-500/30 transition-colors group max-w-md">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <FileText className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-200 truncate">{title}</div>
                        {size && <div className="text-xs text-neutral-500">{size}</div>}
                    </div>

                    <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </a>
                </div>
            )}
        </NodeViewWrapper>
    );
};

export const FileExtension = Node.create({
    name: 'fileAttachment',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            title: {
                default: 'Attachment',
            },
            size: {
                default: null,
            }
        };
    },

    parseHTML() {
        return [
            {
                tag: 'div[data-type="file-attachment"]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'file-attachment' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FileComponent);
    },
});
