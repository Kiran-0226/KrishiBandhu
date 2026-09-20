import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Gavel,
  CloudSun,
  Bot,
  BookOpen,
  Settings,
  ShoppingBasket,
  ReceiptText,
  CreditCard,
  Users,
  Store,
  WalletCards,
  Handshake,
  FileText,
} from 'lucide-react';

import { NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import './Sidebar.css';

const farmerMenuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    label: 'Crops',
    icon: Sprout,
    path: '/crops',
  },
  {
    label: 'Market',
    icon: TrendingUp,
    path: '/market',
  },
  {
    label: 'Bids',
    icon: Gavel,
    path: '/bids',
  },
  {
    label: 'Weather',
    icon: CloudSun,
    path: '/weather',
  },
  {
    label: 'AI Assistant',
    icon: Bot,
    path: '/ai-assistant',
  },
  {
    label: 'Passbook',
    icon: BookOpen,
    path: '/passbook',
  },
  {
    label: 'Parchi',
    icon: ReceiptText,
    path: '/parchi',
  },
];

const traderMenuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/trader',
  },
  {
    label: 'Find Crops',
    icon: ShoppingBasket,
    path: '/trader/crops',
  },
  {
    label: 'Market',
    icon: TrendingUp,
    path: '/market',
  },
  {
    label: 'My Bids',
    icon: Gavel,
    path: '/trader/bids',
  },
  {
    label: 'Purchases',
    icon: Handshake,
    path: '/trader/purchases',
  },
  {
    label: 'Parchi',
    icon: ReceiptText,
    path: '/parchi',
  },
  {
    label: 'Payments',
    icon: CreditCard,
    path: '/payments',
  },
  {
    label: 'Passbook',
    icon: BookOpen,
    path: '/passbook',
  },
];

const adminMenuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
  },
  {
    label: 'Users',
    icon: Users,
    path: '/admin/users',
  },
  {
    label: 'Markets',
    icon: Store,
    path: '/admin/markets',
  },
  {
    label: 'Crops',
    icon: Sprout,
    path: '/admin/crops',
  },
  {
    label: 'Bids',
    icon: Gavel,
    path: '/admin/bids',
  },
  {
    label: 'Parchi',
    icon: FileText,
    path: '/admin/parchi',
  },
  {
    label: 'Transactions',
    icon: WalletCards,
    path: '/admin/transactions',
  },
  {
    label: 'Payments',
    icon: CreditCard,
    path: '/admin/payments',
  },
];

function Sidebar() {
  const { user } = useAuth();

  const role = user?.role || 'farmer';

  let menuItems = farmerMenuItems;

  if (role === 'trader') {
    menuItems = traderMenuItems;
  }

  if (role === 'admin') {
    menuItems = adminMenuItems;
  }

  return (
    <aside className="sidebar">

      <div className="sidebar-menu">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${
                  isActive ? 'active' : ''
                }`
              }
            >
              <Icon size={19} />

              <span>
                {item.label}
              </span>
            </NavLink>
          );
        })}

      </div>

      <div className="sidebar-bottom">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-item ${
              isActive ? 'active' : ''
            }`
          }
        >
          <Settings size={19} />

          <span>
            Settings
          </span>
        </NavLink>

      </div>

    </aside>
  );
}

export default Sidebar;