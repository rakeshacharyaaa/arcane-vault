import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
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

  // Notes State
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

// Initial Mock Data (only used if storage is empty)
const INITIAL_NOTES: Note[] = [
  {
    id: "1",
    title: "Project Aether",
    content: "The goal is to create a seamless interface between the user's intent and the digital manifestation. \n\nKey pillars:\n- Minimality\n- Speed\n- Aesthetic depth\n\nNeed to research more on glassmorphism best practices for performance.",
    tags: ["design", "ideas"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
  },
  {
    id: "2",
    title: "Dream Journal",
    content: "Walking through a city made of crystal. The light was refracting through the buildings, creating rainbows on the streets. I felt a sense of calm urgency.",
    tags: ["personal", "dreams"],
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
  },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      notes: INITIAL_NOTES,

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

      addNote: (noteData) => set((state) => {
        const now = Date.now();
        const newNote: Note = {
          id: Math.random().toString(36).substr(2, 9),
          createdAt: now,
          updatedAt: now,
          ...noteData,
        };
        return { notes: [newNote, ...state.notes] };
      }),

      updateNote: (id, updates) => set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id 
            ? { ...note, ...updates, updatedAt: Date.now() } 
            : note
        )
      })),

      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((n) => n.id !== id)
      })),
    }),
    {
      name: 'arcane-vault-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
