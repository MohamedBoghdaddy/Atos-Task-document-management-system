import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import { Container, Row, Col, Button } from "react-bootstrap";

const CallToActionSection = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/signup");
  };

  return (
    <div className="Register-section">
      <Container>
        <Row>
          <Col>
            <h2>Secure Your Documents Today</h2>
            <p>
              Register and start managing your important documents with ease and
              security.
            </p>
            <Button onClick={handleRegisterClick}>Get Started Now</Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CallToActionSection;
