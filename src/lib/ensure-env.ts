import { readFile } from 'fs/promises';
import path from 'path';

/**
 * Garante que OPENROUTER_API_KEY está disponível em process.env.
 * Se não estiver, tenta ler do .env.local no disco (útil quando o Next não carrega o arquivo, ex.: Cursor/remote).
 */
export async function ensureOpenRouterKey(): Promise<string | null> {
  let key = process.env.OPENROUTER_API_KEY?.trim();
  if (key) return key;
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const raw = await readFile(envPath, 'utf-8');
    const line = raw.split('\n').find((l) => l.startsWith('OPENROUTER_API_KEY='));
    if (line) {
      const value = line.slice('OPENROUTER_API_KEY='.length).trim().replace(/^["']|["']$/g, '');
      if (value) {
        process.env.OPENROUTER_API_KEY = value;
        return value;
      }
    }
  } catch {
    // .env.local inexistente ou inacessível
  }
  return null;
}
