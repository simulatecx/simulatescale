import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthContext } from '../context/AuthContext'; // Import auth context
import './DiscountForm.css';

const DiscountForm = ({ companyId, companyName, onDiscountAdded }) => {
  const [product, setProduct] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [actualPrice, setActualPrice] = useState('');
  const [contractYears, setContractYears] = useState(1);
  const [companySize, setCompanySize] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthContext(); // Get the current user

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const discountData = {
      // THIS IS THE FIX: Ensure the correct companyId is saved
      companyId: companyId,
      companyName,
      product,
      companySize,
      listPrice: Number(listPrice),
      actualPrice: Number(actualPrice),
      contractYears: Number(contractYears),
      // This field is now correctly named 'discount' to match the table
      discount: ((Number(listPrice) - Number(actualPrice)) / Number(listPrice)) * 100,
      totalContractValue: Number(actualPrice) * Number(contractYears),
      submittedAt: serverTimestamp(),
      // Also save the user's ID for future features
      submittedBy: user.uid,
    };

    try {
      await addDoc(collection(db, 'discounts'), discountData);
      setProduct('');
      setListPrice('');
      setActualPrice('');
      setContractYears(1);
      setCompanySize('');
      
      if (onDiscountAdded) {
        onDiscountAdded();
      }
    } catch (err) {
      console.error("Error adding document: ", err);
      setError('There was a problem submitting your discount. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Submit a Discount for {companyName}</h2>
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
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Anonymously'}
        </button>
      </form>
    </div>
  );
};

export default DiscountForm;

