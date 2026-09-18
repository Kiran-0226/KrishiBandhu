const OPENWEATHER_BASE_URL =
  'https://api.openweathermap.org';

const getWeatherByCity = async (city) => {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  // =========================================
  // Validate API key
  // =========================================

  if (!apiKey) {
    throw new Error(
      'OpenWeather API key is not configured.'
    );
  }

  // =========================================
  // Validate city
  // =========================================

  if (!city || !city.trim()) {
    throw new Error(
      'City name is required.'
    );
  }

  const cleanCity = city.trim();

  // =========================================
  // Step 1: Geocoding
  // City → Latitude / Longitude
  // =========================================

  const geocodingUrl =
    `${OPENWEATHER_BASE_URL}/geo/1.0/direct` +
    `?q=${encodeURIComponent(cleanCity)}` +
    `&limit=1` +
    `&appid=${apiKey}`;

  const geocodingResponse =
    await fetch(geocodingUrl);

  const geocodingData =
    await geocodingResponse.json();

  // Show the actual OpenWeather error
  // in the backend terminal
  if (!geocodingResponse.ok) {
    console.error(
      'OpenWeather geocoding error:',
      geocodingData
    );

    throw new Error(
      geocodingData.message ||
        'Failed to find the requested location.'
    );
  }

  // =========================================
  // Check location result
  // =========================================

  if (
    !Array.isArray(geocodingData) ||
    geocodingData.length === 0
  ) {
    throw new Error(
      `Location "${cleanCity}" was not found.`
    );
  }

  const location = geocodingData[0];

  // =========================================
  // Step 2: Current Weather
  // =========================================

  const weatherUrl =
    `${OPENWEATHER_BASE_URL}/data/2.5/weather` +
    `?lat=${location.lat}` +
    `&lon=${location.lon}` +
    `&appid=${apiKey}` +
    `&units=metric`;

  const weatherResponse =
    await fetch(weatherUrl);

  const weatherData =
    await weatherResponse.json();

  // =========================================
  // Check weather API response
  // =========================================

  if (!weatherResponse.ok) {
    console.error(
      'OpenWeather current weather error:',
      weatherData
    );

    throw new Error(
      weatherData.message ||
        'Failed to fetch weather information.'
    );
  }

  // =========================================
  // Step 3: Return clean weather data
  // =========================================

  return {
    location: {
      name: location.name,
      state: location.state || '',
      country: location.country || '',
      latitude: location.lat,
      longitude: location.lon,
    },

    temperature:
      weatherData.main?.temp ?? null,

    feelsLike:
      weatherData.main?.feels_like ?? null,

    minTemperature:
      weatherData.main?.temp_min ?? null,

    maxTemperature:
      weatherData.main?.temp_max ?? null,

    condition:
      weatherData.weather?.[0]?.main ||
      'Unknown',

    description:
      weatherData.weather?.[0]?.description ||
      '',

    icon:
      weatherData.weather?.[0]?.icon ||
      '',

    humidity:
      weatherData.main?.humidity ?? null,

    pressure:
      weatherData.main?.pressure ?? null,

    windSpeed:
      weatherData.wind?.speed ?? null,

    windDirection:
      weatherData.wind?.deg ?? null,

    visibility:
      weatherData.visibility ?? null,

    cloudiness:
      weatherData.clouds?.all ?? null,

    sunrise:
      weatherData.sys?.sunrise
        ? new Date(
            weatherData.sys.sunrise * 1000
          ).toISOString()
        : null,

    sunset:
      weatherData.sys?.sunset
        ? new Date(
            weatherData.sys.sunset * 1000
          ).toISOString()
        : null,

    updatedAt:
      new Date().toISOString(),
  };
};

module.exports = {
  getWeatherByCity,
};