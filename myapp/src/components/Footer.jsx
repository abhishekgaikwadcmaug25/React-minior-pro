import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import logo from "/Renteasy.png";

export default function Footer() {
  return (
    <footer className="bg-light text-dark py-5 border-top mt-5">
      <Container>
        <Row className="gy-4">
          <Col md={3}>
            <h4 className="fw-bold mb-3 d-flex align-items-center">
              <img
                src={logo} style={{ width: "55px", height: "55px" }} />
              <span className="text-success">Rent</span>Easy
            </h4>
            <p>{new Date().getFullYear()} RentEasy</p>
            <p className="small text-muted">Equal Housing Opportunity</p>
          </Col>

          <Col md={2}>
            <h6 className="fw-bold mb-3">Advertisers</h6>
            <ul className="list-unstyled small">
              <li>Advertise</li>
              <li>Add Property</li>
              <li>Customer Portal</li>
              <li>Community Voice</li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="fw-bold mb-3">Locations</h6>
            <ul className="list-unstyled small">
              <li>Mumbai</li>
              <li>Delhi</li>
              <li>Pune</li>
              <li>Nashik</li>
            </ul>
          </Col>

          <Col md={2}>
            <h6 className="fw-bold mb-3">Marketplace</h6>
            <ul className="list-unstyled small">
              <li>ForRent</li>
              <li>Homes.com</li>
              <li>LoopNet</li>
              <li>Land.com</li>
            </ul>
          </Col>

          <Col md={3}>
            <h6 className="fw-bold mb-3">About Us</h6>
            <ul className="list-unstyled small">
              <li>Contact Us</li>
              <li>Privacy Policy</li>
            </ul>
          </Col>
        </Row>

        <hr />
        <p className="text-center small text-muted mb-0">
          {new Date().getFullYear()} RentEasy. All Rights Reserved.
        </p>
      </Container>
    </footer>
  );
}
