import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Crops from './pages/Crops';
import Market from './pages/Market';
import Bids from './pages/Bids';
import Weather from './pages/Weather';
import AIAssistant from './pages/AIAssistant';
import Passbook from './pages/Passbook';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>

        <Routes>

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/crops"
            element={<Crops />}
          />

          <Route
            path="/market"
            element={<Market />}
          />

          <Route
            path="/bids"
            element={<Bids />}
          />

          <Route
            path="/weather"
            element={<Weather />}
          />

          <Route
            path="/ai-assistant"
            element={<AIAssistant />}
          />

          <Route
            path="/passbook"
            element={<Passbook />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Routes>

      </MainLayout>
    </BrowserRouter>
  );
}

export default App;