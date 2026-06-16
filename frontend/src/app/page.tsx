'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useAuth } from '@/providers/WalletProvider';
import { checkOnboarded } from '@/lib/onboarding';
import { RobotHero } from '@/components/RobotHero';
import {
  Rocket,
  Globe,
  DollarSign,
  Building2,
  Loader2,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  desc: string;
  /** Per-emblem caramel gradient (kept within the warm palette). */
  from: string;
  to: string;
}

const FEATURES: Feature[] = [
  {
    icon: Rocket,
    title: 'No Wallet Installation',
    desc: 'Sign up with email — an embedded wallet is created for you instantly.',
    from: '#ff9f1c',
    to: '#ffd166',
  },
  {
    icon: Globe,
    title: 'Multi-Chain',
    desc: 'Trade seamlessly across Ethereum, Polygon, Arbitrum, and Base.',
    from: '#f39a1f',
    to: '#ffb640',
  },
  {
    icon: DollarSign,
    title: 'Fair Pricing',
    desc: 'Transparent bonding curves drive real-time price discovery.',
    from: '#ffc14d',
    to: '#fff0a8',
  },
  {
    icon: Building2,
    title: 'On-Chain Governance',
    desc: 'Stake, vote, and shape the future of every agent you hold.',
    from: '#d77a12',
    to: '#ffb640',
  },
];

const STATS = [
  { value: '4', label: 'Chains' },
  { value: '0', label: 'Extensions needed' },
  { value: '<30s', label: 'To onboard' },
];

/**
 * A layered "app-icon" emblem: a gradient tile with a soft decorative backdrop
 * and a duotone glyph — reads as a designed graphic rather than a bare line icon.
 */
function FeatureEmblem({ icon: Icon, from, to }: Pick<Feature, 'icon' | 'from' | 'to'>) {
  return (
    <div
      className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl shadow-[0_12px_28px_-14px_rgba(255,184,55,0.85),inset_0_1px_0_rgba(255,255,255,0.45)]"
      style={{ backgroundImage: `linear-gradient(140deg, ${from}, ${to})` }}
    >
      {/* decorative geometry behind the glyph */}
      <span className="pointer-events-none absolute -right-3 -top-3 h-10 w-10 rounded-full bg-white/25 blur-[2px]" />
      <span className="pointer-events-none absolute -bottom-4 -left-2 h-9 w-9 rounded-full bg-black/10" />
      <span className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgba(33,17,0,0.18)_1px,transparent_0)] [background-size:8px_8px] opacity-30" />
      <Icon className="relative h-7 w-7 text-[#211100]" strokeWidth={2.25} />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { authenticated, ready, user, login } = useAuth();
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ready || !authenticated) return;
    let cancelled = false;
    (async () => {
      // Backend-authoritative: returning users (any device) skip the wizard.
      const done = await checkOnboarded(user?.address);
      if (!cancelled) router.replace(done ? '/marketplace' : '/onboarding');
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticated, ready, user?.address, router]);

  // While loading, or while an authenticated user is being redirected into the
  // app, show a loader instead of flashing the marketing landing page.
  if (!ready || authenticated) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-cyan-400" size={40} />
      </main>
    );
  }

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduce ? 0 : 0.1, delayChildren: 0.05 },
    },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <main className="relative mx-auto max-w-6xl overflow-hidden px-4 pb-24 pt-16 md:pt-24">
      {/* Floating ambient orbs */}
      {!reduce && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#ff9f1c]/20 blur-3xl"
            animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-40 h-80 w-80 rounded-full bg-[#ffd166]/15 blur-3xl"
            animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Hero */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
        className="relative text-center"
      >
        <motion.div variants={item}>
          <RobotHero />
        </motion.div>

        <motion.div variants={item} className="mb-6 flex justify-center">
          <span className="eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Multi-Chain AI Agents
          </span>
        </motion.div>

        <motion.h1 variants={item} className="text-5xl font-bold tracking-tight md:text-7xl">
          <span className="text-gradient">Synapse</span>
        </motion.h1>

        <motion.p variants={item} className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
          Create, trade, and govern autonomous AI agents across four blockchains —
          with <span className="text-white">no wallet extension required.</span>
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.button
            onClick={() => login()}
            className="btn-primary text-base"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started — it's free
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <motion.a
            href="#features"
            className="btn-ghost text-base"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Explore features
          </motion.a>
        </motion.div>

        <motion.p variants={item} className="mt-4 text-sm text-slate-500">
          Sign in with email. No credit card, no seed phrase.
        </motion.p>

        {/* Stats */}
        <motion.div variants={item} className="mx-auto mt-14 grid max-w-lg grid-cols-3 gap-4">
          {STATS.map((s) => (
            <motion.div
              key={s.label}
              className="card px-4 py-5"
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="text-2xl font-bold text-gradient-accent md:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-slate-400">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features */}
      <section id="features" className="relative mt-28 scroll-mt-24">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            Everything you need to launch
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            A complete platform for the agent economy — onboarding to governance.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-5 sm:grid-cols-2"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="card card-hover p-6"
            >
              <div className="mb-4">
                <FeatureEmblem icon={f.icon} from={f.from} to={f.to} />
              </div>
              <h3 className="text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section
        className="mt-28"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="card relative overflow-hidden p-10 text-center md:p-16">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ffb640]/15 via-transparent to-[#ffd166]/10"
            animate={reduce ? undefined : { opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Ready to join the agent economy?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-slate-400">
              Onboard in under 30 seconds and start trading your first AI agent.
            </p>
            <motion.button
              onClick={() => login()}
              className="btn-primary mt-8 text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              Launch Synapse
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
