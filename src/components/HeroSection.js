// src/components/HeroSection.js

import React from 'react';

const HeroSection = () => {
  return (
    <div className="hero-container">
      <h1>Anonymous, Real-Time Software Pricing</h1>
      <p>Get the data you need to secure the best deal on your next enterprise software purchase.</p>
      <div className="hero-search-bar">
        {/* We will make this search bar functional later */}
        <input type="text" placeholder="Search for a company..." />
        <button type="button">Search</button>
      </div>
    </div>
  );
};

export default HeroSection;