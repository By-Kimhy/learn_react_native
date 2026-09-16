import { z } from 'zod';

/**
 * What one AI pass over a note returns. A single request covers all four
 * actions in the spec — summarise, generate a title, extract tasks, detect
 * events — because they all read the same text, and one round trip means one
 * wait for the user instead of four.
 */
export const NoteAnalysisSchema = z.object({
  /** Two or three sentences at most; empty when the note is too thin to summarise. */
  summary: z.string(),
  /** A short title for the note, 2-6 words. */
  title: z.string(),
  tasks: z.array(
    z.object({
      title: z.string(),
      /** `YYYY-MM-DD`, or null when the note implies no deadline. */
      dueDate: z.string().nullable(),
      priority: z.enum(['low', 'medium', 'high']),
    })
  ),
  events: z.array(
    z.object({
      title: z.string(),
      /** `YYYY-MM-DD`, resolved against the note's "today". */
      date: z.string(),
      /** 24-hour `HH:mm`, or null for an all-day event. */
      time: z.string().nullable(),
    })
  ),
});

export type NoteAnalysis = z.infer<typeof NoteAnalysisSchema>;

export const TitleSchema = z.object({ title: z.string() });
