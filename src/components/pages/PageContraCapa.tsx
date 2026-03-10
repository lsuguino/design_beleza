'use client';

/** Contra capa no estilo Resumo de Palestra Master Fluxo — página de fechamento editorial */

export interface PageContraCapaProps {
  nomeCurso: string;
  primary?: string;
  accent?: string;
}

export function PageContraCapa({
  nomeCurso,
  primary = 'var(--print-primary)',
  accent = 'var(--print-accent)',
}: PageContraCapaProps) {
  return (
    <section
      className="page page-contracapa"
      style={
        {
          '--print-primary': primary,
          '--print-accent': accent,
        } as React.CSSProperties
      }
    >
      <div className="page-contracapa-content">
        <div className="page-contracapa-line" />
        <p className="page-contracapa-curso">{nomeCurso}</p>
        <p className="page-contracapa-master">Master Fluxo</p>
      </div>
      <footer className="page-footer">
        <span>{nomeCurso}</span>
        <span className="page-number">Página </span>
      </footer>
    </section>
  );
}
