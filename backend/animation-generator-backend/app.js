const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Define animation parameters for each animal
const animationParameters = {
  dog: {
    tail: { angleRange: [10, -10], duration: 600 },
    legs: { movement: 'walk', cycleDuration: 1000 },
    body: { bobbing: 5 }
  },
  cat: {
    tail: { sway: { angleRange: [8, -8], duration: 600 } },
    body: { stretch: { amplitude: 3, duration: 800 } }
  },
  rabbit: {
    body: { hop: { amplitude: 15, duration: 1000 } },
    ears: { wiggle: { angleRange: [5, -5], duration: 800 } }
  }
  // Add other animals as needed
};

// Example endpoint that proxies prediction from Flask and then generates animation parameters
app.post('/predict', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).send({ error: 'Image data is required' });
    }
    // Forward the image to the Flask backend for classification
    const flaskResponse = await axios.post('http://127.0.0.1:5000/predict', { image });
    const predictedLabel = flaskResponse.data.predicted_class;

    // Generate animation parameters for the predicted label
    const labelKey = predictedLabel.toLowerCase();
    if (!animationParameters[labelKey]) {
      return res.status(400).send({ error: `No animation parameters defined for ${predictedLabel}` });
    }

    res.send({
      predicted_class: predictedLabel,
      confidence: flaskResponse.data.confidence,
      animation: animationParameters[labelKey]
    });
  } catch (error) {
    console.error('Error in /predict:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

// Alternatively, a dedicated endpoint for animation generation
app.post('/generate-animation', (req, res) => {
  try {
    const { label } = req.body;
    if (!label) {
      return res.status(400).send({ error: 'Label is required' });
    }
    const labelKey = label.toLowerCase();
    if (!animationParameters[labelKey]) {
      return res.status(400).send({ error: `No animation parameters defined for ${label}` });
    }
    res.send({
      label: labelKey,
      animation: animationParameters[labelKey]
    });
  } catch (error) {
    console.error('Error in /generate-animation:', error);
    res.status(500).send({ error: 'Internal Server Error' });
  }
});

const PORT = 4003;
app.listen(PORT, () => {
  console.log(`Animation Generator backend running on http://127.0.0.1:${PORT}`);
});
