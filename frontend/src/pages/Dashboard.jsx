import {
  Sprout,
  TrendingUp,
  Calculator,
  MapPinned,
  Bell,
  BookOpen,
} from 'lucide-react';

import GreetingCard from '../components/GreetingCard';
import DashboardCard from '../components/DashboardCard';

import './Dashboard.css';

function Dashboard() {
  return (
    <main className="dashboard">

      <GreetingCard />

      <section className="dashboard-grid">

        <DashboardCard
          icon={<Sprout size={21} />}
          title="Sowing Signal"
          value="Ready"
          description="Check whether conditions are suitable for planting."
          action="View"
        />

        <DashboardCard
          icon={<TrendingUp size={21} />}
          title="Today's Market Price"
          value="₹2,450"
          description="Current indicative market price."
          action="Markets"
        />

        <DashboardCard
          icon={<Calculator size={21} />}
          title="Net Realization"
          value="₹2,180"
          description="Estimated amount after selling costs."
          action="Calculate"
        />

        <DashboardCard
          icon={<MapPinned size={21} />}
          title="Mandi Comparison"
          value="5 Markets"
          description="Compare prices across nearby mandis."
          action="Compare"
        />

        <DashboardCard
          icon={<Bell size={21} />}
          title="Alerts"
          value="3"
          description="Important updates requiring your attention."
          action="View all"
        />

        <DashboardCard
          icon={<BookOpen size={21} />}
          title="Passbook"
          value="₹48,620"
          description="Your recent agricultural transactions."
          action="Open"
        />

      </section>

    </main>
  );
}

export default Dashboard;