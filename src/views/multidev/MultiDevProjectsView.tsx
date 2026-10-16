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
  Code2,
  Package,
} from 'lucide-react';
import { MultiDevProject } from '../../types/codeforge';
import {
  getMultiDevProjects,
  saveMultiDevProject,
  removeMultiDevProject,
  exportMultiDevProjectToZip,
  exportMultiDevProjectToJson,
  downloadCodeFile,
} from '../../utils/storage';
import { TECH_CATALOG, getTechById } from '../../data/techCatalog';

interface MultiDevProjectsViewProps {
  onOpenGenerator: (techId: string) => void;
}

export const MultiDevProjectsView: React.FC<MultiDevProjectsViewProps> = ({
  onOpenGenerator,
}) => {
  const [projects, setProjects] = useState<MultiDevProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<MultiDevProject | null>(null);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'source' | 'manifest'>('source');
  const [searchQuery, setSearchQuery] = useState('');
  const [techFilter, setTechFilter] = useState<string>('all');

  // New project modal
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectTechId, setNewProjectTechId] = useState('python-apps');
  const [newProjectPlatform, setNewProjectPlatform] = useState('Cross-platform');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const list = getMultiDevProjects();
    setProjects(list);
    if (list.length > 0 && !selectedProject) {
      setSelectedProject(list[0]);
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const tech = getTechById(newProjectTechId) || TECH_CATALOG[0];
    const initialFile = {
      name: `main${tech.defaultExtension}`,
      path: 'src',
      code: `// ${newProjectName} - Ponto de entrada\n// Gerado pelo CodeForge Multi-Dev\n`,
      language: tech.primaryLanguage,
    };

    const newProj: MultiDevProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || `Projeto ${tech.name}`,
      techId: tech.id,
      techName: tech.name,
      targetPlatform: newProjectPlatform,
      files: [initialFile],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveMultiDevProject(newProj);
    setProjects(updated);
    setSelectedProject(newProj);
    setIsCreating(false);
    setNewProjectName('');
    setNewProjectDesc('');
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja realmente excluir este projeto Multi-Dev?')) return;
    const updated = removeMultiDevProject(id);
    setProjects(updated);
    if (selectedProject?.id === id) {
      setSelectedProject(updated[0] || null);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTech = techFilter === 'all' || p.techId === techFilter;
    return matchesSearch && matchesTech;
  });

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <FolderArchive className="w-4 h-4" />
            <span>Workspace Multi-Dev</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Gerenciador de Projetos & Código
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Organize repositórios, baixe scripts individuais ou exporte pacotes completos em ZIP prontos para build.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Projeto Multi-Dev</span>
        </button>
      </div>

      {/* Main Layout: List Left, Viewer Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Project List Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar projetos..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <select
              value={techFilter}
              onChange={(e) => setTechFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">Todas as Tecnologias</option>
              {TECH_CATALOG.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredProjects.map((proj) => {
              const isSelected = selectedProject?.id === proj.id;
              const tech = getTechById(proj.techId);
              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    setSelectedProject(proj);
                    setSelectedFileIndex(0);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-purple-950/30 border-purple-500/50 ring-1 ring-purple-500/30 shadow-md'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-purple-400" />
                        {proj.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-1">{proj.description}</p>
                    </div>

                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className="p-1 text-zinc-500 hover:text-rose-400 rounded transition-colors"
                      title="Excluir projeto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/80">
                    <span className="font-mono text-purple-400">{proj.techName}</span>
                    <span>{proj.files.length} arquivo(s)</span>
                  </div>
                </div>
              );
            })}

            {filteredProjects.length === 0 && (
              <div className="p-8 text-center rounded-xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 text-xs">
                Nenhum projeto encontrado.
              </div>
            )}
          </div>
        </div>

        {/* Selected Project Details & File Viewer */}
        <div className="lg:col-span-8 space-y-6">
          {selectedProject ? (
            <div className="space-y-6">
              {/* Project Card Header */}
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <FolderArchive className="w-5 h-5 text-purple-400" />
                      {selectedProject.name}
                    </h2>
                    <p className="text-xs text-zinc-300 mt-1">{selectedProject.description}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
                        {selectedProject.techName}
                      </span>
                      <span>•</span>
                      <span>Plataforma: {selectedProject.targetPlatform}</span>
                      <span>•</span>
                      <span>Criado em: {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => exportMultiDevProjectToZip(selectedProject)}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar ZIP</span>
                    </button>
                    <button
                      onClick={() => exportMultiDevProjectToJson(selectedProject)}
                      className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700 flex items-center gap-1.5"
                    >
                      <span>Manifesto JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Files Viewer */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
                {/* Header with tabs */}
                <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    {selectedProject.files.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedFileIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                          selectedFileIndex === idx
                            ? 'bg-purple-600 text-white'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{file.name}</span>
                      </button>
                    ))}
                  </div>

                  {selectedProject.files[selectedFileIndex] && (
                    <button
                      onClick={() => {
                        const f = selectedProject.files[selectedFileIndex];
                        downloadCodeFile(f.name, f.code);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1 shrink-0 ml-2"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar Arquivo</span>
                    </button>
                  )}
                </div>

                {/* File Path Bar */}
                {selectedProject.files[selectedFileIndex] && (
                  <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/60 text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span>
                      Pasta: <span className="text-emerald-400">{selectedProject.files[selectedFileIndex].path || 'src'}/</span>
                    </span>
                    <span className="text-zinc-500 capitalize">
                      {selectedProject.files[selectedFileIndex].language}
                    </span>
                  </div>
                )}

                {/* Code body */}
                <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed text-zinc-200">
                  <pre>{selectedProject.files[selectedFileIndex]?.code || '// Arquivo sem conteúdo'}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 space-y-3">
              <FolderArchive className="w-12 h-12 mx-auto text-zinc-700" />
              <h3 className="text-base font-semibold text-zinc-300">Nenhum projeto selecionado</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Crie um novo projeto ou selecione um existente no painel esquerdo para visualizar os arquivos e exportar.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              Criar Novo Projeto Multi-Dev
            </h3>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-200">Nome do Projeto</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  required
                  placeholder="Ex: API-Auth-Python ou MeuGameGodot"
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-200">Descrição</label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  rows={3}
                  placeholder="Breve descrição dos objetivos..."
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-200">Tecnologia Base</label>
                <select
                  value={newProjectTechId}
                  onChange={(e) => setNewProjectTechId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {TECH_CATALOG.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-200">Plataforma-Alvo</label>
                <input
                  type="text"
                  value={newProjectPlatform}
                  onChange={(e) => setNewProjectPlatform(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md"
                >
                  Criar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
