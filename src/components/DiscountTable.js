import React from 'react';
import './DiscountTable.css';

const DiscountTable = ({ discounts }) => {
  if (!discounts || discounts.length === 0) {
    return (
        <div className="table-container">
            <p>No discounts have been submitted for this company yet. Be the first!</p>
        </div>
    );
  }

  return (
    <div className="table-container">
      {/* This component no longer needs its own h2 title */}
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
                  {/* THIS IS THE FIX: Check if discount.discount exists and is a number before calling toFixed */}
                  {typeof discount.discount === 'number' ? `${discount.discount.toFixed(1)}%` : 'N/A'}
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