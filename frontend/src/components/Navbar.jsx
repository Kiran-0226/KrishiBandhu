import { Bell, Leaf, UserCircle } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">

        <div className="brand">
          <div className="brand-icon">
            <Leaf size={21} strokeWidth={2} />
          </div>

          <div className="brand-text">
            <h1>KrishiBandhu</h1>
            <span>Smart farming platform</span>
          </div>
        </div>

        <div className="navbar-actions">

          <button
            className="icon-button"
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>

          <button className="profile-button">
            <UserCircle size={22} />
            <span>Farmer</span>
          </button>

        </div>

      </div>
    </header>
  );
}

export default Navbar;