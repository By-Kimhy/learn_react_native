import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';

import { todayISO } from '@/lib/date';

import { NoteAnalysisSchema, TitleSchema, type NoteAnalysis } from './schema';

/**
 * All Claude calls live here. The app is local-first, so this is the only
 * module that needs the network — everything else keeps working offline.
 */

const MODEL = 'claude-opus-5';
/** Opus 5 thinks by default, and thinking tokens come out of `max_tokens`. */
const MAX_TOKENS = 16000;
const TITLE_MAX_TOKENS = 4096;

export type AIErrorKind = 'offline' | 'no-key' | 'auth' | 'rate-limit' | 'empty' | 'unknown';

export class AIError extends Error {
  constructor(
    readonly kind: AIErrorKind,
    message: string
  ) {
    super(message);
    this.name = 'AIError';
  }
}

function createClient(apiKey: string): Anthropic {
  if (!apiKey.trim()) throw new AIError('no-key', 'No API key configured');

  return new Anthropic({
    apiKey: apiKey.trim(),
    // React Native looks like a browser to the SDK's environment check. The key
    // lives on the user's own device and is entered by them in Settings — see
    // the security note in the README about why a backend proxy is better.
    dangerouslyAllowBrowser: true,
  });
}

/** Maps SDK and network failures onto something the UI can explain. */
function toAIError(error: unknown): AIError {
  if (error instanceof AIError) return error;

  if (error instanceof Anthropic.AuthenticationError) {
    return new AIError('auth', 'The API key was rejected');
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AIError('rate-limit', 'Rate limited — try again shortly');
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new AIError('offline', 'Could not reach the API');
  }
  if (error instanceof Anthropic.APIError) {
    return new AIError('unknown', error.message);
  }

  return new AIError('unknown', error instanceof Error ? error.message : 'Unknown error');
}

const SYSTEM = `You help someone tidy up their personal notes in an app called LifeHub.

Return only what the note actually supports:
- summary: 1-3 short sentences. If the note is too short or has no substance, return an empty string.
- title: 2-6 words capturing the note. Never punctuate it like a sentence.
- tasks: concrete actions the writer intends to do. Skip anything already done, and skip vague musings. Infer priority from urgency words, defaulting to medium.
- events: things happening at a specific time or on a specific day — meetings, appointments, deadlines with a time.

Resolve relative dates ("tomorrow", "Friday", "next week") against the current date given in the message. Dates are YYYY-MM-DD and times are 24-hour HH:mm. Use null for a date or time the note does not state.

Return empty arrays rather than inventing tasks or events.`;

export interface AnalyzeParams {
  apiKey: string;
  title: string;
  body: string;
}

export async function analyzeNote({ apiKey, title, body }: AnalyzeParams): Promise<NoteAnalysis> {
  const text = [title.trim(), body.trim()].filter(Boolean).join('\n\n');
  if (!text) throw new AIError('empty', 'The note is empty');

  const client = createClient(apiKey);

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM,
      thinking: { type: 'adaptive' },
      output_config: { format: zodOutputFormat(NoteAnalysisSchema) },
      messages: [
        {
          role: 'user',
          content: `Today is ${todayISO()}.\n\nNote:\n"""\n${text}\n"""`,
        },
      ],
    });

    // `parsed_output` is null when the model's JSON did not satisfy the schema.
    const parsed = response.parsed_output;
    if (!parsed) throw new AIError('unknown', 'The response did not match the expected shape');

    return parsed;
  } catch (error) {
    throw toAIError(error);
  }
}

/**
 * The standalone "generate a title" action, kept cheap with low effort.
 *
 * Not thinking-free: on Opus 5 thinking is on unless you say otherwise, and it
 * spends `max_tokens`. The old 256-token ceiling was consumed before the title
 * was emitted, so every call came back unparsable. Low effort keeps the cost
 * down without the failure modes that come with disabling thinking outright.
 */
export async function generateTitle({ apiKey, body }: { apiKey: string; body: string }): Promise<string> {
  const text = body.trim();
  if (!text) throw new AIError('empty', 'The note is empty');

  const client = createClient(apiKey);

  try {
    const response = await client.messages.parse({
      model: MODEL,
      max_tokens: TITLE_MAX_TOKENS,
      system: 'Give the note a 2-6 word title. No trailing punctuation.',
      thinking: { type: 'adaptive' },
      output_config: { effort: 'low', format: zodOutputFormat(TitleSchema) },
      messages: [{ role: 'user', content: text }],
    });

    const parsed = response.parsed_output;
    if (!parsed?.title.trim()) throw new AIError('unknown', 'No title was returned');

    return parsed.title.trim();
  } catch (error) {
    throw toAIError(error);
  }
}
