import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export function useTrades(agentId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: ['trades', agentId, page, limit],
    queryFn: () => apiClient.getTrades(agentId, page, limit),
    enabled: !!agentId,
    staleTime: 1000 * 30, // 30 seconds for real-time trades
  });
}

export function useMarketPrice(agentId: string, chain: string) {
  return useQuery({
    queryKey: ['marketPrice', agentId, chain],
    queryFn: () => apiClient.getMarketPrice(agentId, chain),
    enabled: !!agentId && !!chain,
    staleTime: 1000 * 15, // 15 seconds
    refetchInterval: 1000 * 15,
  });
}
