const express = require('express');

const { chatWithAI } = require('../controllers/aiController');

const router = express.Router();

// Chat with KrishiBandhu AI
router.post('/chat', chatWithAI);

module.exports = router;