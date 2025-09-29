// src/components/DiscountForm.js

import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';

const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <div className="form-group-toggle">
    <label className="toggle-switch">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
    <span>{label}</span>
  </div>
);

const initialFormData = {
  saasProduct: '', companySize: '', industry: '', listPrice: '',
  finalPrice: '', licensesPurchased: '', contractTerm: '1 year',
  paymentTerms: 'Annual upfront', primaryUseCase: '',
  concessions: {
    netTerms: 'Net 30',
    deferredPayments: { software: false, implementation: false },
    extendedRamp: 30,
    trainingCredits: false,
    extendedLimitsOption: '',
    customSLAs: false,
    dedicatedSupport: false,
    futureDiscountLock: false,
    legalTermConcessions: false,
    legalConcessionsDetails: '',
  },
  ratings: {
    salesProcessRating: 5, understandingOfNeedsRating: 5,
    negotiationTransparencyRating: 5, implementationRating: 5,
    trainingRating: 5, productPromiseRating: 5, supportQualityRating: 5,
    successManagementRating: 5, communicationRating: 5, overallValueRating: 5,
  }
};

const DiscountForm = ({ onSubmission }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState('financial');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [liveDiscount, setLiveDiscount] = useState(0);

  useEffect(() => {
    const fetchCompanies = async () => {
      const companiesCollection = collection(db, 'companies');
      const companySnapshot = await getDocs(companiesCollection);
      const companyList = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCompanies(companyList);
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
     const { listPrice, finalPrice } = formData;
    if (listPrice > 0 && finalPrice > 0 && parseFloat(listPrice) >= parseFloat(finalPrice)) {
      const discount = ((listPrice - finalPrice) / listPrice) * 100;
      setLiveDiscount(Math.ceil(discount));
    } else {
      setLiveDiscount(0);
    }
  }, [formData.listPrice, formData.finalPrice]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConcessionChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [field, subfield] = name.split('.');

    setFormData(prev => {
      const newConcessions = { ...prev.concessions };
      if (subfield) {
        newConcessions[field] = { ...newConcessions[field], [subfield]: checked };
      } else {
        newConcessions[field] = type === 'checkbox' ? checked : (type === 'range' ? parseInt(value, 10) : value);
      }
      return { ...prev, concessions: newConcessions };
    });
  };

  const handleRatingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [name]: parseInt(value, 10) }
    }));
  };

  const handleSubmit = async (e, submittedFromTab) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (submittedFromTab !== 'experience') {
      const proceed = window.confirm("Are you sure you don't want to fill out additional details about your engagement? More details unlock more company pages to view.");
      if (!proceed) {
        return;
      }
    }

    const { listPrice, finalPrice, saasProduct, ratings } = formData;
    
    if (!saasProduct || !listPrice || !finalPrice) {
      setError("Please fill out all required fields in the Financial tab.");
      setActiveTab('financial');
      return;
    }

    const ratingValues = Object.values(ratings);
    const vendorScore = ratingValues.reduce((acc, val) => acc + val, 0) / ratingValues.length;
    
    let submissionCompleteness = 'minimal';
    if (submittedFromTab === 'concessions') submissionCompleteness = 'standard';
    if (submittedFromTab === 'experience') submissionCompleteness = 'full';

    const submissionData = {
      ...formData,
      companyName: saasProduct,
      tier: 'SMB', 
      discountPercentage: liveDiscount,
      vendorScore: parseFloat(vendorScore.toFixed(1)),
      submissionCompleteness,
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, 'discounts'), submissionData);
      setSuccess('Your discount has been submitted successfully! Thank you.');
      setFormData(initialFormData);
      setActiveTab('financial');
      if (onSubmission) onSubmission();
    } catch (err) {
      setError('There was an error submitting your form. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="discount-form-container">
      <div className="form-tabs">
        <button onClick={() => setActiveTab('financial')} className={activeTab === 'financial' ? 'active' : ''}>1. Financial Incentives</button>
        <button onClick={() => setActiveTab('concessions')} className={activeTab === 'concessions' ? 'active' : ''}>2. Additional Concessions (Optional)</button>
        <button onClick={() => setActiveTab('experience')} className={activeTab === 'experience' ? 'active' : ''}>3. Vendor Experience</button>
      </div>

      <form onSubmit={(e) => handleSubmit(e, activeTab)} className="discount-form">
        {activeTab === 'financial' && (
          <div className="form-section">
            <select name="saasProduct" value={formData.saasProduct} onChange={handleInputChange} required>
              <option value="">Which SaaS Product Did You Purchase?*</option>
              {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
            <select name="companySize" value={formData.companySize} onChange={handleInputChange}>
              <option value="">Your Company Size</option>
              <option value="1-50">1-50 Employees</option>
              <option value="51-200">51-200 Employees</option>
              <option value="201-1000">201-1,000 Employees</option>
              <option value="1001+">1,001+ Employees</option>
            </select>
            <select name="industry" value={formData.industry} onChange={handleInputChange}>
              <option value="">Your Industry</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Insurance">Insurance</option>
              <option value="Retail">Retail</option>
              <option value="Utilities">Utilities</option>
              <option value="Machinery">Machinery</option>
              <option value="Government">Government / PubSec</option>
              <option value="Non Profit">Non Profit</option>
            </select>
            <input type="number" name="listPrice" placeholder="Annual Contract Value (List Price)*" value={formData.listPrice} onChange={handleInputChange} required />
            <input type="number" name="finalPrice" placeholder="Final Amount Paid (After Discount)*" value={formData.finalPrice} onChange={handleInputChange} required />
            <select name="licensesPurchased" value={formData.licensesPurchased} onChange={handleInputChange}>
              <option value="">Number of Licenses Purchased</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201+">201+</option>
            </select>
            <div className="radio-group">
              <strong>Contract Term:</strong>
              <label><input type="radio" name="contractTerm" value="1 year" checked={formData.contractTerm === '1 year'} onChange={handleInputChange} /> 1 Year</label>
              <label><input type="radio" name="contractTerm" value="2 years" checked={formData.contractTerm === '2 years'} onChange={handleInputChange} /> 2 Years</label>
              <label><input type="radio" name="contractTerm" value="3 years" checked={formData.contractTerm === '3 years'} onChange={handleInputChange} /> 3+ Years</label>
            </div>
            <div className="radio-group">
              <strong>Payment Terms:</strong>
              <label><input type="radio" name="paymentTerms" value="Monthly" checked={formData.paymentTerms === 'Monthly'} onChange={handleInputChange} /> Monthly</label>
              <label><input type="radio" name="paymentTerms" value="Annual upfront" checked={formData.paymentTerms === 'Annual upfront'} onChange={handleInputChange} /> Annual</label>
              <label><input type="radio" name="paymentTerms" value="Multi-year prepay" checked={formData.paymentTerms === 'Multi-year prepay'} onChange={handleInputChange} /> Multi-Year</label>
            </div>
            <input type="text" name="primaryUseCase" placeholder="Primary Use Case" value={formData.primaryUseCase} onChange={handleInputChange} />
            <div className="live-discount-display">
              Calculated Discount: <span>{liveDiscount}%</span>
            </div>
          </div>
        )}

        {activeTab === 'concessions' && (
          <div className="form-section">
            <div className="form-subsection">
              <h3 className="form-subsection-title">Payment Term Concessions</h3>
              <div className="form-group">
                <label>Net Payment Terms</label>
                <select name="netTerms" value={formData.concessions.netTerms} onChange={handleConcessionChange}>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Net 90">Net 90</option>
                  <option value="Net 120">Net 120</option>
                </select>
              </div>
              <div className="form-group">
                <label>Extended Ramp Period: <span>{formData.concessions.extendedRamp} days</span></label>
                <input type="range" min="30" max="180" step="30" name="extendedRamp" value={formData.concessions.extendedRamp} onChange={handleConcessionChange} />
              </div>
              <div className="form-group">
                <label>Deferred Payments</label>
                <ToggleSwitch label="For Software" name="deferredPayments.software" checked={formData.concessions.deferredPayments.software} onChange={handleConcessionChange} />
                <ToggleSwitch label="For Implementation" name="deferredPayments.implementation" checked={formData.concessions.deferredPayments.implementation} onChange={handleConcessionChange} />
              </div>
            </div>

            <div className="form-subsection">
              <h3 className="form-subsection-title">Product, Service & Legal</h3>
              <div className="form-group">
                 <ToggleSwitch label="Training Credits Included" name="trainingCredits" checked={formData.concessions.trainingCredits} onChange={handleConcessionChange} />
              </div>
              <div className="form-group">
                 <ToggleSwitch label="Future Discount Lock-in" name="futureDiscountLock" checked={formData.concessions.futureDiscountLock} onChange={handleConcessionChange} />
              </div>
              <div className="form-group">
                 <ToggleSwitch label="Legal Term Concessions" name="legalTermConcessions" checked={formData.concessions.legalTermConcessions} onChange={handleConcessionChange} />
                 {formData.concessions.legalTermConcessions && (
                  <input type="text" name="legalConcessionsDetails" placeholder="Briefly describe legal concessions..." value={formData.concessions.legalConcessionsDetails} onChange={handleConcessionChange} className="conditional-textfield" />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="form-section rating-sliders">
            <div className="form-subsection">
              <h3 className="form-subsection-title">Presales</h3>
              <div className="rating-item">
                <label>Sales Process Quality: <span>{formData.ratings.salesProcessRating}</span></label>
                <p className="rating-description">How organized, professional, and efficient was the overall sales process?</p>
                <input type="range" min="1" max="10" name="salesProcessRating" value={formData.ratings.salesProcessRating} onChange={handleRatingChange} />
              </div>
              <div className="rating-item">
                <label>Understanding of Needs: <span>{formData.ratings.understandingOfNeedsRating}</span></label>
                <p className="rating-description">How well did the sales team understand your specific business challenges and requirements?</p>
                <input type="range" min="1" max="10" name="understandingOfNeedsRating" value={formData.ratings.understandingOfNeedsRating} onChange={handleRatingChange} />
              </div>
              <div className="rating-item">
                <label>Negotiation Transparency: <span>{formData.ratings.negotiationTransparencyRating}</span></label>
                <p className="rating-description">How transparent and fair was the pricing and negotiation process?</p>
                <input type="range" min="1" max="10" name="negotiationTransparencyRating" value={formData.ratings.negotiationTransparencyRating} onChange={handleRatingChange} />
              </div>
            </div>
            <div className="form-subsection">
              <h3 className="form-subsection-title">Implementation & Onboarding</h3>
              <div className="rating-item">
                <label>Implementation Process: <span>{formData.ratings.implementationRating}</span></label>
                <p className="rating-description">How smooth and efficient was the implementation and onboarding?</p>
                <input type="range" min="1" max="10" name="implementationRating" value={formData.ratings.implementationRating} onChange={handleRatingChange} />
              </div>
              <div className="rating-item">
                <label>Training & Enablement: <span>{formData.ratings.trainingRating}</span></label>
                <p className="rating-description">How effective was the training provided to get your team up and running on the platform?</p>
                <input type="range" min="1" max="10" name="trainingRating" value={formData.ratings.trainingRating} onChange={handleRatingChange} />
              </div>
              <div className="rating-item">
                <label>Product vs. Promise: <span>{formData.ratings.productPromiseRating}</span></label>
                <p className="rating-description">How well did the final product meet the expectations set during the sales cycle?</p>
                <input type="range" min="1" max="10" name="productPromiseRating" value={formData.ratings.productPromiseRating} onChange={handleRatingChange} />
              </div>
            </div>
            <div className="form-subsection">
              <h3 className="form-subsection-title">Post-Sales & Ongoing Relationship</h3>
              <div className="rating-item">
                <label>Customer Support Quality: <span>{formData.ratings.supportQualityRating}</span></label>
                <p className="rating-description">How responsive, knowledgeable, and helpful is the customer support team?</p>
                <input type="range" min="1" max="10" name="supportQualityRating" value={formData.ratings.supportQualityRating} onChange={handleRatingChange} />
              </div>
              <div className="rating-item">
                <label>Proactive Success Management: <span>{formData.ratings.successManagementRating}</span></label>
                <p className="rating-description">How proactive and valuable is the support from your Customer Success or Account Manager?</p>
                <input type="range" min="1" max="10" name="successManagementRating" value={formData.ratings.successManagementRating} onChange={handleRatingChange} />
              </div>
              <div className="rating-item">
                <label>Communication: <span>{formData.ratings.communicationRating}</span></label>
                <p className="rating-description">How effectively does the company communicate product updates and best practices?</p>
                <input type="range" min="1" max="10" name="communicationRating" value={formData.ratings.communicationRating} onChange={handleRatingChange} />
              </div>
              <div className="rating-item">
                <label>Overall Value & Partnership: <span>{formData.ratings.overallValueRating}</span></label>
                <p className="rating-description">How would you rate the value for money and your likelihood to recommend this vendor?</p>
                <input type="range" min="1" max="10" name="overallValueRating" value={formData.ratings.overallValueRating} onChange={handleRatingChange} />
              </div>
            </div>
          </div>
        )}
        
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}
        
        <div className="form-actions">
          {activeTab === 'financial' && (
            <>
              <button type="submit" className="submit-btn secondary">Submit Financials Only</button>
              <button type="button" onClick={() => setActiveTab('concessions')} className="submit-btn">Move to Tab 2</button>
            </>
          )}
          {activeTab === 'concessions' && (
            <>
              <button type="submit" className="submit-btn secondary">Submit & Finish</button>
              <button type="button" onClick={() => setActiveTab('experience')} className="submit-btn">Move to Tab 3</button>
            </>
          )}
          {activeTab === 'experience' && (
            <button type="submit" className="submit-btn">Submit Full Review</button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DiscountForm;