import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import logo from '/Renteasy.png';

export default function Navigationbar() {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <Navbar expand="lg" bg="dark" data-bs-theme="dark" fixed="top">
            <Container>
                <Navbar.Brand href="/" className="d-flex align-items-center">
                    <img
                        src={logo}
                        style={{
                            width: "55px",
                            height: "55px",
                            transform: "scale(1.4)",
                            transformOrigin: "left center"
                        }}
                        className="d-inline-block align-top me-3"
                        alt="RentEasy Logo"
                    />
                    <span className="fw-bold fs-4">RentEasy</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <LinkContainer to="/">
                            <Nav.Link>Home</Nav.Link>
                        </LinkContainer>

                        <LinkContainer to="/about">
                            <Nav.Link>About Us</Nav.Link>
                        </LinkContainer>

                        <LinkContainer to="/properties">
                            <Nav.Link>Properties</Nav.Link>
                        </LinkContainer>

                        {user ? (
                            <NavDropdown title={`Welcome, ${user.name}`} id="user-dropdown">
                                <LinkContainer to="/dashboard">
                                    <NavDropdown.Item>Dashboard</NavDropdown.Item>
                                </LinkContainer>

                                {user.role === 'admin' && (
                                    <LinkContainer to="/admin">
                                        <NavDropdown.Item>Admin Panel</NavDropdown.Item>
                                    </LinkContainer>
                                )}
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    Logout
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <>
                                <LinkContainer to="/login">
                                    <Nav.Link>Signin</Nav.Link>
                                </LinkContainer>

                                <LinkContainer to="/signup">
                                    <Nav.Link>Signup</Nav.Link>
                                </LinkContainer>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
