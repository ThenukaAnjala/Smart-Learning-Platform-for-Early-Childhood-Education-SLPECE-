const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Example route
app.get('/', (req, res) => {
    res.send('Animation Generator Backend is working!');
});

// Start the server
const PORT = 4003;
app.listen(PORT, () => {
    console.log(`Animation Generator backend running on http://127.0.0.1:${PORT}`);
});
