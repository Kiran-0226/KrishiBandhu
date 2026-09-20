import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { useAuth } from './context/AuthContext';

import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import Crops from './pages/Crops';
import Market from './pages/Market';
import Bids from './pages/Bids';
import Weather from './pages/Weather';
import AIAssistant from './pages/AIAssistant';
import Passbook from './pages/Passbook';
import Parchi from './pages/Parchi';
import Storage from './pages/Storage';
import Settings from './pages/Settings';

import Login from './pages/Login';
import Register from './pages/Register';

import TraderDashboard from './pages/TraderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';

const AuthLoading = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f8f5',
        color: '#237651',
        fontSize: '15px',
        fontWeight: '600',
      }}
    >
      Loading KrishiBandhu...
    </div>
  );
};

/* -------------------------------- */
/* Authentication Protection        */
/* -------------------------------- */

const ProtectedRoute = ({ children }) => {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};

/* -------------------------------- */
/* Role Protection                  */
/* -------------------------------- */

const RoleRoute = ({
  allowedRoles,
  children,
}) => {
  const {
    user,
    loading,
    isAuthenticated,
  } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    !user ||
    !allowedRoles.includes(user.role)
  ) {
    if (user?.role === 'trader') {
      return (
        <Navigate
          to="/trader"
          replace
        />
      );
    }

    if (user?.role === 'admin') {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

/* -------------------------------- */
/* Public Route                     */
/* -------------------------------- */

const PublicRoute = ({ children }) => {
  const {
    isAuthenticated,
    loading,
    user,
  } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    if (user?.role === 'trader') {
      return (
        <Navigate
          to="/trader"
          replace
        />
      );
    }

    if (user?.role === 'admin') {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
};

/* -------------------------------- */
/* Role Redirect                    */
/* -------------------------------- */

const RoleRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'trader') {
    return (
      <Navigate
        to="/trader"
        replace
      />
    );
  }

  if (user?.role === 'admin') {
    return (
      <Navigate
        to="/admin"
        replace
      />
    );
  }

  return (
    <Navigate
      to="/dashboard"
      replace
    />
  );
};

/* -------------------------------- */
/* Application                      */
/* -------------------------------- */

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ============================== */}
        {/* PUBLIC ROUTES                  */}
        {/* ============================== */}

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />


        {/* ============================== */}
        {/* FARMER DASHBOARD               */}
        {/* ============================== */}

        <Route
          path="/dashboard"
          element={
            <RoleRoute
              allowedRoles={['farmer']}
            >
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </RoleRoute>
          }
        />


        {/* ============================== */}
        {/* FARMER FEATURES                */}
        {/* ============================== */}

        <Route
          path="/crops"
          element={
            <RoleRoute
              allowedRoles={['farmer']}
            >
              <MainLayout>
                <Crops />
              </MainLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/market"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Market />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/bids"
          element={
            <RoleRoute
              allowedRoles={['farmer']}
            >
              <MainLayout>
                <Bids />
              </MainLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/weather"
          element={
            <RoleRoute
              allowedRoles={['farmer']}
            >
              <MainLayout>
                <Weather />
              </MainLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <RoleRoute
              allowedRoles={['farmer']}
            >
              <MainLayout>
                <AIAssistant />
              </MainLayout>
            </RoleRoute>
          }
        />

        <Route
          path="/passbook"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Passbook />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* ============================== */}
        {/* PARCHI                         */}
        {/* ============================== */}

        <Route
          path="/parchi"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Parchi />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* ============================== */}
        {/* STORAGE & WAREHOUSES           */}
        {/* ============================== */}

        <Route
          path="/storage"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Storage />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* ============================== */}
        {/* SETTINGS                       */}
        {/* ============================== */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />


        {/* ============================== */}
        {/* TRADER DASHBOARD               */}
        {/* ============================== */}

        <Route
          path="/trader"
          element={
            <RoleRoute
              allowedRoles={['trader']}
            >
              <MainLayout>
                <TraderDashboard />
              </MainLayout>
            </RoleRoute>
          }
        />


        {/* ============================== */}
        {/* ADMIN DASHBOARD                */}
        {/* ============================== */}

        <Route
          path="/admin"
          element={
            <RoleRoute
              allowedRoles={['admin']}
            >
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </RoleRoute>
          }
        />


        {/* ============================== */}
        {/* ADMIN USERS                    */}
        {/* ============================== */}

        <Route
          path="/admin/users"
          element={
            <RoleRoute
              allowedRoles={['admin']}
            >
              <MainLayout>
                <AdminUsers />
              </MainLayout>
            </RoleRoute>
          }
        />


        {/* ============================== */}
        {/* ROOT                           */}
        {/* ============================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />


        {/* ============================== */}
        {/* UNKNOWN ROUTES                 */}
        {/* ============================== */}

        <Route
          path="*"
          element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;