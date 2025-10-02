import React from 'react';

// A helper to format field names (e.g., 'listPrice' -> 'List Price')
const formatLabel = (key) => {
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};

// A helper to format values (e.g., true -> 'Yes', numbers with commas)
const formatValue = (key, value) => {
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount')) {
    return `$${Number(value).toLocaleString()}`;
  }
  if (key.toLowerCase().includes('lock') || key.toLowerCase().includes('percentage')) {
    return `${value}%`;
  }
  return String(value);
};

const DetailItem = ({ label, value }) => (
  <div className="detail-item">
    <span className="detail-label">{label}</span>
    <span className="detail-value">{value}</span>
  </div>
);

const SubmissionDetails = ({ submission }) => {
  if (!submission) return null;

  const { concessions, ratings, ...financials } = submission;

  const financialDetails = [
    'saasProduct', 'companySize', 'industry', 'listPrice', 'finalPrice', 
    'discountPercentage', 'licensesPurchased', 'contractTerm', 
    'paymentTerms', 'primaryUseCase', 'oneTimeCredits', 'oneTimeCreditsAmount'
  ];

  return (
    <div className="submission-details">
      <h2>Your Submission for {submission.companyName}</h2>
      
      <div className="details-section">
        <h3>Financials</h3>
        {financialDetails.map(key => 
          financials[key] !== undefined && financials[key] !== '' && (
            <DetailItem key={key} label={formatLabel(key)} value={formatValue(key, financials[key])} />
          )
        )}
      </div>

      {concessions && (
        <div className="details-section">
          <h3>Concessions</h3>
          {Object.entries(concessions).map(([key, value]) => {
            // Special handling for nested 'deferredPayments' object
            if (key === 'deferredPayments' && typeof value === 'object') {
              return Object.entries(value).map(([subKey, subValue]) => (
                <DetailItem key={`${key}-${subKey}`} label={`Deferred Payment (${subKey})`} value={formatValue(subKey, subValue)} />
              ));
            }
            if (value) { // Only show concessions that are not default/false
              return <DetailItem key={key} label={formatLabel(key)} value={formatValue(key, value)} />
            }
            return null;
          })}
        </div>
      )}

      {ratings && (
        <div className="details-section">
          <h3>Your Ratings</h3>
          {Object.entries(ratings).map(([key, value]) => (
            <DetailItem key={key} label={formatLabel(key)} value={`${value} / 10`} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionDetails;