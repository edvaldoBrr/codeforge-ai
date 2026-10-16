import React, { useState, useEffect } from 'react';
import {
  NavPage,
  GameEngine,
  FavoriteItem,
  ActivityLog,
  UserPreferences,
  LibrarySnippet,
  CodeForgeProject,
  UnityProject,
  MultiDevProject,
} from './types/codeforge';
import {
  getFavorites,
  saveFavorite,
  removeFavorite,
  isFavorite,
  getActivityLog,
  logActivity,
  getPreferences,
  savePreferences,
  getProjects,
  getActiveEngine,
  setActiveEngine,
  getUnityProjects,
  getActiveTechId,
  setActiveTechId,
  getMultiDevProjects,
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ExplainModal } from './components/ExplainModal';

// Roblox Views
import { DashboardView } from './views/DashboardView';
import { ScriptGeneratorView } from './views/ScriptGeneratorView';
import { BugAnalyzerView } from './views/BugAnalyzerView';
import { SystemBuilderView } from './views/SystemBuilderView';
import { ScriptLibraryView } from './views/ScriptLibraryView';
import { FavoritesView } from './views/FavoritesView';
import { SettingsView } from './views/SettingsView';
import { ArchitectView } from './views/ArchitectView';
import { CodeQualityView } from './views/CodeQualityView';
import { SecurityAuditView } from './views/SecurityAuditView';
import { CodeComparatorView } from './views/CodeComparatorView';
import { ProjectsManagerView } from './views/ProjectsManagerView';

// Unity Views
import { UnityDashboardView } from './views/unity/UnityDashboardView';
import { UnityScriptGeneratorView } from './views/unity/UnityScriptGeneratorView';
import { UnityBugAnalyzerView } from './views/unity/UnityBugAnalyzerView';
import { UnitySystemsView } from './views/unity/UnitySystemsView';
import { UnityQualityView } from './views/unity/UnityQualityView';
import { UnitySecurityView } from './views/unity/UnitySecurityView';
import { UnityDiffView } from './views/unity/UnityDiffView';
import { UnityDocsView } from './views/unity/UnityDocsView';
import { UnityProjectsView } from './views/unity/UnityProjectsView';
import { UnityArchitectView } from './views/unity/UnityArchitectView';

// Multi-Dev Views
import { MultiDevHubView } from './views/multidev/MultiDevHubView';
import { MultiDevGeneratorView } from './views/multidev/MultiDevGeneratorView';
import { MultiDevAnalyzerView } from './views/multidev/MultiDevAnalyzerView';
import { MultiDevArchitectView } from './views/multidev/MultiDevArchitectView';
import { MultiDevQualityView } from './views/multidev/MultiDevQualityView';
import { MultiDevTranslatorView } from './views/multidev/MultiDevTranslatorView';
import { MultiDevCheatsheetsView } from './views/multidev/MultiDevCheatsheetsView';
import { MultiDevProjectsView } from './views/multidev/MultiDevProjectsView';

export default function App() {
  const [activeEngine, setActiveEngineState] = useState<GameEngine>(getActiveEngine());
  const [currentPage, setCurrentPage] = useState<NavPage>(
    activeEngine === 'unity'
      ? 'unity-dashboard'
      : activeEngine === 'multidev'
      ? 'multidev-hub'
      : 'dashboard'
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Active Technology in Multi-Dev (30 supported technologies)
  const [activeTechId, setActiveTechIdState] = useState<string>(getActiveTechId());

  // Persistence State
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>(getPreferences());
  const [projectsCount, setProjectsCount] = useState<number>(0);
  const [unityProjectsCount, setUnityProjectsCount] = useState<number>(0);
  const [multidevProjectsCount, setMultidevProjectsCount] = useState<number>(0);

  // Cross-tool navigation prefill (Roblox)
  const [generatorPrefill, setGeneratorPrefill] = useState<{
    title?: string;
    description?: string;
    scriptType?: string;
  }>({});
  const [systemCategory, setSystemCategory] = useState<string>('movement');

  // Cross-tool navigation prefill (Unity)
  const [unityGeneratorPrefill, setUnityGeneratorPrefill] = useState<{
    title?: string;
    description?: string;
    scriptType?: string;
  }>({});
  const [unitySystemCategory, setUnitySystemCategory] = useState<string>('Inventory & Items');

  // Cross-tool navigation prefill (Multi-Dev)
  const [multiDevPrefillPrompt, setMultiDevPrefillPrompt] = useState<string>('');

  // Explain Code Modal
  const [explainModal, setExplainModal] = useState<{
    isOpen: boolean;
    code: string;
    context: string;
  }>({
    isOpen: false,
    code: '',
    context: '',
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // API Status
  const [apiStatus, setApiStatus] = useState<{
    ready: boolean;
    hasKey: boolean;
    loading: boolean;
  }>({
    ready: true,
    hasKey: true,
    loading: true,
  });

  // Load local state and check API status on mount
  useEffect(() => {
    setFavorites(getFavorites());
    setActivityLogs(getActivityLog());
    setPreferences(getPreferences());
    setProjectsCount(getProjects().length);
    setUnityProjectsCount(getUnityProjects().length);
    setMultidevProjectsCount(getMultiDevProjects().length);

    // Check backend status
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setApiStatus({
          ready: Boolean(data.ready),
          hasKey: Boolean(data.hasKey),
          loading: false,
        });
      })
      .catch((err) => {
        console.warn('Backend status check warning:', err);
        setApiStatus({
          ready: false,
          hasKey: false,
          loading: false,
        });
      });
  }, []);

  const handleSelectEngine = (engine: GameEngine) => {
    setActiveEngineState(engine);
    setActiveEngine(engine);

    if (engine === 'unity' && !currentPage.startsWith('unity-')) {
      setCurrentPage('unity-dashboard');
      showToast('info', 'Área de Desenvolvimento Unity ativada (C#).');
    } else if (engine === 'multidev' && !currentPage.startsWith('multidev-')) {
      setCurrentPage('multidev-hub');
      showToast('info', 'Área Multi-Dev ativada (Multi-Linguagem & Multi-Plataforma).');
    } else if (
      engine === 'roblox' &&
      (currentPage.startsWith('unity-') || currentPage.startsWith('multidev-'))
    ) {
      setCurrentPage('dashboard');
      showToast('info', 'Área de Desenvolvimento Roblox Studio ativada (Luau).');
    }
  };

  const handleSelectActiveTech = (techId: string) => {
    setActiveTechIdState(techId);
    setActiveTechId(techId);
    showToast('info', `Tecnologia ativa alterada no Multi-Dev.`);
  };

  const showToast = (type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSaveFavorite = (item: {
    title: string;
    scriptType: string;
    location: string;
    code: string;
    files?: any[];
    notes?: string;
    category?: string;
  }) => {
    const favItem: FavoriteItem = {
      id: `fav-${Date.now()}`,
      title: item.title,
      scriptType: item.scriptType,
      location: item.location,
      code: item.code,
      files: item.files,
      notes: item.notes,
      category: item.category,
      createdAt: new Date().toISOString(),
      source: (item as any).source || 'generator',
    };
    const updated = saveFavorite(favItem);
    setFavorites(updated);
    showToast('success', 'Salvo com sucesso nos favoritos!');
  };

  const handleRemoveFavorite = (id: string) => {
    const updated = removeFavorite(id);
    setFavorites(updated);
    showToast('info', 'Item removido dos favoritos.');
  };

  const handleLogActivity = (tool: any, title?: string, details?: string) => {
    const validTool = [
      'generator',
      'analyzer',
      'system',
      'library',
      'architect',
      'quality',
      'security',
      'comparator',
      'projects',
      'unity',
    ].includes(tool)
      ? tool
      : 'generator';
    const updated = logActivity(validTool as any, title || tool, details);
    setActivityLogs(updated);
  };

  const handleUpdatePreferences = (newPrefs: Partial<UserPreferences>) => {
    const updated = savePreferences(newPrefs);
    setPreferences(updated);
    showToast('success', 'Preferências salvas com sucesso.');
  };

  const handleDataReset = () => {
    setFavorites([]);
    setActivityLogs([]);
    setProjectsCount(0);
    setUnityProjectsCount(0);
    setMultidevProjectsCount(0);
    showToast('info', 'Todos os dados locais foram redefinidos.');
  };

  const handleExplainRequest = (code: string, context?: string) => {
    setExplainModal({
      isOpen: true,
      code,
      context: context || 'Código em análise',
    });
  };

  const handleOpenSnippetInGenerator = (snippet: LibrarySnippet) => {
    setGeneratorPrefill({
      title: snippet.name,
      description: snippet.description,
      scriptType: snippet.type,
    });
    setCurrentPage('generator');
  };

  const handleLaunchUnityGenerator = (prefill: { title: string; description: string; scriptType?: string }) => {
    setUnityGeneratorPrefill(prefill);
    setCurrentPage('unity-generator');
  };

  const handleLaunchUnitySystem = (category: string) => {
    setUnitySystemCategory(category);
    setCurrentPage('unity-systems');
  };

  const handlePrefillMultiDevGenerator = (techId: string, promptText: string) => {
    setActiveTechIdState(techId);
    setActiveTechId(techId);
    setMultiDevPrefillPrompt(promptText);
    setCurrentPage('multidev-generator');
  };

  return (
    <div className="flex h-screen bg-[#0E1017] text-[#F5F5FA] font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page);
          setMobileMenuOpen(false);
          // Sync active engine tab if page belongs to another environment
          if (page.startsWith('unity-') && activeEngine !== 'unity') {
            setActiveEngineState('unity');
            setActiveEngine('unity');
          } else if (page.startsWith('multidev-') && activeEngine !== 'multidev') {
            setActiveEngineState('multidev');
            setActiveEngine('multidev');
          } else if (
            !page.startsWith('unity-') &&
            !page.startsWith('multidev-') &&
            activeEngine !== 'roblox'
          ) {
            setActiveEngineState('roblox');
            setActiveEngine('roblox');
          }
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        favoritesCount={favorites.length}
        projectsCount={projectsCount}
        unityProjectsCount={unityProjectsCount}
        multidevProjectsCount={multidevProjectsCount}
        activeEngine={activeEngine}
        onSelectEngine={handleSelectEngine}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#0E1017]">
        {/* Top Header */}
        <Header
          currentPage={currentPage}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          apiStatus={apiStatus}
          activeEngine={activeEngine}
          onSelectEngine={handleSelectEngine}
        />

        {/* View Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 scrollbar-thin">
          {/* ================= ROBLOX STUDIO VIEWS ================= */}
          {currentPage === 'dashboard' && (
            <DashboardView
              onNavigate={(page) => setCurrentPage(page)}
              onLaunchGenerator={(prefill) => {
                setGeneratorPrefill(prefill);
                setCurrentPage('generator');
              }}
              onLaunchSystem={(cat) => {
                setSystemCategory(cat);
                setCurrentPage('system-builder');
              }}
              activityLogs={activityLogs}
              favoritesCount={favorites.length}
            />
          )}

          {currentPage === 'architect' && (
            <ArchitectView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
              onNavigateToProjects={() => {
                setProjectsCount(getProjects().length);
                setCurrentPage('projects');
              }}
            />
          )}

          {currentPage === 'generator' && (
            <ScriptGeneratorView
              initialValues={generatorPrefill}
              preferences={preferences}
              onSaveFavorite={handleSaveFavorite}
              isFavorited={(title) => isFavorite(title)}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'analyzer' && (
            <BugAnalyzerView
              preferences={preferences}
              onLogActivity={handleLogActivity}
              onExplainRequest={handleExplainRequest}
              showToast={showToast}
            />
          )}

          {currentPage === 'system-builder' && (
            <SystemBuilderView
              initialCategory={systemCategory}
              preferences={preferences}
              onSaveFavorite={handleSaveFavorite}
              isFavorited={(title) => isFavorite(title)}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'quality' && (
            <CodeQualityView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'security' && (
            <SecurityAuditView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'comparator' && (
            <CodeComparatorView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'projects' && (
            <ProjectsManagerView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
              onNavigateToArchitect={() => setCurrentPage('architect')}
            />
          )}

          {currentPage === 'library' && (
            <ScriptLibraryView
              preferences={preferences}
              onSaveFavorite={handleSaveFavorite}
              isFavorited={(title) => isFavorite(title)}
              onOpenInGenerator={handleOpenSnippetInGenerator}
              showToast={showToast}
            />
          )}

          {currentPage === 'favorites' && (
            <FavoritesView
              favorites={favorites}
              preferences={preferences}
              onRemoveFavorite={handleRemoveFavorite}
              onExplainRequest={handleExplainRequest}
              showToast={showToast}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              preferences={preferences}
              onUpdatePreferences={handleUpdatePreferences}
              onDataReset={handleDataReset}
              apiStatus={apiStatus}
              showToast={showToast}
            />
          )}

          {/* ================= UNITY VIEWS ================= */}
          {currentPage === 'unity-dashboard' && (
            <UnityDashboardView
              onNavigate={(page) => setCurrentPage(page)}
              onLaunchGenerator={handleLaunchUnityGenerator}
              onLaunchSystem={handleLaunchUnitySystem}
              activityLogs={activityLogs}
            />
          )}

          {currentPage === 'unity-architect' && (
            <UnityArchitectView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
              onNavigateToProjects={() => {
                setUnityProjectsCount(getUnityProjects().length);
                setCurrentPage('unity-projects');
              }}
            />
          )}

          {currentPage === 'unity-generator' && (
            <UnityScriptGeneratorView
              initialValues={unityGeneratorPrefill}
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'unity-systems' && (
            <UnitySystemsView
              initialCategory={unitySystemCategory}
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'unity-analyzer' && (
            <UnityBugAnalyzerView
              preferences={preferences}
              onLogActivity={handleLogActivity}
              onExplainRequest={handleExplainRequest}
              showToast={showToast}
            />
          )}

          {currentPage === 'unity-quality' && (
            <UnityQualityView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'unity-security' && (
            <UnitySecurityView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'unity-diff' && (
            <UnityDiffView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
            />
          )}

          {currentPage === 'unity-projects' && (
            <UnityProjectsView
              preferences={preferences}
              onExplainRequest={handleExplainRequest}
              onLogActivity={handleLogActivity}
              showToast={showToast}
              onNavigateToArchitect={() => setCurrentPage('unity-architect')}
            />
          )}

          {currentPage === 'unity-docs' && <UnityDocsView />}

          {/* ================= MULTI-DEV VIEWS ================= */}
          {currentPage === 'multidev-hub' && (
            <MultiDevHubView
              activeTechId={activeTechId}
              onSelectActiveTech={handleSelectActiveTech}
              onNavigate={(page) => setCurrentPage(page)}
              onPrefillGenerator={handlePrefillMultiDevGenerator}
            />
          )}

          {currentPage === 'multidev-generator' && (
            <MultiDevGeneratorView
              activeTechId={activeTechId}
              onSelectActiveTech={handleSelectActiveTech}
              prefillPrompt={multiDevPrefillPrompt}
              onClearPrefill={() => setMultiDevPrefillPrompt('')}
            />
          )}

          {currentPage === 'multidev-analyzer' && (
            <MultiDevAnalyzerView
              activeTechId={activeTechId}
              onSelectActiveTech={handleSelectActiveTech}
            />
          )}

          {currentPage === 'multidev-architect' && (
            <MultiDevArchitectView
              activeTechId={activeTechId}
              onSelectActiveTech={handleSelectActiveTech}
            />
          )}

          {currentPage === 'multidev-quality' && (
            <MultiDevQualityView
              activeTechId={activeTechId}
              onSelectActiveTech={handleSelectActiveTech}
            />
          )}

          {currentPage === 'multidev-translator' && <MultiDevTranslatorView />}

          {currentPage === 'multidev-cheatsheets' && (
            <MultiDevCheatsheetsView
              activeTechId={activeTechId}
              onSelectActiveTech={handleSelectActiveTech}
            />
          )}

          {currentPage === 'multidev-projects' && (
            <MultiDevProjectsView
              onOpenGenerator={(techId) => {
                setActiveTechIdState(techId);
                setActiveTechId(techId);
                setCurrentPage('multidev-generator');
              }}
            />
          )}
        </main>
      </div>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Explain Code Modal */}
      <ExplainModal
        isOpen={explainModal.isOpen}
        onClose={() => setExplainModal((prev) => ({ ...prev, isOpen: false }))}
        code={explainModal.code}
        context={explainModal.context}
      />
    </div>
  );
}
