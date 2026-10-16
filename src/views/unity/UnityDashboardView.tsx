import React, { useState } from 'react';
import {
  Compass,
  FileCode,
  Blocks,
  Bug,
  Gauge,
  ShieldAlert,
  GitCompare,
  BookOpen,
  FolderArchive,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronRight,
  Box,
  Layers,
  Cpu,
  ShieldCheck,
  Gamepad2,
} from 'lucide-react';
import { NavPage, ActivityLog, UnityProject } from '../../types/codeforge';
import { getUnityProjects } from '../../utils/storage';

interface UnityDashboardViewProps {
  onNavigate: (page: NavPage) => void;
  onLaunchGenerator: (prefill: { title: string; description: string; scriptType?: string }) => void;
  onLaunchSystem: (category: string) => void;
  activityLogs: ActivityLog[];
}

const UNITY_SUGGESTIONS = [
  {
    title: 'Character Controller em 3ª Pessoa (New Input)',
    desc: 'Movimentação suave com CharacterController, câmera com Cinemachine, pulo com gravidade e blend tree no Animator.',
    category: 'Player & Movement',
    type: 'MonoBehaviour',
  },
  {
    title: 'Sistema de Inventário com ScriptableObjects',
    desc: 'Itens modulares desacoplados (ItemData), slots dinâmicos na UI do Canvas e pilha de itens (stackable).',
    category: 'Inventory & Items',
    type: 'MultiScript',
  },
  {
    title: 'Inimigo com Patrulha e Perseguição (NavMesh)',
    desc: 'Máquina de estados finita (FSM) com NavMeshAgent, raio de visão (FOV) e ataque corpo a corpo telegrafado.',
    category: 'Enemy AI & NPC',
    type: 'MultiScript',
  },
  {
    title: 'Sistema de Vida & Dano com UnityEvents',
    desc: 'Componente Health independente, barra de vida no Canvas, feedback de flash vermelho e evento OnDeath.',
    category: 'Combat & Stats',
    type: 'MonoBehaviour',
  },
  {
    title: 'Save & Load com JSON e Checksum',
    desc: 'Persistência segura em Application.persistentDataPath, salvando inventário, posição e atributos com validação.',
    category: 'Save & Progression',
    type: 'MultiScript',
  },
  {
    title: 'Object Pooler para Projéteis e Partículas',
    desc: 'Gerenciador com Queue<GameObject> para evitar instanciamento e destruição contínua com picos de Garbage Collector.',
    category: 'Utilities & Optimization',
    type: 'MonoBehaviour',
  },
];

export const UnityDashboardView: React.FC<UnityDashboardViewProps> = ({
  onNavigate,
  onLaunchGenerator,
  onLaunchSystem,
  activityLogs,
}) => {
  const [quickIdea, setQuickIdea] = useState('');
  const projectsCount = getUnityProjects().length;

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickIdea.trim()) return;
    onLaunchGenerator({
      title: quickIdea.slice(0, 45),
      description: quickIdea,
      scriptType: 'MonoBehaviour',
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Banner Unity Engine */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#191C28] to-[#12141D] border border-[#292C3B] p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-[#8065F5]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-xs text-[#A995FF] font-medium">
            <Box className="w-3.5 h-3.5" />
            <span>Unity Engine & C# Workspace</span>
            <span className="text-emerald-400 font-semibold">• 2022.3 LTS / Unity 6</span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#F5F5FA] tracking-tight">
            Desenvolvimento de Jogos Unity com IA de Elite
          </h2>

          <p className="text-sm md:text-base text-[#9699AC] leading-relaxed">
            Área especializada em C# para Unity: geração de MonoBehaviours, ScriptableObjects, sistemas
            multi-script desacoplados, diagnósticos do Console e auditoria de segurança.
          </p>

          {/* Quick Idea Bar */}
          <form onSubmit={handleQuickSubmit} className="pt-3">
            <div className="flex items-center bg-[#0B0C12] border border-[#292C3B] hover:border-[#8065F5]/50 focus-within:border-[#8065F5] rounded-xl p-1.5 transition-all shadow-inner">
              <input
                type="text"
                value={quickIdea}
                onChange={(e) => setQuickIdea(e.target.value)}
                placeholder="O que você quer construir hoje na Unity? (Ex: Sistema de movimentação de FPS com dash)"
                className="w-full bg-transparent px-3 py-2 text-sm text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!quickIdea.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#8065F5] hover:bg-[#8065F5]/90 disabled:opacity-50 text-white font-medium text-xs whitespace-nowrap transition-all shadow-md shadow-[#8065F5]/20"
              >
                <span>Gerar C#</span>
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
            <span className="text-xs font-medium">Projetos Unity</span>
            <FolderArchive className="w-4 h-4 text-[#A995FF]" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#F5F5FA] font-mono">
              {projectsCount}
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">salvos localmente</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9699AC]">
            <span className="text-xs font-medium">Linguagem Padrão</span>
            <FileCode className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <span className="text-xl font-bold text-[#F5F5FA] font-mono">
              C# .NET
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">MonoBehaviour & SO</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9699AC]">
            <span className="text-xs font-medium">Input Padrão</span>
            <Gamepad2 className="w-4 h-4 text-[#8065F5]" />
          </div>
          <div className="mt-3">
            <span className="text-base font-bold text-[#F5F5FA]">
              New Input System
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">suporte a legado</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#9699AC]">
            <span className="text-xs font-medium">Pipeline Gráfica</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-base font-bold text-[#F5F5FA]">
              URP / HDRP
            </span>
            <span className="text-[11px] text-[#9699AC] block mt-0.5">Universal Render Pipeline</span>
          </div>
        </div>
      </div>

      {/* Main Tool Launchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#F5F5FA] tracking-tight">
            Ferramentas da Área Unity
          </h3>
          <span className="text-xs text-[#9699AC]">Ambiente dedicado a C# e Unity Editor</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tool 1: Unity Project Architect */}
          <div
            onClick={() => onNavigate('unity-architect')}
            className="group cursor-pointer p-5 rounded-2xl bg-gradient-to-br from-[#12141D] to-[#191C28] hover:border-[#8065F5]/60 border border-[#8065F5]/30 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-[#8065F5]/20 border border-[#8065F5]/40 flex items-center justify-center text-[#A995FF] group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/40 font-semibold">
                  PLANEJAMENTO
                </span>
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Unity Project Architect
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-[#A995FF] transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Transforme sua ideia de jogo em arquitetura técnica: organização de pastas em Assets/,
                decomposição de GameObjects, MonoBehaviours, ScriptableObjects e fases de desenvolvimento.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-[#A995FF]">
              <span>Projetar Arquitetura</span>
              <span className="font-mono text-[11px] text-emerald-400">Estrutura Assets/</span>
            </div>
          </div>

          {/* Tool 2: C# Script Generator */}
          <div
            onClick={() => onNavigate('unity-generator')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-[#8065F5]/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#8065F5]/10 border border-[#8065F5]/20 flex items-center justify-center text-[#A995FF] mb-3 group-hover:scale-105 transition-transform">
                <FileCode className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                C# Script Generator
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-[#A995FF] transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Gere scripts C# com [SerializeField], [RequireComponent], [Header], caminho recomendado em
                Assets/, instruções de configuração no Inspector e passos para Play Mode.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-[#A995FF]">
              <span>Abrir Gerador C#</span>
              <span className="font-mono text-[11px] text-[#6C7086]">MonoBehaviour & SO</span>
            </div>
          </div>

          {/* Tool 3: Unity Systems Builder */}
          <div
            onClick={() => onNavigate('unity-systems')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-emerald-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-105 transition-transform">
                <Blocks className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Sistemas Completos Unity
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-emerald-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Crie sistemas modulares com múltiplos arquivos C# interconectados (Inventário, Combate,
                Diálogo, Missões, Save/Load) com mapa de conexões do Inspector.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-emerald-400">
              <span>Construir Sistema</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Multi-Arquivo</span>
            </div>
          </div>

          {/* Tool 4: Unity Bug Analyzer */}
          <div
            onClick={() => onNavigate('unity-analyzer')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-rose-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-3 group-hover:scale-105 transition-transform">
                <Bug className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Unity Bug Analyzer
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-rose-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Cole o script C# e a mensagem do Console da Unity (NullReferenceException, Coroutines,
                física fora de FixedUpdate) e receba o código corrigido com diff visual.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-rose-400">
              <span>Diagnosticar Erro</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Console Diagnosis</span>
            </div>
          </div>

          {/* Tool 5: Code Quality & Linter */}
          <div
            onClick={() => onNavigate('unity-quality')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-amber-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-105 transition-transform">
                <Gauge className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Unity Code Quality
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-amber-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Score de 0 a 100 com análise de alocações de Garbage Collector, GetComponent em Update(),
                acoplamento entre componentes e versão refatorada opcional.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-amber-400">
              <span>Verificar Qualidade</span>
              <span className="font-mono text-[11px] text-[#6C7086]">GC & Padrões C#</span>
            </div>
          </div>

          {/* Tool 6: Security Audit */}
          <div
            onClick={() => onNavigate('unity-security')}
            className="group cursor-pointer p-5 rounded-2xl bg-[#12141D] hover:bg-[#191C28] border border-[#292C3B] hover:border-cyan-500/40 transition-all flex flex-col justify-between relative shadow-lg"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-[#F5F5FA] mb-1 flex items-center gap-2">
                Unity Security Audit
                <ChevronRight className="w-4 h-4 text-[#9699AC] group-hover:translate-x-1 group-hover:text-cyan-400 transition-all" />
              </h4>
              <p className="text-xs text-[#9699AC] leading-relaxed">
                Audite segurança contra fraudes em saves locais (PlayerPrefs sem hash), chaves de API
                hardcoded no cliente e validação de RPCs em multiplayer (Netcode/Photon).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs text-cyan-400">
              <span>Auditar Segurança</span>
              <span className="font-mono text-[11px] text-[#6C7086]">Anti-Tamper & RPC</span>
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
              Modelos & Sistemas Populares Unity
            </h3>
          </div>
          <span className="text-xs text-[#9699AC]">Clique para abrir configurado</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {UNITY_SUGGESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.type === 'MultiScript') {
                  onLaunchSystem(item.category);
                } else {
                  onLaunchGenerator({
                    title: item.title,
                    description: item.desc,
                    scriptType: item.type,
                  });
                }
              }}
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
                <span>Configurar C#</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
