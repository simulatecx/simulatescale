// src/components/VendorScoreDetails.js

import React from 'react';

const getScoreColor = (score, saturation = 90, lightness = 45) => {
  const hue = ((score - 1) / 9) * 120;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const RatingBar = ({ label, score, description }) => (
  <div className="rating-bar-item">
    <div className="rating-bar-header">
      <span className="rating-bar-label">{label}</span>
      <span className="rating-bar-score" style={{ color: getScoreColor(score) }}>{score.toFixed(1)}/10</span>
    </div>
    <p className="rating-bar-description">{description}</p>
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${score * 10}%`, backgroundColor: getScoreColor(score) }}></div>
    </div>
  </div>
);

const AggregateScore = ({ label, score }) => (
  <div className="aggregate-score-wrapper">
    <div className="aggregate-score-circle" style={{ borderColor: getScoreColor(score), backgroundColor: getScoreColor(score, 100, 97) }}>
      <span className="aggregate-score-value" style={{ color: getScoreColor(score) }}>{score.toFixed(1)}</span>
    </div>
    <span className="aggregate-score-label">{label}</span>
  </div>
);

const VendorScoreDetails = ({ discounts }) => {
  const calculateAverages = (discounts) => {
    if (!discounts || discounts.length === 0) return null;
    const ratings = {
      presales: ['salesProcessRating', 'understandingOfNeedsRating', 'negotiationTransparencyRating'],
      implementation: ['implementationRating', 'trainingRating', 'productPromiseRating'],
      postSales: ['supportQualityRating', 'successManagementRating', 'communicationRating', 'overallValueRating'],
    };
    const totals = {};
    const counts = {};
    Object.values(ratings).flat().forEach(key => {
      totals[key] = 0;
      counts[key] = 0;
    });
    for (const discount of discounts) {
      if (!discount.ratings) continue;
      for (const key in totals) {
        if (discount.ratings[key]) {
          totals[key] += discount.ratings[key];
          counts[key]++;
        }
      }
    }
    const individualAverages = {};
    for (const key in totals) {
      individualAverages[key] = counts[key] > 0 ? totals[key] / counts[key] : 0;
    }
    const aggregateScores = {
        presales: ratings.presales.reduce((acc, key) => acc + individualAverages[key], 0) / ratings.presales.length,
        implementation: ratings.implementation.reduce((acc, key) => acc + individualAverages[key], 0) / ratings.implementation.length,
        postSales: ratings.postSales.reduce((acc, key) => acc + individualAverages[key], 0) / ratings.postSales.length,
    };
    return { individualAverages, aggregateScores };
  };

  const scores = calculateAverages(discounts);

  if (!scores) {
    return <p>No vendor experience data has been submitted yet.</p>;
  }

  const { individualAverages, aggregateScores } = scores;

  return (
    <div className="vendor-score-details">
      <div className="score-subsection">
        <AggregateScore label="Presales Score" score={aggregateScores.presales} />
        <RatingBar label="Sales Process Quality" score={individualAverages.salesProcessRating} description="Organization and efficiency of the sales process." />
        <RatingBar label="Understanding of Needs" score={individualAverages.understandingOfNeedsRating} description="How well the sales team understood your requirements." />
        <RatingBar label="Negotiation Transparency" score={individualAverages.negotiationTransparencyRating} description="Transparency and fairness of the pricing process." />
      </div>
       <div className="score-subsection">
        <AggregateScore label="Implementation & Onboarding Score" score={aggregateScores.implementation} />
        <RatingBar label="Implementation Process" score={individualAverages.implementationRating} description="How smooth and efficient was the implementation?" />
        <RatingBar label="Training & Enablement" score={individualAverages.trainingRating} description="Effectiveness of training to get your team running." />
        <RatingBar label="Product vs. Promise" score={individualAverages.productPromiseRating} description="How well the product met expectations from the sales cycle." />
      </div>
      <div className="score-subsection">
        <AggregateScore label="Post-Sales & Relationship Score" score={aggregateScores.postSales} />
        <RatingBar label="Customer Support Quality" score={individualAverages.supportQualityRating} description="Responsiveness and helpfulness of customer support." />
        <RatingBar label="Proactive Success Management" score={individualAverages.successManagementRating} description="Value from your Customer Success or Account Manager." />
        <RatingBar label="Communication" score={individualAverages.communicationRating} description="Effectiveness of vendor communication and updates." />
        <RatingBar label="Overall Value & Partnership" score={individualAverages.overallValueRating} description="Overall value for money and likelihood to recommend." />
      </div>
    </div>
  );
};

export default VendorScoreDetails;