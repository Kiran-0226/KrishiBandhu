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

import './Sidebar.css';

const menuItems = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Crops',
    icon: Sprout,
  },
  {
    label: 'Market',
    icon: TrendingUp,
  },
  {
    label: 'Bids',
    icon: Gavel,
  },
  {
    label: 'Weather',
    icon: CloudSun,
  },
  {
    label: 'AI Assistant',
    icon: Bot,
  },
  {
    label: 'Passbook',
    icon: BookOpen,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-menu">

        {menuItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              className={`sidebar-item ${
                index === 0 ? 'active' : ''
              }`}
            >
              <Icon size={19} />

              <span>
                {item.label}
              </span>
            </button>
          );
        })}

      </div>

      <div className="sidebar-bottom">

        <button className="sidebar-item">
          <Settings size={19} />

          <span>
            Settings
          </span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;