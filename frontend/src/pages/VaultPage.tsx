import React, { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useStore } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function VaultPage() {
  const [match, params] = useRoute("/page/:id");
  const { pages, addPage, isLoading } = useStore();
  const [, setLocation] = useLocation();

  // Redirect or create initial page
  useEffect(() => {
    if (isLoading) return;

    if (!match && pages.length > 0) {
      // Find the first root page or just first page
      const firstPage = pages.find(p => !p.parentId) || pages[0];
      setLocation(`/page/${firstPage.id}`);
    } else if (pages.length === 0) {
      // Create initial page if empty
      const createInitial = async () => {
        const newId = await addPage();
        if (newId) setLocation(`/page/${newId}`);
      };
      createInitial();
    }
  }, [match, pages, addPage, setLocation, isLoading]);

  const currentPageId = params?.id;
  const currentPage = pages.find(p => p.id === currentPageId);

  return (
    <div className="flex h-screen w-full overflow-hidden text-neutral-200 font-sans">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 lg:w-72 shrink-0 z-10 h-full">
        <Sidebar className="w-full h-full" />
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-scroll relative z-0">

        {currentPage ? (
          <Editor key={currentPage.id} page={currentPage} />
        ) : (
          <div className="flex items-center justify-center h-full text-neutral-500">
            Select a page
          </div>
        )}
      </main>
    </div>
  );
}
