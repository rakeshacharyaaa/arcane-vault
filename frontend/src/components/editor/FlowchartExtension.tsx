import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import mermaid from 'mermaid';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
    AlertCircle,
    Code2,
    Maximize2,
    Minimize2,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Palette,
    Copy,
    Check
} from 'lucide-react';

const FlowchartComponent = (props: any) => {
    const code = props.node.attrs.code || 'graph TD;\n  A-->B;';
    const [svg, setSvg] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [id] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

    // Advanced State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'default' | 'forest' | 'neutral'>('dark');
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Render Diagram
    useEffect(() => {
        const renderDiagram = async () => {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: theme,
                    securityLevel: 'loose',
                });

                const { svg } = await mermaid.render(id, code);
                setSvg(svg);
                setError(null);
            } catch (e) {
                console.error(e);
                setError('Invalid syntax');
                // Keep the old SVG if possible or clear it? Keeping it might be better but error msg is priority
            }
        };
        renderDiagram();
    }, [code, id, theme]);

    // Pan & Zoom Handlers
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (isFullscreen || e.ctrlKey || e.metaKey) {
            e.preventDefault();
            e.stopPropagation();
            const delta = e.deltaY * -0.001;
            const newScale = Math.min(Math.max(0.5, scale + delta), 4);
            setScale(newScale);
        }
    }, [scale, isFullscreen]);

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only drag if clicking background, not buttons
        if ((e.target as HTMLElement).tagName === 'BUTTON') return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
        // Reset view on toggle
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const cycleTheme = () => {
        const themes: ('dark' | 'default' | 'forest' | 'neutral')[] = ['dark', 'default', 'forest', 'neutral'];
        const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        props.updateAttributes({ code: e.target.value });
    };

    return (
        <NodeViewWrapper className="flowchart-component my-6">
            <div
                className={`
                    relative border rounded-xl overflow-hidden transition-all duration-300
                    ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl border-emerald-500/50' : 'border-white/10 hover:border-white/20'}
                    ${props.selected && !isFullscreen ? 'ring-2 ring-emerald-500/50' : ''}
                    bg-[#0d0d0d]
                `}
                style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : 'auto' }}
            >
                {/* Backdrop Filter for Fullscreen */}
                {isFullscreen && (
                    <div className="absolute inset-0 bg-[#0d0d0d]/90 backdrop-blur-sm -z-10" />
                )}

                {/* Toolbar */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20 bg-black/50 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg">
                    <button onClick={() => setScale(s => Math.min(s + 0.2, 4))} className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors" title="Zoom In">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button onClick={() => setScale(s => Math.max(s - 0.2, 0.5))} className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors" title="Zoom Out">
                        <ZoomOut className="w-4 h-4" />
                    </button> // Reset
                    <button onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }} className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors" title="Reset View">
                        <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={cycleTheme} className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-emerald-400 transition-colors" title={`Theme: ${theme}`}>
                        <Palette className="w-4 h-4" />
                    </button>
                    <button onClick={copyCode} className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-emerald-400 transition-colors" title="Copy Mermaid Code">
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <div className="w-px h-4 bg-white/10 mx-1" />
                    <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors" title="Toggle Fullscreen">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>

                {/* Edit Button (Only when not editing/fullscreen) */}
                {!isEditing && !isFullscreen && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="absolute bottom-4 right-4 z-20 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-md border border-emerald-500/20 transition-colors flex items-center gap-2"
                    >
                        <Code2 className="w-3 h-3" /> Edit Syntax
                    </button>
                )}

                {/* Canvas */}
                <div
                    ref={containerRef}
                    className={`
                        overflow-hidden cursor-move select-none relative
                        ${isFullscreen ? 'w-full h-full' : 'w-full min-h-[300px] aspect-video'}
                    `}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-400 gap-2 bg-red-500/5">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">{error}</span>
                        </div>
                    ) : (
                        <div
                            className="origin-center transition-transform duration-75 ease-out w-full h-full flex items-center justify-center p-8"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`
                            }}
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    )}
                </div>

                {/* Editor Area */}
                {(isEditing || isFullscreen) && (
                    <div className={`
                        ${isFullscreen ? 'absolute bottom-8 left-8 right-8 h-48 border rounded-lg shadow-2xl' : 'border-t'}
                        border-white/10 bg-[#161616] z-30 flex flex-col
                    `}>
                        <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/5">
                            <div className="flex items-center gap-2 text-xs text-neutral-400">
                                <Code2 className="w-3 h-3" />
                                <span>Mermaid Syntax</span>
                            </div>
                            <button onClick={() => setIsEditing(false)} className="text-xs hover:text-white text-neutral-500">
                                Close Editor
                            </button>
                        </div>
                        <textarea
                            className="flex-1 w-full bg-transparent text-sm font-mono text-neutral-300 p-4 focus:outline-none resize-none"
                            value={code}
                            onChange={handleChange}
                            placeholder="Enter Mermaid syntax..."
                            spellCheck={false}
                        />
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export const FlowchartExtension = Node.create({
    name: 'flowchart',
    group: 'block',
    atom: true,

    addAttributes() {
        return {
            code: {
                default: 'graph TD;\n  Start-->Stop;',
            },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="flowchart"]' }];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'flowchart' })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(FlowchartComponent);
    },
});
