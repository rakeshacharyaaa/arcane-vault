import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance } from 'tippy.js';
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Image as ImageIcon,
  Minus,
  Paperclip,
  Workflow,
  Palette
} from 'lucide-react';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { FlowchartExtension } from './FlowchartExtension';
import { FileExtension } from './FileExtension';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { uploadFile } from '@/lib/api';

// Define the handle interface
export interface CommandListHandle {
  onKeyDown: ({ event }: { event: KeyboardEvent }) => boolean;
}

const CommandList = forwardRef<CommandListHandle, any>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[200px] p-1 flex flex-col gap-0.5">
      {props.items.map((item: any, index: number) => (
        <button
          key={index}
          className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-left transition-colors w-full ${index === selectedIndex ? 'bg-emerald-500/20 text-emerald-100' : 'text-neutral-400 hover:bg-white/5'
            }`}
          style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
          onClick={() => selectItem(index)}
        >
          <div className="flex-shrink-0 p-1 rounded bg-white/5 border border-white/10 text-neutral-300">
            {item.icon}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-neutral-200 truncate">{item.title}</span>
            <span className="text-[10px] text-neutral-500 truncate">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  );
});

export const Commands = Extension.create({
  name: 'slash-commands',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const getSuggestionItems = ({ query }: { query: string }) => {
  return [
    {
      title: 'Heading 1',
      description: 'Big section heading',
      icon: <Heading1 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
      },
    },
    {
      title: 'Heading 2',
      description: 'Medium section heading',
      icon: <Heading2 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
      },
    },
    {
      title: 'Heading 3',
      description: 'Small section heading',
      icon: <Heading3 className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
      },
    },
    {
      title: 'Bullet List',
      description: 'Simple bullet list',
      icon: <List className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: 'Ordered List',
      description: 'Numbered list',
      icon: <ListOrdered className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: 'To-do List',
      description: 'Track tasks',
      icon: <CheckSquare className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: 'Quote',
      description: 'Capture a quote',
      icon: <Quote className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setBlockquote().run();
      },
    },
    {
      title: 'Code Block',
      description: 'Capture a code snippet',
      icon: <Code className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setCodeBlock().run();
      },
    },
    {
      title: 'Divider',
      description: 'Visually separate content',
      icon: <Minus className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: 'Flowchart',
      description: 'Create a diagram',
      icon: <Workflow className="w-4 h-4" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).insertContent({ type: 'flowchart' }).run();
      },
    },
    {
      title: 'Attach File',
      description: 'Upload a file',
      icon: <Paperclip className="w-4 h-4" />,
      command: async ({ editor, range }: any) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async () => {
          if (input.files?.length) {
            const file = input.files[0];
            try {
              const { url } = await uploadFile(file);
              editor.chain().focus().deleteRange(range).insertContent({
                type: 'fileAttachment',
                attrs: {
                  src: url,
                  title: file.name,
                  size: (file.size / 1024).toFixed(1) + ' KB'
                }
              }).run();
            } catch (e) {
              console.error(e);
              // In real app, show toast
            }
          }
        };
        input.click();
      },
    },
    // Colored Headers
    {
      title: 'Red Heading',
      description: 'Big red heading',
      icon: <Palette className="w-4 h-4 text-red-500" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).setColor('#ef4444').run();
      },
    },
    {
      title: 'Blue Heading',
      description: 'Big blue heading',
      icon: <Palette className="w-4 h-4 text-blue-500" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).setColor('#3b82f6').run();
      },
    },
    {
      title: 'Green Heading',
      description: 'Big green heading',
      icon: <Palette className="w-4 h-4 text-green-500" />,
      command: ({ editor, range }: any) => {
        editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).setColor('#22c55e').run();
      },
    },
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
};

export const renderItems = () => {
  let component: ReactRenderer<CommandListHandle, any>;
  let popup: Instance[];

  return {
    onStart: (props: any) => {
      component = new ReactRenderer(CommandList, {
        props,
        editor: props.editor,
      });

      if (!props.clientRect) {
        return;
      }

      popup = tippy('body', {
        getReferenceClientRect: props.clientRect,
        appendTo: () => document.body,
        content: component.element,
        showOnCreate: true,
        interactive: true,
        trigger: 'manual',
        placement: 'bottom-start',
        theme: 'dark',
      });
    },

    onUpdate: (props: any) => {
      component.updateProps(props);

      if (!props.clientRect) {
        return;
      }

      popup[0].setProps({
        getReferenceClientRect: props.clientRect,
      });
    },

    onKeyDown: (props: any) => {
      if (props.event.key === 'Escape') {
        popup[0].hide();
        return true;
      }

      return component.ref?.onKeyDown(props);
    },

    onExit: () => {
      popup[0].destroy();
      component.destroy();
    },
  };
};
