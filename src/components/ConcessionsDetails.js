// src/components/ConcessionsDetails.js

import React from 'react';

const ConcessionItem = ({ label, percentage }) => (
  <div className="concession-item">
    <div className="concession-label">{label}</div>
    <div className="concession-bar-container">
      <div className="concession-bar" style={{ width: `${percentage}%` }}>
        {percentage > 10 && `${percentage}%`}
      </div>
    </div>
  </div>
);

const ConcessionsDetails = ({ discounts }) => {
  const calculateConcessionStats = (discounts) => {
    const totalSubmissions = discounts.length;
    if (totalSubmissions === 0) return null;

    const concessionCounts = {
      net60OrHigher: 0,
      deferredPayments: 0,
      trainingCredits: 0,
      futureDiscountLock: 0,
      renewalPriceIncreaseLock: 0,
    };

    for (const discount of discounts) {
      if (!discount.concessions) continue;
      const c = discount.concessions;

      if (c.netTerms === 'Net 60' || c.netTerms === 'Net 90' || c.netTerms === 'Net 120') concessionCounts.net60OrHigher++;
      if (c.deferredPayments && (c.deferredPayments.software || c.deferredPayments.implementation)) concessionCounts.deferredPayments++;
      if (c.trainingCredits) concessionCounts.trainingCredits++;
      if (c.futureDiscountLock) concessionCounts.futureDiscountLock++;
      if (c.renewalPriceIncreaseLock > 0 && c.renewalPriceIncreaseLock < 10) concessionCounts.renewalPriceIncreaseLock++;
    }

    const stats = {};
    for (const key in concessionCounts) {
      stats[key] = Math.round((concessionCounts[key] / totalSubmissions) * 100);
    }
    return stats;
  };

  const stats = calculateConcessionStats(discounts);

  if (!stats) {
    return <p>No concession data has been submitted for this company yet.</p>;
  }

  return (
    <div className="concessions-details">
      <p className="concessions-intro">
        Based on {discounts.length} submissions, here is the percentage of buyers who successfully negotiated key non-financial terms.
      </p>
      <div className="concessions-list">
        <ConcessionItem label="Extended Payment Terms (Net 60+)" percentage={stats.net60OrHigher} />
        <ConcessionItem label="Deferred Payments" percentage={stats.deferredPayments} />
        <ConcessionItem label="Training Credits Included" percentage={stats.trainingCredits} />
        <ConcessionItem label="Locked-in Renewal Discount" percentage={stats.futureDiscountLock} />
        <ConcessionItem label="Renewal Price Increase Cap (<10%)" percentage={stats.renewalPriceIncreaseLock} />
      </div>
    </div>
  );
};

export default ConcessionsDetails;