import React from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

// The component now receives discounts as a prop
export default function DiscountTable({ discounts }) {
  const { user, loading } = useAuth();

  // Helper function to calculate and format the discount
  const getDiscountDisplay = (deal) => {
    if (deal.discountMethod === 'percentage') {
      return deal.discountPercentage;
    }
    if (deal.discountMethod === 'values' && deal.listPrice > 0 && deal.finalPrice > 0) {
      const percentage = ((deal.listPrice - deal.finalPrice) / deal.listPrice) * 100;
      return `${percentage.toFixed(0)}%`;
    }
    return 'N/A';
  };

  if (loading) {
    return <p>Loading discounts...</p>;
  }

  // If the user is a guest (not logged in), show a call to action.
  if (!user) {
    return (
      <div className="auth-prompt-card">
        <h3>See Discount Data</h3>
        <p>Log in or create an account to view and contribute anonymous discount data.</p>
        <Link href="/auth">
          <a className="auth-button">Login / Sign Up</a>
        </Link>
      </div>
    );
  }

  if (discounts.length === 0) {
    return <p>No SMB discount data has been shared yet. Be the first!</p>;
  }

  return (
    <table className="discount-table">
      <thead>
        <tr>
          <th>Discount (%)</th>
          <th>Contract Term</th>
          <th>Licenses</th>
          <th>Company Size</th>
        </tr>
      </thead>
      <tbody>
        {discounts.map(deal => (
          <tr key={deal.id}>
            <td><strong>{getDiscountDisplay(deal)}</strong></td>
            <td>{deal.contractTerm}</td>
            <td>{deal.licenses}</td>
            <td>{deal.companySize}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}