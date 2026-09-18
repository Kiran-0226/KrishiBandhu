import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import MobileNavigation from '../components/MobileNavigation';

import './MainLayout.css';

function MainLayout({ children }) {
  return (
    <div className="app-layout">

      <Navbar />

      <Sidebar />

      <div className="main-content">
        {children}
      </div>

      <MobileNavigation />

    </div>
  );
}

export default MainLayout;