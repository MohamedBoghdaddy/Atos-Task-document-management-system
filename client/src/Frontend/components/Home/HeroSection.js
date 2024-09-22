import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import logoblack from "../assets/images/logo-black.png";

const HeroSection = () => (
  <div className="hero-section">
    <Container>
      <Row>
        <Col md={6}>
          <img
            src={logoblack}
            alt="DMS-logo"
            style={{ width: "500px", height: "auto" }}
          />
        </Col>
        <Col md={6}>
          <h1>Welcome to DMS</h1>
          <p>
            Your Trusted Solution for Secure and Efficient Document Management
          </p>
          <Button variant="dark" as={Link} to="/signup">
            Start Managing Documents Now!
          </Button>
        </Col>
      </Row>
    </Container>
  </div>
);

export default HeroSection;
