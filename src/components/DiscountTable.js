// src/components/DiscountTable.js

import React from 'react';
import './DiscountTable.css';

const DiscountTable = ({ discounts }) => {
  // The loading and empty states are now handled by the parent CompanyPage
  if (!discounts || discounts.length === 0) {
    return (
        <div className="table-container">
            <p>No discounts have been submitted for this company yet. Be the first!</p>
        </div>
    );
  }

  return (
    <div className="table-container">
      <h2>Recent Discount Submissions</h2>
      <table>
        <thead>
          <tr>
            <th>Product / Tier</th>
            <th>Company Size</th>
            <th>List Price (Annual)</th>
            <th>Actual Price (Annual)</th>
            <th>Discount %</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map(discount => (
            <tr key={discount.id}>
              <td>{discount.product}</td>
              <td>{discount.companySize}</td>
              <td>${discount.listPrice.toLocaleString()}</td>
              <td>${discount.actualPrice.toLocaleString()}</td>
              <td>
                <span className="discount-badge">
                  {discount.discountPercentage.toFixed(1)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountTable;