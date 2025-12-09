import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { 
  Search, 
  Plus, 
  Save, 
  Trash2, 
  Sparkles, 
  Clock, 
  Tag, 
  ChevronLeft 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types ---

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// --- Mock Data ---

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
  {
    id: "3",
    title: "Meeting Notes: Q1 Roadmap",
    content: "Attendees: Sarah, Mike, Alex.\n\n- Focus on stability first.\n- New feature rollout scheduled for March.\n- Need to hire 2 more frontend devs.",
    tags: ["work", "planning"],
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
];

// --- Components ---

const Sidebar = ({ 
  notes, 
  selectedId, 
  onSelect, 
  searchQuery, 
  setSearchQuery,
  className
}: { 
  notes: Note[]; 
  selectedId: string | null; 
  onSelect: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  className?: string;
}) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-6 pb-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </motion.div>
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-neutral-100">
            Vault
          </h1>
        </motion.div>

        {/* Search */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative group"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-400/80 transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-hidden focus:bg-white/10 focus:border-emerald-500/30 focus:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300"
            data-testid="input-search"
          />
        </motion.div>
      </div>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 scrollbar-hide">
        <AnimatePresence mode="popLayout">
          {notes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-neutral-600 text-sm"
            >
              No notes found.
            </motion.div>
          ) : (
            notes.map((note) => (
              <motion.button
                layout
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(note.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors duration-300 group relative overflow-hidden
                  ${
                    selectedId === note.id
                      ? "bg-white/10 border-emerald-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
                      : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-emerald-500/20"
                  }
                `}
                data-testid={`card-note-${note.id}`}
              >
                {selectedId === note.id && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                  />
                )}
                
                <h3 className={`font-medium mb-1 truncate transition-colors duration-200 ${selectedId === note.id ? "text-emerald-100" : "text-neutral-200 group-hover:text-white"}`}>
                  {note.title || "Untitled Note"}
                </h3>
                
                <p className="text-xs text-neutral-500 line-clamp-2 mb-3 leading-relaxed">
                  {note.content || "No content..."}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-neutral-600 flex items-center gap-1">
                    {format(note.updatedAt, "MMM d")}
                  </span>
                  <div className="flex gap-1">
                    {note.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="w-1.5 h-1.5 rounded-full bg-emerald-500/30" />
                    ))}
                  </div>
                </div>
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function VaultPage() {
  // State
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Editor State
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorTags, setEditorTags] = useState("");
  const [lastSaved, setLastSaved] = useState<number | null>(null);

  // Derived State
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes.sort((a, b) => b.updatedAt - a.updatedAt);
    const q = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
    ).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery]);

  // Effects
  useEffect(() => {
    if (selectedId) {
      const note = notes.find((n) => n.id === selectedId);
      if (note) {
        setEditorTitle(note.title);
        setEditorContent(note.content);
        setEditorTags(note.tags.join(", "));
        setLastSaved(note.updatedAt);
      }
    } else {
      // New note state
      setEditorTitle("");
      setEditorContent("");
      setEditorTags("");
      setLastSaved(null);
    }
  }, [selectedId, notes]); 

  // Handlers
  const handleNewNote = () => {
    setSelectedId(null);
  };

  const handleSave = () => {
    const now = Date.now();
    const tagsArray = editorTags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (selectedId) {
      // Update existing
      setNotes((prev) =>
        prev.map((n) =>
          n.id === selectedId
            ? {
                ...n,
                title: editorTitle,
                content: editorContent,
                tags: tagsArray,
                updatedAt: now,
              }
            : n
        )
      );
    } else {
      // Create new
      const newId = Math.random().toString(36).substr(2, 9);
      const newNote: Note = {
        id: newId,
        title: editorTitle || "Untitled",
        content: editorContent,
        tags: tagsArray,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((prev) => [newNote, ...prev]);
      setSelectedId(newId);
    }
    setLastSaved(now);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    setNotes((prev) => prev.filter((n) => n.id !== selectedId));
    setSelectedId(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      
      <div className="relative z-10 flex w-full h-full max-w-[1600px] mx-auto md:p-6 lg:p-8 gap-6">
        
        {/* Sidebar */}
        <aside className={`${selectedId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col shrink-0`}>
          <Sidebar 
            notes={filteredNotes} 
            selectedId={selectedId} 
            onSelect={setSelectedId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            className="h-full rounded-2xl md:bg-white/[0.02] md:border md:border-white/5"
          />
        </aside>

        {/* Editor Area */}
        <main className={`${!selectedId ? 'hidden md:flex' : 'flex'} flex-col flex-1 h-full min-w-0`}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="glass-panel w-full h-full rounded-none md:rounded-3xl flex flex-col relative overflow-hidden"
          >
            
            {/* Editor Toolbar */}
            <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedId(null)}
                  className="md:hidden p-2 -ml-2 text-neutral-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-xs text-neutral-500 font-medium tracking-wide uppercase">
                   {lastSaved ? (
                     <motion.div 
                       initial={{ opacity: 0, y: 5 }}
                       animate={{ opacity: 1, y: 0 }}
                       key={lastSaved}
                       className="flex items-center gap-2"
                     >
                      <Clock className="w-3 h-3" />
                      <span>Last saved {format(lastSaved, "h:mm a")}</span>
                     </motion.div>
                   ) : (
                     <span>Unsaved Draft</span>
                   )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {selectedId && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="p-2 text-neutral-500 hover:text-red-400 rounded-lg transition-colors"
                      title="Delete Note"
                      data-testid="button-delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
                
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNewNote}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-neutral-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-white/10"
                  data-testid="button-new"
                >
                  <Plus className="w-4 h-4" />
                  <span>New</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(52, 211, 153, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-emerald-950 bg-emerald-400 rounded-lg shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
                  data-testid="button-save"
                >
                  <Save className="w-4 h-4" />
                  <span>Save</span>
                </motion.button>
              </div>
            </header>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedId || "new"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-3xl mx-auto px-6 py-10 md:py-16 space-y-8"
                >
                  
                  {/* Title Input */}
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="Note Title"
                    className="w-full bg-transparent text-3xl md:text-4xl font-bold text-neutral-100 placeholder:text-neutral-700 outline-hidden border-none p-0 tracking-tight transition-all focus:text-white"
                    data-testid="input-title"
                  />

                  {/* Tags Input */}
                  <div className="flex items-center gap-3 text-neutral-500">
                    <Tag className="w-4 h-4" />
                    <input
                      type="text"
                      value={editorTags}
                      onChange={(e) => setEditorTags(e.target.value)}
                      placeholder="Add tags (comma separated)..."
                      className="flex-1 bg-transparent text-sm text-emerald-400 placeholder:text-neutral-700 outline-hidden border-none p-0 focus:text-emerald-300 transition-colors"
                      data-testid="input-tags"
                    />
                  </div>

                  {/* Content Textarea */}
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="Start writing..."
                    className="w-full h-[60vh] bg-transparent text-lg leading-relaxed text-neutral-300 placeholder:text-neutral-700 outline-hidden border-none resize-none p-0 font-light focus:text-neutral-100 transition-colors"
                    data-testid="textarea-content"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            
          </motion.div>
        </main>
      </div>
    </div>
  );
}
