import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

// --- Tier Definition Logic ---
const getDealTier = (acv) => {
  if (acv < 125000) return 'SMB';
  if (acv >= 125000 && acv <= 750000) return 'Mid-Market';
  return 'Enterprise';
};

export default function DiscountForm({ companyId, companyName }) {
  const { user, db } = useAuth();

  // All form states
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [discountMethod, setDiscountMethod] = useState('values');
  const [listPrice, setListPrice] = useState('');
  const [finalPrice, setFinalPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [licenses, setLicenses] = useState('');
  const [contractTerm, setContractTerm] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [primaryUseCase, setPrimaryUseCase] = useState('');
  const [concessions, setConcessions] = useState([]);
  const [negotiationFactors, setNegotiationFactors] = useState('');

  const handleConcessionChange = (e) => {
    const { value, checked } = e.target;
    setConcessions(prev => checked ? [...prev, value] : prev.filter(item => item !== value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !db) return alert("Please log in to submit data.");

    // --- Validation ---
    if (!companySize || !industry || !licenses || !contractTerm || !paymentTerms) {
      return alert("Please fill out all required fields marked with an asterisk (*).");
    }
    if (discountMethod === 'values' && !finalPrice) {
      return alert("Please provide the Final Amount Paid to help categorize the deal.");
    }
    if (discountMethod === 'percentage' && !discountPercentage) {
      return alert("Please select a discount percentage range.");
    }

    let dealTier = discountMethod === 'values' ? getDealTier(Number(finalPrice)) : 'SMB';

    const dealData = {
      companyId, companyName, companySize, industry, licenses, contractTerm, paymentTerms,
      primaryUseCase: primaryUseCase || null,
      discountMethod,
      listPrice: discountMethod === 'values' ? Number(listPrice) : null,
      finalPrice: discountMethod === 'values' ? Number(finalPrice) : null,
      discountPercentage: discountMethod === 'percentage' ? discountPercentage : null,
      concessions,
      negotiationFactors: negotiationFactors || null,
      tier: dealTier,
      submittedBy: user.uid,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'discounts'), dealData);
      alert(`Deal data submitted successfully! This deal has been categorized as: ${dealTier}. Thank you!`);
      // You can add form reset logic here
    } catch (error) {
      console.error("Error submitting deal data: ", error);
      alert("There was an error submitting your data.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="discount-form">
      <h3>Share a Deal for {companyName}</h3>
      <p>Your anonymous contribution helps the community negotiate fairer prices.</p>

      {/* --- Section 1: Buyer Context --- */}
      <h4>Your Company</h4>
      <div className="form-group">
        <label>Company Size *</label>
        <select value={companySize} onChange={(e) => setCompanySize(e.target.value)} required>
          <option value="" disabled>Select size...</option>
          <option value="<50M / <250">&lt;$50M / &lt;250 employees</option>
          <option value="50M-250M / 250-1000">$50M–$250M / 250–1,000 employees</option>
          <option value="250M-1B / 1000-5000">$250M–$1B / 1,000–5,000 employees</option>
          <option value="1B+ / 5000+">$1B+ / 5,000+ employees</option>
        </select>
      </div>
      <div className="form-group">
        <label>Industry *</label>
        <select value={industry} onChange={(e) => setIndustry(e.target.value)} required>
          <option value="" disabled>Select industry...</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Financial Services">Financial Services</option>
          {/* Add more industries as needed */}
        </select>
      </div>

      {/* --- Section 2: Deal Details --- */}
      <h4>Deal Details</h4>
      <div className="form-group">
        <label>Discount Calculation Method *</label>
        <div className="button-group">
          <button type="button" className={discountMethod === 'values' ? 'active' : ''} onClick={() => setDiscountMethod('values')}>Enter Values</button>
          <button type="button" className={discountMethod === 'percentage' ? 'active' : ''} onClick={() => setDiscountMethod('percentage')}>Select % Range</button>
        </div>
      </div>

      {discountMethod === 'values' ? (
        <>
          <div className="form-group">
            <label>Annual Contract Value (List Price)</label>
            <input type="number" value={listPrice} onChange={(e) => setListPrice(e.target.value)} placeholder="e.g., 100000" />
          </div>
          <div className="form-group">
            <label>Final Amount Paid (Annual) *</label>
            <input type="number" value={finalPrice} onChange={(e) => setFinalPrice(e.target.value)} placeholder="e.g., 75000" required />
          </div>
        </>
      ) : (
        <div className="form-group">
          <label>Discount % Range *</label>
          <select value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} required>
            <option value="" disabled>Select range...</option>
            <option value="0-5%">0–5%</option>
            <option value="5-10%">5–10%</option>
            <option value="10-20%">10–20%</option>
            <option value="20-30%">20–30%</option>
            <option value="30-40%">30–40%</option>
            <option value="40%+">40%+</option>
          </select>
        </div>
      )}

      <div className="form-group">
        <label>Number of Licenses Purchased *</label>
        <select value={licenses} onChange={(e) => setLicenses(e.target.value)} required>
          <option value="" disabled>Select license count...</option>
          <option value="1-10">1–10</option>
          <option value="11-50">11–50</option>
          <option value="51-100">51–100</option>
          <option value="101-250">101–250</option>
          <option value="251-500">251–500</option>
          <option value="500+">500+</option>
        </select>
      </div>

      <div className="form-group">
        <label>Contract Term *</label>
        <div className="button-group">
          {['1 Year', '2 Years', '3 Years', '4+ Years'].map(term => (
            <button type="button" key={term} className={contractTerm === term ? 'active' : ''} onClick={() => setContractTerm(term)}>{term}</button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>Payment Terms *</label>
        <div className="button-group">
          {['Monthly', 'Annual Upfront', 'Multi-year Prepay'].map(term => (
            <button type="button" key={term} className={paymentTerms === term ? 'active' : ''} onClick={() => setPaymentTerms(term)}>{term}</button>
          ))}
        </div>
      </div>
      
      <div className="form-group">
        <label>Primary Use Case (Optional)</label>
        <textarea value={primaryUseCase} onChange={(e) => setPrimaryUseCase(e.target.value)} placeholder="e.g., CRM for our sales team..." />
      </div>

      {/* --- Section 3: Concessions & Negotiation --- */}
      <h4>Concessions & Intel (Optional)</h4>
      <div className="form-group">
        <label>Additional Concessions Received</label>
        <div className="checkbox-group">
          <label><input type="checkbox" value="Extra licenses" onChange={handleConcessionChange} /> Extra licenses</label>
          <label><input type="checkbox" value="Free implementation" onChange={handleConcessionChange} /> Free implementation</label>
          <label><input type="checkbox" value="Training credits" onChange={handleConcessionChange} /> Training credits</label>
        </div>
      </div>

      <div className="form-group">
        <label>Factors That Helped Negotiation</label>
        <textarea value={negotiationFactors} onChange={(e) => setNegotiationFactors(e.target.value)} placeholder="e.g., Competitive offer, end-of-quarter timing..." />
      </div>

      <button type="submit" disabled={!user}>Submit Anonymously</button>
      {!user && <p className="auth-prompt">Please log in to contribute data.</p>}
    </form>
  );
}