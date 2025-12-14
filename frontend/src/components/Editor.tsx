import React, { useEffect, useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Typography from "@tiptap/extension-typography";
import { common, createLowlight } from "lowlight";
import { Commands, getSuggestionItems, renderItems } from "./editor/extensions";
import { FileExtension } from "./editor/FileExtension";
import { FlowchartExtension } from "./editor/FlowchartExtension";
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  Smile,
  X,
  Tag as TagIcon,
  Image as ImageIcon,
  Plus
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

  // Debounce helper
  const useDebouncedCallback = (callback: (...args: any[]) => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>(null);
    return useCallback((...args: any[]) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => callback(...args), delay);
    }, [callback, delay]);
  };

  const debouncedSave = useDebouncedCallback((id: string, updates: any) => {
    // This call persists to DB
    updatePage(id, updates, true);
  }, 1000);

  const updateContent = (content: any) => {
    debouncedSave(page.id, { content });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
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
      // New Extensions
      FileExtension,
      FlowchartExtension,
      TextStyle,
      Color,
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
        class: 'max-w-none focus:outline-none min-h-[50vh]',
      },
    },
  }, [page.id]);

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const currentTags = page.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        updatePage(page.id, { tags: [...currentTags, tagInput.trim()] });
      }
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = page.tags || [];
    updatePage(page.id, { tags: currentTags.filter(t => t !== tag) });
  };

  // Local state for title to prevent typing lag
  const [title, setTitle] = useState(page.title);

  // Sync title from props if ID changes
  useEffect(() => {
    setTitle(page.title);
  }, [page.id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    // Immediate Store Update (UI responsiveness) - Skip DB
    updatePage(page.id, { title: newTitle }, false);

    // Debounced DB Save
    debouncedSave(page.id, { title: newTitle });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-12 pb-32">
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
              className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
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
            value={title}
            onChange={handleTitleChange}
            placeholder="Untitled Page"
            className="flex-1 bg-transparent text-3xl md:text-5xl font-bold text-white placeholder:text-neutral-700 outline-none border-none p-0 min-w-0"
          />
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
          <TagIcon className="w-4 h-4 text-neutral-600" />
          {(page.tags || []).map(tag => (
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
          {tagInput.trim() && (
            <button onClick={() => addTag({ key: 'Enter', preventDefault: () => { } } as any)} className="text-emerald-500 hover:text-emerald-400">
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="h-px w-full bg-white/5 mb-8" />

      {/* TipTap Editor */}
      <div className="editor-wrapper min-h-[500px] liquid-glass rounded-3xl p-6 md:p-12 mb-20">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
