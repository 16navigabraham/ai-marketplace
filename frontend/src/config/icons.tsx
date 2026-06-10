import {
  Rocket,
  Globe,
  DollarSign,
  Building2,
  Zap,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  LogOut,
  LogIn,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

export const ICONS = {
  // Auth
  login: LogIn,
  logout: LogOut,

  // Navigation
  next: ChevronRight,
  prev: ChevronLeft,

  // Features
  noWallet: Rocket,
  multiChain: Globe,
  fairPricing: DollarSign,
  governance: Building2,

  // Actions
  create: Plus,
  close: X,
  settings: Settings,
  copy: Copy,
  external: ExternalLink,

  // States
  loading: Loader,
  error: AlertCircle,
  success: CheckCircle,

  // Market
  trading: TrendingUp,
  chart: BarChart3,
  users: Users,
  bolt: Zap,
};

export type IconName = keyof typeof ICONS;

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 24, className }: IconProps) {
  const IconComponent = ICONS[name];
  return <IconComponent size={size} className={className} />;
}
