
  import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Nav, Spinner, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('enquiries');
  const [userProperties, setUserProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role === 'owner' || user?.role === 'admin') {
      fetchUserProperties();
    }
    fetchEnquiries();
  }, [user]);

  const fetchUserProperties = async () => {
    try {
      setLoading(true);
      const response = await API.get('/properties/user/my-properties');
      setUserProperties(response.data.properties);
    } catch (error) {
      setError('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await API.get('/bookings/my-bookings');
      setEnquiries(response.data.bookings);
    } catch (error) {
      setError('Failed to fetch enquiries');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  const getTenantTypeBadge = (type) => {
    const variants = {
      family: 'primary',
      bachelors: 'info',
      couple: 'success',
      others: 'secondary'
    };
    return <Badge bg={variants[type]}>{type}</Badge>;
  };

  const handleCancelEnquiry = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to cancel this enquiry?')) return;

    try {
      await API.put(`/bookings/${enquiryId}/status`, { status: 'cancelled' });
      fetchEnquiries();
      if (user?.role === 'owner' || user?.role === 'admin') {
        fetchUserProperties();
      }
    } catch (error) {
      setError('Failed to cancel enquiry');
    }
  };

  // Tenant-specific dashboard
  const renderTenantDashboard = () => (
    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
      <Row>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="enquiries">My Enquiries</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="profile">My Profile</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>

          {/* Quick Stats for Tenant */}
          <Card className="shadow-sm mt-3">
            <Card.Body>
              <h6 className="mb-3">Enquiry Stats</h6>
              <div className="small">
                <div className="d-flex justify-content-between mb-2">
                  <span>Pending:</span>
                  <Badge bg="warning">
                    {enquiries.filter(e => e.status === 'pending' && e.tenant_id === user.id).length}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Confirmed:</span>
                  <Badge bg="success">
                    {enquiries.filter(e => e.status === 'confirmed' && e.tenant_id === user.id).length}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Total:</span>
                  <Badge bg="primary">{enquiries.filter(e => e.tenant_id === user.id).length}</Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Tab.Content>
            {/* Enquiries Tab for Tenant */}
            <Tab.Pane eventKey="enquiries">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>My Property Enquiries</h4>
                <Button 
                  variant="success" 
                  onClick={() => window.location.href = '/properties'}
                >
                  Find More Properties
                </Button>
              </div>

              {enquiries.filter(e => e.tenant_id === user.id).length === 0 ? (
                <Card>
                  <Card.Body className="text-center py-5">
                    <h5>No Enquiries Yet</h5>
                    <p className="text-muted mb-3">
                      You haven't sent any property enquiries yet.
                    </p>
                    <Button 
                      variant="success" 
                      onClick={() => window.location.href = '/properties'}
                    >
                      Browse Properties
                    </Button>
                  </Card.Body>
                </Card>
              ) : (
                <Row className="g-4">
                  {enquiries
                    .filter(e => e.tenant_id === user.id)
                    .map(enquiry => (
                    <Col key={enquiry.id} md={6}>
                      <Card className="h-100 shadow-sm">
                        <Card.Img 
                          variant="top" 
                          src={enquiry.image_url || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=250&fit=crop'} 
                          style={{ height: '180px', objectFit: 'cover' }}
                        />
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h6">{enquiry.title}</Card.Title>
                          <Card.Text className="text-muted small mb-2">
                            📍 {enquiry.location}, {enquiry.city}
                          </Card.Text>
                          
                          <div className="mb-2">
                            <strong>Monthly Rent:</strong> ₹{enquiry.price}
                          </div>

                          <div className="mb-2">
                            <strong>Duration:</strong> {enquiry.rental_months} months
                          </div>

                          <div className="mb-2">
                            <strong>Tenants:</strong> {enquiry.tenants_count} {enquiry.tenants_count === 1 ? 'person' : 'people'} 
                            {' '}({getTenantTypeBadge(enquiry.tenant_type)})
                          </div>

                          <div className="mb-3">
                            <strong>Status:</strong> {getStatusBadge(enquiry.status)}
                          </div>

                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center">
                              <small className="text-muted">
                                Sent: {new Date(enquiry.created_at).toLocaleDateString()}
                              </small>
                              {enquiry.status === 'pending' && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleCancelEnquiry(enquiry.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                            
                            {enquiry.owner_contact && enquiry.status === 'confirmed' && (
                              <div className="mt-2 p-2 bg-light rounded">
                                <small>
                                  <strong>Owner Contact:</strong> {enquiry.owner_name} - {enquiry.owner_contact}
                                </small>
                              </div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab.Pane>

            {/* Profile Tab for Tenant */}
            <Tab.Pane eventKey="profile">
              <Card className="shadow-sm">
                <Card.Body>
                  <h4 className="mb-4">My Profile</h4>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Name:</strong> {user.name}
                      </div>
                      <div className="mb-3">
                        <strong>Email:</strong> {user.email}
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <strong>Mobile:</strong> {user.mobile}
                      </div>
                      <div className="mb-3">
                        <strong>Role:</strong> <Badge bg="success">{user.role}</Badge>
                      </div>
                    </Col>
                  </Row>
                  <div className="mt-4">
                    <small className="text-muted">
                      Member since: {new Date(user.created_at).toLocaleDateString()}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );

 // owner dashboard to show enquiries 
  const renderOwnerDashboard = () => (
    <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
      <Row>
        <Col md={3}>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              <Nav variant="pills" className="flex-column">
                <Nav.Item>
                  <Nav.Link eventKey="overview">Overview</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="properties">My Properties</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="enquiries">Enquiry Requests</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="add-property">Add Property</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          <Tab.Content>
            {/* Update the enquiries tab for owner */}
            <Tab.Pane eventKey="enquiries">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>Property Enquiry Requests</h4>
              </div>

              {enquiries.filter(e => e.owner_id === user.id).length === 0 ? (
                <Card>
                  <Card.Body className="text-center py-5">
                    <h5>No Enquiries Yet</h5>
                    <p className="text-muted">
                      You haven't received any enquiries for your properties yet.
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <Row className="g-4">
                  {enquiries
                    .filter(e => e.owner_id === user.id)
                    .map(enquiry => (
                    <Col key={enquiry.id} md={6}>
                      <Card className="h-100 shadow-sm">
                        <Card.Body>
                          <Card.Title className="h6">{enquiry.title}</Card.Title>
                          <Card.Text className="text-muted small mb-2">
                            📍 {enquiry.location}, {enquiry.city}
                          </Card.Text>
                          
                          <div className="mb-2">
                            <strong>From:</strong> {enquiry.tenant_name}
                          </div>

                          <div className="mb-2">
                            <strong>Contact:</strong> {enquiry.tenant_contact}
                          </div>

                          <div className="mb-2">
                            <strong>Duration:</strong> {enquiry.rental_months} months
                          </div>

                          <div className="mb-2">
                            <strong>Tenants:</strong> {enquiry.tenants_count} {enquiry.tenants_count === 1 ? 'person' : 'people'} 
                            {' '}({getTenantTypeBadge(enquiry.tenant_type)})
                          </div>

                          <div className="mb-3">
                            <strong>Status:</strong> {getStatusBadge(enquiry.status)}
                          </div>

                          {enquiry.status === 'pending' && (
                            <div className="d-flex gap-2">
                              <Button 
                                variant="success" 
                                size="sm"
                                onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'confirmed')}
                              >
                                Accept
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleUpdateEnquiryStatus(enquiry.id, 'cancelled')}
                              >
                                Reject
                              </Button>
                            </div>
                          )}

                          <div className="mt-2">
                            <small className="text-muted">
                              Received: {new Date(enquiry.created_at).toLocaleDateString()}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </Tab.Pane>

            
            <Tab.Pane eventKey="overview">
              <Row className="g-4">
                <Col md={4}>
                  <Card className="text-center shadow-sm">
                    <Card.Body>
                      <h3>{userProperties.length}</h3>
                      <p className="text-muted">Total Properties</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center shadow-sm">
                    <Card.Body>
                      <h3 className="text-success">
                        {userProperties.filter(p => p.status === 'available').length}
                      </h3>
                      <p className="text-muted">Available Properties</p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="text-center shadow-sm">
                    <Card.Body>
                      <h3 className="text-warning">
                        {enquiries.filter(e => e.owner_id === user.id && e.status === 'pending').length}
                      </h3>
                      <p className="text-muted">Pending Enquiries</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Tab.Pane>
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );

 
  const handleUpdateEnquiryStatus = async (enquiryId, status) => {
    try {
      await API.put(`/bookings/${enquiryId}/status`, { status });
      fetchEnquiries();
      if (user?.role === 'owner') {
        fetchUserProperties();
      }
    } catch (error) {
      setError('Failed to update enquiry status');
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

  return (
    <Container className="py-5">
      <Row>
        <Col>
          <h1 className="mb-4">Dashboard</h1>
          <p className="text-muted">
            Welcome back, {user?.name}! 
            {user?.role === 'tenant' && ' Manage your property enquiries here.'}
            {user?.role === 'owner' && ' Manage your properties and enquiries here.'}
          </p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {user?.role === 'tenant' ? renderTenantDashboard() : renderOwnerDashboard()}
    </Container>
  );
}