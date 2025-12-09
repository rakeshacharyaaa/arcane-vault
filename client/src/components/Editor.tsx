import React, { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Typography from "@tiptap/extension-typography";
import { common, createLowlight } from "lowlight";
import { Commands, getSuggestionItems, renderItems } from "./editor/extensions";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { 
  Smile, 
  X, 
  Tag as TagIcon, 
  Image as ImageIcon 
} from "lucide-react";
import { Page, useStore } from "@/lib/store";

const lowlight = createLowlight(common);

interface EditorProps {
  page: Page;
}

export function Editor({ page }: EditorProps) {
  const { updatePage } = useStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  // Debounced update for content
  const updateContent = (content: any) => {
    updatePage(page.id, { content });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Type "/" for commands...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Typography,
      Commands.configure({
        suggestion: {
          items: getSuggestionItems,
          render: renderItems,
        },
      }),
    ],
    content: page.content,
    onUpdate: ({ editor }) => {
      updateContent(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[50vh]',
      },
    },
  }, [page.id]); // Re-create editor when page ID changes

  // Update editor content if page changes externally (though we rely on key prop in parent usually)
  // But here we rely on the dependency array of useEditor to reset it when page.id changes.

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!page.tags.includes(tagInput.trim())) {
        updatePage(page.id, { tags: [...page.tags, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    updatePage(page.id, { tags: page.tags.filter(t => t !== tag) });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-8 py-12 pb-32">
       {/* Cover Image Placeholder (Visual only for now) */}
       <div className="group relative w-full h-40 bg-gradient-to-r from-emerald-900/20 to-neutral-900/20 rounded-t-3xl border-x border-t border-white/5 mb-8 -mt-12 overflow-hidden hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
             <button className="px-3 py-1 bg-black/50 backdrop-blur text-xs text-white rounded-md border border-white/10 flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Change Cover
             </button>
          </div>
       </div>

       {/* Icon & Title */}
       <div className="group relative mb-8">
         <div className="flex items-center gap-4 mb-4">
            <div className="relative">
                <button 
                    ref={emojiButtonRef}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-16 h-16 flex items-center justify-center text-4xl hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                >
                    {page.icon || <Smile className="w-8 h-8 text-neutral-600" />}
                </button>
                {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 z-50">
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowEmojiPicker(false)} 
                        />
                        <div className="relative z-50 shadow-2xl rounded-xl overflow-hidden border border-white/10">
                            <EmojiPicker 
                                theme={Theme.DARK}
                                onEmojiClick={(emoji) => {
                                    updatePage(page.id, { icon: emoji.emoji });
                                    setShowEmojiPicker(false);
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            
            <input 
                type="text"
                value={page.title}
                onChange={(e) => updatePage(page.id, { title: e.target.value })}
                placeholder="Untitled Page"
                className="flex-1 bg-transparent text-4xl font-bold text-white placeholder:text-neutral-700 outline-none border-none p-0"
            />
         </div>

         {/* Tags */}
         <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
            <TagIcon className="w-4 h-4 text-neutral-600" />
            {page.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:text-white"><X className="w-3 h-3" /></button>
                </span>
            ))}
            <input 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tag..."
                className="bg-transparent text-sm text-neutral-400 placeholder:text-neutral-700 outline-none border-none min-w-[80px]"
            />
         </div>
       </div>

       <div className="h-px w-full bg-white/5 mb-8" />

       {/* TipTap Editor */}
       <div className="editor-wrapper min-h-[500px]">
         <EditorContent editor={editor} />
       </div>
    </div>
  );
}
