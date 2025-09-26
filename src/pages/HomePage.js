import React from 'react';
import HeroSection from '../components/HeroSection';
import CompanyList from '../components/CompanyList';

const HomePage = () => {
  return (
    // The <Navbar /> component has been removed from this page.
    // It is now rendered only once in your main App.js file.
    <div>
      <HeroSection />
      <CompanyList />
    </div>
  );
};

export default HomePage;
