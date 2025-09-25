// src/components/Navbar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useAuth } from '../context/AuthContext'; // Import our custom hook
import './Navbar.css';

const Navbar = () => {
  const { currentUser } = useAuth(); // Get the current user from the context
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Redirect to home page after sign out
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">PriceTransparent</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/companies">Companies</Link></li>
        
        {/* Conditional Rendering: Show different links based on user status */}
        {currentUser ? (
          // If user is logged in
          <>
            <li><button onClick={handleSignOut} className="navbar-button-secondary">Sign Out</button></li>
          </>
        ) : (
          // If user is not logged in
          <>
            <li><Link to="/login" className="navbar-button-secondary">Sign In</Link></li>
            <li><Link to="/signup" className="navbar-button-primary">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;