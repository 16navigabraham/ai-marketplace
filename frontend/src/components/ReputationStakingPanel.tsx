'use client';

import { useState, useEffect, useCallback } from 'react';
import { Award, PiggyBank, Loader2, ShieldCheck, ExternalLink } from 'lucide-react';
import { useAuth } from '@/providers/WalletProvider';
import {
  getOnchainReputation,
  stakeOnAgent,
  stakingEnabled,
  type OnchainReputation,
} from '@/lib/staking';

/**
 * On-chain Trust & Staking. Reads the agent's reputation + total staked from the
 * ReputationScore / TrustStaking contracts, and lets a user stake real ETH
 * behind the agent (1% protocol fee → treasury). Only available for agents that
 * exist on-chain (have a numeric onchainId).
 */
export function ReputationStakingPanel({ onchainId }: { onchainId?: string }) {
  const { authenticated, getEthersSigner } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('0.01');
  const [rep, setRep] = useState<OnchainReputation | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; hash?: string } | null>(null);

  const available = stakingEnabled() && !!onchainId;

  const load = useCallback(async () => {
    if (!available) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getOnchainReputation(onchainId!);
    setRep(data);
    setLoading(false);
  }, [available, onchainId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const signer = await getEthersSigner();
      if (!signer) throw new Error('Wallet not ready.');
      const { hash } = await stakeOnAgent({ signer, agentId: onchainId!, amountEth: stakeAmount });
      setMessage({ type: 'success', text: `Staked ${stakeAmount} ETH on-chain (1% fee to treasury).`, hash });
      await load();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Staking failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Hidden entirely for DB-only agents / unconfigured staking — no fake UI.
  if (!available) return null;

  if (loading) {
    return (
      <div className="card flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-clay-400" />
      </div>
    );
  }

  const score = rep?.score ?? 0;
  const tier = rep?.tier ?? 'Unverified';
  const tierColors: Record<string, string> = {
    Elite: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Trusted: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    Provisional: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Unverified: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="card space-y-4 border-[#38260f] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-clay-400" />
          <h3 className="font-semibold text-white">Trust &amp; Staking</h3>
        </div>
        <span className={`chip border px-2.5 py-0.5 text-xs capitalize ${tierColors[tier] || ''}`}>
          {tier} Tier
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span>Reputation Score</span>
          <span className="font-semibold text-white">{score} / 1000</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-[#38260f] bg-[#1e150b]">
          <div
            className="h-full bg-gradient-to-r from-[#ffb640] to-[#f59e1b] transition-all duration-500"
            style={{ width: `${score / 10}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 py-1 text-center">
        <div className="rounded-lg border border-[#38260f] bg-[#130f08] p-2">
          <p className="font-mono text-[10px] uppercase text-slate-500">Tasks Success</p>
          <p className="mt-0.5 text-lg font-bold text-white">{rep?.taskSuccessCount ?? 0}</p>
        </div>
        <div className="rounded-lg border border-[#38260f] bg-[#130f08] p-2">
          <p className="font-mono text-[10px] uppercase text-slate-500">Disputes</p>
          <p className="mt-0.5 text-lg font-bold text-rose-400">{rep?.disputeCount ?? 0}</p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#38260f] pt-3 text-sm">
        <span className="text-slate-400">Total Staked</span>
        <span className="text-gradient-accent font-semibold">
          {Number(rep?.totalStakedEth ?? '0').toLocaleString('en-US', { maximumFractionDigits: 4 })} ETH
        </span>
      </div>

      {authenticated && (
        <div className="space-y-3 pt-2">
          {message && (
            <div
              className={`flex items-start gap-1.5 rounded-lg border p-2.5 text-xs ${
                message.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                  : 'border-rose-500/20 bg-rose-500/10 text-rose-300'
              }`}
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="space-y-1">
                <span className="block">{message.text}</span>
                {message.hash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${message.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 underline"
                  >
                    <ExternalLink className="h-3 w-3" /> View tx
                  </a>
                )}
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              step="0.001"
              min="0"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              disabled={actionLoading}
              className="w-full rounded-lg border border-[#493113] bg-[#0d0a05] px-3 py-2 font-mono text-sm text-white focus:border-clay-600 focus:outline-none"
              placeholder="ETH to stake"
            />
            <button
              onClick={handleStake}
              disabled={actionLoading || !stakeAmount}
              className="btn-primary flex shrink-0 items-center gap-1.5 px-4 text-xs font-semibold"
            >
              {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <PiggyBank className="h-3.5 w-3.5" />}
              Stake ETH
            </button>
          </div>
          <p className="text-center text-[11px] text-slate-500">
            Staking signals trust in this agent. 1% protocol fee, rest is reclaimable.
          </p>
        </div>
      )}
    </div>
  );
}
