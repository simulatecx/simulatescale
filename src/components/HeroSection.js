import React from 'react';
import SearchBar from './SearchBar.js'; // We are keeping our self-contained SearchBar

const HeroSection = () => {
  return (
    // Note: We are using the new class name "g2-style" you added
    <section className="hero-section g2-style"> 
      <div className="hero-content">
        {/* Using the new, more impactful language */}
        <h1>Find the Right Software. Get the Best Price.</h1>
        <p>Leverage crowdsourced data to make smarter software purchasing decisions.</p>
        
        {/* We replace the entire <form> with our clean <SearchBar /> component */}
        <div className="hero-search">
          <SearchBar />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;