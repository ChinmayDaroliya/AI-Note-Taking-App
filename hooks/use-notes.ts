import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import type { Note } from "@/integrations/supabase/types";
import type { NoteCreateInput, NoteUpdateInput } from "@/lib/validation";

export type { Note };

type NoteCreatePayload = Omit<NoteCreateInput, "userId">;
type NoteUpdatePayload = Omit<NoteUpdateInput, "userId">;

export function useNotes(searchQuery?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notes", user?.id, searchQuery],
    queryFn: async () => {
      if (!user) return [];

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      params.set('userId', user.id);

      const response = await fetch(`/api/notes?${params}`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      return response.json() as Promise<Note[]>;
    },
    enabled: !!user,
  });
}

export function useNote(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      if (!user || !id) return null;

      const params = new URLSearchParams();
      params.set('userId', user.id);

      const response = await fetch(`/api/notes/${id}?${params}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error('Failed to fetch note');
      }
      return response.json() as Promise<Note>;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (note: NoteCreatePayload) => {
      if (!user) throw new Error("Not authenticated");

      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...note, userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to create note');
      return response.json() as Promise<Note>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & NoteUpdatePayload) => {
      if (!user) throw new Error("Not authenticated");

      const response = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, userId: user.id }),
      });

      if (!response.ok) throw new Error('Failed to update note');
      return response.json() as Promise<Note>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["note", data.id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      const params = new URLSearchParams();
      params.set('userId', user.id);

      const response = await fetch(`/api/notes/${id}?${params}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete note');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}
