// src/components/Footer.js

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-about">
          <h4>PriceTransparent</h4>
          <p>Empowering buyers with real-world data to negotiate fairer deals on enterprise software.</p>
        </div>
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/companies">Companies</Link></li>
            {/* We can add links to 'About Us', 'Contact', etc. here later */}
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {currentYear} PriceTransparent. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;