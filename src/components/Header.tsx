import React from 'react';
import { Menu, Sparkles, AlertCircle, CheckCircle2, Box, Flame, Globe } from 'lucide-react';
import { NavPage, GameEngine } from '../types/codeforge';

interface HeaderProps {
  currentPage: NavPage;
  onMobileMenuToggle: () => void;
  apiStatus: {
    ready: boolean;
    hasKey: boolean;
    loading: boolean;
  };
  activeEngine: GameEngine;
  onSelectEngine: (engine: GameEngine) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onMobileMenuToggle,
  apiStatus,
  activeEngine,
  onSelectEngine,
}) => {
  const getPageInfo = (page: NavPage) => {
    switch (page) {
      // Roblox Views
      case 'dashboard':
        return {
          title: 'Roblox Dashboard',
          subtitle: 'Visão geral e acesso rápido às ferramentas de desenvolvimento Roblox Studio.',
        };
      case 'architect':
        return {
          title: 'Project Architect (Roblox)',
          subtitle: 'Planejamento arquitetural completo, hierarquia do Explorer e sistemas modulares.',
        };
      case 'generator':
        return {
          title: 'AI Script Generator (Luau)',
          subtitle: 'Gere scripts Luau completos para Server, Client e módulos com IA.',
        };
      case 'analyzer':
        return {
          title: 'Bug Analyzer (Roblox)',
          subtitle: 'Diagnostique erros de script, output logs e corrija falhas de execução.',
        };
      case 'system-builder':
        return {
          title: 'System Builder (Roblox)',
          subtitle: 'Construa sistemas arquitetados (Dash, Inventário, Diálogos, Loja) passo a passo.',
        };
      case 'quality':
        return {
          title: 'Code Quality & Linter (Luau)',
          subtitle: 'Verifique diretivas --!strict, vazamento de memória e modernidade da task library.',
        };
      case 'security':
        return {
          title: 'Roblox Security Audit',
          subtitle: 'Audite contra exploiters, confiança cega no cliente e RemoteEvents vulneráveis.',
        };
      case 'comparator':
        return {
          title: 'Code Comparator & Diff (Luau)',
          subtitle: 'Compare lado a lado duas versões de scripts Luau com análise de impacto por IA.',
        };
      case 'projects':
        return {
          title: 'Meus Projetos (Roblox)',
          subtitle: 'Gerencie jogos com múltiplos scripts, controle de versões e exportação em ZIP.',
        };
      case 'library':
        return {
          title: 'Script Library (Luau)',
          subtitle: 'Coleção de snippets e módulos essenciais testados para Roblox Studio.',
        };
      case 'favorites':
        return {
          title: 'Scripts Salvos & Favoritos',
          subtitle: 'Seus scripts e sistemas persistidos localmente no navegador.',
        };
      case 'settings':
        return {
          title: 'Configurações & Ambiente',
          subtitle: 'Preferências do editor, status da IA e gerenciamento de armazenamento.',
        };

      // Unity Views
      case 'unity-dashboard':
        return {
          title: 'Unity Engine Dashboard',
          subtitle: 'Painel central de ferramentas especializadas em Unity Engine e programação profissional C#.',
        };
      case 'unity-architect':
        return {
          title: 'Project Architect (Unity)',
          subtitle: 'Planejamento de arquitetura de jogos Unity, hierarquia em Assets/ e ScriptableObjects.',
        };
      case 'unity-generator':
        return {
          title: 'Gerador de Scripts C# (Unity)',
          subtitle: 'Gere MonoBehaviours e ScriptableObjects com [SerializeField], [RequireComponent] e boas práticas.',
        };
      case 'unity-systems':
        return {
          title: 'Gerador de Sistemas Completos (Unity)',
          subtitle: 'Sistemas multi-script interligados com mapeamento de GameObjects e conexões no Inspector.',
        };
      case 'unity-analyzer':
        return {
          title: 'Analisador de Erros C# (Unity)',
          subtitle: 'Diagnostique exceções (NullReferenceException, CS0246) e receba correções imediatas.',
        };
      case 'unity-quality':
        return {
          title: 'Qualidade de Código C# (0-100)',
          subtitle: 'Avaliação de convenções C#, garbage collector, padrões Unity e boas práticas.',
        };
      case 'unity-security':
        return {
          title: 'Auditoria de Segurança Unity',
          subtitle: 'Inspecione PlayerPrefs, segredos expostos, RPCs multiplayer e validação de input.',
        };
      case 'unity-diff':
        return {
          title: 'Comparador de Versões C#',
          subtitle: 'Compare versões de scripts C# com destaque de diferenças e análise de impacto.',
        };
      case 'unity-projects':
        return {
          title: 'Projetos & Scripts Unity',
          subtitle: 'Gerenciador de scripts organizados por pastas em Assets/ com exportação em pacote ZIP.',
        };
      case 'unity-docs':
        return {
          title: 'Documentação Técnica Unity',
          subtitle: 'Guia de APIs, ciclo de vida do MonoBehaviour e ScriptableObjects.',
        };

      // Multi-Dev Views
      case 'multidev-hub':
        return {
          title: 'Multi-Dev Hub',
          subtitle: 'Central poliglota com 30 linguagens, frameworks, engines e bancos de dados.',
        };
      case 'multidev-generator':
        return {
          title: 'Gerador de Código Multi-Dev',
          subtitle: 'Geração adaptativa de classes, APIs, serviços e scripts sob medida para qualquer tecnologia.',
        };
      case 'multidev-analyzer':
        return {
          title: 'Depurador & Analisador de Erros Multi-Dev',
          subtitle: 'Diagnóstico profundo de sintaxe, tipos, concorrência e correção automática de bugs.',
        };
      case 'multidev-architect':
        return {
          title: 'Arquiteto & Scaffold de Projetos',
          subtitle: 'Estruturação de árvores de diretórios, manifests de pacotes e inicialização de projetos.',
        };
      case 'multidev-quality':
        return {
          title: 'Auditoria de Qualidade & Segurança Multi-Dev',
          subtitle: 'Pontuação 0-100, escaneamento de vulnerabilidades e checklist de convenções da linguagem.',
        };
      case 'multidev-translator':
        return {
          title: 'Tradutor & Conversor de Código',
          subtitle: 'Conversão inteligente de código entre linguagens com adaptação estrita de paradigmas.',
        };
      case 'multidev-cheatsheets':
        return {
          title: 'Cheatsheets & Snippets Essenciais',
          subtitle: 'Guia rápido de comandos, padrões de concorrência e sintaxe para cada tecnologia.',
        };
      case 'multidev-projects':
        return {
          title: 'Workspace & Repositórios Multi-Dev',
          subtitle: 'Gerenciamento de arquivos-fonte, manifestos e exportação de pacotes completos em ZIP.',
        };

      default:
        return {
          title: 'CodeForge',
          subtitle: 'Plataforma de Desenvolvimento Assistido por IA',
        };
    }
  };

  const { title, subtitle } = getPageInfo(currentPage);

  return (
    <header className="h-16 bg-[#12141D] border-b border-[#292C3B]/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28]"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-[#F5F5FA] tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-[#9699AC] font-normal truncate max-w-xl">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Environment Switcher in Header */}
        <div className="hidden lg:flex items-center bg-[#191C28] p-1 rounded-xl border border-[#292C3B]">
          <button
            onClick={() => onSelectEngine('roblox')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeEngine === 'roblox'
                ? 'bg-[#8065F5] text-white shadow-sm'
                : 'text-[#9699AC] hover:text-[#F5F5FA]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Roblox</span>
          </button>

          <button
            onClick={() => onSelectEngine('unity')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeEngine === 'unity'
                ? 'bg-[#8065F5] text-white shadow-sm'
                : 'text-[#9699AC] hover:text-[#F5F5FA]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Unity</span>
          </button>

          <button
            onClick={() => onSelectEngine('multidev')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeEngine === 'multidev'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-[#9699AC] hover:text-[#F5F5FA]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>Multi-Dev</span>
          </button>
        </div>

        {/* Gemini Engine Status Badge */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border ${
            apiStatus.loading
              ? 'bg-[#191C28] text-[#9699AC] border-[#292C3B]'
              : apiStatus.hasKey
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
          title={
            apiStatus.hasKey
              ? 'IA Gemini conectada via servidor backend'
              : 'GEMINI_API_KEY não detectada. Configure no Secrets do AI Studio.'
          }
        >
          {apiStatus.loading ? (
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-spin" />
          ) : apiStatus.hasKey ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="font-medium">
            {apiStatus.loading
              ? 'Conectando...'
              : apiStatus.hasKey
              ? 'Gemini 3.8 Conectado'
              : 'Modo Offline / Sem Chave'}
          </span>
        </div>

        {/* Engine Language Badge */}
        <div className="flex items-center gap-1.5 text-xs text-[#9699AC] bg-[#191C28] px-2.5 py-1 rounded-lg border border-[#292C3B]">
          <Sparkles className="w-3.5 h-3.5 text-[#A995FF]" />
          <span className="font-semibold text-[#F5F5FA]">
            {activeEngine === 'unity'
              ? 'C# / Unity'
              : activeEngine === 'multidev'
              ? 'Multi-Dev Poliglota'
              : 'Luau / Roblox'}
          </span>
        </div>
      </div>
    </header>
  );
};
