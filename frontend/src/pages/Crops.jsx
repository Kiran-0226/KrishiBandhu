import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';

function Crops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/crops');

        if (!response.ok) {
          throw new Error('Failed to fetch crops');
        }

        const result = await response.json();

        if (result.success) {
          setCrops(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch crops');
        }
      } catch (err) {
        console.error('Fetch crops error:', err);
        setError('Unable to load crops. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  return (
    <main className="dashboard">
      <PageHeader
        title="My Crops"
        description="Manage and monitor your crops."
      />

      <div className="empty-page-card">
        <h2>Your crops</h2>

        {loading && (
          <p>Loading your crops...</p>
        )}

        {error && (
          <p>{error}</p>
        )}

        {!loading && !error && crops.length === 0 && (
          <>
            <p>
              Your crop information will appear here.
            </p>

            <button className="primary-button">
              Add Crop
            </button>
          </>
        )}

        {!loading && !error && crops.length > 0 && (
          <>
            <p>
              You currently have {crops.length}{' '}
              {crops.length === 1 ? 'crop' : 'crops'}.
            </p>

            <div className="crops-list">
              {crops.map((crop) => (
                <div className="crop-card" key={crop._id}>
                  <h3>{crop.name}</h3>

                  {crop.variety && (
                    <p>
                      <strong>Variety:</strong> {crop.variety}
                    </p>
                  )}

                  <p>
                    <strong>Area:</strong> {crop.area}{' '}
                    {crop.areaUnit}
                  </p>

                  <p>
                    <strong>Status:</strong> {crop.status}
                  </p>

                  {crop.sowingDate && (
                    <p>
                      <strong>Sowing Date:</strong>{' '}
                      {new Date(crop.sowingDate).toLocaleDateString()}
                    </p>
                  )}

                  {crop.expectedHarvestDate && (
                    <p>
                      <strong>Expected Harvest:</strong>{' '}
                      {new Date(
                        crop.expectedHarvestDate
                      ).toLocaleDateString()}
                    </p>
                  )}

                  {crop.notes && (
                    <p>
                      <strong>Notes:</strong> {crop.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button className="primary-button">
              Add Crop
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default Crops;