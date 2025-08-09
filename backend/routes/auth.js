const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

const JWT_SECRET =process.env.JWT_SECRET; 

// Signup Route
router.post('/signup', async (req, res) => {
  const { name, age, email, password } = req.body;

  try {
   
    if (!name || !age || !email || !password) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    
    user = new User({ name, age, email, password });
    await user.save();

    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});


// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
