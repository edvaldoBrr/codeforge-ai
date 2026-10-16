import React, { useState, useEffect } from 'react';
import { X, HelpCircle, RefreshCw, Sparkles, CheckCircle2, Box } from 'lucide-react';
import { CodeExplanationResult } from '../types/codeforge';

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  context: string;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({
  isOpen,
  onClose,
  code,
  context,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<CodeExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && code) {
      fetchExplanation();
    } else {
      setExplanation(null);
      setError(null);
    }
  }, [isOpen, code]);

  const fetchExplanation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, context }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao explicar o código.');
      }

      const data: CodeExplanationResult = await res.json();
      setExplanation(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao gerar explicação.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#12141D] border border-[#292C3B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#292C3B] bg-[#191C28]">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#A995FF]" />
            <h3 className="text-sm font-bold text-[#F5F5FA]">Explicação Técnica de Luau</h3>
            <span className="text-[11px] text-[#9699AC] font-mono truncate max-w-xs">
              {context}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#0B0C12] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <RefreshCw className="w-8 h-8 text-[#8065F5] animate-spin" />
              <p className="text-xs text-[#9699AC]">
                Analisando arquitetura e chamadas de serviços do Roblox...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs">
              {error}
            </div>
          )}

          {explanation && !loading && (
            <div className="space-y-4">
              {/* Overview */}
              <div className="p-3.5 rounded-xl bg-[#0B0C12] border border-[#292C3B] space-y-1">
                <span className="text-xs font-semibold text-[#A995FF] uppercase tracking-wider block">
                  Visão Geral do Script
                </span>
                <p className="text-xs text-[#F5F5FA] leading-relaxed">
                  {explanation.overview}
                </p>
              </div>

              {/* Services Used */}
              {explanation.robloxServicesUsed.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-[#9699AC] mb-2 block">
                    Serviços do Roblox Utilizados:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {explanation.robloxServicesUsed.map((srv, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-lg bg-[#191C28] text-[#38BDF8] border border-[#292C3B]"
                      >
                        <Box className="w-3 h-3 text-[#38BDF8]" />
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#F5F5FA] block">
                  Detalhamento por Função / Bloco:
                </span>
                <div className="space-y-2">
                  {explanation.breakdown.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0B0C12] border border-[#292C3B]/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#F5F5FA]">{item.section}</span>
                        {item.lines && (
                          <span className="font-mono text-[10px] text-[#6C7086]">
                            {item.lines}
                          </span>
                        )}
                      </div>
                      <p className="text-[#9699AC] leading-relaxed text-[11px]">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Practices */}
              {explanation.bestPractices.length > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-xs">
                  <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Boas Práticas Observadas
                  </span>
                  <ul className="space-y-1 text-emerald-100/90 text-[11px]">
                    {explanation.bestPractices.map((bp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">•</span>
                        <span>{bp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#292C3B] bg-[#191C28] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#0B0C12] hover:bg-[#8065F5] text-xs font-medium text-[#F5F5FA] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
