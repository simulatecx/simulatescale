// src/components/Navbar.js

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';

export default function Navbar() {
  const { user, logout } = useAuth(); // Assuming logout is provided by your context
  const { openDiscountModal } = useUI();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/">
          <a className="navbar-logo">SimulateScale</a>
        </Link>
        <ul className="nav-menu">
          {/* We can add other links like 'Companies' back here later */}
          
          {user ? (
            <>
              <li className="nav-item">
                <button onClick={openDiscountModal} className="nav-links-button cta-button">
                  Submit a Discount
                </button>
              </li>
              <li className="nav-item">
                <button onClick={logout} className="nav-links-button">Logout</button>
              </li>
              {/* A profile icon could be added here in the future */}
            </>
          ) : (
            <>
              <li className="nav-item">
                <button onClick={openDiscountModal} className="nav-links-button cta-button">
                  Submit a Discount
                </button>
              </li>
              <li className="nav-item">
                <Link href="/auth">
                  <a className="nav-links">Login / Sign Up</a>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}