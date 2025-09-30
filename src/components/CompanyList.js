// src/components/CompanyList.js

import Link from 'next/link';

const CompanyList = ({ companies }) => {
  if (companies.length === 0) {
    return <p>No companies match your criteria.</p>;
  }

  return (
    <div className="company-grid">
      {companies.map(company => (
        <Link key={company.id} href={`/companies/${company.id}`}>
          <a className="company-card">
            <img src={company.logoUrl} alt={`${company.name} logo`} />
            <h3>{company.name}</h3>
            <div className="company-card-stats">
              <span>Score: {company.avgVendorScore}/10</span>
              <span>Avg. Discount: {company.avgDiscount}%</span>
            </div>
          </a>
        </Link>
      ))}
    </div>
  );
};

export default CompanyList;