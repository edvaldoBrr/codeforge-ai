import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Sparkles,
  Code2,
  Copy,
  Check,
  Download,
  Terminal,
  FolderArchive,
  RefreshCw,
  AlertCircle,
  Bookmark,
  CheckCircle2,
  FileCode,
  Layers,
  ChevronDown,
  Play,
  HelpCircle,
  TestTube,
} from 'lucide-react';
import { TECH_CATALOG, getTechById } from '../../data/techCatalog';
import { TechDefinition, MultiDevGeneratedCode, MultiDevProject } from '../../types/codeforge';
import { downloadCodeFile, saveMultiDevProject } from '../../utils/storage';

interface MultiDevGeneratorViewProps {
  activeTechId: string;
  onSelectActiveTech: (techId: string) => void;
  prefillPrompt?: string;
  onClearPrefill?: () => void;
}

export const MultiDevGeneratorView: React.FC<MultiDevGeneratorViewProps> = ({
  activeTechId,
  onSelectActiveTech,
  prefillPrompt = '',
  onClearPrefill,
}) => {
  const currentTech = getTechById(activeTechId) || TECH_CATALOG[0];

  const [prompt, setPrompt] = useState(prefillPrompt || currentTech.samplePrompt);
  const [projectType, setProjectType] = useState(currentTech.projectType);
  const [targetPlatform, setTargetPlatform] = useState(currentTech.targetPlatform);
  const [includeTests, setIncludeTests] = useState(true);
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiDevGeneratedCode | null>(null);

  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedDepIndex, setCopiedDepIndex] = useState<number | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (prefillPrompt) {
      setPrompt(prefillPrompt);
      if (onClearPrefill) onClearPrefill();
    }
  }, [prefillPrompt]);

  const handleTechChange = (newTechId: string) => {
    onSelectActiveTech(newTechId);
    const tech = getTechById(newTechId);
    if (tech) {
      setProjectType(tech.projectType);
      setTargetPlatform(tech.targetPlatform);
      if (!prompt || prompt === currentTech.samplePrompt) {
        setPrompt(tech.samplePrompt);
      }
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const response = await fetch('/api/multidev/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techId: currentTech.id,
          techName: currentTech.name,
          primaryLanguage: currentTech.primaryLanguage,
          frameworkOrEngine: currentTech.frameworkOrEngine,
          targetPlatform,
          projectType,
          prompt,
          includeTests,
          additionalRequirements,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao gerar código.');
      }

      const data: MultiDevGeneratedCode = await response.json();
      setResult(data);
      setActiveFileIndex(0);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado na geração.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCurrentFile = () => {
    if (!result || !result.files[activeFileIndex]) return;
    navigator.clipboard.writeText(result.files[activeFileIndex].code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadCurrentFile = () => {
    if (!result || !result.files[activeFileIndex]) return;
    const file = result.files[activeFileIndex];
    downloadCodeFile(file.name, file.code);
  };

  const handleCopyDependency = (cmd: string, index: number) => {
    navigator.clipboard.writeText(cmd);
    setCopiedDepIndex(index);
    setTimeout(() => setCopiedDepIndex(null), 2000);
  };

  const handleSaveToProjects = () => {
    if (!result) return;
    const project: MultiDevProject = {
      id: `proj-${Date.now()}`,
      name: result.title,
      description: result.summary,
      techId: currentTech.id,
      techName: currentTech.name,
      targetPlatform,
      files: result.files.map((f) => ({
        name: f.name,
        path: f.path,
        code: f.code,
        language: f.language,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveMultiDevProject(project);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
            <Wand2 className="w-4 h-4" />
            <span>Gerador Inteligente Multi-Dev</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Geração de Código Adaptativo
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Produza scripts, serviços, classes e APIs de alta fidelidade para {currentTech.name}.
          </p>
        </div>

        {/* Tech Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-zinc-400 whitespace-nowrap">Tecnologia:</label>
          <div className="relative">
            <select
              value={currentTech.id}
              onChange={(e) => handleTechChange(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-medium text-white focus:outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              {TECH_CATALOG.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.defaultExtension})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Results Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Generator Controls Form */}
        <div className="lg:col-span-5 space-y-6 bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 shadow-xl">
          <form onSubmit={handleGenerate} className="space-y-5">
            {/* Requirement Prompt */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-200">
                O que você deseja construir? <span className="text-purple-400">*</span>
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                required
                placeholder={`Ex: ${currentTech.samplePrompt}`}
                className="w-full px-4 py-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-sans resize-y"
              />
              <div className="flex justify-between items-center text-[11px] text-zinc-500">
                <span>Dica: Seja específico sobre arquitetura, persistência e requisitos.</span>
                <button
                  type="button"
                  onClick={() => setPrompt(currentTech.samplePrompt)}
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Usar Exemplo
                </button>
              </div>
            </div>

            {/* Quick configuration parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Tipo de Projeto</label>
                <input
                  type="text"
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Plataforma-Alvo</label>
                <input
                  type="text"
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Additional requirements */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Requisitos Adicionais (opcional)
              </label>
              <input
                type="text"
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="Ex: sem dependências pesadas, alta concorrência, suporte a Docker"
                className="w-full px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Include unit tests toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={includeTests}
                onChange={(e) => setIncludeTests(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 text-purple-600 focus:ring-purple-500 bg-zinc-950"
              />
              <span className="text-xs text-zinc-300 select-none">
                Incluir snippet de testes unitários ou comandos de validação
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Construindo código para {currentTech.name}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Gerar Código Especializado</span>
                </>
              )}
            </button>
          </form>

          {/* Technology Info Card */}
          <div className="pt-4 border-t border-zinc-800/80 space-y-2 text-xs">
            <span className="font-semibold text-zinc-400 block uppercase tracking-wider text-[10px]">
              Perfil Técnico Aplicado
            </span>
            <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/60 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Framework/Engine:</span>
                <span className="text-zinc-200 font-medium">{currentTech.frameworkOrEngine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Extensão Padrão:</span>
                <span className="text-purple-400 font-mono">{currentTech.defaultExtension}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Pasta Sugerida:</span>
                <span className="text-emerald-400 font-mono text-[11px] truncate max-w-[200px]">
                  {currentTech.recommendedFolderStructure}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Output & Code Display */}
        <div className="lg:col-span-7 space-y-5">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro na geração:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 space-y-3">
              <Code2 className="w-12 h-12 mx-auto text-zinc-700" />
              <h3 className="text-base font-semibold text-zinc-300">Pronto para gerar código</h3>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Descreva sua funcionalidade ou use o exemplo padrão para gerar arquivos de código limpos, estruturados e compiláveis para {currentTech.name}.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">
                Analisando requisitos e compondo arquitetura...
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Aplicando convenções oficiais, tipagem rigorosa e boas práticas para {currentTech.name}.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-6">
              {/* Result Summary Bar */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      {result.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">{result.summary}</p>
                  </div>

                  {/* Save to Multi-Dev Project Button */}
                  <button
                    onClick={handleSaveToProjects}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                      savedSuccess
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
                    }`}
                  >
                    {savedSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvo em Projetos!</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                        <span>Salvar Projeto</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Key Patterns Badges */}
                {result.keyPatterns && result.keyPatterns.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/80 text-[11px]">
                    <span className="text-zinc-500 font-medium">Padrões Aplicados:</span>
                    {result.keyPatterns.map((pat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                      >
                        {pat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Files Container */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
                {/* File Tabs Header */}
                <div className="flex items-center justify-between bg-zinc-900/90 px-4 py-2.5 border-b border-zinc-800 overflow-x-auto">
                  <div className="flex items-center gap-1.5">
                    {result.files.map((file, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFileIndex(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium flex items-center gap-2 transition-all ${
                          activeFileIndex === idx
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>{file.name}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={handleCopyCurrentFile}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 px-2.5"
                      title="Copiar código"
                    >
                      {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFile ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      onClick={handleDownloadCurrentFile}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5 px-2.5"
                      title="Baixar arquivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </button>
                  </div>
                </div>

                {/* File Location Info */}
                {result.files[activeFileIndex] && (
                  <div className="px-4 py-2 bg-zinc-900/40 border-b border-zinc-800/60 text-xs font-mono text-zinc-400 flex items-center justify-between">
                    <span>
                      Caminho: <span className="text-emerald-400">{result.files[activeFileIndex].path}/{result.files[activeFileIndex].name}</span>
                    </span>
                    <span className="text-zinc-500 capitalize">{result.files[activeFileIndex].language}</span>
                  </div>
                )}

                {/* Code Body */}
                <div className="p-4 overflow-x-auto max-h-[500px] overflow-y-auto font-mono text-xs leading-relaxed text-zinc-200">
                  <pre>{result.files[activeFileIndex]?.code}</pre>
                </div>
              </div>

              {/* Dependencies & Setup Instructions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dependencies */}
                {result.packageDependencies && result.packageDependencies.length > 0 && (
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      Instalação de Dependências
                    </h4>
                    <div className="space-y-2">
                      {result.packageDependencies.map((dep, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 font-mono text-xs border border-zinc-800/80"
                        >
                          <span className="text-amber-300 truncate max-w-[220px]">{dep.command}</span>
                          <button
                            onClick={() => handleCopyDependency(dep.command, idx)}
                            className="p-1 text-zinc-400 hover:text-white"
                            title="Copiar comando"
                          >
                            {copiedDepIndex === idx ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Setup & Run */}
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                  <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Play className="w-3.5 h-3.5 text-emerald-400" />
                    Como Executar / Compilar
                  </h4>
                  <ul className="space-y-1.5 text-xs text-zinc-300">
                    {result.runInstructions.map((inst, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-mono">{idx + 1}.</span>
                        <span>{inst}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Test Snippet */}
              {result.testSnippet && (
                <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                      <TestTube className="w-3.5 h-3.5 text-sky-400" />
                      Teste Automatizado ({result.testSnippet.name})
                    </h4>
                    {result.testSnippet.runCommand && (
                      <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                        {result.testSnippet.runCommand}
                      </span>
                    )}
                  </div>
                  <pre className="p-3 bg-zinc-950 rounded-lg text-xs font-mono text-zinc-300 overflow-x-auto max-h-48">
                    {result.testSnippet.code}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
