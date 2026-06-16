'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAppStore } from '@/store/useAppStore';
import { apiClient } from '@/services/api';
import { AgentType } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { BackButton } from '@/components/BackButton';
import { CHAIN_OPTIONS } from '@/config/chains';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Wallet,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  PenLine,
  FlaskConical,
  Building2,
  Bot,
  Check,
  type LucideIcon,
} from 'lucide-react';

const AGENT_TYPES: { label: string; value: AgentType; icon: LucideIcon; from: string; to: string }[] = [
  { label: 'Writing', value: 'writing', icon: PenLine, from: '#ff9f1c', to: '#ffd166' },
  { label: 'Research', value: 'research', icon: FlaskConical, from: '#f39a1f', to: '#ffb640' },
  { label: 'Governance', value: 'governance', icon: Building2, from: '#d77a12', to: '#ffb640' },
  { label: 'Butler', value: 'butler', icon: Bot, from: '#ffc14d', to: '#fff0a8' },
];


export default function CreateAgentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const userAddress = useAppStore((state) => state.userAddress);
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'writing' as AgentType,
    chains: ['base'],
    allowedActions: 'run-inference, transfer',
    spendingLimit: '100',
    targetProtocols: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
    isLocked: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleChainToggle = (chain: string) => {
    setFormData((prev) => ({
      ...prev,
      chains: prev.chains.includes(chain)
        ? prev.chains.filter((c) => c !== chain)
        : [...prev.chains, chain],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!userAddress) throw new Error('Please connect your wallet first');
      if (!formData.name.trim()) throw new Error('Agent name is required');
      if (!formData.description.trim()) throw new Error('Agent description is required');
      if (formData.chains.length === 0) throw new Error('Select at least one blockchain');
      if (!formData.allowedActions.trim()) throw new Error('Allowed actions scope is required');

      // Create agent NFT and metadata via API
      await apiClient.createAgent({
        ...formData,
        creatorAddress: userAddress,
        metadata: {
          allowedActions: formData.allowedActions,
          spendingLimit: formData.spendingLimit,
          targetProtocols: formData.targetProtocols,
          isLocked: formData.isLocked,
        },
      } as any);

      await queryClient.invalidateQueries({ queryKey: ['agents'] });
      setFormData({
        name: '',
        description: '',
        type: 'writing',
        chains: ['base'],
        allowedActions: 'run-inference, transfer',
        spendingLimit: '100',
        targetProtocols: '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
        isLocked: true,
      });
      router.push('/marketplace');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
            ? String((err as any).message)
            : 'Failed to create agent';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!userAddress) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <div className="card flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#493113] bg-[#23170a]">
            <Wallet className="h-8 w-8 text-slate-500" />
          </div>
          <p className="max-w-sm text-slate-400">Connect your wallet to create an agent.</p>
        </div>
      </main>
    );
  }

  const inputClass =
    'w-full rounded-xl border border-[#493113] bg-[#23170a] px-4 py-2.5 text-white placeholder-slate-500 transition focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20';

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <BackButton fallback="/marketplace" label="Back to marketplace" />
      <PageHeader
        eyebrow="Create"
        title="Launch an AI Agent"
        subtitle="Deploy your agent and configure its reputation card and delegation bounds."
      />

      <motion.form
        onSubmit={handleSubmit}
        className="card space-y-6 p-8"
        initial={{ opacity: 0, y: reduce ? 0 : 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h3 className="text-md font-semibold text-white mb-2">1. Identity Details</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Agent Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., ResearchBot 3000"
                className={inputClass}
                maxLength={255}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what your agent does..."
                rows={3}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">Agent Type</label>
              <div className="grid grid-cols-2 gap-3">
                {AGENT_TYPES.map((t) => {
                  const Icon = t.icon;
                  const active = formData.type === t.value;
                  return (
                    <motion.button
                      key={t.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, type: t.value }))}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        active
                          ? 'border-[#ffb640] bg-[#2a1c0b]'
                          : 'border-[#493113] bg-[#23170a] hover:border-[#76501d]'
                      }`}
                    >
                      <span
                        className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-[0_8px_18px_-10px_rgba(255,184,55,0.9),inset_0_1px_0_rgba(255,255,255,0.45)]"
                        style={{ backgroundImage: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                      >
                        <span className="pointer-events-none absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white/25 blur-[1px]" />
                        <Icon className="relative h-5 w-5 text-[#211100]" strokeWidth={2.25} />
                      </span>
                      <span className="text-sm font-semibold text-white">{t.label}</span>
                      {active && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-clay-400">
                          <Check className="h-4 w-4" strokeWidth={3} />
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-[#38260f]" />

        <div>
          <h3 className="text-md font-semibold text-white mb-2">2. Character Card & Permission Scopes</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Allowed Actions Scope</label>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                What functions can the agent run? Use <code className="text-cyan-400 font-mono">run-inference</code> to allow the agent to process reasoning queries, and <code className="text-cyan-400 font-mono">transfer</code> to allow it to move funds.
              </p>
              <input
                type="text"
                name="allowedActions"
                value={formData.allowedActions}
                onChange={handleInputChange}
                placeholder="e.g., run-inference, transfer"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Spending Limit (USDC)</label>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                The maximum amount of money (in USDC) the agent is allowed to spend. This acts as a strict safety guardrail so the agent cannot spend more than this cap.
              </p>
              <input
                type="number"
                name="spendingLimit"
                value={formData.spendingLimit}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">Allowed Target Protocols</label>
              <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                The blockchain addresses (smart contracts) the agent is allowed to interact with. For security, default is set to the Base Sepolia USDC contract, preventing it from sending funds to unauthorized addresses.
              </p>
              <input
                type="text"
                name="targetProtocols"
                value={formData.targetProtocols}
                onChange={handleInputChange}
                placeholder="Contract address (e.g. USDC token contract)"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <hr className="border-[#38260f]" />

        <div>
          <h3 className="text-md font-semibold text-white mb-2">3. Deploy & Reputation Snapshots</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-3 block text-sm font-medium text-slate-300">Deploy to Chain</label>
              <div className="grid grid-cols-2 gap-3">
                {CHAIN_OPTIONS.map((chain) => {
                  const active = formData.chains.includes(chain.id);
                  return (
                    <button
                      key={chain.id}
                      type="button"
                      disabled={!chain.enabled}
                      onClick={() => chain.enabled && handleChainToggle(chain.id)}
                      className={`rounded-xl border px-4 py-3 text-left font-medium transition ${
                        active
                          ? 'border-cyan-500 bg-cyan-600 text-white'
                          : chain.enabled
                          ? 'border-[#493113] bg-[#23170a] text-slate-300 hover:border-[#76501d]'
                          : 'cursor-not-allowed border-[#2a2a2a] bg-[#1a160f] text-slate-600'
                      }`}
                    >
                      {chain.label}
                      {!chain.enabled && (
                        <span className="ml-1 text-[10px] uppercase tracking-wide">· soon</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl bg-[#1d140a] p-4 border border-[#ffb640]/10">
              <input
                type="checkbox"
                name="isLocked"
                checked={formData.isLocked}
                onChange={handleCheckboxChange}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-cyan-500"
              />
              <div>
                <label className="text-sm font-medium text-white flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Lock Configuration Snapshot
                </label>
                <p className="text-xs text-slate-400 mt-1">
                  Locks this agent's identity and Character Card permissions until the reputation threshold is met, preventing silent changes.
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <motion.button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full"
          whileHover={isLoading ? undefined : { scale: 1.02 }}
          whileTap={isLoading ? undefined : { scale: 0.98 }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Deploying...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" /> Deploy Agent
            </>
          )}
        </motion.button>
      </motion.form>
    </main>
  );
}
