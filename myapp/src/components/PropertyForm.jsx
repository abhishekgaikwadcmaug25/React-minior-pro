import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import API from '../utils/api';

const PropertyForm = ({ property, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area_sqft: '',
    image_url: '',
    status: 'available'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title || '',
        description: property.description || '',
        location: property.location || '',
        city: property.city || '',
        price: property.price || '',
        bedrooms: property.bedrooms || '',
        bathrooms: property.bathrooms || '',
        area_sqft: property.area_sqft || '',
        image_url: property.image_url || '',
        status: property.status || 'available'
      });
    }
  }, [property]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (formData.price && formData.price <= 0) newErrors.price = 'Price must be greater than 0';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      if (property) {
        // Update existing property
        await API.put(`/properties/${property.id}`, formData);
      } else {
        // Create new property
        await API.post('/properties', formData);
      }
      
      onSuccess();
    } catch (error) {
      setServerError(
        error.response?.data?.message || `Failed to ${property ? 'update' : 'create'} property`
      );
    } finally {
      setLoading(false);
    }
  };

  const cities = ['Mumbai', 'Delhi', 'Pune', 'Nashik', 'Bangalore', 'Chennai','Goa'];

  return (
    <Form onSubmit={handleSubmit}>
      {serverError && <Alert variant="danger">{serverError}</Alert>}
      
      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Property Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              isInvalid={!!errors.title}
              placeholder="e.g., Luxury 2BHK Apartment in Bandra"
            />
            <Form.Control.Feedback type="invalid">
              {errors.title}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>City *</Form.Label>
            <Form.Select
              name="city"
              value={formData.city}
              onChange={handleChange}
              isInvalid={!!errors.city}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.city}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label>Location *</Form.Label>
            <Form.Control
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              isInvalid={!!errors.location}
              placeholder="e.g., Bandra West, Near Railway Station"
            />
            <Form.Control.Feedback type="invalid">
              {errors.location}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your property, amenities, nearby facilities..."
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Monthly Price (₹) *</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              isInvalid={!!errors.price}
              placeholder="e.g., 25000"
            />
            <Form.Control.Feedback type="invalid">
              {errors.price}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Bedrooms</Form.Label>
            <Form.Select
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
              <option value="5">5+ BHK</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label>Bathrooms</Form.Label>
            <Form.Select
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
            >
              <option value="">Select</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Area (sq. ft.)</Form.Label>
            <Form.Control
              type="number"
              name="area_sqft"
              value={formData.area_sqft}
              onChange={handleChange}
              placeholder="e.g., 1200"
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="available">Available</option>
              <option value="rented">Rented</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
            <Form.Text className="text-muted">
              Provide a direct link to your property image
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <Button variant="outline-secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="success" 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Saving...' : (property ? 'Update Property' : 'Add Property')}
        </Button>
      </div>
    </Form>
  );
};

export default PropertyForm;
