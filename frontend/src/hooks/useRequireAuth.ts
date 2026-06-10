'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useRequireAuth() {
  const { authenticated, isLoading } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !authenticated) {
      router.push('/');
    }
  }, [authenticated, isLoading, router]);

  return { authenticated, isLoading };
}
