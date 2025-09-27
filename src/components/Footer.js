import React from 'react';
import Link from 'next/link'; // <--- The corrected import

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Project Scale. All rights reserved.</p>
        <nav className="footer-links">
          {/* Use the Next.js Link component */}
          <Link href="/privacy-policy">
            <a>Privacy Policy</a>
          </Link>
          <Link href="/terms-of-service">
            <a>Terms of Service</a>
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;