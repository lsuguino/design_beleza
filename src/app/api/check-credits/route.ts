import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getFriendlyErrorMessage } from '@/lib/anthropic-error';
import { ensureAnthropicKey } from '@/lib/ensure-env';

/**
 * GET /api/check-credits
 * Faz uma chamada mínima à API Anthropic para verificar se a chave está válida e há créditos.
 */
export async function GET() {
  const apiKey = await ensureAnthropicKey();
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: 'ANTHROPIC_API_KEY não está configurada no .env.local' },
      { status: 200 }
    );
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Responda só: OK' }],
    });
    return NextResponse.json({
      ok: true,
      message: 'Chave válida e créditos disponíveis. Você pode usar a Geração Inteligente.',
    });
  } catch (err) {
    const message = getFriendlyErrorMessage(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 200 }
    );
  }
}
