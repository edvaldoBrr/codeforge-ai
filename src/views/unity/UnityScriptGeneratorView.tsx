import React, { useState } from 'react';
import {
  FileCode,
  Sparkles,
  RefreshCw,
  FolderTree,
  ListOrdered,
  FlaskConical,
  Layers,
  Info,
  HelpCircle,
  Copy,
  Download,
  FolderArchive,
  CheckCircle2,
  Sliders,
  Settings,
} from 'lucide-react';
import {
  UnityGeneratedScriptResult,
  UnityScriptFile,
  UnityScriptType,
  UserPreferences,
  UnityProject,
} from '../../types/codeforge';
import { CodeViewer } from '../../components/CodeViewer';
import { getUnityProjects, saveUnityProject } from '../../utils/storage';

interface UnityScriptGeneratorViewProps {
  initialValues?: {
    title?: string;
    description?: string;
    scriptType?: string;
  };
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

export const UnityScriptGeneratorView: React.FC<UnityScriptGeneratorViewProps> = ({
  initialValues,
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [scriptType, setScriptType] = useState<UnityScriptType>(
    (initialValues?.scriptType as UnityScriptType) || 'MonoBehaviour'
  );
  const [unityVersion, setUnityVersion] = useState('Unity 2022.3 LTS+');
  const [renderPipeline, setRenderPipeline] = useState('Universal RP (URP)');
  const [inputSystem, setInputSystem] = useState('New Input System (com.unity.inputsystem)');
  const [targetPlatform, setTargetPlatform] = useState('PC / Standalone');
  const [additionalRequirements, setAdditionalRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnityGeneratedScriptResult | null>(null);
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);

  // Save to project modal state
  const [isSavingToProject, setIsSavingToProject] = useState(false);
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  const [newProjectName, setNewProjectName] = useState('');

  const handleGenerate = async () => {
    if (!title.trim() || !description.trim()) {
      showToast('error', 'Preencha o título e a descrição do script C#.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/unity/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          scriptType,
          unityVersion,
          renderPipeline,
          inputSystem,
          targetPlatform,
          additionalRequirements,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao gerar script Unity');
      }

      const data: UnityGeneratedScriptResult = await res.json();
      setResult(data);
      setSelectedFileIdx(0);
      onLogActivity('unity', `Script C#: ${data.title}`, `Tipo: ${data.scriptType}`);
      showToast('success', `Script C# "${data.title}" gerado com sucesso!`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToProject = () => {
    if (!result) return;
    const projects = getUnityProjects();

    if (targetProjectId === 'NEW' || projects.length === 0) {
      if (!newProjectName.trim()) {
        showToast('error', 'Digite um nome para o novo projeto Unity.');
        return;
      }
      const newProj: UnityProject = {
        id: `unity-proj-${Date.now()}`,
        name: newProjectName.trim(),
        description: `Projeto contendo ${result.title}`,
        unityVersion,
        targetPlatform,
        renderPipeline,
        inputSystem,
        files: result.files,
        versions: [
          {
            versionId: `ver-${Date.now()}`,
            versionNumber: 'v1.0',
            timestamp: new Date().toISOString(),
            changelog: `Adicionado script ${result.title}`,
            files: result.files,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveUnityProject(newProj);
      showToast('success', `Projeto Unity "${newProj.name}" criado com sucesso!`);
    } else {
      const proj = projects.find((p) => p.id === targetProjectId);
      if (proj) {
        const updatedFiles = [...proj.files];
        result.files.forEach((rf) => {
          const existingIdx = updatedFiles.findIndex((f) => f.name === rf.name);
          if (existingIdx >= 0) {
            updatedFiles[existingIdx] = rf;
          } else {
            updatedFiles.push(rf);
          }
        });
        saveUnityProject({
          ...proj,
          files: updatedFiles,
          updatedAt: new Date().toISOString(),
        });
        showToast('success', `Scripts adicionados ao projeto "${proj.name}"!`);
      }
    }
    setIsSavingToProject(false);
  };

  const activeFile = result?.files[selectedFileIdx] || result?.files[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#8065F5]/15 border border-[#8065F5]/30 text-[#A995FF] text-xs font-mono font-medium">
              <FileCode className="w-3.5 h-3.5" />
              <span>Unity C# Script Generator</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Gerador Especializado de Scripts C# para Unity
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Crie códigos C# de alto padrão com encapsulamento, atributos [SerializeField], instruções de
              GameObject na Hierarchy, bindings de Inspector e passos para Play Mode.
            </p>
          </div>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-6 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
              Nome do Script / Objetivo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: FirstPersonController, HealthSystem, InventoryItemData"
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-4 py-2.5 text-sm text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
              Tipo de Script
            </label>
            <select
              value={scriptType}
              onChange={(e) => setScriptType(e.target.value as UnityScriptType)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2.5 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="MonoBehaviour">MonoBehaviour (Componente de GameObject)</option>
              <option value="ScriptableObject">ScriptableObject (Container de Dados)</option>
              <option value="StandardClass">Standard C# Class (Lógica Pura / Singleton)</option>
              <option value="Interface">Interface C# (Desacoplamento)</option>
              <option value="EditorScript">Custom Editor / PropertyDrawer</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
            Descrição do Comportamento Desejado
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva exatamente o que o script deve fazer (ex: movimentar o jogador usando CharacterController, ler inputs do New Input System, aplicar gravidade e pulo com coyote time, e expor velocidade e altura de pulo no Inspector)..."
            rows={4}
            className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-4 py-3 text-sm text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-[#8065F5] resize-y"
          />
        </div>

        {/* Technical Configurations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
              Versão da Unity
            </label>
            <select
              value={unityVersion}
              onChange={(e) => setUnityVersion(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Unity 2022.3 LTS+">Unity 2022.3 LTS (Recomendada)</option>
              <option value="Unity 6 (6000.x)">Unity 6 (Mais Recente)</option>
              <option value="Unity 2021.3 LTS">Unity 2021.3 LTS</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
              Render Pipeline
            </label>
            <select
              value={renderPipeline}
              onChange={(e) => setRenderPipeline(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Universal RP (URP)">Universal RP (URP)</option>
              <option value="Built-in Render Pipeline">Built-in (Padrão Clássico)</option>
              <option value="High Definition RP (HDRP)">High Definition (HDRP)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
              Sistema de Input
            </label>
            <select
              value={inputSystem}
              onChange={(e) => setInputSystem(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="New Input System (com.unity.inputsystem)">
                New Input System (com.unity.inputsystem)
              </option>
              <option value="Legacy Input Manager (Input.GetAxis)">
                Legacy Input Manager (Input.GetAxis)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
              Plataforma Alvo
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="PC / Standalone">PC (Windows / Mac / Linux)</option>
              <option value="Mobile (Android / iOS)">Mobile (Android / iOS)</option>
              <option value="WebGL">WebGL (Navegador)</option>
              <option value="Console">Console (PlayStation / Xbox / Switch)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-3 border-t border-[#292C3B]">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8065F5] to-[#9981f9] hover:opacity-95 text-white text-xs font-semibold shadow-lg shadow-[#8065F5]/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gerando Código C#...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Script Unity</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Result Output */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Result Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#12141D] border border-[#292C3B] p-5 rounded-2xl shadow-lg">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#F5F5FA]">{result.title}</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#8065F5]/20 text-[#A995FF] border border-[#8065F5]/30 font-mono">
                  {result.scriptType}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {result.unityVersionRecommended}
                </span>
              </div>
              <p className="text-xs text-[#9699AC] mt-1">{result.summary}</p>
            </div>

            <button
              onClick={() => setIsSavingToProject(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold shadow-md transition-all flex-shrink-0"
            >
              <FolderArchive className="w-4 h-4" />
              <span>Salvar no Projeto</span>
            </button>
          </div>

          {/* Files Selector (if multiple) */}
          {result.files.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {result.files.map((file, idx) => (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-2 ${
                    selectedFileIdx === idx
                      ? 'bg-[#8065F5]/20 text-[#F5F5FA] border-[#8065F5]/50 shadow-sm'
                      : 'bg-[#12141D] text-[#9699AC] border-[#292C3B] hover:text-[#F5F5FA]'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-[#8065F5]" />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Active File Inspector & Code */}
          {activeFile && (
            <div className="space-y-4">
              {/* Path and Component Requirements */}
              <div className="bg-[#12141D] border border-[#292C3B] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#6C7086]">Local em Assets:</span>
                  <code className="font-mono text-[#A995FF] bg-[#0B0C12] px-2 py-0.5 rounded border border-[#292C3B]">
                    {activeFile.assetsPath}
                  </code>
                </div>

                {activeFile.requiredComponents && activeFile.requiredComponents.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[#6C7086]">Componentes Requeridos:</span>
                    {activeFile.requiredComponents.map((c, i) => (
                      <span
                        key={i}
                        className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Code Viewer */}
              <CodeViewer
                code={activeFile.code}
                filename={activeFile.name}
                scriptType={activeFile.scriptType}
                location={activeFile.assetsPath}
                theme={preferences.editorTheme}
                fontSize={preferences.fontSize}
                onExplain={() => onExplainRequest(activeFile.code, activeFile.name)}
              />
            </div>
          )}

          {/* Setup, Inspector and Testing Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scene & GameObject Setup */}
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#A995FF]" />
                <span>Montagem na Cena (Hierarchy)</span>
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-xs text-[#9699AC]">
                {result.sceneSetupSteps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed text-[#F5F5FA]/90">
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Inspector Configuration */}
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Configuração no Inspector</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#9699AC]">
                {result.inspectorSetupInstructions.map((ins, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span className="text-[#F5F5FA]/90">{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Testing in Play Mode */}
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>Como Testar em Play Mode (Ctrl+P)</span>
              </h4>
              <ul className="space-y-2 text-xs text-[#9699AC]">
                {result.testingInstructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                    <span className="text-[#F5F5FA]/90">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Save to Unity Project */}
      {isSavingToProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F5F5FA]">Salvar Scripts no Projeto Unity</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9699AC] font-medium mb-1">Selecionar Projeto</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                >
                  <option value="NEW">+ Criar Novo Projeto Unity...</option>
                  {getUnityProjects().map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.files.length} scripts)
                    </option>
                  ))}
                </select>
              </div>

              {targetProjectId === 'NEW' || getUnityProjects().length === 0 ? (
                <div>
                  <label className="block text-[#9699AC] font-medium mb-1">Nome do Novo Projeto</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Ex: FPS Survival Game"
                    className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
                  />
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#292C3B]">
              <button
                onClick={() => setIsSavingToProject(false)}
                className="px-3 py-1.5 rounded-xl bg-[#191C28] text-xs text-[#9699AC] hover:text-[#F5F5FA]"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveToProject}
                className="px-4 py-1.5 rounded-xl bg-[#8065F5] hover:bg-[#7052f3] text-white text-xs font-semibold"
              >
                Confirmar e Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
