import React, { useState } from 'react';
import {
  Bug,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Copy,
  Check,
  Download,
  RefreshCw,
  Code2,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { TECH_CATALOG, getTechById } from '../../data/techCatalog';
import { MultiDevAnalysisResult, MultiDevIssue } from '../../types/codeforge';
import { downloadCodeFile } from '../../utils/storage';

interface MultiDevAnalyzerViewProps {
  activeTechId: string;
  onSelectActiveTech: (techId: string) => void;
}

export const MultiDevAnalyzerView: React.FC<MultiDevAnalyzerViewProps> = ({
  activeTechId,
  onSelectActiveTech,
}) => {
  const currentTech = getTechById(activeTechId) || TECH_CATALOG[0];

  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [context, setContext] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiDevAnalysisResult | null>(null);

  const [copiedFixed, setCopiedFixed] = useState(false);
  const [activeTab, setActiveTab] = useState<'fixed' | 'original'>('fixed');

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/multidev/analyze-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techId: currentTech.id,
          techName: currentTech.name,
          code,
          errorMessage,
          context,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha na análise do código.');
      }

      const data: MultiDevAnalysisResult = await response.json();
      setResult(data);
      setActiveTab('fixed');
    } catch (err: any) {
      setError(err.message || 'Erro durante a análise.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFixed = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fixedCode);
    setCopiedFixed(true);
    setTimeout(() => setCopiedFixed(false), 2000);
  };

  const handleDownloadFixed = () => {
    if (!result) return;
    const filename = `fixed_code${currentTech.defaultExtension}`;
    downloadCodeFile(filename, result.fixedCode);
  };

  const getIssueBadge = (type: MultiDevIssue['type']) => {
    switch (type) {
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[11px] font-semibold">
            <AlertCircle className="w-3 h-3" />
            Erro Crítico
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-semibold">
            <AlertTriangle className="w-3 h-3" />
            Alerta
          </span>
        );
      case 'security':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[11px] font-semibold">
            <ShieldAlert className="w-3 h-3" />
            Segurança
          </span>
        );
      case 'perf':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[11px] font-semibold">
            <Zap className="w-3 h-3" />
            Performance
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <Bug className="w-4 h-4" />
            <span>Depurador & Analisador de Erros</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Análise Estática & Correção Automática
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Identifique bugs de compilação, tipos inválidos, memory leaks e receba código corrigido para {currentTech.name}.
          </p>
        </div>

        {/* Tech Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 whitespace-nowrap">Linguagem:</label>
          <div className="relative">
            <select
              value={currentTech.id}
              onChange={(e) => onSelectActiveTech(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-medium text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              {TECH_CATALOG.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.defaultExtension})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Code input and error log */}
        <div className="lg:col-span-5 space-y-5 bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Código com Problema ({currentTech.primaryLanguage}) <span className="text-rose-400">*</span>
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={9}
                required
                placeholder={`Cole o código em ${currentTech.primaryLanguage} aqui para análise...`}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Log de Erro ou Stack Trace (opcional)
              </label>
              <textarea
                value={errorMessage}
                onChange={(e) => setErrorMessage(e.target.value)}
                rows={3}
                placeholder="Ex: TypeError, panic, NullPointerException, memory leak warning..."
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-rose-300 placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Contexto Adicional (opcional)
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: rodando em container Docker, versão 3.12, ambiente de produção"
                className="w-full px-4 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analisando sintaxe e regras...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  <span>Analisar & Corrigir Código</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Analysis, Issues and Fixed Code */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro na análise:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 space-y-3">
              <Terminal className="w-12 h-12 mx-auto text-zinc-700" />
              <h3 className="text-base font-semibold text-zinc-300">Aguardando código para análise</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Cole trechos de código em {currentTech.name} que apresentem falhas de compilação, bugs ou comportamentos inesperados.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">
                Rastreando falhas no código...
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Verificando ciclo de vida, imports, referências nulas e regras de {currentTech.name}.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Diagnosis Summary Card */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Diagnóstico Concluído</h3>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                  {result.summary}
                </p>

                {/* Issues List */}
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                    Problemas Identificados ({result.issues.length})
                  </span>
                  <div className="space-y-2">
                    {result.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-semibold text-white">
                            {getIssueBadge(issue.type)}
                            <span>{issue.title}</span>
                          </div>
                          {issue.line && (
                            <span className="text-[11px] font-mono text-zinc-500">
                              Linha {issue.line}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400 leading-relaxed">{issue.explanation}</p>
                        <div className="pt-1.5 text-emerald-300 text-[11px] font-mono">
                          Solução: {issue.solution}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Code Viewer (Tabs: Fixed / Original) */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('fixed')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'fixed'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Código Corrigido
                    </button>
                    <button
                      onClick={() => setActiveTab('original')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeTab === 'original'
                          ? 'bg-zinc-800 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Código Original
                    </button>
                  </div>

                  {activeTab === 'fixed' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyFixed}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        {copiedFixed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedFixed ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                      <button
                        onClick={handleDownloadFixed}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-4 overflow-x-auto max-h-[450px] overflow-y-auto font-mono text-xs leading-relaxed text-zinc-200">
                  <pre>{activeTab === 'fixed' ? result.fixedCode : result.originalCode}</pre>
                </div>
              </div>

              {/* Changes & Idiomatic Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Alterações Efetuadas
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-400">
                    {result.changesMade.map((ch, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400">•</span>
                        <span>{ch}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Dicas Idiomáticas ({currentTech.name})
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-400">
                    {result.idiomaticTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
