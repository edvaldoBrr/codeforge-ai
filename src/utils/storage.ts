import JSZip from 'jszip';
import {
  FavoriteItem,
  ActivityLog,
  UserPreferences,
  CodeForgeProject,
  ProjectVersion,
  ArchitectPlan,
  ScriptFile,
  GameEngine,
  UnityProject,
  UnityScriptFile,
  MultiDevProject,
} from '../types/codeforge';

const FAVORITES_KEY = 'codeforge_favorites_v1';
const ACTIVITY_KEY = 'codeforge_activity_v1';
const PREFS_KEY = 'codeforge_prefs_v1';
const PROJECTS_KEY = 'codeforge_projects_v1';
const ARCHITECT_PLANS_KEY = 'codeforge_architect_plans_v1';
const UNITY_PROJECTS_KEY = 'codeforge_unity_projects_v1';
const ACTIVE_ENGINE_KEY = 'codeforge_active_engine_v1';
const ACTIVE_TECH_KEY = 'codeforge_active_tech_v1';
const MULTIDEV_PROJECTS_KEY = 'codeforge_multidev_projects_v1';

const DEFAULT_PREFS: UserPreferences = {
  editorTheme: 'luau-dark',
  fontSize: 14,
  autoCopyOnGenerate: false,
  codeWrapping: true,
};

// Safe JSON parse helper
function safeParse<T>(jsonString: string | null, fallback: T): T {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString) as T;
  } catch (err) {
    console.error('Error parsing local storage item:', err);
    return fallback;
  }
}

// Favorites
export function getFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return safeParse<FavoriteItem[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveFavorite(item: FavoriteItem): FavoriteItem[] {
  const current = getFavorites();
  const existingIdx = current.findIndex(
    (f) => f.id === item.id || (f.title === item.title && f.code === item.code)
  );
  let updated: FavoriteItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = item;
  } else {
    updated = [item, ...current];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
  return updated;
}

export function removeFavorite(id: string): FavoriteItem[] {
  const current = getFavorites();
  const updated = current.filter((f) => f.id !== id);
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove from localStorage:', err);
  }
  return updated;
}

export function isFavorite(idOrTitle: string): boolean {
  const current = getFavorites();
  return current.some((f) => f.id === idOrTitle || f.title === idOrTitle);
}

// Activity Log
export function getActivityLog(): ActivityLog[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return safeParse<ActivityLog[]>(raw, []);
  } catch {
    return [];
  }
}

export function logActivity(
  tool: ActivityLog['tool'],
  title: string,
  details?: string
): ActivityLog[] {
  const current = getActivityLog();
  const newEntry: ActivityLog = {
    id: `act-${Date.now()}`,
    tool,
    title,
    timestamp: new Date().toISOString(),
    details,
  };
  const updated = [newEntry, ...current].slice(0, 40);
  try {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
  return updated;
}

// Preferences
export function getPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return safeParse<UserPreferences>(raw, DEFAULT_PREFS);
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated = { ...current, ...prefs };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save preferences:', err);
  }
  return updated;
}

// Projects & Versioning
export function getProjects(): CodeForgeProject[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    return safeParse<CodeForgeProject[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveProject(project: CodeForgeProject): CodeForgeProject[] {
  const current = getProjects();
  const idx = current.findIndex((p) => p.id === project.id);
  let updated: CodeForgeProject[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...project, updatedAt: new Date().toISOString() }, ...current];
  }
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save project:', err);
  }
  return updated;
}

export function removeProject(id: string): CodeForgeProject[] {
  const current = getProjects();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove project:', err);
  }
  return updated;
}

export function getProjectById(id: string): CodeForgeProject | undefined {
  const current = getProjects();
  return current.find((p) => p.id === id);
}

export function createProjectVersion(
  projectId: string,
  changelog: string,
  notes?: string
): CodeForgeProject | null {
  const current = getProjects();
  const project = current.find((p) => p.id === projectId);
  if (!project) return null;

  const currentVerNumber = project.currentVersion || 'v1.0';
  const numPart = parseFloat(currentVerNumber.replace('v', '')) || 1.0;
  const nextVerNumber = `v${(numPart + 0.1).toFixed(1)}`;

  const newVersion: ProjectVersion = {
    versionId: `ver-${Date.now()}`,
    versionNumber: nextVerNumber,
    timestamp: new Date().toISOString(),
    changelog: changelog || 'Atualização de scripts e arquitetura',
    files: JSON.parse(JSON.stringify(project.files || [])),
    notes,
  };

  const updatedProject: CodeForgeProject = {
    ...project,
    currentVersion: nextVerNumber,
    versions: [newVersion, ...(project.versions || [])],
    updatedAt: new Date().toISOString(),
  };

  saveProject(updatedProject);
  return updatedProject;
}

// Architect Plans
export function getArchitectPlans(): ArchitectPlan[] {
  try {
    const raw = localStorage.getItem(ARCHITECT_PLANS_KEY);
    return safeParse<ArchitectPlan[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveArchitectPlan(plan: ArchitectPlan): ArchitectPlan[] {
  const current = getArchitectPlans();
  const idx = current.findIndex((p) => p.id === plan.id);
  let updated: ArchitectPlan[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = plan;
  } else {
    updated = [plan, ...current];
  }
  try {
    localStorage.setItem(ARCHITECT_PLANS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save architect plan:', err);
  }
  return updated;
}

export function removeArchitectPlan(id: string): ArchitectPlan[] {
  const current = getArchitectPlans();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(ARCHITECT_PLANS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove architect plan:', err);
  }
  return updated;
}

// Storage stats & export
export function getStorageStats() {
  const favorites = getFavorites();
  const activities = getActivityLog();
  const projects = getProjects();
  const plans = getArchitectPlans();
  let bytesUsed = 0;
  try {
    for (const key of [
      FAVORITES_KEY,
      ACTIVITY_KEY,
      PREFS_KEY,
      PROJECTS_KEY,
      ARCHITECT_PLANS_KEY,
    ]) {
      const val = localStorage.getItem(key);
      if (val) bytesUsed += val.length * 2;
    }
  } catch {
    // ignore
  }
  return {
    favoriteCount: favorites.length,
    activityCount: activities.length,
    projectCount: projects.length,
    planCount: plans.length,
    bytesUsed,
    kbUsed: (bytesUsed / 1024).toFixed(1),
  };
}

export function clearAllLocalData(): void {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(ACTIVITY_KEY);
    localStorage.removeItem(PREFS_KEY);
    localStorage.removeItem(PROJECTS_KEY);
    localStorage.removeItem(ARCHITECT_PLANS_KEY);
  } catch {
    // ignore
  }
}

// Download helper for single .luau script
export function downloadLuaScript(filename: string, code: string): void {
  const cleanName =
    filename.endsWith('.lua') || filename.endsWith('.luau')
      ? filename
      : `${filename}.luau`;

  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export Project as ZIP with organized folder structure matching Roblox Studio Explorer
export async function exportProjectToZip(
  projectName: string,
  files: ScriptFile[],
  projectMeta?: any
): Promise<void> {
  const zip = new JSZip();

  // README with setup guide
  let readme = `# ${projectName} - Exportado pelo CodeForge\n\n`;
  readme += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n`;
  readme += `Total de Scripts: ${files.length}\n\n`;
  readme += `## Como instalar no Roblox Studio:\n`;
  readme += `1. Extraia o conteúdo deste arquivo ZIP.\n`;
  readme += `2. Crie ou localize no Explorer do Roblox Studio as pastas correspondentes:\n`;
  readme += `   - ServerScriptService\n`;
  readme += `   - ReplicatedStorage\n`;
  readme += `   - StarterPlayer / StarterPlayerScripts ou StarterCharacterScripts\n`;
  readme += `   - StarterGui\n`;
  readme += `   - ServerStorage\n`;
  readme += `3. Cole cada arquivo no local indicado.\n\n`;
  readme += `## Scripts incluídos:\n`;

  files.forEach((file) => {
    readme += `- **${file.name}** (${file.type}) -> Local: \`${file.location}\`\n`;
    if (file.explanation) {
      readme += `  * ${file.explanation}\n`;
    }

    // Sanitize folder path
    const folderName = file.location
      ? file.location.replace(/[\/\\:]/g, '_').trim()
      : 'Miscellaneous';

    const safeFilename = file.name.endsWith('.luau') || file.name.endsWith('.lua')
      ? file.name
      : `${file.name}.luau`;

    const folder = zip.folder(folderName);
    if (folder) {
      folder.file(safeFilename, file.code || '-- Script vazio');
    } else {
      zip.file(`${folderName}_${safeFilename}`, file.code || '-- Script vazio');
    }
  });

  if (projectMeta) {
    zip.file('project-manifest.json', JSON.stringify(projectMeta, null, 2));
  }
  zip.file('README_CODEFORGE.md', readme);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_codeforge.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export Project as JSON
export function exportProjectToJson(project: CodeForgeProject): void {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_manifest.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== UNITY PROJECTS & ENGINE SELECTION ====================

export function getActiveEngine(): GameEngine {
  try {
    const raw = localStorage.getItem(ACTIVE_ENGINE_KEY);
    if (raw === 'unity') return 'unity';
    if (raw === 'multidev') return 'multidev';
    return 'roblox';
  } catch {
    return 'roblox';
  }
}

export function setActiveEngine(engine: GameEngine): void {
  try {
    localStorage.setItem(ACTIVE_ENGINE_KEY, engine);
  } catch (err) {
    console.error('Failed to set active engine:', err);
  }
}

export function getUnityProjects(): UnityProject[] {
  try {
    const raw = localStorage.getItem(UNITY_PROJECTS_KEY);
    return safeParse<UnityProject[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveUnityProject(project: UnityProject): UnityProject[] {
  const current = getUnityProjects();
  const idx = current.findIndex((p) => p.id === project.id);
  let updated: UnityProject[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...project, updatedAt: new Date().toISOString() }, ...current];
  }
  try {
    localStorage.setItem(UNITY_PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save Unity project:', err);
  }
  return updated;
}

export function removeUnityProject(id: string): UnityProject[] {
  const current = getUnityProjects();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(UNITY_PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove Unity project:', err);
  }
  return updated;
}

export function getUnityProjectById(id: string): UnityProject | undefined {
  const current = getUnityProjects();
  return current.find((p) => p.id === id);
}

// Export Unity Project as ZIP with Assets/Scripts structure
export async function exportUnityProjectToZip(
  projectName: string,
  files: UnityScriptFile[],
  projectMeta?: any
): Promise<void> {
  const zip = new JSZip();

  let readme = `# ${projectName} - Exportado pelo CodeForge (Unity Area)\n\n`;
  readme += `Data de Exportação: ${new Date().toLocaleString('pt-BR')}\n`;
  readme += `Versão da Unity: ${projectMeta?.unityVersion || 'Unity 2022.3 LTS+'}\n`;
  readme += `Plataforma Alvo: ${projectMeta?.targetPlatform || 'PC'}\n`;
  readme += `Pipeline de Renderização: ${projectMeta?.renderPipeline || 'Universal RP (URP)'}\n`;
  readme += `Total de Scripts C#: ${files.length}\n\n`;

  readme += `## Como instalar no Unity Editor:\n`;
  readme += `1. Abra seu projeto no Unity Hub.\n`;
  readme += `2. Extraia o conteúdo deste arquivo ZIP diretamente na pasta \`Assets\` do seu projeto Unity.\n`;
  readme += `3. O Unity compilará automaticamente os scripts C#.\n`;
  readme += `4. Crie os GameObjects correspondentes e arraste os componentes nos GameObjects conforme a documentação de cada script.\n\n`;

  readme += `## Scripts incluídos:\n`;

  files.forEach((file) => {
    readme += `- **${file.name}** (${file.scriptType}) -> Pasta: \`${file.assetsPath}\`\n`;
    if (file.summary) {
      readme += `  * Finalidade: ${file.summary}\n`;
    }
    if (file.requiredComponents && file.requiredComponents.length > 0) {
      readme += `  * Componentes Requeridos: ${file.requiredComponents.join(', ')}\n`;
    }

    // Clean folder path, standardizing to Assets/...
    let cleanFolder = file.assetsPath ? file.assetsPath.replace(/^Assets\//, '').trim() : 'Scripts';
    cleanFolder = cleanFolder.replace(/^\/+/, '').replace(/\/+$/, '');

    const safeFilename = file.name.endsWith('.cs') ? file.name : `${file.name}.cs`;

    const folder = zip.folder(`Assets/${cleanFolder}`);
    if (folder) {
      folder.file(safeFilename, file.code || '// Empty script');
    } else {
      zip.file(`Assets/${cleanFolder}/${safeFilename}`, file.code || '// Empty script');
    }
  });

  if (projectMeta) {
    zip.file('unity-project-manifest.json', JSON.stringify(projectMeta, null, 2));
  }
  zip.file('README_UNITY_SETUP.md', readme);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_unity_assets.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportUnityProjectToJson(project: UnityProject): void {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_unity_manifest.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ==================== MULTI-DEV TECHNOLOGY & PROJECTS ====================

export function getActiveTechId(): string {
  try {
    const raw = localStorage.getItem(ACTIVE_TECH_KEY);
    return raw || 'python-apps';
  } catch {
    return 'python-apps';
  }
}

export function setActiveTechId(techId: string): void {
  try {
    localStorage.setItem(ACTIVE_TECH_KEY, techId);
  } catch (err) {
    console.error('Failed to set active tech:', err);
  }
}

export function getMultiDevProjects(): MultiDevProject[] {
  try {
    const raw = localStorage.getItem(MULTIDEV_PROJECTS_KEY);
    return safeParse<MultiDevProject[]>(raw, []);
  } catch {
    return [];
  }
}

export function saveMultiDevProject(project: MultiDevProject): MultiDevProject[] {
  const current = getMultiDevProjects();
  const idx = current.findIndex((p) => p.id === project.id);
  let updated: MultiDevProject[];
  if (idx >= 0) {
    updated = [...current];
    updated[idx] = { ...project, updatedAt: new Date().toISOString() };
  } else {
    updated = [{ ...project, updatedAt: new Date().toISOString() }, ...current];
  }
  try {
    localStorage.setItem(MULTIDEV_PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save multidev project:', err);
  }
  return updated;
}

export function removeMultiDevProject(id: string): MultiDevProject[] {
  const current = getMultiDevProjects();
  const updated = current.filter((p) => p.id !== id);
  try {
    localStorage.setItem(MULTIDEV_PROJECTS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to remove multidev project:', err);
  }
  return updated;
}

export function getMultiDevProjectById(id: string): MultiDevProject | undefined {
  const current = getMultiDevProjects();
  return current.find((p) => p.id === id);
}

export function downloadCodeFile(filename: string, code: string): void {
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportMultiDevProjectToZip(project: MultiDevProject): Promise<void> {
  const zip = new JSZip();

  // Add source files
  project.files.forEach((f) => {
    const cleanPath = (f.path || '').replace(/^\/+/, '');
    const fullPath = cleanPath ? `${cleanPath}/${f.name}` : f.name;
    zip.file(fullPath, f.code || '// Empty file');
  });

  // Add manifest files if present
  if (project.manifestFiles && project.manifestFiles.length > 0) {
    project.manifestFiles.forEach((mf) => {
      const cleanPath = (mf.path || '').replace(/^\/+/, '');
      const fullPath = cleanPath ? `${cleanPath}/${mf.filename}` : mf.filename;
      zip.file(fullPath, mf.content);
    });
  }

  // Generate README
  const readme = `# ${project.name}
${project.description || 'Projeto gerado com CodeForge Multi-Dev.'}

## Tecnologia
- **Ambiente:** ${project.techName} (${project.techId})
- **Plataforma:** ${project.targetPlatform}
- **Gerado em:** ${new Date(project.createdAt).toLocaleString()}

## Estrutura de Arquivos
${project.files.map((f) => `- \`${f.path ? f.path + '/' : ''}${f.name}\``).join('\n')}

---
*Gerado via CodeForge Multi-Dev Platform*
`;
  zip.file('README.md', readme);

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_multidev.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportMultiDevProjectToJson(project: MultiDevProject): void {
  const data = JSON.stringify(project, null, 2);
  const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}_manifest.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


