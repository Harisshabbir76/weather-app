import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import MapView from './components/MapView';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

const App = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload(); // Reload to update UI
  };

  return (
    <Router>
      <Navbar expand="lg" className="dusk-navbar">
        <Container>
          <Navbar.Brand as={Link} to="/" className="text-dusk-accent">
            <i className="bi bi-cloud-sun-fill me-2" style={{ color: '#4fc3f7' }}></i>
            <span style={{
              background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '600'
            }}>
              SkyWeather
            </span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/" className="nav-link-weather">
                <i className="bi bi-house-door me-2" style={{ color: '#4fc3f7' }}></i>
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/search" className="nav-link-weather">
                <i className="bi bi-search me-2" style={{ color: '#4fc3f7' }}></i>
                Search
              </Nav.Link>
              <Nav.Link as={Link} to="/map" className="nav-link-weather">
                <i className="bi bi-geo-alt me-2" style={{ color: '#4fc3f7' }}></i>
                Map
              </Nav.Link>
              {!isLoggedIn ? (
                <>
                  <Nav.Link as={Link} to="/login" className="nav-link-weather">
                    <i className="bi bi-box-arrow-in-right me-2" style={{ color: '#4fc3f7' }}></i>
                    Login
                  </Nav.Link>
                  <Nav.Link as={Link} to="/signup" className="nav-link-weather">
                    <i className="bi bi-person-plus me-2" style={{ color: '#4fc3f7' }}></i>
                    Signup
                  </Nav.Link>
                </>
              ) : (
                <Nav.Link onClick={handleLogout} className="nav-link-weather">
                  <i className="bi bi-box-arrow-right me-2" style={{ color: '#4fc3f7' }}></i>
                  Logout
                </Nav.Link>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="dusk-background min-vh-100 p-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </Container>

      <style jsx global>{`
        :root {
          --dusk-dark: #0f0c29;
          --dusk-medium: #302b63;
          --dusk-light: #4a3c8a;
          --dusk-orange: #ff7b25;
          --dusk-yellow: #ffb347;
          --dusk-text: #e6e6fa;
          --dusk-accent: #a78bfa;
          --sky-blue: #4fc3f7;
          --teal-accent: #64ffda;
        }
        .dusk-background {
          background: linear-gradient(135deg, var(--dusk-dark), var(--dusk-medium), var(--dusk-light));
          color: var(--dusk-text);
        }
        .dusk-navbar {
          background: rgba(15, 12, 41, 0.9) !important;
          border-bottom: 1px solid var(--sky-blue);
        }
        .nav-link-weather {
          color: var(--sky-blue) !important;
          font-weight: 500;
          transition: all 0.3s ease;
          margin: 0 8px;
          padding: 8px 12px;
          border-radius: 8px;
        }
        .nav-link-weather:hover {
          color: var(--teal-accent) !important;
          background: rgba(79, 195, 247, 0.1);
          transform: translateY(-2px);
        }
        .nav-link-weather.active {
          color: var(--teal-accent) !important;
          font-weight: 600;
        }
        .nav-link-weather i {
          transition: all 0.3s ease;
        }
        .nav-link-weather:hover i {
          transform: scale(1.1);
        }
      `}</style>
    </Router>
  );
};

export default App;
