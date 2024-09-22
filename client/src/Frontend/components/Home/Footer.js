import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faLinkedin,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

import "../styles/footer.css";

function Footer() {
  return (
    <section className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>DMS - Document Management System</h4>
          <p>
            Manage and organize your critical documents with ease. Our DMS
            offers secure, fast, and reliable solutions to store, access, and
            share your documents. From secure storage to seamless collaboration,
            we provide everything you need to stay organized and efficient.
          </p>
          <div className="icons">
            <a href="https://www.facebook.com/yourcompany">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>{" "}
            <a href="https://www.instagram.com/yourcompany">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="https://www.linkedin.com/company/yourcompany">
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Subscribe to Our Updates</h4>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Footer;
