import React, { useState } from "react";
import { useStore, Page } from "@/lib/store";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  CornerDownRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import * as ContextMenu from "@radix-ui/react-context-menu";

interface SidebarItemProps {
  page: Page;
  depth: number;
  onToggle: (id: string) => void;
  onAddPage: (parentId: string) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
}

const SidebarItem = ({ page, depth, onToggle, onAddPage, onDelete, isActive }: SidebarItemProps) => {
  const { pages } = useStore();
  const children = pages.filter(p => p.parentId === page.id).sort((a, b) => a.updatedAt - b.updatedAt);
  const hasChildren = children.length > 0;

  return (
    <div className="select-none">
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <div
            className={`
              group flex items-center gap-1 py-1 px-2 rounded-lg cursor-pointer transition-colors
              ${isActive ? "bg-emerald-500/10 text-emerald-100" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"}
            `}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle(page.id);
              }}
              className={`p-0.5 rounded-md hover:bg-white/10 transition-colors ${!hasChildren && "opacity-0 group-hover:opacity-100"}`}
            >
              <div className={`transition-transform duration-200 ${page.isExpanded ? "rotate-90" : ""}`}>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>

            <Link href={`/page/${page.id}`} className="flex-1 flex items-center gap-2 overflow-hidden py-1">
              <span className="text-sm shrink-0">{page.icon || <FileText className="w-3.5 h-3.5" />}</span>
              <span className="truncate text-sm font-medium">{page.title || "Untitled"}</span>
            </Link>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddPage(page.id);
                }}
                className="p-1 hover:bg-white/10 rounded"
                title="Add sub-page"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Portal>
          <ContextMenu.Content className="min-w-[160px] bg-[#1a1a1a] border border-white/10 rounded-lg p-1 shadow-xl text-sm text-neutral-300 z-50 animate-in fade-in zoom-in-95 duration-100">
            <ContextMenu.Item
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 hover:text-white outline-none cursor-pointer"
              onSelect={() => onAddPage(page.id)}
            >
              <Plus className="w-4 h-4" /> New sub-page
            </ContextMenu.Item>
            <ContextMenu.Separator className="h-px bg-white/10 my-1" />
            <ContextMenu.Item
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-red-500/20 hover:text-red-400 outline-none cursor-pointer text-red-500"
              onSelect={() => onDelete(page.id)}
            >
              <Trash2 className="w-4 h-4" /> Delete
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>

      <AnimatePresence>
        {page.isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {children.map(child => (
              <SidebarItem
                key={child.id}
                page={child}
                depth={depth + 1}
                onToggle={onToggle}
                onAddPage={onAddPage}
                onDelete={onDelete}
                isActive={isActive} // This logic needs to be checked in parent
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import appIcon from "@/assets/app-icon.jpg";

export function Sidebar({ className }: { className?: string }) {
  const { pages, togglePageExpand, addPage, deletePage } = useStore();
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState("");

  const rootPages = pages.filter(p => !p.parentId).sort((a, b) => a.updatedAt - b.updatedAt);

  // Flatten for search
  const searchedPages = pages.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  const handleAddPage = async (parentId?: string) => {
    const newId = await addPage(parentId || null);
    if (newId) {
      if (parentId) {
        // Ensure parent is expanded
        const parent = pages.find(p => p.id === parentId);
        if (parent && !parent.isExpanded) togglePageExpand(parentId);
      }
      setLocation(`/page/${newId}`);
    }
  };

  const currentId = location.split('/page/')[1];

  return (
    <div className={`flex flex-col h-full liquid-glass border-r-0 ${className}`}>
      <div className="p-4 space-y-4">
        {/* User / Workspace Switcher Mock */}
        <div className="flex items-center gap-2 px-2 py-1 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
          <img src={appIcon} alt="Logo" className="w-5 h-5 rounded object-cover" />
          <span className="text-sm font-medium text-neutral-200">Arcane Vault</span>
          <ChevronDown className="w-3 h-3 text-neutral-500 ml-auto" />
        </div>

        {/* Search & New Page */}
        <div className="space-y-2">
          <div className="relative group">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 group-focus-within:text-emerald-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pages..."
              className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-8 pr-2 text-xs text-neutral-300 placeholder:text-neutral-600 focus:outline-hidden focus:bg-white/10 focus:border-emerald-500/30 transition-all"
            />
          </div>

          <button
            onClick={() => handleAddPage()}
            className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-neutral-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Page</span>
          </button>
        </div>
      </div>

      {/* Page Tree */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-hide">
        <div className="space-y-0.5">
          {search ? (
            // Search Results
            searchedPages.map(page => (
              <Link key={page.id} href={`/page/${page.id}`} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300">
                <span className="text-xs">{page.icon || <FileText className="w-3.5 h-3.5" />}</span>
                <span className="truncate">{page.title}</span>
                <span className="ml-auto text-xs text-neutral-600 truncate max-w-[80px]">
                  {page.parentId ? "Sub-page" : "Page"}
                </span>
              </Link>
            ))
          ) : (
            // Tree View
            rootPages.map(page => (
              <SidebarItem
                key={page.id}
                page={page}
                depth={0}
                onToggle={togglePageExpand}
                onAddPage={handleAddPage}
                onDelete={deletePage}
                isActive={currentId === page.id || pages.find(p => p.id === currentId)?.parentId === page.id} // Simple active check, technically should recurse
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
