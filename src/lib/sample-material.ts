import type { PreviewData } from '@/components/MaterialPreviewBlocks';

/**
 * Material de exemplo para testar o preview e o PDF sem usar a API Anthropic.
 * Use "Usar material de exemplo" na página inicial para carregar e testar o Download PDF.
 */
export const SAMPLE_PREVIEW_DATA: PreviewData = {
  curso_id: 'geral',
  tema: {
    name: 'Venda Todo Santo Dia',
    primary: '#2A2A2A',
    primaryLight: '#4a4a4a',
    primaryDark: '#1a1a1a',
    accent: '#55B8A1',
  },
  conteudo: {
    titulo: 'Aula de Exemplo',
    subtitulo_curso: 'Venda Todo Santo Dia',
    paginas: [
      {
        tipo: 'capa',
        titulo: 'Introdução às Vendas',
        subtitulo: 'Venda Todo Santo Dia',
      },
      {
        tipo: 'conteudo',
        titulo_bloco: 'Planejamento diário',
        bloco_principal: 'O planejamento é a base para um dia produtivo. Defina suas prioridades logo pela manhã e reserve blocos de tempo para as atividades mais importantes.\n\nRevisar metas e listar as três tarefas essenciais do dia ajuda a manter o foco e a entregar resultados.',
        destaques: [
          'Definir prioridades pela manhã',
          'Reservar blocos de tempo',
          'Revisar metas diariamente',
        ],
      },
      {
        tipo: 'conteudo',
        titulo_bloco: 'Próximos passos',
        bloco_principal: 'Com o material de exemplo carregado, você pode testar o botão "Download PDF" sem precisar de créditos na Anthropic. A geração do PDF não usa a API — apenas a "Geração Inteligente" do material a partir do VTT usa créditos.',
        destaques: [
          'PDF não usa Anthropic',
          'Geração do material usa créditos',
          'Use este exemplo para testar o PDF',
        ],
      },
    ],
  },
  design: {
    titulo: 'Introdução às Vendas',
    subtitulo_curso: 'Venda Todo Santo Dia',
    paginas: [
      {
        tipo: 'capa',
        titulo: 'Introdução às Vendas',
        subtitulo: 'Venda Todo Santo Dia',
        layout_tipo: 'header_destaque',
        cor_fundo_principal: '#F1F1F1',
        cor_fundo_destaque: '#55B8A1',
        cor_texto_principal: '#1a1a1a',
        cor_texto_destaque: '#FFFFFF',
      },
      {
        tipo: 'conteudo',
        titulo_bloco: 'Planejamento diário',
        bloco_principal: 'O planejamento é a base para um dia produtivo. Defina suas prioridades logo pela manhã e reserve blocos de tempo para as atividades mais importantes.\n\nRevisar metas e listar as três tarefas essenciais do dia ajuda a manter o foco e a entregar resultados.',
        destaques: [
          'Definir prioridades pela manhã',
          'Reservar blocos de tempo',
          'Revisar metas diariamente',
        ],
        layout_tipo: 'dois_colunas',
        cor_fundo_principal: '#F1F1F1',
        cor_fundo_destaque: '#55B8A1',
        cor_texto_principal: '#1a1a1a',
        cor_texto_destaque: '#FFFFFF',
      },
      {
        tipo: 'conteudo',
        titulo_bloco: 'Próximos passos',
        bloco_principal: 'Com o material de exemplo carregado, você pode testar o botão "Download PDF" sem precisar de créditos na Anthropic. A geração do PDF não usa a API — apenas a "Geração Inteligente" do material a partir do VTT usa créditos.',
        destaques: [
          'PDF não usa Anthropic',
          'Geração do material usa créditos',
          'Use este exemplo para testar o PDF',
        ],
        layout_tipo: 'dois_colunas',
        cor_fundo_principal: '#F1F1F1',
        cor_fundo_destaque: '#55B8A1',
        cor_texto_principal: '#1a1a1a',
        cor_texto_destaque: '#FFFFFF',
      },
    ],
  },
};
