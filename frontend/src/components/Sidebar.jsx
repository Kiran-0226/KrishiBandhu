import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Gavel,
  CloudSun,
  Bot,
  BookOpen,
  Settings,
} from 'lucide-react';

import { NavLink } from 'react-router-dom';

import './Sidebar.css';

const menuItems = [
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
];

function Sidebar() {
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