import {
  LayoutDashboard,
  ClipboardList,
  CalendarClock,
  Activity,
  Users,
  Truck,
  Package,
  History,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Operações',
    items: [
      { to: '/', label: 'Painel', icon: LayoutDashboard },
      { to: '/sales-orders', label: 'Ordens de Venda', icon: ClipboardList },
      { to: '/scheduling', label: 'Agendamento', icon: CalendarClock },
      { to: '/monitoring', label: 'Monitoramento', icon: Activity },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { to: '/customers', label: 'Clientes', icon: Users },
      { to: '/transport-types', label: 'Tipos de Transporte', icon: Truck },
      { to: '/items', label: 'Itens', icon: Package },
    ],
  },
  {
    title: 'Governança',
    items: [{ to: '/audit', label: 'Trilha de Auditoria', icon: History }],
  },
];
