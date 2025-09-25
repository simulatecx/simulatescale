// src/components/CompanyList.js

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config'; // Import our database connection
import './CompanyList.css';

const CompanyList = () => {
  // 'useState' is a React Hook to hold data that might change.
  // We'll store our array of companies here. It starts as an empty array.
  const [companies, setCompanies] = useState([]);

  // 'useEffect' is a Hook that runs code after the component renders.
  // The empty array [] at the end means it will only run ONCE, when the component first loads.
  useEffect(() => {
    // This is an async function to fetch data from Firestore.
    const fetchCompanies = async () => {
      try {
        // 1. Create a reference to our 'companies' collection
        const companiesCollection = collection(db, 'companies');
        // 2. Get all the documents from that collection
        const companySnapshot = await getDocs(companiesCollection);
        // 3. Map over the documents and create a clean array of our data
        const companyData = companySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // 4. Update our component's state with the fetched data
        setCompanies(companyData);
      } catch (error) {
        console.error("Error fetching companies: ", error);
      }
    };

    fetchCompanies(); // Call the function
  }, []); // The empty dependency array ensures this runs only once

  return (
    <div className="company-list-container">
      <h2>Top Companies</h2>
      <div className="company-grid">
        {/* We map over the 'companies' array. For each company object, we render a card. */}
        {companies.map(company => (
          <div key={company.id} className="company-card">
            <img src={company.logoUrl} alt={`${company.name} logo`} className="company-logo" />
            <h3>{company.name}</h3>
            <p>{company.description}</p>
            <a href={`/company/${company.id}`} className="view-details-button">View Details</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyList;