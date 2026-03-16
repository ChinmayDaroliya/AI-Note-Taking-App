import {z} from "zod";

export const noteCreateSchema = z.object({
    title: z.string().min(0).optional(),
    content: z.string().min(0).optional(),
    userId: z.string().min(1),
});

export const noteUpdateSchema = z.object({
    title: z.string().min(0).optional(),
    content: z.string().min(0).optional(),
    tags: z.array(z.string()).optional(),
    userId: z.string().min(1),
  });
  
  export const noteQuerySchema = z.object({
    userId: z.string().min(1),
    search: z.string().optional(),
  });
  
  export const noteIdParamSchema = z.object({
    id: z.string().min(1),
  });
  
  export const aiRequestSchema = z.object({
    action: z.enum(["summarize", "improve", "tags"]),
    content: z.string().min(1),
    title: z.string().optional(),
  });
  
  export type NoteCreateInput = z.infer<typeof noteCreateSchema>;
  export type NoteUpdateInput = z.infer<typeof noteUpdateSchema>;
  export type AIRequestInput = z.infer<typeof aiRequestSchema>;