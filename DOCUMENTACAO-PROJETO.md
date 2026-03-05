# Documentação completa do projeto Design Beleza

Este documento descreve tudo o que foi feito no projeto até agora: objetivo, funcionalidades, ferramentas, APIs e o papel de cada uma.

---

## 1. Objetivo do projeto

O **Design Beleza** (também referido como “Gerador de Materiais RTG” ou “EduGen” na interface) é uma aplicação web que:

- Recebe um arquivo **VTT** (transcrição de aula em formato WebVTT).
- Gera automaticamente um **material didático em formato de apostila**: texto estruturado, sugestões de imagens, fluxogramas e gráficos.
- Aplica um **design editorial** (cores do curso, layouts por página) para visual consistente.
- Permite **visualizar o material** na tela (preview na própria página e em tela cheia) e **baixar em PDF**.

Todo o conteúdo do material é baseado **apenas** no texto do VTT; não há pesquisa externa. O fluxo é: **VTT → IA de conteúdo → IA de design → preview/PDF**.

---

## 2. Visão geral do fluxo

1. **Upload do VTT** na página inicial (arrastar ou selecionar arquivo).
2. **Escolha do curso** (ex.: “Venda Todo Santo Dia”) e do **modo**: Completo ou Resumido.
3. **Geração**: o backend lê o VTT, envia o texto para a **IA de conteúdo** (Anthropic Claude), que devolve um JSON com capa, páginas, texto e sugestões visuais (imagem, fluxograma, gráfico). Em seguida, a **IA de design** (também Claude) recebe esse JSON e o tema do curso e devolve o mesmo conteúdo com campos de layout (cores, tipo de página, etc.). Se a IA de design falhar, um **design padrão** é aplicado com as cores do curso.
4. **Resposta ao front**: o backend devolve `conteudo`, `design` (conteúdo + layout) e `tema`. O front exibe o **preview** ao lado do formulário e permite abrir a **página de preview completo** (/preview).
5. **Preview e PDF**: o usuário pode imprimir ou usar a rota de **PDF** (Puppeteer) para gerar o PDF do material (no servidor; em ambiente serverless como Vercel isso pode ter limitações).

---

## 3. Ferramentas e APIs utilizadas

### 3.1. Anthropic API (Claude) – IA de conteúdo e IA de design

- **Pacote:** `@anthropic-ai/sdk`
- **Uso:**
  - **Content Agent** (`src/lib/content-agent.ts`): transforma o texto do VTT em material estruturado em JSON. Usa o modelo **claude-sonnet-4-20250514** com um system prompt que define:
    - Uso exclusivo do conteúdo do VTT (sem inventar dados).
    - Estrutura do JSON: `titulo`, `subtitulo_curso`, `paginas` (capa + páginas de conteúdo).
    - Em cada página: `tipo`, `titulo_bloco`, `bloco_principal`, `content_blocks` (texto, imagem, mermaid, chart), `destaques`, `citacao`, `dado_numerico`, sugestões visuais.
    - Regras de preenchimento (páginas nunca vazias, mínimo de palavras).
    - **Conferência obrigatória**: antes de retornar, a IA deve conferir se todo o assunto do VTT está coberto no material.
  - **Design Agent** (`src/lib/design-agent.ts`): recebe o JSON do conteúdo (resumido) e o tema do curso e adiciona a cada página campos de design: `layout_tipo`, `cor_fundo_principal`, `cor_fundo_destaque`, `cor_texto_principal`, `cor_texto_destaque`, `icone_sugerido`, `proporcao_colunas`, `usar_barra_lateral`, `usar_faixa_decorativa`, mantendo as sugestões visuais.
- **Variável de ambiente:** `ANTHROPIC_API_KEY` (obrigatória para geração de material).

---

### 3.2. OpenAI API (DALL-E 3) – Geração de imagens

- **Pacote:** `openai`
- **Uso:**
  - **Em tempo de geração** (opcional): `src/lib/openai-image.ts` expõe `generateImageDalle3` e `generateImageDalle3Base64` para criar imagens a partir dos prompts sugeridos pelo content agent (estilo “Corporate Photography” ou “Abstract 3D Renders”). Podem ser usadas para preencher placeholders no material.
  - **Script offline**: `scripts/generate-images-for-book.js` lê um HTML (ex.: `index.html`), localiza `<img src="pending" data-prompt="...">`, envia cada prompt ao DALL-E 3 com um prefixo editorial, baixa a imagem (via **axios**) e salva em `images/img_aula_N.png`, atualizando o `src` no HTML.
- **Variável de ambiente:** `OPENAI_API_KEY` (opcional; se não houver, imagens não são geradas pela API).

---

### 3.3. Mermaid.js – Fluxogramas e diagramas

- **Pacote:** `mermaid`
- **Uso:**
  - O content agent pode incluir em `content_blocks` blocos do tipo **mermaid** com código Mermaid (flowchart, graph LR/TB, etc.).
  - No front, o componente **MermaidInit** (`src/components/MermaidInit.tsx`) importa o Mermaid dinamicamente, inicializa com tema `base` e variáveis de cor, localiza elementos com o código Mermaid e os renderiza em SVG no navegador.
  - Assim, fluxogramas e processos descritos no VTT viram diagramas visuais no material.

---

### 3.4. Chart.js – Gráficos de dados

- **Pacote:** `chart.js`
- **Uso:**
  - O content agent pode incluir em `content_blocks` blocos do tipo **chart** com um JSON (tipo: barra/pizza/linha, título, labels, valores).
  - O componente **ChartBlock** (`src/components/ChartBlock.tsx`) interpreta esse JSON e desenha o gráfico em um `<canvas>` com Chart.js, no estilo de relatório corporativo.
  - Dados vêm somente do que está na transcrição (não inventados).

---

### 3.5. Puppeteer – Geração de PDF no servidor

- **Pacote:** `puppeteer`
- **Uso:**
  - **`src/lib/pdf-generator.ts`**: função `generatePDF(previewUrl)` que abre a URL da página de preview com Puppeteer em modo headless, gera um PDF A4 com `printBackground: true` e margens zeradas e retorna o buffer.
  - **Rota** `src/app/api/pdf/route.ts`: recebe no body `{ "url": "..." }` (URL da página de preview), chama `generatePDF` e devolve o PDF como download (`Content-Disposition: attachment`).
  - Em ambientes serverless (ex.: Vercel), Puppeteer/Chromium costumam ter restrições; o restante do site funciona, mas o “Download PDF” pode falhar nesse contexto.

---

### 3.6. Axios – Requisições HTTP

- **Pacote:** `axios`
- **Uso:** No script `scripts/generate-images-for-book.js`, para baixar a imagem gerada pela URL retornada pelo DALL-E 3 e salvar em disco. No Next.js em si as chamadas às APIs (Anthropic, OpenAI) usam os SDKs oficiais.

---

### 3.7. Next.js – Framework da aplicação

- **Versão:** Next.js 14 (App Router).
- **Uso:**
  - **Rotas de página:** `/` (página inicial com upload, curso, modo e preview) e `/preview` (visualização do material em tela cheia, dados vindo do `localStorage`).
  - **Rotas de API:** `/api/generate` (orquestra VTT → content agent → design agent e devolve conteúdo + design), `/api/generate-material` (alternativa que gera só o material, usada em fluxos específicos), `/api/parse-vtt` (parse do VTT), `/api/pdf` (geração de PDF), `/api/themes` (lista de temas/cursos).
  - **Estilos:** Tailwind CSS, `globals.css`, `print-editorial.css` (estilos Web-to-Print, A4, grid, templates de página).
  - **Fontes:** Google Fonts (Lexend, Sora, etc.) configuradas no layout.

---

### 3.8. React, TypeScript e Tailwind CSS

- **React 18** e **TypeScript** para componentes e tipagem.
- **Tailwind CSS** para estilização (incluindo tema escuro/claro, cores por curso).
- **Framer Motion** (`framer-motion`): animações na página inicial (AnimatePresence, transições) e barra de progresso.

---

### 3.9. Parser VTT – Limpeza do texto da transcrição

- **Arquivo:** `src/lib/vtt-parser.ts` (lógica pura, sem API externa).
- **Função:** `parseVTT(vttContent: string): string`
  - Remove a linha inicial “WEBVTT” e cabeçalhos.
  - Remove linhas de timestamp no formato `00:00:00.000 --> 00:00:00.000`.
  - Remove linhas que são só números (sequência).
  - Remove linhas vazias duplicadas.
  - Junta o restante em texto corrido limpo para envio à IA.

---

### 3.10. Parser de JSON da IA – Robustez às respostas com markdown

- **Arquivo:** `src/lib/parse-json-from-ai.ts`
- **Funções:** `extractJsonString(raw)`, `parseJsonFromAI<T>(raw)`
- **Uso:** As IAs (Claude) às vezes devolvem JSON envolvido em markdown (```json ... ```). Este módulo:
  - Remove BOM e linhas que são só cercas de markdown.
  - Remove cercas de abertura e fechamento.
  - Extrai o primeiro objeto ou array balanceado `{ ... }` / `[ ... ]` no texto.
  - Corrige vírgulas finais antes de `}` ou `]`.
  - Se o parse falhar, tenta outras estratégias (remover linhas de cerca, extrair a partir do primeiro `{`, tentar parse a partir de cada `{`).
- **Onde é usado:** `content-agent.ts`, `design-agent.ts` e em rotas que parseiam a resposta da IA, evitando erro “Resposta do modelo não é um JSON válido”.

---

### 3.11. Temas e cursos

- **Arquivo:** `src/lib/courseThemes.ts`
- **Conteúdo:** Definição dos cursos (ids: geral, marketing, beleza, saude, design, tecnologia) com nome, cores (`primary`, `primaryLight`, `primaryDark`, `accent`), `backgroundColor` e `layoutClass`. O curso “geral” é “Venda Todo Santo Dia” com cores específicas. Inclui também `CAPA_PADRAO_VTSD` e modos de geração (full/summary).
- **API:** `/api/themes` lê esses temas (e pode carregar de arquivos em `themes/*.json`) e devolve a lista para o dropdown da página inicial.

---

### 3.12. Web-to-Print e templates de página editorial

- **Arquivo:** `src/app/print-editorial.css`
- **Conteúdo:**
  - Variáveis CSS para cores de impressão e fonte.
  - Páginas em tamanho A4 (210mm × 297mm), `page-break-after`, tipografia com orphans/widows e hyphens.
  - Classes de template: `.page-summary` (barra lateral colorida + lista numerada), `.page-intro` (imagem no topo + bloco lateral), `.page-double-column` (duas colunas com linha divisória), `.page-cover` (capa).
  - Grid de 12 colunas e classes utilitárias (col-sidebar, col-main, col-full, etc.).
  - Rodapé com numeração de página (counter(page)) e estilos para páginas pares/ímpares.
- **Componentes:** `PageCoverEditorial`, `PageSummary`, `PageIntro`, `PageDoubleColumn` em `src/components/pages/` renderizam o material usando essas classes e as cores do tema.

---

### 3.13. Mapeamento tipo de conteúdo → ferramenta

- **Arquivo:** `src/lib/visual-tools.ts`
- **Conteúdo:** Constante `VISUAL_TOOLS_MAP` que documenta:
  - **Fotos/fundos** → tipo `image` → OpenAI DALL-E 3.
  - **Fluxogramas/processos** → tipo `mermaid` → Mermaid.js.
  - **Gráficos de dados** → tipo `chart` → Chart.js.
- Usado como referência para o content agent e para a integração no front (ContentBlocksRenderer, ChartBlock, MermaidInit).

---

### 3.14. Supabase

- **Pacote:** `@supabase/supabase-js` está no `package.json`. No código atual das rotas e da geração de material não há uso direto do Supabase; pode estar previsto para persistência de materiais ou usuários em uma etapa futura.

---

## 4. Estrutura principal de pastas/arquivos

- **`src/app/`**: layout, página inicial (`page.tsx`), preview (`preview/page.tsx`), estilos globais e print-editorial, rotas de API (generate, generate-material, parse-vtt, pdf, themes).
- **`src/lib/`**: content-agent, design-agent, vtt-parser, parse-json-from-ai, openai-image, pdf-generator, courseThemes, visual-tools, etc.
- **`src/components/`**: MaterialPreviewBlocks (renderização do material), ContentBlocksRenderer (texto, imagem, mermaid, chart), ChartBlock, MermaidInit, páginas editoriais (PageCoverEditorial, PageSummary, PageIntro, PageDoubleColumn), além de componentes antigos (PageCapa, PageConteudo, etc.).
- **`themes/`**: JSON de temas por curso (ex.: `geral.json`).
- **`public/`**: imagens (ex.: capas padrão em `capas/`).
- **`scripts/`**: `generate-pdf.js` (Puppeteer para HTML estático), `generate-images-for-book.js` (DALL-E 3 para placeholders em HTML).

---

## 5. Variáveis de ambiente

- **`ANTHROPIC_API_KEY`**: obrigatória para o content agent e o design agent (Anthropic Claude).
- **`OPENAI_API_KEY`**: opcional; usada para DALL-E 3 (imagens no material e no script `generate-images-for-book.js`).

O arquivo `.env.local` não é versionado (está no `.gitignore`). O `.env.example` documenta as chaves.

---

## 6. Resumo por ferramenta/API

| Ferramenta/API        | Para que foi usada                                                                 |
|-----------------------|-------------------------------------------------------------------------------------|
| **Anthropic (Claude)**| IA de conteúdo (VTT → JSON do material) e IA de design (JSON + tema → layout).     |
| **OpenAI (DALL-E 3)** | Geração de imagens a partir dos prompts do material; script para preencher HTML.  |
| **Mermaid.js**        | Renderização de fluxogramas/diagramas no navegador a partir de código no JSON.     |
| **Chart.js**          | Renderização de gráficos (barra, pizza, linha) no navegador a partir de JSON.     |
| **Puppeteer**         | Geração de PDF no servidor a partir da URL da página de preview.                   |
| **Axios**             | Download de imagens (URL → arquivo) no script generate-images-for-book.           |
| **Next.js**           | Framework: rotas, API, páginas, integração com React e estilos.                    |
| **Tailwind / CSS**    | Estilos, temas, responsividade e Web-to-Print (print-editorial.css).                |
| **Framer Motion**     | Animações e transições na interface.                                               |
| **Parser VTT**        | Limpar o conteúdo do arquivo VTT para enviar só texto à IA.                        |
| **parse-json-from-ai**| Garantir que as respostas em JSON da IA (mesmo com markdown) sejam parseadas.      |
| **courseThemes**      | Cores e identidade visual por curso; usado no front e no design agent.             |

---

## 7. Deploy

- O projeto está preparado para deploy na **Vercel** (Next.js): `vercel.json`, `DEPLOY.md` com instruções, e correções de build (tipos e ordem de hooks no preview) para o build passar.
- No deploy é necessário configurar no painel da Vercel as variáveis `ANTHROPIC_API_KEY` e, se quiser imagens, `OPENAI_API_KEY`.

---

Este texto descreve o estado atual do projeto: todas as ferramentas e APIs usadas e a função de cada uma no fluxo de geração e exibição do material didático a partir do VTT.
