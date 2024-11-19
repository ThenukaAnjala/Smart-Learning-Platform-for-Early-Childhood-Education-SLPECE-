const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Example route
app.get('/', (req, res) => {
    res.send('Storytelling Backend is working!');
});

// Start the server
const PORT = 4001;
app.listen(PORT, () => {
    console.log(`Storytelling backend running on http://127.0.0.1:${PORT}`);
});
