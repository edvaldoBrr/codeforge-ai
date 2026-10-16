import React, { useState } from 'react';
import {
  Code2,
  ArrowRightLeft,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  AlertCircle,
  Layers,
  ChevronDown,
  Terminal,
} from 'lucide-react';
import { MultiDevTranslationResult } from '../../types/codeforge';
import { downloadCodeFile } from '../../utils/storage';

const TRANSLATION_LANGUAGES = [
  { id: 'luau', name: 'Luau (Roblox)', ext: '.luau' },
  { id: 'csharp', name: 'C# (.NET / Unity / Godot)', ext: '.cs' },
  { id: 'python', name: 'Python 3', ext: '.py' },
  { id: 'typescript', name: 'TypeScript', ext: '.ts' },
  { id: 'javascript', name: 'JavaScript (ESNext)', ext: '.js' },
  { id: 'gdscript', name: 'GDScript (Godot 4)', ext: '.gd' },
  { id: 'cpp', name: 'C++ (Unreal / Modern)', ext: '.cpp' },
  { id: 'rust', name: 'Rust', ext: '.rs' },
  { id: 'go', name: 'Go (Golang)', ext: '.go' },
  { id: 'java', name: 'Java 21', ext: '.java' },
  { id: 'kotlin', name: 'Kotlin', ext: '.kt' },
  { id: 'swift', name: 'Swift 6', ext: '.swift' },
  { id: 'sql', name: 'SQL (Postgres / ANSI)', ext: '.sql' },
  { id: 'dart', name: 'Dart (Flutter)', ext: '.dart' },
];

export const MultiDevTranslatorView: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('luau');
  const [targetLang, setTargetLang] = useState('csharp');
  const [sourceCode, setSourceCode] = useState(
`-- Exemplo em Luau (Roblox)
local PlayerService = {}
PlayerService.__index = PlayerService

function PlayerService.new(userId: number, username: string)
    local self = setmetatable({}, PlayerService)
    self.userId = userId
    self.username = username
    self.gold = 100
    self.inventory = {}
    return self
end

function PlayerService:AddGold(amount: number)
    assert(amount > 0, "O valor deve ser positivo")
    self.gold += amount
    return self.gold
end

return PlayerService`
  );
  const [targetFramework, setTargetFramework] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MultiDevTranslationResult | null>(null);

  const [copied, setCopied] = useState(false);

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (result) {
      setSourceCode(result.targetCode);
      setResult(null);
    }
  };

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/multidev/translate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceLang,
          targetLang,
          sourceCode,
          targetFramework,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Falha na tradução de código.');
      }

      const data: MultiDevTranslationResult = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Erro durante a conversão.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.targetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const targetObj = TRANSLATION_LANGUAGES.find((l) => l.id === targetLang);
    const ext = targetObj ? targetObj.ext : '.txt';
    downloadCodeFile(`converted_code${ext}`, result.targetCode);
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
          <ArrowRightLeft className="w-4 h-4" />
          <span>Conversor Poliglota</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
          Tradutor de Código Entre Linguagens
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Converta scripts e lógicas entre ecossistemas (ex: Luau para C#, Python para TypeScript, C++ para Rust) mantendo idiomaticidade e tipagem estrita.
        </p>
      </div>

      {/* Language Selector Bar */}
      <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        {/* Source Language */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">De:</span>
          <div className="relative">
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {TRANSLATION_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Swap button */}
        <button
          onClick={handleSwap}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700 flex items-center gap-1.5 text-xs font-medium"
          title="Inverter linguagens"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Inverter</span>
        </button>

        {/* Target Language */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium">Para:</span>
          <div className="relative">
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="appearance-none pl-3.5 pr-8 py-2 rounded-xl bg-purple-950/60 border border-purple-500/50 text-xs font-semibold text-purple-200 focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              {TRANSLATION_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-purple-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Target Framework / Library Option */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={targetFramework}
            onChange={(e) => setTargetFramework(e.target.value)}
            placeholder="Framework específico (opcional)"
            className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Main Grid: Source Code Left, Converted Code Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Source Code Container */}
        <div className="space-y-4 bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-purple-400" />
              Código de Origem ({sourceLang})
            </span>
            <span className="text-xs text-zinc-500">Cole o código abaixo</span>
          </div>

          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            rows={16}
            required
            className="w-full px-4 py-3 rounded-xl bg-zinc-950 font-mono text-xs text-zinc-200 placeholder-zinc-600 border border-zinc-800 focus:outline-none focus:border-purple-500 resize-y leading-relaxed"
          />

          <button
            onClick={handleTranslate}
            disabled={loading || !sourceCode.trim()}
            className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold text-sm transition-all shadow-lg hover:shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Traduzindo e adaptando paradigmas...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Converter para {targetLang}</span>
              </>
            )}
          </button>
        </div>

        {/* Converted Target Code Container */}
        <div className="space-y-4">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Erro na conversão:</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {!result && !loading && (
            <div className="p-16 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 space-y-3">
              <Code2 className="w-12 h-12 mx-auto text-zinc-700" />
              <h3 className="text-base font-semibold text-zinc-300">Aguardando conversão</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Clique no botão de conversão para traduzir o código para {targetLang} respeitando convenções e arquitetura nativa.
              </p>
            </div>
          )}

          {loading && (
            <div className="p-20 text-center rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-white">
                Reescrevendo código em {targetLang}...
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Mapeando sistemas de tipos, convenções e gerenciamento de memória.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Target Code Box */}
              <div className="rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between bg-zinc-900 px-4 py-2.5 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 font-mono">
                    <Check className="w-3.5 h-3.5" />
                    Código Convertido ({targetLang})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Baixar</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 overflow-x-auto max-h-[420px] overflow-y-auto font-mono text-xs leading-relaxed text-zinc-200">
                  <pre>{result.targetCode}</pre>
                </div>
              </div>

              {/* Paradigm Shifts & Dependencies */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Mudanças de Paradigma & Explicação
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/60 p-3 rounded-xl border border-zinc-800">
                  {result.explanation}
                </p>

                {result.paradigmShifts && result.paradigmShifts.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-zinc-400">
                    {result.paradigmShifts.map((shift, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{shift}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {result.dependenciesNeeded && result.dependenciesNeeded.length > 0 && (
                  <div className="pt-2 border-t border-zinc-800/80">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase block mb-1">
                      Dependências Necessárias em {targetLang}:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.dependenciesNeeded.map((dep, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-mono text-[11px] border border-zinc-700"
                        >
                          {dep}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
