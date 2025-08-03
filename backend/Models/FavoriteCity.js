const mongoose = require('mongoose');

const favoriteCitySchema = new mongoose.Schema({
  userId: {
    type: String, // Replace with ObjectId if implementing real user auth
    required: true,
  },
  cityName: {
    type: String,
    required: true,
  },
  country: String,
  lat: Number,
  lon: Number,
}, { timestamps: true });

module.exports = mongoose.model('FavoriteCity', favoriteCitySchema);
