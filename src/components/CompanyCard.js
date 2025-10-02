import React from 'react';
import Link from 'next/link';
import { useUI } from '../context/UIContext';

const CompanyCard = ({ company, userSubmission }) => {
  // THE FIX IS HERE: We only check for the 'company' prop.
  // The card should render even without a userSubmission.
  if (!company) {
    return null;
  }

  const { openDiscountModal, openSubmissionModal } = useUI(); // Added openSubmissionModal
  const { id, name, logoUrl, vendorScore, averageDiscount, totalSubmissions } = company;

  // This calculation is safe because it only runs if userSubmission exists.
  let userVendorScore = null;
  if (userSubmission && userSubmission.ratings) {
    const ratingKeys = ['salesProcessRating', 'understandingOfNeedsRating', 'negotiationTransparencyRating', 'implementationRating', 'trainingRating', 'productPromiseRating', 'supportQualityRating', 'successManagementRating', 'communicationRating', 'overallValueRating'];
    let totalUserScore = 0, userScoreCount = 0;
    ratingKeys.forEach(key => {
      if (typeof userSubmission.ratings[key] === 'number') {
        totalUserScore += userSubmission.ratings[key];
        userScoreCount++;
      }
    });
    const avgRawUserScore = userScoreCount > 0 ? totalUserScore / userScoreCount : 0;
    userVendorScore = parseFloat((avgRawUserScore / 2).toFixed(1));
  }
  
  const handleEdit = () => {
    openDiscountModal(userSubmission); 
  };

  // NEW: Handler for the "View" button
  const handleView = () => {
    openSubmissionModal(userSubmission);
  };

  return (
    <div className="company-card">
      {/* This badge only renders if userSubmission exists, which is correct. */}
      {userSubmission && (
        <div className={`submission-status-badge ${userSubmission.status}`}>
          {userSubmission.status}
        </div>
      )}

      <div className="card-header">
        <img src={logoUrl || 'https://via.placeholder.com/50'} alt={`${name} Logo`} className="company-logo" />
        <h3 className="company-name">{name}</h3>
      </div>
      
      <div className="primary-stat">
        <div className="primary-stat-value">{vendorScore}</div>
        <div className="primary-stat-label">Overall Score</div>
      </div>

      {userVendorScore !== null && (
        <div className="user-stat">
          <div className="user-stat-value">{userVendorScore.toFixed(1)}</div>
          <div className="user-stat-label">Your Rating</div>
        </div>
      )}

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
        {/* The conditional logic for the footer is now more complete */}
        {userSubmission ? (
          userSubmission.status === 'pending' ? (
            <>
              <p className="edit-notice">Awaiting verification. You can edit this submission.</p>
              <button onClick={handleEdit} className="edit-button">Edit Submission</button>
            </>
          ) : (
            <button onClick={handleView} className="details-button">View Submission</button>
          )
        ) : (
          <Link href={`/companies/${id}`} legacyBehavior>
            <a className="details-button">View Company Profile</a>
          </Link>
        )}
      </div>
    </div>
  );
};

export default CompanyCard;