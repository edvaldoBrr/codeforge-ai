import React, { useState } from 'react';
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Zap,
  Gauge,
  RefreshCw,
  Code2,
  ChevronDown,
  Terminal,
  XCircle,
} from 'lucide-react';
import { TECH_CATALOG, getTechById } from '../../data/techCatalog';
import { MultiDevAuditResult } from '../../types/codeforge';

interface MultiDevQualityViewProps {
  activeTechId: string;
  onSelectActiveTech: (techId: string) => void;
}

export const MultiDevQualityView: React.FC<MultiDevQualityViewProps> = ({
  activeTechId,
  onSelectActiveTech,
}) => {
  const currentTech = getTechById(activeTechId) || TECH_CATALOG[0];

  const [code, setCode] = useState('');
  const [framework, setFramework] = useState(currentTech.frameworkOrEngine);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiDevAuditResult | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/multidev/audit-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techId: currentTech.id,
          techName: currentTech.name,
          code,
          framework,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha na auditoria de qualidade.');
      }

      const data: MultiDevAuditResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erro durante a auditoria.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-sky-400 border-sky-500/40 bg-sky-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoria de Qualidade & Segurança</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Auditor de Código & Vulnerabilidades
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Análise aprofundada de segurança, vazamento de memória, complexidade ciclomática e boas práticas para {currentTech.name}.
          </p>
        </div>

        {/* Tech Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 whitespace-nowrap">Ambiente:</label>
          <div className="relative">
            <select
              value={currentTech.id}
              onChange={(e) => {
                onSelectActiveTech(e.target.value);
                const t = getTechById(e.target.value);
                if (t) setFramework(t.frameworkOrEngine);
              }}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-medium text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              {TECH_CATALOG.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Code input */}
        <div className="lg:col-span-5 space-y-5 bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <form onSubmit={handleAudit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Código para Auditoria ({currentTech.primaryLanguage}) <span className="text-emerald-400">*</span>
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                required
                placeholder={`Cole seu código em ${currentTech.primaryLanguage} aqui para inspecionar qualidade e segurança...`}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Framework / Biblioteca Alvo
              </label>
              <input
                type="text"
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditando vulnerabilidades...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Auditar Código</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Score & Vulnerabilities */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro na auditoria:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 space-y-3">
              <Gauge className="w-12 h-12 mx-auto text-zinc-700" />
              <h3 className="text-base font-semibold text-zinc-300">Aguardando código para auditoria</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Forneça o código em {currentTech.name} para receber nota de 0 a 100, lista de brechas de segurança e checklist de boas práticas.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">
                Escaneando vulnerabilidades e convenções...
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Auditando injeções, vazamento de credenciais e anti-padrões da linguagem.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Score Dashboard Card */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                  <div>
                    <h3 className="text-base font-bold text-white">Pontuação Geral de Qualidade</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{result.summary}</p>
                  </div>

                  {/* Circular Score Badge */}
                  <div
                    className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-extrabold shadow-xl shrink-0 ${getScoreColor(
                      result.score
                    )}`}
                  >
                    <span className="text-3xl leading-none">{result.score}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-0.5">/ 100</span>
                  </div>
                </div>

                {/* Sub-metrics */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Segurança</span>
                    <span className="text-xl font-bold text-emerald-400 mt-0.5 block">
                      {result.securityScore}%
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Manutenibilidade</span>
                    <span className="text-xl font-bold text-sky-400 mt-0.5 block">
                      {result.maintainabilityScore}%
                    </span>
                  </div>
                  <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Performance</span>
                    <span className="text-xl font-bold text-amber-400 mt-0.5 block">
                      {result.performanceScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Vulnerabilities Section */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Vulnerabilidades Detectadas ({result.vulnerabilities.length})
                </h4>

                {result.vulnerabilities.length === 0 ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Nenhuma vulnerabilidade crítica ou grave detectada no código.</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {result.vulnerabilities.map((vuln, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 font-semibold text-white">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                vuln.severity === 'HIGH'
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  : vuln.severity === 'MEDIUM'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                              }`}
                            >
                              {vuln.severity}
                            </span>
                            <span>{vuln.title}</span>
                          </div>
                          {vuln.line && (
                            <span className="text-[11px] font-mono text-zinc-500">
                              Linha {vuln.line}
                            </span>
                          )}
                        </div>
                        <p className="text-zinc-400">{vuln.description}</p>
                        <div className="pt-1 text-emerald-300 text-[11px] font-mono">
                          Remediação: {vuln.remediation}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Smells & Conventions Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Code smells */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Code Smells & Otimizações
                  </h4>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    {result.codeSmells.map((smell, idx) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
                        <span className="font-semibold text-white block">{smell.title}</span>
                        <span className="text-zinc-400 text-[11px] mt-0.5 block">{smell.advice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Conventions checklist */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                    Convenções da Linguagem
                  </h4>
                  <div className="space-y-2 text-xs">
                    {result.adherenceToConventions.map((conv, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-start gap-2"
                      >
                        {conv.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className={`font-semibold ${conv.passed ? 'text-zinc-200' : 'text-rose-300'}`}>
                            {conv.convention}
                          </span>
                          <span className="text-zinc-500 text-[11px] block mt-0.5">{conv.tip}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
