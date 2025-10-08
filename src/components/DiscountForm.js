import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
// THE FIX: Added 'formSections' to the import list
import { initialFormData, formSections, allRatingKeys } from '../config/formConfig';

// Helper function to generate color for score ratings
const getScoreColor = (score) => {
  const hue = ((score - 1) / 9) * 120;
  return `hsl(${hue}, 90%, 45%)`;
};

// Reusable Toggle Switch component
const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <div className="form-group-toggle">
    <label className="toggle-switch">
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
    <span>{label}</span>
  </div>
);

const DiscountForm = ({ onSubmission }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [companies, setCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState('financial');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [liveDiscount, setLiveDiscount] = useState(0);
  const { user } = useAuth();
  const { submissionToEdit, setSubmissionToEdit } = useUI();

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
    if (submissionToEdit) {
      const mergedData = {
        ...initialFormData, ...submissionToEdit,
        concessions: { ...initialFormData.concessions, ...(submissionToEdit.concessions || {}) },
        ratings: { ...initialFormData.ratings, ...(submissionToEdit.ratings || {}) },
      };
      setFormData(mergedData);
      setActiveTab('financial');
    } else {
      setFormData(initialFormData);
    }
  }, [submissionToEdit]);

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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleConcessionChange = (e) => {
    const { name, value, type, checked } = e.target;
    const [field, subfield] = name.split('.');
    setFormData(prev => {
      const newConcessions = { ...prev.concessions };
      if (subfield) {
        newConcessions[field] = { ...newConcessions[field], [subfield]: checked };
      } else {
        newConcessions[name] = type === 'checkbox' ? checked : (type === 'range' ? parseInt(value, 10) : value);
      }
      return { ...prev, concessions: newConcessions };
    });
  };

  const handleRatingChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, ratings: { ...prev.ratings, [name]: parseInt(value, 10) } }));
  };

  const handleSubmit = async (e, submittedFromTab) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to submit.");
      return;
    }
    setError('');

    const { listPrice, finalPrice, saasProduct } = formData;
    if (!saasProduct || !listPrice || !finalPrice) {
      setError("Please fill out all required fields in the Financial tab.");
      setActiveTab('financial');
      return;
    }
    
    const ratingValues = Object.values(formData.ratings);
    const vendorScore = ratingValues.reduce((acc, val) => acc + val, 0) / ratingValues.length;
    let submissionCompleteness = 'minimal';
    if (submittedFromTab === 'concessions') submissionCompleteness = 'standard';
    if (submittedFromTab === 'experience') submissionCompleteness = 'full';

    const finalSubmissionData = {
      ...formData,
      userId: user.uid,
      status: submissionToEdit ? formData.status : 'pending',
      companyName: saasProduct,
      discountPercentage: liveDiscount,
      vendorScore: parseFloat(vendorScore.toFixed(1)),
      submissionCompleteness,
      createdAt: submissionToEdit ? formData.createdAt : new Date(),
      updatedAt: new Date(),
    };

    try {
      if (submissionToEdit) {
        const docRef = doc(db, 'discounts', submissionToEdit.id);
        await updateDoc(docRef, finalSubmissionData);
      } else {
        await addDoc(collection(db, 'discounts'), finalSubmissionData);
      }
      
      setIsSubmitted(true);
      setTimeout(() => {
        if (onSubmission) onSubmission();
        setIsSubmitted(false);
        setSubmissionToEdit(null);
      }, 3000);

    } catch (err) {
      setError('There was an error submitting your form. Please try again.');
      console.error(err);
    }
  };

  if (isSubmitted) {
    return (
      <div className="form-success-message">
        <h2>Thank You!</h2>
        <p>Your submission has been received and is pending verification.</p>
      </div>
    );
  }
                    // Discount form Container
  return (
    <div className="discount-form-container">
      <h2>{submissionToEdit ? 'Edit Your Submission' : 'Submit a Discount'}</h2>
      <div className="form-tabs">
        <button onClick={() => setActiveTab('financial')} className={activeTab === 'financial' ? 'active' : ''}>1. Financial Incentives</button>
        <button onClick={() => setActiveTab('concessions')} className={activeTab === 'concessions' ? 'active' : ''}>2. Additional Concessions</button>
        <button onClick={() => setActiveTab('experience')} className={activeTab === 'experience' ? 'active' : ''}>3. Vendor Experience</button>
      </div>
      <form onSubmit={(e) => handleSubmit(e, activeTab)} className="discount-form">
        
{/* --- NEW, REFACTORED Financial TAB --- */}
        {activeTab === 'financial' && ( 
          <div className="form-section">
            {formSections.financial.fields.map(field => {
              switch (field.type) {
                case 'select':
                  return ( <select key={field.name} name={field.name} value={formData[field.name]} onChange={handleInputChange} required={field.label.includes('*')}>
                      <option value="">{field.label}</option>
                      {field.name === 'saasProduct' ? companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>) : field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select> );
                case 'radio':
                  return ( <div className="radio-group" key={field.name}><strong>{field.label}:</strong>
                      {field.options.map(opt => ( <label key={opt}><input type="radio" name={field.name} value={opt} checked={formData[field.name] === opt} onChange={handleInputChange} />{opt}</label> ))}
                    </div> );
                case 'toggle':
                  return ( <div className="form-group" key={field.name}><ToggleSwitch label={field.label} name={field.name} checked={formData[field.name]} onChange={handleInputChange} /></div> );
                case 'range':
                  return ( formData[field.conditionalField] && ( <div className="form-group" key={field.name}><label>{field.label}: <span>${parseInt(formData[field.name], 10).toLocaleString()}</span></label><input type="range" min={field.min} max={field.max} step={field.step} name={field.name} value={formData[field.name]} onChange={handleInputChange} /></div> ));
                default:
                  return ( <input key={field.name} type={field.type} name={field.name} placeholder={field.placeholder || field.label} value={formData[field.name]} onChange={handleInputChange} required={field.label.includes('*')} /> );
              }
            })}
            <div className="live-discount-display">Calculated Discount: <span>{liveDiscount}%</span></div>
          </div>
        )}

{/* --- NEW, REFACTORED CONCESSIONS TAB --- */}
        {activeTab === 'concessions' && (
          <div className="form-section">
            {formSections.concessions.subsections.map(subsection => (
              <div className="form-subsection" key={subsection.title}>
                <h3 className="form-subsection-title">{subsection.title}</h3>
                {subsection.fields.map(field => {
                  // Logic to get the correct value from formData state
                  const [fieldName, subFieldName] = field.name.split('.');
                  const value = subFieldName 
                    ? formData.concessions[fieldName][subFieldName] 
                    : formData.concessions[fieldName];

                  // Conditional rendering
                  if (field.conditionalField && !formData.concessions[field.conditionalField]) {
                    return null;
                  }

                  // Render based on field type
                  switch (field.type) {
                    case 'range':
                      return (
                        <div className="form-group" key={field.name}>
                          <label>{field.label}: <span>{value}{field.unit}</span></label>
                          <input type="range" min={field.min} max={field.max} step={field.step} name={field.name} value={value} onChange={handleConcessionChange} />
                        </div>
                      );
                    case 'toggle':
                      return (
                         <div className="form-group" key={field.name}>
                           {field.group && !subsection.fields.find(f => f.name === field.group.toLowerCase()) && <label>{field.group}</label>}
                           <ToggleSwitch label={field.label} name={field.name} checked={value} onChange={handleConcessionChange} />
                         </div>
                      );
                    case 'text':
                       return (
                         <input type="text" key={field.name} name={field.name} placeholder={field.placeholder} value={value} onChange={handleConcessionChange} className="conditional-textfield" />
                       );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
          </div>
        )}

{/* --- NEW, REFACTORED Experience TAB --- */}
        {activeTab === 'experience' && (
          <div className="form-section rating-sliders">
            {/* The outer loop creates the subsections and headers */}
            {formSections.experience.subsections.map(subsection => (
              <div className="form-subsection" key={subsection.title}>
                <h3 className="form-subsection-title">{subsection.title}</h3>
                {/* The inner loop creates the rating sliders within that subsection */}
                {Object.entries(subsection.fields).map(([fieldKey, fieldData]) => (
                    <div className="rating-item" key={fieldKey}>
                        <label>{fieldData.label}: <span style={{ color: getScoreColor(formData.ratings[fieldKey]) }}>{formData.ratings[fieldKey]}</span></label>
                        <p className="rating-description">{fieldData.description}</p>
                        <input type="range" min="1" max="10" name={fieldKey} value={formData.ratings[fieldKey]} onChange={handleRatingChange} />
                    </div>
                ))}
              </div>
            ))}
          </div>
        )}
        
        {error && <p className="form-error">{error}</p>}
        
        <div className="form-actions">
            {activeTab === 'financial' && (<><button type="submit" className="submit-btn secondary">Submit Financials Only</button><button type="button" onClick={() => setActiveTab('concessions')} className="submit-btn">Continue</button></>)}
            {activeTab === 'concessions' && (<><button type="submit" className="submit-btn secondary">Submit & Finish</button><button type="button" onClick={() => setActiveTab('experience')} className="submit-btn">Continue</button></>)}
            {activeTab === 'experience' && (<button type="submit" className="submit-btn">{submissionToEdit ? 'Update Full Review' : 'Submit Full Review'}</button>)}
        </div>
      </form>
    </div>
  );
};

export default DiscountForm;