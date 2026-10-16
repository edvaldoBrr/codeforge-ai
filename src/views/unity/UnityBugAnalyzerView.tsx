import React, { useState } from 'react';
import {
  Bug,
  Sparkles,
  RefreshCw,
  Copy,
  Download,
  RotateCcw,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  HelpCircle,
  FileCode,
  Terminal,
} from 'lucide-react';
import { UnityBugResult, UnityBugIssue, UserPreferences } from '../../types/codeforge';
import { DiffViewer } from '../../components/DiffViewer';
import { CodeViewer } from '../../components/CodeViewer';

interface UnityBugAnalyzerViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SAMPLE_UNITY_BUGS = [
  {
    name: 'NullReferenceException em GetComponent() no Update',
    error: `NullReferenceException: Object reference not set to an instance of an object
PlayerMovement.Update () (at Assets/Scripts/PlayerMovement.cs:18)`,
    desc: 'O jogo trava ao tentar acessar o Rigidbody no Update() sem verificar ou fazer cache prévio.',
    code: `using UnityEngine;

public class PlayerMovement : MonoBehaviour
{
    public float speed = 5f;

    void Update()
    {
        float h = Input.GetAxis("Horizontal");
        float v = Input.GetAxis("Vertical");

        // FALHA: GetComponent repetido em todo frame e sem checagem de nulo
        // Se o Rigidbody for removido ou atrasar, causa NullReferenceException constante!
        GetComponent<Rigidbody>().linearVelocity = new Vector3(h * speed, GetComponent<Rigidbody>().linearVelocity.y, v * speed);
    }
}
`,
  },
  {
    name: 'Vazamento de Eventos e Coroutine Infinita',
    error: `MissingReferenceException: The object of type 'PlayerHealth' has been destroyed but you are still trying to access it.`,
    desc: 'A Coroutine continua executando após o GameObject ser destruído e eventos nunca são desinscritos.',
    code: `using UnityEngine;
using System.Collections;

public class PlayerHealth : MonoBehaviour
{
    public int health = 100;

    void Start()
    {
        // Evento inscrito mas NUNCA desinscrito em OnDisable/OnDestroy (Memory Leak)
        GameEvents.OnPlayerDamaged += ApplyDamage;
        StartCoroutine(RegenerateHealth());
    }

    void ApplyDamage(int amount)
    {
        health -= amount;
    }

    IEnumerator RegenerateHealth()
    {
        while (true)
        {
            yield return new WaitForSeconds(1f); // Aloca novo WaitForSeconds em cada iteração
            health += 5;
            Debug.Log("Regenerating: " + health);
        }
    }
}
`,
  },
];

export const UnityBugAnalyzerView: React.FC<UnityBugAnalyzerViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [code, setCode] = useState(SAMPLE_UNITY_BUGS[0].code);
  const [consoleError, setConsoleError] = useState(SAMPLE_UNITY_BUGS[0].error);
  const [description, setDescription] = useState(SAMPLE_UNITY_BUGS[0].desc);
  const [unityVersion, setUnityVersion] = useState('Unity 2022.3 LTS+');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnityBugResult | null>(null);
  const [showDiff, setShowDiff] = useState(true);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      showToast('error', 'Cole o script C# que você deseja analisar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/unity/analyze-bug', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          consoleError,
          description,
          unityVersion,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na análise de bugs Unity');
      }

      const data: UnityBugResult = await res.json();
      setResult(data);
      onLogActivity('unity', 'Diagnóstico de Bug Unity', `${data.issues.length} problemas encontrados`);
      showToast('success', 'Diagnóstico de bug Unity concluído!');
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFixedCode = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fixedCode);
    showToast('success', 'Código C# corrigido copiado!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-medium">
              <Bug className="w-3.5 h-3.5" />
              <span>Unity Console & Bug Analyzer</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Diagnóstico e Correção de Scripts C# para Unity
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Identifique e corrija NullReferenceExceptions, chamadas indevidas em Update(), vazamento de
              delegates, erros de Coroutines e problemas no ciclo de vida do MonoBehaviour com diff lado a lado.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9699AC]">Carregar cenário:</span>
            {SAMPLE_UNITY_BUGS.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setCode(s.code);
                  setConsoleError(s.error);
                  setDescription(s.desc);
                  setResult(null);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-[#191C28] hover:bg-rose-500/15 text-[#9699AC] hover:text-rose-400 border border-[#292C3B] transition-all"
              >
                Cenário {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Console Inputs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Code input */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-3">
            <label className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-[#8065F5]" />
              <span>Código C# com Falha ou Dúvida</span>
            </label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Cole seu script C# da Unity aqui..."
              rows={12}
              className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5] leading-relaxed"
            />
          </div>
        </div>

        {/* Right: Console Log & Description */}
        <div className="space-y-4">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-3">
            <label className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>Log do Console da Unity (Opcional)</span>
            </label>
            <textarea
              value={consoleError}
              onChange={(e) => setConsoleError(e.target.value)}
              placeholder="Cole a mensagem de erro do Unity Console (ex: NullReferenceException: Object reference not set...)"
              rows={5}
              className="w-full font-mono text-[11px] bg-[#0B0C12] border border-[#292C3B] rounded-xl p-3 text-rose-300 placeholder-[#6C7086] focus:outline-none focus:border-rose-500/50"
            />

            <label className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider block pt-2">
              O que está acontecendo de errado?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o sintoma: o player não pula, a câmera treme, a vida não diminui..."
              rows={3}
              className="w-full text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-3 text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5]"
            />

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Diagnosticando Bug...</span>
                </>
              ) : (
                <>
                  <Bug className="w-4 h-4" />
                  <span>Diagnosticar e Corrigir C#</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Summary Box */}
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-[#292C3B] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-[#F5F5FA]">Diagnóstico do Script</h3>
              </div>
              <span className="text-xs text-[#A995FF] font-mono">
                {result.issues.length} Problemas Diagnosticados
              </span>
            </div>

            <p className="text-xs text-[#9699AC] leading-relaxed">{result.summary}</p>
            {result.consoleLogDiagnosis && (
              <p className="text-xs text-rose-300 bg-[#0B0C12] p-3 rounded-xl border border-rose-500/20 font-mono">
                {result.consoleLogDiagnosis}
              </p>
            )}
          </div>

          {/* Issues List */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
              Problemas Identificados
            </h4>

            {result.issues.map((issue, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        issue.severity === 'error'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
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
                    <span className="text-[10px] text-amber-400 font-semibold block uppercase">
                      Causa Raiz:
                    </span>
                    <span className="text-[#9699AC] text-[11px]">{issue.possibleCause}</span>
                  </div>

                  <div className="bg-[#0B0C12] p-2.5 rounded-lg border border-[#292C3B]">
                    <span className="text-[10px] text-emerald-400 font-semibold block uppercase">
                      Solução Sugerida:
                    </span>
                    <span className="text-[#F5F5FA]/90 text-[11px]">{issue.suggestedFix}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Diff View / Fixed Code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
                <span>Comparação: Original vs Corrigido</span>
              </h4>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className="px-3 py-1 rounded-lg bg-[#191C28] text-xs text-[#9699AC] hover:text-[#F5F5FA] border border-[#292C3B]"
                >
                  {showDiff ? 'Ver Código Corrigido Puro' : 'Ver Comparação Diff'}
                </button>
                <button
                  onClick={handleCopyFixedCode}
                  className="px-3 py-1 rounded-lg bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold shadow"
                >
                  Copiar Código Corrigido
                </button>
              </div>
            </div>

            {showDiff ? (
              <DiffViewer
                originalCode={code}
                fixedCode={result.fixedCode}
                originalLabel="Código Original (com bug)"
                fixedLabel="Código C# Corrigido"
              />
            ) : (
              <CodeViewer
                code={result.fixedCode}
                filename="FixedScript.cs"
                scriptType="MonoBehaviour"
                theme={preferences.editorTheme}
                fontSize={preferences.fontSize}
                onExplain={() => onExplainRequest(result.fixedCode, 'FixedScript.cs')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
