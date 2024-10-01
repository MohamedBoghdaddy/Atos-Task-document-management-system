import React, { useState, useEffect, useContext } from "react";
import {
  Navbar,
  Nav,
  Container,
  Modal,
  Form,
  Row,
  Col,
  Button,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import logo from "../assets/images/logo.png"; // Adjust path as per your project
import Login from "../LOGIN&REGISTRATION/Login/Login"; // Adjust path to Login component
import { useAuthContext } from "../../../context/AuthContext";
import { useLogout } from "../../../hooks/useLogout.js";
import axios from "axios";
import "../styles/navbar.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { DashboardContext } from "../../../context/DashboardContext"; // Import the DashboardContext

const NavBar = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // New state to capture search term
  const { searchPublicWorkspaces } = useContext(DashboardContext); // Fetch search function from context
  const navigate = useNavigate();
  const { state } = useAuthContext();

  const { user, isAuthenticated } = state;
  const { logout } = useLogout();

  const handleLoginModalOpen = () => {
    setShowLoginModal(true);
  };

  const handleLoginModalClose = () => {
    setShowLoginModal(false);
  };

  const handleNavCollapse = () => setExpanded(!expanded);

  const handleLogout = async () => {
    logout();
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    if (searchTerm) {
      navigate(`/workspaces?term=${searchTerm}`);
    }
  };

  return (
    <Navbar expand="lg" className="navbar" variant="dark" expanded={expanded}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="navbar-brand">
          <img
            src={logo}
            alt="Company Logo"
            style={{ width: "80px", height: "57px", top: 0 }}
          />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="navbar-toggler"
          onClick={handleNavCollapse}
        />
        <Navbar.Collapse id="navbarScroll" className="navbar-collapse">
          <Nav className="navbar-nav ms-auto" navbarScroll>
            <ScrollLink
              to="hero-section"
              smooth
              className="nav-link"
              onClick={handleNavCollapse}
            >
              HOME
            </ScrollLink>
            <ScrollLink
              to="WhoWeAre"
              smooth
              className="nav-link"
              onClick={handleNavCollapse}
            >
              WHO WE ARE
            </ScrollLink>

            <ScrollLink
              to="/contact"
              className="nav-link"
              onClick={handleNavCollapse}
            >
              Contact Us
            </ScrollLink>
            {isAuthenticated && user && (
              <Nav.Link
                as={Link}
                to="/dashboard"
                className="nav-link"
                onClick={handleNavCollapse}
              >
                Dashboard
              </Nav.Link>
            )}

            {isAuthenticated && user ? (
              <div
                className="nav-link"
                role="button"
                tabIndex="0"
                onClick={handleLogout}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleLogout();
                  }
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </div>
            ) : (
              <div
                className="nav-link"
                role="button"
                tabIndex="0"
                onClick={() => {
                  handleLoginModalOpen();
                  handleNavCollapse();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleLoginModalOpen();
                    handleNavCollapse();
                  }
                }}
              >
                <FontAwesomeIcon icon={faUser} />
              </div>
            )}

            {/* Search Form */}
            <Form inline onSubmit={handleSearchSubmit}>
              <Row>
                <Col xs="auto">
                  <Form.Control
                    type="text"
                    placeholder="Search"
                    className=" mr-sm-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Handle search input
                  />
                </Col>
                <Col xs="auto">
                  <Button type="submit">Submit</Button>
                </Col>
              </Row>
            </Form>
          </Nav>
        </Navbar.Collapse>
      </Container>

      <Modal show={showLoginModal} onHide={handleLoginModalClose} centered>
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
          <Login onLoginSuccess={handleLoginModalClose} /> {/* Pass callback */}
        </Modal.Body>
      </Modal>
    </Navbar>
  );
};

export default NavBar;
