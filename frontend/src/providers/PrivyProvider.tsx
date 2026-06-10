'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';

export function PricyAuthProvider({ children }: { children: ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'clxxxxxxxxxxxxxxx'}
      config={{
        loginMethods: ['email', 'google', 'github'],
        appearance: {
          theme: 'dark',
          accentColor: '#06b6d4',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
