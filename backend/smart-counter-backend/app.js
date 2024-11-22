const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/predict', async (req, res) => {
    try {
        const { input } = req.body;

        // Call Flask API
        const response = await axios.post('http://127.0.0.1:5000/predict', { input });
        res.json(response.data);
    } catch (error) {
        console.error('Error calling Flask API:', error.message);
        res.status(500).json({ error: 'Flask API error' });
    }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Smart Counter backend running on port ${PORT}`));
