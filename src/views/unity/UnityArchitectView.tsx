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
  ShieldAlert,
  Zap,
  Box,
} from 'lucide-react';
import {
  UnityArchitectPlan,
  UnityScriptType,
  UserPreferences,
  UnityProject,
} from '../../types/codeforge';
import { getUnityProjects, saveUnityProject } from '../../utils/storage';

interface UnityArchitectViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onNavigateToProjects?: () => void;
}

const UNITY_TEMPLATES = [
  {
    title: 'RPG de Ação em 3ª Pessoa (Hack & Slash)',
    genre: 'RPG / Ação',
    camera: 'Terceira Pessoa (Cinemachine)',
    pipeline: 'Universal RP (URP)',
    input: 'New Input System',
    idea: 'Combate fluido com combos de espada, esquiva com iframe, travar mira no inimigo (lock-on), inventário de equipamentos baseado em ScriptableObjects e sistema de atributos com leveling.',
  },
  {
    title: 'FPS Tático de Sobrevivência',
    genre: 'Shooter / Sobrevivência',
    camera: 'Primeira Pessoa',
    pipeline: 'Universal RP (URP)',
    input: 'New Input System',
    idea: 'Balística física com recuo procedimental e dispersão, sistema de estamina e fome, sons 3D dinâmicos com AudioMixer, e gerenciamento de inventário em grade tipo Tetris.',
  },
  {
    title: 'Top-Down Roguelike com Geração Procedimental',
    genre: 'Roguelike / Arcade',
    camera: 'Top-Down Isométrico',
    pipeline: 'Universal RP (URP)',
    input: 'New Input System',
    idea: 'Salas geradas proceduralmente com algoritmo BSP, centenas de projéteis otimizados com Object Pooling, drops de itens com sinergia e morte permanente com save seguro.',
  },
];

export const UnityArchitectView: React.FC<UnityArchitectViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
  onNavigateToProjects,
}) => {
  const [gameIdea, setGameIdea] = useState('');
  const [genre, setGenre] = useState('RPG / Ação');
  const [targetPlatform, setTargetPlatform] = useState('PC / Standalone');
  const [cameraType, setCameraType] = useState('Terceira Pessoa');
  const [renderPipeline, setRenderPipeline] = useState('Universal RP (URP)');
  const [inputSystem, setInputSystem] = useState('New Input System');

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<UnityArchitectPlan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'folders' | 'components' | 'stages'>('overview');

  const handleGeneratePlan = async () => {
    if (!gameIdea.trim()) {
      showToast('error', 'Descreva a visão ou ideia do seu jogo Unity.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/unity/architect-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameIdea,
          genre,
          targetPlatform,
          cameraType,
          renderPipeline,
          inputSystem,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Falha ao planejar arquitetura Unity.');
      }

      const data: UnityArchitectPlan = await res.json();
      setPlan(data);
      onLogActivity('unity', `Unity Architect: ${data.title || genre}`, 'Plano técnico gerado');
      showToast('success', 'Arquitetura técnica da Unity gerada com sucesso!');
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao gerar o plano arquitetural.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTemplate = (tmpl: typeof UNITY_TEMPLATES[0]) => {
    setGameIdea(tmpl.idea);
    setGenre(tmpl.genre);
    setCameraType(tmpl.camera);
    setRenderPipeline(tmpl.pipeline);
    setInputSystem(tmpl.input);
    showToast('info', `Template "${tmpl.title}" aplicado!`);
  };

  const handleCreateUnityProjectFromPlan = () => {
    if (!plan) return;

    const initialFiles = plan.componentsBreakdown.map((c, idx) => ({
      id: `ufile-arch-${idx + 1}-${Date.now()}`,
      name: c.name.endsWith('.cs') ? c.name : `${c.name}.cs`,
      scriptType: c.scriptType,
      assetsPath: c.assetsPath.endsWith('/') ? c.assetsPath : `${c.assetsPath}/`,
      summary: c.responsibility,
      requiredComponents: c.dependencies || [],
      code: `using UnityEngine;

namespace ${plan.title.replace(/[^a-zA-Z0-9]/g, '') || 'MyGame'}
{
    /// <summary>
    /// ${c.responsibility}
    /// Dependências: ${c.dependencies?.join(', ') || 'Nenhuma'}
    /// </summary>
    public class ${c.name.replace('.cs', '')} : ${c.scriptType === 'MonoBehaviour' ? 'MonoBehaviour' : c.scriptType === 'ScriptableObject' ? 'ScriptableObject' : 'System.Object'}
    {
        // TODO: Implementar lógica de acordo com o plano do Project Architect
    }
}
`,
    }));

    const newProject: UnityProject = {
      id: `uproj-arch-${Date.now()}`,
      name: plan.title || 'Novo Jogo Unity',
      description: plan.summary.conceptOverview.slice(0, 200),
      unityVersion: plan.summary.recommendedUnityVersion || 'Unity 2022.3 LTS+',
      targetPlatform,
      renderPipeline,
      inputSystem,
      genre,
      files: initialFiles,
      architectPlan: plan,
      versions: [
        {
          versionId: `v-1-${Date.now()}`,
          versionNumber: '1.0.0',
          timestamp: new Date().toISOString(),
          changelog: 'Projeto inicial montado automaticamente pelo Project Architect Unity.',
          files: initialFiles,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveUnityProject(newProject);
    showToast('success', `Projeto Unity "${newProject.name}" criado com ${initialFiles.length} scripts no Gerenciador!`);
    if (onNavigateToProjects) {
      onNavigateToProjects();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#191C28] to-[#12141D] border border-[#292C3B] p-6 overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-xs text-[#A995FF] font-medium">
              <Box className="w-3.5 h-3.5" />
              <span>Unity Project Architect</span>
              <span className="text-emerald-400 font-semibold">• Planejamento Técnico C#</span>
            </div>
            <h2 className="text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Arquiteto de Projetos & Sistemas Unity
            </h2>
            <p className="text-xs text-[#9699AC] leading-relaxed">
              Transforme a ideia do seu jogo em um plano de engenharia de software para Unity: estrutura de pastas em <code className="text-[#A995FF]">Assets/</code>, desacoplamento com ScriptableObjects, mitigação de riscos de performance (Garbage Collector e Draw Calls) e fases de produção.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {plan && onNavigateToProjects && (
              <button
                onClick={handleCreateUnityProjectFromPlan}
                className="px-4 py-2.5 rounded-xl bg-[#8065F5] hover:bg-[#A995FF] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#8065F5]/20 transition-colors"
              >
                <FolderTree className="w-4 h-4" />
                <span>Criar Projeto no Gerenciador</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Input Configuration Grid */}
      <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-xs font-semibold text-[#F5F5FA] block mb-1">
            Visão Geral / Ideia do Jogo Unity *
          </label>
          <textarea
            rows={3}
            value={gameIdea}
            onChange={(e) => setGameIdea(e.target.value)}
            placeholder="Ex: Um RPG de ação roguelike onde o jogador enfrenta hordas em masmorras procedurais, coleta armas com atributos variáveis em ScriptableObjects e destrava habilidades em uma árvore de talentos..."
            className="w-full px-3.5 py-2.5 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5] transition-colors resize-y"
          />
        </div>

        {/* Templates Quick Load */}
        <div>
          <span className="text-[11px] font-semibold text-[#6C7086] uppercase tracking-wider block mb-2">
            Modelos de Jogos Frequentes:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {UNITY_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-3 text-left rounded-xl bg-[#191C28]/80 hover:bg-[#8065F5]/10 border border-[#292C3B] hover:border-[#8065F5]/40 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5F5FA] group-hover:text-[#A995FF]">
                    {tmpl.title}
                  </span>
                  <span className="text-[10px] text-[#8065F5] font-mono">{tmpl.genre}</span>
                </div>
                <p className="text-[11px] text-[#9699AC] line-clamp-2 mt-1">{tmpl.idea}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Architecture Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-[#292C3B]">
          <div>
            <label className="text-[11px] text-[#9699AC] block mb-1">Gênero</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="RPG / Ação">RPG / Ação</option>
              <option value="Shooter / FPS / TPS">Shooter / FPS / TPS</option>
              <option value="Plataforma 2D / Metroidvania">Plataforma 2D</option>
              <option value="Sobrevivência / Crafting">Sobrevivência / Crafting</option>
              <option value="Simulador / Tycoon">Simulador / Tycoon</option>
              <option value="Corrida / Veículos">Corrida / Veículos</option>
              <option value="Quebra-cabeça / Lógica">Quebra-cabeça</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#9699AC] block mb-1">Plataforma</label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="PC / Standalone">PC / Standalone</option>
              <option value="Mobile (Android / iOS)">Mobile (Android / iOS)</option>
              <option value="Console (PS5 / Xbox)">Console</option>
              <option value="WebGL / Browser">WebGL / Browser</option>
              <option value="VR / XR">VR / XR</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#9699AC] block mb-1">Câmera</label>
            <select
              value={cameraType}
              onChange={(e) => setCameraType(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Terceira Pessoa (Cinemachine)">3ª Pessoa (Cinemachine)</option>
              <option value="Primeira Pessoa">1ª Pessoa (FPS)</option>
              <option value="Top-Down Isométrico">Top-Down Isométrico</option>
              <option value="2D Side-Scroller">2D Side-Scroller</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#9699AC] block mb-1">Render Pipeline</label>
            <select
              value={renderPipeline}
              onChange={(e) => setRenderPipeline(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Universal RP (URP)">Universal RP (URP)</option>
              <option value="High Definition RP (HDRP)">HDRP</option>
              <option value="Built-in Render Pipeline">Built-in</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#9699AC] block mb-1">Input System</label>
            <select
              value={inputSystem}
              onChange={(e) => setInputSystem(e.target.value)}
              className="w-full px-2.5 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="New Input System">New Input System</option>
              <option value="Legacy Input Manager">Legacy Input</option>
              <option value="Both (Híbrido)">Híbrido</option>
            </select>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#8065F5] hover:bg-[#A995FF] disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#8065F5]/25 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analisando e Arquitetando Jogo Unity...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Plano Arquitetural Completo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Plan Results View */}
      {plan && (
        <div className="space-y-6">
          {/* Plan Header Card */}
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30">
                  {plan.summary.recommendedUnityVersion || 'Unity 2022.3 LTS+'}
                </span>
                <h3 className="text-xl font-bold text-[#F5F5FA] mt-1.5">{plan.title}</h3>
                <p className="text-xs text-[#9699AC] mt-1 leading-relaxed">
                  {plan.summary.conceptOverview}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateUnityProjectFromPlan}
                  className="px-4 py-2 rounded-xl bg-[#8065F5] hover:bg-[#A995FF] text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-md shadow-[#8065F5]/20"
                >
                  <FolderTree className="w-4 h-4" />
                  <span>Criar Projeto Unity</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-t border-[#292C3B] pt-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-[#8065F5] text-white'
                    : 'bg-[#191C28] text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Visão Geral & Riscos</span>
              </button>

              <button
                onClick={() => setActiveTab('folders')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'folders'
                    ? 'bg-[#8065F5] text-white'
                    : 'bg-[#191C28] text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>Pastas Assets/ ({plan.assetsFolderHierarchy.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('components')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'components'
                    ? 'bg-[#8065F5] text-white'
                    : 'bg-[#191C28] text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Componentes C# ({plan.componentsBreakdown.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('stages')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'stages'
                    ? 'bg-[#8065F5] text-white'
                    : 'bg-[#191C28] text-[#9699AC] hover:text-[#F5F5FA]'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Fases de Produção ({plan.developmentStages.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Mecânicas Principais (Core Loop)</h4>
                </div>
                <ul className="space-y-2">
                  {plan.summary.coreMechanics.map((mec, i) => (
                    <li key={i} className="text-xs text-[#9699AC] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{mec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <ShieldAlert className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Riscos Técnicos na Unity</h4>
                </div>
                <ul className="space-y-2">
                  {plan.summary.technicalRisks.map((risk, i) => (
                    <li key={i} className="text-xs text-[#9699AC] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: FOLDER HIERARCHY */}
          {activeTab === 'folders' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.assetsFolderHierarchy.map((folderItem, idx) => (
                <div
                  key={idx}
                  className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-4 space-y-2.5"
                >
                  <div className="flex items-center gap-2 font-mono text-xs text-[#A995FF]">
                    <Folder className="w-4 h-4 text-[#8065F5]" />
                    <span className="font-bold">{folderItem.folder}</span>
                  </div>
                  <p className="text-[11px] text-[#9699AC]">{folderItem.description}</p>

                  <div className="space-y-1 pt-1.5 border-t border-[#292C3B]/60">
                    <span className="text-[10px] text-[#6C7086] font-semibold uppercase block">
                      Arquivos recomendados:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {folderItem.suggestedFiles.map((sf, sidx) => (
                        <span
                          key={sidx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#191C28] text-[#F5F5FA] border border-[#292C3B]"
                        >
                          {sf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: COMPONENTS BREAKDOWN */}
          {activeTab === 'components' && (
            <div className="space-y-3">
              {plan.componentsBreakdown.map((comp, idx) => (
                <div
                  key={idx}
                  className="bg-[#12141D] border border-[#292C3B] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#8065F5]" />
                      <h4 className="text-xs font-bold text-[#F5F5FA] font-mono">{comp.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#8065F5]/15 text-[#A995FF] border border-[#8065F5]/30">
                        {comp.scriptType}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9699AC]">{comp.responsibility}</p>
                    <span className="text-[10px] font-mono text-[#6C7086]">
                      Local: {comp.assetsPath}
                    </span>
                  </div>

                  {comp.dependencies && comp.dependencies.length > 0 && (
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-[#6C7086] block mb-1">Dependências:</span>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {comp.dependencies.map((dep, didx) => (
                          <span
                            key={didx}
                            className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#191C28] text-[#9699AC] border border-[#292C3B]"
                          >
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: PRODUCTION STAGES */}
          {activeTab === 'stages' && (
            <div className="space-y-4">
              {plan.developmentStages.map((stage) => (
                <div
                  key={stage.stageNumber}
                  className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#8065F5] text-white text-xs font-bold flex items-center justify-center">
                        {stage.stageNumber}
                      </span>
                      <h4 className="text-sm font-bold text-[#F5F5FA]">{stage.stageName}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-[#9699AC]">{stage.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#292C3B]/60 text-xs">
                    <div>
                      <span className="text-[10px] text-[#6C7086] uppercase font-semibold block mb-1">
                        Sistemas a construir nesta fase:
                      </span>
                      <ul className="space-y-1">
                        {stage.systemsIncluded.map((sys, sidx) => (
                          <li key={sidx} className="text-[#A995FF] flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#8065F5]" />
                            <span>{sys}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#6C7086] uppercase font-semibold block mb-1">
                        Pré-requisitos:
                      </span>
                      <ul className="space-y-1">
                        {stage.prerequisites.map((pre, pidx) => (
                          <li key={pidx} className="text-[#9699AC] flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span>{pre}</span>
                          </li>
                        ))}
                      </ul>
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
