import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import API from '../utils/api';

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    status: 'available'
  });

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const response = await API.get(`/properties?${params}`);
      setProperties(response.data.properties);
    } catch (error) {
      setError('Failed to fetch properties');
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      status: 'available'
    });
  };

  const cities = ['Mumbai', 'Delhi', 'Pune', 'Nashik', 'Bangalore', 'Chennai','Goa'];

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">Find Your Perfect Home</h1>
          <p className="text-center text-muted mb-5">
            Browse through our verified properties across India
          </p>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>City</Form.Label>
                <Form.Select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Min Price</Form.Label>
                <Form.Control
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Max Price</Form.Label>
                <Form.Control
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  placeholder="Max"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Bedrooms</Form.Label>
                <Form.Select
                  name="bedrooms"
                  value={filters.bedrooms}
                  onChange={handleFilterChange}
                >
                  <option value="">Any</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={1} className="d-flex align-items-end">
              <Button variant="outline-secondary" onClick={clearFilters}>
                Clear
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Properties Grid */}
      <Row className="g-4">
        {properties.length === 0 ? (
          <Col>
            <div className="text-center py-5">
              <h4>No properties found</h4>
              <p className="text-muted">Try adjusting your filters</p>
            </div>
          </Col>
        ) : (
          properties.map(property => (
            <Col key={property.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 property-card shadow-sm">
                <Card.Img 
                  variant="top" 
                  src={property.image_url || '/default-property.jpg'} 
                  alt={property.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h6">{property.title}</Card.Title>
                  <Card.Text className="text-muted small mb-2">
                    <i className="bi bi-geo-alt"></i> {property.location}, {property.city}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-bold text-success">₹{property.price}/month</span>
                      <span className={`badge ${property.status === 'available' ? 'bg-success' : 'bg-secondary'}`}>
                        {property.status}
                      </span>
                    </div>
                    {property.bedrooms && (
                      <small className="text-muted">
                        {property.bedrooms} BHK • {property.bathrooms} Bath • {property.area_sqft} sq.ft
                      </small>
                    )}
                    <Button 
                      as={Link} 
                      to={`/property/${property.id}`}
                      variant="success" 
                      size="sm" 
                      className="w-100 mt-2"
                    >
                      View Details
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}