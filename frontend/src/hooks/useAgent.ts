import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';
import { Agent } from '@/types';

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agent', id],
    queryFn: () => apiClient.getAgent(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAgents(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['agents', page, limit],
    queryFn: () => apiClient.getAgents(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useCreateAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agent: Partial<Agent>) => apiClient.createAgent(agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useUpdateAgent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agent: Partial<Agent>) => apiClient.updateAgent(id, agent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent', id] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}
