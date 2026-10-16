import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Search,
  Trash2,
  Download,
  Copy,
  Calendar,
  Layers,
  MapPin,
  ExternalLink,
  HelpCircle,
  FileDown,
  Info,
} from 'lucide-react';
import { FavoriteItem, ScriptFile, UserPreferences } from '../types/codeforge';
import { CodeViewer } from '../components/CodeViewer';
import { downloadLuaScript } from '../utils/storage';

interface FavoritesViewProps {
  favorites: FavoriteItem[];
  preferences?: UserPreferences;
  onRemoveFavorite: (id: string) => void;
  onExplainRequest: (code: string, context: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  preferences,
  onRemoveFavorite,
  onExplainRequest,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return favorites.filter((f) => {
      const q = searchQuery.toLowerCase();
      return (
        f.title.toLowerCase().includes(q) ||
        f.scriptType.toLowerCase().includes(q) ||
        f.location.toLowerCase().includes(q) ||
        (f.notes && f.notes.toLowerCase().includes(q))
      );
    });
  }, [favorites, searchQuery]);

  const handleCopyCode = async (code: string, title: string) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('success', `Código de "${title}" copiado!`);
    } catch {
      showToast('error', 'Falha ao copiar.');
    }
  };

  const handleDownload = (item: FavoriteItem) => {
    downloadLuaScript(`${item.title.replace(/\s+/g, '_')}.luau`, item.code);
    showToast('success', `Download de ${item.title}.luau iniciado.`);
  };

  const handleExportAll = () => {
    if (favorites.length === 0) return;
    const blob = new Blob([JSON.stringify(favorites, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CodeForge_Favoritos_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'Backup de favoritos exportado com sucesso!');
  };

  const confirmDelete = (id: string) => {
    onRemoveFavorite(id);
    setDeleteConfirmId(null);
    showToast('info', 'Item removido dos favoritos.');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#292C3B]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold uppercase tracking-wider mb-1">
            <Bookmark className="w-3.5 h-3.5" />
            Coleção Pessoal
          </div>
          <h2 className="text-xl font-bold text-[#F5F5FA]">Scripts Favoritos & Persistidos</h2>
          <p className="text-xs text-[#9699AC] mt-1">
            Seus scripts gerados, analisados ou selecionados na biblioteca, salvos diretamente no seu navegador.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handleExportAll}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#191C28] hover:bg-[#8065F5]/20 text-[#A995FF] border border-[#292C3B] hover:border-[#8065F5]/40 text-xs font-medium transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Exportar Backup JSON</span>
          </button>
        )}
      </div>

      {/* Storage privacy notice */}
      <div className="p-3.5 rounded-xl bg-[#0B0C12] border border-[#292C3B]/70 flex items-center justify-between gap-3 text-xs text-[#9699AC]">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[#8065F5] flex-shrink-0" />
          <span>
            Os favoritos são armazenados localmente no seu navegador (LocalStorage) e não são sincronizados na nuvem ou compartilhados.
          </span>
        </div>
        <span className="font-mono text-[11px] text-[#6C7086] whitespace-nowrap hidden sm:inline">
          {favorites.length} script(s) guardado(s)
        </span>
      </div>

      {/* Search Input */}
      {favorites.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-[#6C7086] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar entre seus scripts favoritos..."
            className="w-full bg-[#12141D] border border-[#292C3B] focus:border-[#8065F5] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none transition-colors"
          />
        </div>
      )}

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#191C28] border border-[#292C3B] flex items-center justify-center text-[#9699AC] mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-[#F5F5FA]">Nenhum favorito salvo ainda</h4>
          <p className="text-xs text-[#9699AC] max-w-sm mx-auto leading-relaxed">
            Ao gerar novos scripts no <strong>AI Script Generator</strong>, montar mecânicas no <strong>System Builder</strong> ou explorar a <strong>Script Library</strong>, clique no botão de salvar para guardá-los aqui.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-8 text-center text-xs text-[#9699AC]">
          Nenhum script corresponde ao termo pesquisado.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isExpanded = expandedId === item.id;
            const isConfirming = deleteConfirmId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-[#292C3B] bg-[#12141D] overflow-hidden transition-all shadow-lg"
              >
                {/* Header card */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 md:p-5 cursor-pointer hover:bg-[#191C28]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-[#F5F5FA] hover:text-[#A995FF] transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#8065F5]/10 text-[#A995FF] border border-[#8065F5]/20">
                        {item.scriptType}
                      </span>
                      {item.category && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#0B0C12] text-emerald-400 border border-emerald-500/20">
                          {item.category}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-xs text-[#9699AC] line-clamp-2 leading-relaxed">
                        {item.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#6C7086] font-mono">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#8065F5]" />
                        {item.location}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.files && item.files.length > 1 && (
                        <span className="text-[#A995FF]">
                          {item.files.length} arquivos no pacote
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 self-start md:self-center"
                  >
                    <button
                      onClick={() => handleCopyCode(item.code, item.title)}
                      className="p-2 rounded-xl bg-[#0B0C12] border border-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] hover:border-[#8065F5]/40 transition-colors"
                      title="Copiar código"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDownload(item)}
                      className="p-2 rounded-xl bg-[#0B0C12] border border-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] hover:border-[#8065F5]/40 transition-colors"
                      title="Baixar arquivo .lua"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Delete with confirm */}
                    {isConfirming ? (
                      <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 p-1 rounded-xl">
                        <button
                          onClick={() => confirmDelete(item.id)}
                          className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold rounded-lg transition-colors"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 text-[11px] text-[#9699AC] hover:text-[#F5F5FA]"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-2 rounded-xl bg-[#0B0C12] border border-[#292C3B] text-[#9699AC] hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded code viewer */}
                {isExpanded && (
                  <div className="border-t border-[#292C3B] p-4 bg-[#0B0C12]/50 space-y-3">
                    {item.files && item.files.length > 1 ? (
                      <div className="space-y-4">
                        <div className="text-xs font-semibold text-[#A995FF]">
                          Arquivos incluídos neste sistema:
                        </div>
                        {item.files.map((file, fIdx) => (
                          <div key={file.id || fIdx}>
                            <CodeViewer
                              code={file.code}
                              filename={file.name}
                              scriptType={file.type}
                              location={file.location}
                              fontSize={preferences?.fontSize}
                              theme={preferences?.editorTheme}
                              onCopyFeedback={() => showToast('success', `Código de ${file.name} copiado!`)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <CodeViewer
                        code={item.code}
                        filename={`${item.title}.luau`}
                        scriptType={item.scriptType}
                        location={item.location}
                        fontSize={preferences?.fontSize}
                        theme={preferences?.editorTheme}
                        onCopyFeedback={() => showToast('success', 'Código copiado!')}
                      />
                    )}
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
