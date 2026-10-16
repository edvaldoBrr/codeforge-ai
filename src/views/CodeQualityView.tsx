import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Sparkles,
  RefreshCw,
  Code2,
  Gauge,
  Sliders,
  Copy,
  Check,
  FileCode,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { CodeQualityResult, QualityIssue, UserPreferences } from '../types/codeforge';
import { CodeViewer } from '../components/CodeViewer';

interface CodeQualityViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SAMPLE_SCRIPTS = [
  {
    name: 'Loop com wait() depreciado e conexões vazando',
    type: 'Script',
    location: 'ServerScriptService',
    code: `-- Script com práticas legadas e problemas de performance
local Players = game:GetService("Players")

while true do
	wait(1) -- Depreciado: deve usar task.wait(1)
	for _, player in pairs(Players:GetPlayers()) do
		-- Conexão repetida dentro de loop que nunca é desconectada (vazamento de memória)
		player.CharacterAdded:Connect(function(char)
			print("Personagem carregado:", char.Name)
		end)
	end
end
`,
  },
  {
    name: 'Falta de --!strict e tipagem genérica',
    type: 'ModuleScript',
    location: 'ReplicatedStorage',
    code: `local InventoryModule = {}

function InventoryModule.addItem(player, itemName, count)
	if not player or not itemName then return end
	local bag = player:FindFirstChild("Backpack")
	if bag then
		local item = Instance.new("StringValue")
		item.Name = itemName
		item.Value = tostring(count)
		item.Parent = bag
	end
end

return InventoryModule
`,
  },
];

export const CodeQualityView: React.FC<CodeQualityViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [code, setCode] = useState(SAMPLE_SCRIPTS[0].code);
  const [scriptType, setScriptType] = useState('Script');
  const [location, setLocation] = useState('ServerScriptService');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CodeQualityResult | null>(null);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      showToast('error', 'Insira o código Luau para verificar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/check-quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, scriptType, location }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na verificação de qualidade');
      }

      const data: CodeQualityResult = await res.json();
      setResult(data);
      onLogActivity('quality', `Score de Qualidade: ${data.score}/100`, `${data.issues.length} sugestões`);
      showToast('success', `Análise de qualidade finalizada! Score: ${data.score}/100`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFix = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
    showToast('success', 'Sugestão copiada para a área de transferência.');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  const getSeverityBadge = (sev: QualityIssue['severity']) => {
    switch (sev) {
      case 'error':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-md">
            <AlertCircle className="w-3 h-3" />
            Erro Crítico
          </span>
        );
      case 'warning':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3" />
            Aviso
          </span>
        );
      case 'best_practice':
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#A995FF] bg-[#8065F5]/15 border border-[#8065F5]/30 px-2 py-0.5 rounded-md">
            <Sparkles className="w-3 h-3" />
            Boa Prática
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-400 bg-sky-500/15 border border-sky-500/30 px-2 py-0.5 rounded-md">
            <Lightbulb className="w-3 h-3" />
            Otimização
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-[#A995FF] text-xs font-mono font-medium">
              <Gauge className="w-3.5 h-3.5" />
              <span>Luau Code Quality & Linter</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Verificador de Qualidade e Boas Práticas Luau
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Avalie diretivas Luau strict, verifique vazamentos de memória em conexões, elimine chamadas
              depreciadas como wait()/spawn() e receba um score técnico com correções recomendadas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCode(`--!strict
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")

local connection: RBXScriptConnection? = nil

local function onPlayerAdded(player: Player)
	print("Jogador conectado com tipagem estrita:", player.Name)
end

Players.PlayerAdded:Connect(onPlayerAdded)
`);
                showToast('info', 'Exemplo limpo carregado.');
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-[#191C28] hover:bg-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] border border-[#292C3B] transition-colors"
            >
              Carregar Exemplo Limpo
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Code Input & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4 text-[#8065F5]" />
                <span>Script Luau a Analisar</span>
              </label>

              {/* Sample script selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#6C7086]">Exemplos com falhas:</span>
                {SAMPLE_SCRIPTS.map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCode(sample.code);
                      setScriptType(sample.type);
                      setLocation(sample.location);
                    }}
                    className="text-[11px] px-2 py-1 rounded bg-[#191C28] hover:bg-[#8065F5]/20 text-[#9699AC] hover:text-[#A995FF] border border-[#292C3B] transition-colors"
                  >
                    Exemplo {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Cole seu script Luau aqui para inspeção de qualidade..."
              rows={12}
              className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5] transition-colors leading-relaxed"
            />

            {/* Metadata Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
                  Tipo de Script
                </label>
                <select
                  value={scriptType}
                  onChange={(e) => setScriptType(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                >
                  <option value="Script">Script (Server)</option>
                  <option value="LocalScript">LocalScript (Client)</option>
                  <option value="ModuleScript">ModuleScript</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
                  Localização no Explorer
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                >
                  <option value="ServerScriptService">ServerScriptService</option>
                  <option value="ReplicatedStorage">ReplicatedStorage</option>
                  <option value="StarterPlayerScripts">StarterPlayerScripts</option>
                  <option value="StarterCharacterScripts">StarterCharacterScripts</option>
                  <option value="StarterGui">StarterGui</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#292C3B]">
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8065F5] to-[#9981f9] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#8065F5]/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Inspecionando Código...</span>
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

        {/* Right Column: Score Summary Gauge */}
        <div className="space-y-4">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#8065F5]" />
              <span>Score & Métricas</span>
            </h3>

            {result ? (
              <div className="space-y-4">
                {/* Score Gauge Circle */}
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
                      ? 'Excelente Padrão Luau'
                      : result.score >= 60
                      ? 'Requer Otimizações'
                      : 'Código com Más Práticas Críticas'}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B]">
                    <span className="text-[#9699AC]">Diretiva --!strict:</span>
                    <span
                      className={`font-semibold ${
                        result.metrics.hasStrictDirective ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      {result.metrics.hasStrictDirective ? 'Ativada' : 'Ausente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B]">
                    <span className="text-[#9699AC]">Linhas de código:</span>
                    <span className="font-semibold text-[#F5F5FA]">
                      {result.metrics.lineCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B]">
                    <span className="text-[#9699AC]">Funções declaradas:</span>
                    <span className="font-semibold text-[#F5F5FA]">
                      {result.metrics.functionCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B]">
                    <span className="text-[#9699AC]">Serviços chamados:</span>
                    <span className="font-semibold text-[#F5F5FA]">
                      {result.metrics.servicesCount}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#9699AC] bg-[#191C28] p-3 rounded-xl border border-[#292C3B]">
                  {result.summary}
                </p>
              </div>
            ) : (
              <div className="text-center py-12 px-4 space-y-2">
                <Gauge className="w-10 h-10 text-[#6C7086] mx-auto opacity-50" />
                <p className="text-xs text-[#9699AC]">
                  Execute a inspeção para calcular o índice de saúde técnica e receber diagnóstico detalhado.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Issues Breakdown List */}
      {result && (
        <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-[#292C3B] pb-3">
            <h3 className="text-sm font-bold text-[#F5F5FA] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#8065F5]" />
              <span>Itens Identificados ({result.issues.length})</span>
            </h3>
            <span className="text-xs text-[#9699AC]">
              Ordenados por severidade e impacto na estabilidade
            </span>
          </div>

          {result.issues.length === 0 ? (
            <div className="p-8 text-center bg-[#0B0C12] rounded-xl border border-[#292C3B] space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-[#F5F5FA]">Nenhum problema grave encontrado!</h4>
              <p className="text-xs text-[#9699AC]">
                Seu script segue os padrões recomendados de tipagem e APIs modernas do Roblox Studio.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.issues.map((issue, idx) => (
                <div
                  key={idx}
                  className="bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 space-y-3 hover:border-[#8065F5]/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {getSeverityBadge(issue.severity)}
                      <h4 className="text-sm font-bold text-[#F5F5FA]">{issue.title}</h4>
                      {issue.line && (
                        <span className="text-[11px] font-mono text-[#9699AC] bg-[#191C28] px-2 py-0.5 rounded border border-[#292C3B]">
                          Linha ~{issue.line}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[#9699AC] leading-relaxed">
                    {issue.explanation}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Impact */}
                    <div className="bg-[#191C28] p-3 rounded-lg border border-[#292C3B]/60 text-xs">
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block mb-1">
                        Impacto no Jogo:
                      </span>
                      <span className="text-[#F5F5FA]/90">{issue.impact}</span>
                    </div>

                    {/* Suggested Fix */}
                    <div className="bg-[#191C28] p-3 rounded-lg border border-[#292C3B]/60 text-xs flex flex-col justify-between space-y-2">
                      <div>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                          Solução Recomendada:
                        </span>
                        <code className="block font-mono text-[11px] text-[#A995FF] bg-[#0B0C12] p-2 rounded border border-[#292C3B]">
                          {issue.suggestedFix}
                        </code>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleCopyFix(issue.suggestedFix, idx)}
                          className="flex items-center gap-1.5 text-[11px] text-[#9699AC] hover:text-[#F5F5FA] px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B] hover:border-[#8065F5]/30 transition-colors"
                        >
                          {copiedSnippetIdx === idx ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Correção</span>
                            </>
                          )}
                        </button>
                      </div>
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
