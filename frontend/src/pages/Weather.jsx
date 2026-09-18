import PageHeader from '../components/PageHeader';

function Weather() {
  return (
    <main className="dashboard">
      <PageHeader
        title="Weather"
        description="Weather conditions and forecasts for your farm."
      />

      <div className="empty-page-card">
        <h2>Weather information</h2>

        <p>
          Weather data will appear here after
          connecting the weather API.
        </p>
      </div>
    </main>
  );
}

export default Weather;