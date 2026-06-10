'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { shortenAddress } from '@/utils/formatters';
import { apiClient } from '@/services/api';

const INTERESTS = [
  { id: 'trading', label: '💰 Trading', icon: '💱' },
  { id: 'creation', label: '🚀 Creating Agents', icon: '⚙️' },
  { id: 'governance', label: '🏛️ Governance', icon: '🗳️' },
  { id: 'research', label: '🔬 Research', icon: '🧪' },
];

const CHAINS = [
  { id: 'ethereum', label: 'Ethereum', icon: '⟠' },
  { id: 'polygon', label: 'Polygon', icon: '🟣' },
  { id: 'arbitrum', label: 'Arbitrum', icon: '🔵' },
  { id: 'base', label: 'Base', icon: '⚪' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: privyLoading } = usePrivy();
  const [step, setStep] = useState<'welcome' | 'interests' | 'chains' | 'done'>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [interests, setInterests] = useState<string[]>([]);
  const [chains, setChains] = useState<string[]>(['ethereum']);

  useEffect(() => {
    if (!privyLoading && !user?.wallet) {
      router.push('/');
    }
  }, [user, privyLoading, router]);

  if (privyLoading || !user?.wallet) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </main>
    );
  }

  const walletAddress = user.wallet.address;

  const handleInterestToggle = (id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleChainToggle = (id: string) => {
    setChains((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/users/preferences', {
        address: walletAddress,
        interests,
        chains,
      });

      setStep('done');
      setTimeout(() => router.push('/marketplace'), 2000);
    } catch (err) {
      console.error('Failed to save preferences:', err);
      alert('Failed to save preferences. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">
              Step {step === 'welcome' ? 1 : step === 'interests' ? 2 : step === 'chains' ? 3 : 4} of 4
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-300"
              style={{
                width:
                  step === 'welcome'
                    ? '25%'
                    : step === 'interests'
                      ? '50%'
                      : step === 'chains'
                        ? '75%'
                        : '100%',
              }}
            ></div>
          </div>
        </div>

        {/* Welcome Step */}
        {step === 'welcome' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-4xl font-bold text-white mb-4">Welcome!</h1>
              <p className="text-slate-300 text-lg mb-8">
                Your embedded wallet is ready to use
              </p>

              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 mb-8">
                <p className="text-slate-400 text-sm mb-2">Your Wallet Address</p>
                <p className="text-cyan-200 font-mono text-lg font-semibold break-all">
                  {walletAddress}
                </p>
              </div>

              <p className="text-slate-300 mb-8">
                Let's personalize your experience. This will take just 2 minutes.
              </p>

              <button
                onClick={() => setStep('interests')}
                className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition"
              >
                Get Started →
              </button>
            </div>
          </div>
        )}

        {/* Interests Step */}
        {step === 'interests' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-white mb-2">What interests you?</h1>
            <p className="text-slate-400 mb-8">Select all that apply</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {INTERESTS.map((interest) => (
                <button
                  key={interest.id}
                  onClick={() => handleInterestToggle(interest.id)}
                  className={`p-6 rounded-lg font-medium transition border-2 ${
                    interests.includes(interest.id)
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{interest.icon}</div>
                  <div className="text-sm">{interest.label}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('welcome')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep('chains')}
                className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Chains Step */}
        {step === 'chains' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-white mb-2">Preferred blockchains?</h1>
            <p className="text-slate-400 mb-8">Where do you want to trade and create agents?</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {CHAINS.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleChainToggle(chain.id)}
                  className={`p-6 rounded-lg font-medium transition border-2 ${
                    chains.includes(chain.id)
                      ? 'bg-cyan-600 border-cyan-500 text-white'
                      : 'bg-slate-700 border-slate-600 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="text-3xl mb-2">{chain.icon}</div>
                  <div className="text-sm">{chain.label}</div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('interests')}
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 text-white font-medium rounded-lg transition"
              >
                {isLoading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4 animate-bounce">✨</div>
            <h1 className="text-3xl font-bold text-white mb-2">All Set!</h1>
            <p className="text-slate-300 mb-6">
              You're ready to explore the marketplace. Redirecting...
            </p>
            <div className="inline-block">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
