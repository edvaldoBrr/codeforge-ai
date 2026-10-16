import React, { useState } from 'react';
import {
  Wand2,
  RefreshCw,
  Bookmark,
  BookmarkCheck,
  HelpCircle,
  FolderTree,
  ListOrdered,
  FlaskConical,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronDown,
  Info,
} from 'lucide-react';
import { GeneratedScriptResult, ScriptFile, UserPreferences } from '../types/codeforge';
import { CodeViewer } from '../components/CodeViewer';

interface ScriptGeneratorViewProps {
  initialValues?: {
    title?: string;
    description?: string;
    scriptType?: string;
  };
  preferences?: UserPreferences;
  onSaveFavorite: (item: {
    title: string;
    scriptType: string;
    location: string;
    code: string;
    files: ScriptFile[];
    notes?: string;
  }) => void;
  isFavorited: (title: string) => boolean;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: 'generator' | 'analyzer' | 'system' | 'library', title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const ScriptGeneratorView: React.FC<ScriptGeneratorViewProps> = ({
  initialValues,
  preferences,
  onSaveFavorite,
  isFavorited,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [scriptType, setScriptType] = useState(initialValues?.scriptType || 'Sistema com múltiplos scripts');
  const [complexity, setComplexity] = useState<'Simples' | 'Intermediário' | 'Avançado'>('Intermediário');
  const [services, setServices] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedScriptResult | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast('warning', 'Por favor, informe o nome do sistema e a descrição do comportamento.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          scriptType,
          complexity,
          services,
          additionalRequirements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar o script.');
      }

      const data: GeneratedScriptResult = await response.json();
      setResult(data);
      setActiveFileIndex(0);
      onLogActivity('generator', `Gerou: ${title}`, `${data.files.length} arquivo(s) Luau`);

      // Auto-copy on generate if enabled in preferences
      if (preferences?.autoCopyOnGenerate && data.files.length > 0) {
        try {
          await navigator.clipboard.writeText(data.files[0].code);
          showToast('success', `Script "${title}" gerado e copiado para a área de transferência!`);
        } catch {
          showToast('success', `Script "${title}" gerado com sucesso!`);
        }
      } else {
        showToast('success', `Script "${title}" gerado com sucesso!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao gerar o script. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (!result) return;
    const selectedFile = result.files[activeFileIndex] || result.files[0];
    onSaveFavorite({
      title: result.title,
      scriptType: result.scriptType,
      location: selectedFile ? selectedFile.location : 'Explorer',
      code: selectedFile ? selectedFile.code : '',
      files: result.files,
      notes: result.summary,
    });
    showToast('success', `"${result.title}" salvo nos favoritos!`);
  };

  const currentFile = result?.files[activeFileIndex] || result?.files[0];
  const isCurrentFavorited = result ? isFavorited(result.title) : false;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#292C3B]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#A995FF] font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Especializado em Luau & Roblox Studio
          </div>
          <h2 className="text-xl font-bold text-[#F5F5FA]">Gerador Inteligente de Scripts</h2>
          <p className="text-xs text-[#9699AC] mt-1">
            Gera scripts com arquitetura legítima (Client, Server e Modules), comandos de tarefas modernos e instruções para o Explorer.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-5 bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-4 shadow-xl">
          <form onSubmit={handleGenerate} className="space-y-4">
            {/* System Name */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                Nome do Sistema ou Mecânica <span className="text-[#8065F5]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Sistema de Dash com Cooldown e Efeito"
                className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-[#8065F5] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F5FA] placeholder-[#525666] focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Script Type & Complexity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                  Tipo de Script
                </label>
                <select
                  value={scriptType}
                  onChange={(e) => setScriptType(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-[#8065F5] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none"
                >
                  <option value="Sistema com múltiplos scripts">Sistema Completo (Client + Server)</option>
                  <option value="Script">Script (Server / Servidor)</option>
                  <option value="LocalScript">LocalScript (Client / Jogador)</option>
                  <option value="ModuleScript">ModuleScript (Shared / Módulo)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                  Complexidade
                </label>
                <div className="grid grid-cols-3 gap-1 bg-[#0B0C12] p-1 rounded-xl border border-[#292C3B]">
                  {(['Simples', 'Intermediário', 'Avançado'] as const).map((comp) => (
                    <button
                      key={comp}
                      type="button"
                      onClick={() => setComplexity(comp)}
                      className={`text-[11px] py-1.5 rounded-lg font-medium transition-colors ${
                        complexity === comp
                          ? 'bg-[#8065F5] text-white'
                          : 'text-[#9699AC] hover:text-[#F5F5FA]'
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
                Descrição Detalhada do Comportamento <span className="text-[#8065F5]">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Ex: Quando o jogador pressionar 'Q', o personagem deve dar um impulso para frente na direção que está olhando, consumindo stamina. Deve tocar um som de vento, emitir partículas de poeira e ter 3 segundos de cooldown..."
                className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-[#8065F5] rounded-xl p-3 text-xs text-[#F5F5FA] placeholder-[#525666] focus:outline-none leading-relaxed transition-colors"
                required
              />
            </div>

            {/* Collapsible Advanced Options */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
                className="flex items-center gap-1.5 text-xs text-[#9699AC] hover:text-[#A995FF] transition-colors"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    showAdvancedInputs ? 'rotate-180' : ''
                  }`}
                />
                <span>Opções Avançadas (Serviços e Regras)</span>
              </button>

              {showAdvancedInputs && (
                <div className="mt-3 space-y-3 pt-2 border-t border-[#292C3B]/60">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9699AC] mb-1">
                      Serviços ou Objetos Conhecidos (Opcional)
                    </label>
                    <input
                      type="text"
                      value={services}
                      onChange={(e) => setServices(e.target.value)}
                      placeholder="Ex: TweenService, ContextActionService, Part, Sound"
                      className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-[#8065F5] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] placeholder-[#525666] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#9699AC] mb-1">
                      Requisitos Adicionais (Opcional)
                    </label>
                    <input
                      type="text"
                      value={additionalRequirements}
                      onChange={(e) => setAdditionalRequirements(e.target.value)}
                      placeholder="Ex: Checar se o jogador tem Gamepass, suporte para Mobile"
                      className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-[#8065F5] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] placeholder-[#525666] focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#8065F5] to-[#6A4FE0] hover:from-[#8065F5]/90 hover:to-[#6A4FE0]/90 disabled:opacity-60 text-white font-semibold text-xs tracking-wide shadow-lg shadow-[#8065F5]/25 transition-all"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Construindo Script Luau...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Script</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Output / Result */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-10 flex flex-col items-center justify-center text-center space-y-3 min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-[#191C28] border border-[#292C3B] flex items-center justify-center text-[#8065F5]">
                <Wand2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5FA]">Nenhum script gerado ainda</h3>
              <p className="text-xs text-[#9699AC] max-w-md leading-relaxed">
                Preencha o formulário ao lado e clique em <strong>"Generate Script"</strong> para gerar scripts Luau profissionais com separação limpa entre cliente e servidor.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-[#6C7086]">
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • LocalScript & ServerScript
                </span>
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • task.wait() & task.spawn()
                </span>
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • Instruções no Explorer
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[420px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-[#8065F5]/20 border-t-[#8065F5] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#A995FF] animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#F5F5FA]">Gerando Código Luau Especializado</h4>
                <p className="text-xs text-[#9699AC] max-w-sm">
                  Consultando boas práticas do Roblox Studio, estruturando segurança de rede e definindo hierarquia no Explorer...
                </p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Result Summary Bar */}
              <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5FA] flex items-center gap-2">
                      {result.title}
                    </h3>
                    <p className="text-xs text-[#9699AC] mt-1 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFavoriteToggle}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isCurrentFavorited
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-[#191C28] text-[#F5F5FA] border-[#292C3B] hover:border-[#8065F5]/40'
                      }`}
                    >
                      {isCurrentFavorited ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Favoritado</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-[#9699AC]" />
                          <span>Save to Favorites</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleGenerate()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#191C28] text-[#F5F5FA] border border-[#292C3B] hover:border-[#8065F5]/40 transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#A995FF]" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>

                {/* Multi-script File Tabs */}
                {result.files.length > 1 && (
                  <div className="pt-2 border-t border-[#292C3B]/60">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-3.5 h-3.5 text-[#A995FF]" />
                      <span className="text-xs font-semibold text-[#F5F5FA]">
                        Arquivos do Sistema ({result.files.length}):
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                      {result.files.map((file, idx) => {
                        const isActive = idx === activeFileIndex;
                        return (
                          <button
                            key={file.id || idx}
                            onClick={() => setActiveFileIndex(idx)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap border ${
                              isActive
                                ? 'bg-[#8065F5]/20 text-[#A995FF] border-[#8065F5]/40 font-semibold'
                                : 'bg-[#0B0C12] text-[#9699AC] border-[#292C3B] hover:text-[#F5F5FA]'
                            }`}
                          >
                            <span>{file.name}</span>
                            <span className="text-[10px] opacity-75 font-sans">({file.type})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Code Viewer for selected file */}
              {currentFile && (
                <div>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-medium text-[#9699AC]">
                      Visualizando: <strong className="text-[#F5F5FA] font-mono">{currentFile.name}</strong>
                    </span>
                    <button
                      onClick={() => onExplainRequest(currentFile.code, `${currentFile.name} (${currentFile.type}) em ${currentFile.location}`)}
                      className="inline-flex items-center gap-1 text-xs text-[#A995FF] hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Explain Code</span>
                    </button>
                  </div>

                  <CodeViewer
                    code={currentFile.code}
                    filename={currentFile.name}
                    scriptType={currentFile.type}
                    location={currentFile.location}
                    fontSize={preferences?.fontSize}
                    theme={preferences?.editorTheme}
                    onCopyFeedback={() => showToast('success', `Código de ${currentFile.name} copiado!`)}
                  />

                  {currentFile.explanation && (
                    <div className="p-3 rounded-xl bg-[#12141D] border border-[#292C3B] text-xs text-[#9699AC] flex items-start gap-2">
                      <Info className="w-4 h-4 text-[#8065F5] flex-shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{currentFile.explanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Required Objects & Explorer Hierarchy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Explorer Requirements */}
                <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                    <FolderTree className="w-4 h-4 text-[#A995FF]" />
                    <span>Objetos Necessários no Explorer</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#9699AC]">
                    {result.requiredServicesAndInstances.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-mono text-[11px]">
                        <span className="text-[#8065F5]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Testing Instructions */}
                <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <span>Como Testar no Roblox Studio</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#9699AC]">
                    {result.testingInstructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Setup Steps Accordion / List */}
              <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                  <ListOrdered className="w-4 h-4 text-[#8065F5]" />
                  <span>Instruções de Instalação Passo a Passo</span>
                </div>
                <div className="space-y-2">
                  {result.setupSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-2.5 rounded-lg bg-[#0B0C12] border border-[#292C3B]/50 text-xs text-[#F5F5FA]"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#8065F5]/20 text-[#A995FF] flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed text-[#9699AC] text-xs">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Limitations */}
              {result.knownLimitations && result.knownLimitations.length > 0 && (
                <div className="p-4 rounded-xl bg-[#12141D] border border-amber-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Limitações Conhecidas e Dicas de Segurança</span>
                  </div>
                  <ul className="space-y-1 text-xs text-[#9699AC]">
                    {result.knownLimitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-amber-400">•</span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
