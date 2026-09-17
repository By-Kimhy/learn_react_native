import { todayISO } from '@/lib/date';

import { NoteAnalysisSchema, TitleSchema, type NoteAnalysis } from './schema';

/**
 * All Cursor calls live here. The app is local-first, so this is the only
 * module that needs the network — everything else keeps working offline.
 *
 * Cursor does not expose a chat-completions endpoint. Note AI launches a
 * no-repo Cloud Agent, waits for the run, then parses the assistant text as
 * JSON. `@cursor/sdk` is Node-only (local executor), so the phone talks HTTP.
 */

const API_BASE = 'https://api.cursor.com/v1';
const MODEL = 'composer-2.5';
const POLL_MS = 2000;
const TIMEOUT_MS = 4 * 60 * 1000;

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

/** User / service-account keys from cursor.com/dashboard — not Anthropic `sk-ant-`. */
export function looksLikeCursorKey(value: string): boolean {
  const key = value.trim();
  if (!key || /\s/.test(key) || key.startsWith('sk-ant-')) return false;
  return /^(key_|crsr_|cursor_)/.test(key) || key.length >= 32;
}

function headers(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey.trim()}`,
    'Content-Type': 'application/json',
  };
}

async function cursorFetch(path: string, apiKey: string, init?: RequestInit): Promise<Response> {
  if (!apiKey.trim()) throw new AIError('no-key', 'No API key configured');

  try {
    return await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { ...headers(apiKey), ...init?.headers },
    });
  } catch {
    throw new AIError('offline', 'Could not reach the API');
  }
}

async function readError(response: Response): Promise<AIError> {
  if (response.status === 401 || response.status === 403) {
    return new AIError('auth', 'The API key was rejected');
  }
  if (response.status === 429) {
    return new AIError('rate-limit', 'Rate limited — try again shortly');
  }

  let detail = response.statusText;
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
      detail = body.message;
    }
  } catch {
    // Keep statusText.
  }

  return new AIError('unknown', detail || 'Unknown error');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? text).trim();
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) throw new AIError('unknown', 'The response did not match the expected shape');

  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    throw new AIError('unknown', 'The response did not match the expected shape');
  }
}

const ANALYSIS_SHAPE = `{
  "summary": string (1-3 short sentences, or "" if the note is too thin),
  "title": string (2-6 words, no sentence punctuation),
  "tasks": [{ "title": string, "dueDate": "YYYY-MM-DD" | null, "priority": "low" | "medium" | "high" }],
  "events": [{ "title": string, "date": "YYYY-MM-DD", "time": "HH:mm" | null }]
}`;

const SYSTEM = `You help someone tidy up their personal notes in an app called LifeHub.

This is a no-repo cloud agent. Do not use tools, do not write files, do not start a plan.
Reply with a single JSON object and nothing else — no markdown fences, no commentary.

Return only what the note actually supports:
- summary: 1-3 short sentences. If the note is too short or has no substance, return an empty string.
- title: 2-6 words capturing the note. Never punctuate it like a sentence.
- tasks: concrete actions the writer intends to do. Skip anything already done, and skip vague musings. Infer priority from urgency words, defaulting to medium.
- events: things happening at a specific time or on a specific day — meetings, appointments, deadlines with a time.

Resolve relative dates ("tomorrow", "Friday", "next week") against the current date given in the message. Dates are YYYY-MM-DD and times are 24-hour HH:mm. Use null for a date or time the note does not state.

Return empty arrays rather than inventing tasks or events.

JSON shape:
${ANALYSIS_SHAPE}`;

interface CreatedAgent {
  agent: { id: string };
  run: { id: string; status: string };
}

interface RunSnapshot {
  id: string;
  status: string;
  result?: string;
}

async function createAgent(apiKey: string, prompt: string, name: string): Promise<CreatedAgent> {
  const response = await cursorFetch('/agents', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      prompt: { text: prompt },
      name,
      model: { id: MODEL },
    }),
  });

  if (!response.ok) throw await readError(response);

  const body = (await response.json()) as CreatedAgent;
  if (!body?.agent?.id || !body?.run?.id) {
    throw new AIError('unknown', 'The API did not return an agent run');
  }
  return body;
}

async function getRun(apiKey: string, agentId: string, runId: string): Promise<RunSnapshot> {
  const response = await cursorFetch(`/agents/${encodeURIComponent(agentId)}/runs/${encodeURIComponent(runId)}`, apiKey);
  if (!response.ok) throw await readError(response);
  return (await response.json()) as RunSnapshot;
}

async function deleteAgent(apiKey: string, agentId: string): Promise<void> {
  try {
    await cursorFetch(`/agents/${encodeURIComponent(agentId)}`, apiKey, { method: 'DELETE' });
  } catch {
    // Best-effort cleanup — a leftover agent is not worth failing the analysis.
  }
}

const TERMINAL = new Set(['FINISHED', 'ERROR', 'CANCELLED', 'EXPIRED']);

async function waitForResult(apiKey: string, agentId: string, runId: string): Promise<string> {
  const deadline = Date.now() + TIMEOUT_MS;

  while (Date.now() < deadline) {
    const run = await getRun(apiKey, agentId, runId);
    if (TERMINAL.has(run.status)) {
      if (run.status !== 'FINISHED' || !run.result?.trim()) {
        throw new AIError('unknown', run.result?.trim() || `Run ${run.status.toLowerCase()}`);
      }
      return run.result;
    }
    await sleep(POLL_MS);
  }

  throw new AIError('unknown', 'Cursor took too long to finish');
}

async function promptCursor(apiKey: string, prompt: string, name: string): Promise<string> {
  const created = await createAgent(apiKey, prompt, name);
  try {
    return await waitForResult(apiKey, created.agent.id, created.run.id);
  } finally {
    await deleteAgent(apiKey, created.agent.id);
  }
}

export interface AnalyzeParams {
  apiKey: string;
  title: string;
  body: string;
}

export async function analyzeNote({ apiKey, title, body }: AnalyzeParams): Promise<NoteAnalysis> {
  const text = [title.trim(), body.trim()].filter(Boolean).join('\n\n');
  if (!text) throw new AIError('empty', 'The note is empty');

  const prompt = `${SYSTEM}

Today is ${todayISO()}.

Note:
"""
${text}
"""`;

  const result = await promptCursor(apiKey, prompt, 'LifeHub note analysis');
  const parsed = NoteAnalysisSchema.safeParse(extractJsonObject(result));
  if (!parsed.success) throw new AIError('unknown', 'The response did not match the expected shape');
  return parsed.data;
}

export async function generateTitle({ apiKey, body }: { apiKey: string; body: string }): Promise<string> {
  const text = body.trim();
  if (!text) throw new AIError('empty', 'The note is empty');

  const prompt = `You help someone title a personal note in LifeHub.
This is a no-repo cloud agent. Do not use tools, do not write files.
Reply with a single JSON object {"title": string} and nothing else.
The title must be 2-6 words with no trailing punctuation.

Note:
"""
${text}
"""`;

  const result = await promptCursor(apiKey, prompt, 'LifeHub note title');
  const parsed = TitleSchema.safeParse(extractJsonObject(result));
  if (!parsed.success || !parsed.data.title.trim()) {
    throw new AIError('unknown', 'No title was returned');
  }
  return parsed.data.title.trim();
}
