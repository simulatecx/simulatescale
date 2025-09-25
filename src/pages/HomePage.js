// src/pages/HomePage.js

import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import CompanyList from '../components/CompanyList'; // <-- Import CompanyList

const HomePage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <CompanyList /> {/* <-- Add it here */}
    </div>
  );
};

export default HomePage;