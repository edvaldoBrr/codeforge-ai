import React, { useState } from 'react';
import {
  Compass,
  Sparkles,
  Layers,
  FolderTree,
  ListOrdered,
  Cpu,
  ArrowRight,
  RefreshCw,
  Bookmark,
  CheckCircle2,
  Folder,
  FileCode,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Zap,
  FolderArchive,
  Download,
} from 'lucide-react';
import {
  ArchitectPlan,
  ArchitectSystemItem,
  CodeForgeProject,
  ScriptFile,
  UserPreferences,
} from '../types/codeforge';
import {
  saveArchitectPlan,
  getArchitectPlans,
  saveProject,
  getProjects,
  exportProjectToZip,
} from '../utils/storage';
import { CodeViewer } from '../components/CodeViewer';

interface ArchitectViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onNavigateToProjects?: () => void;
}

const PRESET_IDEAS = [
  {
    title: 'Anime Battle RPG',
    genre: 'Anime RPG',
    idea: 'Jogo de anime com combate corpo a corpo em combos, 4 habilidades elementais com cooldown, sistema de mana, inventário de armas e chefes com IA e telegrafia de ataques.',
  },
  {
    title: 'Tycoon de Restaurante Automatizado',
    genre: 'Tycoon / Simulador',
    idea: 'Tycoon onde o jogador constrói um restaurante, contrata garçons e chefs NPCs com PathfindingService, gerencia estoque e receita persistida em DataStore com session locking.',
  },
  {
    title: 'Horror Multiplayer com Proximidade',
    genre: 'Terror / Sobrevivência',
    idea: 'Jogo de terror cooperativo em primeira pessoa para 4 jogadores com lanterna de bateria limitada, gerador elétrico para consertar, monstro com inteligência artificial e som de passos replicado.',
  },
  {
    title: 'Obby de Aventura com Checkpoints & Dash',
    genre: 'Plataforma / Obby',
    idea: 'Obby fluido com checkpoints automáticos, cronômetro de leaderboard global, dash aéreo com stamina e moedas colecionáveis.',
  },
];

export const ArchitectView: React.FC<ArchitectViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
  onNavigateToProjects,
}) => {
  const [gameIdea, setGameIdea] = useState('');
  const [genre, setGenre] = useState('Anime RPG');
  const [scale, setScale] = useState('Médio Porte');
  const [targetDevices, setTargetDevices] = useState<string[]>(['PC', 'Mobile']);

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ArchitectPlan | null>(null);

  // System Generation modal/drawer state
  const [generatingSystemId, setGeneratingSystemId] = useState<string | null>(null);
  const [generatedSystemData, setGeneratedSystemData] = useState<{
    system: ArchitectSystemItem;
    summary: string;
    files: ScriptFile[];
    setupSteps: string[];
    testingInstructions: string[];
  } | null>(null);

  // Active view tab in Plan
  const [activeTab, setActiveTab] = useState<'overview' | 'hierarchy' | 'stages' | 'systems'>('overview');

  // Expanded folders in hierarchy
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    ServerScriptService: true,
    ReplicatedStorage: true,
    StarterPlayerScripts: true,
  });

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleDeviceToggle = (device: string) => {
    setTargetDevices((prev) =>
      prev.includes(device)
        ? prev.filter((d) => d !== device)
        : [...prev, device]
    );
  };

  const handleGeneratePlan = async (overrideIdea?: string, overrideGenre?: string) => {
    const finalIdea = overrideIdea || gameIdea;
    const finalGenre = overrideGenre || genre;

    if (!finalIdea.trim()) {
      showToast('error', 'Por favor, descreva a ideia do seu jogo Roblox.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/architect-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameIdea: finalIdea,
          genre: finalGenre,
          targetDevices,
          scale,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao gerar arquitetura');
      }

      const data: ArchitectPlan = await res.json();
      setPlan(data);
      saveArchitectPlan(data);
      onLogActivity('architect', `Arquitetura criada: ${data.title}`, `Gênero: ${finalGenre}`);
      showToast('success', `Plano arquitetural "${data.title}" gerado com sucesso!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro de conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Generate a planned system via backend
  const handleGenerateSystemCode = async (system: ArchitectSystemItem) => {
    setGeneratingSystemId(system.id);
    try {
      const res = await fetch('/api/generate-architect-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system,
          gameContext: plan?.summary.gameDescription || gameIdea,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Falha ao gerar sistema.');
      }

      const data = await res.json();
      setGeneratedSystemData({
        system,
        summary: data.summary,
        files: data.files || [],
        setupSteps: data.setupSteps || [],
        testingInstructions: data.testingInstructions || [],
      });

      // Update system status in current plan
      if (plan) {
        const updatedSystems = plan.plannedSystems.map((s) =>
          s.id === system.id
            ? { ...s, status: 'generated' as const, generatedFiles: data.files }
            : s
        );
        const updatedPlan: ArchitectPlan = { ...plan, plannedSystems: updatedSystems };
        setPlan(updatedPlan);
        saveArchitectPlan(updatedPlan);
      }

      showToast('success', `Scripts de "${system.name}" gerados com sucesso!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao gerar código do sistema.');
    } finally {
      setGeneratingSystemId(null);
    }
  };

  // Save Plan as a Full Project
  const handleSaveAsProject = () => {
    if (!plan) return;

    // Collect all generated files so far or suggested outlines
    const collectedFiles: ScriptFile[] = [];
    plan.plannedSystems.forEach((s) => {
      if (s.generatedFiles && s.generatedFiles.length > 0) {
        collectedFiles.push(...s.generatedFiles);
      }
    });

    const newProject: CodeForgeProject = {
      id: `proj-${Date.now()}`,
      name: plan.title,
      description: plan.summary.gameDescription,
      genre: genre,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersion: 'v1.0',
      versions: [
        {
          versionId: `ver-${Date.now()}`,
          versionNumber: 'v1.0',
          timestamp: new Date().toISOString(),
          changelog: 'Arquitetura técnica inicial gerada pelo Project Architect.',
          files: collectedFiles,
          notes: `Plano com ${plan.plannedSystems.length} sistemas planejados e ${plan.developmentStages.length} fases.`,
        },
      ],
      architectPlan: plan,
      technicalNotes: `Desafios técnicos: ${plan.summary.technicalChallenges.join('; ')}`,
      files: collectedFiles,
    };

    saveProject(newProject);
    showToast('success', `Projeto "${newProject.name}" salvo no Gerenciador de Projetos!`);
    if (onNavigateToProjects) {
      onNavigateToProjects();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-[#A995FF] text-xs font-mono font-medium">
              <Compass className="w-3.5 h-3.5" />
              <span>Project Architect</span>
              <span className="text-emerald-400 font-semibold">• Novo</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Transforme ideias de jogo em arquitetura técnica Luau
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Gere o planejamento estruturado para Roblox Studio: hierarquia no Explorer, etapas de desenvolvimento,
              dependências entre sistemas e gere os scripts reais de cada subsistema com um clique.
            </p>
          </div>

          {plan && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveAsProject}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold shadow-lg shadow-[#8065F5]/25 transition-all"
              >
                <FolderArchive className="w-4 h-4" />
                <span>Salvar como Projeto</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Idea Input Card */}
      <div className="rounded-2xl bg-[#12141D] border border-[#292C3B] p-5 shadow-lg space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider mb-2">
            Descreva a ideia do seu jogo Roblox
          </label>
          <textarea
            value={gameIdea}
            onChange={(e) => setGameIdea(e.target.value)}
            placeholder="Ex: Quero criar um jogo de anime com combate corpo a corpo, combos de 4 hits, habilidades mágicas com cooldown, sistema de mana, inventário de espadas e chefes com IA e animações telegrafadas..."
            rows={3}
            className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-4 py-3 text-sm text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5] transition-colors resize-y"
          />
        </div>

        {/* Configuration Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Genre */}
          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1.5">
              Gênero / Categoria
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Anime RPG">Anime RPG & Luta</option>
              <option value="Simulador / Tycoon">Simulador & Tycoon</option>
              <option value="Terror / Sobrevivência">Terror / Sobrevivência</option>
              <option value="Plataforma / Obby">Plataforma / Obby Fluido</option>
              <option value="Battle Royale / FPS">Battle Royale / FPS</option>
              <option value="Aventura / Mundo Aberto">Aventura / Mundo Aberto</option>
            </select>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1.5">
              Escala do Projeto
            </label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Protótipo / MVP">Protótipo / MVP Rápido</option>
              <option value="Médio Porte">Médio Porte (Modular)</option>
              <option value="Grande Escala">Grande Escala (Enterprise / Live-ops)</option>
            </select>
          </div>

          {/* Target Devices */}
          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1.5">
              Dispositivos Suportados
            </label>
            <div className="flex gap-2">
              {['PC', 'Mobile', 'Console'].map((dev) => {
                const active = targetDevices.includes(dev);
                return (
                  <button
                    key={dev}
                    type="button"
                    onClick={() => handleDeviceToggle(dev)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-[#8065F5]/20 text-[#A995FF] border-[#8065F5]/40'
                        : 'bg-[#0B0C12] text-[#9699AC] border-[#292C3B]'
                    }`}
                  >
                    {dev}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Preset Suggestions */}
        <div>
          <span className="text-[11px] font-medium text-[#6C7086] mr-2">Sugestões rápidas:</span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {PRESET_IDEAS.map((preset) => (
              <button
                key={preset.title}
                onClick={() => {
                  setGameIdea(preset.idea);
                  setGenre(preset.genre);
                }}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#191C28] hover:bg-[#8065F5]/10 text-[#9699AC] hover:text-[#A995FF] border border-[#292C3B] hover:border-[#8065F5]/30 transition-all text-left"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2 border-t border-[#292C3B]/70">
          <button
            onClick={() => handleGeneratePlan()}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8065F5] to-[#9981f9] hover:opacity-95 text-white text-sm font-semibold shadow-lg shadow-[#8065F5]/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analisando e Arquitetando...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Arquitetura do Jogo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Architecture Plan */}
      {plan && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Plan Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#12141D] border border-[#292C3B] p-4 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F5F5FA]">{plan.title}</h3>
                <span className="text-xs px-2 py-0.5 rounded-md bg-[#8065F5]/15 text-[#A995FF] border border-[#8065F5]/30">
                  {plan.plannedSystems.length} Sistemas Planejados
                </span>
              </div>
              <p className="text-xs text-[#9699AC] mt-0.5">
                {plan.summary.gameDescription}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-[#0B0C12] p-1 rounded-lg border border-[#292C3B] self-stretch sm:self-auto overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'overview'
                    ? 'bg-[#191C28] text-[#F5F5FA] shadow-sm'
                    : 'text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('hierarchy')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'hierarchy'
                    ? 'bg-[#191C28] text-[#F5F5FA] shadow-sm'
                    : 'text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                Árvore Explorer
              </button>
              <button
                onClick={() => setActiveTab('stages')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'stages'
                    ? 'bg-[#191C28] text-[#F5F5FA] shadow-sm'
                    : 'text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                Fases de Dev ({plan.developmentStages.length})
              </button>
              <button
                onClick={() => setActiveTab('systems')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'systems'
                    ? 'bg-[#191C28] text-[#F5F5FA] shadow-sm'
                    : 'text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                Sistemas Luau ({plan.plannedSystems.length})
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Core Mechanics */}
              <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-[#F5F5FA] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#A995FF]" />
                  <span>Mecânicas Centrais (Core Loop)</span>
                </h4>
                <ul className="space-y-2">
                  {plan.summary.coreMechanics.map((mech, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[#9699AC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8065F5] mt-1.5 flex-shrink-0" />
                      <span className="text-[#F5F5FA]/90">{mech}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Challenges */}
              <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-semibold text-[#F5F5FA] flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Desafios Técnicos & Gargalos</span>
                </h4>
                <ul className="space-y-2">
                  {plan.summary.technicalChallenges.map((chall, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-[#9699AC]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span className="text-[#F5F5FA]/90">{chall}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Critical Dependencies */}
              <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3 md:col-span-2">
                <h4 className="text-sm font-semibold text-[#F5F5FA] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8065F5]" />
                  <span>Dependências Estruturais Críticas</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {plan.summary.importantDependencies.map((dep, i) => (
                    <div
                      key={i}
                      className="bg-[#191C28] border border-[#292C3B] rounded-xl p-3 text-xs text-[#F5F5FA]/90 flex items-center gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{dep}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXPLORER TREE */}
          {activeTab === 'hierarchy' && (
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#292C3B] pb-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#F5F5FA] flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-[#A995FF]" />
                    <span>Hierarquia Recomendada no Explorer do Roblox Studio</span>
                  </h4>
                  <p className="text-xs text-[#9699AC] mt-0.5">
                    Estrutura oficial para manter cliente, servidor, eventos de rede e módulos 100% organizados.
                  </p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {plan.architectureHierarchy.map((folderNode) => {
                  const isExpanded = expandedFolders[folderNode.folder] ?? true;
                  return (
                    <div
                      key={folderNode.folder}
                      className="bg-[#0B0C12] border border-[#292C3B] rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFolder(folderNode.folder)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-[#191C28]/60 hover:bg-[#191C28] transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 text-[#F5F5FA] font-medium font-sans">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#A995FF]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#9699AC]" />
                          )}
                          <Folder className="w-4 h-4 text-amber-400" />
                          <span>{folderNode.folder}</span>
                        </div>
                        <span className="text-[11px] text-[#9699AC] font-sans truncate max-w-xs sm:max-w-md">
                          {folderNode.description}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="p-3 pl-8 space-y-2 border-t border-[#292C3B]/60">
                          {folderNode.subitems.map((sub, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-[#12141D] border border-[#292C3B]/50 hover:border-[#8065F5]/30 transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <FileCode
                                  className={`w-3.5 h-3.5 ${
                                    sub.isCodeForgeScript
                                      ? 'text-[#A995FF]'
                                      : 'text-[#6C7086]'
                                  }`}
                                />
                                <span className="text-[#F5F5FA] truncate">{sub.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#191C28] text-[#9699AC] border border-[#292C3B]">
                                  {sub.itemType}
                                </span>
                              </div>
                              <span className="text-[11px] font-sans text-[#9699AC] truncate max-w-xs">
                                {sub.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: DEVELOPMENT STAGES */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              {plan.developmentStages.map((stage) => (
                <div
                  key={stage.stageNumber}
                  className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#8065F5]/20 border border-[#8065F5]/30 text-[#A995FF] font-bold flex items-center justify-center text-sm">
                        {stage.stageNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#F5F5FA]">{stage.stageName}</h4>
                        <p className="text-xs text-[#9699AC] mt-0.5">{stage.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-[#191C28] p-3 rounded-xl border border-[#292C3B]/70">
                      <span className="text-[11px] font-semibold text-[#A995FF] uppercase tracking-wider block mb-1.5">
                        Sistemas desta Fase:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.systemsIncluded.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded bg-[#12141D] text-[#F5F5FA] border border-[#292C3B]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#191C28] p-3 rounded-xl border border-[#292C3B]/70">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block mb-1.5">
                        Pré-requisitos:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {stage.prerequisites.map((p, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded bg-[#12141D] text-[#9699AC] border border-[#292C3B]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PLANNED SYSTEMS & INSTANT CODE GENERATOR */}
          {activeTab === 'systems' && (
            <div className="space-y-4">
              <div className="bg-[#12141D] border border-[#292C3B] p-4 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-[#F5F5FA]">
                    Sistemas Luau Modulares do Plano
                  </h4>
                  <p className="text-xs text-[#9699AC]">
                    Você pode gerar o código completo de cada um dos sistemas planejados agora mesmo.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {plan.plannedSystems.map((sys) => {
                  const isGenerating = generatingSystemId === sys.id;
                  const hasGenerated = sys.status === 'generated';

                  return (
                    <div
                      key={sys.id}
                      className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#8065F5]/40 transition-colors shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#8065F5]/15 text-[#A995FF] border border-[#8065F5]/30">
                            {sys.category}
                          </span>
                          {hasGenerated ? (
                            <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              Código Gerado
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#6C7086]">Planejado</span>
                          )}
                        </div>

                        <h5 className="text-base font-bold text-[#F5F5FA]">{sys.name}</h5>
                        <p className="text-xs text-[#9699AC] leading-relaxed">
                          {sys.description}
                        </p>

                        {/* Suggested files list */}
                        <div className="bg-[#0B0C12] rounded-xl p-3 border border-[#292C3B] space-y-1.5">
                          <span className="text-[10px] font-semibold text-[#6C7086] uppercase tracking-wider block">
                            Scripts Sugeridos:
                          </span>
                          {sys.suggestedFiles.map((sf, idx) => (
                            <div
                              key={idx}
                              className="text-xs flex items-center justify-between text-[#9699AC]"
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileCode className="w-3 h-3 text-[#8065F5]" />
                                <span className="text-[#F5F5FA]">{sf.name}</span>
                                <span className="text-[10px] text-[#6C7086]">({sf.type})</span>
                              </div>
                              <span className="text-[10px] text-[#6C7086] font-mono truncate">
                                {sf.location}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Dependencies */}
                        {sys.dependencies.length > 0 && (
                          <div className="text-[11px] text-[#9699AC] flex items-center gap-1.5 flex-wrap">
                            <span className="text-[#6C7086]">Depende de:</span>
                            {sys.dependencies.map((d, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-[#191C28] text-xs text-[#F5F5FA] border border-[#292C3B]"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[#292C3B]/60 flex items-center justify-between">
                        {hasGenerated ? (
                          <button
                            onClick={() => {
                              if (sys.generatedFiles) {
                                setGeneratedSystemData({
                                  system: sys,
                                  summary: `Código para ${sys.name}`,
                                  files: sys.generatedFiles,
                                  setupSteps: ['Instale os arquivos nas pastas correspondentes.'],
                                  testingInstructions: ['Execute Play Solo (F5).'],
                                });
                              }
                            }}
                            className="flex items-center gap-1.5 text-xs text-[#A995FF] hover:underline"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>Ver Scripts Gerados</span>
                          </button>
                        ) : (
                          <span className="text-xs text-[#6C7086]">Aguardando geração</span>
                        )}

                        <button
                          onClick={() => handleGenerateSystemCode(sys)}
                          disabled={isGenerating}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Gerando...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{hasGenerated ? 'Regerar Código' : 'Gerar este Sistema'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated System Inspection Modal */}
      {generatedSystemData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#292C3B] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#8065F5]" />
                <h3 className="text-base font-bold text-[#F5F5FA]">
                  {generatedSystemData.system.name} — Scripts Luau
                </h3>
              </div>
              <button
                onClick={() => setGeneratedSystemData(null)}
                className="text-[#9699AC] hover:text-[#F5F5FA] p-1.5 rounded-lg hover:bg-[#191C28]"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              <p className="text-xs text-[#9699AC] bg-[#191C28] p-3 rounded-xl border border-[#292C3B]">
                {generatedSystemData.summary}
              </p>

              {/* Files */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
                  Arquivos Luau Gerados ({generatedSystemData.files.length})
                </h4>

                {generatedSystemData.files.map((file) => (
                  <div key={file.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#F5F5FA]">{file.name}</span>
                      <span className="text-[11px] text-[#A995FF] font-mono">
                        Local: {file.location}
                      </span>
                    </div>
                    <CodeViewer
                      code={file.code}
                      filename={file.name}
                      scriptType={file.type}
                      location={file.location}
                      theme={preferences.editorTheme}
                      fontSize={preferences.fontSize}
                      onExplain={() => onExplainRequest(file.code, file.name)}
                    />
                  </div>
                ))}
              </div>

              {/* Setup Steps */}
              {generatedSystemData.setupSteps.length > 0 && (
                <div className="bg-[#191C28] p-4 rounded-xl border border-[#292C3B] space-y-2">
                  <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
                    Instruções de Instalação no Studio:
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-[#9699AC]">
                    {generatedSystemData.setupSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-[#292C3B] bg-[#0B0C12] flex justify-end">
              <button
                onClick={() => setGeneratedSystemData(null)}
                className="px-4 py-2 rounded-xl bg-[#191C28] hover:bg-[#292C3B] text-xs font-medium text-[#F5F5FA] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
