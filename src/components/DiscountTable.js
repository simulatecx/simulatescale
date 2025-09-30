// src/components/DiscountTable.js

const DiscountRow = ({ discount, isLocked }) => {
  const rowClass = isLocked ? 'locked-row' : '';
  const lockSymbol = '🔒 Unlock by submitting a discount';

  // Helper to format currency, returns 'N/A' if no value
  const formatCurrency = (amount) => {
    return amount ? `$${Number(amount).toLocaleString()}` : 'N/A';
  };

  return (
    <tr className={rowClass}>
      <td className="discount-percentage-cell">
        {isLocked ? lockSymbol : `${discount.discountPercentage}%`}
      </td>
      <td>{isLocked ? lockSymbol : formatCurrency(discount.finalPrice)}</td>
      <td>{isLocked ? lockSymbol : formatCurrency(discount.oneTimeCreditsAmount)}</td>
      <td>{isLocked ? lockSymbol : (discount.tier || 'SMB')}</td>
      <td>{isLocked ? lockSymbol : discount.contractTerm}</td>
      <td>{isLocked ? lockSymbol : new Date(discount.createdAt).toLocaleDateString()}</td>
    </tr>
  );
};

const DiscountTable = ({ discounts, user }) => {
  if (!discounts || discounts.length === 0) {
    return <div className="container"><p>No discounts have been submitted for this company yet. Be the first!</p></div>;
  }

  return (
    <div className="discount-table-container">
      <h3>Submitted Discounts</h3>
      <table className="discount-table">
        <thead>
          <tr>
            <th>Discount</th>
            <th>Final ACV</th>
            <th>One-Time Credits</th>
            <th>Tier</th>
            <th>Term</th>
            <th>Date Submitted</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((discount, index) => {
            const tier = discount.tier || 'SMB';
            const isLocked = !user && (tier === 'Mid-Market' || tier === 'Enterprise');
            return <DiscountRow key={index} discount={discount} isLocked={isLocked} />;
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DiscountTable;