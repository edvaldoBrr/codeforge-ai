import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  Copy,
  Download,
  MapPin,
  Sparkles,
  Layers,
  Wand2,
} from 'lucide-react';
import { INITIAL_LIBRARY_SNIPPETS } from '../data/libraryData';
import { LibrarySnippet, UserPreferences } from '../types/codeforge';
import { CodeViewer } from '../components/CodeViewer';
import { downloadLuaScript } from '../utils/storage';

interface ScriptLibraryViewProps {
  preferences?: UserPreferences;
  onSaveFavorite: (item: {
    title: string;
    scriptType: string;
    location: string;
    code: string;
    notes?: string;
    category?: string;
  }) => void;
  isFavorited: (title: string) => boolean;
  onOpenInGenerator: (snippet: LibrarySnippet) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const ScriptLibraryView: React.FC<ScriptLibraryViewProps> = ({
  preferences,
  onSaveFavorite,
  isFavorited,
  onOpenInGenerator,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expandedId, setExpandedId] = useState<string | null>(INITIAL_LIBRARY_SNIPPETS[0]?.id || null);

  const categories = ['All', 'Utilities', 'Movement', 'Networking', 'Data', 'Interface', 'Interaction'];
  const types = ['All', 'Script', 'LocalScript', 'ModuleScript'];

  const filteredSnippets = useMemo(() => {
    return INITIAL_LIBRARY_SNIPPETS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesType = selectedType === 'All' || item.type === selectedType;

      return matchesSearch && matchesCat && matchesType;
    }).sort((a, b) => {
      if (sortOrder === 'asc') return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
  }, [searchQuery, selectedCategory, selectedType, sortOrder]);

  const handleFavoriteClick = (snippet: LibrarySnippet) => {
    onSaveFavorite({
      title: snippet.name,
      scriptType: snippet.type,
      location: snippet.location,
      code: snippet.code,
      notes: snippet.description,
      category: snippet.category,
    });
    showToast('success', `"${snippet.name}" salvo nos favoritos!`);
  };

  const handleCopy = async (code: string, name: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('success', `Código de "${name}" copiado!`);
    } catch {
      showToast('error', 'Falha ao copiar.');
    }
  };

  const handleDownload = (snippet: LibrarySnippet) => {
    downloadLuaScript(`${snippet.name.replace(/\s+/g, '_')}.luau`, snippet.code);
    showToast('success', `Download de ${snippet.name}.luau iniciado.`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#292C3B]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#A995FF] font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            Biblioteca de Códigos Luau
          </div>
          <h2 className="text-xl font-bold text-[#F5F5FA]">Snippets e Módulos para Roblox Studio</h2>
          <p className="text-xs text-[#9699AC] mt-1">
            Coleção pronta para uso com boas práticas de performance, anti-exploit e arquitetura moderna de tarefas (task library).
          </p>
        </div>

        <div className="text-xs font-mono text-[#9699AC] bg-[#0B0C12] px-3 py-1.5 rounded-xl border border-[#292C3B]">
          Total: <span className="text-[#F5F5FA] font-bold">{INITIAL_LIBRARY_SNIPPETS.length}</span> módulos
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#12141D] border border-[#292C3B] space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#6C7086] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por nome, descrição, tags ou serviço (ex: TweenService, DataStore)..."
              className="w-full bg-[#0B0C12] border border-[#292C3B] focus:border-[#8065F5] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none"
            >
              <option value="All">Todos os Tipos</option>
              <option value="Script">Script (Server)</option>
              <option value="LocalScript">LocalScript (Client)</option>
              <option value="ModuleScript">ModuleScript</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0B0C12] border border-[#292C3B] text-xs text-[#9699AC] hover:text-[#F5F5FA] transition-colors whitespace-nowrap"
              title="Ordem alfabética"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === 'asc' ? 'A-Z' : 'Z-A'}</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <span className="text-xs text-[#6C7086] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Categoria:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${
                selectedCategory === cat
                  ? 'bg-[#8065F5] text-white border-[#8065F5]'
                  : 'bg-[#0B0C12] text-[#9699AC] border-[#292C3B] hover:text-[#F5F5FA]'
              }`}
            >
              {cat === 'All' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet List */}
      {filteredSnippets.length === 0 ? (
        <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-[#6C7086] mx-auto" />
          <h4 className="text-sm font-bold text-[#F5F5FA]">Nenhum exemplo encontrado</h4>
          <p className="text-xs text-[#9699AC]">
            Tente buscar com outro termo ou redefinir os filtros de categoria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedType('All');
            }}
            className="px-3 py-1.5 rounded-lg bg-[#191C28] text-xs text-[#A995FF] border border-[#292C3B] hover:border-[#8065F5]/40"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSnippets.map((snippet) => {
            const isExpanded = expandedId === snippet.id;
            const favorited = isFavorited(snippet.name);

            return (
              <div
                key={snippet.id}
                className="rounded-2xl border border-[#292C3B] bg-[#12141D] overflow-hidden transition-all shadow-lg"
              >
                {/* Header card summary */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : snippet.id)}
                  className="p-4 md:p-5 cursor-pointer hover:bg-[#191C28]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-bold text-[#F5F5FA] hover:text-[#A995FF] transition-colors">
                        {snippet.name}
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#8065F5]/10 text-[#A995FF] border border-[#8065F5]/20">
                        {snippet.type}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#0B0C12] text-emerald-400 border border-emerald-500/20">
                        {snippet.category}
                      </span>
                    </div>

                    <p className="text-xs text-[#9699AC] leading-relaxed">
                      {snippet.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#6C7086] font-mono">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8065F5]" />
                        {snippet.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        {snippet.tags.map((t) => (
                          <span key={t} className="text-[#9699AC]">
                            #{t}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 self-start md:self-center"
                  >
                    <button
                      onClick={() => handleFavoriteClick(snippet)}
                      className={`p-2 rounded-xl border transition-colors ${
                        favorited
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-[#0B0C12] text-[#9699AC] border-[#292C3B] hover:text-[#F5F5FA] hover:border-[#8065F5]/40'
                      }`}
                      title="Salvar nos Favoritos"
                    >
                      {favorited ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>

                    <button
                      onClick={() => handleCopy(snippet.code, snippet.name)}
                      className="p-2 rounded-xl bg-[#0B0C12] border border-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] hover:border-[#8065F5]/40 transition-colors"
                      title="Copiar código"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownload(snippet)}
                      className="p-2 rounded-xl bg-[#0B0C12] border border-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] hover:border-[#8065F5]/40 transition-colors"
                      title="Baixar arquivo .lua"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenInGenerator(snippet)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#8065F5]/15 text-[#A995FF] border border-[#8065F5]/30 hover:bg-[#8065F5] hover:text-white transition-all text-xs font-medium"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Usar no Gerador</span>
                    </button>
                  </div>
                </div>

                {/* Expanded Code & Explanation */}
                {isExpanded && (
                  <div className="border-t border-[#292C3B] p-4 bg-[#0B0C12]/50 space-y-3">
                    <CodeViewer
                      code={snippet.code}
                      filename={`${snippet.name}.luau`}
                      scriptType={snippet.type}
                      location={snippet.location}
                      fontSize={preferences?.fontSize}
                      theme={preferences?.editorTheme}
                      maxHeight="400px"
                      onCopyFeedback={() => showToast('success', 'Código copiado!')}
                    />

                    <div className="p-3.5 rounded-xl bg-[#12141D] border border-[#292C3B] text-xs text-[#9699AC] space-y-1">
                      <span className="font-semibold text-[#F5F5FA] block">
                        Por que usar esta implementação:
                      </span>
                      <p className="leading-relaxed">{snippet.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
