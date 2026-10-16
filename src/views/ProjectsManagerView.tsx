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
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {
  CodeForgeProject,
  ProjectVersion,
  ScriptFile,
  UserPreferences,
} from '../types/codeforge';
import {
  getProjects,
  saveProject,
  removeProject,
  createProjectVersion,
  exportProjectToZip,
  exportProjectToJson,
} from '../utils/storage';
import { CodeViewer } from '../components/CodeViewer';

interface ProjectsManagerViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  onNavigateToArchitect?: () => void;
}

export const ProjectsManagerView: React.FC<ProjectsManagerViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
  onNavigateToArchitect,
}) => {
  const [projects, setProjects] = useState<CodeForgeProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // New Project Modal State
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectGenre, setNewProjectGenre] = useState('RPG / Ação');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // New Version Modal State
  const [isCreatingVersion, setIsCreatingVersion] = useState(false);
  const [versionChangelog, setVersionChangelog] = useState('');

  // New Script Modal inside project
  const [isAddingScript, setIsAddingScript] = useState(false);
  const [newScriptName, setNewScriptName] = useState('');
  const [newScriptType, setNewScriptType] = useState<'Script' | 'LocalScript' | 'ModuleScript'>('Script');
  const [newScriptLocation, setNewScriptLocation] = useState('ServerScriptService');
  const [newScriptCode, setNewScriptCode] = useState('');

  // Selected file preview inside current project
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  // Active view tab inside project details
  const [projectTab, setProjectTab] = useState<'files' | 'versions' | 'architect'>('files');

  useEffect(() => {
    const list = getProjects();
    setProjects(list);
    if (list.length > 0 && !selectedProjectId) {
      setSelectedProjectId(list[0].id);
    }
  }, []);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      showToast('error', 'O nome do projeto é obrigatório.');
      return;
    }

    const newProj: CodeForgeProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'Projeto criado no CodeForge.',
      genre: newProjectGenre,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentVersion: 'v1.0',
      versions: [
        {
          versionId: `ver-${Date.now()}`,
          versionNumber: 'v1.0',
          timestamp: new Date().toISOString(),
          changelog: 'Criação do projeto no CodeForge.',
          files: [],
        },
      ],
      files: [],
    };

    const updated = saveProject(newProj);
    setProjects(updated);
    setSelectedProjectId(newProj.id);
    setIsCreatingProject(false);
    setNewProjectName('');
    setNewProjectDesc('');
    onLogActivity('projects', `Novo projeto: ${newProj.name}`);
    showToast('success', `Projeto "${newProj.name}" criado com sucesso!`);
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir o projeto "${name}"?`)) {
      const updated = removeProject(id);
      setProjects(updated);
      if (selectedProjectId === id) {
        setSelectedProjectId(updated[0]?.id || null);
      }
      showToast('info', 'Projeto excluído.');
    }
  };

  const handleCreateNewVersion = () => {
    if (!selectedProjectId) return;
    if (!versionChangelog.trim()) {
      showToast('error', 'Descreva o que mudou nesta nova versão.');
      return;
    }

    const updated = createProjectVersion(selectedProjectId, versionChangelog.trim());
    if (updated) {
      setProjects(getProjects());
      setIsCreatingVersion(false);
      setVersionChangelog('');
      showToast('success', `Nova versão ${updated.currentVersion} registrada!`);
    }
  };

  const handleAddScriptToProject = () => {
    if (!activeProject) return;
    if (!newScriptName.trim()) {
      showToast('error', 'Nome do script é obrigatório.');
      return;
    }

    const newFile: ScriptFile = {
      id: `file-${Date.now()}`,
      name: newScriptName.trim(),
      type: newScriptType,
      location: newScriptLocation,
      code: newScriptCode.trim() || '-- Novo script Luau\n',
    };

    const updatedProject: CodeForgeProject = {
      ...activeProject,
      files: [...activeProject.files, newFile],
      updatedAt: new Date().toISOString(),
    };

    const updatedList = saveProject(updatedProject);
    setProjects(updatedList);
    setIsAddingScript(false);
    setNewScriptName('');
    setNewScriptCode('');
    setSelectedFileId(newFile.id);
    showToast('success', `Script "${newFile.name}" adicionado ao projeto.`);
  };

  const handleDeleteScript = (fileId: string) => {
    if (!activeProject) return;
    const updatedProject: CodeForgeProject = {
      ...activeProject,
      files: activeProject.files.filter((f) => f.id !== fileId),
      updatedAt: new Date().toISOString(),
    };
    const updatedList = saveProject(updatedProject);
    setProjects(updatedList);
    if (selectedFileId === fileId) {
      setSelectedFileId(null);
    }
    showToast('info', 'Script removido do projeto.');
  };

  const handleExportZip = async () => {
    if (!activeProject) return;
    if (activeProject.files.length === 0) {
      showToast('warning', 'O projeto não possui scripts para exportar.');
      return;
    }
    try {
      await exportProjectToZip(activeProject.name, activeProject.files, {
        id: activeProject.id,
        name: activeProject.name,
        currentVersion: activeProject.currentVersion,
        createdAt: activeProject.createdAt,
      });
      showToast('success', 'Pacote ZIP com estrutura de pastas baixado com sucesso!');
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Falha ao gerar arquivo ZIP.');
    }
  };

  const handleExportJson = () => {
    if (!activeProject) return;
    exportProjectToJson(activeProject);
    showToast('success', 'Manifesto JSON exportado.');
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeFile = activeProject?.files.find((f) => f.id === selectedFileId) || activeProject?.files[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-[#A995FF] text-xs font-mono font-medium">
              <FolderArchive className="w-3.5 h-3.5" />
              <span>Gerenciador de Projetos & Versões</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Seus Jogos, Scripts e Histórico de Versões
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Agrupe múltiplos scripts Luau em projetos, registre releases com changelogs e exporte
              tudo em formato ZIP estruturado exatamente para o Explorer do Roblox Studio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingProject(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8065F5] to-[#9981f9] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#8065F5]/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Projeto</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Projects Sidebar + Project Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Projects List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-4 shadow-lg space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9699AC] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar projeto..."
                className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5]"
              />
            </div>

            <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
              {filteredProjects.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#9699AC] space-y-1">
                  <FolderArchive className="w-8 h-8 text-[#6C7086] mx-auto opacity-50" />
                  <p>Nenhum projeto encontrado.</p>
                </div>
              ) : (
                filteredProjects.map((proj) => {
                  const isSelected = proj.id === selectedProjectId;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setSelectedProjectId(proj.id);
                        setSelectedFileId(proj.files[0]?.id || null);
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-[#8065F5]/15 border-[#8065F5]/40 text-[#F5F5FA]'
                          : 'bg-[#0B0C12] border-[#292C3B] text-[#9699AC] hover:bg-[#191C28] hover:text-[#F5F5FA]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs truncate text-[#F5F5FA]">
                          {proj.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#191C28] text-[#A995FF] border border-[#292C3B]">
                          {proj.currentVersion}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#6C7086] mt-1.5">
                        <span>{proj.files.length} scripts</span>
                        <span>{proj.genre || 'Roblox'}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right: Selected Project Workspace */}
        <div className="lg:col-span-3 space-y-4">
          {activeProject ? (
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 shadow-xl space-y-6">
              {/* Project Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#292C3B] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#F5F5FA]">{activeProject.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30 font-mono">
                      {activeProject.currentVersion}
                    </span>
                    {activeProject.genre && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#191C28] text-[#9699AC] border border-[#292C3B]">
                        {activeProject.genre}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9699AC] mt-1">{activeProject.description}</p>
                </div>

                {/* Project Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportZip}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold shadow transition-all"
                    title="Exporta ZIP com pastas ServerScriptService, ReplicatedStorage, etc."
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Baixar ZIP (Studio)</span>
                  </button>

                  <button
                    onClick={handleExportJson}
                    className="p-1.5 rounded-xl bg-[#191C28] hover:bg-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] border border-[#292C3B]"
                    title="Exportar manifesto JSON"
                  >
                    JSON
                  </button>

                  <button
                    onClick={() => handleDeleteProject(activeProject.id, activeProject.name)}
                    className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                    title="Excluir projeto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center justify-between border-b border-[#292C3B] pb-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setProjectTab('files')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      projectTab === 'files'
                        ? 'bg-[#191C28] text-[#F5F5FA] border border-[#292C3B]'
                        : 'text-[#9699AC] hover:text-[#F5F5FA]'
                    }`}
                  >
                    Scripts ({activeProject.files.length})
                  </button>

                  <button
                    onClick={() => setProjectTab('versions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      projectTab === 'versions'
                        ? 'bg-[#191C28] text-[#F5F5FA] border border-[#292C3B]'
                        : 'text-[#9699AC] hover:text-[#F5F5FA]'
                    }`}
                  >
                    Histórico de Versões ({activeProject.versions?.length || 1})
                  </button>

                  {activeProject.architectPlan && (
                    <button
                      onClick={() => setProjectTab('architect')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        projectTab === 'architect'
                          ? 'bg-[#191C28] text-[#F5F5FA] border border-[#292C3B]'
                          : 'text-[#9699AC] hover:text-[#F5F5FA]'
                      }`}
                    >
                      Plano Architect Vinculado
                    </button>
                  )}
                </div>

                {projectTab === 'files' && (
                  <button
                    onClick={() => setIsAddingScript(true)}
                    className="flex items-center gap-1 text-xs text-[#A995FF] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Script</span>
                  </button>
                )}

                {projectTab === 'versions' && (
                  <button
                    onClick={() => setIsCreatingVersion(true)}
                    className="flex items-center gap-1 text-xs text-[#A995FF] hover:underline"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    <span>Nova Versão</span>
                  </button>
                )}
              </div>

              {/* TAB 1: FILES & SCRIPT VIEWER */}
              {projectTab === 'files' && (
                <div className="space-y-4">
                  {activeProject.files.length === 0 ? (
                    <div className="text-center py-12 bg-[#0B0C12] border border-[#292C3B] rounded-2xl space-y-3">
                      <FileCode className="w-8 h-8 text-[#6C7086] mx-auto opacity-50" />
                      <h4 className="text-sm font-semibold text-[#F5F5FA]">Nenhum script no projeto ainda</h4>
                      <p className="text-xs text-[#9699AC] max-w-sm mx-auto">
                        Gere scripts no AI Script Generator, construa no System Builder ou adicione manualmente.
                      </p>
                      <button
                        onClick={() => setIsAddingScript(true)}
                        className="px-4 py-2 rounded-xl bg-[#8065F5] text-white text-xs font-semibold"
                      >
                        Criar Primeiro Script
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* File selector list */}
                      <div className="md:col-span-1 space-y-2">
                        {activeProject.files.map((file) => {
                          const isCurFile = (activeFile?.id === file.id);
                          return (
                            <div
                              key={file.id}
                              onClick={() => setSelectedFileId(file.id)}
                              className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                                isCurFile
                                  ? 'bg-[#8065F5]/15 border-[#8065F5]/40 text-[#F5F5FA]'
                                  : 'bg-[#0B0C12] border-[#292C3B] text-[#9699AC] hover:bg-[#191C28]'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold truncate text-[#F5F5FA]">
                                  <FileCode className="w-3.5 h-3.5 text-[#8065F5] flex-shrink-0" />
                                  <span className="truncate">{file.name}</span>
                                </div>
                                <span className="text-[10px] text-[#6C7086] block font-mono truncate">
                                  {file.location}
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteScript(file.id);
                                }}
                                className="text-[#6C7086] hover:text-rose-400 p-1"
                                title="Excluir arquivo"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Code Viewer */}
                      <div className="md:col-span-2">
                        {activeFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-[#F5F5FA]">{activeFile.name}</span>
                              <span className="text-[11px] text-[#A995FF] font-mono">
                                {activeFile.location}
                              </span>
                            </div>
                            <CodeViewer
                              code={activeFile.code}
                              filename={activeFile.name}
                              scriptType={activeFile.type}
                              location={activeFile.location}
                              theme={preferences.editorTheme}
                              fontSize={preferences.fontSize}
                              onExplain={() => onExplainRequest(activeFile.code, activeFile.name)}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: VERSIONS & CHANGELOG */}
              {projectTab === 'versions' && (
                <div className="space-y-4">
                  {(activeProject.versions || []).map((ver) => (
                    <div
                      key={ver.versionId}
                      className="bg-[#0B0C12] border border-[#292C3B] rounded-2xl p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30">
                            {ver.versionNumber}
                          </span>
                          <span className="text-xs text-[#9699AC]">
                            {new Date(ver.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6C7086]">
                          {ver.files?.length || 0} arquivos salvos
                        </span>
                      </div>
                      <p className="text-xs text-[#F5F5FA]/90">{ver.changelog}</p>
                      {ver.notes && (
                        <p className="text-[11px] text-[#6C7086] font-mono bg-[#191C28] p-2 rounded">
                          {ver.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: ARCHITECT PLAN */}
              {projectTab === 'architect' && activeProject.architectPlan && (
                <div className="space-y-4">
                  <div className="bg-[#0B0C12] border border-[#292C3B] rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#F5F5FA]">
                        {activeProject.architectPlan.title}
                      </h4>
                      <span className="text-xs text-[#A995FF]">
                        {activeProject.architectPlan.plannedSystems.length} Sistemas Arquitetados
                      </span>
                    </div>
                    <p className="text-xs text-[#9699AC]">
                      {activeProject.architectPlan.summary.gameDescription}
                    </p>

                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-[#6C7086] uppercase tracking-wider block mb-2">
                        Sistemas Planejados:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {activeProject.architectPlan.plannedSystems.map((s) => (
                          <div
                            key={s.id}
                            className="p-2.5 rounded-xl bg-[#191C28] border border-[#292C3B] text-xs"
                          >
                            <span className="font-semibold text-[#F5F5FA] block">{s.name}</span>
                            <span className="text-[11px] text-[#9699AC]">{s.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-12 text-center space-y-3">
              <FolderArchive className="w-12 h-12 text-[#6C7086] mx-auto opacity-50" />
              <h3 className="text-base font-bold text-[#F5F5FA]">Nenhum projeto selecionado</h3>
              <p className="text-xs text-[#9699AC] max-w-sm mx-auto">
                Crie um novo projeto ou use o Project Architect para gerar uma arquitetura completa.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create Project */}
      {isCreatingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F5F5FA]">Criar Novo Projeto Roblox</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Nome do Jogo / Projeto</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ex: Shinobi Legends RPG"
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>

              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Gênero</label>
                <select
                  value={newProjectGenre}
                  onChange={(e) => setNewProjectGenre(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                >
                  <option value="Anime RPG">Anime RPG & Combate</option>
                  <option value="Simulador / Tycoon">Simulador / Tycoon</option>
                  <option value="Terror / Sobrevivência">Terror / Sobrevivência</option>
                  <option value="Obby / Plataforma">Obby / Plataforma</option>
                  <option value="FPS / PvP">FPS / PvP</option>
                </select>
              </div>

              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Descrição</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Breve resumo da premissa do jogo..."
                  rows={2}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#292C3B]">
              <button
                onClick={() => setIsCreatingProject(false)}
                className="px-3 py-1.5 rounded-xl bg-[#191C28] text-xs text-[#9699AC] hover:text-[#F5F5FA]"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-1.5 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold"
              >
                Criar Projeto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Version */}
      {isCreatingVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F5F5FA]">Registrar Nova Versão</h3>
            <p className="text-xs text-[#9699AC]">
              Gera um snapshot dos scripts atuais e incrementa o número da versão.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Changelog / O que mudou?</label>
                <textarea
                  value={versionChangelog}
                  onChange={(e) => setVersionChangelog(e.target.value)}
                  placeholder="Ex: Adicionado sistema de inventário com persistência em DataStore e correção de cooldown..."
                  rows={3}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#292C3B]">
              <button
                onClick={() => setIsCreatingVersion(false)}
                className="px-3 py-1.5 rounded-xl bg-[#191C28] text-xs text-[#9699AC] hover:text-[#F5F5FA]"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewVersion}
                className="px-4 py-1.5 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold"
              >
                Salvar Versão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Script */}
      {isAddingScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F5F5FA]">Adicionar Script ao Projeto</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Nome do Arquivo</label>
                <input
                  type="text"
                  value={newScriptName}
                  onChange={(e) => setNewScriptName(e.target.value)}
                  placeholder="Ex: CombatManager.server.luau"
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9699AC] font-medium mb-1">Tipo</label>
                  <select
                    value={newScriptType}
                    onChange={(e) => setNewScriptType(e.target.value as any)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  >
                    <option value="Script">Script (Server)</option>
                    <option value="LocalScript">LocalScript (Client)</option>
                    <option value="ModuleScript">ModuleScript</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#9699AC] font-medium mb-1">Localização no Explorer</label>
                  <select
                    value={newScriptLocation}
                    onChange={(e) => setNewScriptLocation(e.target.value)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  >
                    <option value="ServerScriptService">ServerScriptService</option>
                    <option value="ReplicatedStorage">ReplicatedStorage</option>
                    <option value="StarterPlayerScripts">StarterPlayerScripts</option>
                    <option value="StarterCharacterScripts">StarterCharacterScripts</option>
                    <option value="StarterGui">StarterGui</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Código Luau</label>
                <textarea
                  value={newScriptCode}
                  onChange={(e) => setNewScriptCode(e.target.value)}
                  placeholder="-- Cole o código do script aqui..."
                  rows={6}
                  className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#292C3B]">
              <button
                onClick={() => setIsAddingScript(false)}
                className="px-3 py-1.5 rounded-xl bg-[#191C28] text-xs text-[#9699AC] hover:text-[#F5F5FA]"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddScriptToProject}
                className="px-4 py-1.5 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
