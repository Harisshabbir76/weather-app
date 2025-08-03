import React, { useState } from 'react';
import axios from 'axios';
import { Button, Form, Container, Row, Col, Card, Modal, Spinner } from 'react-bootstrap';
import { FaHeart, FaSearch, FaSignInAlt, FaTimes } from 'react-icons/fa';
import { getWeatherTheme, weatherThemesCSS } from '../components/weatherThemes';

function SearchPage() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/weather?city=${city}`);
      setWeather(res.data);
    } catch (err) {
      setWeather(null);
      setError('City not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    try {
      // First check if city is already a favorite
      const checkRes = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/favorites/check?city=${weather.name}&country=${weather.sys.country}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (checkRes.data.isFavorite) {
        alert(`${weather.name} is already in favorites!`);
        return;
      }

      // Add to favorites if not already present
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/favorites`,
        {
          cityName: weather.name,
          country: weather.sys.country,
          lat: weather.coord.lat,
          lon: weather.coord.lon,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert(`${weather.name} added to favorites!`);

      // 🔔 Trigger event to notify homepage
      window.dispatchEvent(new Event('favoriteAdded'));

    } catch (err) {
      console.error(err);
      alert('Failed to add to favorites');
    }
  };

  return (
    <>
      <style>{weatherThemesCSS}</style>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Card className="auth-card" style={{ 
          width: '100%', 
          maxWidth: '800px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <Card.Body>
            <div className="text-center mb-4 p-3" style={{
              background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.1) 0%, rgba(100, 255, 218, 0.1) 100%)',
              borderRadius: '10px',
              borderBottom: '2px solid rgba(79, 195, 247, 0.3)'
            }}>
              <h3 className="auth-title mb-2">
                <span style={{
                  background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '600',
                  fontSize: '1.8rem'
                }}>
                  City Search
                </span>
              </h3>
              <p style={{ 
                color: '#333',
                fontWeight: '500',
                fontSize: '1rem'
              }}>
                Search for any city's weather
              </p>
            </div>

            <div className="p-3 mb-4" style={{
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <Row>
                <Col md={9}>
                  <Form.Control
                    type="text"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      border: '1px solid #ddd',
                      padding: '12px 15px',
                      fontSize: '1rem'
                    }}
                  />
                </Col>
                <Col md={3}>
                  <Button 
                    onClick={handleSearch}
                    className="w-100"
                    style={{
                      background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
                      border: 'none',
                      fontWeight: '600',
                      padding: '12px',
                      fontSize: '1rem'
                    }}
                  >
                    <FaSearch className="me-1" /> Search
                  </Button>
                </Col>
              </Row>
            </div>

            {loading && (
              <div className="text-center py-4">
                <Spinner animation="border" variant="primary" size="lg" />
                <p className="mt-3" style={{ color: '#333', fontWeight: '500' }}>
                  Searching for weather...
                </p>
              </div>
            )}

            {error && (
              <div className="alert alert-danger d-flex align-items-center" style={{
                background: 'rgba(220, 53, 69, 0.9)',
                color: 'white',
                border: 'none',
                borderRadius: '8px'
              }}>
                <FaTimes className="me-2" />
                {error}
              </div>
            )}

            {weather && (
              <div className={`weather-card ${getWeatherTheme(weather.main.temp)}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="mb-2" style={{ fontWeight: '600' }}>{weather.name}, {weather.sys.country}</h3>
                    <p className="mb-1 text-capitalize" style={{ fontWeight: '500' }}>
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
                      <h2 className="mb-0" style={{ fontWeight: '700' }}>
                        {Math.round(weather.main.temp)}°C
                      </h2>
                    </div>
                    <Button
                      variant="outline-light"
                      onClick={handleAddFavorite}
                      className="mt-2"
                      style={{
                        fontWeight: '500',
                        borderWidth: '2px'
                      }}
                    >
                      <FaHeart className="me-1" /> Add to Favorites
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
              <Modal.Header closeButton className="border-0" style={{ background: '#f8f9fa' }}>
                <Modal.Title style={{ color: '#333' }}>Login Required</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ background: '#f8f9fa' }}>
                <p style={{ color: '#333' }}>You must be logged in to add cities to your favorites.</p>
              </Modal.Body>
              <Modal.Footer className="border-0" style={{ background: '#f8f9fa' }}>
                <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setShowLoginModal(false);
                    window.location.href = '/login';
                  }}
                  style={{
                    background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
                    border: 'none',
                    fontWeight: '500'
                  }}
                >
                  <FaSignInAlt className="me-1" /> Go to Login
                </Button>
              </Modal.Footer>
            </Modal>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default SearchPage;
