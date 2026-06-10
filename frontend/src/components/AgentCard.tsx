'use client';

import Link from 'next/link';
import { Agent } from '@/types';
import { formatPrice, formatNumber } from '@/utils/formatters';

interface AgentCardProps {
  agent: Agent;
  price?: string;
  marketCap?: string;
  change24h?: string;
  onSelect?: (agent: Agent) => void;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  writing: { bg: 'bg-purple-500/20', text: 'text-purple-300' },
  research: { bg: 'bg-blue-500/20', text: 'text-blue-300' },
  governance: { bg: 'bg-green-500/20', text: 'text-green-300' },
  butler: { bg: 'bg-orange-500/20', text: 'text-orange-300' },
};

export function AgentCard({
  agent,
  price = '0',
  marketCap = '0',
  change24h = '0',
  onSelect,
}: AgentCardProps) {
  const typeColor = TYPE_COLORS[agent.type] || TYPE_COLORS.writing;
  const isPositiveChange = parseFloat(change24h) >= 0;

  const handleClick = () => {
    if (onSelect) {
      onSelect(agent);
    }
  };

  return (
    <Link href={`/agent/${agent.id}`}>
      <div
        onClick={handleClick}
        className="group h-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 hover:border-cyan-500 rounded-lg p-6 transition cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {agent.avatarUrl && (
              <img
                src={agent.avatarUrl}
                alt={agent.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            {!agent.avatarUrl && (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {agent.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-400 transition">
                {agent.name}
              </h3>
              <p className={`text-xs font-medium px-2 py-1 rounded w-fit ${typeColor.bg} ${typeColor.text} mt-1`}>
                {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-sm mb-4 line-clamp-2">
          {agent.description}
        </p>

        {/* Price and Stats */}
        <div className="space-y-3 mb-4 pb-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Price</span>
            <span className="text-sm font-semibold text-white">
              {formatPrice(price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Market Cap</span>
            <span className="text-sm font-semibold text-white">
              ${formatNumber(marketCap, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">24h Change</span>
            <span
              className={`text-sm font-semibold ${
                isPositiveChange ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isPositiveChange ? '+' : ''}{parseFloat(change24h).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Chains */}
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Available on:</p>
          <div className="flex flex-wrap gap-2">
            {agent.chains.map((chain) => (
              <span
                key={chain}
                className="px-2.5 py-1 bg-slate-700/50 hover:bg-slate-600 text-slate-300 text-xs rounded-full transition"
              >
                {chain}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
