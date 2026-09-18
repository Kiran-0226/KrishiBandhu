import { useEffect, useState } from 'react';
import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  RefreshCw,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from 'lucide-react';

import './Weather.css';

const API_BASE_URL = 'http://localhost:5000';

const quickCities = [
  'Pune',
  'Nashik',
  'Nagpur',
  'Mumbai',
  'Kolhapur',
  'Solapur',
];

const getWeatherIcon = (condition, iconCode) => {
  const value = condition?.toLowerCase() || '';

  if (value.includes('rain') || value.includes('drizzle')) {
    return <CloudRain size={46} strokeWidth={1.8} />;
  }

  if (value.includes('cloud')) {
    return <CloudSun size={46} strokeWidth={1.8} />;
  }

  if (iconCode?.includes('n')) {
    return <Cloud size={46} strokeWidth={1.8} />;
  }

  return <Sun size={46} strokeWidth={1.8} />;
};

const formatTime = (dateString) => {
  if (!dateString) return '--';

  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatUpdatedTime = (dateString) => {
  if (!dateString) return '--';

  return new Date(dateString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getWindDirection = (degrees) => {
  if (degrees === undefined || degrees === null) return '--';

  const directions = [
    'N',
    'NE',
    'E',
    'SE',
    'S',
    'SW',
    'W',
    'NW',
  ];

  const index = Math.round(degrees / 45) % 8;

  return directions[index];
};

const Weather = () => {
  const [city, setCity] = useState('Pune');
  const [searchCity, setSearchCity] = useState('Pune');

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = async (selectedCity = city) => {
    if (!selectedCity.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/weather?city=${encodeURIComponent(
          selectedCity.trim(),
        )}`,
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Failed to fetch weather data.',
        );
      }

      setWeather(result.data);
      setCity(selectedCity.trim());
      setSearchCity(selectedCity.trim());
    } catch (err) {
      console.error('Weather fetch error:', err);

      setWeather(null);
      setError(
        err.message ||
          'Unable to load weather data. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Pune');
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    if (!searchCity.trim()) return;

    fetchWeather(searchCity);
  };

  const handleQuickCity = (selectedCity) => {
    fetchWeather(selectedCity);
  };

  return (
    <div className="weather-page">
      <div className="weather-page-header">
        <div>
          <h1>Weather</h1>
          <p>
            Weather conditions and forecasts for your farm.
          </p>
        </div>
      </div>

      <section className="weather-container">
        <div className="weather-toolbar">
          <div>
            <h2>Weather Information</h2>
            <p>
              Check current weather conditions for locations
              across Maharashtra.
            </p>
          </div>

          <button
            className="weather-refresh-button"
            onClick={() => fetchWeather(city)}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? 'weather-spin' : ''}
            />
            {loading ? 'Updating...' : 'Refresh'}
          </button>
        </div>

        <form
          className="weather-search"
          onSubmit={handleSearch}
        >
          <div className="weather-search-input">
            <Search size={19} />
            <input
              type="text"
              value={searchCity}
              onChange={(event) =>
                setSearchCity(event.target.value)
              }
              placeholder="Search city..."
            />
          </div>

          <button type="submit" disabled={loading}>
            Search
          </button>
        </form>

        <div className="weather-quick-cities">
          <span>Quick locations:</span>

          {quickCities.map((quickCity) => (
            <button
              key={quickCity}
              className={
                city.toLowerCase() === quickCity.toLowerCase()
                  ? 'active'
                  : ''
              }
              onClick={() => handleQuickCity(quickCity)}
              type="button"
            >
              {quickCity}
            </button>
          ))}
        </div>

        {loading && !weather && (
          <div className="weather-loading">
            <RefreshCw
              size={30}
              className="weather-spin"
            />
            <h3>Loading weather...</h3>
            <p>Fetching the latest weather information.</p>
          </div>
        )}

        {error && (
          <div className="weather-error">
            <div className="weather-error-icon">!</div>

            <div>
              <h3>Unable to load weather</h3>
              <p>{error}</p>
            </div>

            <button
              onClick={() => fetchWeather(city)}
              type="button"
            >
              Try Again
            </button>
          </div>
        )}

        {weather && !loading && (
          <>
            <div className="weather-location">
              <div className="weather-location-left">
                <div className="weather-location-icon">
                  <MapPin size={20} />
                </div>

                <div>
                  <h3>{weather.location.name}</h3>

                  <p>
                    {weather.location.state},{' '}
                    {weather.location.country}
                  </p>
                </div>
              </div>

              <div className="weather-updated">
                Updated{' '}
                {formatUpdatedTime(weather.updatedAt)}
              </div>
            </div>

            <div className="weather-main-card">
              <div className="weather-main-left">
                <div className="weather-main-icon">
                  {getWeatherIcon(
                    weather.condition,
                    weather.icon,
                  )}
                </div>

                <div>
                  <div className="weather-temperature">
                    {Math.round(weather.temperature)}°C
                  </div>

                  <div className="weather-condition">
                    {weather.condition}
                  </div>

                  <div className="weather-description">
                    {weather.description}
                  </div>
                </div>
              </div>

              <div className="weather-feels">
                <span>Feels like</span>
                <strong>
                  {Math.round(weather.feelsLike)}°C
                </strong>
              </div>
            </div>

            <div className="weather-stats-grid">
              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <Droplets size={22} />
                </div>

                <div>
                  <span>Humidity</span>
                  <strong>{weather.humidity}%</strong>
                </div>
              </div>

              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <Wind size={22} />
                </div>

                <div>
                  <span>Wind Speed</span>
                  <strong>
                    {weather.windSpeed} m/s
                  </strong>
                </div>
              </div>

              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <Gauge size={22} />
                </div>

                <div>
                  <span>Pressure</span>
                  <strong>
                    {weather.pressure} hPa
                  </strong>
                </div>
              </div>

              <div className="weather-stat-card">
                <div className="weather-stat-icon">
                  <Eye size={22} />
                </div>

                <div>
                  <span>Visibility</span>
                  <strong>
                    {(weather.visibility / 1000).toFixed(1)} km
                  </strong>
                </div>
              </div>
            </div>

            <div className="weather-details-grid">
              <div className="weather-detail-card">
                <div className="weather-detail-header">
                  <Thermometer size={20} />
                  <h3>Temperature</h3>
                </div>

                <div className="temperature-range">
                  <div>
                    <span>Minimum</span>
                    <strong>
                      {Math.round(
                        weather.minTemperature,
                      )}
                      °C
                    </strong>
                  </div>

                  <div>
                    <span>Maximum</span>
                    <strong>
                      {Math.round(
                        weather.maxTemperature,
                      )}
                      °C
                    </strong>
                  </div>
                </div>
              </div>

              <div className="weather-detail-card">
                <div className="weather-detail-header">
                  <Wind size={20} />
                  <h3>Wind</h3>
                </div>

                <div className="wind-details">
                  <div>
                    <span>Speed</span>
                    <strong>
                      {weather.windSpeed} m/s
                    </strong>
                  </div>

                  <div>
                    <span>Direction</span>
                    <strong>
                      {getWindDirection(
                        weather.windDirection,
                      )}{' '}
                      ({weather.windDirection}°)
                    </strong>
                  </div>
                </div>
              </div>

              <div className="weather-detail-card">
                <div className="weather-detail-header">
                  <Cloud size={20} />
                  <h3>Cloudiness</h3>
                </div>

                <div className="weather-cloudiness">
                  <strong>
                    {weather.cloudiness}%
                  </strong>

                  <div className="weather-progress">
                    <div
                      style={{
                        width: `${Math.min(
                          weather.cloudiness,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="weather-detail-card">
                <div className="weather-detail-header">
                  <Sunrise size={20} />
                  <h3>Sun</h3>
                </div>

                <div className="sun-times">
                  <div>
                    <Sunrise size={18} />
                    <span>Sunrise</span>
                    <strong>
                      {formatTime(weather.sunrise)}
                    </strong>
                  </div>

                  <div>
                    <Sunset size={18} />
                    <span>Sunset</span>
                    <strong>
                      {formatTime(weather.sunset)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="weather-source">
              <span>
                Weather data powered by OpenWeather
              </span>

              <span>
                Coordinates:{' '}
                {weather.location.latitude.toFixed(4)},{' '}
                {weather.location.longitude.toFixed(4)}
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Weather;