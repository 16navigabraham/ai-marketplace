/**
 * Deterministic generated avatar — a unique gradient + initial derived from a
 * seed (agent id / token address / name). No uploads, no IPFS, no Pinata:
 * the same seed always renders the same avatar, fully offline.
 */

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

interface AgentAvatarProps {
  seed: string;
  name?: string;
  /** Tailwind size classes, e.g. 'h-12 w-12'. */
  className?: string;
  rounded?: string; // e.g. 'rounded-xl'
}

export function AgentAvatar({
  seed,
  name = '',
  className = 'h-12 w-12',
  rounded = 'rounded-xl',
}: AgentAvatarProps) {
  const h = hashString(seed || name || 'agent');
  const hue1 = h % 360;
  const hue2 = (hue1 + 35 + (h % 70)) % 360;
  const hue3 = (hue1 + 180 + (h % 40)) % 360;
  const angle = h % 360;
  const initial = (name.trim()[0] || 'A').toUpperCase();

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${rounded} ${className} font-display font-bold text-white`}
      style={{
        backgroundImage: [
          `radial-gradient(circle at 25% 20%, hsl(${hue3} 80% 60% / 0.9), transparent 55%)`,
          `radial-gradient(circle at 80% 80%, hsl(${hue2} 85% 45% / 0.95), transparent 60%)`,
          `linear-gradient(${angle}deg, hsl(${hue1} 70% 42%), hsl(${hue2} 72% 32%))`,
        ].join(', '),
      }}
      aria-hidden
    >
      {/* subtle grain/sheen */}
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_1px_1px,#fff_1px,transparent_0)] [background-size:8px_8px]" />
      <span className="relative text-[length:48%] drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
        {initial}
      </span>
    </div>
  );
}
