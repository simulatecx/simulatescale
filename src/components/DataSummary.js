// src/components/DataSummary.js

import React from 'react';
import './DataSummary.css';

const DataSummary = ({ discounts }) => {
  // Don't render anything if there are no discounts
  if (!discounts || discounts.length === 0) {
    return null;
  }

  // --- Calculations ---
  const totalSubmissions = discounts.length;
  
  const averageDiscount = discounts.reduce((acc, d) => acc + d.discountPercentage, 0) / totalSubmissions;
  
  const actualPrices = discounts.map(d => d.actualPrice);
  const minPrice = Math.min(...actualPrices);
  const maxPrice = Math.max(...actualPrices);

  return (
    <div className="summary-container">
      <h3>Data Summary</h3>
      <div className="summary-grid">
        <div className="summary-card">
          <h4>Total Submissions</h4>
          <p>{totalSubmissions}</p>
        </div>
        <div className="summary-card">
<h4>Average Discount</h4>
<p className="highlight">{averageDiscount.toFixed(1)}%</p>
        </div>
        <div className="summary-card">
          <h4>Annual Price Range</h4>
          <p>${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default DataSummary;