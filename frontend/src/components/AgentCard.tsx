'use client';

import Link from 'next/link';
import { Agent } from '@/types';
import { formatNumber } from '@/utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  BadgeCheck,
  PenLine,
  FlaskConical,
  Building2,
  Bot,
  type LucideIcon,
} from 'lucide-react';
import { AgentAvatar } from '@/components/AgentAvatar';

interface AgentCardProps {
  agent: Agent;
  price?: string;
  marketCap?: string;
  change24h?: string;
  onSelect?: (agent: Agent) => void;
}

const TYPE_META: Record<string, { icon: LucideIcon; label: string }> = {
  writing: { icon: PenLine, label: 'Writing' },
  research: { icon: FlaskConical, label: 'Research' },
  governance: { icon: Building2, label: 'Governance' },
  butler: { icon: Bot, label: 'Butler' },
};

/** Deterministic cover-gradient hue from the agent seed (matches the avatar). */
function hueFrom(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % 360;
}

export function AgentCard({
  agent,
  marketCap = '0',
  change24h = '0',
  onSelect,
}: AgentCardProps) {
  const isPositiveChange = parseFloat(change24h) >= 0;
  const name = agent.name || 'Untitled Agent';
  const type = agent.type || 'writing';
  const meta = TYPE_META[type] || TYPE_META.writing;
  const TypeIcon = meta.icon;
  const holders = (agent as { totalHolders?: number }).totalHolders ?? 0;
  const seed = agent.tokenAddresses?.base || agent.id;
  const onChain =
    !!agent.tokenAddresses?.base &&
    agent.tokenAddresses.base !== '0x0000000000000000000000000000000000000000';
  const hue = hueFrom(seed);

  return (
    <Link href={`/agent/${agent.id}`}>
      <div
        onClick={() => onSelect?.(agent)}
        className="card card-hover group h-full cursor-pointer overflow-hidden p-0"
      >
        {/* Cover banner */}
        <div
          className="relative h-20"
          style={{
            backgroundImage: `linear-gradient(120deg, hsl(${hue} 65% 30%), hsl(${(hue + 50) % 360} 60% 18%))`,
          }}
        >
          <div className="absolute inset-0 opacity-[0.15] [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:14px_14px]" />
          {/* Type pill */}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            <TypeIcon className="h-3 w-3" />
            {meta.label}
          </span>
        </div>

        <div className="relative z-10 px-6 pb-6">
          {/* Avatar overlapping the banner */}
          <div className="relative z-10 -mt-8 mb-3 flex items-end justify-between">
            <div className="rounded-2xl ring-4 ring-[#23170a]">
              {agent.avatarUrl ? (
                <img src={agent.avatarUrl} alt={name} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <AgentAvatar seed={seed} name={name} className="h-16 w-16" rounded="rounded-2xl" />
              )}
            </div>
            {onChain && (
              <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/30">
                <BadgeCheck className="h-3.5 w-3.5" />
                On-chain
              </span>
            )}
          </div>

          <h3 className="truncate font-display text-lg font-semibold text-white transition group-hover:text-clay-400">
            {name}
          </h3>
          <p className="mb-5 mt-1 line-clamp-2 text-sm leading-relaxed text-slate-400">
            {agent.description}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 border-t border-[#493113] pt-4">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Holders</p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {formatNumber(holders)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Mkt Cap</p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                ${formatNumber(marketCap, 0)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">24h</p>
              <p
                className={`mt-0.5 flex items-center gap-1 text-sm font-semibold ${
                  isPositiveChange ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                {isPositiveChange ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {Math.abs(parseFloat(change24h)).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
