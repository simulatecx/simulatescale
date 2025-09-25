// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom'; // Import Routes and Route
import HomePage from './pages/HomePage';
import CompanyPage from './pages/CompanyPage'; // Import our new page
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import CompaniesPage from './pages/CompaniesPage'; // 1. Import the new page
import Footer from './components/Footer'; // 1. Import the Footer

function App() {
  return (
    <div className="App">
      {/* The main content area that changes based on the route */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/company/:companyId" element={<CompanyPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>

      {/* 2. Add the Footer outside the Routes */}
      <Footer />
    </div>
  );
}

export default App;