const express = require('express');
const router = express.Router();
const Favorite = require('../Models/FavoriteCity');
const auth = require('../middleware/auth');

// Add to favorites
router.post('/', auth, async (req, res) => {
  const { cityName, country, lat, lon } = req.body;

  if (!cityName) {
    return res.status(400).json({ msg: 'City name is required' });
  }

  try {
    // Check if this city already exists for the user
    const existing = await Favorite.findOne({ userId: req.user, cityName });

    if (existing) {
      return res.status(200).json({ msg: 'City already in favorites' });
    }

    const newFavorite = new Favorite({
      userId: req.user,
      cityName,
      country,
      lat,
      lon
    });

    await newFavorite.save();

    res.status(201).json({ msg: 'City added to favorites' });
  } catch (err) {
    console.error('Error adding favorite city:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's favorites
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user });
    res.json(favorites); // return full city data (not just names)
  } catch (err) {
    console.error('Error fetching favorite cities:', err);
    res.status(500).json({ msg: 'Failed to fetch favorites' });
  }
});


router.delete('/:id', auth, async (req, res) => {
  const userId = req.user;
  const favId = req.params.id;

  try {
    const favorite = await Favorite.findOneAndDelete({ _id: favId, userId: userId });
    if (!favorite) return res.status(404).json({ msg: 'City not found or not authorized' });

    res.json({ msg: 'City removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});


// Check if a city is already in favorites
router.get('/check', auth, async (req, res) => {
  const { city, country } = req.query;

  if (!city) {
    return res.status(400).json({ msg: 'City is required' });
  }

  try {
    const exists = await Favorite.findOne({
      userId: req.user,
      cityName: city,
      country: country
    });

    if (exists) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('Error checking favorite city:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});





module.exports = router;
