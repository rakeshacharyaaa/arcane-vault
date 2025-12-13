import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import mermaid from 'mermaid';
import { useEffect, useState } from 'react';
import { AlertCircle, Code2 } from 'lucide-react';

mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    securityLevel: 'loose',
});

const FlowchartComponent = (props: any) => {
    const code = props.node.attrs.code || 'graph TD;\n  A-->B;';
    const [svg, setSvg] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    useEffect(() => {
        const renderDiagram = async () => {
            try {
                // Mermaid render requires unique ID
                const { svg } = await mermaid.render(id, code);
                setSvg(svg);
                setError(null);
            } catch (e) {
                console.error(e);
                setError('Invalid syntax');
            }
        };
        renderDiagram();
    }, [code, id]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        props.updateAttributes({ code: e.target.value });
    };

    return (
        <NodeViewWrapper className="flowchart-component my-4">
            <div className={`bg-[#1a1a1a] border rounded-lg overflow-hidden transition-colors ${props.selected ? 'border-emerald-500/50' : 'border-white/10'}`}>
                {/* Preview Area */}
                <div
                    className="p-4 bg-[#0d0d0d] flex justify-center min-h-[100px] cursor-pointer"
                    onClick={() => setIsEditing(!isEditing)}
                    title="Click to edit"
                >
                    {error ? (
                        <div className="text-red-400 flex items-center gap-2 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>Failed to render chart. Click to edit syntax.</span>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full flex justify-center" />
                    )}
                </div>

                {/* Editor Area */}
                {isEditing && (
                    <div className="p-0 border-t border-white/10 bg-[#161616]">
                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border-b border-white/5 text-xs text-neutral-400">
                            <Code2 className="w-3 h-3" />
                            <span>Mermaid Syntax</span>
                        </div>
                        <textarea
                            className="w-full h-32 bg-transparent text-sm font-mono text-neutral-300 p-3 focus:outline-none resize-y"
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
