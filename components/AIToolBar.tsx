import { Sparkles, FileText, Tags, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AIToolbarProps {
  onSummarize: () => void;
  onImprove: () => void;
  onGenerateTags: () => void;
  isLoading: boolean;
  loadingAction: string | null;
}

export function AIToolbar({ onSummarize, onImprove, onGenerateTags, isLoading, loadingAction }: AIToolbarProps) {
  const actions = [
    { label: "Summarize", icon: FileText, action: onSummarize, key: "summarize" },
    { label: "Improve", icon: Wand2, action: onImprove, key: "improve" },
    { label: "Tags", icon: Tags, action: onGenerateTags, key: "tags" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-card/80 backdrop-blur-md shadow-ceramic-elevated border border-border/50">
        <Sparkles className="h-4 w-4 text-accent mr-1" />
        {actions.map(({ label, icon: Icon, action, key }) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            onClick={action}
            disabled={isLoading}
            className="rounded-xl text-sm gap-1.5 hover:bg-accent/10 hover:text-accent disabled:opacity-50"
          >
            {isLoading && loadingAction === key ? (
              <div className="h-3.5 w-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            {label}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
