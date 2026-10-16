import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, MapPin, HelpCircle } from 'lucide-react';
import { downloadLuaScript } from '../utils/storage';

interface CodeViewerProps {
  code: string;
  filename?: string;
  scriptType?: string;
  location?: string;
  fontSize?: number;
  theme?: 'luau-dark' | 'obsidian' | 'cyber';
  maxHeight?: string;
  showLineNumbers?: boolean;
  onCopyFeedback?: () => void;
  onExplain?: () => void;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  filename = 'script.luau',
  scriptType,
  location,
  fontSize = 13,
  theme = 'luau-dark',
  maxHeight = '500px',
  showLineNumbers = true,
  onCopyFeedback,
  onExplain,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (onCopyFeedback) onCopyFeedback();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      if (onCopyFeedback) onCopyFeedback();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isCSharp = filename.endsWith('.cs') || (!filename.endsWith('.lua') && !filename.endsWith('.luau') && (code.includes('using UnityEngine') || code.includes('MonoBehaviour') || code.includes('public class')));

  const handleDownload = () => {
    if (isCSharp) {
      const cleanName = filename.endsWith('.cs') ? filename : `${filename}.cs`;
      const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      downloadLuaScript(filename, code);
    }
  };

  const lines = code.split('\n');

  // Token highlighter for Luau and C#
  const highlightLine = (line: string): React.ReactNode => {
    const trimmed = line.trim();

    if (isCSharp) {
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        return <span className="text-[#6B7280] italic">{line}</span>;
      }

      const parts: React.ReactNode[] = [];
      const csRegex = /(\/\/.*$)|(".*?"|'.*?')|(\b(?:using|namespace|public|private|protected|internal|static|class|struct|interface|enum|override|virtual|abstract|async|await|void|int|float|double|bool|string|var|new|return|this|base|if|else|switch|case|default|foreach|for|while|do|break|continue|try|catch|finally|throw|get|set|value|null|true|false)\b)|(\b(?:MonoBehaviour|ScriptableObject|GameObject|Transform|Vector2|Vector3|Vector4|Quaternion|Color|Mathf|Time|Input|KeyCode|Camera|Canvas|Rigidbody|Rigidbody2D|Collider|Collider2D|AudioSource|AudioClip|Coroutine|IEnumerator|SerializeField|HideInInspector|Header|Tooltip|RequireComponent|Range|UnityEvent|Action|Func|List|Dictionary|Debug|Destroy|Instantiate|GetComponent|GetComponentInChildren|Awake|Start|Update|FixedUpdate|LateUpdate|OnEnable|OnDisable|OnDestroy|OnTriggerEnter|OnTriggerExit|OnCollisionEnter|OnCollisionExit|NavMeshAgent|SceneManager)\b)|(\b\d+(?:\.\d+)?f?\b)|([a-zA-Z_]\w*)|([^\w\s"'-]+|\s+)/g;

      while (true) {
        const match = csRegex.exec(line);
        if (!match) break;
        const [full, comment, str, kw, unityType, num, ident, other] = match;

        if (comment) {
          parts.push(<span key={match.index} className="text-[#636b7b] italic">{comment}</span>);
        } else if (str) {
          parts.push(<span key={match.index} className="text-[#A7F3D0]">{str}</span>);
        } else if (kw) {
          parts.push(
            <span
              key={match.index}
              className={`font-semibold ${
                theme === 'cyber' ? 'text-[#38BDF8]' : 'text-[#A995FF]'
              }`}
            >
              {kw}
            </span>
          );
        } else if (unityType) {
          parts.push(
            <span
              key={match.index}
              className={theme === 'cyber' ? 'text-[#818CF8]' : 'text-[#38BDF8]'}
            >
              {unityType}
            </span>
          );
        } else if (num) {
          parts.push(<span key={match.index} className="text-[#FBBF24]">{num}</span>);
        } else if (ident) {
          parts.push(<span key={match.index} className="text-[#F5F5FA]">{ident}</span>);
        } else {
          parts.push(<span key={match.index} className="text-[#9699AC]">{other || full}</span>);
        }
      }

      if (parts.length === 0) return <span>{line || ' '}</span>;
      return <>{parts}</>;
    }

    // Default: Luau syntax highlighter
    if (trimmed.startsWith('--')) {
      return <span className="text-[#6B7280] italic">{line}</span>;
    }

    const parts: React.ReactNode[] = [];
    const regex = /(--.*$)|(".*?"|'.*?'|\[\[.*?\]\])|(\b(?:local|function|end|then|if|else|elseif|for|in|pairs|ipairs|while|do|repeat|until|return|break|continue|not|and|or|nil|true|false|export|type)\b)|(\b(?:game|workspace|script|task|typeof|Vector3|CFrame|Color3|UDim2|UDim|Instance|Enum|math|table|string|os|pcall|print|warn|error|Players|RunService|TweenService|ReplicatedStorage|ServerScriptService|ServerStorage|StarterPlayer|StarterGui)\b)|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_]\w*)|([^\w\s"'-]+|\s+)/g;

    while (true) {
      const match = regex.exec(line);
      if (!match) break;
      const [full, comment, str, kw, rbx, num, ident, other] = match;

      if (comment) {
        parts.push(<span key={match.index} className="text-[#636b7b] italic">{comment}</span>);
      } else if (str) {
        parts.push(<span key={match.index} className="text-[#A7F3D0]">{str}</span>);
      } else if (kw) {
        parts.push(
          <span
            key={match.index}
            className={`font-semibold ${
              theme === 'cyber' ? 'text-[#38BDF8]' : 'text-[#A995FF]'
            }`}
          >
            {kw}
          </span>
        );
      } else if (rbx) {
        parts.push(
          <span
            key={match.index}
            className={theme === 'cyber' ? 'text-[#818CF8]' : 'text-[#38BDF8]'}
          >
            {rbx}
          </span>
        );
      } else if (num) {
        parts.push(<span key={match.index} className="text-[#FBBF24]">{num}</span>);
      } else if (ident) {
        parts.push(<span key={match.index} className="text-[#F5F5FA]">{ident}</span>);
      } else {
        parts.push(<span key={match.index} className="text-[#9699AC]">{other || full}</span>);
      }
    }

    if (parts.length === 0) {
      return <span>{line || ' '}</span>;
    }

    return <>{parts}</>;
  };

  const getBadgeColor = (type?: string) => {
    switch (type) {
      case 'LocalScript':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ModuleScript':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Script':
      default:
        return 'bg-[#8065F5]/10 text-[#A995FF] border-[#8065F5]/20';
    }
  };

  // Theme styling
  const themeBg =
    theme === 'obsidian'
      ? 'bg-[#050508]'
      : theme === 'cyber'
      ? 'bg-[#080B14]'
      : 'bg-[#0B0C12]';

  const themeHeader =
    theme === 'obsidian'
      ? 'bg-[#0D0E14]'
      : theme === 'cyber'
      ? 'bg-[#0F172A]'
      : 'bg-[#191C28]/90';

  const themeBorder =
    theme === 'cyber'
      ? 'border-cyan-900/40'
      : 'border-[#292C3B]';

  return (
    <div className={`rounded-xl border ${themeBorder} bg-[#12141D] overflow-hidden shadow-lg flex flex-col my-3`}>
      {/* Code Header Bar */}
      <div className={`flex flex-wrap items-center justify-between px-4 py-2.5 ${themeHeader} border-b ${themeBorder} gap-2`}>
        <div className="flex items-center gap-2.5 flex-wrap">
          <FileCode className={`w-4 h-4 ${theme === 'cyber' ? 'text-cyan-400' : 'text-[#A995FF]'}`} />
          <span className="font-mono text-xs md:text-sm font-semibold text-[#F5F5FA] tracking-wide">
            {filename}
          </span>
          {scriptType && (
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded-md border ${getBadgeColor(
                scriptType
              )}`}
            >
              {scriptType}
            </span>
          )}
          {location && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#9699AC] bg-[#0B0C12] px-2 py-0.5 rounded border border-[#292C3B]/60 font-mono">
              <MapPin className="w-3 h-3 text-[#8065F5]" />
              {location}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {onExplain && (
            <button
              onClick={onExplain}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#12141D] hover:bg-[#8065F5]/20 text-[#A995FF] border border-[#292C3B] hover:border-[#8065F5]/40 transition-colors"
              title="Explicar código com IA"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Explicar</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#12141D] hover:bg-[#8065F5]/20 text-[#F5F5FA] border border-[#292C3B] hover:border-[#8065F5]/40 transition-colors"
            title="Copiar código"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#9699AC]" />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[#12141D] hover:bg-[#8065F5]/20 text-[#F5F5FA] border border-[#292C3B] hover:border-[#8065F5]/40 transition-colors"
            title="Baixar arquivo .lua"
          >
            <Download className="w-3.5 h-3.5 text-[#9699AC]" />
            <span className="hidden sm:inline">Baixar .lua</span>
          </button>
        </div>
      </div>

      {/* Code Body */}
      <div
        className={`overflow-auto ${themeBg} p-3 font-mono text-xs leading-relaxed select-text`}
        style={{ maxHeight, fontSize: `${fontSize}px` }}
      >
        <div className="table w-full">
          {lines.map((lineText, idx) => (
            <div key={idx} className="table-row hover:bg-[#191C28]/40 transition-colors">
              {showLineNumbers && (
                <span className="table-cell text-right pr-4 pl-2 select-none text-[#525666] font-mono text-[11px] w-10">
                  {idx + 1}
                </span>
              )}
              <span className="table-cell whitespace-pre font-mono pr-2">
                {highlightLine(lineText)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
