import React, { useState } from 'react';
import {
  BookOpen,
  ExternalLink,
  Search,
  Box,
  Layers,
  Cpu,
  Gamepad2,
  FileCode,
  Sparkles,
  Zap,
} from 'lucide-react';

interface DocTopic {
  title: string;
  category: string;
  description: string;
  manualUrl: string;
  scriptingApiUrl?: string;
  keyClasses: string[];
}

const OFFICIAL_UNITY_DOCS: DocTopic[] = [
  {
    title: 'GameObjects & Components',
    category: 'Fundação',
    description: 'A entidade fundamental do Unity e a arquitetura orientada a componentes que compõe cada elemento no jogo.',
    manualUrl: 'https://docs.unity3d.com/Manual/class-GameObject.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/GameObject.html',
    keyClasses: ['GameObject', 'Component', 'Transform', 'Instantiate', 'Destroy'],
  },
  {
    title: 'MonoBehaviour & Ciclo de Vida',
    category: 'Fundação',
    description: 'A classe base para todo script que se anexa a um GameObject. Ordem de execução de Awake, OnEnable, Start, Update, FixedUpdate, LateUpdate, OnDestroy.',
    manualUrl: 'https://docs.unity3d.com/Manual/class-MonoBehaviour.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/MonoBehaviour.html',
    keyClasses: ['Awake()', 'Start()', 'Update()', 'FixedUpdate()', 'LateUpdate()', 'OnDestroy()'],
  },
  {
    title: 'Transform & Coordenadas Espaciais',
    category: 'Fundação',
    description: 'Posição, rotação, escala e relações de parentesco (árvore hierárquica) no espaço 3D ou 2D.',
    manualUrl: 'https://docs.unity3d.com/Manual/class-Transform.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/Transform.html',
    keyClasses: ['Transform.position', 'Transform.rotation', 'Transform.forward', 'Transform.parent'],
  },
  {
    title: 'Rigidbody & Sistema de Física',
    category: 'Física',
    description: 'Controle de dinâmica de corpos rígidos, gravidade, forças e velocidades integradas com a engine PhysX.',
    manualUrl: 'https://docs.unity3d.com/Manual/class-Rigidbody.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/Rigidbody.html',
    keyClasses: ['Rigidbody', 'AddForce()', 'linearVelocity', 'isKinematic', 'FixedUpdate()'],
  },
  {
    title: 'Colliders & Detecção de Colisão',
    category: 'Física',
    description: 'Detecção de colisões físicas e áreas de gatilho (Trigger volumes) para interações e detecção de dano.',
    manualUrl: 'https://docs.unity3d.com/Manual/CollidersOverview.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/Collider.html',
    keyClasses: ['BoxCollider', 'SphereCollider', 'OnCollisionEnter()', 'OnTriggerEnter()'],
  },
  {
    title: 'New Input System (com.unity.inputsystem)',
    category: 'Input & Controles',
    description: 'Sistema moderno de controle baseado em ações (Action-based), suportando teclado, mouse, gamepads, touch e remapeamento dinâmico.',
    manualUrl: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@latest/index.html',
    scriptingApiUrl: 'https://docs.unity3d.com/Packages/com.unity.inputsystem@latest/api/UnityEngine.InputSystem.InputAction.html',
    keyClasses: ['PlayerInput', 'InputAction', 'InputActionReference', 'ReadValue<T>()'],
  },
  {
    title: 'ScriptableObjects & Arquitetura de Dados',
    category: 'Arquitetura',
    description: 'Contêineres de dados independentes de cena que evitam duplicações de valores e facilitam criação de itens, magias e sistemas desacoplados.',
    manualUrl: 'https://docs.unity3d.com/Manual/class-ScriptableObject.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/ScriptableObject.html',
    keyClasses: ['ScriptableObject', '[CreateAssetMenu]', 'OnValidate()'],
  },
  {
    title: 'Coroutines & Assincronismo',
    category: 'Lógica & Tempo',
    description: 'Execução de métodos que podem pausar sua execução (yield) e retomar em frames subsequentes sem bloquear a main thread.',
    manualUrl: 'https://docs.unity3d.com/Manual/Coroutines.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/MonoBehaviour.StartCoroutine.html',
    keyClasses: ['StartCoroutine()', 'StopCoroutine()', 'IEnumerator', 'WaitForSeconds', 'WaitUntil'],
  },
  {
    title: 'UI Toolkit & Canvas (uGUI)',
    category: 'Interface',
    description: 'Criação de HUDs, inventários, barras de vida, menus e janelas com TextMeshPro, botões, sliders e âncoras responsivas.',
    manualUrl: 'https://docs.unity3d.com/Manual/UICanvas.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/Canvas.html',
    keyClasses: ['Canvas', 'CanvasScaler', 'TextMeshProUGUI', 'Button', 'Slider'],
  },
  {
    title: 'Scene Management (Carregamento de Cenas)',
    category: 'Cenas & Fluxo',
    description: 'Carregamento síncrono ou assíncrono de fases com telas de loading e gerenciamento aditivo de cenas.',
    manualUrl: 'https://docs.unity3d.com/Manual/MultiSceneEditing.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/SceneManagement.SceneManager.html',
    keyClasses: ['SceneManager.LoadSceneAsync()', 'AsyncOperation', 'SceneManager.sceneLoaded'],
  },
  {
    title: 'NavMesh & IA de Navegação (AI Navigation)',
    category: 'IA & Inimigos',
    description: 'Cálculo de caminhos inteligentes em superfícies navegáveis para NPCs, patrulhas, desvio de obstáculos e perseguição.',
    manualUrl: 'https://docs.unity3d.com/Manual/nav-Overview.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/AI.NavMeshAgent.html',
    keyClasses: ['NavMeshAgent', 'NavMeshSurface', 'NavMeshObstacle', 'SetDestination()'],
  },
  {
    title: 'Áudio & Spatial Sound',
    category: 'Áudio',
    description: 'Reprodução de trilhas e efeitos 3D espaciais com AudioSource, AudioListener e AudioMixer para controle de volume.',
    manualUrl: 'https://docs.unity3d.com/Manual/AudioOverview.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/AudioSource.html',
    keyClasses: ['AudioSource', 'AudioClip', 'AudioListener', 'PlayOneShot()', 'AudioMixer'],
  },
  {
    title: 'Prefabs & Instanciação de Objetos',
    category: 'Assets & Cena',
    description: 'Modelos de GameObjects pré-configurados com componentes e filhos reutilizáveis em múltiplas cenas.',
    manualUrl: 'https://docs.unity3d.com/Manual/Prefabs.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/Object.Instantiate.html',
    keyClasses: ['PrefabUtility', 'Instantiate()', 'PrefabStage'],
  },
  {
    title: 'Multiplayer: Netcode for GameObjects (NGO)',
    category: 'Rede & Multiplayer',
    description: 'Pacote oficial de rede da Unity para jogos cooperativos e competitivos com NetworkBehaviour, ServerRpc e NetworkVariable.',
    manualUrl: 'https://docs-multiplayer.unity.com/netcode/current/about/',
    scriptingApiUrl: 'https://docs-multiplayer.unity.com/netcode/current/api/Unity.Netcode.html',
    keyClasses: ['NetworkBehaviour', 'NetworkVariable<T>', '[ServerRpc]', '[ClientRpc]'],
  },
  {
    title: 'Addressable Asset System',
    category: 'Otimização & Carregamento',
    description: 'Gerenciamento avançado de memória e assets sob demanda para carregar e descarregar texturas, prefabs e áudio.',
    manualUrl: 'https://docs.unity3d.com/Packages/com.unity.addressables@latest/index.html',
    scriptingApiUrl: 'https://docs.unity3d.com/Packages/com.unity.addressables@latest/api/UnityEngine.AddressableAssets.Addressables.html',
    keyClasses: ['Addressables.LoadAssetAsync<T>()', 'AssetReference', 'Addressables.Release()'],
  },
  {
    title: 'Otimização de Desempenho & Profiler',
    category: 'Performance',
    description: 'Diagnóstico de CPU, GPU, alocações de memória (Garbage Collection), draw calls e renderização URP.',
    manualUrl: 'https://docs.unity3d.com/Manual/Profiler.html',
    scriptingApiUrl: 'https://docs.unity3d.com/ScriptReference/Profiling.Profiler.html',
    keyClasses: ['Profiler', 'CustomSampler', 'GC.Collect()'],
  },
];

export const UnityDocsView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', ...Array.from(new Set(OFFICIAL_UNITY_DOCS.map((d) => d.category)))];

  const filtered = OFFICIAL_UNITY_DOCS.filter((doc) => {
    const matchCat = selectedCategory === 'Todos' || doc.category === selectedCategory;
    const matchSearch =
      doc.title.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase()) ||
      doc.keyClasses.some((c) => c.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-[#A995FF] text-xs font-mono font-medium">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Documentação Oficial Unity</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Referências Oficiais do Unity Manual & Scripting API
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Consulte a documentação técnica oficial de C#, ciclos de vida de MonoBehaviours,
              física, New Input System, URP, ScriptableObjects e otimização.
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6C7086] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar assunto ou classe (ex: Rigidbody, Coroutine, Input)..."
            className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex-shrink-0 ${
                selectedCategory === cat
                  ? 'bg-[#8065F5]/20 text-[#F5F5FA] border-[#8065F5]/50'
                  : 'bg-[#0B0C12] text-[#9699AC] border-[#292C3B] hover:text-[#F5F5FA]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Docs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((topic, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#12141D] border border-[#292C3B] hover:border-[#8065F5]/40 transition-all flex flex-col justify-between space-y-4 shadow-md"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#191C28] text-[#A995FF] border border-[#292C3B] uppercase">
                  {topic.category}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#F5F5FA]">{topic.title}</h3>
              <p className="text-xs text-[#9699AC] leading-relaxed">{topic.description}</p>

              <div className="pt-2">
                <span className="text-[10px] text-[#6C7086] font-semibold uppercase tracking-wider block mb-1.5">
                  Classes / Métodos Principais:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {topic.keyClasses.map((cl, ci) => (
                    <span
                      key={ci}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0B0C12] text-[#F5F5FA]/90 border border-[#292C3B]"
                    >
                      {cl}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#292C3B]/60 flex items-center justify-between text-xs">
              <a
                href={topic.manualUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[#8065F5] hover:text-[#A995FF] transition-colors"
              >
                <span>Unity Manual</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {topic.scriptingApiUrl && (
                <a
                  href={topic.scriptingApiUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#9699AC] hover:text-[#F5F5FA] transition-colors"
                >
                  <span>Scripting API</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
