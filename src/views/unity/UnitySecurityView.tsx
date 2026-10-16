import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Sparkles,
  RefreshCw,
  FileCode,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { UnitySecurityResult, UserPreferences } from '../../types/codeforge';

interface UnitySecurityViewProps {
  preferences: UserPreferences;
  onExplainRequest: (code: string, context: string) => void;
  onLogActivity: (tool: any, title: string, details?: string) => void;
  showToast: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
}

const SAMPLE_SECURITY_SCRIPTS = [
  {
    name: 'Vulnerabilidade de Salvamento: PlayerPrefs em Plaintext',
    isMultiplayer: false,
    code: `using UnityEngine;

public class SaveCurrencyManager : MonoBehaviour
{
    // VULNERABILIDADE GRAVE: PlayerPrefs salva dados em texto puro no Registro do Windows
    // Qualquer jogador pode abrir o Regedit e mudar "PlayerCoins" para 99999999 em segundos!
    public void SaveCoins(int amount)
    {
        PlayerPrefs.SetInt("PlayerCoins", amount);
        PlayerPrefs.Save();
        Debug.Log("Moedas salvas sem proteção ou hash HMAC.");
    }
}
`,
  },
  {
    name: 'Vulnerabilidade em RPC Multiplayer: Cliente dita moedas e vitórias',
    isMultiplayer: true,
    code: `using UnityEngine;
using Unity.Netcode;

public class ShopRPCManager : NetworkBehaviour
{
    // VULNERABILIDADE CRÍTICA: ServerRpc sem validação de saldo ou posse
    // Qualquer modder ou pacote injetado pode invocar o RPC passando freeItem = true ou price = 0
    [ServerRpc(RequireOwnership = false)]
    public void BuyItemServerRpc(string itemId, int price)
    {
        // O servidor confia no preço enviado pelo cliente!
        Debug.Log("Item comprado pelo valor informado pelo cliente: " + price);
        DeliverItem(itemId);
    }

    private void DeliverItem(string itemId) { }
}
`,
  },
];

export const UnitySecurityView: React.FC<UnitySecurityViewProps> = ({
  preferences,
  onExplainRequest,
  onLogActivity,
  showToast,
}) => {
  const [code, setCode] = useState(SAMPLE_SECURITY_SCRIPTS[0].code);
  const [isMultiplayer, setIsMultiplayer] = useState(SAMPLE_SECURITY_SCRIPTS[0].isMultiplayer);
  const [targetPlatform, setTargetPlatform] = useState('PC / Standalone');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UnitySecurityResult | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleAudit = async () => {
    if (!code.trim()) {
      showToast('error', 'Cole o script C# para a auditoria de segurança.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/unity/security-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, isMultiplayer, targetPlatform }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro na auditoria de segurança Unity');
      }

      const data: UnitySecurityResult = await res.json();
      setResult(data);
      onLogActivity('unity', `Segurança C#: ${data.riskScore}`, `${data.vulnerabilities.length} riscos`);
      showToast('success', `Auditoria Unity concluída! Nível de risco: ${data.riskScore}`);
    } catch (err: any) {
      console.error(err);
      showToast('error', err.message || 'Erro ao conectar ao servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecureCode = (codeText: string, idx: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    showToast('success', 'Código seguro copiado!');
  };

  const getRiskBadge = (risk: UnitySecurityResult['riskScore']) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold text-xs">
            <AlertOctagon className="w-3.5 h-3.5 animate-pulse" />
            RISCO CRÍTICO
          </span>
        );
      case 'HIGH':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold text-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            ALTO RISCO
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold text-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            RISCO MÉDIO
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            SEGURO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Intro Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#12141D] via-[#191C28] to-[#12141D] border border-[#292C3B] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-medium">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Unity Security & Anti-Cheat</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-[#F5F5FA] tracking-tight">
              Auditoria de Segurança para Jogos Unity
            </h2>
            <p className="text-sm text-[#9699AC] max-w-2xl">
              Verifique adulteração de saves locais, chaves e tokens de servidor expostos no executável
              e vulnerabilidades em RPCs de jogos multiplayer (Netcode for GameObjects / Photon / Mirror).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#9699AC]">Testar cenário:</span>
            {SAMPLE_SECURITY_SCRIPTS.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  setCode(s.code);
                  setIsMultiplayer(s.isMultiplayer);
                  setResult(null);
                }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-[#191C28] hover:bg-cyan-500/15 text-[#9699AC] hover:text-cyan-400 border border-[#292C3B] transition-all"
              >
                Cenário {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Editor & Configuration */}
      <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Script C# sob Auditoria</span>
          </label>
        </div>

        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Cole seu script C# para auditoria contra adulteração e brechas de rede..."
          rows={10}
          className="w-full font-mono text-xs bg-[#0B0C12] border border-[#292C3B] rounded-xl p-4 text-[#F5F5FA] placeholder-[#6C7086] focus:outline-none focus:border-cyan-500/50 leading-relaxed"
        />

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 text-[#9699AC] cursor-pointer">
              <input
                type="checkbox"
                checked={isMultiplayer}
                onChange={(e) => setIsMultiplayer(e.target.checked)}
                className="rounded border-[#292C3B] bg-[#0B0C12] text-[#8065F5] focus:ring-0"
              />
              <span>Projeto Multiplayer (Netcode / Photon / Mirror)</span>
            </label>

            <div>
              <span className="text-[#6C7086] mr-2">Plataforma:</span>
              <select
                value={targetPlatform}
                onChange={(e) => setTargetPlatform(e.target.value)}
                className="bg-[#0B0C12] border border-[#292C3B] rounded-lg px-2.5 py-1 text-xs text-[#F5F5FA]"
              >
                <option value="PC / Standalone">PC (Windows / Mac)</option>
                <option value="Mobile (Android/iOS)">Mobile</option>
                <option value="WebGL">WebGL</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleAudit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditorando Script...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>Auditar Segurança Unity</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in-50 duration-300">
          <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-[#F5F5FA]">Relatório de Segurança Unity</h3>
                {getRiskBadge(result.riskScore)}
              </div>
              <p className="text-xs text-[#9699AC] max-w-3xl pt-1 leading-relaxed">
                {result.summary}
              </p>
            </div>

            {result.officialDocsReference && (
              <div className="text-xs text-cyan-400 bg-[#191C28] px-3 py-2 rounded-xl border border-[#292C3B] flex items-center gap-1.5 flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{result.officialDocsReference}</span>
              </div>
            )}
          </div>

          {/* Checklist */}
          {result.checkedPractices && result.checkedPractices.length > 0 && (
            <div className="bg-[#12141D] border border-[#292C3B] rounded-2xl p-5 shadow-lg space-y-3">
              <h4 className="text-xs font-semibold text-[#F5F5FA] uppercase tracking-wider">
                Checklist de Boas Práticas Unity
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

          {/* Vulnerabilities */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F5F5FA]">
              Vulnerabilidades ({result.vulnerabilities.length})
            </h4>

            {result.vulnerabilities.map((vuln, idx) => (
              <div
                key={idx}
                className="bg-[#12141D] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-[#292C3B] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                      {vuln.severity}
                    </span>
                    <h4 className="text-sm font-bold text-[#F5F5FA]">{vuln.title}</h4>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#0B0C12] p-3 rounded-xl border border-[#292C3B] space-y-1">
                    <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                      Como Pode Ser Adulterado:
                    </span>
                    <p className="text-[#9699AC]">{vuln.exploitImpact}</p>
                  </div>

                  <div className="bg-[#0B0C12] p-3 rounded-xl border border-[#292C3B] space-y-1">
                    <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                      Correção Recomendada:
                    </span>
                    <p className="text-[#9699AC]">{vuln.remediation}</p>
                  </div>
                </div>

                {/* Secure Example */}
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
