import PageHeader from '../components/PageHeader';

function Passbook() {
  return (
    <main className="dashboard">
      <PageHeader
        title="Passbook"
        description="View your agricultural transactions."
      />

      <div className="empty-page-card">
        <h2>Transaction history</h2>

        <p>
          Your transactions will appear here.
        </p>
      </div>
    </main>
  );
}

export default Passbook;