import PageHeader from '../components/PageHeader';

function Settings() {
  return (
    <main className="dashboard">
      <PageHeader
        title="Settings"
        description="Manage your KrishiBandhu preferences."
      />

      <div className="empty-page-card">
        <h2>Application settings</h2>

        <p>
          Your account, language and application
          preferences will appear here.
        </p>
      </div>
    </main>
  );
}

export default Settings;