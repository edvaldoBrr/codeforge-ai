export type GameEngine = 'roblox' | 'unity' | 'multidev';

export type UnityNavPage = 
  | 'unity-dashboard'
  | 'unity-architect'
  | 'unity-generator'
  | 'unity-systems'
  | 'unity-analyzer'
  | 'unity-quality'
  | 'unity-security'
  | 'unity-diff'
  | 'unity-docs'
  | 'unity-projects';

export type MultiDevNavPage =
  | 'multidev-hub'
  | 'multidev-generator'
  | 'multidev-analyzer'
  | 'multidev-architect'
  | 'multidev-quality'
  | 'multidev-translator'
  | 'multidev-cheatsheets'
  | 'multidev-projects';

export type NavPage = 
  | 'dashboard'
  | 'architect'
  | 'generator'
  | 'analyzer'
  | 'system-builder'
  | 'quality'
  | 'security'
  | 'comparator'
  | 'projects'
  | 'library'
  | 'favorites'
  | 'settings'
  | UnityNavPage
  | MultiDevNavPage;

export type ScriptType = 'Script' | 'LocalScript' | 'ModuleScript';

export interface ScriptFile {
  id: string;
  name: string;
  type: ScriptType;
  location: string;
  code: string;
  explanation?: string;
  dependencies?: string[];
  responsibility?: string;
}

export interface ConsistencyCheckItem {
  item: string;
  status: 'ok' | 'warning' | 'error';
  details: string;
}

export interface GeneratedScriptResult {
  id: string;
  title: string;
  summary: string;
  scriptType: string;
  complexity: 'Simples' | 'Intermediário' | 'Avançado';
  files: ScriptFile[];
  requiredServicesAndInstances: string[];
  setupSteps: string[];
  testingInstructions: string[];
  knownLimitations: string[];
  consistencyChecks?: ConsistencyCheckItem[];
  createdAt: string;
}

export interface BugIssue {
  type: 'error' | 'warning' | 'security' | 'perf';
  line?: number;
  title: string;
  explanation: string;
  probableCause: string;
  isConfirmedError: boolean;
  category?: 'direct_output' | 'code_flaw' | 'hypothesis';
}

export interface BugAnalysisResult {
  id: string;
  summary: string;
  issues: BugIssue[];
  originalCode: string;
  fixedCode: string;
  changes: string[];
  testSuggestions: string[];
  alternativeSolutionAvailable?: boolean;
  createdAt: string;
}

export interface CodeExplanationResult {
  overview: string;
  breakdown: Array<{
    section: string;
    lines?: string;
    description: string;
  }>;
  bestPractices: string[];
  robloxServicesUsed: string[];
  creatorHubDocLinks?: Array<{ title: string; url: string }>;
}

export interface SystemHierarchyItem {
  parent: string;
  itemType: string;
  itemName: string;
  notes?: string;
}

export interface GeneratedSystemResult {
  id: string;
  category: string;
  title: string;
  summary: string;
  architecture: string;
  files: ScriptFile[];
  hierarchySetup: SystemHierarchyItem[];
  setupSteps: string[];
  testingInstructions: string[];
  securityNotes: string[];
  createdAt: string;
}

// Project Architect Types
export interface ArchitectSystemItem {
  id: string;
  name: string;
  category: string;
  description: string;
  dependencies: string[];
  suggestedFiles: Array<{
    name: string;
    type: ScriptType;
    location: string;
    purpose: string;
  }>;
  status: 'planned' | 'generated';
  generatedFiles?: ScriptFile[];
}

export interface ArchitectPlan {
  id: string;
  title: string;
  idea: string;
  createdAt: string;
  summary: {
    gameDescription: string;
    coreMechanics: string[];
    technicalChallenges: string[];
    importantDependencies: string[];
  };
  architectureHierarchy: Array<{
    folder: string;
    description: string;
    subitems: Array<{
      name: string;
      itemType: string;
      isCodeForgeScript: boolean;
      description: string;
    }>;
  }>;
  developmentStages: Array<{
    stageNumber: number;
    stageName: string;
    description: string;
    systemsIncluded: string[];
    prerequisites: string[];
  }>;
  plannedSystems: ArchitectSystemItem[];
}

// Code Quality Checker Types
export interface QualityIssue {
  severity: 'error' | 'warning' | 'suggestion' | 'best_practice';
  title: string;
  snippet?: string;
  line?: number;
  explanation: string;
  impact: string;
  suggestedFix: string;
}

export interface CodeQualityResult {
  id: string;
  score: number; // 0 to 100
  summary: string;
  issues: QualityIssue[];
  metrics: {
    lineCount: number;
    functionCount: number;
    servicesCount: number;
    hasStrictDirective: boolean;
  };
  createdAt: string;
}

// Security Audit Types
export interface SecurityVulnerability {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'CLIENT_TRUST' | 'REMOTE_EXPLOIT' | 'DATASTORE_RISK' | 'RATE_LIMIT' | 'AUTHORIZATION';
  title: string;
  codeEvidence: string;
  line?: number;
  exploitImpact: string;
  remediation: string;
  secureExampleCode: string;
}

export interface SecurityAuditResult {
  id: string;
  riskScore: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SECURE';
  summary: string;
  vulnerabilities: SecurityVulnerability[];
  checkedPractices: Array<{ practice: string; passed: boolean; note: string }>;
  robloxSecurityDocsReference: string;
  createdAt: string;
}

// Project & Version Types
export interface ProjectVersion {
  versionId: string;
  versionNumber: string; // e.g. "v1.0"
  timestamp: string;
  changelog: string;
  files: ScriptFile[];
  notes?: string;
}

export interface CodeForgeProject {
  id: string;
  name: string;
  description: string;
  genre?: string;
  createdAt: string;
  updatedAt: string;
  currentVersion: string;
  versions: ProjectVersion[];
  architectPlan?: ArchitectPlan;
  technicalNotes?: string;
  files: ScriptFile[];
}

export interface FavoriteItem {
  id: string;
  title: string;
  scriptType: string;
  location: string;
  code: string;
  files?: ScriptFile[];
  category?: string;
  notes?: string;
  createdAt: string;
  source: 'generator' | 'analyzer' | 'system' | 'library' | 'architect';
}

export interface LibrarySnippet {
  id: string;
  name: string;
  category: 'Movement' | 'Networking' | 'Data' | 'Interface' | 'Interaction' | 'Utilities' | 'Combat' | 'NPC';
  type: ScriptType;
  location: string;
  description: string;
  code: string;
  explanation: string;
  tags: string[];
}

export interface UserPreferences {
  editorTheme: 'luau-dark' | 'obsidian' | 'cyber';
  fontSize: number;
  autoCopyOnGenerate: boolean;
  codeWrapping: boolean;
}

export interface ActivityLog {
  id: string;
  tool: 'generator' | 'analyzer' | 'system' | 'library' | 'architect' | 'quality' | 'security' | 'comparator' | 'projects' | 'unity';
  title: string;
  timestamp: string;
  details?: string;
  engine?: GameEngine;
}

// ==================== UNITY DEVELOPMENT TYPES ====================

export type UnityScriptType = 
  | 'MonoBehaviour' 
  | 'ScriptableObject' 
  | 'StandardClass' 
  | 'Interface' 
  | 'EditorScript';

export interface UnityScriptFile {
  id: string;
  name: string; // e.g. "PlayerController.cs"
  namespaceName?: string;
  scriptType: UnityScriptType;
  assetsPath: string; // e.g. "Assets/Scripts/Player/"
  code: string;
  requiredComponents?: string[];
  inspectorVariables?: Array<{ name: string; type: string; description: string }>;
  summary?: string;
}

export interface UnityGeneratedScriptResult {
  id: string;
  title: string;
  summary: string;
  scriptType: UnityScriptType;
  files: UnityScriptFile[];
  requiredComponents: string[];
  inspectorSetupInstructions: string[];
  sceneSetupSteps: string[];
  testingInstructions: string[];
  unityVersionRecommended: string;
  packagesNeeded?: string[];
  createdAt: string;
}

export interface UnitySystemResult {
  id: string;
  title: string;
  category: string;
  summary: string;
  architectureOverview: string;
  files: UnityScriptFile[];
  gameObjectsToCreate: Array<{ name: string; componentsToAdd: string[]; parent?: string; notes?: string }>;
  inspectorWiring: Array<{ scriptName: string; fieldName: string; targetToAssign: string; description: string }>;
  setupSteps: string[];
  testingSteps: string[];
  prerequisites: string[];
  createdAt: string;
}

export interface UnityBugIssue {
  severity: 'error' | 'warning' | 'performance' | 'lifecycle';
  line?: number;
  title: string;
  snippet?: string;
  explanation: string;
  possibleCause: string;
  suggestedFix: string;
  isConfirmed: boolean;
}

export interface UnityBugResult {
  id: string;
  summary: string;
  issues: UnityBugIssue[];
  originalCode: string;
  fixedCode: string;
  changesMade: string[];
  consoleLogDiagnosis?: string;
  testingAdvice: string[];
  createdAt: string;
}

export interface UnityQualityIssue {
  severity: 'error' | 'warning' | 'suggestion' | 'performance';
  title: string;
  snippet?: string;
  line?: number;
  explanation: string;
  impact: string;
  suggestedFix: string;
}

export interface UnityQualityResult {
  id: string;
  score: number; // 0 to 100
  summary: string;
  issues: UnityQualityIssue[];
  metrics: {
    lineCount: number;
    methodCount: number;
    gcAllocationRisks: number;
    hasProperNamespaces: boolean;
  };
  refactoredCode?: string;
  createdAt: string;
}

export interface UnitySecurityVulnerability {
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'CLIENT_TRUST' | 'MULTIPLAYER_RPC' | 'SAVE_TAMPERING' | 'HARDCODED_SECRETS' | 'UNVALIDATED_INPUT';
  title: string;
  codeEvidence: string;
  line?: number;
  exploitImpact: string;
  remediation: string;
  secureExampleCode: string;
}

export interface UnitySecurityResult {
  id: string;
  riskScore: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SECURE';
  summary: string;
  vulnerabilities: UnitySecurityVulnerability[];
  checkedPractices: Array<{ practice: string; passed: boolean; note: string }>;
  officialDocsReference: string;
  createdAt: string;
}

export interface UnityArchitectPlan {
  id: string;
  title: string;
  gameIdea: string;
  genre: string;
  targetPlatform: string;
  cameraType: string;
  renderPipeline: string;
  inputSystem: string;
  createdAt: string;
  summary: {
    conceptOverview: string;
    coreMechanics: string[];
    technicalRisks: string[];
    recommendedUnityVersion: string;
  };
  assetsFolderHierarchy: Array<{
    folder: string;
    description: string;
    suggestedFiles: string[];
  }>;
  componentsBreakdown: Array<{
    name: string;
    scriptType: UnityScriptType;
    assetsPath: string;
    responsibility: string;
    dependencies: string[];
  }>;
  developmentStages: Array<{
    stageNumber: number;
    stageName: string;
    description: string;
    systemsIncluded: string[];
    prerequisites: string[];
  }>;
}

export interface UnityProject {
  id: string;
  name: string;
  description: string;
  unityVersion: string;
  targetPlatform: string;
  renderPipeline: string;
  inputSystem: string;
  genre?: string;
  files: UnityScriptFile[];
  architectPlan?: UnityArchitectPlan;
  versions: Array<{
    versionId: string;
    versionNumber: string;
    timestamp: string;
    changelog: string;
    files: UnityScriptFile[];
  }>;
  createdAt: string;
  updatedAt: string;
}

// =========================================================================
// MULTI-DEV MULTI-LANGUAGE & MULTI-PLATFORM SYSTEM TYPES
// =========================================================================

export type TechCategory = 'game' | 'web' | 'software' | 'database' | 'mobile';

export interface TechDefinition {
  id: string;
  name: string;
  category: TechCategory;
  categoryLabel: string;
  techKind: 'language' | 'engine' | 'framework' | 'runtime' | 'library' | 'database';
  primaryLanguage: string;
  defaultExtension: string;
  frameworkOrEngine: string;
  version: string;
  projectType: string;
  targetPlatform: string;
  popularPackages: string[];
  codeConventions: string[];
  recommendedFolderStructure: string;
  buildAndRunTools: string[];
  description: string;
  accentColor: string;
  badge: string;
  samplePrompt: string;
}

export interface MultiDevGeneratedFile {
  name: string;
  path: string;
  language: string;
  code: string;
  explanation: string;
}

export interface MultiDevGeneratedCode {
  id: string;
  title: string;
  summary: string;
  techId: string;
  techName: string;
  files: MultiDevGeneratedFile[];
  setupInstructions: string[];
  runInstructions: string[];
  packageDependencies: Array<{ name: string; command: string }>;
  testSnippet?: { name: string; code: string; runCommand: string };
  keyPatterns: string[];
  createdAt: string;
}

export interface MultiDevIssue {
  type: 'error' | 'warning' | 'security' | 'perf';
  title: string;
  line?: number;
  explanation: string;
  solution: string;
}

export interface MultiDevAnalysisResult {
  id: string;
  techId: string;
  summary: string;
  issues: MultiDevIssue[];
  originalCode: string;
  fixedCode: string;
  changesMade: string[];
  idiomaticTips: string[];
  createdAt: string;
}

export interface MultiDevScaffoldResult {
  id: string;
  techId: string;
  projectName: string;
  architectureOverview: string;
  folderHierarchy: Array<{ folder: string; description: string }>;
  manifestFiles: Array<{ filename: string; path: string; content: string; description: string }>;
  coreSourceFiles: Array<{ filename: string; path: string; code: string; purpose: string }>;
  setupCommands: string[];
  runCommands: string[];
  recommendedLibraries: Array<{ name: string; purpose: string }>;
  createdAt: string;
}

export interface MultiDevAuditResult {
  id: string;
  techId: string;
  score: number;
  securityScore: number;
  maintainabilityScore: number;
  performanceScore: number;
  summary: string;
  vulnerabilities: Array<{
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    line?: number;
    description: string;
    remediation: string;
  }>;
  codeSmells: Array<{ title: string; line?: number; advice: string }>;
  adherenceToConventions: Array<{ convention: string; passed: boolean; tip: string }>;
  createdAt: string;
}

export interface MultiDevTranslationResult {
  id: string;
  sourceLang: string;
  targetLang: string;
  sourceCode: string;
  targetCode: string;
  explanation: string;
  paradigmShifts: string[];
  dependenciesNeeded: string[];
  testingNotes: string;
  createdAt: string;
}

export interface MultiDevProject {
  id: string;
  name: string;
  description: string;
  techId: string;
  techName: string;
  targetPlatform: string;
  files: Array<{ name: string; path: string; code: string; language: string }>;
  manifestFiles?: Array<{ filename: string; path: string; content: string }>;
  createdAt: string;
  updatedAt: string;
}

