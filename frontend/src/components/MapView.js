import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import { Container, Spinner, Card, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaHeart, FaRegHeart, FaTemperatureHigh, FaTemperatureLow } from 'react-icons/fa';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const customIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Clean up city name by removing suffixes like "Division", "District", etc.
const cleanCityName = (name) => {
  if (!name) return '';
  return name.replace(/ (Division|District|County)$/i, '');
};

function MapView() {
  const [position, setPosition] = useState(null);
  const [cityName, setCityName] = useState('');
  const [country, setCountry] = useState('');
  const [temperature, setTemperature] = useState({ celsius: null, fahrenheit: null });
  const [loading, setLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    if (!cityName || !country || !position) return;

    try {
      if (isFavorite) {
        alert(`${cityName} is already in favorites!`);
        return;
      }

      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/favorites`,
        {
          cityName,
          country,
          lat: position[0],
          lon: position[1],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsFavorite(true);
      alert(`${cityName} added to favorites!`);
    } catch (err) {
      console.error('Error updating favorites:', err);
      alert('Error updating favorites');
    }
  };

  function LocationMarker() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        setLoading(true);
        setIsFavorite(false);

        try {
          const geoRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const rawCity =
            geoRes.data.address.city ||
            geoRes.data.address.town ||
            geoRes.data.address.village ||
            'Unknown';

          const cleanedCity = cleanCityName(rawCity);
          const country = geoRes.data.address.country || 'Unknown';

          setCityName(cleanedCity);
          setCountry(country);

          const apiKey = process.env.REACT_APP_WEATHER_API_KEY;
          const weatherRes = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
          );

          const tempC = weatherRes.data.main.temp;
          const tempF = (tempC * 9) / 5 + 32;
          setTemperature({
            celsius: `${tempC.toFixed(1)}°C`,
            fahrenheit: `${tempF.toFixed(1)}°F`,
          });

          const token = localStorage.getItem('token');
          if (token) {
            try {
              const favRes = await axios.get(
                `${process.env.REACT_APP_API_BASE_URL}/api/favorites/check?city=${encodeURIComponent(cleanedCity)}&country=${encodeURIComponent(country)}`,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );
              setIsFavorite(favRes.data.isFavorite);
            } catch (checkErr) {
              console.error('Error checking favorite status:', checkErr);
            }
          }
        } catch (err) {
          console.error('Error fetching data:', err);
          setTemperature({ celsius: 'Unavailable', fahrenheit: 'Unavailable' });
          setCityName('Unknown');
          setCountry('');
        } finally {
          setLoading(false);
        }
      },
    });

    return position ? (
      <Marker position={position} icon={customIcon}>
        <Popup>
          {loading ? (
            <div className="text-center">
              <Spinner animation="border" size="sm" /> Loading...
            </div>
          ) : (
            <div
              style={{
                fontFamily: 'Arial, sans-serif',
                padding: '10px',
                borderRadius: '8px',
                textAlign: 'center',
                minWidth: '180px',
              }}
            >
              <h5 style={{ marginBottom: '8px', fontSize: '16px' }}>
                {cityName}, {country}
              </h5>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                  <FaTemperatureHigh className="me-2" style={{ color: '#dc3545' }} />
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>
                    {temperature.fahrenheit}
                  </span>
                </div>

                <div className="d-flex align-items-center">
                  <FaTemperatureLow className="me-2" style={{ color: '#0d6efd' }} />
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0d6efd' }}>
                    {temperature.celsius}
                  </span>
                </div>
              </div>

              <Button
                variant={isFavorite ? 'danger' : 'outline-danger'}
                size="sm"
                onClick={toggleFavorite}
                className="w-100"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                {isFavorite ? (
                  <>
                    <FaHeart /> Remove from Favorites
                  </>
                ) : (
                  <>
                    <FaRegHeart /> Add to Favorites
                  </>
                )}
              </Button>
            </div>
          )}
        </Popup>
      </Marker>
    ) : null;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="auth-card theme-moderate" style={{ width: '100%', maxWidth: '800px' }}>
        <Card.Body>
          <div className="text-center mb-4">
            <h3 className="auth-title">
              <span
                style={{
                  background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: '600',
                }}
              >
                Weather Map
              </span>
            </h3>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              Click anywhere on the map to view weather information
            </p>
          </div>

          <div
            style={{
              height: '400px',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            }}
          >
            <MapContainer
              center={[30.3753, 69.3451]}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              tap={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <LocationMarker />
            </MapContainer>
          </div>

          <div className="text-center mt-3">
            <p className="text-muted" style={{ fontSize: '12px' }}>
              <FaTemperatureLow style={{ color: '#0d6efd' }} /> Celsius |{' '}
              <FaTemperatureHigh style={{ color: '#dc3545' }} /> Fahrenheit
            </p>
          </div>
        </Card.Body>
      </Card>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>You must be logged in to add a location to favorites.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLoginModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowLoginModal(false);
              window.location.href = '/login';
            }}
          >
            Go to Login
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default MapView;
