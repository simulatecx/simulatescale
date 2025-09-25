// src/components/DiscountForm.js

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import './DiscountForm.css';

const DiscountForm = ({ companyName }) => {
  // State for each input field
  const [product, setProduct] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [contractYears, setContractYears] = useState(1);
  const [companySize, setCompanySize] = useState('');

  // State to manage the form's submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return; // Prevent double-submission
    setIsSubmitting(true);

    // Prepare the data object to send to Firestore
    const discountData = {
      product,
      companyName,
      companySize,
      listPrice: Number(listPrice),
      actualPrice: Number(actualPrice),
      contractYears: Number(contractYears),
      // Calculate our extra fields from the business plan
      discountPercentage: ((Number(listPrice) - Number(actualPrice)) / Number(listPrice)) * 100,
      totalContractValue: Number(actualPrice) * Number(contractYears),
      submittedAt: new Date(), // Add a timestamp
    };

    try {
      // Add the new document to the 'discounts' collection
      await addDoc(collection(db, 'discounts'), discountData);
      setSubmissionMessage('Success! Thank you for contributing to our platform.');
    } catch (error) {
      console.error("Error adding document: ", error);
      setSubmissionMessage('Error: There was a problem submitting your discount. Please try again.');
      setIsSubmitting(false); // Allow user to try again if there's an error
    }
  };

  return (
    <div className="form-container">
      <h2>Submit a Discount for {companyName}</h2>

      {/* If there's no submission message, show the form. Otherwise, show the message. */}
      {!submissionMessage ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Specific Product / Tier</label>
            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g., Sales Cloud Enterprise"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Annual List Price (USD)</label>
              <input
                type="number"
                value={listPrice}
                onChange={(e) => setListPrice(e.target.value)}
                placeholder="e.g., 20000"
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Actual Price Paid (USD)</label>
              <input
                type="number"
                value={actualPrice}
                onChange={(e) => setActualPrice(e.target.value)}
                placeholder="e.g., 15000"
                min="0"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contract Length (Years)</label>
            <input
              type="number"
              value={contractYears}
              onChange={(e) => setContractYears(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Your Company Size</label>
            <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} required>
              <option value="" disabled>Select size...</option>
              <option value="1-50">1-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-1000">201-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
          </button>
        </form>
      ) : (
        <p className="submission-message">{submissionMessage}</p>
      )}
    </div>
  );
};

export default DiscountForm;