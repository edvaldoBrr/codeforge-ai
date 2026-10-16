import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  RefreshCw,
  Columns,
  ArrowRightLeft,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import { DiffViewer } from '../../components/DiffViewer';
import { UserPreferences } from '../../types/codeforge';

interface UnityDiffViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SAMPLE_UNITY_DIFFS = [
  {
    title: 'Migração do Input Manager Legado para o New Input System',
    labelA: 'Legado (Input.GetAxis)',
    codeA: `using UnityEngine;

public class PlayerInputHandler : MonoBehaviour
{
    public float speed = 10f;

    void Update()
    {
        // Sistema legado: strings rígidas sem suporte flexível a remapeamento
        float moveX = Input.GetAxis("Horizontal");
        float moveZ = Input.GetAxis("Vertical");

        if (Input.GetButtonDown("Jump"))
        {
            Jump();
        }
    }

    void Jump() { }
}
`,
    labelB: 'New Input System (InputAction)',
    codeB: `using UnityEngine;
using UnityEngine.InputSystem;

public class PlayerInputHandler : MonoBehaviour
{
    [SerializeField] private InputActionReference moveAction;
    [SerializeField] private InputActionReference jumpAction;
    [SerializeField] private float speed = 10f;

    private void OnEnable()
    {
        jumpAction.action.performed += OnJump;
    }

    private void OnDisable()
    {
        jumpAction.action.performed -= OnJump;
    }

    private void Update()
    {
        Vector2 input = moveAction.action.ReadValue<Vector2>();
        // Movimentação moderna desacoplada do hardware
    }

    private void OnJump(InputAction.CallbackContext context)
    {
        // Event-driven jump
    }
}
`,
  },
];

export const UnityDiffView: React.FC<UnityDiffViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [codeA, setCodeA] = useState(SAMPLE_UNITY_DIFFS[0].codeA);
  const [codeB, setCodeB] = useState(SAMPLE_UNITY_DIFFS[0].codeB);
  const [labelA, setLabelA] = useState(SAMPLE_UNITY_DIFFS[0].labelA);
  const [labelB, setLabelB] = useState(SAMPLE_UNITY_DIFFS[0].labelB);

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    breakingChanges: string[];
    improvements: string[];
    performanceImpact: string;
    recommendation: string;
  } | null>(null);

  const handleSwap = () => {
    setCodeA(codeB);
    setCodeB(codeA);
    setLabelA(labelB);
    setLabelB(labelA);
    showToast('info', 'Versões invertidas.');
  };

  const handleAnalyzeDiff = async () => {
    if (!codeA.trim() || !codeB.trim()) {
      showToast('error', 'Preencha ambos os blocos de código C#.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/unity/compare-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeA, codeB, labelA, labelB }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na comparação Unity');
      }

      const data = await res.json();
      setAnalysis(data);
      onLogActivity('unity', `Diff C#: ${labelA} vs ${labelB}`);
      showToast('success', 'Análise de diferenças Unity concluída!');
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-[#A995FF] text-xs font-mono font-medium">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Unity Code Diff & Inspector Impact</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Comparador de Versões de Scripts C# para Unity
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Compare alterações de código C# lado a lado, detecte quebra de bindings no Inspector por
              renomeação de campos [SerializeField] e verifique impactos de performance.
            </p>
          </div>
        </div>
      </div>

      {/* Input Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={labelA}
              onChange={(e) => setLabelA(e.target.value)}
              className="bg-[#0B0C12] border border-[#292C3B] rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA] font-semibold focus:outline-none focus:border-[#8065F5]"
            />
            <span className="text-[11px] text-[#6C7086]">Versão Original / Anterior</span>
          </div>

          <textarea
            value={codeA}
            onChange={(e) => setCodeA(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-3 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5] leading-relaxed resize-y"
          />
        </div>

        <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={labelB}
              onChange={(e) => setLabelB(e.target.value)}
              className="bg-[#0B0C12] border border-[#292C3B] rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA] font-semibold focus:outline-none focus:border-[#8065F5]"
            />
            <span className="text-[11px] text-emerald-400 font-medium">Versão Nova / Modificada</span>
          </div>

          <textarea
            value={codeB}
            onChange={(e) => setCodeB(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-3 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5] leading-relaxed resize-y"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between bg-[#12141D] border border-[#292C3B] p-4 rounded-xl">
        <button
          onClick={handleSwap}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191C28] hover:bg-[#292C3B] text-xs text-[#9699AC] hover:text-[#F5F5FA] border border-[#292C3B] transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Inverter A e B</span>
        </button>

        <button
          onClick={handleAnalyzeDiff}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#8065F5] to-[#9981f9] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#8065F5]/25 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analisando Diferenças Unity...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analisar Diferenças com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Diff */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
          <Columns className="w-4 h-4 text-[#8065F5]" />
          <span>Comparação Visual Linha a Linha</span>
        </h3>
        <DiffViewer
          originalCode={codeA}
          fixedCode={codeB}
          originalLabel={labelA}
          fixedLabel={labelB}
        />
      </div>

      {/* Diagnosis */}
      {analysis && (
        <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in-50 duration-300">
          <div className="border-b border-[#292C3B] pb-3">
            <h3 className="text-base font-bold text-[#F5F5FA] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A995FF]" />
              <span>Diagnóstico Técnico das Mudanças Unity</span>
            </h3>
            <p className="text-xs text-[#9699AC] mt-1">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Possíveis Breaking Changes no Inspector:</span>
              </h4>
              {analysis.breakingChanges.length === 0 ? (
                <p className="text-xs text-[#9699AC]">Nenhum campo com quebra aparente.</p>
              ) : (
                <ul className="space-y-1.5">
                  {analysis.breakingChanges.map((bc, i) => (
                    <li key={i} className="text-xs text-[#9699AC] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                      <span>{bc}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Melhorias Notadas:</span>
              </h4>
              <ul className="space-y-1.5">
                {analysis.improvements.map((imp, i) => (
                  <li key={i} className="text-xs text-[#9699AC] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
