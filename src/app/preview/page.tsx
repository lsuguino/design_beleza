'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MaterialPreviewBlocks, type PreviewData } from '@/components/MaterialPreviewBlocks';
import { MermaidInit } from '@/components/MermaidInit';

const STORAGE_KEY = 'rtg-preview-data';

export default function PreviewPage() {
  const router = useRouter();
  const [data, setData] = useState<PreviewData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfLoading, setPdfLoading] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      setData(JSON.parse(raw) as PreviewData);
    } catch {
      router.replace('/');
    }
  }, [router]);

  const handleScroll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const scrollTop = canvas.scrollTop;
    const children = canvas.querySelectorAll('.preview-page-wrap');
    let index = 0;
    children.forEach((el, i) => {
      const top = (el as HTMLElement).offsetTop;
      const height = (el as HTMLElement).offsetHeight;
      if (scrollTop >= top - height / 2) index = i + 1;
    });
    setCurrentPage(index);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    handleScroll();
    canvas.addEventListener('scroll', handleScroll, { passive: true });
    return () => canvas.removeEventListener('scroll', handleScroll);
  }, [data, handleScroll]);

  const scrollToPage = useCallback((index: number) => {
    pageRefs.current[index]?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!data) return;
    setPdfLoading(true);
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}/preview` : '';
      const res = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, data }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err.error as string) || 'Falha ao gerar PDF');
      }
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'material.pdf';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : 'Erro ao gerar PDF. Rode o projeto localmente (npm run dev) para o PDF funcionar.');
    } finally {
      setPdfLoading(false);
    }
  }, [data]);

  const design = data?.design || data?.conteudo;
  const rawPaginas = design?.paginas ?? (design as { pages?: unknown[] })?.pages;
  const paginas = Array.isArray(rawPaginas) ? rawPaginas : [];

  // Manter refs alinhados ao número de páginas (após ter paginas definido)
  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, paginas.length);
  }, [paginas.length]);

  if (data === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2d2d3a]" role="status" aria-label="Carregando preview">
        <p className="text-white/70">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="preview-layout flex h-screen bg-[#2d2d3a] overflow-hidden">
      {/* Barra lateral fixa */}
      <aside className="preview-sidebar no-print flex-shrink-0 w-56 bg-[#1a1a24] border-r border-white/10 flex flex-col p-4">
        <button
          type="button"
          onClick={handleDownloadPDF}
          disabled={pdfLoading || paginas.length === 0}
          className="w-full py-2.5 rounded-xl font-semibold text-white mb-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#446EFF' }}
        >
          {pdfLoading ? 'Gerando PDF...' : 'Download PDF'}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="w-full py-2 rounded-lg font-medium text-white/80 border border-white/20 mb-4 hover:bg-white/5 transition-colors text-sm"
        >
          Imprimir (navegador)
        </button>
        <Link
          href="/"
          className="w-full py-2.5 rounded-xl font-medium text-white/90 border border-white/20 flex items-center justify-center gap-2 mb-6 hover:bg-white/5 transition-colors"
        >
          ← Gerar Novo Material
        </Link>
        <p className="text-white/60 text-sm mb-3">
          Página {Math.min(Math.max(1, currentPage), paginas.length || 1)} de {paginas.length || 1}
        </p>
        <div className="flex-1 overflow-auto space-y-2">
          {paginas.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToPage(i)}
              className={`w-full aspect-[595/842] max-h-24 rounded border-2 overflow-hidden transition-all ${
                currentPage === i + 1 ? 'border-[#446EFF] opacity-100' : 'border-white/20 opacity-70 hover:opacity-90'
              }`}
              style={{ backgroundColor: '#2d2d3a' }}
            >
              <span className="text-white/50 text-xs p-1 block text-center">{i + 1}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Área central: páginas em sequência (Web-to-Print Corporate Editorial) */}
      <div
        ref={canvasRef}
        className="preview-canvas flex-1 overflow-y-auto overflow-x-hidden p-8 flex flex-col items-center gap-8 min-h-0 print-content"
      >
        <MermaidInit className="flex flex-col items-center gap-8 w-full">
          {paginas.length === 0 ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-12 text-center text-white/70">
              Nenhuma página no material. Gere um novo material na página inicial.
            </div>
          ) : (
            <MaterialPreviewBlocks
              data={data}
              scale={1}
              renderPageWrapper={(pageNode, index) => (
                <div
                  ref={(el) => { pageRefs.current[index] = el; }}
                  className="preview-page-wrap flex flex-col items-center"
                >
                  {pageNode}
                </div>
              )}
            />
          )}
        </MermaidInit>
      </div>
    </div>
  );
}
