
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Tab, Nav, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, propertiesRes, enquiriesRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/properties'),
        API.get('/admin/bookings') 
      ]);

      setStats(statsRes.data.stats);
      setUsers(usersRes.data.users);
      setProperties(propertiesRes.data.properties);
      setEnquiries(enquiriesRes.data.bookings); 
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      setError('Failed to delete user');
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) {
      return;
    }

    try {
      await API.delete(`/admin/properties/${propertyId}`);
      setProperties(properties.filter(property => property.id !== propertyId));
    } catch (error) {
      setError('Failed to delete property');
    }
  };

  const handleDeleteEnquiry = async (enquiryId) => { 
    if (!window.confirm('Are you sure you want to delete this enquiry?')) {
      return;
    }

    try {
      await API.delete(`/admin/bookings/${enquiryId}`);
      setEnquiries(enquiries.filter(enquiry => enquiry.id !== enquiryId));
    } catch (error) {
      setError('Failed to delete enquiry');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setShowUserModal(false);
    } catch (error) {
      setError('Failed to update user role');
    }
  };

  const getRoleBadge = (role) => {
    const variants = {
      admin: 'danger',
      owner: 'warning',
      tenant: 'success'
    };
    return <Badge bg={variants[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status) => {
    const variants = {
      available: 'success',
      rented: 'secondary',
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
          <h1 className="mb-4">Admin Dashboard</h1>
          <p className="text-muted">Welcome, Administrator! Manage the entire RentEasy platform.</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

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
                    <Nav.Link eventKey="users">User Management</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="properties">Property Management</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="enquiries">Enquiry Management</Nav.Link> 
                  </Nav.Item>
                </Nav>
              </Card.Body>
            </Card>
          </Col>

          <Col md={9}>
            <Tab.Content>
              {/* Overview Tab */}
              <Tab.Pane eventKey="overview">
                {stats && (
                  <Row className="g-4">
                    <Col md={3}>
                      <Card className="text-center shadow-sm">
                        <Card.Body>
                          <h3 className="text-primary">{stats.total_users}</h3>
                          <p className="text-muted">Total Users</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center shadow-sm">
                        <Card.Body>
                          <h3 className="text-success">{stats.total_tenants}</h3>
                          <p className="text-muted">Tenants</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center shadow-sm">
                        <Card.Body>
                          <h3 className="text-warning">{stats.total_owners}</h3>
                          <p className="text-muted">Property Owners</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={3}>
                      <Card className="text-center shadow-sm">
                        <Card.Body>
                          <h3 className="text-info">{stats.total_properties}</h3>
                          <p className="text-muted">Properties</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center shadow-sm">
                        <Card.Body>
                          <h3 className="text-success">{stats.available_properties}</h3>
                          <p className="text-muted">Available Properties</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center shadow-sm">
                        <Card.Body>
                          <h3 className="text-secondary">{stats.rented_properties}</h3>
                          <p className="text-muted">Rented Properties</p>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={4}>
                      <Card className="text-center shadow-sm">
                        <Card.Body>
                          <h3 className="text-primary">{stats.total_bookings}</h3>
                          <p className="text-muted">Total Enquiries</p> 
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                )}
              </Tab.Pane>

              {/* User Management Tab */}
              <Tab.Pane eventKey="users">
                <Card className="shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">User Management</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Mobile</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => (
                          <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>{user.mobile}</td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setShowUserModal(true);
                                }}
                              >
                                Change Role
                              </Button>
                              {user.id !== user.id && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  Delete
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Property Management Tab */}
              <Tab.Pane eventKey="properties">
                <Card className="shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">Property Management</h5>
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Location</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Owner</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {properties.map(property => (
                          <tr key={property.id}>
                            <td>{property.id}</td>
                            <td>{property.title}</td>
                            <td>{property.location}, {property.city}</td>
                            <td>₹{property.price}</td>
                            <td>{getStatusBadge(property.status)}</td>
                            <td>{property.owner_name}</td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteProperty(property.id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Enquiry Management Tab  */}
              <Tab.Pane eventKey="enquiries">
                <Card className="shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">Enquiry Management</h5> 
                  </Card.Header>
                  <Card.Body>
                    <Table responsive striped>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Property</th>
                          <th>Tenant</th>
                          <th>Owner</th>
                          <th>Duration</th>
                          <th>Tenants</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiries.map(enquiry => ( 
                          <tr key={enquiry.id}>
                            <td>{enquiry.id}</td>
                            <td>{enquiry.property_title}</td>
                            <td>{enquiry.tenant_name}</td>
                            <td>{enquiry.owner_name}</td>
                            <td>{enquiry.rental_months} months</td>
                            <td>{enquiry.tenants_count} people</td>
                            <td>{getTenantTypeBadge(enquiry.tenant_type)}</td>
                            <td>{getStatusBadge(enquiry.status)}</td>
                            <td>{new Date(enquiry.created_at).toLocaleDateString()}</td>
                            <td>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => handleDeleteEnquiry(enquiry.id)} 
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      {/* User Role Modal */}
      <Modal show={showUserModal} onHide={() => setShowUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group>
                <Form.Label>Change role for {selectedUser.name}</Form.Label>
                <Form.Select
                  defaultValue={selectedUser.role}
                  onChange={(e) => handleUpdateUserRole(selectedUser.id, e.target.value)}
                >
                  <option value="tenant">Tenant</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}