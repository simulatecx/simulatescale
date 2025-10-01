import React, { useState } from 'react';


const CompaniesModule = ({ companies }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter companies based on search query
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // Expand the module as soon as the user starts typing
    if (e.target.value.length > 0) {
      setIsExpanded(true);
    }
  };

  return (
    <div className={`companies-module ${isExpanded ? 'expanded' : ''}`}>
      <h2 className="module-title">Search All Companies</h2>
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Enter a company name..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsExpanded(true)}
          className="search-input"
        />
      </div>

      {isExpanded && (
        <div className="companies-list-container">
          {filteredCompanies.length > 0 ? (
            <ul className="companies-list">
              {filteredCompanies.map(company => (
                <li key={company.id} className="company-item">
                  <a href={`/companies/${company.id}`}>{company.name}</a>
                  <div className="company-stats">
                    <span>Avg. Discount: {company.averageDiscount}%</span>
                    <span>Vendor Score: {company.vendorScore}/5</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">No companies found.</p>
          )}
        </div>
      )}

      {!isExpanded && (
        <div className="expand-button-container">
          <button onClick={() => setIsExpanded(true)} className="expand-button">
            Show All Companies
          </button>
        </div>
      )}
       {isExpanded && (
        <div className="expand-button-container">
          <button onClick={() => setIsExpanded(false)} className="expand-button">
            Show Less
          </button>
        </div>
      )}
    </div>
  );
};

export default CompaniesModule;