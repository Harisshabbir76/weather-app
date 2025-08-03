import React, { useState } from 'react';
import axios from 'axios';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`, formData);
      alert('Signup successful. Please log in.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="auth-card theme-moderate">
        <Card.Body>
          <div className="text-center mb-4">
            <h3 className="auth-title">
              <span style={{
                background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: '600'
              }}>
                Sign Up
              </span>
            </h3>
          </div>
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="form-label">Email</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label className="form-label">Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="form-input"
              />
            </Form.Group>
            
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="d-grid gap-2">
              <Button 
                type="submit" 
                className="auth-btn"
                style={{
                  background: 'linear-gradient(to right, #4fc3f7, #64ffda)',
                  border: 'none',
                  fontWeight: '600'
                }}
              >
                Sign Up
              </Button>
            </div>
            
            <div className="text-center mt-3">
              <p className="auth-link">
                Already have an account?{' '}
                <span 
                  onClick={() => navigate('/login')}
                  style={{
                    color: '#4fc3f7',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Log In
                </span>
              </p>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Signup;