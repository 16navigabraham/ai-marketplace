'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/services/api';
import { Award, AlertTriangle, PiggyBank, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/providers/WalletProvider';
import { formatNumber } from '@/utils/formatters';

export function ReputationStakingPanel({ agentId }: { agentId: string }) {
  const { authenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stakeAmount, setStakeAmount] = useState('100');
  const [reputation, setReputation] = useState<{
    score: number;
    tier: string;
    totalStaked: string;
    disputes: number;
    successCount: number;
  } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReputation = async () => {
    try {
      const data = await apiClient.getReputation(agentId);
      setReputation(data);
    } catch (err) {
      console.error('Failed to load reputation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReputation();
  }, [agentId]);

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const atoms = (parseFloat(stakeAmount) * 1e6).toString(); // USDC decimals
      const res = await apiClient.stakeReputation(agentId, atoms);
      setReputation(res.reputation);
      setMessage({
        type: 'success',
        text: `Successfully staked ${stakeAmount} USDC (1% protocol fee routed to treasury).`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Staking failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (
      !confirm(
        'Are you sure you want to file a dispute? Filing malicious reports will result in slashing of your own backing.'
      )
    )
      return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await apiClient.reportMisbehavior(agentId);
      setReputation(res.reputation);
      setMessage({
        type: 'success',
        text: 'Dispute filed. Agent reputation score slashed by 50 points.',
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Dispute report failed.' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-clay-400" />
      </div>
    );
  }

  if (!reputation) return null;

  const tierColors: Record<string, string> = {
    Elite: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    Trusted: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    Provisional: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    Unverified: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  };

  return (
    <div className="card p-6 space-y-4 border-[#38260f]">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-clay-400" />
          <h3 className="font-semibold text-white">Trust & Staking</h3>
        </div>
        <span
          className={`chip border text-xs px-2.5 py-0.5 capitalize ${
            tierColors[reputation.tier] || ''
          }`}
        >
          {reputation.tier} Tier
        </span>
      </div>

      {/* Score bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Reputation Score</span>
          <span className="text-white font-semibold">{reputation.score} / 1000</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#1e150b] overflow-hidden border border-[#38260f]">
          <div
            className="h-full bg-gradient-to-r from-[#ffb640] to-[#f59e1b] transition-all duration-500"
            style={{ width: `${reputation.score / 10}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 text-center py-1">
        <div className="rounded-lg bg-[#130f08] border border-[#38260f] p-2">
          <p className="text-[10px] text-slate-500 uppercase font-mono">Tasks Success</p>
          <p className="text-lg font-bold text-white mt-0.5">{reputation.successCount}</p>
        </div>
        <div className="rounded-lg bg-[#130f08] border border-[#38260f] p-2">
          <p className="text-[10px] text-slate-500 uppercase font-mono">Active Disputes</p>
          <p className="text-lg font-bold text-rose-400 mt-0.5">{reputation.disputes}</p>
        </div>
      </div>

      <div className="border-t border-[#38260f] pt-3 flex items-center justify-between text-sm">
        <span className="text-slate-400">Reputation Staked</span>
        <span className="font-semibold text-gradient-accent">
          {formatNumber((parseFloat(reputation.totalStaked) / 1e6).toString(), 2)} USDC
        </span>
      </div>

      {/* Actions */}
      {authenticated && (
        <div className="space-y-3 pt-2">
          {message && (
            <div
              className={`p-2.5 rounded-lg border text-xs flex items-start gap-1.5 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              disabled={actionLoading}
              className="w-full rounded-lg border border-[#493113] bg-[#0d0a05] px-3 py-2 font-mono text-white text-sm focus:border-clay-600 focus:outline-none"
              placeholder="Amount to stake"
            />
            <button
              onClick={handleStake}
              disabled={actionLoading || !stakeAmount}
              className="btn-primary shrink-0 px-4 text-xs font-semibold flex items-center gap-1.5"
            >
              {actionLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <PiggyBank className="h-3.5 w-3.5" />
              )}
              Stake
            </button>
          </div>

          <button
            onClick={handleReport}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-300 transition"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            Report Misbehavior & File Dispute
          </button>
        </div>
      )}
    </div>
  );
}
