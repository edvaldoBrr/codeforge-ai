import React, { useState } from 'react';
import {
  Settings,
  HardDrive,
  Check,
  Trash2,
  Download,
  ShieldCheck,
  Cpu,
  Info,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { UserPreferences } from '../types/codeforge';
import { getStorageStats, clearAllLocalData } from '../utils/storage';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onDataReset: () => void;
  apiStatus: {
    ready: boolean;
    hasKey: boolean;
    loading: boolean;
  };
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  onDataReset,
  apiStatus,
  showToast,
}) => {
  const [stats, setStats] = useState(getStorageStats());
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearAll = () => {
    clearAllLocalData();
    onDataReset();
    setStats(getStorageStats());
    setConfirmClear(false);
    showToast('info', 'Todos os dados locais foram apagados.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-[#12141D] border border-[#292C3B]">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#A995FF] font-semibold uppercase tracking-wider mb-1">
          <Settings className="w-3.5 h-3.5" />
          Ambiente e Preferências
        </div>
        <h2 className="text-xl font-bold text-[#F5F5FA]">Configurações da Plataforma</h2>
        <p className="text-xs text-[#9699AC] mt-1">
          Ajustes visuais do visualizador de código, status da conexão de IA e gerenciamento de armazenamento local.
        </p>
      </div>

      {/* Editor Preferences */}
      <div className="p-5 rounded-2xl bg-[#12141D] border border-[#292C3B] space-y-4 shadow-xl">
        <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5FA] border-b border-[#292C3B] pb-3">
          <Sliders className="w-4 h-4 text-[#8065F5]" />
          <span>Preferências do Visualizador de Código</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Font Size */}
          <div>
            <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
              Tamanho da Fonte do Código
            </label>
            <div className="grid grid-cols-4 gap-2 bg-[#0B0C12] p-1 rounded-xl border border-[#292C3B]">
              {[12, 13, 14, 16].map((size) => (
                <button
                  key={size}
                  onClick={() => onUpdatePreferences({ fontSize: size })}
                  className={`py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    preferences.fontSize === size
                      ? 'bg-[#8065F5] text-white font-bold'
                      : 'text-[#9699AC] hover:text-[#F5F5FA]'
                  }`}
                >
                  {size}px
                </button>
              ))}
            </div>
          </div>

          {/* Editor Theme */}
          <div>
            <label className="block text-xs font-semibold text-[#F5F5FA] mb-1.5">
              Tema de Destaque
            </label>
            <select
              value={preferences.editorTheme}
              onChange={(e) => onUpdatePreferences({ editorTheme: e.target.value as any })}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none"
            >
              <option value="luau-dark">Luau Dark Studio (Padrão)</option>
              <option value="obsidian">CodeForge Obsidian</option>
              <option value="cyber">Cyber Cobalt</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.autoCopyOnGenerate}
              onChange={(e) => onUpdatePreferences({ autoCopyOnGenerate: e.target.checked })}
              className="rounded accent-[#8065F5]"
            />
            <span>Copiar código automaticamente para a área de transferência ao gerar</span>
          </label>
        </div>
      </div>

      {/* AI Engine & Backend Status */}
      <div className="p-5 rounded-2xl bg-[#12141D] border border-[#292C3B] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#292C3B] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5FA]">
            <Cpu className="w-4 h-4 text-[#A995FF]" />
            <span>Motor de Inteligência Artificial</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#8065F5]/10 text-[#A995FF] border border-[#8065F5]/20">
            Node.js + Gemini 3.8 Flash
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#0B0C12] border border-[#292C3B]/60 space-y-1">
            <span className="text-[#6C7086] text-[11px] block">Modelo Ativo</span>
            <span className="font-mono text-[#F5F5FA] font-bold">gemini-3.8-flash</span>
            <p className="text-[#9699AC] text-[11px] mt-1">
              Especializado em raciocínio de código e geração com esquema JSON estruturado.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0C12] border border-[#292C3B]/60 space-y-1">
            <span className="text-[#6C7086] text-[11px] block">Segurança da Chave</span>
            <span className="font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Server-Side
            </span>
            <p className="text-[#9699AC] text-[11px] mt-1">
              A chave nunca é exposta no navegador ou no bundle do frontend.
            </p>
          </div>
        </div>
      </div>

      {/* Local Storage & Privacy */}
      <div className="p-5 rounded-2xl bg-[#12141D] border border-[#292C3B] space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#292C3B] pb-3">
          <div className="flex items-center gap-2 text-sm font-bold text-[#F5F5FA]">
            <HardDrive className="w-4 h-4 text-[#8065F5]" />
            <span>Armazenamento do Navegador (LocalStorage)</span>
          </div>
          <span className="text-[11px] font-mono text-[#6C7086]">
            ~{stats.kbUsed} KB utilizados
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-[#0B0C12] border border-[#292C3B]/60">
            <span className="text-xl font-bold text-[#F5F5FA] font-mono">{stats.favoriteCount}</span>
            <span className="block text-[11px] text-[#9699AC] mt-0.5">Favoritos Salvos</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0C12] border border-[#292C3B]/60">
            <span className="text-xl font-bold text-[#F5F5FA] font-mono">{stats.activityCount}</span>
            <span className="block text-[11px] text-[#9699AC] mt-0.5">Histórico de Ações</span>
          </div>
          <div className="p-3 rounded-xl bg-[#0B0C12] border border-[#292C3B]/60 col-span-2 sm:col-span-1">
            <span className="text-xl font-bold text-emerald-400 font-mono">100%</span>
            <span className="block text-[11px] text-[#9699AC] mt-0.5">Privacidade Local</span>
          </div>
        </div>

        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[11px] text-[#9699AC] max-w-sm">
            Nenhum cookie de rastreamento é utilizado. Se você limpar os dados do navegador, seus scripts favoritos serão apagados.
          </p>

          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Sim, apagar tudo
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-3 py-1.5 text-xs text-[#9699AC] hover:text-[#F5F5FA]"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Dados Locais</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
