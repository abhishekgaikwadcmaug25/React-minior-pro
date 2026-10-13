import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [enquiryData, setEnquiryData] = useState({
    rental_months: 12,
    tenants_count: 1,
    tenant_type: 'family'
  });
  const [enquiryLoading, setEnquiryLoading] = useState(false);
  const [enquiryError, setEnquiryError] = useState('');

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/properties/${id}`);
      setProperty(response.data.property);
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to fetch property details');
    } finally {
      setLoading(false);
    }
  };

  const handleEnquiryChange = (e) => {
    const { name, value } = e.target;
    setEnquiryData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendEnquiry = async (e) => {
    e.preventDefault();
    
    console.log('Send Enquiry clicked', { user, property });
    
    if (!user) {
      console.log('No user, redirecting to login');
      navigate('/login');
      return;
    }

    if (user.role === 'owner') {
      setEnquiryError('Property owners cannot send enquiries for their own properties');
      return;
    }

    setShowEnquiryModal(true);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setEnquiryLoading(true);
    setEnquiryError('');

    try {
      console.log('Submitting enquiry:', enquiryData);
      
      // Validation
      if (!enquiryData.rental_months) {
        throw new Error('Please select rental duration');
      }

      const enquiryPayload = {
        property_id: parseInt(id),
        rental_months: parseInt(enquiryData.rental_months),
        tenants_count: parseInt(enquiryData.tenants_count),
        tenant_type: enquiryData.tenant_type
      };

      console.log('Enquiry payload:', enquiryPayload);

      const response = await API.post('/bookings', enquiryPayload);
      console.log('Enquiry response:', response.data);
      
      setShowEnquiryModal(false);
      alert('Enquiry sent successfully! The property owner will contact you soon.');
      navigate('/dashboard');
    } catch (error) {
      console.error('Enquiry submission error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send enquiry';
      setEnquiryError(errorMsg);
    } finally {
      setEnquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="success">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error || !property) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error || 'Property not found'}
        </Alert>
        <Button variant="outline-primary" onClick={() => navigate('/properties')}>
          Back to Properties
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/properties')}
            className="mb-4"
          >
            ← Back to Properties
          </Button>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Img 
              variant="top" 
              src={property.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop'} 
              style={{ height: '400px', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop';
              }}
            />
            <Card.Body>
              <h2>{property.title}</h2>
              <p className="text-muted mb-3">
                📍 {property.location}, {property.city}
              </p>
              
              {property.description && (
                <div className="mb-4">
                  <h5>Description</h5>
                  <p>{property.description}</p>
                </div>
              )}

              <Row className="g-3">
                <Col md={6}>
                  <Card className="bg-light">
                    <Card.Body>
                      <h6 className="text-success mb-0">₹{property.price}/month</h6>
                      <small className="text-muted">Monthly Rent</small>
                    </Card.Body>
                  </Card>
                </Col>
                {property.bedrooms && (
                  <Col md={6}>
                    <Card className="bg-light">
                      <Card.Body>
                        <h6 className="mb-0">{property.bedrooms} BHK</h6>
                        <small className="text-muted">Configuration</small>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                {property.area_sqft && (
                  <Col md={6}>
                    <Card className="bg-light">
                      <Card.Body>
                        <h6 className="mb-0">{property.area_sqft} sq.ft</h6>
                        <small className="text-muted">Area</small>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
                <Col md={6}>
                  <Card className="bg-light">
                    <Card.Body>
                      <h6 className="mb-0">
                        <span className={`badge ${property.status === 'available' ? 'bg-success' : 'bg-secondary'}`}>
                          {property.status}
                        </span>
                      </h6>
                      <small className="text-muted">Availability</small>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Owner Information</h5>
              <p><strong>Name:</strong> {property.owner_name || 'Not available'}</p>
              <p><strong>Contact:</strong> {property.owner_contact || 'Not available'}</p>
              
              {property.status === 'available' && (
                <Button 
                  variant="success" 
                  size="lg" 
                  className="w-100 mt-3"
                  onClick={handleSendEnquiry}
                >
                  {user ? (
                    user.role === 'owner' ? 'Cannot enquire your own property' : 'Send Enquiry'
                  ) : (
                    'Login to Enquire'
                  )}
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Enquiry Modal */}
      <Modal show={showEnquiryModal} onHide={() => setShowEnquiryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Send Enquiry</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEnquirySubmit}>
          <Modal.Body>
            {enquiryError && <Alert variant="danger">{enquiryError}</Alert>}
            
            <Form.Group className="mb-3">
              <Form.Label>Rental Duration (Months) *</Form.Label>
              <Form.Select
                name="rental_months"
                value={enquiryData.rental_months}
                onChange={handleEnquiryChange}
                required
              >
                <option value="6">6 Months</option>
                <option value="11">11 Months</option>
                <option value="12">12 Months</option>
                <option value="18">18 Months</option>
                <option value="24">24 Months</option>
                <option value="36">36 Months</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Standard rental agreements are usually for 11-12 months
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Number of Tenants *</Form.Label>
              <Form.Select
                name="tenants_count"
                value={enquiryData.tenants_count}
                onChange={handleEnquiryChange}
                required
              >
                <option value="1">1 Person</option>
                <option value="2">2 People</option>
                <option value="3">3 People</option>
                <option value="4">4 People</option>
                <option value="5">5 People</option>
                <option value="6">6+ People</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Tenant Type *</Form.Label>
              <Form.Select
                name="tenant_type"
                value={enquiryData.tenant_type}
                onChange={handleEnquiryChange}
                required
              >
                <option value="family">Family</option>
                <option value="bachelors">Bachelors</option>
                <option value="couple">Couple</option>
                <option value="others">Others</option>
              </Form.Select>
              <Form.Text className="text-muted">
                This helps owners understand your requirements better
              </Form.Text>
            </Form.Group>

            <div className="alert alert-info">
              <strong>Property Details:</strong><br/>
              • {property.title}<br/>
              • {property.location}, {property.city}<br/>
              • ₹{property.price}/month<br/>
              • The owner will contact you for further discussion
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowEnquiryModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit" disabled={enquiryLoading}>
              {enquiryLoading ? 'Sending...' : 'Send Enquiry'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}