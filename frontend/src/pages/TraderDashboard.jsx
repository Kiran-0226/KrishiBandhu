import {
  ShoppingBasket,
  Gavel,
  Handshake,
  ReceiptText,
  CreditCard,
  TrendingUp,
  Clock3,
  ArrowUpRight,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import './TraderDashboard.css';

const stats = [
  {
    title: 'Available Crops',
    value: '0',
    subtitle: 'Crops available for bidding',
    icon: ShoppingBasket,
  },
  {
    title: 'Active Bids',
    value: '0',
    subtitle: 'Bids currently active',
    icon: Gavel,
  },
  {
    title: 'Purchases',
    value: '0',
    subtitle: 'Completed purchases',
    icon: Handshake,
  },
  {
    title: 'Pending Payments',
    value: '₹0',
    subtitle: 'Payments awaiting completion',
    icon: CreditCard,
  },
];

function TraderDashboard() {
  const { user } = useAuth();

  const traderName = user?.name || 'Trader';

  return (
    <div className="trader-dashboard">

      {/* ==========================================
          Header
      ========================================== */}

      <div className="trader-dashboard-header">

        <div>
          <p className="trader-dashboard-label">
            Trader Dashboard
          </p>

          <h1>
            Welcome, {traderName} 👋
          </h1>

          <p className="trader-dashboard-description">
            Manage your crop purchases, bids, parchis
            and payments from one place.
          </p>
        </div>

        <div className="trader-status-card">

          <div className="trader-status-icon">
            <TrendingUp size={20} />
          </div>

          <div>
            <span>
              Account Status
            </span>

            <strong>
              {user?.isVerified
                ? 'Verified Trader'
                : 'Verification Pending'}
            </strong>
          </div>

        </div>

      </div>


      {/* ==========================================
          Statistics
      ========================================== */}

      <div className="trader-stats-grid">

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (
            <div
              className="trader-stat-card"
              key={stat.title}
            >

              <div className="trader-stat-top">

                <div className="trader-stat-icon">
                  <Icon size={20} />
                </div>

                <ArrowUpRight size={17} />

              </div>

              <div className="trader-stat-value">
                {stat.value}
              </div>

              <div className="trader-stat-title">
                {stat.title}
              </div>

              <div className="trader-stat-subtitle">
                {stat.subtitle}
              </div>

            </div>
          );

        })}

      </div>


      {/* ==========================================
          Main Dashboard Grid
      ========================================== */}

      <div className="trader-dashboard-grid">


        {/* ========================================
            Available Crops
        ======================================== */}

        <section className="trader-panel">

          <div className="trader-panel-header">

            <div>
              <h2>
                Available Crops
              </h2>

              <p>
                Crops listed by farmers
              </p>
            </div>

            <ShoppingBasket size={20} />

          </div>


          <div className="trader-empty-state">

            <div className="trader-empty-icon">
              <ShoppingBasket size={26} />
            </div>

            <h3>
              No crops available yet
            </h3>

            <p>
              Farmer crop listings will appear
              here when they become available.
            </p>

            <Link
              to="/market"
              className="trader-primary-button"
            >
              Find Crops
            </Link>

          </div>

        </section>


        {/* ========================================
            Active Bids
        ======================================== */}

        <section className="trader-panel">

          <div className="trader-panel-header">

            <div>
              <h2>
                Active Bids
              </h2>

              <p>
                Your current crop bids
              </p>
            </div>

            <Gavel size={20} />

          </div>


          <div className="trader-empty-state">

            <div className="trader-empty-icon">
              <Gavel size={26} />
            </div>

            <h3>
              No active bids
            </h3>

            <p>
              Your active bids will appear
              here after you place an offer.
            </p>

            <Link
              to="/market"
              className="trader-secondary-button"
            >
              Place a Bid
            </Link>

          </div>

        </section>

      </div>


      {/* ==========================================
          Bottom Grid
      ========================================== */}

      <div className="trader-bottom-grid">


        {/* ========================================
            Recent Purchases
        ======================================== */}

        <section className="trader-panel">

          <div className="trader-panel-header">

            <div>
              <h2>
                Recent Purchases
              </h2>

              <p>
                Your latest crop purchases
              </p>
            </div>

            <Handshake size={20} />

          </div>


          <div className="trader-list-empty">

            <Clock3 size={20} />

            <span>
              No purchases recorded yet.
            </span>

          </div>

        </section>


        {/* ========================================
            Recent Parchis
        ======================================== */}

        <section className="trader-panel">

          <div className="trader-panel-header">

            <div>
              <h2>
                Recent Parchis
              </h2>

              <p>
                Latest transaction parchis
              </p>
            </div>

            <ReceiptText size={20} />

          </div>


          <div className="trader-list-empty">

            <ReceiptText size={20} />

            <span>
              No parchis generated yet.
            </span>

          </div>

        </section>

      </div>


      {/* ==========================================
          Payment Center
      ========================================== */}

      <section className="trader-payment-panel">

        <div className="trader-payment-icon">
          <CreditCard size={24} />
        </div>


        <div className="trader-payment-content">

          <h2>
            Payment Center
          </h2>

          <p>
            Your payment records, pending payments
            and transaction QR codes will appear here.
          </p>

        </div>


        <Link
          to="/passbook"
          className="trader-payment-button"
        >
          View Payments
        </Link>

      </section>

    </div>
  );
}

export default TraderDashboard;