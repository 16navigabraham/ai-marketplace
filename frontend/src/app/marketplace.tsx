'use client';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAgents } from '@/hooks/useAgent';
import { AgentCard } from '@/components/AgentCard';

export default function MarketplacePage() {
  const { authenticated, isLoading: authLoading } = useRequireAuth();
  const { data, isLoading: agentsLoading } = useAgents();

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </main>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-white mb-4">Marketplace</h1>
        <p className="text-xl text-slate-400">
          Discover and trade AI agents across multiple blockchains
        </p>
      </div>

      {agentsLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : data && data.data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400">No agents available yet</p>
        </div>
      )}
    </main>
  );
}
