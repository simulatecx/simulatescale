import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import CompanyCard from './CompanyCard';

// THE FIX IS HERE: We added '= []' to provide a default value.
const CategoryBrowser = ({ companies = [] }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  // useMemo will prevent recalculating the unique categories on every render
  const categories = useMemo(() => {
    const allCategories = companies.map(c => c.category).filter(Boolean); // Get all categories, filter out any undefined ones
    return ['All', ...new Set(allCategories)]; // Create a unique list with 'All' at the beginning
  }, [companies]);

  const filteredCompanies = companies.filter(company => {
    if (activeCategory === 'All') {
      return true; // Show all companies
    }
    return company.category === activeCategory; // Show companies matching the selected category
  });

  return (
    <section className="category-browser">
      <div className="container">
        <h2 className="browser-title">Browse by Category</h2>
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`tab-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="company-grid">
          {filteredCompanies.slice(0, 6).map(company => ( // Limiting to 6 for the homepage view
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        <div className="browser-footer">
            <Link href="/companies" legacyBehavior>
                <a className="view-all-button">View All Companies</a>
            </Link>
        </div>
      </div>
    </section>
  );
};

export default CategoryBrowser;