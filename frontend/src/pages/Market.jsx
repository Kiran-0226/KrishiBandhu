import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/PageHeader';
import AddMarketForm from '../components/AddMarketForm';
import './Market.css';

function Market() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] =
    useState('All');

  const [showAddMarketForm, setShowAddMarketForm] =
    useState(false);

  // =========================================
  // Fetch Markets
  // =========================================

  const fetchMarkets = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        'http://localhost:5000/api/markets'
      );

      if (!response.ok) {
        throw new Error(
          'Failed to fetch markets.'
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            'Failed to fetch markets.'
        );
      }

      setMarkets(result.data);
    } catch (err) {
      console.error(
        'Fetch markets error:',
        err
      );

      setError(
        err.message ||
          'Unable to load markets.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  // =========================================
  // Unique Districts
  // =========================================

  const districts = useMemo(() => {
    const uniqueDistricts = [
      ...new Set(
        markets.map(
          (market) => market.district
        )
      ),
    ];

    return uniqueDistricts.sort();
  }, [markets]);

  // =========================================
  // Filter Markets
  // =========================================

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const searchText =
        search.trim().toLowerCase();

      const marketName =
        market.name?.toLowerCase() || '';

      const marketDistrict =
        market.district?.toLowerCase() || '';

      const marketLocation =
        market.location?.toLowerCase() || '';

      const matchesSearch =
        !searchText ||
        marketName.includes(searchText) ||
        marketDistrict.includes(searchText) ||
        marketLocation.includes(searchText);

      const matchesDistrict =
        selectedDistrict === 'All' ||
        market.district === selectedDistrict;

      return (
        matchesSearch &&
        matchesDistrict
      );
    });
  }, [
    markets,
    search,
    selectedDistrict,
  ]);

  // =========================================
  // Market Added
  // =========================================

  const handleMarketAdded = (newMarket) => {
    setMarkets((previousMarkets) => [
      ...previousMarkets,
      newMarket,
    ]);

    setShowAddMarketForm(false);
  };

  // =========================================
  // Render
  // =========================================

  return (
    <main className="dashboard">
      <PageHeader
        title="Market Prices"
        description="Explore agricultural markets across Maharashtra."
      />

      <div className="market-page-card">

        {/* =====================================
            Add Market Form
        ====================================== */}

        {showAddMarketForm ? (
          <AddMarketForm
            onMarketAdded={handleMarketAdded}
            onCancel={() =>
              setShowAddMarketForm(false)
            }
          />
        ) : (
          <>
            {/* =====================================
                Market Header
            ====================================== */}

            <div className="market-page-header">
              <div>
                <h2>Markets</h2>

                <p>
                  Find agricultural markets
                  across Maharashtra.
                </p>
              </div>

              <button
                type="button"
                className="add-market-button"
                onClick={() =>
                  setShowAddMarketForm(true)
                }
              >
                + Add Missing Market
              </button>
            </div>

            {/* =====================================
                Search & Filters
            ====================================== */}

            {!loading && !error && (
              <div className="market-filters">

                <div className="market-search">
                  <label htmlFor="marketSearch">
                    Search Market
                  </label>

                  <input
                    id="marketSearch"
                    type="text"
                    placeholder="Search market or location..."
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                  />
                </div>

                <div className="market-district-filter">
                  <label htmlFor="districtFilter">
                    District
                  </label>

                  <select
                    id="districtFilter"
                    value={selectedDistrict}
                    onChange={(event) =>
                      setSelectedDistrict(
                        event.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Districts
                    </option>

                    {districts.map(
                      (district) => (
                        <option
                          key={district}
                          value={district}
                        >
                          {district}
                        </option>
                      )
                    )}
                  </select>
                </div>

              </div>
            )}

            {/* =====================================
                Loading
            ====================================== */}

            {loading && (
              <div className="market-message">
                <p>
                  Loading markets...
                </p>
              </div>
            )}

            {/* =====================================
                Error
            ====================================== */}

            {error && (
              <div className="market-message market-error">
                <p>{error}</p>
              </div>
            )}

            {/* =====================================
                No Markets
            ====================================== */}

            {!loading &&
              !error &&
              markets.length === 0 && (
                <div className="market-message">
                  <p>
                    No markets found.
                  </p>
                </div>
              )}

            {/* =====================================
                No Filter Results
            ====================================== */}

            {!loading &&
              !error &&
              markets.length > 0 &&
              filteredMarkets.length === 0 && (
                <div className="market-message">
                  <p>
                    No markets match your
                    search.
                  </p>
                </div>
              )}

            {/* =====================================
                Market Results
            ====================================== */}

            {!loading &&
              !error &&
              filteredMarkets.length > 0 && (
                <>
                  <div className="market-results-info">
                    Showing{' '}
                    <strong>
                      {filteredMarkets.length}
                    </strong>{' '}
                    of{' '}
                    <strong>
                      {markets.length}
                    </strong>{' '}
                    markets
                  </div>

                  <div className="market-list">
                    {filteredMarkets.map(
                      (market) => (
                        <div
                          className="market-card"
                          key={market._id}
                        >
                          <div className="market-card-header">
                            <div>
                              <h2>
                                {market.name}
                              </h2>

                              <p>
                                {market.location ||
                                  market.district}
                                , Maharashtra
                              </p>
                            </div>

                            {market.isOfficial && (
                              <span className="official-badge">
                                ✓ Official
                              </span>
                            )}

                            {!market.isOfficial && (
                              <span className="pending-badge">
                                Pending
                              </span>
                            )}
                          </div>

                          <div className="market-card-details">
                            <span>
                              📍{' '}
                              {market.district}
                            </span>

                            <span>
                              🏪 {market.type}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )}
          </>
        )}

      </div>
    </main>
  );
}

export default Market;