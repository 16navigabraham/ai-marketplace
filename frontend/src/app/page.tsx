'use client';

import { useAgents } from '@/hooks/useAgent';

export default function Home() {
  const { data, isLoading, error } = useAgents(1, 12);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          AI Agents Marketplace
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Trade, create, and govern AI agents across multiple blockchains
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-200">
          Failed to load agents. Please try again later.
        </div>
      )}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.data.map((agent) => (
            <div
              key={agent.id}
              className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-cyan-500 transition cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                {agent.avatarUrl && (
                  <img
                    src={agent.avatarUrl}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                  <p className="text-sm text-slate-400">{agent.type}</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm mb-4">{agent.description}</p>
              <div className="flex gap-2 flex-wrap">
                {agent.chains.map((chain) => (
                  <span
                    key={chain}
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-200 text-xs rounded"
                  >
                    {chain}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
