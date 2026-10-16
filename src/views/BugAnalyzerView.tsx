import React, { useState } from 'react';
import {
  Bug,
  RefreshCw,
  Copy,
  Download,
  Columns,
  RotateCcw,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import { BugAnalysisResult, UserPreferences } from '../types/codeforge';
import { CodeViewer } from '../components/CodeViewer';
import { DiffViewer } from '../components/DiffViewer';
import { downloadLuaScript } from '../utils/storage';

interface BugAnalyzerViewProps {
  preferences?: UserPreferences;
  onLogActivity: (tool: 'generator' | 'analyzer' | 'system' | 'library', title: string, details?: string) => void;
  onExplainRequest: (code: string, context: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const BugAnalyzerView: React.FC<BugAnalyzerViewProps> = ({
  preferences,
  onLogActivity,
  onExplainRequest,
  showToast,
}) => {
  const [code, setCode] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [outputError, setOutputError] = useState('');
  const [installedLocation, setInstalledLocation] = useState('ServerScriptService');
  const [scriptType, setScriptType] = useState('Script');

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<BugAnalysisResult | null>(null);
  const [showDiff, setShowDiff] = useState(false);

  // Sample buggy code for quick testing
  const loadExampleBuggyCode = () => {
    setCode(`-- Exemplo com erro comum no Roblox Studio
local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")

-- ERRO 1: Usando wait() obsoleto
wait(1)

-- ERRO 2: Chamar DataStore em LocalScript se estiver no client
local myStore = DataStoreService:GetDataStore("Coins")

Players.PlayerAdded:Connect(function(player)
    -- ERRO 3: Indexar Character sem esperar (Character pode ser nil)
    local humanoid = player.Character.Humanoid
    humanoid.WalkSpeed = 20
    
    -- ERRO 4: pcall ausente no DataStore
    local coins = myStore:GetAsync(player.UserId)
    print("Coins: " .. coins)
end)`);
    setOutputError("ServerScriptService.Script:12: attempt to index nil with 'Humanoid'");
    setProblemDescription("O jogo crasha quando o primeiro jogador entra e as moedas não carregam.");
    showToast('info', 'Exemplo com bugs carregado.');
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      showToast('warning', 'Cole o código Luau que você deseja analisar.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/analyze-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          problemDescription,
          outputError,
          installedLocation,
          scriptType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao analisar o script.');
      }

      const data: BugAnalysisResult = await response.json();
      setAnalysis(data);
      setShowDiff(false);
      onLogActivity('analyzer', 'Análise de Bug Concluída', `${data.issues.length} problema(s) diagnosticado(s)`);
      showToast('success', 'Diagnóstico concluído!');
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao analisar o script.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFixed = async () => {
    if (!analysis?.fixedCode) return;
    try {
      await navigator.clipboard.writeText(analysis.fixedCode);
      showToast('success', 'Código corrigido copiado para a área de transferência!');
    } catch {
      showToast('error', 'Falha ao copiar.');
    }
  };

  const handleDownloadFixed = () => {
    if (!analysis?.fixedCode) return;
    downloadLuaScript('Script_Corrigido.luau', analysis.fixedCode);
    showToast('success', 'Download de Script_Corrigido.luau iniciado.');
  };

  const handleClear = () => {
    setCode('');
    setProblemDescription('');
    setOutputError('');
    setAnalysis(null);
    setShowDiff(false);
    showToast('info', 'Formulário e diagnóstico limpos.');
  };

  const handleExplainCurrentError = () => {
    if (!analysis) return;
    const contextMsg = outputError
      ? `Erro Output: ${outputError}`
      : `Diagnóstico: ${analysis.summary}`;
    onExplainRequest(analysis.originalCode, contextMsg);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#292C3B]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-semibold uppercase tracking-wider mb-1">
            <Bug className="w-3.5 h-3.5" />
            Diagnóstico de Código Luau
          </div>
          <h2 className="text-xl font-bold text-[#F5F5FA]">Bug Analyzer & Anti-Exploit</h2>
          <p className="text-xs text-[#9699AC] mt-1">
            Identifique erros no Output, vazamentos de memória, problemas de sincronia cliente/servidor e receba o código 100% corrigido.
          </p>
        </div>

        <button
          onClick={loadExampleBuggyCode}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#191C28] hover:bg-[#8065F5]/20 text-[#A995FF] border border-[#292C3B] hover:border-[#8065F5]/40 text-xs font-medium transition-colors"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Carregar Exemplo com Bugs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Code Input & Context */}
        <div className="lg:col-span-5 bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-4 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-4">
            {/* Script Paste Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#F5F5FA]">
                  Cole o Código Luau <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-mono text-[#6C7086]">
                  {code.split('\n').filter(Boolean).length} linhas
                </span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                placeholder="Cole aqui seu script Luau do Roblox Studio..."
                className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-rose-500 rounded-xl p-3 font-mono text-xs text-[#F5F5FA] placeholder-[#525666] focus:outline-none leading-relaxed transition-colors"
                required
              />
            </div>

            {/* Script Location & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                  Tipo de Script
                </label>
                <select
                  value={scriptType}
                  onChange={(e) => setScriptType(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none"
                >
                  <option value="Script">Script (Server)</option>
                  <option value="LocalScript">LocalScript (Client)</option>
                  <option value="ModuleScript">ModuleScript</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                  Localização no Studio
                </label>
                <select
                  value={installedLocation}
                  onChange={(e) => setInstalledLocation(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-rose-500 rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none"
                >
                  <option value="ServerScriptService">ServerScriptService</option>
                  <option value="StarterPlayerScripts">StarterPlayerScripts</option>
                  <option value="StarterCharacterScripts">StarterCharacterScripts</option>
                  <option value="StarterGui">StarterGui</option>
                  <option value="ReplicatedStorage">ReplicatedStorage</option>
                  <option value="ServerStorage">ServerStorage</option>
                  <option value="Workspace">Workspace</option>
                </select>
              </div>
            </div>

            {/* Output Error Log */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                Mensagem do Output da Roblox (Opcional)
              </label>
              <input
                type="text"
                value={outputError}
                onChange={(e) => setOutputError(e.target.value)}
                placeholder="Ex: ServerScriptService.Script:14: attempt to index nil with 'Humanoid'"
                className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-rose-500 rounded-xl px-3 py-2 text-xs font-mono text-rose-300 placeholder-[#525666] focus:outline-none"
              />
            </div>

            {/* Problem Description */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                Descrição do Problema (Opcional)
              </label>
              <textarea
                value={problemDescription}
                onChange={(e) => setProblemDescription(e.target.value)}
                rows={2}
                placeholder="Ex: O botão de comprar não desconta moedas ou a animação congela após morrer..."
                className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-rose-500 rounded-xl p-3 text-xs text-[#F5F5FA] placeholder-[#525666] focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 disabled:opacity-60 text-white font-semibold text-xs tracking-wide shadow-lg shadow-rose-900/30 transition-all"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Diagnosticando Código...</span>
                  </>
                ) : (
                  <>
                    <Bug className="w-4 h-4" />
                    <span>Analyze Script</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-3 rounded-xl bg-[#0B0C12] hover:bg-[#191C28] border border-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] transition-colors"
                title="Limpar formulário"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Diagnostic & Fixed Code */}
        <div className="lg:col-span-7 space-y-4">
          {!analysis && !loading && (
            <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-10 flex flex-col items-center justify-center text-center space-y-3 min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-[#191C28] border border-[#292C3B] flex items-center justify-center text-rose-400">
                <Bug className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5FA]">Nenhuma análise realizada</h3>
              <p className="text-xs text-[#9699AC] max-w-md leading-relaxed">
                Cole seu script com problemas ou clique em <strong>"Carregar Exemplo com Bugs"</strong> para ver a IA encontrar falhas de sintaxe, tipos nulos e falhas de arquitetura.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-[#6C7086]">
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • Detecção de index nil
                </span>
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • task.wait() vs wait()
                </span>
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • Comparador de Mudanças (Diff)
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[420px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-rose-500/20 border-t-rose-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Bug className="w-6 h-6 text-rose-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#F5F5FA]">Analisando AST e Fluxo Luau</h4>
                <p className="text-xs text-[#9699AC] max-w-sm">
                  Verificando APIs depreciadas, tratamento de personagens no respawn, conexões de eventos e construindo a correção ideal...
                </p>
              </div>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-4">
              {/* Diagnostic Overview Card */}
              <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider block">
                      Diagnóstico do Bug Analyzer
                    </span>
                    <p className="text-xs text-[#F5F5FA] mt-1 leading-relaxed">
                      {analysis.summary}
                    </p>
                  </div>

                  {/* 5 Required Action Buttons in Action Bar */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => setShowDiff(!showDiff)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        showDiff
                          ? 'bg-[#8065F5] text-white border-[#8065F5]'
                          : 'bg-[#191C28] text-[#F5F5FA] border-[#292C3B] hover:border-[#8065F5]/40'
                      }`}
                      title="Comparar código original com o corrigido"
                    >
                      <Columns className="w-3.5 h-3.5" />
                      <span>{showDiff ? 'Código Final' : 'Compare Changes'}</span>
                    </button>

                    <button
                      onClick={handleCopyFixed}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#191C28] text-[#F5F5FA] border border-[#292C3B] hover:border-emerald-500/40 transition-colors"
                      title="Copiar código corrigido"
                    >
                      <Copy className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copy Fixed Code</span>
                    </button>

                    <button
                      onClick={handleDownloadFixed}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#191C28] text-[#F5F5FA] border border-[#292C3B] hover:border-[#8065F5]/40 transition-colors"
                      title="Baixar script corrigido"
                    >
                      <Download className="w-3.5 h-3.5 text-[#9699AC]" />
                      <span className="hidden sm:inline">Download Fixed Script</span>
                    </button>

                    <button
                      onClick={handleExplainCurrentError}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#191C28] text-[#A995FF] border border-[#292C3B] hover:border-[#8065F5]/40 transition-colors"
                      title="Explicar o erro em detalhes"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Explain Error</span>
                    </button>

                    <button
                      onClick={handleClear}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#191C28] text-[#9699AC] border border-[#292C3B] hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                      title="Limpar análise e código"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Issues List with distinction between confirmed and warning */}
                <div className="space-y-2 pt-2 border-t border-[#292C3B]/60">
                  <div className="text-xs font-semibold text-[#F5F5FA]">
                    Problemas Identificados ({analysis.issues.length}):
                  </div>

                  <div className="space-y-2">
                    {analysis.issues.map((issue, idx) => {
                      const isConfirmed = issue.isConfirmedError;
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                            isConfirmed
                              ? 'bg-rose-500/10 border-rose-500/30 text-rose-100'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-100'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 font-bold">
                              {isConfirmed ? (
                                <AlertOctagon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              ) : (
                                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              )}
                              <span>{issue.title}</span>
                              {issue.line && (
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#0B0C12] border border-[#292C3B]">
                                  Linha {issue.line}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                                  isConfirmed
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                }`}
                              >
                                {isConfirmed ? 'Erro Confirmado' : 'Aviso / Hipótese'}
                              </span>

                              <button
                                onClick={() =>
                                  onExplainRequest(
                                    analysis.originalCode,
                                    `Problema: ${issue.title} — ${issue.explanation}`
                                  )
                                }
                                className="text-[10px] px-2 py-0.5 rounded bg-[#0B0C12] hover:bg-[#8065F5] text-[#A995FF] hover:text-white border border-[#292C3B] transition-colors"
                              >
                                Explicar Erro
                              </button>
                            </div>
                          </div>

                          <p className="text-[11px] leading-relaxed opacity-90 pl-6">
                            {issue.explanation}
                          </p>

                          <div className="text-[11px] opacity-80 pl-6 pt-1 flex items-start gap-1">
                            <span className="font-semibold text-[#F5F5FA]">Causa provável:</span>
                            <span>{issue.probableCause}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* View toggle: Diff or Full Fixed Code */}
              {showDiff ? (
                <div>
                  <DiffViewer
                    originalCode={analysis.originalCode}
                    fixedCode={analysis.fixedCode}
                    originalLabel="Original (Com Erros)"
                    fixedLabel="Versão Corrigida pela IA"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Código Luau Totalmente Corrigido
                    </span>
                    <button
                      onClick={() => onExplainRequest(analysis.fixedCode, 'Código corrigido pelo Bug Analyzer')}
                      className="inline-flex items-center gap-1 text-xs text-[#A995FF] hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Explain Fixed Code</span>
                    </button>
                  </div>

                  <CodeViewer
                    code={analysis.fixedCode}
                    filename="Script_Corrigido.luau"
                    scriptType={scriptType}
                    location={installedLocation}
                    fontSize={preferences?.fontSize}
                    theme={preferences?.editorTheme}
                    onCopyFeedback={() => showToast('success', 'Código copiado!')}
                  />
                </div>
              )}

              {/* Changes Made & Testing Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Changes List */}
                <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Alterações Aplicadas no Código</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#9699AC]">
                    {analysis.changes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-emerald-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Testing in Studio */}
                <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                    <Sparkles className="w-4 h-4 text-[#A995FF]" />
                    <span>Dicas de Teste no Roblox Studio</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#9699AC]">
                    {analysis.testSuggestions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#8065F5] font-bold">{idx + 1}.</span>
                        <span>{step}</span>
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
