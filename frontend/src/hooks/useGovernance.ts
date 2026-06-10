import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export function useGovernanceProposals(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['proposals', page, limit],
    queryFn: () => apiClient.getGovernanceProposals(page, limit),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useVotingPower(userAddress: string | null) {
  return useQuery({
    queryKey: ['votingPower', userAddress],
    queryFn: () => apiClient.getVotingPower(userAddress!),
    enabled: !!userAddress,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useVoteOnProposal(proposalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (voteType: 'for' | 'against') =>
      apiClient.voteOnProposal(proposalId, voteType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['votingPower'] });
    },
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (proposal: any) => apiClient.createProposal(proposal),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}
