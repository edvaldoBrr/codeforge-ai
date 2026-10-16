import React, { useState, useEffect } from 'react';
import {
  FolderArchive,
  Plus,
  Trash2,
  Download,
  Calendar,
  Layers,
  FileCode,
  Tag,
  GitBranch,
  History,
  Clock,
  Compass,
  CheckCircle2,
  FolderTree,
  Upload,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Box,
} from 'lucide-react';
import { UnityProject, UnityScriptFile, UserPreferences } from '../../types/codeforge';
import {
  getUnityProjects,
  saveUnityProject,
  removeUnityProject,
  exportUnityProjectToZip,
  exportUnityProjectToJson,
} from '../../utils/storage';
import { CodeViewer } from '../../components/CodeViewer';

interface UnityProjectsViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onNavigateToArchitect?: () => void;
}

export const UnityProjectsView: React.FC<UnityProjectsViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
  onNavigateToArchitect,
}) => {
  const [projects, setProjects] = useState<UnityProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  // New Project Form
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectVersion, setNewProjectVersion] = useState('Unity 2022.3 LTS+');
  const [newProjectPlatform, setNewProjectPlatform] = useState('PC / Standalone');
  const [newProjectPipeline, setNewProjectPipeline] = useState('Universal RP (URP)');
  const [newProjectInput, setNewProjectInput] = useState('New Input System');

  // New Script Modal
  const [isAddingScriptModal, setIsAddingScriptModal] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptPath, setNewScriptPath] = useState('Assets/Scripts/Managers/');
  const [newScriptType, setNewScriptType] = useState<'MonoBehaviour' | 'ScriptableObject' | 'StandardClass'>('MonoBehaviour');
  const [newScriptCode, setNewScriptCode] = useState('');

  useEffect(() => {
    const list = getUnityProjects();
    setProjects(list);
    if (list.length > 0 && !selectedProjectId) {
      setSelectedProjectId(list[0].id);
      if (list[0].files.length > 0) {
        setSelectedFileId(list[0].files[0].id);
      }
    }
  }, []);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const selectedFile = selectedProject?.files.find((f) => f.id === selectedFileId) || selectedProject?.files[0];

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      showToast('error', 'Nome do projeto Unity é obrigatório.');
      return;
    }

    const created: UnityProject = {
      id: `uproj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'Projeto Unity criado no CodeForge.',
      unityVersion: newProjectVersion,
      targetPlatform: newProjectPlatform,
      renderPipeline: newProjectPipeline,
      inputSystem: newProjectInput,
      files: [
        {
          id: `ufile-init-${Date.now()}`,
          name: 'GameBootstrapper.cs',
          scriptType: 'MonoBehaviour',
          assetsPath: 'Assets/Scripts/Core/',
          summary: 'Script inicializador de ciclo de vida e serviços persistentes.',
          requiredComponents: [],
          code: `using UnityEngine;

namespace ${newProjectName.replace(/[^a-zA-Z0-9]/g, '')}.Core
{
    [DefaultExecutionOrder(-100)]
    public class GameBootstrapper : MonoBehaviour
    {
        [Header("Configurações do Jogo")]
        [SerializeField] private bool target60Fps = true;
        [SerializeField] private bool runInBackground = false;

        private void Awake()
        {
            if (target60Fps)
            {
                Application.targetFrameRate = 60;
            }
            Application.runInBackground = runInBackground;
            DontDestroyOnLoad(gameObject);

            Debug.Log("[GameBootstrapper] Inicialização do jogo concluída.");
        }
    }
}`,
        },
      ],
      versions: [
        {
          versionId: `v-${Date.now()}`,
          versionNumber: '1.0.0',
          timestamp: new Date().toISOString(),
          changelog: 'Criação inicial do projeto Unity com GameBootstrapper.',
          files: [],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveUnityProject(created);
    setProjects(updated);
    setSelectedProjectId(created.id);
    setSelectedFileId(created.files[0].id);
    setIsCreatingModal(false);
    setNewProjectName('');
    setNewProjectDesc('');

    onLogActivity('unity', `Novo Projeto Unity: ${created.name}`, 'Projeto criado');
    showToast('success', `Projeto Unity "${created.name}" criado com sucesso!`);
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o projeto Unity "${name}"?`)) return;
    const updated = removeUnityProject(id);
    setProjects(updated);
    if (selectedProjectId === id) {
      if (updated.length > 0) {
        setSelectedProjectId(updated[0].id);
        setSelectedFileId(updated[0].files[0]?.id || null);
      } else {
        setSelectedProjectId(null);
        setSelectedFileId(null);
      }
    }
    showToast('info', `Projeto Unity "${name}" removido.`);
  };

  const handleExportZip = async (project: UnityProject) => {
    try {
      showToast('info', 'Gerando arquivo ZIP com estrutura de pastas Assets/Scripts/...');
      await exportUnityProjectToZip(project.name, project.files, {
        unityVersion: project.unityVersion,
        targetPlatform: project.targetPlatform,
        renderPipeline: project.renderPipeline,
        inputSystem: project.inputSystem,
      });
      showToast('success', 'Download do ZIP concluído com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('error', 'Erro ao gerar o pacote ZIP.');
    }
  };

  const handleExportJson = (project: UnityProject) => {
    exportUnityProjectToJson(project);
    showToast('success', 'Manifesto JSON do projeto exportado.');
  };

  const handleAddScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!newScriptName.trim()) {
      showToast('error', 'Nome do script C# é obrigatório.');
      return;
    }

    const safeName = newScriptName.endsWith('.cs') ? newScriptName : `${newScriptName}.cs`;
    const newFile: UnityScriptFile = {
      id: `ufile-${Date.now()}`,
      name: safeName,
      scriptType: newScriptType,
      assetsPath: newScriptPath.endsWith('/') ? newScriptPath : `${newScriptPath}/`,
      summary: 'Script criado manualmente no projeto Unity.',
      code:
        newScriptCode.trim() ||
        `using UnityEngine;

public class ${safeName.replace('.cs', '')} : ${newScriptType === 'MonoBehaviour' ? 'MonoBehaviour' : newScriptType === 'ScriptableObject' ? 'ScriptableObject' : 'System.Object'}
{
    // Adicione seus campos [SerializeField] e lógica aqui
}
`,
    };

    const updatedProject: UnityProject = {
      ...selectedProject,
      files: [...selectedProject.files, newFile],
      updatedAt: new Date().toISOString(),
    };

    const updatedList = saveUnityProject(updatedProject);
    setProjects(updatedList);
    setSelectedFileId(newFile.id);
    setIsAddingScriptModal(false);
    setNewScriptName('');
    setNewScriptCode('');
    showToast('success', `Script ${safeName} adicionado ao projeto.`);
  };

  const handleDeleteFile = (fileId: string, fileName: string) => {
    if (!selectedProject) return;
    if (selectedProject.files.length <= 1) {
      showToast('warning', 'O projeto precisa conter pelo menos um script.');
      return;
    }

    const remaining = selectedProject.files.filter((f) => f.id !== fileId);
    const updatedProject: UnityProject = {
      ...selectedProject,
      files: remaining,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = saveUnityProject(updatedProject);
    setProjects(updatedList);
    if (selectedFileId === fileId) {
      setSelectedFileId(remaining[0].id);
    }
    showToast('info', `Script ${fileName} removido do projeto.`);
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141D] border border-[#292C3B] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-[#8065F5]" />
            <h2 className="text-xl font-bold text-[#F5F5FA] tracking-tight">
              Gerenciador de Projetos Unity & Assets
            </h2>
          </div>
          <p className="text-xs text-[#9699AC] mt-1">
            Organize scripts C# em pastas padrão da Unity Engine, gerencie versões e exporte arquivos ZIP prontos para extrair em <code className="text-[#A995FF]">Assets/</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToArchitect && (
            <button
              onClick={onNavigateToArchitect}
              className="px-3.5 py-2 rounded-xl bg-[#191C28] hover:bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30 text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Project Architect</span>
            </button>
          )}

          <button
            onClick={() => setIsCreatingModal(true)}
            className="px-4 py-2 rounded-xl bg-[#8065F5] hover:bg-[#A995FF] text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-[#8065F5]/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto Unity</span>
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-[#292C3B] bg-[#12141D]/60 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#8065F5]/10 border border-[#8065F5]/20 flex items-center justify-center mx-auto text-[#A995FF]">
            <Box className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#F5F5FA]">Nenhum Projeto Unity Criado</h3>
            <p className="text-xs text-[#9699AC]">
              Crie seu primeiro projeto Unity para organizar scripts C#, planejar arquiteturas com ScriptableObjects e exportar pacotes ZIP completos.
            </p>
          </div>
          <button
            onClick={() => setIsCreatingModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#8065F5] hover:bg-[#A995FF] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-[#8065F5]/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeiro Projeto Unity</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Projects Sidebar List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#9699AC] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar projetos Unity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#12141D] border border-[#292C3B] rounded-xl text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5]"
              />
            </div>

            {/* Project Cards */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {filteredProjects.map((p) => {
                const isSelected = p.id === selectedProjectId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProjectId(p.id);
                      setSelectedFileId(p.files[0]?.id || null);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-[#191C28] border-[#8065F5] shadow-md shadow-[#8065F5]/10'
                        : 'bg-[#12141D] border-[#292C3B] hover:border-[#8065F5]/50 hover:bg-[#12141D]/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Box className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#A995FF]' : 'text-[#9699AC]'}`} />
                          <h4 className="text-xs font-bold text-[#F5F5FA] truncate">{p.name}</h4>
                        </div>
                        <p className="text-[11px] text-[#9699AC] line-clamp-1 mt-1">{p.description}</p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(p.id, p.name);
                        }}
                        className="text-[#9699AC] hover:text-rose-400 p-1 rounded-lg transition-colors"
                        title="Excluir projeto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#292C3B]/60 flex items-center justify-between text-[10px] text-[#9699AC]">
                      <span className="flex items-center gap-1 font-mono">
                        <FileCode className="w-3 h-3 text-[#A995FF]" />
                        {p.files.length} scripts
                      </span>
                      <span className="bg-[#8065F5]/10 text-[#A995FF] px-2 py-0.5 rounded-full border border-[#8065F5]/20">
                        {p.renderPipeline.includes('URP') ? 'URP' : 'Built-in'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Project Details & Script Inspector (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {selectedProject ? (
              <div className="space-y-4">
                {/* Project Banner & Actions */}
                <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30">
                          {selectedProject.unityVersion}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {selectedProject.targetPlatform}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#F5F5FA] mt-1">{selectedProject.name}</h3>
                      <p className="text-xs text-[#9699AC]">{selectedProject.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportZip(selectedProject)}
                        className="px-3 py-1.5 rounded-xl bg-[#8065F5]/20 hover:bg-[#8065F5]/30 text-[#A995FF] border border-[#8065F5]/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Baixar arquivo ZIP com toda a estrutura Assets/Scripts"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar ZIP (Assets)</span>
                      </button>

                      <button
                        onClick={() => handleExportJson(selectedProject)}
                        className="p-1.5 rounded-xl bg-[#191C28] hover:bg-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] border border-[#292C3B] transition-colors"
                        title="Exportar manifesto JSON"
                      >
                        <Upload className="w-3.5 h-3.5 rotate-180" />
                      </button>
                    </div>
                  </div>

                  {/* Tabs: Scripts in project */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#292C3B]">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                      {selectedProject.files.map((file) => {
                        const isTabActive = file.id === selectedFileId;
                        return (
                          <button
                            key={file.id}
                            onClick={() => setSelectedFileId(file.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 whitespace-nowrap transition-colors ${
                              isTabActive
                                ? 'bg-[#8065F5] text-white'
                                : 'bg-[#191C28] text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28]/80'
                            }`}
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>{file.name}</span>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setIsAddingScriptModal(true)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#191C28] hover:bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30 text-xs font-semibold flex items-center gap-1 whitespace-nowrap transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Script .cs</span>
                    </button>
                  </div>
                </div>

                {/* Script Code Viewer */}
                {selectedFile && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#9699AC] px-1">
                      <span className="font-mono text-[#A995FF]">
                        Caminho: <strong>{selectedFile.assetsPath}{selectedFile.name}</strong>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-[#191C28] px-2 py-0.5 rounded border border-[#292C3B]">
                          Tipo: {selectedFile.scriptType}
                        </span>
                        <button
                          onClick={() => handleDeleteFile(selectedFile.id, selectedFile.name)}
                          className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>

                    <CodeViewer
                      code={selectedFile.code}
                      filename={selectedFile.name}
                      scriptType={selectedFile.scriptType}
                      location={selectedFile.assetsPath}
                      theme={preferences.editorTheme}
                      fontSize={preferences.fontSize}
                      onExplain={() => onExplainRequest(selectedFile.code, `Script C# Unity: ${selectedFile.name}`)}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-8 text-center text-[#9699AC] text-xs">
                Selecione um projeto na lista lateral para visualizar scripts e arquivos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create New Unity Project */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#F5F5FA]">
              <Box className="w-5 h-5 text-[#8065F5]" />
              <h3 className="text-base font-bold">Criar Novo Projeto Unity</h3>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs text-[#9699AC] block mb-1">Nome do Jogo / Projeto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CyberSamurai, DungeonCrawler, StarOdyssey"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>

              <div>
                <label className="text-xs text-[#9699AC] block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Breve resumo da proposta e mecânicas..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9699AC] block mb-1">Versão Unity</label>
                  <select
                    value={newProjectVersion}
                    onChange={(e) => setNewProjectVersion(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  >
                    <option value="Unity 2022.3 LTS+">Unity 2022.3 LTS</option>
                    <option value="Unity 6 (6000.x)">Unity 6 (6000.x)</option>
                    <option value="Unity 2021.3 LTS">Unity 2021.3 LTS</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#9699AC] block mb-1">Render Pipeline</label>
                  <select
                    value={newProjectPipeline}
                    onChange={(e) => setNewProjectPipeline(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  >
                    <option value="Universal RP (URP)">Universal RP (URP)</option>
                    <option value="High Definition RP (HDRP)">HDRP</option>
                    <option value="Built-in Render Pipeline">Built-in</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292C3B]">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8065F5] hover:bg-[#A995FF] text-white text-xs font-semibold shadow-lg shadow-[#8065F5]/20 transition-colors"
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New C# Script */}
      {isAddingScriptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-[#F5F5FA]">
              <FileCode className="w-5 h-5 text-[#8065F5]" />
              <h3 className="text-base font-bold">Adicionar Script C# ao Projeto</h3>
            </div>

            <form onSubmit={handleAddScript} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#9699AC] block mb-1">Nome do Arquivo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: HealthSystem.cs"
                    value={newScriptName}
                    onChange={(e) => setNewScriptName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#9699AC] block mb-1">Tipo de Script</label>
                  <select
                    value={newScriptType}
                    onChange={(e) => setNewScriptType(e.target.value as any)}
                    className="w-full px-2 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  >
                    <option value="MonoBehaviour">MonoBehaviour (Componente)</option>
                    <option value="ScriptableObject">ScriptableObject (Dados)</option>
                    <option value="StandardClass">C# Class / Utility</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-[#9699AC] block mb-1">Pasta em Assets/</label>
                <input
                  type="text"
                  placeholder="Assets/Scripts/Managers/ ou Assets/Scripts/UI/"
                  value={newScriptPath}
                  onChange={(e) => setNewScriptPath(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>

              <div>
                <label className="text-xs text-[#9699AC] block mb-1">Código C# (opcional, ou deixe o template padrão)</label>
                <textarea
                  rows={6}
                  placeholder="// Cole seu código C# aqui ou deixe em branco para gerar o template"
                  value={newScriptCode}
                  onChange={(e) => setNewScriptCode(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-[#191C28] border border-[#292C3B] rounded-xl text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#292C3B]">
                <button
                  type="button"
                  onClick={() => setIsAddingScriptModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8065F5] hover:bg-[#A995FF] text-white text-xs font-semibold shadow-lg shadow-[#8065F5]/20 transition-colors"
                >
                  Salvar Script
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
