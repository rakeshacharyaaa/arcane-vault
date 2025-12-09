import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { JSONContent } from '@tiptap/react';

export interface Page {
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  content: JSONContent; // TipTap JSON
  tags: string[];
  parentId: string | null;
  isExpanded: boolean; // For sidebar
  createdAt: number;
  updatedAt: number;
}

export interface User {
  email: string;
  name: string;
  isPremium: boolean;
  joinDate: number;
}

interface AppState {
  // User State
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;

  // Pages State
  pages: Page[];
  addPage: (parentId?: string | null) => string; // Returns new page ID
  updatePage: (id: string, updates: Partial<Page>) => void;
  deletePage: (id: string) => void;
  togglePageExpand: (id: string) => void;
  reorderPage: (id: string, newParentId: string | null) => void;
}

const INITIAL_CONTENT: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Welcome to your new vault. Type "/" to browse commands.' }]
    }
  ]
};

const INITIAL_PAGES: Page[] = [
  {
    id: "root-1",
    title: "Getting Started",
    icon: "🚀",
    coverImage: null,
    content: INITIAL_CONTENT,
    tags: ["guide", "welcome"],
    parentId: null,
    isExpanded: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "root-2",
    title: "Personal",
    icon: "🔒",
    coverImage: null,
    content: { type: 'doc', content: [] },
    tags: [],
    parentId: null,
    isExpanded: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: "child-1",
    title: "Journal",
    icon: "📔",
    coverImage: null,
    content: { type: 'doc', content: [] },
    tags: ["daily"],
    parentId: "root-2",
    isExpanded: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      pages: INITIAL_PAGES,

      login: (email: string) => set({
        user: {
          email,
          name: email.split('@')[0],
          isPremium: true,
          joinDate: Date.now(),
        }
      }),

      logout: () => set({ user: null }),
      
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),

      addPage: (parentId = null) => {
        const id = Math.random().toString(36).substr(2, 9);
        const now = Date.now();
        const newPage: Page = {
          id,
          title: "Untitled",
          icon: null,
          coverImage: null,
          content: { type: 'doc', content: [] },
          tags: [],
          parentId,
          isExpanded: true,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({ pages: [...state.pages, newPage] }));
        return id;
      },

      updatePage: (id, updates) => set((state) => ({
        pages: state.pages.map((p) => 
          p.id === id 
            ? { ...p, ...updates, updatedAt: Date.now() } 
            : p
        )
      })),

      deletePage: (id) => set((state) => {
        // Recursive delete needed? For now, just delete the page and its direct children become orphans or are deleted too.
        // Let's implement cascade delete for simplicity.
        const idsToDelete = new Set<string>([id]);
        
        // Find all descendants
        let currentSize = 0;
        do {
            currentSize = idsToDelete.size;
            state.pages.forEach(p => {
                if (p.parentId && idsToDelete.has(p.parentId)) {
                    idsToDelete.add(p.id);
                }
            });
        } while (idsToDelete.size > currentSize);

        return {
            pages: state.pages.filter(p => !idsToDelete.has(p.id))
        };
      }),

      togglePageExpand: (id) => set((state) => ({
        pages: state.pages.map((p) => 
            p.id === id ? { ...p, isExpanded: !p.isExpanded } : p
        )
      })),

      reorderPage: (id, newParentId) => set((state) => ({
          pages: state.pages.map(p => p.id === id ? { ...p, parentId: newParentId } : p)
      }))
    }),
    {
      name: 'arcane-vault-pages',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
