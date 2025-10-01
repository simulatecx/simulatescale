import React from 'react';
import Link from 'next/link';
// We no longer need to import the CSS file here as it's handled in _app.js

const CompanyCard = ({ company }) => {
  // Destructure all the properties we need, including the new 'totalSubmissions'
  const { id, name, logoUrl, vendorScore, averageDiscount, totalSubmissions } = company;

  return (
    <div className="company-card">
      <div className="card-header">
        <img 
          src={logoUrl || 'https://via.placeholder.com/50'} // Use company logo or a placeholder
          alt={`${name} Logo`} 
          className="company-logo" 
        />
        <h3 className="company-name">{name}</h3>
      </div>
      
      {/* Primary Stat Section */}
      <div className="primary-stat">
        <div className="primary-stat-value">{vendorScore}</div>
        <div className="primary-stat-label">Vendor Score</div>
      </div>

      {/* Secondary Stats Section */}
      <div className="secondary-stats">
        <div className="stat">
          <span className="stat-value">{averageDiscount}%</span>
          <span className="stat-label">Avg. Discount</span>
        </div>
        <div className="stat">
          <span className="stat-value">{totalSubmissions || 0}</span>
          <span className="stat-label">Submissions</span>
        </div>
      </div>

      <div className="card-footer">
        <Link href={`/companies/${id}`} legacyBehavior>
          <a className="details-button">View Full Profile</a>
        </Link>
      </div>
    </div>
  );
};

export default CompanyCard;