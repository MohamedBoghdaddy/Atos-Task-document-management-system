import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/Home.css";
import logoblack from "../assets/images/logo-black.png"
const HeroSection = () => (
  <div className="hero-section">
    <Container>
      <Row>
        <Col md={6}>
          <img
            src={logoblack}
            alt="Company-team"
            style={{ width: "500px", height: "auto" }}
          />
        </Col>
        <Col md={6}>
          <h1>Welcome to HKI AI CAREER</h1>
          <p>Your Career Ally: AI Applies, You RELAX, Job Offers Arrive!</p>
          <Button variant="dark" as={Link} to="/signup">
            Free trial !
          </Button>
        </Col>
      </Row>
    </Container>
  </div>
);

export default HeroSection;
