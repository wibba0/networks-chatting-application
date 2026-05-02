const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    try {
        await User.create({ username, passwordHash });
        res.redirect('/login.html');
    } catch (err) {
        res.send('Username already taken.');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.send('User not found.');
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.send('Incorrect password.');
    req.session.username = username;
    res.redirect('/chat.html');
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

module.exports = router;

