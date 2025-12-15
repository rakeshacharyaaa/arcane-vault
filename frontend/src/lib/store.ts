import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { JSONContent } from '@tiptap/react';
import { supabase } from './supabase';
import * as api from './api';

export interface Page {
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  content: JSONContent;
  tags: string[];
  parentId: string | null;
  isExpanded: boolean;
  createdAt: number;
  updatedAt: number;
}

// Internal type matching Supabase DB
interface DBPage {
  id: string;
  title: string;
  icon: string | null;
  cover_image: string | null;
  content: JSONContent;
  tags: string[];
  parent_id: string | null;
  is_expanded: boolean;
  created_at: number;
  updated_at: number;
}

// Auth State
interface AppState {
  user: any | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: any | null) => void;

  pages: Page[];
  isLoading: boolean;

  fetchPages: () => Promise<void>;
  subscribeToPages: () => () => void;

  addPage: (parentId?: string | null) => Promise<string | null>;
  updatePage: (id: string, updates: Partial<Page>, persist?: boolean) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  togglePageExpand: (id: string) => Promise<void>;
}

// Mapper helper
const mapDBPageToPage = (p: DBPage): Page => ({
  id: p.id,
  title: p.title,
  icon: p.icon,
  coverImage: p.cover_image,
  content: p.content,
  tags: p.tags || [],
  parentId: p.parent_id,
  isExpanded: p.is_expanded,
  createdAt: p.created_at,
  updatedAt: p.updated_at
});

export const useStore = create<AppState>()(persist((set, get) => ({
  // Auth
  user: null,

  signInWithGoogle: async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) console.error('Error signing in:', error);
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, pages: [] });
  },

  setUser: (user) => set({ user }),

  // Pages
  pages: [],
  isLoading: false,

  fetchPages: async () => {
    set({ isLoading: true });

    // DEV MODE BYPASS
    if (get().user?.id === 'dev-user') {
      if (get().pages.length === 0) {
        const dummyPage: Page = {
          id: 'dev-page-1',
          title: 'Dev Page',
          icon: '🛠️',
          coverImage: null,
          content: {
            type: 'doc', content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Welcome to Dev Mode. content allows testing editor behavior.' }] }
            ]
          },
          tags: ['dev'],
          parentId: null,
          isExpanded: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        set({ pages: [dummyPage] });
      }
      set({ isLoading: false });
      return;
    }

    try {
      const user = get().user;
      if (user?.email) {
        const pages = await api.fetchUserPages(user.email);
        set({ pages });
      }
    } catch (e) {
      console.error("Fetch failed", e);
    }
    set({ isLoading: false });
  },

  subscribeToPages: () => {
    return () => { };
  },

  addPage: async (parentId = null) => {
    const user = get().user;
    if (!user?.email) return null;

    const newPage = {
      title: "Untitled",
      content: { type: 'doc', content: [] },
      parentId,
    };

    try {
      const created = await api.createPage(user.email, newPage);
      set(state => ({ pages: [created, ...state.pages] }));
      return created.id;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  updatePage: async (id, updates, persist = true) => {
    // Optimistic
    set(state => ({
      pages: state.pages.map(p => p.id === id ? { ...p, ...updates } : p)
    }));

    if (!persist) return;

    try {
      await api.updatePage(id, updates);
    } catch (e) {
      console.error(e);
    }
  },

  deletePage: async (id) => {
    // Optimistic
    set(state => ({
      pages: state.pages.filter(p => p.id !== id)
    }));

    try {
      await api.deletePage(id);
    } catch (e) {
      console.error(e);
    }
  },

  togglePageExpand: async (id) => {
    const page = get().pages.find(p => p.id === id);
    if (page) {
      const newExpanded = !page.isExpanded;
      await get().updatePage(id, { isExpanded: newExpanded });
    }
  }
}), {
  name: 'arcane-vault-storage',
  partialize: (state) => ({ pages: state.pages, user: state.user }),
}));
