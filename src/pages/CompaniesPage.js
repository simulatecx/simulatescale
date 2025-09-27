import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companiesCollection = collection(db, 'companies');
        const companySnapshot = await getDocs(companiesCollection);
        const companyData = companySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanies(companyData);
      } catch (error) {
        console.error("Error fetching companies: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Filter companies based on the search term
  const filteredCompanies = companies.filter(company =>
    (company.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-text">Loading Companies...</div>
    );
  }

  return (
    // The <Navbar /> component has been removed from this page.
    <div className="companies-page-container">
      <div className="companies-header">
        <h1>Explore Companies</h1>
        <p>Find and share discount information for top enterprise software vendors.</p>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search for a company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="companies-grid">
        {filteredCompanies.map(company => (
          <Link to={`/company/${company.id}`} key={company.id} className="company-list-card">
            {company.logoUrl && <img src={company.logoUrl} alt={`${company.name} logo`} />}
            <h3>{company.name}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CompaniesPage;
