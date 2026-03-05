/**
 * Extrai mensagem amigável de erros da API Anthropic e outros erros de geração.
 */

interface AnthropicErrorBody {
  type?: string;
  error?: {
    type?: string;
    message?: string;
  };
}

function getMessageFromObject(obj: unknown): string | null {
  if (obj && typeof obj === 'object') {
    const body = obj as Record<string, unknown>;
    const err = body.error as AnthropicErrorBody['error'] | undefined;
    const msg = err?.message ?? (body.message as string | undefined);
    if (typeof msg === 'string' && msg.length > 0) return msg;
  }
  return null;
}

function tryParseJsonMessage(str: string): string | null {
  const trimmed = str.trim();
  if ((trimmed.startsWith('{') && trimmed.includes('"error"')) || trimmed.startsWith('400 ')) {
    try {
      const json = trimmed.replace(/^\d+\s*/, '');
      const obj = JSON.parse(json) as AnthropicErrorBody;
      return getMessageFromObject(obj) ?? getMessageFromObject({ error: obj.error });
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Traduz erros conhecidos da Anthropic para mensagens em português.
 */
function translateAnthropicMessage(englishMessage: string): string {
  const lower = englishMessage.toLowerCase();
  if (lower.includes('credit balance') || lower.includes('too low') || lower.includes('insufficient')) {
    return 'Saldo de créditos Anthropic insuficiente (isso afeta só a "Geração Inteligente", não o PDF). Adicione créditos em console.anthropic.com ou use "Usar material de exemplo" na página para testar o Download PDF sem créditos.';
  }
  if (lower.includes('invalid_api_key') || lower.includes('authentication') || lower.includes('api key')) {
    return 'Chave da API Anthropic inválida ou expirada. Verifique ANTHROPIC_API_KEY no .env.local.';
  }
  if (lower.includes('rate limit') || lower.includes('overloaded')) {
    return 'Muitas requisições no momento. Aguarde alguns segundos e tente novamente.';
  }
  if (lower.includes('context_length') || lower.includes('token')) {
    return 'O conteúdo do VTT é muito longo para processar. Tente um arquivo menor ou use o modo Resumido.';
  }
  return englishMessage;
}

/**
 * Retorna uma mensagem de erro amigável para exibir ao usuário.
 * Usar nos catch das rotas e agentes que chamam a Anthropic.
 */
export function getFriendlyErrorMessage(err: unknown): string {
  const fallback = 'Erro ao gerar material. Tente novamente.';

  if (err instanceof Error) {
    const msg = err.message;
    const fromJson = tryParseJsonMessage(msg);
    const fromBody = getMessageFromObject((err as Error & { body?: unknown }).body);
    const raw = fromJson ?? fromBody ?? msg;
    if (raw.includes('credit balance') || raw.includes('too low') || raw.includes('invalid_request_error') || fromJson) {
      return translateAnthropicMessage(raw);
    }
    if (raw.length > 0 && raw.length < 500) return raw;
  }

  const body = typeof err === 'object' && err !== null ? (err as Record<string, unknown>).body : undefined;
  const fromBody = getMessageFromObject(body);
  if (fromBody) return translateAnthropicMessage(fromBody);

  return fallback;
}
