import React from 'react';
import {
  LayoutDashboard,
  Wand2,
  Bug,
  Blocks,
  BookOpen,
  Bookmark,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gauge,
  ShieldAlert,
  GitCompare,
  FolderArchive,
  Box,
  Flame,
  Globe,
  Code2,
  FolderTree,
  ShieldCheck,
  ArrowRightLeft,
  Layers,
} from 'lucide-react';
import { NavPage, GameEngine } from '../types/codeforge';
import { ForgeLogo } from './ForgeLogo';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  favoritesCount: number;
  projectsCount?: number;
  unityProjectsCount?: number;
  multidevProjectsCount?: number;
  activeEngine: GameEngine;
  onSelectEngine: (engine: GameEngine) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  favoritesCount,
  projectsCount = 0,
  unityProjectsCount = 0,
  multidevProjectsCount = 0,
  activeEngine,
  onSelectEngine,
}) => {
  // Navigation sections for Roblox
  const robloxSections = [
    {
      group: 'Criação & Arquitetura',
      items: [
        {
          id: 'dashboard' as NavPage,
          label: 'Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'architect' as NavPage,
          label: 'Project Architect',
          icon: Compass,
          badge: 'IA',
          highlight: true,
        },
        {
          id: 'generator' as NavPage,
          label: 'AI Script Generator',
          icon: Wand2,
          badge: 'IA',
        },
        {
          id: 'system-builder' as NavPage,
          label: 'System Builder',
          icon: Blocks,
          badge: 'Sistemas',
        },
      ],
    },
    {
      group: 'Auditoria & Qualidade',
      items: [
        {
          id: 'analyzer' as NavPage,
          label: 'Bug Analyzer',
          icon: Bug,
          badge: null,
        },
        {
          id: 'quality' as NavPage,
          label: 'Code Quality',
          icon: Gauge,
          badge: 'Linter',
        },
        {
          id: 'security' as NavPage,
          label: 'Security Audit',
          icon: ShieldAlert,
          badge: 'Segurança',
        },
        {
          id: 'comparator' as NavPage,
          label: 'Code Comparator',
          icon: GitCompare,
          badge: null,
        },
      ],
    },
    {
      group: 'Organização & Biblioteca',
      items: [
        {
          id: 'projects' as NavPage,
          label: 'Meus Projetos',
          icon: FolderArchive,
          badge: projectsCount > 0 ? String(projectsCount) : null,
        },
        {
          id: 'library' as NavPage,
          label: 'Script Library',
          icon: BookOpen,
          badge: null,
        },
        {
          id: 'favorites' as NavPage,
          label: 'Favoritos',
          icon: Bookmark,
          badge: favoritesCount > 0 ? String(favoritesCount) : null,
        },
        {
          id: 'settings' as NavPage,
          label: 'Configurações',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  // Navigation sections for Unity
  const unitySections = [
    {
      group: 'Criação & Arquitetura Unity',
      items: [
        {
          id: 'unity-dashboard' as NavPage,
          label: 'Unity Dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'unity-architect' as NavPage,
          label: 'Project Architect',
          icon: Compass,
          badge: 'IA',
          highlight: true,
        },
        {
          id: 'unity-generator' as NavPage,
          label: 'Gerador C#',
          icon: Wand2,
          badge: 'C#',
        },
        {
          id: 'unity-systems' as NavPage,
          label: 'Sistemas Unity',
          icon: Blocks,
          badge: 'Multi-Script',
        },
      ],
    },
    {
      group: 'Auditoria & Análise C#',
      items: [
        {
          id: 'unity-analyzer' as NavPage,
          label: 'Analisador de Erros',
          icon: Bug,
          badge: null,
        },
        {
          id: 'unity-quality' as NavPage,
          label: 'Qualidade C#',
          icon: Gauge,
          badge: '0-100',
        },
        {
          id: 'unity-security' as NavPage,
          label: 'Auditoria de Segurança',
          icon: ShieldAlert,
          badge: 'PlayerPrefs',
        },
        {
          id: 'unity-diff' as NavPage,
          label: 'Comparador C#',
          icon: GitCompare,
          badge: null,
        },
      ],
    },
    {
      group: 'Projetos & Referência',
      items: [
        {
          id: 'unity-projects' as NavPage,
          label: 'Projetos Unity',
          icon: Box,
          badge: unityProjectsCount > 0 ? String(unityProjectsCount) : null,
        },
        {
          id: 'unity-docs' as NavPage,
          label: 'Documentação Unity',
          icon: BookOpen,
          badge: 'LTS',
        },
        {
          id: 'settings' as NavPage,
          label: 'Configurações',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  // Navigation sections for Multi-Dev
  const multidevSections = [
    {
      group: 'Central & Criação',
      items: [
        {
          id: 'multidev-hub' as NavPage,
          label: 'Multi-Dev Hub',
          icon: Globe,
          badge: '30 Techs',
          highlight: true,
        },
        {
          id: 'multidev-generator' as NavPage,
          label: 'Gerador de Código',
          icon: Wand2,
          badge: 'IA',
        },
        {
          id: 'multidev-architect' as NavPage,
          label: 'Scaffold & Arquitetura',
          icon: FolderTree,
          badge: 'Scaffold',
        },
      ],
    },
    {
      group: 'Análise & Conversão',
      items: [
        {
          id: 'multidev-analyzer' as NavPage,
          label: 'Depurador de Código',
          icon: Bug,
          badge: null,
        },
        {
          id: 'multidev-quality' as NavPage,
          label: 'Qualidade & Segurança',
          icon: ShieldCheck,
          badge: '0-100',
        },
        {
          id: 'multidev-translator' as NavPage,
          label: 'Tradutor Poliglota',
          icon: ArrowRightLeft,
          badge: 'Converter',
        },
      ],
    },
    {
      group: 'Workspace & Referência',
      items: [
        {
          id: 'multidev-projects' as NavPage,
          label: 'Workspace Projetos',
          icon: FolderArchive,
          badge: multidevProjectsCount > 0 ? String(multidevProjectsCount) : null,
        },
        {
          id: 'multidev-cheatsheets' as NavPage,
          label: 'Cheatsheets & Snippets',
          icon: BookOpen,
          badge: 'Cheat',
        },
        {
          id: 'settings' as NavPage,
          label: 'Configurações',
          icon: Settings,
          badge: null,
        },
      ],
    },
  ];

  const currentSections =
    activeEngine === 'unity'
      ? unitySections
      : activeEngine === 'multidev'
      ? multidevSections
      : robloxSections;

  return (
    <aside
      className={`relative flex flex-col bg-[#12141D] border-r border-[#292C3B] transition-all duration-300 z-30 select-none ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Top Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#292C3B]/70">
        <ForgeLogo collapsed={collapsed} />

        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28] transition-colors"
          title={collapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-[#A995FF]" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Engine Switcher Widget (3 environments: Roblox, Unity, Multi-Dev) */}
      <div className="p-3 border-b border-[#292C3B]/60">
        {!collapsed ? (
          <div className="space-y-1.5">
            <span className="text-[9px] font-semibold text-[#6C7086] tracking-wider uppercase block">
              Ambiente de Desenvolvimento
            </span>
            <div className="grid grid-cols-3 gap-1 bg-[#0B0C12] p-1 rounded-xl border border-[#292C3B]">
              <button
                type="button"
                onClick={() => onSelectEngine('roblox')}
                className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  activeEngine === 'roblox'
                    ? 'bg-[#8065F5] text-white shadow-sm'
                    : 'text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28]'
                }`}
                title="Roblox Studio (Luau)"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Roblox</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectEngine('unity')}
                className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  activeEngine === 'unity'
                    ? 'bg-[#8065F5] text-white shadow-sm'
                    : 'text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28]'
                }`}
                title="Unity Engine (C#)"
              >
                <Box className="w-3 h-3 text-[#A995FF]" />
                <span>Unity</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectEngine('multidev')}
                className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition-all ${
                  activeEngine === 'multidev'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28]'
                }`}
                title="Multi-Dev (Multi-Linguagem & Multi-Plataforma)"
              >
                <Globe className="w-3 h-3 text-sky-400" />
                <span>Multi</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={() => {
                if (activeEngine === 'roblox') onSelectEngine('unity');
                else if (activeEngine === 'unity') onSelectEngine('multidev');
                else onSelectEngine('roblox');
              }}
              className="p-2 rounded-xl bg-[#191C28] hover:bg-[#8065F5]/20 text-[#A995FF] border border-[#292C3B] transition-colors"
              title={`Alternar Ambiente (Atual: ${
                activeEngine === 'roblox'
                  ? 'Roblox Studio'
                  : activeEngine === 'unity'
                  ? 'Unity Engine'
                  : 'Multi-Dev Hub'
              })`}
            >
              {activeEngine === 'roblox' ? (
                <Flame className="w-4 h-4 text-amber-400" />
              ) : activeEngine === 'unity' ? (
                <Box className="w-4 h-4 text-[#A995FF]" />
              ) : (
                <Globe className="w-4 h-4 text-sky-400" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-thin">
        {currentSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#6C7086]">
                {section.group}
              </span>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-[#8065F5] text-white shadow-md shadow-[#8065F5]/20 font-semibold'
                        : 'text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28]'
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'text-[#9699AC] group-hover:text-[#F5F5FA]'
                      }`}
                    />

                    {!collapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!collapsed && item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-semibold tracking-wider ${
                          isActive
                            ? 'bg-black/30 text-white'
                            : (item as any).highlight
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-[#292C3B] text-[#9699AC]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {collapsed && isActive && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#8065F5] rounded-l-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer info */}
      {!collapsed && (
        <div className="p-3 border-t border-[#292C3B]/60">
          <div className="p-2.5 rounded-xl bg-[#0B0C12] border border-[#292C3B]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-[#9699AC] font-medium">
                {activeEngine === 'unity'
                  ? 'Unity (C#)'
                  : activeEngine === 'multidev'
                  ? 'Multi-Dev Hub'
                  : 'Roblox (Luau)'}
              </span>
            </div>
            <span className="text-[10px] text-[#6C7086] font-mono">v2.5</span>
          </div>
        </div>
      )}
    </aside>
  );
};
