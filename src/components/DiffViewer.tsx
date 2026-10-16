import React, { useState } from 'react';
import { Columns, AlignJustify } from 'lucide-react';

interface DiffViewerProps {
  originalCode: string;
  fixedCode: string;
  originalLabel?: string;
  fixedLabel?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalCode,
  fixedCode,
  originalLabel = 'Código Original (com erros)',
  fixedLabel = 'Código Corrigido',
}) => {
  const [mode, setMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const origLines = originalCode.split('\n');
  const fixLines = fixedCode.split('\n');

  // Simple line diff calculation for display
  const maxLines = Math.max(origLines.length, fixLines.length);

  return (
    <div className="rounded-xl border border-[#292C3B] bg-[#12141D] overflow-hidden my-4 shadow-xl">
      {/* Diff Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#191C28] border-b border-[#292C3B]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
            Comparação de Alterações
          </span>
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Original: {origLines.length} linhas
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Corrigido: {fixLines.length} linhas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#0B0C12] p-1 rounded-lg border border-[#292C3B]">
          <button
            onClick={() => setMode('side-by-side')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              mode === 'side-by-side'
                ? 'bg-[#8065F5] text-white font-medium'
                : 'text-[#9699AC] hover:text-[#F5F5FA]'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lado a Lado</span>
          </button>
          <button
            onClick={() => setMode('unified')}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
              mode === 'unified'
                ? 'bg-[#8065F5] text-white font-medium'
                : 'text-[#9699AC] hover:text-[#F5F5FA]'
            }`}
          >
            <AlignJustify className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Unificado</span>
          </button>
        </div>
      </div>

      {/* Side by side view */}
      {mode === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#292C3B] font-mono text-xs bg-[#0B0C12] max-h-[500px] overflow-auto">
          {/* Left: Original */}
          <div className="p-3 overflow-x-auto">
            <div className="text-[11px] font-semibold text-rose-400 pb-2 mb-2 border-b border-[#292C3B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {originalLabel}
            </div>
            {origLines.map((line, idx) => {
              const isDifferent = fixLines[idx] !== line;
              return (
                <div
                  key={`orig-${idx}`}
                  className={`flex items-start py-0.5 px-1 rounded transition-colors ${
                    isDifferent
                      ? 'bg-rose-500/10 text-rose-200 border-l-2 border-rose-500'
                      : 'text-[#9699AC]'
                  }`}
                >
                  <span className="text-[#525666] select-none text-right w-8 pr-3 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre overflow-x-auto">{line || ' '}</span>
                </div>
              );
            })}
          </div>

          {/* Right: Fixed */}
          <div className="p-3 overflow-x-auto">
            <div className="text-[11px] font-semibold text-emerald-400 pb-2 mb-2 border-b border-[#292C3B] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {fixedLabel}
            </div>
            {fixLines.map((line, idx) => {
              const isDifferent = origLines[idx] !== line;
              return (
                <div
                  key={`fix-${idx}`}
                  className={`flex items-start py-0.5 px-1 rounded transition-colors ${
                    isDifferent
                      ? 'bg-emerald-500/10 text-emerald-200 border-l-2 border-emerald-500'
                      : 'text-[#F5F5FA]'
                  }`}
                >
                  <span className="text-[#525666] select-none text-right w-8 pr-3 flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre overflow-x-auto">{line || ' '}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Unified View */
        <div className="p-3 bg-[#0B0C12] max-h-[500px] overflow-auto font-mono text-xs">
          {Array.from({ length: maxLines }).map((_, idx) => {
            const o = origLines[idx];
            const f = fixLines[idx];
            const isDiff = o !== f;

            if (!isDiff && o !== undefined) {
              return (
                <div key={`uni-${idx}`} className="flex items-start py-0.5 px-2 text-[#9699AC]">
                  <span className="text-[#525666] select-none w-10 text-right pr-3">{idx + 1}</span>
                  <span className="whitespace-pre">{o}</span>
                </div>
              );
            }

            return (
              <React.Fragment key={`uni-diff-${idx}`}>
                {o !== undefined && (
                  <div className="flex items-start py-0.5 px-2 bg-rose-500/15 text-rose-300 border-l-2 border-rose-500">
                    <span className="text-rose-400 select-none w-10 text-right pr-3">- {idx + 1}</span>
                    <span className="whitespace-pre">{o}</span>
                  </div>
                )}
                {f !== undefined && (
                  <div className="flex items-start py-0.5 px-2 bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500">
                    <span className="text-emerald-400 select-none w-10 text-right pr-3">+ {idx + 1}</span>
                    <span className="whitespace-pre">{f}</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
