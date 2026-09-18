const {
  getWeatherByCity,
} = require('../services/weatherService');

const getWeather = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'City name is required.',
      });
    }

    const weather = await getWeatherByCity(city);

    res.status(200).json({
      success: true,
      data: weather,
    });
  } catch (error) {
    console.error(
      'Get weather error:',
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        'Failed to fetch weather information.',
    });
  }
};

module.exports = {
  getWeather,
};