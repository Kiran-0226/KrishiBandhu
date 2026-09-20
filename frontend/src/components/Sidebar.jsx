import {
  LayoutDashboard,
  Sprout,
  Store,
  Gavel,
  CloudSun,
  Bot,
  WalletCards,
  FileText,
  Warehouse,
  Settings,
  Users,
  Truck,
  CreditCard,
} from 'lucide-react';

import {
  NavLink,
} from 'react-router-dom';

import {
  useAuth,
} from '../context/AuthContext';

import './Sidebar.css';

function Sidebar() {
  const {
    user,
  } = useAuth();

  const farmerMenu = [
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
      icon: Store,
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
      icon: WalletCards,
      path: '/passbook',
    },
    {
      label: 'Parchi',
      icon: FileText,
      path: '/parchi',
    },
    {
      label: 'Backhaul',
      icon: Truck,
      path: '/backhaul',
    },
    {
      label: 'Storage',
      icon: Warehouse,
      path: '/storage',
    },
  ];

  const traderMenu = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/trader',
    },
    {
      label: 'Market',
      icon: Store,
      path: '/market',
    },
    {
      label: 'Bids',
      icon: Gavel,
      path: '/bids',
    },
    {
      label: 'Parchi',
      icon: FileText,
      path: '/parchi',
    },
    {
      label: 'Backhaul',
      icon: Truck,
      path: '/trader/backhaul',
    },
    {
      label: 'Transactions',
      icon: WalletCards,
      path: '/passbook',
    },
    {
      label: 'Payments',
      icon: CreditCard,
      path: '/parchi',
    },
  ];

  const adminMenu = [
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
      label: 'Backhaul',
      icon: Truck,
      path: '/trader/backhaul',
    },
    {
      label: 'Storage',
      icon: Warehouse,
      path: '/storage',
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

  let menu = farmerMenu;

  if (user?.role === 'trader') {
    menu = traderMenu;
  }

  if (user?.role === 'admin') {
    menu = adminMenu;
  }

  return (
    <aside className="sidebar">

      <nav className="sidebar-nav">

        {menu.map(
          ({
            label,
            icon: Icon,
            path,
          }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `sidebar-link ${
                  isActive
                    ? 'active'
                    : ''
                }`
              }
            >

              <Icon
                size={19}
                strokeWidth={1.8}
              />

              <span>
                {label}
              </span>

            </NavLink>
          ),
        )}

      </nav>

      <div className="sidebar-bottom">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `sidebar-link ${
              isActive
                ? 'active'
                : ''
            }`
          }
        >

          <Settings
            size={19}
            strokeWidth={1.8}
          />

          <span>
            Settings
          </span>

        </NavLink>

      </div>

    </aside>
  );
}

export default Sidebar;