import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Team1 from "../assets/Team1.jpg";
import Team2 from "../assets/Team2.jpg";

export default function AboutUs() {
    const team = [
        { name: "Parikshit Patil", role: "Fullstack Developer(Authentication Authorization)", img: Team1 },
        { name: "Neha Ahire", role: "Frontend Developer", img: Team2 },
        { name: "Abhishek Gaikwad", role: "Fullstack Developer(Dashboard)", img: "https://ik.imagekit.io/sk3g8bghw/Luxury%20Villa%20in%20Goa?updatedAt=1762363226171" },
    ];

    const textStyle = {
        fontFamily: "Poppins, sans-serif",
        fontSize: "1.05rem",
        lineHeight: "1.8",
        textAlign: "justify",
        color: "#6c757d",
        maxWidth: "750px",
        margin: "0 auto 1.5rem",
    };

    return (
        <section className="py-5 bg-light" style={{ paddingTop: "120px" }}>
            <Container>

                <div className="text-center mx-auto p-5 rounded-4 shadow-sm" style={{ background: "#f8fbf8", maxWidth: "750px" }}>
                    <h2 className="fw-bold text-dark mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>About Us</h2>
                    <p style={textStyle}>
                        RentEasy is your trusted online rental platform — simplifying how tenants and property owners connect with ease and confidence.
                    </p>
                </div>


                <Row className="justify-content-center mt-5">
                    <Col lg={9}>
                        <p style={textStyle}>
                            Renting a home should be exciting, not complicated. That’s why we created <strong>RentEasy</strong> — a platform designed
                            to bring tenants and property owners together.Whether you’re looking for your dream apartment or listing your property,
                            RentEasy helps you do it all quickly, safely, and confidently.Our mission is to make renting transparent, trustworthy, and
                            accessible for everyone — one home at a time.
                        </p>
                    </Col>
                </Row>


                <Row className="justify-content-center mt-4">
                    <Col lg={9}>
                        <h3 className="fw-bold text-dark text-center mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Our Mission</h3>
                        <p style={textStyle}>
                            We aim to empower both renters and property owners with smart, transparent, and seamless rental experiences that build
                            trust and convenience.By combining technology with a human touch, RentEasy ensures every user feels confident and cared
                            for throughout their journey.Our platform leverages innovative tools, verified listings, and secure digital transactions
                            to simplify every step — from searching and shortlisting properties to signing rental agreements online.We believe that
                            renting a home shouldn’t be stressful or uncertain, but rather a positive and empowering experience for everyone involved.
                            With continuous improvements, personalized support, and a focus on reliability, RentEasy is redefining the way people find
                            and manage their homes — turning every rental journey into a story of comfort and trust.
                        </p>
                    </Col>
                </Row>


                <div className="text-center mt-5">
                    <h3 className="fw-bold text-dark mb-3" style={{ fontFamily: "Poppins, sans-serif" }}>Meet Our Team</h3>
                    <p className="text-muted mb-5" style={{ fontFamily: "Poppins, sans-serif" }}>
                        The passionate individuals behind RentEasy.
                    </p>
                </div>

                <Row className="g-4 justify-content-center">
                    {team.map(({ name, role, img }, i) => (
                        <Col key={i} md={3} sm={6} xs={10}>
                            <Card className="shadow-sm border-0 text-center mx-auto" style={{ borderRadius: "0.75rem", maxWidth: "80%" }}>
                                <Card.Img
                                    variant="top"
                                    src={img}
                                    alt={name}
                                    style={{
                                        height: "220px",
                                        width: "100%",
                                        objectFit: "contain",
                                        background: "#f8f8f8",
                                        padding: "10px",
                                        borderRadius: "0.75rem 0.75rem 0 0",
                                    }}
                                />
                                <Card.Body>
                                    <h6 className="fw-bold mb-1" style={{ fontFamily: "Poppins, sans-serif" }}>{name}</h6>
                                    <p className="text-muted mb-0" style={{ fontFamily: "Poppins, sans-serif", fontSize: "0.9rem" }}>
                                        {role}
                                    </p>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
}
