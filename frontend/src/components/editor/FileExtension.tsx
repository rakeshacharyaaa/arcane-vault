import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { FileText, Download } from 'lucide-react';

const FileComponent = (props: any) => {
    const { src, title, size } = props.node.attrs;

    return (
        <NodeViewWrapper className="file-component my-4">
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
