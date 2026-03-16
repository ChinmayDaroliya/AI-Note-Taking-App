"use client";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { NoteEditor } from "@/components/NoteEditor";

export default function NotePage() {
  const { user, loading } = useAuth();
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

  return <NoteEditor />;
}
