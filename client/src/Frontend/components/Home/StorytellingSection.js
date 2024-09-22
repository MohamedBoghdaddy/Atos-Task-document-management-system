import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import logo from "../assets/images/logo.png";
import "../styles/Home.css";

const StorytellingSection = () => (
  <Container className="storytelling-section" id="About us">
    <Row>
      <Col md={6}>
        <img
          src={logo}
          alt="DMS-logo"
          style={{ width: "400px", height: "auto" }}
        />
      </Col>
      <Col md={6}>
        <h2>Our Journey</h2>
        <p>
          We started with a vision to simplify document management for
          businesses and individuals alike. Our platform, rooted in innovation
          and technology, has transformed the way documents are stored,
          accessed, and shared.
        </p>
        <p>
          Built by a team of experts in IT and data security, our system ensures
          that your important documents are not only organized but also
          protected. We are here to provide a seamless experience that
          eliminates the complexities of document management.
        </p>
        <p>
          Whether you are a business or an individual, our mission is to help
          you manage your documents more efficiently and securely, empowering
          you to focus on what matters most.
        </p>
        <p>
          Join us on this journey and take control of your document management
          needs today.
        </p>
      </Col>
    </Row>
  </Container>
);

export default StorytellingSection;
