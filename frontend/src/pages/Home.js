import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaTrash, FaMapMarkerAlt } from 'react-icons/fa';
import { 
  getWeatherTheme, 
  WeatherIcon, 
  weatherThemesCSS 
} from '../components/weatherThemes';

function Home() {
  const { token } = useAuth();
  const [currentLocationWeather, setCurrentLocationWeather] = useState(null);
  const [favoriteCitiesWeather, setFavoriteCitiesWeather] = useState([]);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    setLoadingCurrent(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/weather/coords?lat=${latitude}&lon=${longitude}`);
        setCurrentLocationWeather(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingCurrent(false);
      }
    }, () => setLoadingCurrent(false));

    if (token) fetchFavoritesWeather();
  }, [token]);

  const fetchFavoritesWeather = async () => {
    setLoadingFavorites(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cities = res.data;

      const cleanCityName = (city) =>
        city.replace(/ (Division|District|County)$/, '');

      const weatherData = await Promise.all(
        cities.map(city => {
          const cleanedCity = cleanCityName(city.cityName);
          return axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/api/weather?city=${encodeURIComponent(cleanedCity)}`)
            .then(res => ({
              ...res.data,
              _id: city._id,
              cityName: city.cityName
            }))
            .catch(err => {
              console.error(`Failed to fetch weather for ${city.cityName}`, err);
              return null;
            });
        })
      );

      setFavoriteCitiesWeather(weatherData.filter(Boolean));
    } catch (err) {
      console.error('Failed to fetch favorite cities:', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleRemoveCity = async (cityId) => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/api/favorites/${cityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavoriteCitiesWeather(prev => prev.filter(city => city._id !== cityId));
    } catch (err) {
      console.error('Failed to remove favorite city:', err);
    }
  };

  return (
    <>
      <style>{weatherThemesCSS}</style>
      <Container className="py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 gradient-text">
            Weather Dashboard
          </h1>
          <p className="text-white">Your personalized weather experience</p>
        </div>

        {/* Current Location */}
        <div className="mb-5">
          <h2 className="mb-4 d-flex align-items-center">
            <FaMapMarkerAlt className="me-2" style={{ color: '#4fc3f7' }} />
            <span className="gradient-text">Your Current Location</span>
          </h2>
          
          {loadingCurrent ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Detecting your location...</p>
            </div>
          ) : currentLocationWeather ? (
            <div className={`weather-card ${getWeatherTheme(currentLocationWeather.main.temp)}`}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h3 className="mb-2">{currentLocationWeather.name}</h3>
                  <p className="mb-1 text-capitalize">
                    {currentLocationWeather.weather[0].description}
                  </p>
                  <p className="mb-1">
                    Humidity: {currentLocationWeather.main.humidity}%
                  </p>
                  <p className="mb-0">
                    Wind: {currentLocationWeather.wind.speed} km/h
                  </p>
                </div>
                <div className="text-end">
                  <div className="d-flex align-items-center justify-content-end mb-2">
                    <WeatherIcon temp={currentLocationWeather.main.temp} />
                    <h2 className="ms-2 mb-0">
                      {Math.round(currentLocationWeather.main.temp)}°C
                    </h2>
                  </div>
                  <p className="mb-0">
                    Feels like: {Math.round(currentLocationWeather.main.feels_like)}°C
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="weather-card moderate-theme">
              <p className="text-center mb-0">
                Could not detect your current location
              </p>
            </div>
          )}
        </div>

        {/* Favorite Cities */}
        <div>
          <h2 className="mb-4 d-flex align-items-center">
            <FaHeart className="me-2" style={{ color: '#ff4081' }} />
            <span className="gradient-text">Favorite Cities</span>
          </h2>
          
          {token ? (
            loadingFavorites ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading your favorite cities...</p>
              </div>
            ) : favoriteCitiesWeather.length > 0 ? (
              <Row>
                {favoriteCitiesWeather.map((weather, idx) => (
                  <Col lg={6} key={idx} className="mb-4">
                    <div className={`weather-card ${getWeatherTheme(weather.main.temp)}`}>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h3 className="mb-2">{weather.name}</h3>
                          <p className="mb-1 text-capitalize">
                            {weather.weather[0].description}
                          </p>
                          <p className="mb-1">
                            Humidity: {weather.main.humidity}%
                          </p>
                          <p className="mb-0">
                            Wind: {weather.wind.speed} km/h
                          </p>
                        </div>
                        <div className="text-end">
                          <div className="d-flex align-items-center justify-content-end mb-2">
                            <WeatherIcon temp={weather.main.temp} />
                            <h2 className="ms-2 mb-0">
                              {Math.round(weather.main.temp)}°C
                            </h2>
                          </div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemoveCity(weather._id)}
                            className="mt-2"
                          >
                            <FaTrash className="me-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="weather-card moderate-theme">
                <p className="text-center mb-0">
                  You don't have any favorite cities yet
                </p>
              </div>
            )
          ) : (
            <div className="weather-card moderate-theme">
              <p className="text-center mb-0">
                Please log in to view your favorite cities
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}

export default Home;
