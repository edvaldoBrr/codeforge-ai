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
  FileCode,
} from 'lucide-react';
import { DiffViewer } from '../components/DiffViewer';
import { UserPreferences } from '../types/codeforge';

interface CodeComparatorViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SAMPLE_COMPARISONS = [
  {
    title: 'Migração de wait() legado para task.wait() moderno',
    labelA: 'Legado (wait)',
    codeA: `local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

local function monitorLoop()
	while true do
		wait(0.5) -- Legado a 30 Hz throttling
		print("Verificando jogadores...")
	end
end

spawn(monitorLoop)
`,
    labelB: 'Moderno (task.wait)',
    codeB: `local RunService = game:GetService("RunService")
local Players = game:GetService("Players")

local function monitorLoop()
	while true do
		task.wait(0.5) -- Moderno sincronizado com o frame pipeline
		print("Verificando jogadores...")
	end
end

task.spawn(monitorLoop)
`,
  },
  {
    title: 'Refatoração de Replicação de Dano (Anti-Cheat)',
    labelA: 'Cliente Inseguro',
    codeA: `local remote = game:GetService("ReplicatedStorage"):WaitForChild("DamageRemote")

-- O servidor aplica o dano informado diretamente pelo cliente
remote.OnServerEvent:Connect(function(player, targetHumanoid, damageAmount)
	targetHumanoid:TakeDamage(damageAmount)
end)
`,
    labelB: 'Servidor Autoritativo',
    codeB: `local remote = game:GetService("ReplicatedStorage"):WaitForChild("DamageRemote")
local WEAPON_CONFIG = { MaxDamage = 25, MaxDistance = 15 }

remote.OnServerEvent:Connect(function(player, targetHumanoid)
	if not targetHumanoid or not targetHumanoid.RootPart then return end
	local char = player.Character
	if not char or not char:FindFirstChild("HumanoidRootPart") then return end

	local dist = (char.HumanoidRootPart.Position - targetHumanoid.RootPart.Position).Magnitude
	if dist <= WEAPON_CONFIG.MaxDistance then
		targetHumanoid:TakeDamage(WEAPON_CONFIG.MaxDamage)
	end
end)
`,
  },
];

export const CodeComparatorView: React.FC<CodeComparatorViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [codeA, setCodeA] = useState(SAMPLE_COMPARISONS[0].codeA);
  const [codeB, setCodeB] = useState(SAMPLE_COMPARISONS[0].codeB);
  const [labelA, setLabelA] = useState(SAMPLE_COMPARISONS[0].labelA);
  const [labelB, setLabelB] = useState(SAMPLE_COMPARISONS[0].labelB);

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
      showToast('error', 'Preencha ambos os blocos de código para comparar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/compare-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codeA, codeB, labelA, labelB }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na comparação');
      }

      const data = await res.json();
      setAnalysis(data);
      onLogActivity('comparator', `Comparação: ${labelA} vs ${labelB}`, data.summary);
      showToast('success', 'Análise de diferenças concluída!');
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao comunicar com o servidor.');
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
              <span>Code Comparator & Diff</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Comparador de Versões e Scripts Luau
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Compare lado a lado duas versões de scripts, inspecione adições e remoções com realce de sintaxe
              e receba análise por IA sobre breaking changes e impacto de performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {SAMPLE_COMPARISONS.map((samp, i) => (
              <button
                key={i}
                onClick={() => {
                  setCodeA(samp.codeA);
                  setCodeB(samp.codeB);
                  setLabelA(samp.labelA);
                  setLabelB(samp.labelB);
                  setAnalysis(null);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-[#191C28] hover:bg-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] border border-[#292C3B] transition-all"
              >
                {samp.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Input Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Version A */}
        <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={labelA}
              onChange={(e) => setLabelA(e.target.value)}
              className="bg-[#0B0C12] border border-[#292C3B] rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA] font-semibold focus:outline-none focus:border-[#8065F5]"
              placeholder="Rótulo da Versão A"
            />
            <span className="text-[11px] text-[#6C7086]">Versão Original / Anterior</span>
          </div>

          <textarea
            value={codeA}
            onChange={(e) => setCodeA(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-3 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5] leading-relaxed resize-y"
            placeholder="Cole o código original aqui..."
          />
        </div>

        {/* Version B */}
        <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={labelB}
              onChange={(e) => setLabelB(e.target.value)}
              className="bg-[#0B0C12] border border-[#292C3B] rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA] font-semibold focus:outline-none focus:border-[#8065F5]"
              placeholder="Rótulo da Versão B"
            />
            <span className="text-[11px] text-emerald-400 font-medium">Versão Nova / Modificada</span>
          </div>

          <textarea
            value={codeB}
            onChange={(e) => setCodeB(e.target.value)}
            rows={10}
            className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-3 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5] leading-relaxed resize-y"
            placeholder="Cole a nova versão aqui..."
          />
        </div>
      </div>

      {/* Actions Bar */}
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
              <span>Analisando Impacto...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Analisar Mudanças com IA</span>
            </>
          )}
        </button>
      </div>

      {/* Visual Diff Viewer */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
          <Columns className="w-4 h-4 text-[#8065F5]" />
          <span>Visualização de Diferenças Lado a Lado</span>
        </h3>
        <DiffViewer
          originalCode={codeA}
          fixedCode={codeB}
          originalLabel={labelA}
          fixedLabel={labelB}
        />
      </div>

      {/* AI Impact Analysis */}
      {analysis && (
        <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 shadow-xl space-y-5 animate-in fade-in-50 duration-300">
          <div className="border-b border-[#292C3B] pb-3">
            <h3 className="text-base font-bold text-[#F5F5FA] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A995FF]" />
              <span>Diagnóstico Técnico das Diferenças</span>
            </h3>
            <p className="text-xs text-[#9699AC] mt-1">{analysis.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Breaking Changes */}
            <div className="bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Risco de Breaking Changes:</span>
              </h4>
              {analysis.breakingChanges.length === 0 ? (
                <p className="text-xs text-[#9699AC]">Nenhuma breaking change detectada.</p>
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

            {/* Improvements */}
            <div className="bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Melhorias Identificadas:</span>
              </h4>
              {analysis.improvements.length === 0 ? (
                <p className="text-xs text-[#9699AC]">Nenhuma melhoria explícita.</p>
              ) : (
                <ul className="space-y-1.5">
                  {analysis.improvements.map((imp, i) => (
                    <li key={i} className="text-xs text-[#9699AC] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Performance & Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#191C28] p-4 rounded-xl border border-[#292C3B] text-xs space-y-1">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                Impacto de Performance:
              </span>
              <p className="text-[#9699AC]">{analysis.performanceImpact}</p>
            </div>

            <div className="bg-[#191C28] p-4 rounded-xl border border-[#292C3B] text-xs space-y-1">
              <span className="font-semibold text-[#A995FF] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Recomendação da IA:
              </span>
              <p className="text-[#F5F5FA]/90">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
