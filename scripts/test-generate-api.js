/**
 * Testa a API de geração com um VTT mínimo.
 * Rode com o servidor ativo: npm run dev
 * Depois: node scripts/test-generate-api.js
 */

const VTT_MINIMO = `WEBVTT

00:00:00.000 --> 00:00:02.000
Olá, esta é uma aula de teste.

00:00:02.500 --> 00:00:05.000
Hoje vamos falar sobre vendas e produtividade.

00:00:05.500 --> 00:00:08.000
O primeiro ponto é planejamento diário.`;

async function testar() {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const form = new FormData();
  form.append('curso_id', 'geral');
  form.append('modo', 'resumido');
  form.append('vtt', new Blob([VTT_MINIMO], { type: 'text/vtt' }), 'teste.vtt');

  console.log('Enviando requisição para', base + '/api/generate', '...');
  const inicio = Date.now();

  try {
    const res = await fetch(base + '/api/generate', {
      method: 'POST',
      body: form,
    });
    const tempo = ((Date.now() - inicio) / 1000).toFixed(1);
    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const paginas = data?.design?.paginas ?? data?.conteudo?.paginas ?? [];
      console.log('\n✓ Sucesso! API respondeu em', tempo, 's');
      console.log('  Páginas geradas:', paginas.length);
      if (paginas[0]) {
        console.log('  Primeira página tipo:', paginas[0].tipo);
      }
    } else {
      console.error('\n✗ Erro', res.status, data?.error || data?.message || JSON.stringify(data));
      process.exit(1);
    }
  } catch (err) {
    console.error('\n✗ Falha na requisição:', err.message);
    if (err.message && err.message.includes('fetch')) {
      console.log('  Dica: rode "npm run dev" antes e tente de novo.');
    }
    process.exit(1);
  }
}

testar();
