import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "../App.css";
import heroImage from "../assets/Hero.jpg";
import apt1 from "../assets/apt1.jpg";
import apt2 from "../assets/apt2.jpg";
import apt3 from "../assets/apt3.jpg";
import Navigationbar from "../components/Navigationbar";
import Footer from "../components/Footer";

export default function Home() {
  const apartments = [
    {
      id: 1,
      title: "Luxury Flats in Pune",
      location: "Koregaon Park",
      price: "₹25,000/month",
      image: apt1,
    },
    {
      id: 2,
      title: "Modern Flats in Mumbai",
      location: "Bandra",
      price: "₹18,000/month",
      image: apt2,
    },
    {
      id: 3,
      title: "Spacious Flat in Delhi",
      location: "Connaught Place",
      price: "₹22,000/month",
      image: apt3,
    },
  ];

  return (
    <>
      <Navigationbar />
      
      <section className="hero position-relative text-white d-flex align-items-center justify-content-center text-center">
      <img src={heroImage} className="hero-bg"/>
      <div className="overlay"></div>
      <Container>
        <Row>
          <Col>
            <h1 className="display-4 fw-bold">Find Your Perfect Apartment</h1>
            <p className="lead">
              Search from thousands of verified apartments across India.
            </p>
          </Col>
        </Row>
      </Container>
    </section>

      {/* FEATURED APARTMENTS */}
      <Container className="my-5">
        <h2 className="text-center fw-bold mb-4">Trending Apartments</h2>
        <Row className="g-4">
          {apartments.map((apt) => (
            <Col key={apt.id} xs={12} sm={6} md={4}>
              <Card className="h-100 shadow-sm">
                <Card.Img variant="top" src={apt.image} alt={apt.title} style={{ height: "250px", objectFit: "cover" }} />
                <Card.Body>
                  <Card.Title>{apt.title}</Card.Title>
                  <Card.Text>{apt.location}</Card.Text>
                  <Card.Text className="fw-bold text-primary">{apt.price}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* WHY CHOOSE US */}
      <Container fluid className="bg-light py-5">
        <Container>
          <Row className="text-center mb-4">
            <Col>
              <h2 className="fw-bold">The Perfect Place to Manage Your Property</h2>
              <p className="text-muted">Your trusted partner in finding your dream home.</p>
            </Col>
          </Row>

          <Row className="align-items-center mb-5">
            <Col md={6}>
              <img
                src="/image1.jpg"
                alt="Simplified Renting Process"
                className="img-fluid shadow-sm w-100"
                style={{ height: "300px", objectFit: "cover" }}
              />
            </Col>
            <Col md={6}>
              <h4 className="fw-bold mb-3">Simplified Renting Process</h4>
              <p>Find, apply, and rent your dream home — all in one place.
                Our platform makes renting faster, easier, and 100% online.
                Enjoy a smooth, paperless experience from search to move-in.</p>

            </Col>
          </Row>

          {/* ---------- Section 2 ---------- */}
          <Row className="align-items-center flex-md-row-reverse mb-5">
            <Col md={6}>
              <img
                src="/image2.jpg"
                alt="Verified Listings & Trusted Owners"
                className="img-fluid shadow-sm w-100"
                style={{ height: "300px", objectFit: "cover" }}
              />
            </Col>
            <Col md={6}>
              <h4 className="fw-bold mb-3">Verified Listings & Trusted Owners</h4>
              <p>Every property and owner on RentEasy is thoroughly verified,
                ensuring you always rent with confidence and security.
                Your safety and trust are our top priorities.</p>

            </Col>
          </Row>

          {/* ---------- Section 3 ---------- */}
          <Row className="align-items-center">
            <Col md={6}>
              <img
                src="/image3.jpg"
                alt="24/7 Dedicated Support"
                className="img-fluid shadow-sm w-100"
                style={{ height: "300px", objectFit: "cover" }}
              />
            </Col>
            <Col md={6}>
              <h4 className="fw-bold mb-3">24/7 Dedicated Support</h4>
              <p>Our expert support team is available around the clock
                to assist with any questions, issues, or property needs.
                We're here for you — anytime, anywhere.</p>

            </Col>
          </Row>

        </Container>
      </Container>

      <Footer />
    </>
  );
}
