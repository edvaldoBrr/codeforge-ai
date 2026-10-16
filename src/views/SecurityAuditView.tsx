import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  Code2,
  Lock,
  ExternalLink,
  Copy,
  Check,
  FileCode,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { SecurityAuditResult, SecurityVulnerability, UserPreferences } from '../types/codeforge';
import { CodeViewer } from '../components/CodeViewer';

interface SecurityAuditViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SAMPLE_VULNERABLE_SCRIPTS = [
  {
    name: 'Vulnerabilidade Crítica: Confiança Cega no Cliente (Shop)',
    type: 'Script',
    location: 'ServerScriptService',
    code: `-- VULNERÁVEL: O cliente envia o preço e o item diretamente!
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local buyEvent = ReplicatedStorage:WaitForChild("BuyItemEvent")

buyEvent.OnServerEvent:Connect(function(player, itemName, itemPrice)
	-- FALHA GRAVE: Exploiters podem passar itemPrice = 0 ou itemPrice = -999999
	local coins = player.leaderstats.Coins
	if coins.Value >= itemPrice then
		coins.Value -= itemPrice
		print(player.Name, "comprou", itemName)
		-- Entrega o item sem checar se o item realmente existe na loja oficial
	end
end)
`,
  },
  {
    name: 'Vulnerabilidade em DataStore: Falta de pcall() e perda de dados',
    type: 'Script',
    location: 'ServerScriptService',
    code: `local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local myDataStore = DataStoreService:GetDataStore("PlayerStats_v1")

Players.PlayerRemoving:Connect(function(player)
	-- FALHA: Chamada direta sem pcall(). Se a API do Roblox falhar momentaneamente,
	-- os dados do jogador são perdidos permanentemente sem retry!
	myDataStore:SetAsync(player.UserId, {
		Coins = player.leaderstats.Coins.Value,
		Level = player.leaderstats.Level.Value
	})
end)
`,
  },
];

export const SecurityAuditView: React.FC<SecurityAuditViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [code, setCode] = useState(SAMPLE_VULNERABLE_SCRIPTS[0].code);
  const [scriptType, setScriptType] = useState('Script');
  const [location, setLocation] = useState('ServerScriptService');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SecurityAuditResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleAudit = async () => {
    if (!code.trim()) {
      showToast('error', 'Insira o script Luau para a auditoria de segurança.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/security-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, scriptType, location }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na auditoria de segurança');
      }

      const data: SecurityAuditResult = await res.json();
      setResult(data);
      onLogActivity('security', `Auditoria: Risco ${data.riskScore}`, `${data.vulnerabilities.length} vulnerabilidades`);
      showToast('success', `Auditoria concluída! Nível de risco: ${data.riskScore}`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecureCode = (secureCode: string, idx: number) => {
    navigator.clipboard.writeText(secureCode);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    showToast('success', 'Código seguro copiado para a área de transferência.');
  };

  const getRiskScoreBadge = (score: SecurityAuditResult['riskScore']) => {
    switch (score) {
      case 'CRITICAL':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold text-sm">
            <AlertOctagon className="w-4 h-4 animate-pulse" />
            <span>RISCO CRÍTICO</span>
          </div>
        );
      case 'HIGH':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>ALTO RISCO</span>
          </div>
        );
      case 'MEDIUM':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <span>RISCO MÉDIO</span>
          </div>
        );
      case 'LOW':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>BAIXO RISCO</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>SEGURO</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Anti-Exploit & Security Audit</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Auditoria de Segurança para Roblox Studio
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Detecte brechas graves que permitem a exploiters injetar dinheiro, clonar itens, disparar
              remotes sem cooldown ou corromper dados do DataStore.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9699AC]">Testar vulnerabilidade:</span>
            {SAMPLE_VULNERABLE_SCRIPTS.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setCode(s.code);
                  setScriptType(s.type);
                  setLocation(s.location);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-[#191C28] hover:bg-rose-500/15 text-[#9699AC] hover:text-rose-400 border border-[#292C3B] hover:border-rose-500/30 transition-all"
              >
                Cenário {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Code Area */}
      <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>Código Luau sob Auditoria</span>
          </label>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Cole seu script de servidor ou módulo para auditoria contra exploiters..."
          rows={10}
          className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-rose-500/50 transition-colors leading-relaxed"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
              Tipo de Script
            </label>
            <select
              value={scriptType}
              onChange={(e) => setScriptType(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="Script">Script (Server)</option>
              <option value="ModuleScript">ModuleScript</option>
              <option value="LocalScript">LocalScript</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#9699AC] mb-1">
              Localização no Explorer
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#0B0C12] border border-[#292C3B] rounded-xl px-3 py-2 text-xs text-[#F5F5FA] focus:outline-none focus:border-[#8065F5]"
            >
              <option value="ServerScriptService">ServerScriptService</option>
              <option value="ReplicatedStorage">ReplicatedStorage</option>
              <option value="ServerStorage">ServerStorage</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#292C3B]">
          <button
            onClick={handleAudit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-semibold shadow-lg shadow-rose-900/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditorando Vulnerabilidades...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Auditar Segurança do Script</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Audit Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          {/* Summary Box */}
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-[#F5F5FA]">Diagnóstico de Segurança</h3>
                {getRiskScoreBadge(result.riskScore)}
              </div>
              <p className="text-xs text-[#9699AC] max-w-3xl pt-1">
                {result.summary}
              </p>
            </div>

            {result.robloxSecurityDocsReference && (
              <div className="text-xs text-[#A995FF] bg-[#191C28] px-3 py-2 rounded-xl border border-[#292C3B] flex items-center gap-1.5 flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{result.robloxSecurityDocsReference}</span>
              </div>
            )}
          </div>

          {/* Checklist of security practices */}
          {result.checkedPractices && result.checkedPractices.length > 0 && (
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
                Checklist de Boas Práticas Roblox
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {result.checkedPractices.map((prac, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[#0B0C12] border border-[#292C3B] flex items-start gap-2.5 text-xs"
                  >
                    {prac.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-[#F5F5FA] block">{prac.practice}</span>
                      <span className="text-[11px] text-[#9699AC]">{prac.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vulnerabilities List */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F5F5FA] flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>Vulnerabilidades Encontradas ({result.vulnerabilities.length})</span>
            </h4>

            {result.vulnerabilities.length === 0 ? (
              <div className="p-8 text-center bg-[#12141D] rounded-2xl border border-[#292C3B] space-y-2">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-[#F5F5FA]">Nenhuma brecha identificada</h4>
                <p className="text-xs text-[#9699AC]">
                  O script demonstra validação adequada no servidor e não confia cegamente em argumentos do cliente.
                </p>
              </div>
            ) : (
              result.vulnerabilities.map((vuln, idx) => (
                <div
                  key={idx}
                  className="bg-[#12141D] border border-rose-500/30 rounded-2xl p-5 space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#292C3B] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {vuln.severity}
                      </span>
                      <span className="text-xs font-mono text-[#9699AC] bg-[#191C28] px-2 py-0.5 rounded border border-[#292C3B]">
                        {vuln.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#F5F5FA]">{vuln.title}</h4>
                    </div>

                    {vuln.line && (
                      <span className="text-xs font-mono text-[#9699AC]">
                        Linha aproximada: {vuln.line}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#0B0C12] p-3 rounded-xl border border-[#292C3B] space-y-1">
                      <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                        Como um exploiter pode abusar:
                      </span>
                      <p className="text-[#9699AC]">{vuln.exploitImpact}</p>
                    </div>

                    <div className="bg-[#0B0C12] p-3 rounded-xl border border-[#292C3B] space-y-1">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                        Correção Arquitetural:
                      </span>
                      <p className="text-[#9699AC]">{vuln.remediation}</p>
                    </div>
                  </div>

                  {/* Secure Example Code */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Código Seguro Recomendado:
                      </span>
                      <button
                        onClick={() => handleCopySecureCode(vuln.secureExampleCode, idx)}
                        className="flex items-center gap-1 text-[11px] text-[#9699AC] hover:text-[#F5F5FA] px-2.5 py-1 rounded bg-[#191C28] border border-[#292C3B]"
                      >
                        {copiedIdx === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar Código Seguro</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-[#0B0C12] border border-[#292C3B] rounded-xl font-mono text-xs text-[#A995FF] overflow-x-auto leading-relaxed">
                      {vuln.secureExampleCode}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
