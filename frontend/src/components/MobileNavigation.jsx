import {
  LayoutDashboard,
  Sprout,
  TrendingUp,
  Bot,
  UserCircle,
} from 'lucide-react';

import './MobileNavigation.css';

const items = [
  {
    label: 'Home',
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
    label: 'AI',
    icon: Bot,
  },
  {
    label: 'Profile',
    icon: UserCircle,
  },
];

function MobileNavigation() {
  return (
    <nav className="mobile-navigation">

      {items.map((item, index) => {
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            className={`mobile-nav-item ${
              index === 0 ? 'active' : ''
            }`}
          >
            <Icon size={20} />

            <span>
              {item.label}
            </span>
          </button>
        );
      })}

    </nav>
  );
}

export default MobileNavigation;