import React, { useState } from 'react';
import {
  Blocks,
  RefreshCw,
  FolderTree,
  ListOrdered,
  ShieldCheck,
  FlaskConical,
  Bookmark,
  BookmarkCheck,
  Layers,
  HelpCircle,
  Zap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { GeneratedSystemResult, ScriptFile, UserPreferences } from '../types/codeforge';
import { CodeViewer } from '../components/CodeViewer';

interface SystemBuilderViewProps {
  initialCategory?: string;
  preferences?: UserPreferences;
  onSaveFavorite: (item: {
    title: string;
    scriptType: string;
    location: string;
    code: string;
    files: ScriptFile[];
    notes?: string;
    category?: string;
  }) => void;
  isFavorited: (title: string) => boolean;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: 'generator' | 'analyzer' | 'system' | 'library', title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const SystemBuilderView: React.FC<SystemBuilderViewProps> = ({
  initialCategory = 'movement',
  preferences,
  onSaveFavorite,
  isFavorited,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  // Current active system preset tab
  const [selectedSystem, setSelectedSystem] = useState<
    'sprint' | 'dash' | 'npc' | 'inventory' | 'quest' | 'shop' | 'progression' | 'interaction'
  >(
    initialCategory === 'npc'
      ? 'npc'
      : initialCategory === 'inventory'
      ? 'inventory'
      : initialCategory === 'quest'
      ? 'quest'
      : initialCategory === 'shop'
      ? 'shop'
      : initialCategory === 'progression'
      ? 'progression'
      : initialCategory === 'interaction'
      ? 'interaction'
      : 'sprint'
  );

  // Form states per system
  // 1. Sprint
  const [sprintNormalSpeed, setSprintNormalSpeed] = useState(16);
  const [sprintRunSpeed, setSprintRunSpeed] = useState(26);
  const [sprintStaminaMax, setSprintStaminaMax] = useState(100);
  const [sprintStaminaDrain, setSprintStaminaDrain] = useState(15);
  const [sprintIncludeUI, setSprintIncludeUI] = useState(true);
  const [sprintFovEffect, setSprintFovEffect] = useState(true);

  // 2. Dash
  const [dashKeybind, setDashKeybind] = useState('Q');
  const [dashCooldown, setDashCooldown] = useState(3.0);
  const [dashForce, setDashForce] = useState(70);
  const [dashDuration, setDashDuration] = useState(0.25);
  const [dashTrailEffect, setDashTrailEffect] = useState(true);
  const [dashSoundEffect, setDashSoundEffect] = useState(true);

  // 3. NPC Dialog
  const [npcName, setNpcName] = useState('Ancião da Vila');
  const [npcTriggerType, setNpcTriggerType] = useState('ProximityPrompt');
  const [npcGreeting, setNpcGreeting] = useState('Saudações, viajante! Em que posso ajudá-lo hoje?');
  const [npcOption1, setNpcOption1] = useState('Gostaria de saber sobre a história deste lugar.');
  const [npcOption2, setNpcOption2] = useState('Você tem alguma missão para mim?');
  const [npcSmoothCamera, setNpcSmoothCamera] = useState(true);

  // 4. Inventory
  const [invMaxSlots, setInvMaxSlots] = useState(12);
  const [invStackable, setInvStackable] = useState(true);
  const [invHasHotbar, setInvHasHotbar] = useState(true);
  const [invCategories, setInvCategories] = useState('Armas, Consumíveis, Materiais');
  const [invServerValidation, setInvServerValidation] = useState(true);

  // 5. Quests
  const [questTitle, setQuestTitle] = useState('Ameaça na Floresta');
  const [questType, setQuestType] = useState('Eliminar Inimigos');
  const [questTargetCount, setQuestTargetCount] = useState(5);
  const [questRewardCoins, setQuestRewardCoins] = useState(150);
  const [questRewardXp, setQuestRewardXp] = useState(300);
  const [questUiAlert, setQuestUiAlert] = useState(true);

  // 6. Shop
  const [shopName, setShopName] = useState('Armeiro Real');
  const [shopCurrency, setShopCurrency] = useState('Coins');
  const [shopItems, setShopItems] = useState('Espada de Ferro:100, Poção de Vida:30, Escudo de Madeira:75');
  const [shopSaveData, setShopSaveData] = useState(true);

  // 7. Progression (XP & Levels)
  const [progBaseXp, setProgBaseXp] = useState(100);
  const [progMultiplier, setProgMultiplier] = useState(1.5);
  const [progMaxLevel, setProgMaxLevel] = useState(50);
  const [progLeaderstats, setProgLeaderstats] = useState(true);
  const [progSoundEffect, setProgSoundEffect] = useState(true);

  // 8. Interaction
  const [interactText, setInteractText] = useState('Examinar Objeto Antigo');
  const [interactHoldTime, setInteractHoldTime] = useState(1.5);
  const [interactDistance, setInteractDistance] = useState(12);
  const [interactAction, setInteractAction] = useState('Conceder item secreto ou abrir passagem');

  // Results & API states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedSystemResult | null>(null);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const systemsList = [
    { id: 'sprint', label: 'Sprint & Stamina', category: 'movement', desc: 'Corrida com consumo de energia e HUD' },
    { id: 'dash', label: 'Dash com Cooldown', category: 'movement', desc: 'Esquiva rápida com trilha e som' },
    { id: 'npc', label: 'Diálogos de NPC', category: 'npc', desc: 'Árvore de falas com câmera focada' },
    { id: 'inventory', label: 'Inventário & Hotbar', category: 'inventory', desc: 'Slots, itens equipáveis e validação server' },
    { id: 'quest', label: 'Missões & Metas', category: 'quest', desc: 'Objetivos, progresso e recompensas' },
    { id: 'shop', label: 'Loja com Moedas', category: 'shop', desc: 'Catálogo de itens e transação segura' },
    { id: 'progression', label: 'XP e Níveis', category: 'progression', desc: 'Curva de nível, DataStore e stats' },
    { id: 'interaction', label: 'Interação de Objetos', category: 'interaction', desc: 'ProximityPrompt com tempo e efeitos' },
  ] as const;

  const handleGenerateSystem = async () => {
    setLoading(true);
    let systemName = '';
    let category = '';
    let configPayload: Record<string, any> = {};

    switch (selectedSystem) {
      case 'sprint':
        systemName = 'Sistema de Sprint com Stamina e HUD';
        category = 'movement';
        configPayload = {
          velocidadeNormal: sprintNormalSpeed,
          velocidadeCorrida: sprintRunSpeed,
          staminaMaxima: sprintStaminaMax,
          consumoStaminaPorSegundo: sprintStaminaDrain,
          incluirInterfaceHUD: sprintIncludeUI,
          efeitoFovTransicao: sprintFovEffect,
        };
        break;
      case 'dash':
        systemName = 'Sistema de Dash com Cooldown e Efeitos';
        category = 'movement';
        configPayload = {
          teclaAtivacao: dashKeybind,
          tempoCooldownSegundos: dashCooldown,
          forcaImpulso: dashForce,
          duracaoImpulso: dashDuration,
          efeitoVisualTrail: dashTrailEffect,
          efeitoSonoro: dashSoundEffect,
        };
        break;
      case 'npc':
        systemName = `Sistema de Diálogos: ${npcName}`;
        category = 'npc';
        configPayload = {
          nomeNpc: npcName,
          tipoGatilho: npcTriggerType,
          fraseBoasVindas: npcGreeting,
          opcaoResposta1: npcOption1,
          opcaoResposta2: npcOption2,
          cameraFocoSuave: npcSmoothCamera,
        };
        break;
      case 'inventory':
        systemName = 'Sistema de Inventário com Hotbar e Servidor';
        category = 'inventory';
        configPayload = {
          quantidadeSlotsMax: invMaxSlots,
          itensEmpilhaveis: invStackable,
          barraHotbarInferior: invHasHotbar,
          categoriasPermitidas: invCategories,
          validacaoTransacaoServidor: invServerValidation,
        };
        break;
      case 'quest':
        systemName = `Sistema de Missões: ${questTitle}`;
        category = 'quest';
        configPayload = {
          tituloMissao: questTitle,
          tipoMissao: questType,
          quantidadeNecessaria: questTargetCount,
          recompensaMoedas: questRewardCoins,
          recompensaXp: questRewardXp,
          alertaInterface: questUiAlert,
        };
        break;
      case 'shop':
        systemName = `Sistema de Loja: ${shopName}`;
        category = 'shop';
        configPayload = {
          nomeDaLoja: shopName,
          moedaUtilizada: shopCurrency,
          catalogoItens: shopItems,
          salvarMoedasDataStore: shopSaveData,
        };
        break;
      case 'progression':
        systemName = 'Sistema de XP, Níveis e Leaderstats';
        category = 'progression';
        configPayload = {
          xpBaseNivel1: progBaseXp,
          multiplicadorProgressao: progMultiplier,
          nivelMaximo: progMaxLevel,
          exibirLeaderstats: progLeaderstats,
          somAoSubirNivel: progSoundEffect,
        };
        break;
      case 'interaction':
        systemName = `Interação: ${interactText}`;
        category = 'interaction';
        configPayload = {
          textoAcaoPrompt: interactText,
          tempoSegurandoPrompt: interactHoldTime,
          distanciaMaximaStuds: interactDistance,
          resultadoAcao: interactAction,
        };
        break;
    }

    try {
      const response = await fetch('/api/generate-system', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          systemName,
          config: configPayload,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha ao construir o sistema.');
      }

      const data: GeneratedSystemResult = await response.json();
      setResult(data);
      setActiveFileIndex(0);
      onLogActivity('system', `Construiu: ${systemName}`, `${data.files.length} scripts integrados`);

      if (preferences?.autoCopyOnGenerate && data.files.length > 0) {
        try {
          await navigator.clipboard.writeText(data.files[0].code);
          showToast('success', `Sistema "${systemName}" gerado e copiado!`);
        } catch {
          showToast('success', `Sistema "${systemName}" gerado com sucesso!`);
        }
      } else {
        showToast('success', `Sistema "${systemName}" gerado com sucesso!`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao gerar o sistema.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = () => {
    if (!result) return;
    const selectedFile = result.files[activeFileIndex] || result.files[0];
    onSaveFavorite({
      title: result.title,
      scriptType: 'Sistema Multi-Script',
      location: 'Explorer Hierarchy',
      code: selectedFile ? selectedFile.code : '',
      files: result.files,
      notes: result.summary,
      category: result.category,
    });
    showToast('success', `"${result.title}" salvo nos favoritos!`);
  };

  const currentFile = result?.files[activeFileIndex] || result?.files[0];
  const isCurrentFavorited = result ? isFavorited(result.title) : false;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#12141D] border border-[#292C3B]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-1">
            <Blocks className="w-3.5 h-3.5" />
            Construtor Guiado de Sistemas
          </div>
          <h2 className="text-xl font-bold text-[#F5F5FA]">Roblox System Builder</h2>
          <p className="text-xs text-[#9699AC] mt-1">
            Escolha um sistema clássico, ajuste parâmetros interativos e receba todos os scripts (Cliente, Servidor e Módulos) com segurança blindada.
          </p>
        </div>
      </div>

      {/* Preset System Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {systemsList.map((sys) => {
          const isActive = selectedSystem === sys.id;
          return (
            <button
              key={sys.id}
              onClick={() => setSelectedSystem(sys.id as any)}
              className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                isActive
                  ? 'bg-[#8065F5]/20 border-[#8065F5] text-[#F5F5FA] shadow-md shadow-[#8065F5]/10'
                  : 'bg-[#12141D] border-[#292C3B] text-[#9699AC] hover:text-[#F5F5FA] hover:bg-[#191C28]'
              }`}
            >
              <span className="text-xs font-bold leading-tight truncate w-full">
                {sys.label}
              </span>
              <span className="text-[10px] text-[#6C7086] capitalize">
                {sys.category}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: System-Specific Form Configuration */}
        <div className="lg:col-span-5 bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="border-b border-[#292C3B] pb-3">
            <span className="text-xs font-semibold text-[#8065F5] uppercase tracking-wider block">
              Configurações do Sistema
            </span>
            <h3 className="text-base font-bold text-[#F5F5FA] mt-0.5">
              {systemsList.find((s) => s.id === selectedSystem)?.label}
            </h3>
            <p className="text-xs text-[#9699AC] mt-0.5">
              {systemsList.find((s) => s.id === selectedSystem)?.desc}
            </p>
          </div>

          <div className="space-y-4">
            {/* 1. SPRINT */}
            {selectedSystem === 'sprint' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Velocidade Normal
                    </label>
                    <input
                      type="number"
                      value={sprintNormalSpeed}
                      onChange={(e) => setSprintNormalSpeed(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Velocidade ao Correr
                    </label>
                    <input
                      type="number"
                      value={sprintRunSpeed}
                      onChange={(e) => setSprintRunSpeed(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Stamina Máxima
                    </label>
                    <input
                      type="number"
                      value={sprintStaminaMax}
                      onChange={(e) => setSprintStaminaMax(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Gasto / Seg
                    </label>
                    <input
                      type="number"
                      value={sprintStaminaDrain}
                      onChange={(e) => setSprintStaminaDrain(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sprintIncludeUI}
                      onChange={(e) => setSprintIncludeUI(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Gerar barra de stamina visual no StarterGui</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sprintFovEffect}
                      onChange={(e) => setSprintFovEffect(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Efeito de câmera (FOV Tween) ao correr</span>
                  </label>
                </div>
              </>
            )}

            {/* 2. DASH */}
            {selectedSystem === 'dash' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Tecla de Ativação
                    </label>
                    <input
                      type="text"
                      value={dashKeybind}
                      onChange={(e) => setDashKeybind(e.target.value)}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Cooldown (Segundos)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={dashCooldown}
                      onChange={(e) => setDashCooldown(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Força / Velocidade
                    </label>
                    <input
                      type="number"
                      value={dashForce}
                      onChange={(e) => setDashForce(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Duração do Dash (s)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      value={dashDuration}
                      onChange={(e) => setDashDuration(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dashTrailEffect}
                      onChange={(e) => setDashTrailEffect(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Criar efeito de rastro (Trail / Partículas)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dashSoundEffect}
                      onChange={(e) => setDashSoundEffect(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Tocar efeito sonoro de vento</span>
                  </label>
                </div>
              </>
            )}

            {/* 3. NPC */}
            {selectedSystem === 'npc' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Nome do NPC
                  </label>
                  <input
                    type="text"
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Tipo de Gatilho
                  </label>
                  <select
                    value={npcTriggerType}
                    onChange={(e) => setNpcTriggerType(e.target.value)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                  >
                    <option value="ProximityPrompt">ProximityPrompt (Tecla E ao aproximar)</option>
                    <option value="ClickDetector">ClickDetector (Clicar no NPC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Fala Inicial do NPC
                  </label>
                  <textarea
                    value={npcGreeting}
                    onChange={(e) => setNpcGreeting(e.target.value)}
                    rows={2}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl p-2.5 text-xs text-[#F5F5FA]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9699AC] mb-1">
                      Opção de Resposta 1
                    </label>
                    <input
                      type="text"
                      value={npcOption1}
                      onChange={(e) => setNpcOption1(e.target.value)}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-2.5 py-1.5 text-xs text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#9699AC] mb-1">
                      Opção de Resposta 2
                    </label>
                    <input
                      type="text"
                      value={npcOption2}
                      onChange={(e) => setNpcOption2(e.target.value)}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-2.5 py-1.5 text-xs text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={npcSmoothCamera}
                    onChange={(e) => setNpcSmoothCamera(e.target.checked)}
                    className="rounded accent-[#8065F5]"
                  />
                  <span>Focar câmera suavemente no rosto do NPC ao falar</span>
                </label>
              </>
            )}

            {/* 4. INVENTORY */}
            {selectedSystem === 'inventory' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Quantidade de Slots
                    </label>
                    <input
                      type="number"
                      value={invMaxSlots}
                      onChange={(e) => setInvMaxSlots(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Itens Empilháveis?
                    </label>
                    <select
                      value={invStackable ? 'sim' : 'nao'}
                      onChange={(e) => setInvStackable(e.target.value === 'sim')}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                    >
                      <option value="sim">Sim (Stackable)</option>
                      <option value="nao">Não (Único por slot)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Categorias Suportadas
                  </label>
                  <input
                    type="text"
                    value={invCategories}
                    onChange={(e) => setInvCategories(e.target.value)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invHasHotbar}
                      onChange={(e) => setInvHasHotbar(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Incluir barra de Hotbar (teclas 1-9)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invServerValidation}
                      onChange={(e) => setInvServerValidation(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Validação 100% no servidor (anti-duplicação)</span>
                  </label>
                </div>
              </>
            )}

            {/* 5. QUESTS */}
            {selectedSystem === 'quest' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Nome da Missão
                  </label>
                  <input
                    type="text"
                    value={questTitle}
                    onChange={(e) => setQuestTitle(e.target.value)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Tipo de Objetivo
                    </label>
                    <select
                      value={questType}
                      onChange={(e) => setQuestType(e.target.value)}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                    >
                      <option value="Eliminar Inimigos">Eliminar Inimigos</option>
                      <option value="Coletar Itens">Coletar Itens</option>
                      <option value="Interagir com Objeto">Interagir com Objeto</option>
                      <option value="Alcançar Região">Alcançar Região</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Meta (Qtd)
                    </label>
                    <input
                      type="number"
                      value={questTargetCount}
                      onChange={(e) => setQuestTargetCount(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Recompensa Moedas
                    </label>
                    <input
                      type="number"
                      value={questRewardCoins}
                      onChange={(e) => setQuestRewardCoins(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Recompensa XP
                    </label>
                    <input
                      type="number"
                      value={questRewardXp}
                      onChange={(e) => setQuestRewardXp(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={questUiAlert}
                    onChange={(e) => setQuestUiAlert(e.target.checked)}
                    className="rounded accent-[#8065F5]"
                  />
                  <span>Exibir notificação animada ao concluir missão</span>
                </label>
              </>
            )}

            {/* 6. SHOP */}
            {selectedSystem === 'shop' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Nome da Loja
                    </label>
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Moeda Utilizada
                    </label>
                    <input
                      type="text"
                      value={shopCurrency}
                      onChange={(e) => setShopCurrency(e.target.value)}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Itens e Preços (Formato: Item:Preço, ...)
                  </label>
                  <textarea
                    value={shopItems}
                    onChange={(e) => setShopItems(e.target.value)}
                    rows={3}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl p-2.5 text-xs text-[#F5F5FA]"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={shopSaveData}
                    onChange={(e) => setShopSaveData(e.target.checked)}
                    className="rounded accent-[#8065F5]"
                  />
                  <span>Persistir saldo e compras com DataStoreService</span>
                </label>
              </>
            )}

            {/* 7. PROGRESSION */}
            {selectedSystem === 'progression' && (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#F5F5FA] mb-1">
                      XP Nível 1
                    </label>
                    <input
                      type="number"
                      value={progBaseXp}
                      onChange={(e) => setProgBaseXp(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#F5F5FA] mb-1">
                      Multiplicador
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={progMultiplier}
                      onChange={(e) => setProgMultiplier(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#F5F5FA] mb-1">
                      Nível Máx.
                    </label>
                    <input
                      type="number"
                      value={progMaxLevel}
                      onChange={(e) => setProgMaxLevel(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={progLeaderstats}
                      onChange={(e) => setProgLeaderstats(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Criar pasta leaderstats para tabela de pontuação</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-[#F5F5FA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={progSoundEffect}
                      onChange={(e) => setProgSoundEffect(e.target.checked)}
                      className="rounded accent-[#8065F5]"
                    />
                    <span>Tocar fanfarra / som ao subir de nível</span>
                  </label>
                </div>
              </>
            )}

            {/* 8. INTERACTION */}
            {selectedSystem === 'interaction' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Texto do ProximityPrompt
                  </label>
                  <input
                    type="text"
                    value={interactText}
                    onChange={(e) => setInteractText(e.target.value)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Tempo Segurando (s)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={interactHoldTime}
                      onChange={(e) => setInteractHoldTime(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                      Distância (Studs)
                    </label>
                    <input
                      type="number"
                      value={interactDistance}
                      onChange={(e) => setInteractDistance(Number(e.target.value))}
                      className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5FA]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#F5F5FA] mb-1">
                    Ação Executada
                  </label>
                  <input
                    type="text"
                    value={interactAction}
                    onChange={(e) => setInteractAction(e.target.value)}
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA]"
                  />
                </div>
              </>
            )}

            {/* Generate System Button */}
            <button
              type="button"
              onClick={handleGenerateSystem}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 disabled:opacity-60 text-white font-semibold text-xs tracking-wide shadow-lg shadow-emerald-950/30 transition-all mt-4"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Construindo Arquitetura...</span>
                </>
              ) : (
                <>
                  <Blocks className="w-4 h-4" />
                  <span>Generate System</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Generated System Architecture & Files */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !loading && (
            <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-10 flex flex-col items-center justify-center text-center space-y-3 min-h-[420px]">
              <div className="w-14 h-14 rounded-2xl bg-[#191C28] border border-[#292C3B] flex items-center justify-center text-emerald-400">
                <Blocks className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#F5F5FA]">Nenhum sistema montado</h3>
              <p className="text-xs text-[#9699AC] max-w-md leading-relaxed">
                Configure os parâmetros ao lado e clique em <strong>"Generate System"</strong>. A IA criará a arquitetura completa com cliente, servidor e módulos de suporte.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-[#6C7086]">
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • RemoteEvents & RemoteFunctions
                </span>
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • Validação Server-Authoritative
                </span>
                <span className="px-2 py-1 rounded bg-[#0B0C12] border border-[#292C3B]">
                  • Árvore de Objetos do Explorer
                </span>
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-[#292C3B] bg-[#12141D] p-10 flex flex-col items-center justify-center text-center space-y-4 min-h-[420px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#F5F5FA]">Arquitetando Sistema no Roblox</h4>
                <p className="text-xs text-[#9699AC] max-w-sm">
                  Separando lógica do cliente, blindando servidor contra exploiters e estruturando instâncias do Explorer...
                </p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Architecture Overview Card */}
              <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5FA]">{result.title}</h3>
                    <p className="text-xs text-[#9699AC] mt-1 leading-relaxed">
                      {result.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleFavoriteToggle}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        isCurrentFavorited
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-[#191C28] text-[#F5F5FA] border-[#292C3B] hover:border-[#8065F5]/40'
                      }`}
                    >
                      {isCurrentFavorited ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Favoritado</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-[#9699AC]" />
                          <span>Save to Favorites</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleGenerateSystem}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#191C28] text-[#F5F5FA] border border-[#292C3B] hover:border-emerald-500/40 transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Regenerate</span>
                    </button>
                  </div>
                </div>

                {/* Architecture Explanation */}
                <div className="p-3 rounded-lg bg-[#0B0C12] border border-[#292C3B]/60 text-xs text-[#9699AC] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-[#F5F5FA]">Arquitetura de Rede: </strong>
                    {result.architecture}
                  </p>
                </div>

                {/* File Tabs */}
                <div className="pt-2 border-t border-[#292C3B]/60">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold text-[#F5F5FA]">
                      Scripts Gerados ({result.files.length}):
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {result.files.map((file, idx) => {
                      const isActive = idx === activeFileIndex;
                      return (
                        <button
                          key={file.id || idx}
                          onClick={() => setActiveFileIndex(idx)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap border ${
                            isActive
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                              : 'bg-[#0B0C12] text-[#9699AC] border-[#292C3B] hover:text-[#F5F5FA]'
                          }`}
                        >
                          <span>{file.name}</span>
                          <span className="text-[10px] opacity-75 font-sans">({file.type})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Code Viewer */}
              {currentFile && (
                <div>
                  <div className="flex items-center justify-between px-1 mb-1">
                    <span className="text-xs font-medium text-[#9699AC]">
                      Arquivo: <strong className="text-[#F5F5FA] font-mono">{currentFile.name}</strong>
                    </span>
                    <button
                      onClick={() => onExplainRequest(currentFile.code, `${currentFile.name} (${currentFile.type}) do sistema ${result.title}`)}
                      className="inline-flex items-center gap-1 text-xs text-[#A995FF] hover:underline"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Explain Code</span>
                    </button>
                  </div>

                  <CodeViewer
                    code={currentFile.code}
                    filename={currentFile.name}
                    scriptType={currentFile.type}
                    location={currentFile.location}
                    fontSize={preferences?.fontSize}
                    theme={preferences?.editorTheme}
                    onCopyFeedback={() => showToast('success', `Código de ${currentFile.name} copiado!`)}
                  />

                  {currentFile.explanation && (
                    <div className="p-3 rounded-xl bg-[#12141D] border border-[#292C3B] text-xs text-[#9699AC]">
                      {currentFile.explanation}
                    </div>
                  )}
                </div>
              )}

              {/* Explorer Hierarchy Tree */}
              <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                  <FolderTree className="w-4 h-4 text-[#A995FF]" />
                  <span>Estrutura no Explorer do Roblox Studio</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.hierarchySetup.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#0B0C12] border border-[#292C3B]/60 text-xs flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-emerald-400 font-semibold">{item.itemName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#191C28] text-[#9699AC] border border-[#292C3B]">
                          {item.itemType}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-[#6C7086]">
                        Colocar dentro de: <span className="text-[#F5F5FA] font-mono">{item.parent}</span>
                      </div>
                      {item.notes && (
                        <div className="text-[10px] text-[#9699AC] mt-1 italic">
                          Nota: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps and Testing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                    <ListOrdered className="w-4 h-4 text-[#8065F5]" />
                    <span>Passos de Instalação</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#9699AC]">
                    {result.setupSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#8065F5] font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#12141D] border border-[#292C3B] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#F5F5FA]">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <span>Como Testar no Studio</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#9699AC]">
                    {result.testingInstructions.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-emerald-400 font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Security Notes */}
              {result.securityNotes && result.securityNotes.length > 0 && (
                <div className="p-4 rounded-xl bg-[#12141D] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Blindagem do Servidor & Anti-Exploit</span>
                  </div>
                  <ul className="space-y-1 text-xs text-[#9699AC]">
                    {result.securityNotes.map((note, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px]">
                        <span className="text-cyan-400">•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
