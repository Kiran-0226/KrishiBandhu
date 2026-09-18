import PageHeader from '../components/PageHeader';

function Crops() {
  return (
    <main className="dashboard">
      <PageHeader
        title="My Crops"
        description="Manage and monitor your crops."
      />

      <div className="empty-page-card">
        <h2>Your crops</h2>

        <p>
          Your crop information will appear here.
        </p>

        <button className="primary-button">
          Add Crop
        </button>
      </div>
    </main>
  );
}

export default Crops;