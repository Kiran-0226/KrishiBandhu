import {
  Users,
  Sprout,
  Store,
  Gavel,
  WalletCards,
  IndianRupee,
  ShieldCheck,
  BriefcaseBusiness,
  RefreshCw,
} from 'lucide-react';

import {
  useEffect,
  useState,
} from 'react';

import { useAuth } from '../context/AuthContext';

import API_URL from '../config/api';

import './AdminDashboard.css';

const API_BASE_URL = API_URL;

function AdminDashboard() {
  const {
    token,
    user,
  } = useAuth();

  const [stats, setStats] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${API_BASE_URL}/admin/dashboard`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to fetch dashboard statistics.',
        );
      }

      setStats(data.stats);
    } catch (err) {
      console.error(
        'Admin Dashboard Error:',
        err,
      );

      setError(
        err.message ||
          'Unable to load dashboard statistics.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      'en-IN',
      {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      },
    ).format(value || 0);
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users ?? 0,
      description:
        'Registered platform users',
      icon: Users,
    },

    {
      title: 'Farmers',
      value: stats?.farmers ?? 0,
      description:
        'Registered farmers',
      icon: Sprout,
    },

    {
      title: 'Traders',
      value: stats?.traders ?? 0,
      description:
        'Registered traders',
      icon: BriefcaseBusiness,
    },

    {
      title: 'Markets',
      value: stats?.markets ?? 0,
      description:
        'Available market locations',
      icon: Store,
    },

    {
      title: 'Crop Listings',
      value: stats?.crops ?? 0,
      description:
        'Crop records on platform',
      icon: Sprout,
    },

    {
      title: 'Bids',
      value: stats?.bids ?? 0,
      description:
        'Bids recorded',
      icon: Gavel,
    },

    {
      title: 'Transactions',
      value:
        stats?.transactions ?? 0,
      description:
        'Recorded transactions',
      icon: WalletCards,
    },

    {
      title: 'Transaction Value',
      value: formatCurrency(
        stats?.transactionAmount,
      ),
      description:
        'Total recorded transaction value',
      icon: IndianRupee,
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* Header */}

      <div className="admin-dashboard-header">

        <div>
          <p className="admin-dashboard-label">
            Administration
          </p>

          <h1>
            Admin Dashboard
          </h1>

          <p>
            Monitor and manage the
            KrishiBandhu platform from
            one place.
          </p>
        </div>

        <div className="admin-profile-status">

          <div className="admin-profile-icon">
            <ShieldCheck size={21} />
          </div>

          <div>

            <span>
              Signed in as
            </span>

            <strong>
              {user?.name ||
                'System Admin'}
            </strong>

            <small>
              Administrator
            </small>

          </div>

        </div>

      </div>

      {/* Error */}

      {error && (
        <div className="admin-error">

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={fetchStats}
          >
            <RefreshCw size={15} />

            Retry
          </button>

        </div>
      )}

      {/* Statistics */}

      <div className="admin-stats-grid">

        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              className="admin-stat-card"
              key={card.title}
            >

              <div className="admin-stat-top">

                <div className="admin-stat-icon">
                  <Icon size={20} />
                </div>

              </div>

              <div className="admin-stat-value">

                {loading ? (
                  <span className="admin-loading">
                    ...
                  </span>
                ) : (
                  card.value
                )}

              </div>

              <div className="admin-stat-title">
                {card.title}
              </div>

              <div className="admin-stat-description">
                {card.description}
              </div>

            </div>
          );
        })}

      </div>

      {/* Lower content */}

      <div className="admin-content-grid">

        {/* User Overview */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <h2>
                User Overview
              </h2>

              <p>
                Current platform user
                distribution
              </p>
            </div>

            <Users size={20} />

          </div>

          <div className="admin-user-overview">

            <div className="admin-user-row">

              <div className="admin-user-label">

                <span className="admin-user-dot farmer" />

                <span>
                  Farmers
                </span>

              </div>

              <strong>
                {loading
                  ? '...'
                  : stats?.farmers ?? 0}
              </strong>

            </div>

            <div className="admin-user-row">

              <div className="admin-user-label">

                <span className="admin-user-dot trader" />

                <span>
                  Traders
                </span>

              </div>

              <strong>
                {loading
                  ? '...'
                  : stats?.traders ?? 0}
              </strong>

            </div>

            <div className="admin-user-row">

              <div className="admin-user-label">

                <span className="admin-user-dot admin" />

                <span>
                  Administrators
                </span>

              </div>

              <strong>
                {loading
                  ? '...'
                  : stats?.admins ?? 0}
              </strong>

            </div>

          </div>

        </section>

        {/* Platform Overview */}

        <section className="admin-panel">

          <div className="admin-panel-header">

            <div>
              <h2>
                Platform Overview
              </h2>

              <p>
                Current operational
                records
              </p>
            </div>

            <Store size={20} />

          </div>

          <div className="admin-platform-list">

            <div>
              <span>
                Markets
              </span>

              <strong>
                {loading
                  ? '...'
                  : stats?.markets ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Crop Listings
              </span>

              <strong>
                {loading
                  ? '...'
                  : stats?.crops ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Bids
              </span>

              <strong>
                {loading
                  ? '...'
                  : stats?.bids ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Transactions
              </span>

              <strong>
                {loading
                  ? '...'
                  : stats?.transactions ?? 0}
              </strong>
            </div>

          </div>

        </section>

      </div>

      {/* Security information */}

      <section className="admin-security-panel">

        <div className="admin-security-icon">
          <ShieldCheck size={23} />
        </div>

        <div>

          <h2>
            Administrator Access
          </h2>

          <p>
            This dashboard is restricted
            to users with the administrator
            role. User, market, bid,
            transaction and payment
            management will be available
            from the administrator
            navigation.
          </p>

        </div>

      </section>

    </div>
  );
}

export default AdminDashboard;