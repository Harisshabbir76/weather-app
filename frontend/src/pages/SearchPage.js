import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { getWeather } from '../services/weatherService';
import { addFavorite } from '../utils/localStorageUtils';

const SearchPage = () => {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getWeather(city);
      setWeather(data);
    } catch (err) {
      setError('City not found. Please try another location.');
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherMain) => {
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
  };

  const getThemeClass = (temp) => {
    if (!temp) return '';
    if (temp < 15) return 'theme-cold';
    if (temp < 30) return 'theme-moderate';
    return 'theme-hot';
  };

  return (
    <Container className="py-4 weather-app-container">
      <Row className="justify-content-center mb-4">
        <Col xs={12} md={8} lg={6}>
          <Card className={`weather-card p-3 ${weather ? getThemeClass(weather.main.temp) : 'theme-moderate'}`}>
            <Form.Group controlId="searchCity">
              <Form.Label className="location-title">Search Location</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter city name"
                  className="search-input"
                  onKeyPress={(e) => e.key === 'Enter' && search()}
                />
                <Button 
                  variant="primary"
                  onClick={search}
                  disabled={loading || !city.trim()}
                  className="search-button ms-2"
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>Search
                    </>
                  )}
                </Button>
              </div>
            </Form.Group>
          </Card>
        </Col>
      </Row>

      {error && (
        <Row className="justify-content-center mb-3">
          <Col xs={12} md={8} lg={6}>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {weather && (
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className={`weather-card ${getThemeClass(weather.main.temp)}`}>
              <Card.Body className="weather-card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <Card.Title className="location-title">
                      <i className="bi bi-geo-alt-fill weather-icon"></i>
                      {weather.name}
                    </Card.Title>
                    <Card.Text className="temperature-display">
                      {Math.round(weather.main.temp)}°C
                    </Card.Text>
                  </div>
                  <Button 
                    variant="primary"
                    onClick={() => addFavorite(weather.name)}
                    className="save-button"
                  >
                    <i className="bi bi-bookmark-star-fill me-2"></i>
                    Save
                  </Button>
                </div>
                <Card.Text className="weather-description">
                  <i className={`bi bi-${getWeatherIcon(weather.weather[0].main)} weather-icon`}></i>
                  {weather.weather[0].description}
                </Card.Text>
                <hr className="weather-divider" />
                <Row className="text-center weather-details mt-3">
                  <Col>
                    <div className="detail-label">HUMIDITY</div>
                    <div className="detail-value">{weather.main.humidity}%</div>
                  </Col>
                  <Col>
                    <div className="detail-label">WIND</div>
                    <div className="detail-value">{weather.wind.speed} m/s</div>
                  </Col>
                  <Col>
                    <div className="detail-label">FEELS LIKE</div>
                    <div className="detail-value">{Math.round(weather.main.feels_like)}°C</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default SearchPage;