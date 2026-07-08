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
    title: 'Operations',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/sales-orders', label: 'Sales Orders', icon: ClipboardList },
      { to: '/scheduling', label: 'Scheduling', icon: CalendarClock },
      { to: '/monitoring', label: 'Monitoring', icon: Activity },
    ],
  },
  {
    title: 'Registries',
    items: [
      { to: '/customers', label: 'Customers', icon: Users },
      { to: '/transport-types', label: 'Transport Types', icon: Truck },
      { to: '/items', label: 'Items', icon: Package },
    ],
  },
  {
    title: 'Governance',
    items: [{ to: '/audit', label: 'Audit Trail', icon: History }],
  },
];
