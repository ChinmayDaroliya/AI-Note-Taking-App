"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { NoteCard } from "@/components/NoteCard";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNotes } from "@/hooks/use-notes";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const [search, setSearch] = useState("");
  const { data: notes, isLoading } = useNotes(search || undefined);
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // ... (inside component)
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-6 w-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <h1 className="text-lg font-semibold tracking-tight mr-auto">Studio</h1>
          <div className="w-64">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={signOut} className="rounded-xl">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Your notes</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {notes?.length ?? 0} note{(notes?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => router.push("/note/new")} className="rounded-xl gap-1.5">
            <Plus className="h-4 w-4" /> New Note
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-card p-5 shadow-ceramic animate-pulse h-36" />
            ))}
          </div>
        ) : notes?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-muted-foreground text-lg">The page is quiet.</p>
            <p className="text-muted-foreground text-sm mt-1">Start typing to wake the AI.</p>
            <Button onClick={() => router.push("/note/new")} variant="outline" className="mt-6 rounded-xl">
              Create your first note
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {notes?.map((note) => (
                <NoteCard key={note.id} note={note} onClick={() => router.push(`/note/${note.id}`)} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
