import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import type { Note } from "@/hooks/use-notes";
import { Badge } from "@/components/ui/badge";

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl bg-card p-5 shadow-ceramic transition-shadow hover:shadow-ceramic-hover border border-border/50"
    >
      <h3 className="text-base font-semibold tracking-tight text-card-foreground truncate">
        {note.title || "Untitled"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
        {note.content || "Empty note"}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-mono">
          {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
        </span>
        {note.tags && note.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap justify-end">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-[10px] font-mono uppercase tracking-wider px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}