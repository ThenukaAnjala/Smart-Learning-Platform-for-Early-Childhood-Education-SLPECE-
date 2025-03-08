const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/predict', async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).send({ error: 'Image data is required' });
        }

        const flaskResponse = await axios.post('http://127.0.0.1:5000/predict', { image });
        res.send(flaskResponse.data);
    } catch (error) {
        console.error('Error communicating with Flask backend:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

const PORT = 4003;
app.listen(PORT, () => {
    console.log(`Animation Generator backend running on http://127.0.0.1:${PORT}`);
});
