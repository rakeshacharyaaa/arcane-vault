import { create } from 'zustand';
import { JSONContent } from '@tiptap/react';
import { supabase } from './supabase';

export interface Page {
  id: string;
  title: string;
  icon: string | null;
  coverImage: string | null;
  content: JSONContent;
  tags: string[];
  parentId: string | null;
  isExpanded: boolean; // UI state, but strictly we can persist it to DB as is_expanded
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

export const useStore = create<AppState>((set, get) => ({
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
      // Return a dummy page if none exist, or keep existing
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

    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching pages:', error);
    } else {
      const pages = (data as DBPage[]).map(mapDBPageToPage);
      set({ pages });
    }
    set({ isLoading: false });
  },

  subscribeToPages: () => {
    if (get().user?.id === 'dev-user') return () => { };

    const channel = supabase
      .channel('public:pages')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pages' },
        async (payload) => {
          console.log('Realtime update:', payload);
          if (payload.eventType === 'INSERT') {
            const newPage = mapDBPageToPage(payload.new as DBPage);
            set(state => ({ pages: [newPage, ...state.pages] }));
          } else if (payload.eventType === 'DELETE') {
            set(state => ({ pages: state.pages.filter(p => p.id !== payload.old.id) }));
          } else if (payload.eventType === 'UPDATE') {
            const updatedPage = mapDBPageToPage(payload.new as DBPage);
            set(state => ({
              pages: state.pages.map(p => p.id === updatedPage.id ? updatedPage : p)
            }));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  },

  addPage: async (parentId = null) => {
    const user = get().user;
    if (!user) return null;

    if (user.id === 'dev-user') {
      const newPage: Page = {
        id: `dev-page-${Date.now()}`,
        title: "Untitled Dev Page",
        content: { type: 'doc', content: [] },
        tags: [],
        icon: null,
        coverImage: null,
        parentId: parentId,
        isExpanded: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      set(state => ({ pages: [newPage, ...state.pages] }));
      return newPage.id;
    }

    const newPage = {
      title: "Untitled",
      content: { type: 'doc', content: [] },
      parent_id: parentId,
      user_id: user.id, // Bind to user
      created_at: Date.now(),
      updated_at: Date.now(),
      is_expanded: true
    };

    const { data, error } = await supabase
      .from('pages')
      .insert(newPage)
      .select()
      .single();

    if (error) {
      console.error('Error adding page:', error);
      return null;
    }

    return data.id;
  },

  updatePage: async (id, updates, persist = true) => {
    // Optimistic update
    set(state => ({
      pages: state.pages.map(p => p.id === id ? { ...p, ...updates } : p)
    }));

    if (get().user?.id === 'dev-user') return;

    if (!persist) return;

    // Map updates to snake_case
    const dbUpdates: any = { ...updates, updated_at: Date.now() };
    if ('coverImage' in updates) {
      dbUpdates.cover_image = updates.coverImage;
      delete dbUpdates.coverImage;
    }
    if ('parentId' in updates) {
      dbUpdates.parent_id = updates.parentId;
      delete dbUpdates.parentId;
    }
    if ('isExpanded' in updates) {
      dbUpdates.is_expanded = updates.isExpanded;
      delete dbUpdates.isExpanded;
    }
    // Remove other camelCase keys if present just in case
    delete dbUpdates.createdAt;
    delete dbUpdates.updatedAt;

    const { error } = await supabase
      .from('pages')
      .update(dbUpdates)
      .eq('id', id);

    if (error) console.error('Error updating page:', error);
  },

  deletePage: async (id) => {
    set(state => ({
      pages: state.pages.filter(p => p.id !== id)
    }));

    if (get().user?.id === 'dev-user') return;

    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) console.error('Error deleting page:', error);
  },

  togglePageExpand: async (id) => {
    const page = get().pages.find(p => p.id === id);
    if (page) {
      const newExpanded = !page.isExpanded;
      await get().updatePage(id, { isExpanded: newExpanded });
    }
  }
}));
