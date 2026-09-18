import PageHeader from '../components/PageHeader';

function Market() {
  return (
    <main className="dashboard">
      <PageHeader
        title="Market"
        description="Check agricultural market prices and trends."
      />

      <div className="empty-page-card">
        <h2>Market prices</h2>

        <p>
          Live market information will appear here
          once we connect the API.
        </p>
      </div>
    </main>
  );
}

export default Market;