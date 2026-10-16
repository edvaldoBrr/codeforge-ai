import React, { useState } from 'react';
import {
  Wand2,
  Bug,
  Blocks,
  BookOpen,
  Bookmark,
  ArrowRight,
  Sparkles,
  Zap,
  Code2,
  History,
  Shield,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { NavPage, ActivityLog } from '../types/codeforge';
import { INITIAL_LIBRARY_SNIPPETS } from '../data/libraryData';

interface DashboardViewProps {
  onNavigate: (page: NavPage) => void;
  onLaunchGenerator: (prefill: { title: string; description: string; scriptType?: string }) => void;
  onLaunchSystem: (category: string) => void;
  favoritesCount: number;
  activityLogs: ActivityLog[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onLaunchGenerator,
  onLaunchSystem,
  favoritesCount,
  activityLogs,
}) => {
  const [quickIdea, setQuickIdea] = useState('');

  const suggestions = [
    {
      title: 'Sistema de Sprint com Stamina',
      desc: 'LocalScript com Shift, consumo de stamina e barra HUD no StarterGui.',
      category: 'movement',
      target: 'system',
      type: 'LocalScript',
    },
    {
      title: 'Sistema de Dash com Cooldown',
      desc: 'Esquiva rápida com tecla Q, som de vento e efeito de rastro (Trail).',
      category: 'movement',
      target: 'system',
      type: 'LocalScript',
    },
    {
      title: 'NPC com Diálogos e Câmera',
      desc: 'ProximityPrompt com diálogo em árvore e foco suave de câmera no NPC.',
      category: 'npc',
      target: 'system',
      type: 'MultiScript',
    },
    {
      title: 'Sistema de Inventário com Hotbar',
      desc: 'Capacidade limitada, itens equipáveis e validação segura no servidor.',
      category: 'inventory',
      target: 'system',
      type: 'MultiScript',
    },
    {
      title: 'Sistema de Missões com Recompensas',
      desc: 'Missões de coletar e derrotar com feedback na tela e recompensa de XP.',
      category: 'quest',
      target: 'system',
      type: 'MultiScript',
    },
    {
      title: 'Loja com Moedas do Jogo',
      desc: 'Interface de compra com verificação de saldo blindada no servidor.',
      category: 'shop',
      target: 'system',
      type: 'MultiScript',
    },
    {
      title: 'Sistema de XP e Níveis',
      desc: 'Leaderstats no servidor, curva de evolução e salvamento no DataStore.',
      category: 'progression',
      target: 'system',
      type: 'Script',
    },
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdea.trim()) return;
    onLaunchGenerator({
      title: quickIdea.slice(0, 40),
      description: quickIdea,
      scriptType: 'Sistema com múltiplos scripts',
    });
  };

  const handleSuggestionClick = (item: (typeof suggestions)[0]) => {
    if (item.target === 'system') {
      onLaunchSystem(item.category);
    } else {
      onLaunchGenerator({
        title: item.title,
        description: item.desc,
        scriptType: item.type,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#191C28] to-[#12141D] border border-[#292C3B] p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#8065F5]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-xs text-[#A995FF] font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Roblox Studio & Luau Engine</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#F5F5FA] tracking-tight">
            Forge your ideas into code.
          </h2>

          <p className="text-sm md:text-base text-[#9699AC] leading-relaxed">
            Plataforma especializada em geração e arquitetura de scripts Luau, diagnóstico de bugs e construção guiada de mecânicas seguras para seus jogos Roblox.
          </p>

          {/* Quick Idea Bar */}
          <form onSubmit={handleQuickSubmit} className="pt-3">
            <div className="flex items-center bg-[#0B0C12] border border-[#292C3B] hover:border-[#8065F5]/50 focus-within:border-[#8065F5] rounded-xl p-1.5 transition-all shadow-inner">
              <input
                type="text"
                value={quickIdea}
                onChange={(e) => setQuickIdea(e.target.value)}
                placeholder="O que você quer construir hoje? (Ex: Sistema de teleporte por portais com som)"
                className="w-full bg-transparent px-3 py-2 text-sm text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickIdea.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8065F5] hover:bg-[#8065F5]/90 disabled:opacity-50 text-white font-medium text-xs whitespace-nowrap transition-all shadow-md shadow-[#8065F5]/20"
              >
                <span>Gerar com IA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Real Local Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9699AC]">
            <span className="text-xs font-medium">Scripts Favoritos</span>
            <Bookmark className="w-4 h-4 text-[#A995FF]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#F5F5FA] font-mono">
              {favoritesCount}
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">salvos no navegador</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9699AC]">
            <span className="text-xs font-medium">Snippets na Biblioteca</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#F5F5FA] font-mono">
              {INITIAL_LIBRARY_SNIPPETS.length}
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">módulos prontos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9699AC]">
            <span className="text-xs font-medium">Ações Recentes</span>
            <History className="w-4 h-4 text-[#8065F5]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#F5F5FA] font-mono">
              {activityLogs.length}
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">nesta sessão local</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9699AC]">
            <span className="text-xs font-medium">Padrão de Segurança</span>
            <Shield className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-base font-bold text-[#F5F5FA]">
              Server Authority
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">anti-exploit nativo</span>
          </div>
        </div>
      </div>

      {/* Main Tool Launchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#F5F5FA] tracking-tight">
            Ferramentas Profissionais CodeForge
          </h3>
          <span className="text-xs text-[#9699AC]">Especializadas exclusivamente para Roblox Studio & Luau</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tool 0: Project Architect */}
          <div
            onClick={() => onNavigate('architect')}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-br from-[#12141D] to-[#191C28] hover:border-[#8065F5]/60 border border-[#8065F5]/30 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#8065F5]/20 border border-[#8065F5]/40 flex items-center justify-center text-[#A995FF] group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/40 font-semibold">
                  NOVO • IA
                </span>
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Project Architect
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-[#A995FF] transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Transforme a ideia do seu jogo em arquitetura técnica completa: árvore de pastas do Explorer, fases de desenvolvimento e geração modular de cada subsistema.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-[#A995FF]">
              <span>Planejar Arquitetura</span>
              <span className="font-mono text-[11px] text-emerald-400">Hierarquia Explorer</span>
            </div>
          </div>

          {/* Tool 1: AI Script Generator */}
          <div
            onClick={() => onNavigate('generator')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-[#8065F5]/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#8065F5]/10 border border-[#8065F5]/20 flex items-center justify-center text-[#A995FF] mb-3 group-hover:scale-105 transition-transform">
                <Wand2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                AI Script Generator
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-[#A995FF] transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Gere scripts Luau isolados ou múltiplos arquivos (Server, Client e Modules) com instruções de hierarquia no Explorer e validação segura.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-[#A995FF]">
              <span>Abrir Gerador</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Multi-Arquivo</span>
            </div>
          </div>

          {/* Tool 2: Bug Analyzer */}
          <div
            onClick={() => onNavigate('analyzer')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-rose-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-105 transition-transform">
                <Bug className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Bug Analyzer
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-rose-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Cole o código com defeito e erros do Output. A IA aponta a linha exata, distingue erros confirmados de hipóteses e gera o código corrigido com diff.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-rose-400">
              <span>Analisar Código</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Diff Side-by-Side</span>
            </div>
          </div>

          {/* Tool 3: System Builder */}
          <div
            onClick={() => onNavigate('system-builder')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-emerald-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                <Blocks className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                System Builder
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Formulários guiados para mecânicas clássicas: Sprint, Dash, NPCs com árvore de diálogo, Inventário, Missões, Loja e Níveis com DataStore.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-emerald-400">
              <span>Construir Sistema</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Passo a Passo</span>
            </div>
          </div>

          {/* Tool 4: Security Audit */}
          <div
            onClick={() => onNavigate('security')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-cyan-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Security Audit
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Audite scripts contra exploiters e hackers: detecte confiança cega no cliente, RemoteEvents vulneráveis e falhas em DataStore.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-cyan-400">
              <span>Auditar Segurança</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Anti-Exploit</span>
            </div>
          </div>

          {/* Tool 5: Code Quality & Linter */}
          <div
            onClick={() => onNavigate('quality')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-amber-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Code Quality & Linter
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Score de 0 a 100 com verificação de diretivas --!strict, vazamento de memória em conexões e eliminação de funções legadas (wait/spawn).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-amber-400">
              <span>Verificar Qualidade</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Score Luau</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Quick Starts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#A995FF]" />
            <h3 className="text-base font-bold text-[#F5F5FA] tracking-tight">
              Sistemas Populares para Começar
            </h3>
          </div>
          <span className="text-xs text-[#9699AC]">Clique para abrir configurado</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestionClick(item)}
              className="text-left p-3.5 rounded-xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-[#8065F5]/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-[#F5F5FA] group-hover:text-[#A995FF] transition-colors">
                    {item.title}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0B0C12] text-[#9699AC] border border-[#292C3B]">
                    {item.type}
                  </span>
                </div>
                <p className="text-xs text-[#9699AC] line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#8065F5] group-hover:text-[#A995FF]">
                <span>Configurar agora</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {activityLogs.length > 0 && (
        <div className="rounded-2xl bg-[#12141D] border border-[#292C3B] p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#9699AC]" />
              <h4 className="text-sm font-bold text-[#F5F5FA]">Atividade Recente</h4>
            </div>
            <span className="text-xs text-[#6C7086]">Armazenamento local</span>
          </div>

          <div className="space-y-2">
            {activityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#0B0C12] border border-[#292C3B]/60 text-xs"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8065F5] flex-shrink-0" />
                  <span className="font-medium text-[#F5F5FA] truncate">{log.title}</span>
                  {log.details && (
                    <span className="text-[#9699AC] hidden sm:inline text-[11px] truncate">
                      • {log.details}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-[#6C7086] flex-shrink-0 ml-3">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
