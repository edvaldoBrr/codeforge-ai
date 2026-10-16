import React, { useState } from 'react';
import {
  FolderTree,
  Sparkles,
  Layers,
  Terminal,
  FileCode,
  Download,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  FolderArchive,
  ChevronDown,
  Compass,
  Bookmark,
  CheckCircle2,
  Box,
} from 'lucide-react';
import { TECH_CATALOG, getTechById } from '../../data/techCatalog';
import { MultiDevScaffoldResult, MultiDevProject } from '../../types/codeforge';
import { saveMultiDevProject, exportMultiDevProjectToZip } from '../../utils/storage';

interface MultiDevArchitectViewProps {
  activeTechId: string;
  onSelectActiveTech: (techId: string) => void;
}

export const MultiDevArchitectView: React.FC<MultiDevArchitectViewProps> = ({
  activeTechId,
  onSelectActiveTech,
}) => {
  const currentTech = getTechById(activeTechId) || TECH_CATALOG[0];

  const [projectName, setProjectName] = useState('MeuSistemaMultiDev');
  const [description, setDescription] = useState(
    'Sistema modular completo com autenticação, banco de dados, APIs e testes integrados.'
  );
  const [targetPlatform, setTargetPlatform] = useState(currentTech.targetPlatform);
  const [featuresInput, setFeaturesInput] = useState(
    'Autenticação JWT, Conexão com Banco de Dados, Validação de Schemas, Testes Automatizados, Dockerfile'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiDevScaffoldResult | null>(null);

  const [activeFileTab, setActiveFileTab] = useState<'manifest' | 'source'>('manifest');
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleScaffold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !description.trim()) return;

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    const features = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      const response = await fetch('/api/multidev/scaffold-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techId: currentTech.id,
          techName: currentTech.name,
          projectName,
          description,
          targetPlatform,
          features,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao gerar scaffold do projeto.');
      }

      const data: MultiDevScaffoldResult = await response.json();
      setResult(data);
      setActiveFileIndex(0);
    } catch (err: any) {
      setError(err.message || 'Erro durante a criação da arquitetura.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurrentFile = () => {
    if (!result) return;
    const content =
      activeFileTab === 'manifest'
        ? result.manifestFiles[activeFileIndex]?.content
        : result.coreSourceFiles[activeFileIndex]?.code;
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleSaveToProjects = () => {
    if (!result) return;
    const project: MultiDevProject = {
      id: `proj-${Date.now()}`,
      name: result.projectName,
      description: result.architectureOverview,
      techId: currentTech.id,
      techName: currentTech.name,
      targetPlatform,
      files: result.coreSourceFiles.map((sf) => ({
        name: sf.filename,
        path: sf.path,
        code: sf.code,
        language: currentTech.primaryLanguage,
      })),
      manifestFiles: result.manifestFiles.map((mf) => ({
        filename: mf.filename,
        path: mf.path,
        content: mf.content,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveMultiDevProject(project);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportZip = async () => {
    if (!result) return;
    setDownloadingZip(true);
    try {
      const dummyProj: MultiDevProject = {
        id: `zip-${Date.now()}`,
        name: result.projectName,
        description: result.architectureOverview,
        techId: currentTech.id,
        techName: currentTech.name,
        targetPlatform,
        files: result.coreSourceFiles.map((sf) => ({
          name: sf.filename,
          path: sf.path,
          code: sf.code,
          language: currentTech.primaryLanguage,
        })),
        manifestFiles: result.manifestFiles.map((mf) => ({
          filename: mf.filename,
          path: mf.path,
          content: mf.content,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await exportMultiDevProjectToZip(dummyProj);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Arquiteto & Scaffold de Projetos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Planejamento Arquitetural & Scaffold
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Gere a estrutura completa de pastas, arquivos de manifesto (package.json, Cargo.toml, go.mod) e código inicial para {currentTech.name}.
          </p>
        </div>

        {/* Tech Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 whitespace-nowrap">Ambiente:</label>
          <div className="relative">
            <select
              value={currentTech.id}
              onChange={(e) => onSelectActiveTech(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-medium text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              {TECH_CATALOG.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Scaffold Parameters */}
        <div className="lg:col-span-5 space-y-5 bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <form onSubmit={handleScaffold} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Nome do Projeto <span className="text-sky-400">*</span>
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Descrição e Escopo do Sistema <span className="text-sky-400">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                placeholder="Descreva a finalidade, módulos e requisitos de infraestrutura..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Funcionalidades Planejadas (separadas por vírgula)
              </label>
              <textarea
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                rows={3}
                placeholder="Ex: Auth, Cache Redis, Swagger API Docs, Testes E2E"
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-200">
                Plataforma-Alvo
              </label>
              <input
                type="text"
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !projectName.trim() || !description.trim()}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Construindo arquitetura...</span>
                </>
              ) : (
                <>
                  <FolderTree className="w-4 h-4" />
                  <span>Gerar Scaffold & Arquitetura</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Output: Architecture Overview, Folders, Manifests, Source Files */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro no scaffold:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 space-y-3">
              <Layers className="w-12 h-12 mx-auto text-zinc-700" />
              <h3 className="text-base font-semibold text-zinc-300">Pronto para criar scaffold</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Defina o nome e a ideia do projeto para gerar a árvore completa de diretórios, manifests de pacotes e arquivos de inicialização.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center text-sky-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">
                Projetando arquitetura e gerando manifests...
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Montando hierarquia de pastas, dependências e padrões limpos para {currentTech.name}.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Architecture Blueprint Card */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FolderTree className="w-4 h-4 text-sky-400" />
                      {result.projectName} — Arquitetura
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">{result.architectureOverview}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleSaveToProjects}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        savedSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                      }`}
                    >
                      {savedSuccess ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5 text-purple-400" />}
                      <span>{savedSuccess ? 'Salvo!' : 'Salvar'}</span>
                    </button>
                    <button
                      onClick={handleExportZip}
                      disabled={downloadingZip}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-md"
                    >
                      {downloadingZip ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      <span>Exportar ZIP</span>
                    </button>
                  </div>
                </div>

                {/* Folder Hierarchy Visualizer */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                  <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                    Árvore de Diretórios Sugerida
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                    {result.folderHierarchy.map((fh, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-start gap-2"
                      >
                        <span className="text-sky-400 shrink-0">📁</span>
                        <div>
                          <span className="text-emerald-300 font-bold block">{fh.folder}</span>
                          <span className="text-[11px] text-zinc-400 font-sans">{fh.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manifests & Core Files Viewer */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
                {/* Tabs Selector: Manifest vs Source */}
                <div className="flex items-center justify-between bg-zinc-900/90 px-4 py-2 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveFileTab('manifest');
                        setActiveFileIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeFileTab === 'manifest'
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Manifests & Configs ({result.manifestFiles.length})
                    </button>
                    <button
                      onClick={() => {
                        setActiveFileTab('source');
                        setActiveFileIndex(0);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        activeFileTab === 'source'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Código-Fonte Inicial ({result.coreSourceFiles.length})
                    </button>
                  </div>

                  <button
                    onClick={handleCopyCurrentFile}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFile ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>

                {/* Subtabs for specific files */}
                <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto text-xs">
                  {activeFileTab === 'manifest'
                    ? result.manifestFiles.map((mf, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFileIndex(idx)}
                          className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                            activeFileIndex === idx
                              ? 'bg-zinc-800 text-sky-300 border border-zinc-700'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {mf.filename}
                        </button>
                      ))
                    : result.coreSourceFiles.map((sf, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveFileIndex(idx)}
                          className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                            activeFileIndex === idx
                              ? 'bg-zinc-800 text-purple-300 border border-zinc-700'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {sf.filename}
                        </button>
                      ))}
                </div>

                {/* Code Body */}
                <div className="p-4 overflow-x-auto max-h-[420px] overflow-y-auto font-mono text-xs leading-relaxed text-zinc-200">
                  <pre>
                    {activeFileTab === 'manifest'
                      ? result.manifestFiles[activeFileIndex]?.content
                      : result.coreSourceFiles[activeFileIndex]?.code}
                  </pre>
                </div>
              </div>

              {/* Commands & Recommended Libraries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-amber-400" />
                    Comandos de Setup & Execução
                  </h4>
                  <div className="space-y-1.5 font-mono text-xs">
                    {result.setupCommands.map((cmd, idx) => (
                      <div key={idx} className="p-2 rounded bg-zinc-950 text-amber-300 border border-zinc-800">
                        $ {cmd}
                      </div>
                    ))}
                    {result.runCommands.map((cmd, idx) => (
                      <div key={idx} className="p-2 rounded bg-zinc-950 text-emerald-300 border border-zinc-800">
                        $ {cmd}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-purple-400" />
                    Bibliotecas Recomendadas
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {result.recommendedLibraries.map((lib, idx) => (
                      <li key={idx} className="p-2 rounded bg-zinc-950 border border-zinc-800/80">
                        <span className="font-mono font-bold text-white text-xs">{lib.name}:</span>{' '}
                        <span className="text-zinc-400">{lib.purpose}</span>
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
