import { sanitizeInput } from '../utils/security';

const AI_PROVIDER =
  process.env.AI_PROVIDER ||
  (process.env.GEMINI_API_KEY ? 'gemini' : process.env.OPENAI_API_KEY ? 'openai' : 'gemini');
const AI_API_KEY =
  process.env.AI_API_KEY ||
  (AI_PROVIDER === 'gemini' ? process.env.GEMINI_API_KEY : process.env.OPENAI_API_KEY) ||
  process.env.GEMINI_API_KEY ||
  process.env.OPENAI_API_KEY ||
  '';
const AI_MODEL =
  process.env.AI_MODEL ||
  (AI_PROVIDER === 'gemini' ? 'gemini-2.0-flash' : 'gpt-4o-mini');
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.openai.com/v1';

export interface ChordResult {
  title: string;
  artist: string;
  key: string;
  content: string;
}

const extractJson = (raw: string): string => {
  const trimmed = raw.trim();

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return trimmed.slice(first, last + 1);
  }

  return trimmed;
};

const buildPrompt = (title: string, artist: string, instrument: string): string => {
  const instrumentInstructions: Record<string, string> = {
    guitar: 'Standard Guitar chords (e.g. G, Am, C, D).',
    ukulele: 'Ukulele chords in standard GCEA tuning.',
    piano: 'Piano/Keyboard chords, include bass note where appropriate (e.g. C/G).',
  };
  const instr = instrumentInstructions[instrument] || instrumentInstructions.guitar;

  return `Generate the """${instrument}""" chord sheet with lyrics for """${title}""" by """${artist}""".
${instr}
Format: chords placed above the corresponding lyrics on separate lines (standard chord sheet format).
Determine the musical key.
Return JSON exactly as: {"title": "...", "artist": "...", "key": "G", "content": "full chord sheet text"}`;
};

async function callGemini(prompt: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${AI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }
  const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
}

async function callOpenAI(prompt: string): Promise<string> {
  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: 'You are a music chord sheet generator. Respond ONLY with valid JSON, no markdown.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`AI API error ${res.status}: ${errText}`);
  }
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || '{}';
}

export async function generateChords(
  title: string,
  artist: string,
  instrument: string
): Promise<ChordResult> {
  if (!AI_API_KEY) {
    throw new Error('AI_API_KEY no configurada en el servidor. Contactá al administrador.');
  }

  const sanitizedTitle = sanitizeInput(title);
  const sanitizedArtist = sanitizeInput(artist);
  const sanitizedInstrument = sanitizeInput(instrument);

  const prompt = buildPrompt(sanitizedTitle, sanitizedArtist, sanitizedInstrument);
  const rawJson = AI_PROVIDER === 'gemini' ? await callGemini(prompt) : await callOpenAI(prompt);
  const parsedJson = extractJson(rawJson);

  let data: Partial<ChordResult>;
  try {
    data = JSON.parse(parsedJson);
  } catch {
    throw new Error('La IA devolvió una respuesta inválida. Intentá de nuevo.');
  }

  return {
    title: data.title || title,
    artist: data.artist || artist,
    key: data.key || 'C',
    content: data.content || 'No se pudo generar el cifrado.',
  };
}
