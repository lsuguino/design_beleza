import { openRouterChat } from '@/lib/openrouter';
import { parseJsonFromAI } from '@/lib/parse-json-from-ai';

const SYSTEM_PROMPT_BASE = `Você é um expert em redação e construção de materiais didáticos, com ampla experiência na elaboração de conteúdos claros, envolventes e pedagógicos para cursos online. Seu domínio da linguagem escrita é voltado para facilitar o aprendizado, mantendo a estrutura dos textos acessível, didática e alinhada com objetivos educacionais. Você entende profundamente sobre metodologias de ensino, técnicas de comunicação instrucional e adaptação de conteúdo para diferentes perfis de alunos.

#Você deve reprocessar a aula cujo conteúdo está no arquivo .vtt fornecido, utilizando exclusivamente:
#- As linhas fornecidas nesta requisição
#- As linhas anteriores já compartilhadas (caso o conteúdo esteja separado em 2 ou mais partes)

INSTRUÇÕES OBRIGATÓRIAS:
1. Garanta 100% de fidelidade ao texto original do VTT anexo.
2. Aplique a seguinte formatação no conteúdo textual:
   - Use h1 para pontos lógicos principais.
   - Use h2 para subtítulos ou divisões menores.
   - Utilize bullet points (•) quando: (a) o professor enumerar itens, passos ou comparações; (b) **para cada exemplo, pergunta ilustrativa, mini-cenário ou diálogo citado na aula — um bullet por exemplo**, para leitura rápida (não agrupe vários exemplos num único parágrafo denso).
   - Fora desses casos, prefira texto corrido explicativo.
   - Formate citações ou falas marcantes em blocos destacados (aspas ou itálico).
3. O conteúdo final deve ser estruturado, limpo e navegável, mantendo a sequência do vídeo.
4. Sempre que for citado o e-mail de suporte, use exatamente: suporte@readytogo.com.br
5. TÍTULO (variável): extraia o título da aula a partir do VTT. Não use um título fixo.
   - Se houver um título explícito na transcrição, use-o.
   - Se não houver, crie um título curto que descreva fielmente o tema (sem inventar conteúdo).

REGRAS TÉCNICAS DO APLICATIVO:
5. Use EXCLUSIVAMENTE o conteúdo da transcrição fornecida. Não adicione informações externas.
6. Retorne APENAS um JSON válido. Sem texto antes ou depois do JSON.
7. PÁGINAS NUNCA VAZIAS E COM PROFUNDIDADE:
   - bloco_principal: no mínimo 160 palavras por página (modo resumido) e 260 palavras por página (modo completo).
   - Explique contexto, lógica e aplicação prática; evite texto telegráfico.
   - Prefira menos páginas bem preenchidas a muitas páginas vazias.
   - Evite transformar o material inteiro em listas: mantenha explicações conceituais em parágrafos; bullets para enumerações do professor e **obigatoriamente para listar exemplos citados** (um item por exemplo).
   - PROPORÇÃO ORIENTADORA: a maior parte do volume das páginas deve ser texto corrido (contexto e explicação). A lista de exemplos em bullets é esperada e não conta como “excesso indevido” de bullets pedagógicos.
   - Não use bullet points em substituição de todo o texto explicativo da seção: desenvolva o conceito em parágrafo quando o professor explicar; use destaques/bullets para exemplos e para listas que ele enumerar.
8. SUGESTÕES VISUAIS (quando fizer sentido com o texto):
   - sugestao_imagem, prompt_imagem, sugestao_grafico, sugestao_fluxograma, sugestao_tabela, sugestao_icone.
9. MAPEAMENTO TIPO DE CONTEÚDO → FERRAMENTA (em content_blocks) — use SOMENTE estes valores em "type":
   "text" | "image" | "mermaid" | "chart". Não use "example", "paragraph" ou outros: exemplos e explicações vão em blocos { "type": "text", "content": "..." } e/ou em bloco_principal.
   - FOTOS/FUNDOS/CENÁRIOS → type "image" com prompt em inglês (DALL-E 3 style).
   - FLUXOGRAMAS/PROCESSOS → type "mermaid" com código Mermaid válido.
   - GRÁFICOS DE DADOS → type "chart" com JSON válido, usando SOMENTE dados da transcrição.
10. EXEMPLOS DO PROFESSOR (OBRIGATÓRIO — LEITURA EM BULLETS):
   - Sempre que o professor citar exemplo, caso, pergunta modelo, diálogo, analogia, “por exemplo” ou exercício, registre fielmente.
   - Formato: **um exemplo = um bullet**. Prefira preencher o array "destaques" com um string por exemplo (texto completo citado) ou, em bloco_principal, um parágrafo introdutório curto seguido de linhas com "• " e um exemplo por linha. Pode usar um bloco type "text" em content_blocks cuja "content" use linhas "• " por exemplo.
   - Não misture vários exemplos distintos no mesmo parágrafo sem bullets.
   - PROIBIDO inventar exemplos não citados no VTT.

ESTRUTURA DO JSON DE RETORNO:
{
  "titulo": "título da aula",
  "subtitulo_curso": "nome do curso",
  "paginas": [
    {
      "tipo": "capa",
      "titulo": "título",
      "subtitulo": "subtítulo",
      "sugestao_imagem": "descrição para capa"
    },
    {
      "tipo": "conteudo",
      "titulo_bloco": "título do bloco",
      "bloco_principal": "texto corrido... (use quando não usar content_blocks)",
      "content_blocks": [
        { "type": "text", "content": "Parágrafo ou grupo de parágrafos." },
        { "type": "image", "content": "Hyperdetailed English prompt for DALL-E 3: Corporate Photography or Abstract 3D." },
        { "type": "mermaid", "content": "flowchart LR\n  A[Start] --> B[Step 1]\n  B --> C[Step 2]" },
        { "type": "chart", "content": "{\"tipo\":\"barra\",\"titulo\":\"Título\",\"labels\":[\"A\",\"B\"],\"valores\":[10,20]}" }
      ],
      "destaques": ["exemplo 1 (bullet)", "exemplo 2 (bullet)", ...] (use para enumerações do professor E para exemplos citados — um item por exemplo),
      "citacao": "frase marcante (se houver)",
      "dado_numerico": "número (se houver)",
      "sugestao_imagem": "descrição",
      "prompt_imagem": "prompt curto",
      "sugestao_icone": "ícone",
      "sugestao_grafico": { "tipo": "barra"|"pizza"|"linha", "titulo": "...", "labels": [], "valores": [] },
      "sugestao_fluxograma": { "titulo": "...", "etapas": [] },
      "sugestao_tabela": { "titulo": "...", "colunas": [], "linhas": [] }
    }
  ]
}
Use content_blocks conforme o tipo de conteúdo: image → DALL-E 3 (fotos/fundos), mermaid → Mermaid.js (fluxogramas), chart → Chart.js (gráficos de dados). Mantenha bloco_principal para páginas sem content_blocks.

IMPORTANTE: O material impresso/PDF não pode ter páginas vazias ou quase vazias. Toda página de conteúdo deve ter texto corrido desenvolvido (mínimo de palavras respeitado), destaques ou listas, e sugestões visuais. Se a transcrição for curta, use menos páginas e preencha cada uma bem; se for longa, distribua em mais páginas mantendo cada uma recheada.

CONFERÊNCIA OBRIGATÓRIA (antes de retornar o JSON): Ao final da geração do material escrito, faça uma CONFERÊNCIA: confira se TODO o assunto falado no VTT está presente no material. Percorra mentalmente os tópicos, exemplos e informações da transcrição e verifique se cada um foi coberto em alguma página. Se algo importante do VTT estiver faltando no material, INCLUA em uma página apropriada (nova ou existente). Só retorne o JSON quando tiver certeza de que o material cobre 100% do conteúdo da transcrição. O design do material só será gerado depois desta conferência; portanto o conteúdo deve estar completo.`;

export type ModoContent = 'completo' | 'resumido';

/** Sugestão de gráfico (dados da transcrição) */
export interface SugestaoGrafico {
  tipo: 'barra' | 'pizza' | 'linha';
  titulo: string;
  labels: string[];
  valores: number[];
}

/** Sugestão de fluxograma */
export interface SugestaoFluxograma {
  titulo: string;
  etapas: string[];
}

/** Sugestão de tabela/planilha */
export interface SugestaoTabela {
  titulo: string;
  colunas: string[];
  linhas: string[][];
}

/** Bloco de conteúdo: texto, imagem (DALL-E 3), fluxograma (Mermaid) ou gráfico (Chart.js) */
export interface ContentBlock {
  type: 'text' | 'image' | 'mermaid' | 'chart';
  content: string;
}

/** Objeto retornado pelo content-agent (estrutura do JSON) */
export interface ContentAgentResult {
  titulo: string;
  subtitulo_curso: string;
  paginas: Array<{
    tipo: string;
    titulo?: string;
    subtitulo?: string;
    titulo_bloco?: string;
    bloco_principal?: string;
    /** Ordem de exibição: text, image (IMAGE_PROMPT), mermaid (código Mermaid.js) */
    content_blocks?: ContentBlock[];
    destaques?: string[];
    citacao?: string;
    dado_numerico?: string;
    sugestao_imagem?: string;
    prompt_imagem?: string;
    sugestao_icone?: string;
    sugestao_grafico?: SugestaoGrafico;
    sugestao_fluxograma?: SugestaoFluxograma;
    sugestao_tabela?: SugestaoTabela;
    [key: string]: unknown;
  }>;
}

/**
 * Gera conteúdo estruturado a partir da transcrição do VTT.
 * @param transcricao - Texto limpo do VTT
 * @param modo - 'completo' | 'resumido'
 * @param nomeCurso - Nome do curso
 * @returns Objeto com titulo, subtitulo_curso e paginas
 */
const MODE_INSTRUCTIONS: Record<ModoContent, string> = {
  completo:
    'Material COMPLETO E AUTOSSUFICIENTE: desenvolva cada tópico com profundidade. Cada página deve ter bloco_principal com pelo menos 260 palavras (parágrafos bem desenvolvidos). Exemplos citados pelo professor: SEMPRE em bullets (destaques: um item por exemplo ou linhas • no texto). Explicação conceitual em texto corrido. Não deixe páginas com pouco texto ou explicações superficiais.',
  resumido:
    'Material RESUMIDO, porém robusto: bloco_principal com no mínimo 160 palavras por página, predominando texto corrido nas explicações. Para exemplos, perguntas-modelo e casos citados: use bullets (destaques ou •), um por exemplo. Nada de páginas com só título e uma frase.',
};

/** Limite de caracteres da transcrição por modo (menor = resposta mais rápida) */
const TRANSCRIPTION_LIMIT: Record<ModoContent, number> = {
  resumido: 55000,
  completo: 75000,
};

function contentResultChars(result: ContentAgentResult): number {
  let total = 0;
  total += result.titulo?.length ?? 0;
  total += result.subtitulo_curso?.length ?? 0;
  for (const pagina of result.paginas || []) {
    total += pagina.titulo?.length ?? 0;
    total += pagina.subtitulo?.length ?? 0;
    total += pagina.titulo_bloco?.length ?? 0;
    total += pagina.bloco_principal?.length ?? 0;
    total += pagina.citacao?.length ?? 0;
    total += pagina.dado_numerico?.length ?? 0;
    for (const d of pagina.destaques || []) total += d.length;
    for (const block of pagina.content_blocks || []) total += block.content?.length ?? 0;
  }
  return total;
}

export async function generateContent(
  transcricao: string,
  modo: ModoContent,
  nomeCurso: string
): Promise<ContentAgentResult> {
  const systemPrompt = `${SYSTEM_PROMPT_BASE} ${modo}.`;
  const modeInstruction = MODE_INSTRUCTIONS[modo];
  const limit = TRANSCRIPTION_LIMIT[modo];
  const transcricaoEnviada = transcricao.slice(0, limit);

  const isResumoPalestra = nomeCurso.toLowerCase().includes('resumo de palestra') || nomeCurso.toLowerCase().includes('master fluxo');
  const capaInstruction = isResumoPalestra
    ? `CAPA (Resumo de Palestra): titulo = "Resumo" + nome do palestrante (ex: "Resumo — Rodrigo Tadewald"); subtitulo = tema da palestra (ex: "VSL e Metrificação de Funil"); se houver frase de impacto na transcrição, inclua como terceira linha no subtitulo ou em campo separado.`
    : '';

  const minCharsTarget = modo === 'resumido'
    ? Math.floor(transcricaoEnviada.length * 0.6)
    : Math.min(Math.floor(transcricaoEnviada.length * 0.75), 42000);

  const userContentBase = `Transcrição da aula (use EXCLUSIVAMENTE este conteúdo):

${transcricaoEnviada}

---
Modo: ${modo}. Curso: ${nomeCurso}.
${modeInstruction}
${capaInstruction}
Retorne APENAS o JSON puro, sem cercas de código (sem \`\`\`json ou \`\`\`). Nenhuma página vazia.
Mínimo de caracteres de conteúdo textual no JSON final: ${minCharsTarget}.`;

  const maxTokens = modo === 'resumido' ? 10000 : 12000;
  let lastSyntaxErr: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    const userContent =
      attempt === 0
        ? userContentBase
        : `${userContentBase}

ATENÇÃO: a tentativa anterior ficou curta para estudo autossuficiente.
- Expanda explicações, contexto e exemplos já citados no VTT.
- Garanta que TODOS os exemplos citados pelo professor foram incluídos (em "example" e/ou bullets quando necessário), sem inventar nada.
- Mantenha fidelidade absoluta ao VTT (sem inventar nada).
- Garanta no mínimo ${minCharsTarget} caracteres de conteúdo textual total no JSON.`;
    try {
      const raw = await openRouterChat({
        system: systemPrompt,
        user: userContent,
        max_tokens: maxTokens,
      });
      if (!raw) {
        throw new Error('Resposta vazia do modelo.');
      }

      const parsed = parseJsonFromAI<ContentAgentResult>(raw);
      const chars = contentResultChars(parsed);
      if (chars >= minCharsTarget || attempt === 2) {
        return parsed;
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        lastSyntaxErr = err;
        if (attempt === 2) {
          throw new Error(
            'Resposta do modelo não pôde ser interpretada como JSON. Tente gerar o material novamente.'
          );
        }
        continue;
      }
      if (attempt === 2) throw err;
    }
  }
  if (lastSyntaxErr) {
    throw new Error(
      'Resposta do modelo não pôde ser interpretada como JSON. Tente gerar o material novamente.'
    );
  }
  throw new Error('Não foi possível gerar conteúdo com densidade adequada.');
}

/** Prompt para condensar texto já organizado em resumo */
const PROMPT_RESUMO_ORGANIZADO = `Você é um especialista em redação didática. O texto abaixo JÁ ESTÁ ORGANIZADO (com títulos, seções, listas).
Sua tarefa: CONDENSAR o conteúdo em um resumo. Mantenha a estrutura (títulos, seções) mas resuma cada bloco para os pontos essenciais.
Use EXCLUSIVAMENTE o conteúdo fornecido. Não adicione informações externas.
Retorne APENAS um JSON válido. Sem texto antes ou depois.
Estrutura JSON: { "titulo": "...", "subtitulo_curso": "nome do curso", "paginas": [ { "tipo": "capa", "titulo": "...", "subtitulo": "..." }, { "tipo": "conteudo", "titulo_bloco": "...", "bloco_principal": "texto resumido...", "destaques": ["ponto 1", "ponto 2"] } ] }
Cada página de conteúdo deve ter bloco_principal com pelo menos 80 palavras (resumo objetivo) e destaques quando fizer sentido.`;

/**
 * Condensa texto já organizado em resumo (usa IA para resumir mantendo estrutura).
 */
export async function generateResumoFromOrganizedText(
  texto: string,
  nomeCurso: string
): Promise<ContentAgentResult> {
  const limit = 55000;
  const textoEnviado = texto.slice(0, limit);

  const userContent = `Texto já organizado (condense em resumo mantendo a estrutura):

${textoEnviado}

---
Curso: ${nomeCurso}.
Retorne APENAS o JSON puro, sem cercas de código (sem \`\`\`json ou \`\`\`). Nenhuma página vazia.`;

  const raw = await openRouterChat({
    system: PROMPT_RESUMO_ORGANIZADO,
    user: userContent,
    max_tokens: 4096,
  });
  if (!raw) throw new Error('Resposta vazia do modelo.');

  return parseJsonFromAI<ContentAgentResult>(raw);
}
