const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// 🔐 Register a new user
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role],
      (err) => {
        if (err) {
          if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        return res.json({ message: 'User registered successfully' });
      }
    );
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// 🔐 Login and return base64 token
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

    const tokenPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
    };

    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    res.json({
      message: 'Login successful',
      token,
      role: user.role,
    });
  });
});

module.exports = router;
