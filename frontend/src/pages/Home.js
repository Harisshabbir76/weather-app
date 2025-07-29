import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Button } from 'react-bootstrap';
import { getFavorites, removeFavorite } from '../utils/localStorageUtils';
import { getWeather, getWeatherByCoords, getWeeklyForecast } from '../services/weatherService';
import '../App.css';

const Home = () => {
  const [citiesWeather, setCitiesWeather] = useState([]);
  const [localWeather, setLocalWeather] = useState(null);
  const [localForecast, setLocalForecast] = useState(null);
  const [cityForecasts, setCityForecasts] = useState({});
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState({
    local: false,
    cities: {}
  });
  const [geoError, setGeoError] = useState(null);
  const [showForecasts, setShowForecasts] = useState({});

  const fetchFavorites = async () => {
    try {
      const favorites = getFavorites();
      if (favorites.length > 0) {
        const results = await Promise.all(favorites.map(city => getWeather(city)));
        const validResults = results.filter(Boolean);
        setCitiesWeather(validResults);
        
        const initialShowState = {};
        validResults.forEach(city => {
          initialShowState[city.name] = false;
        });
        setShowForecasts(initialShowState);

        validResults.forEach(async (weather) => {
          setForecastLoading(prev => ({
            ...prev,
            cities: { ...prev.cities, [weather.name]: true }
          }));
          try {
            const forecast = await getWeeklyForecast(
              weather.coord.lat, 
              weather.coord.lon
            );
            setCityForecasts(prev => ({
              ...prev,
              [weather.name]: forecast
            }));
          } catch (error) {
            console.error(`Failed to fetch forecast for ${weather.name}:`, error);
            setCityForecasts(prev => ({
              ...prev,
              [weather.name]: { daily: [] }
            }));
          } finally {
            setForecastLoading(prev => ({
              ...prev,
              cities: { ...prev.cities, [weather.name]: false }
            }));
          }
        });
      } else {
        setCitiesWeather([]);
      }
    } catch (error) {
      console.error('Failed to fetch favorite cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleForecast = (cityName) => {
    setShowForecasts(prev => ({
      ...prev,
      [cityName]: !prev[cityName]
    }));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setForecastLoading(prev => ({ ...prev, local: true }));
          const [weatherData, forecastData] = await Promise.all([
            getWeatherByCoords(coords.latitude, coords.longitude),
            getWeeklyForecast(coords.latitude, coords.longitude)
          ]);
          setLocalWeather(weatherData);
          setLocalForecast(forecastData);
          setShowForecasts(prev => ({ ...prev, local: false }));
        } catch (err) {
          console.error('Failed to fetch local weather:', err);
          setGeoError('Failed to get weather for your location');
        } finally {
          setForecastLoading(prev => ({ ...prev, local: false }));
        }
      },
      err => {
        console.error('Geolocation error:', err);
        setGeoError('Please enable location access to see local weather');
      }
    );
  }, []);

  const handleRemoveFavorite = (cityName) => {
    removeFavorite(cityName);
    fetchFavorites();
    setCityForecasts(prev => {
      const newForecasts = { ...prev };
      delete newForecasts[cityName];
      return newForecasts;
    });
    setShowForecasts(prev => {
      const newShow = { ...prev };
      delete newShow[cityName];
      return newShow;
    });
  };

  const formatDay = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const renderForecast = (forecast) => {
    if (!forecast || !forecast.daily || forecast.daily.length === 0) {
      return (
        <div className="text-center mt-3">
          <p>No forecast data available</p>
        </div>
      );
    }

    return (
      <div className="forecast-container">
        <div className="forecast-header">
          <h5>7-Day Forecast</h5>
        </div>
        <div className="forecast-days">
          {forecast.daily.slice(0, 7).map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="forecast-day-name">{formatDay(day.dt)}</div>
              <div className="forecast-icon">
                <i className={`bi bi-${getWeatherIcon(day.weather[0].main)}`}></i>
              </div>
              <div className="forecast-temps">
                <span className="temp-max">{Math.round(day.temp.max)}°</span>
                <span className="temp-min">{Math.round(day.temp.min)}°</span>
              </div>
              <div className="forecast-description">
                {day.weather[0].description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Container className="py-4 weather-app-container">
      {/* Your Location Section */}
      {localWeather ? (
        <Card className={`weather-card mb-4 ${getThemeClass(localWeather.main.temp)}`}>
          <Card.Body className="weather-card-body">
            <div className="weather-header">
              <h2 className="location-title">
                <i className="bi bi-geo-alt-fill weather-icon"></i> Your Location
              </h2>
              <div className="weather-main">
                <h3 className="temperature-display">
                  {Math.round(localWeather.main.temp)}°C
                </h3>
                <p className="weather-description">
                  {localWeather.weather[0].description}
                </p>
              </div>
              <div className="temperature-minmax">
                <span>H: {Math.round(localWeather.main.temp_max)}°C</span>
                <span>L: {Math.round(localWeather.main.temp_min)}°C</span>
              </div>
            </div>

            <Button 
              variant="outline-primary" 
              size="sm" 
              className="mt-3 forecast-toggle-btn"
              onClick={() => toggleForecast('local')}
            >
              {showForecasts['local'] ? 'Hide Forecast' : 'Show 7-Day Forecast'}
            </Button>

            {forecastLoading.local ? (
              <div className="text-center mt-3">
                <Spinner animation="border" size="sm" />
                <span className="ms-2">Loading forecast...</span>
              </div>
            ) : (
              showForecasts['local'] && renderForecast(localForecast)
            )}
          </Card.Body>
        </Card>
      ) : geoError && (
        <Card className="weather-card mb-4 theme-moderate">
          <Card.Body>
            <p className="error-message">{geoError}</p>
          </Card.Body>
        </Card>
      )}

      {/* Favorite Cities Section */}
      <div className="d-flex justify-content-center">
        <h1 className="app-title mb-4" style={{
          background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: '600',
          display: 'inline-flex',  // Changed from flex to inline-flex
          alignItems: 'center'
        }}>
          <i className="bi bi-bookmark-star-fill me-2" style={{ 
            background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}></i>
          Favorite Cities
        </h1>
      </div>

      {loading ? (
        <div className="loading-container">
          <Spinner animation="border" className="loading-spinner" />
          <p className="loading-text">Loading weather data...</p>
        </div>
      ) : citiesWeather.length === 0 ? (
        <Card className="weather-card text-center p-4 theme-moderate no-favorites">
          <i className="bi bi-stars no-favorites-icon"></i>
          <h3 className="no-favorites-title">No favorites yet</h3>
          <p className="no-favorites-text">Add cities to your favorites to see their weather</p>
        </Card>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4 weather-cards-container">
          {citiesWeather.map((weather, i) => (
            <Col key={`${weather.name}-${i}`}>
              <Card className={`weather-card h-100 ${getThemeClass(weather.main.temp)}`}>
                <Card.Body className="weather-card-body">
                  <div className="weather-header">
                    <div className="d-flex justify-content-between align-items-start">
                      <Card.Title className="location-title">
                        <i className="bi bi-geo-alt-fill weather-icon"></i>{weather.name}
                      </Card.Title>
                      <Button 
                        variant="link" 
                        onClick={() => handleRemoveFavorite(weather.name)}
                        className="remove-favorite-btn"
                        title="Remove from favorites"
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </Button>
                    </div>
                    <div className="weather-main">
                      <Card.Text className="temperature-display">
                        {Math.round(weather.main.temp)}°C
                      </Card.Text>
                      <Card.Text className="weather-description">
                        <i className={`bi bi-${getWeatherIcon(weather.weather[0].main)} weather-icon`}></i>
                        {weather.weather[0].description}
                      </Card.Text>
                    </div>
                    <div className="temperature-minmax">
                      <span>H: {Math.round(weather.main.temp_max)}°C</span>
                      <span>L: {Math.round(weather.main.temp_min)}°C</span>
                    </div>
                  </div>

                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="mt-3 forecast-toggle-btn"
                    onClick={() => toggleForecast(weather.name)}
                  >
                    {showForecasts[weather.name] ? 'Hide Forecast' : 'Show 7-Day Forecast'}
                  </Button>

                  {forecastLoading.cities[weather.name] ? (
                    <div className="text-center mt-3">
                      <Spinner animation="border" size="sm" />
                      <span className="ms-2">Loading forecast...</span>
                    </div>
                  ) : (
                    showForecasts[weather.name] && renderForecast(cityForecasts[weather.name])
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

function getWeatherIcon(weatherMain) {
  const icons = {
    Thunderstorm: 'lightning-charge-fill',
    Drizzle: 'cloud-drizzle-fill',
    Rain: 'cloud-rain-fill',
    Snow: 'snow',
    Atmosphere: 'cloud-fog-fill',
    Clear: 'sun-fill',
    Clouds: 'clouds-fill'
  };
  return icons[weatherMain] || 'cloud-sun-fill';
}

function getThemeClass(temp) {
  if (temp < 15) return 'theme-cold';
  if (temp < 30) return 'theme-moderate';
  return 'theme-hot';
}

export default Home;