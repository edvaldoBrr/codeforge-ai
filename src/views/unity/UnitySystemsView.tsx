import React, { useState } from 'react';
import {
  Blocks,
  Sparkles,
  RefreshCw,
  FolderTree,
  ListOrdered,
  Sliders,
  FileCode,
  FolderArchive,
  CheckCircle2,
  Layers,
  ArrowRight,
  Info,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  UnitySystemResult,
  UnityScriptFile,
  UserPreferences,
  UnityProject,
} from '../../types/codeforge';
import { CodeViewer } from '../../components/CodeViewer';
import { getUnityProjects, saveUnityProject } from '../../utils/storage';

interface UnitySystemsViewProps {
  initialCategory?: string;
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SYSTEM_CATEGORIES = [
  {
    id: 'Inventory & Items',
    name: 'Inventário & Itens com ScriptableObjects',
    desc: 'Arquitetura com ItemData (ScriptableObject), InventoryManager central, InventorySlotUI e ItemPickup no mundo.',
  },
  {
    id: 'Combat & Abilities',
    name: 'Combate & Habilidades (Melee / Magias)',
    desc: 'PlayerCombat com combos, AbilityBase desacoplada, DamageHitbox com ITriggerable e Health com UnityEvents.',
  },
  {
    id: 'Enemy AI & FSM',
    name: 'Inteligência Artificial de Inimigos (NavMesh FSM)',
    desc: 'Máquina de estados finita (Patrol, Chase, Attack), NavMeshAgent, raio de visão e controlador de animações.',
  },
  {
    id: 'Dialogue & Quests',
    name: 'Diálogos de NPCs & Missões com Objetivos',
    desc: 'DialogueManager, árvore de diálogos em ScriptableObjects, QuestManager com objetivos e entrega de recompensas.',
  },
  {
    id: 'Save & Load System',
    name: 'Sistema de Salvamento (JSON & persistentDataPath)',
    desc: 'SaveManager com ISaveable, serialização em JSON com criptografia AES/XOR ou checksum HMAC anti-adulteração.',
  },
  {
    id: 'Audio Manager & Pooling',
    name: 'Gerenciador de Áudio com Object Pooling',
    desc: 'AudioManager singleton, pools de AudioSource para efeitos rápidos, fades de música e sliders de volume.',
  },
];

export const UnitySystemsView: React.FC<UnitySystemsViewProps> = ({
  initialCategory,
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || SYSTEM_CATEGORIES[0].id
  );
  const [systemTitle, setSystemTitle] = useState(
    SYSTEM_CATEGORIES[0].name
  );
  const [description, setDescription] = useState(
    SYSTEM_CATEGORIES[0].desc
  );
  const [unityVersion, setUnityVersion] = useState('Unity 2022.3 LTS+');
  const [architectureStyle, setArchitectureStyle] = useState('Component-Based com ScriptableObjects');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnitySystemResult | null>(null);
  const [activeFileIdx, setActiveFileIdx] = useState(0);

  // Save to project modal
  const [isSaving, setIsSaving] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState('NEW');
  const [newProjectName, setNewProjectName] = useState('');

  const handleCategorySelect = (cat: (typeof SYSTEM_CATEGORIES)[0]) => {
    setSelectedCategory(cat.id);
    setSystemTitle(cat.name);
    setDescription(cat.desc);
  };

  const handleGenerate = async () => {
    if (!systemTitle.trim() || !description.trim()) {
      showToast('error', 'Preencha o título e a descrição do sistema.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/unity/generate-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemTitle,
          category: selectedCategory,
          description,
          unityVersion,
          architectureStyle,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao gerar sistema Unity');
      }

      const data: UnitySystemResult = await res.json();
      setResult(data);
      setActiveFileIdx(0);
      onLogActivity('unity', `Sistema: ${data.title}`, `${data.files.length} scripts gerados`);
      showToast('success', `Sistema "${data.title}" arquitetado com ${data.files.length} scripts!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToProject = () => {
    if (!result) return;
    const projects = getUnityProjects();

    if (targetProjectId === 'NEW' || projects.length === 0) {
      if (!newProjectName.trim()) {
        showToast('error', 'Digite o nome do novo projeto Unity.');
        return;
      }
      const newProj: UnityProject = {
        id: `unity-proj-${Date.now()}`,
        name: newProjectName.trim(),
        description: result.summary,
        unityVersion,
        targetPlatform: 'PC / Standalone',
        renderPipeline: 'Universal RP (URP)',
        inputSystem: 'New Input System',
        genre: selectedCategory,
        files: result.files,
        versions: [
          {
            versionId: `ver-${Date.now()}`,
            versionNumber: 'v1.0',
            timestamp: new Date().toISOString(),
            changelog: `Criação do sistema ${result.title}`,
            files: result.files,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveUnityProject(newProj);
      showToast('success', `Projeto Unity "${newProj.name}" salvo com sucesso!`);
    } else {
      const proj = projects.find((p) => p.id === targetProjectId);
      if (proj) {
        const mergedFiles = [...proj.files];
        result.files.forEach((rf) => {
          const idx = mergedFiles.findIndex((f) => f.name === rf.name);
          if (idx >= 0) mergedFiles[idx] = rf;
          else mergedFiles.push(rf);
        });
        saveUnityProject({
          ...proj,
          files: mergedFiles,
          updatedAt: new Date().toISOString(),
        });
        showToast('success', `Sistema adicionado ao projeto "${proj.name}"!`);
      }
    }
    setIsSaving(false);
  };

  const activeFile = result?.files[activeFileIdx] || result?.files[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <Blocks className="w-3.5 h-3.5" />
              <span>Unity Multi-Script Systems</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Gerador de Sistemas Completos para Unity Engine
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Crie mecânicas integradas com múltiplos arquivos C# conectados, ScriptableObjects,
              guia de montagem de GameObjects na Hierarchy e mapa de conexões do Inspector.
            </p>
          </div>
        </div>
      </div>

      {/* Preset Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYSTEM_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#8065F5]/15 border-[#8065F5]/50 shadow-md shadow-[#8065F5]/10'
                  : 'bg-[#12141D] border-[#292C3B] hover:bg-[#191C28]'
              }`}
            >
              <div>
                <span className="font-bold text-xs text-[#F5F5FA] block mb-1">
                  {cat.name}
                </span>
                <p className="text-xs text-[#9699AC] leading-relaxed line-clamp-2">
                  {cat.desc}
                </p>
              </div>
              <span
                className={`text-[11px] font-semibold mt-3 flex items-center gap-1 ${
                  isSelected ? 'text-[#A995FF]' : 'text-[#6C7086]'
                }`}
              >
                <span>Selecionar Sistema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      {/* Configuration Form */}
      <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
              Nome do Sistema
            </label>
            <input
              type="text"
              value={systemTitle}
              onChange={(e) => setSystemTitle(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-4 py-2.5 text-sm text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
              Estilo de Arquitetura
            </label>
            <select
              value={architectureStyle}
              onChange={(e) => setArchitectureStyle(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-4 py-2.5 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Component-Based com ScriptableObjects">
                Modular com ScriptableObjects (Desacoplado)
              </option>
              <option value="State Machine (FSM / Interface)">
                State Machine (Interfaces & Estados)
              </option>
              <option value="Manager Centralizado com Events">
                Manager Centralizado com UnityEvents & Actions
              </option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
            Requisitos e Comportamento
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-4 py-3 text-sm text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
          />
        </div>

        <div className="flex justify-end pt-2 border-t border-[#292C3B]">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Planejando e Gerando Sistema...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Construir Sistema Completo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Result Output */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Header Summary */}
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F5F5FA]">{result.title}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  {result.files.length} Scripts C#
                </span>
              </div>
              <p className="text-xs text-[#9699AC] max-w-3xl">{result.architectureOverview}</p>
            </div>

            <button
              onClick={() => setIsSaving(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold shadow transition-all flex-shrink-0"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Salvar no Projeto</span>
            </button>
          </div>

          {/* Files Selector */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {result.files.map((file, idx) => (
              <button
                key={file.id}
                onClick={() => setActiveFileIdx(idx)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-2 flex-shrink-0 ${
                  activeFileIdx === idx
                    ? 'bg-[#8065F5]/20 text-[#F5F5FA] border-[#8065F5]/50 shadow-sm'
                    : 'bg-[#12141D] text-[#9699AC] border-[#292C3B] hover:text-[#F5F5FA]'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>{file.name}</span>
                <span className="text-[10px] text-[#6C7086] font-mono">({file.scriptType})</span>
              </button>
            ))}
          </div>

          {/* Active File Code */}
          {activeFile && (
            <div className="space-y-3">
              <div className="bg-[#12141D] border border-[#292C3B] rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-[#F5F5FA] mr-2">{activeFile.name}</span>
                  <span className="text-[#9699AC]">{activeFile.summary}</span>
                </div>
                <code className="font-mono text-[#A995FF] bg-[#0B0C12] px-2 py-0.5 rounded border border-[#292C3B]">
                  {activeFile.assetsPath}
                </code>
              </div>

              <CodeViewer
                code={activeFile.code}
                filename={activeFile.name}
                scriptType={activeFile.scriptType}
                location={activeFile.assetsPath}
                theme={preferences.editorTheme}
                fontSize={preferences.fontSize}
                onExplain={() => onExplainRequest(activeFile.code, activeFile.name)}
              />
            </div>
          )}

          {/* GameObjects to Create & Inspector Wiring Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* GameObjects in Hierarchy */}
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3 shadow-lg">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-400" />
                <span>GameObjects para Criar na Hierarchy</span>
              </h4>

              <div className="space-y-2">
                {result.gameObjectsToCreate.map((go, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0B0C12] border border-[#292C3B] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#F5F5FA]">{go.name}</span>
                      {go.parent && (
                        <span className="text-[11px] text-[#6C7086]">
                          Pai: {go.parent}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[#6C7086]">Componentes:</span>
                      {go.componentsToAdd.map((comp, ci) => (
                        <span
                          key={ci}
                          className="font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 text-[11px]"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                    {go.notes && <p className="text-[11px] text-[#9699AC] pt-1">{go.notes}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Inspector Wiring Map */}
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3 shadow-lg">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#A995FF]" />
                <span>Mapa de Conexões no Inspector</span>
              </h4>

              <div className="space-y-2">
                {result.inspectorWiring.map((wire, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0B0C12] border border-[#292C3B] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#A995FF]">{wire.scriptName}</span>
                      <span className="font-mono text-[11px] text-[#F5F5FA] bg-[#191C28] px-2 py-0.5 rounded border border-[#292C3B]">
                        Campo: {wire.fieldName}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9699AC]">
                      <span className="text-emerald-400 font-semibold">Arraste para o campo: </span>
                      {wire.targetToAssign}
                    </div>
                    <p className="text-[11px] text-[#6C7086]">{wire.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Modal */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F5F5FA]">Salvar Sistema no Projeto Unity</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Selecionar Projeto</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                >
                  <option value="NEW">+ Criar Novo Projeto Unity...</option>
                  {getUnityProjects().map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.files.length} scripts)
                    </option>
                  ))}
                </select>
              </div>

              {targetProjectId === 'NEW' || getUnityProjects().length === 0 ? (
                <div>
                  <label className="block text-[#9699AC] font-medium mb-1">Nome do Novo Projeto</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Ex: RPG Adventure Unity"
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#292C3B]">
              <button
                onClick={() => setIsSaving(false)}
                className="px-3 py-1.5 rounded-xl bg-[#191C28] text-xs text-[#9699AC] hover:text-[#F5F5FA]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveToProject}
                className="px-4 py-1.5 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold"
              >
                Salvar Sistema
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
