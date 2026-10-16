import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Code2,
  Gamepad2,
  Globe,
  Cpu,
  Database,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Terminal,
  FileCode,
  ShieldCheck,
  FolderTree,
  Wand2,
  Bug,
  BookOpen,
} from 'lucide-react';
import { TECH_CATALOG, TECH_CATEGORIES, getTechById } from '../../data/techCatalog';
import { TechDefinition, TechCategory, NavPage } from '../../types/codeforge';

interface MultiDevHubViewProps {
  activeTechId: string;
  onSelectActiveTech: (techId: string) => void;
  onNavigate: (page: NavPage) => void;
  onPrefillGenerator?: (techId: string, promptText: string) => void;
}

export const MultiDevHubView: React.FC<MultiDevHubViewProps> = ({
  activeTechId,
  onSelectActiveTech,
  onNavigate,
  onPrefillGenerator,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TechCategory | 'all'>('all');
  const [selectedTechModal, setSelectedTechModal] = useState<TechDefinition | null>(null);

  const activeTech = getTechById(activeTechId) || TECH_CATALOG[0];

  const filteredTechs = TECH_CATALOG.filter((tech) => {
    const matchesCategory =
      selectedCategory === 'all' || tech.category === selectedCategory;
    const matchesSearch =
      tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.primaryLanguage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.frameworkOrEngine.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: TechCategory) => {
    switch (category) {
      case 'game':
        return <Gamepad2 className="w-4 h-4 text-sky-400" />;
      case 'web':
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'software':
        return <Cpu className="w-4 h-4 text-violet-400" />;
      case 'database':
        return <Database className="w-4 h-4 text-amber-400" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4 text-rose-400" />;
    }
  };

  const handleLaunchTool = (tool: 'generator' | 'analyzer' | 'architect' | 'quality', tech: TechDefinition) => {
    onSelectActiveTech(tech.id);
    setSelectedTechModal(null);
    if (tool === 'generator') {
      if (onPrefillGenerator) {
        onPrefillGenerator(tech.id, tech.samplePrompt);
      }
      onNavigate('multidev-generator');
    } else if (tool === 'analyzer') {
      onNavigate('multidev-analyzer');
    } else if (tool === 'architect') {
      onNavigate('multidev-architect');
    } else if (tool === 'quality') {
      onNavigate('multidev-quality');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-950/60 via-zinc-900 to-indigo-950/50 border border-purple-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ecossistema Multi-Dev CodeForge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Central Poliglota de Linguagens & Tecnologias
          </h1>
          <p className="mt-3 text-zinc-300 text-base leading-relaxed">
            Selecione uma linguagem, motor ou framework para carregar perfil técnico especializado, convenções oficiais, geradores de código, arquitetura e auditoria dedicados.
          </p>

          {/* Active tech indicator pill */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-sm shadow-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400 font-medium">Ambiente Ativo:</span>
              <span className="text-white font-semibold flex items-center gap-1.5">
                {getCategoryIcon(activeTech.category)}
                {activeTech.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                {activeTech.defaultExtension}
              </span>
            </div>

            <button
              onClick={() => onNavigate('multidev-generator')}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-all shadow-md hover:shadow-purple-500/20 flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              Abrir Gerador ({activeTech.primaryLanguage})
            </button>
            <button
              onClick={() => onNavigate('multidev-translator')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-all border border-zinc-700 flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" />
              Tradutor de Código
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/60 border border-zinc-700/50'
              }`}
            >
              Todas as Tecnologias ({TECH_CATALOG.length})
            </button>
            {TECH_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700/60 border border-zinc-700/50'
                }`}
              >
                {getCategoryIcon(cat.id)}
                <span>{cat.label}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-900/60 text-zinc-400">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar linguagem, engine, framework..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-700/80 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Technology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTechs.map((tech) => {
          const isActive = tech.id === activeTechId;
          return (
            <div
              key={tech.id}
              className={`group relative rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-purple-950/20 border-purple-500/50 ring-1 ring-purple-500/30 shadow-lg shadow-purple-950/20'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 shadow-md'
              }`}
            >
              <div>
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs shadow-inner"
                      style={{
                        backgroundColor: `${tech.accentColor}18`,
                        color: tech.accentColor,
                        border: `1px solid ${tech.accentColor}30`,
                      }}
                    >
                      {tech.defaultExtension}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                        {tech.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                        {getCategoryIcon(tech.category)}
                        <span>{tech.categoryLabel}</span>
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-medium text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" />
                      Ativo
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono">
                      {tech.techKind}
                    </span>
                  )}
                </div>

                <p className="text-zinc-300 text-xs leading-relaxed line-clamp-2 mt-2">
                  {tech.description}
                </p>

                {/* Tech Metadata Badges */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex flex-wrap gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700/60">
                    {tech.frameworkOrEngine}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-400 border border-zinc-700/60 font-mono">
                    {tech.targetPlatform}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 pt-3 border-t border-zinc-800/60 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedTechModal(tech)}
                  className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1 transition-colors py-1.5"
                >
                  <Layers className="w-3.5 h-3.5" />
                  Ver Perfil Técnico
                </button>

                <div className="flex items-center gap-1.5">
                  {!isActive && (
                    <button
                      onClick={() => onSelectActiveTech(tech.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700"
                    >
                      Ativar
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSelectActiveTech(tech.id);
                      if (onPrefillGenerator) {
                        onPrefillGenerator(tech.id, tech.samplePrompt);
                      }
                      onNavigate('multidev-generator');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <span>Usar</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTechs.length === 0 && (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-400">
          <Code2 className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
          <p className="text-base font-semibold text-zinc-300">Nenhuma tecnologia encontrada</p>
          <p className="text-xs text-zinc-500 mt-1">
            Tente pesquisar por outro termo ou selecione a categoria "Todas as Tecnologias".
          </p>
        </div>
      )}

      {/* Modal Profile Viewer */}
      {selectedTechModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-bold text-sm shadow-md"
                  style={{
                    backgroundColor: `${selectedTechModal.accentColor}20`,
                    color: selectedTechModal.accentColor,
                    border: `1px solid ${selectedTechModal.accentColor}40`,
                  }}
                >
                  {selectedTechModal.defaultExtension}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {selectedTechModal.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    {getCategoryIcon(selectedTechModal.category)}
                    <span>{selectedTechModal.categoryLabel}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedTechModal.techKind}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTechModal(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Description */}
            <p className="text-zinc-300 text-sm leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
              {selectedTechModal.description}
            </p>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 font-medium block">Linguagem Principal:</span>
                <span className="text-white font-semibold mt-0.5 block">{selectedTechModal.primaryLanguage}</span>
              </div>
              <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 font-medium block">Framework / Runtime / Engine:</span>
                <span className="text-white font-semibold mt-0.5 block">{selectedTechModal.frameworkOrEngine}</span>
              </div>
              <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 font-medium block">Versão Recomendada:</span>
                <span className="text-white font-semibold mt-0.5 block">{selectedTechModal.version}</span>
              </div>
              <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 font-medium block">Plataforma-Alvo:</span>
                <span className="text-white font-semibold mt-0.5 block">{selectedTechModal.targetPlatform}</span>
              </div>
            </div>

            {/* Conventions */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                Convenções & Boas Práticas
              </h4>
              <ul className="space-y-1.5 text-xs text-zinc-300 bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/80">
                {selectedTechModal.codeConventions.map((conv, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>{conv}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Folder Structure */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-sky-400" />
                Estrutura de Pastas Recomendada
              </h4>
              <div className="font-mono text-xs text-emerald-300 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                {selectedTechModal.recommendedFolderStructure}
              </div>
            </div>

            {/* CLI & Build Tools */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                Ferramentas de Compilação & Execução
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedTechModal.buildAndRunTools.map((tool, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Launch Buttons */}
            <div className="pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  onSelectActiveTech(selectedTechModal.id);
                  setSelectedTechModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors border border-zinc-700"
              >
                Definir como Tecnologia Padrão
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleLaunchTool('generator', selectedTechModal)}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Gerador
                </button>
                <button
                  onClick={() => handleLaunchTool('analyzer', selectedTechModal)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700 flex items-center gap-1.5"
                >
                  <Bug className="w-3.5 h-3.5" />
                  Depurar
                </button>
                <button
                  onClick={() => handleLaunchTool('architect', selectedTechModal)}
                  className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700 flex items-center gap-1.5"
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  Scaffold
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
