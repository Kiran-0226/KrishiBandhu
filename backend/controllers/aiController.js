const { generateAIResponse } = require('../services/aiService');

const chatWithAI = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid message is required.',
      });
    }

    if (!Array.isArray(history)) {
      return res.status(400).json({
        success: false,
        message: 'History must be an array.',
      });
    }

    const response = await generateAIResponse(
      message.trim(),
      history,
    );

    return res.status(200).json({
      success: true,
      message: response,
    });
  } catch (error) {
    console.error('AI Controller Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Unable to get a response from AI.',
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  chatWithAI,
};