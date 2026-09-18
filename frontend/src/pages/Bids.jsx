import PageHeader from '../components/PageHeader';

function Bids() {
  return (
    <main className="dashboard">
      <PageHeader
        title="Bids"
        description="Manage your crop listings and bids."
      />

      <div className="empty-page-card">
        <h2>Your bids</h2>

        <p>
          Bidding information will appear here.
        </p>
      </div>
    </main>
  );
}

export default Bids;