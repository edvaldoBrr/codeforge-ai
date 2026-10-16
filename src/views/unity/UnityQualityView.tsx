import React, { useState } from 'react';
import {
  Gauge,
  Sparkles,
  RefreshCw,
  Code2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileCode,
  Copy,
  Check,
  Cpu,
} from 'lucide-react';
import { UnityQualityResult, UnityQualityIssue, UserPreferences } from '../../types/codeforge';
import { CodeViewer } from '../../components/CodeViewer';

interface UnityQualityViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SAMPLE_SCRIPTS = [
  {
    name: 'Alocações de GC e GetComponent em Update()',
    code: `using UnityEngine;

public class BadPerformancePlayer : MonoBehaviour
{
    void Update()
    {
        // 1. GetComponent repetido a cada frame (impacto brutal na CPU)
        Rigidbody rb = GetComponent<Rigidbody>();
        
        // 2. Concatenação de strings em Update gera lixo constante para o Garbage Collector
        string status = "Posição: " + transform.position.ToString() + " Time: " + Time.time;
        Debug.Log(status);

        // 3. GameObject.Find em Update
        GameObject enemy = GameObject.Find("EnemyTarget");
        if (enemy != null)
        {
            float dist = Vector3.Distance(transform.position, enemy.transform.position);
        }
    }
}
`,
  },
];

export const UnityQualityView: React.FC<UnityQualityViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [code, setCode] = useState(SAMPLE_SCRIPTS[0].code);
  const [unityVersion, setUnityVersion] = useState('Unity 2022.3 LTS+');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnityQualityResult | null>(null);
  const [showRefactored, setShowRefactored] = useState(false);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      showToast('error', 'Cole o script C# para avaliar a qualidade.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/unity/check-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, unityVersion }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na avaliação de qualidade');
      }

      const data: UnityQualityResult = await res.json();
      setResult(data);
      onLogActivity('unity', `Qualidade C#: ${data.score}/100`, `${data.issues.length} sugestões`);
      showToast('success', `Avaliação de qualidade concluída! Score: ${data.score}/100`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium">
              <Gauge className="w-3.5 h-3.5" />
              <span>Unity Code Quality & Linter</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Qualidade de Código, GC e Otimização para Unity
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Detecte alocações de memória no Garbage Collector, elimine chamadas custosas em Update(),
              melhore o encapsulamento e receba versão refatorada para Unity 2022.3 LTS e Unity 6.
            </p>
          </div>
        </div>
      </div>

      {/* Editor & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-3">
            <label className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" />
              <span>Script C# sob Inspeção</span>
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Cole seu script C# da Unity aqui..."
              rows={12}
              className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 text-[#F5F5FA] focus:outline-none focus:border-amber-500/50 leading-relaxed"
            />

            <div className="flex justify-end pt-2 border-t border-[#292C3B]">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-semibold shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inspecionando Qualidade...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Calcular Score de Qualidade</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Score & Metrics Panel */}
        <div className="space-y-4">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>Score & GC Metrics</span>
            </h3>

            {result ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#0B0C12] border border-[#292C3B]">
                  <div
                    className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center font-bold text-3xl shadow-inner ${getScoreColor(
                      result.score
                    )}`}
                  >
                    <span>{result.score}</span>
                    <span className="text-[10px] text-[#9699AC] font-normal font-sans">/ 100</span>
                  </div>
                  <span className="text-xs font-semibold mt-3 text-[#F5F5FA]">
                    {result.score >= 85
                      ? 'Padrão Profissional Unity'
                      : result.score >= 60
                      ? 'Requer Otimizações'
                      : 'Gargalos Críticos de CPU/GC'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B]">
                    <span className="text-[#9699AC]">Linhas de código:</span>
                    <span className="font-semibold text-[#F5F5FA]">
                      {result.metrics.lineCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B]">
                    <span className="text-[#9699AC]">Risco de Alocação de GC:</span>
                    <span
                      className={`font-semibold ${
                        result.metrics.gcAllocationRisks > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {result.metrics.gcAllocationRisks > 0
                        ? `${result.metrics.gcAllocationRisks} pontos de risco`
                        : 'Otimizado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B]">
                    <span className="text-[#9699AC]">Métodos declarados:</span>
                    <span className="font-semibold text-[#F5F5FA]">
                      {result.metrics.methodCount}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#9699AC] bg-[#191C28] p-3 rounded-xl border border-[#292C3B]">
                  {result.summary}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-2">
                <Cpu className="w-10 h-10 text-[#6C7086] mx-auto opacity-50" />
                <p className="text-xs text-[#9699AC]">
                  Execute a inspeção para checar picos de Garbage Collector e padrões C#.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issues & Refactored Code */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#F5F5FA]">
              Diagnóstico de Otimização ({result.issues.length} apontamentos)
            </h3>
            {result.refactoredCode && (
              <button
                onClick={() => setShowRefactored(!showRefactored)}
                className="px-3 py-1.5 rounded-lg bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold shadow"
              >
                {showRefactored ? 'Ver Lista de Problemas' : 'Ver Versão Refatorada'}
              </button>
            )}
          </div>

          {showRefactored && result.refactoredCode ? (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block">
                Versão C# Refatorada e Otimizada:
              </span>
              <CodeViewer
                code={result.refactoredCode}
                filename="RefactoredScript.cs"
                scriptType="MonoBehaviour"
                theme={preferences.editorTheme}
                fontSize={preferences.fontSize}
                onExplain={() => onExplainRequest(result.refactoredCode!, 'RefactoredScript.cs')}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {result.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="bg-[#12141D] border border-[#292C3B] rounded-xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {issue.severity}
                      </span>
                      <span className="font-bold text-[#F5F5FA]">{issue.title}</span>
                    </div>
                    {issue.line && (
                      <span className="text-[11px] font-mono text-[#9699AC]">
                        Linha ~{issue.line}
                      </span>
                    )}
                  </div>

                  <p className="text-[#9699AC] leading-relaxed">{issue.explanation}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#0B0C12] p-2.5 rounded-lg border border-[#292C3B]">
                      <span className="text-[10px] text-rose-400 font-semibold block uppercase">
                        Impacto na Performance:
                      </span>
                      <span className="text-[#9699AC] text-[11px]">{issue.impact}</span>
                    </div>
                    <div className="bg-[#0B0C12] p-2.5 rounded-lg border border-[#292C3B]">
                      <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                        Solução Recomendada:
                      </span>
                      <span className="text-[#F5F5FA]/90 text-[11px]">{issue.suggestedFix}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
