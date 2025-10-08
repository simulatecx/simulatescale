import React from 'react'; // Added React import for best practice
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useRouter } from 'next/router'; // Import useRouter

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { openDiscountModal } = useUI();
  const router = useRouter(); // Initialize the router
  
  // This function handles both logging out and redirecting the user
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth'); // Redirect to auth page after logout
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Added legacyBehavior for proper link handling with <a> tags */}
        <Link href="/" legacyBehavior>
          <a className="navbar-logo">SimulateScale</a>
        </Link>
        <ul className="nav-menu">
          {user ? (
            <>
              {isAdmin && (
                <li className="nav-item">
                  <Link href="/admin" legacyBehavior><a className="nav-links">Admin</a></Link>
                </li>
              )}
              <li className="nav-item">
                <Link href="/profile" legacyBehavior><a className="nav-links">My Profile</a></Link>
              </li>
              <li className="nav-item">
                <button onClick={openDiscountModal} className="nav-links-button cta-button">
                  Submit a Discount
                </button>
              </li>
              <li className="nav-item">
                {/* THE FIX: The button now correctly calls handleLogout */}
                <button onClick={handleLogout} className="nav-links-button">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <button onClick={openDiscountModal} className="nav-links-button cta-button">
                  Submit a Discount
                </button>
              </li>
              <li className="nav-item">
                <Link href="/auth" legacyBehavior><a className="nav-links">Login / Sign Up</a></Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}