const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret';
const USERS_DB = './database/users.json';

// Ensure users.json exists
if (!fs.existsSync('./database')) fs.mkdirSync('./database');
if (!fs.existsSync(USERS_DB)) fs.writeFileSync(USERS_DB, JSON.stringify([]));

const getUsers = () => JSON.parse(fs.readFileSync(USERS_DB));
const saveUsers = (users) => fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));

// **Add Root Route**
app.get('/', (req, res) => {
    res.send('Welcome to the User Auth Backend!');
});

// Register Route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    if (users.some((u) => u.username === username)) {
        return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashedPassword });
    saveUsers(users);

    res.json({ message: 'User registered successfully' });
});

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    const user = users.find((u) => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Protected Route Example
app.get('/profile', (req, res) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'Token required' });

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        res.json({ message: 'Profile accessed', user: decoded });
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
});

const PORT = 4004;
app.listen(PORT, () => console.log(`User Auth Backend running on http://127.0.0.1:${PORT}`));
