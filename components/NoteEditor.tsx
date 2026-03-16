"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AIToolbar } from "@/components/AIToolBar";
import { useNote, useUpdateNote, useDeleteNote, useCreateNote } from "@/hooks/use-notes";
import { toast } from "sonner";

export function NoteEditor() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const isNew = id === "new";
  const { data: note } = useNote(isNew ? undefined : id);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createNote = useCreateNote();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAction, setAiAction] = useState<string | null>(null);
  const [shimmer, setShimmer] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      noteIdRef.current = note.id;
    }
  }, [note]);

  const save = useCallback(
    async (t: string, c: string, tg?: string[]) => {
      if (isNew && !noteIdRef.current) {
        try {
          const created = await createNote.mutateAsync({ title: t || "Untitled", content: c });
          noteIdRef.current = created.id;
          window.history.replaceState(null, "", `/note/${created.id}`);
        } catch { /* ignore */ }
        return;
      }
      if (noteIdRef.current) {
        updateNote.mutate({ id: noteIdRef.current, title: t, content: c, ...(tg ? { tags: tg } : {}) });
      }
    },
    [isNew, createNote, updateNote]
  );

  const debouncedSave = useCallback(
    (t: string, c: string) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
    }
      saveTimer.current = setTimeout(() => save(t, c), 800);
    },
    [save]
  );

  const handleTitleChange = (val: string) => {
    setTitle(val);
    debouncedSave(val, content);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    debouncedSave(title, val);
  };

  const handleDelete = async () => {
    if (noteIdRef.current) {
      await deleteNote.mutateAsync(noteIdRef.current);
    }
    router.push("/");
  };

  const handleAI = async (action: string) => {
    if (!content.trim()) {
      toast.error("Write some content first");
      return;
    }
    setAiLoading(true);
    setAiAction(action);
    if (action === "improve") setShimmer(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, content, title }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI request failed');
      }

      const data = await response.json();

      if (action === "summarize") {
        setContent((prev) => prev + "\n\n---\n**Summary:**\n" + data.result);
        save(title, content + "\n\n---\n**Summary:**\n" + data.result);
        toast.success("Summary generated");
      } else if (action === "improve") {
        setContent(data.result);
        save(title, data.result);
        toast.success("Content improved");
      } else if (action === "tags") {
        const newTags = data.result as string[];
        setTags(newTags);
        save(title, content, newTags);
        toast.success("Tags generated");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "AI request failed";
      toast.error(message);
    } finally {
      setAiLoading(false);
      setAiAction(null);
      setShimmer(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[65ch] mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="rounded-xl gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDelete} className="rounded-xl gap-1.5 text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        >
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="border-none text-4xl font-bold tracking-tight bg-transparent p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/40 mb-4"
          />

          {tags.length > 0 && (
            <div className="flex gap-1.5 mb-6 flex-wrap">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] font-mono uppercase tracking-wider">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className={`relative ${shimmer ? "ai-shimmer rounded-xl" : ""}`}>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="The page is quiet. Start typing to wake the AI."
              className={`w-full min-h-[60vh] bg-transparent border-none resize-none text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none ${
                shimmer ? "opacity-40 transition-opacity duration-300" : ""
              }`}
            />
          </div>
        </motion.div>
      </div>

      <AIToolbar
        onSummarize={() => handleAI("summarize")}
        onImprove={() => handleAI("improve")}
        onGenerateTags={() => handleAI("tags")}
        isLoading={aiLoading}
        loadingAction={aiAction}
      />
    </div>
  );
}
