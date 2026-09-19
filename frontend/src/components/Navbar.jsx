import {
  Bell,
  Leaf,
  UserCircle,
  LogOut,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

import './Navbar.css';

function Navbar() {
  const {
    user,
    logout,
  } = useAuth();

  const userName = user?.name || 'User';

  const userRole =
    user?.role === 'trader'
      ? 'Trader'
      : user?.role === 'admin'
        ? 'Admin'
        : 'Farmer';

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">

        <div className="brand">

          <div className="brand-icon">
            <Leaf
              size={21}
              strokeWidth={2}
            />
          </div>

          <div className="brand-text">
            <h1>
              KrishiBandhu
            </h1>

            <span>
              Smart farming platform
            </span>
          </div>

        </div>

        <div className="navbar-actions">

          <button
            className="icon-button"
            aria-label="Notifications"
            type="button"
          >
            <Bell size={20} />
          </button>

          <div className="profile-wrapper">

            <div className="profile-button">

              <UserCircle size={22} />

              <div className="profile-info">
                <span className="profile-name">
                  {userName}
                </span>

                <span className="profile-role">
                  {userRole}
                </span>
              </div>

            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              <LogOut size={17} />

              <span>
                Logout
              </span>
            </button>

          </div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;