import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export function usePortfolio(userAddress: string | null) {
  return useQuery({
    queryKey: ['portfolio', userAddress],
    queryFn: () => apiClient.getPortfolio(userAddress!),
    enabled: !!userAddress,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60,
  });
}

export function usePortfolioValue(userAddress: string | null) {
  return useQuery({
    queryKey: ['portfolioValue', userAddress],
    queryFn: () => apiClient.getPortfolioValue(userAddress!),
    enabled: !!userAddress,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });
}
