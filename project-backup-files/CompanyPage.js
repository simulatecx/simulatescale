import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../src/firebase/config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

// components
import DiscountTable from '../src/components/DiscountTable';
import DiscountForm from '../src/components/DiscountForm';
import DataSummary from '../src/components/FeaturedCompanies';

// context
import { useAuthContext } from '../src/context/AuthContext';

const CompanyPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthContext();

  const [averageDiscount, setAverageDiscount] = useState(0);
  const [medianDiscount, setMedianDiscount] = useState(0);
  const [discountCount, setDiscountCount] = useState(0);

  const fetchDiscounts = useCallback(async () => {
    if (user && id) {
      try {
        const discountsRef = collection(db, 'discounts');
        const q = query(discountsRef, where('companyId', '==', id));
        const querySnapshot = await getDocs(q);
        const fetchedDiscounts = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setDiscounts(fetchedDiscounts);
        calculateStats(fetchedDiscounts);
      } catch (err) {
         console.error("Error fetching discounts:", err);
         setError('Failed to fetch discounts.');
      }
    }
  }, [id, user]);

  useEffect(() => {
    const fetchCompanyData = async () => {
      setLoading(true);
      setError(null);
      try {
        const companyDocRef = doc(db, 'companies', id);
        const companyDocSnap = await getDoc(companyDocRef);

        if (companyDocSnap.exists()) {
          setCompany({ id: companyDocSnap.id, ...companyDocSnap.data() });
          if (user) {
            await fetchDiscounts();
          }
        } else {
          setError('Company not found.');
        }
      } catch (err) {
        console.error("Error fetching company data:", err);
        setError('Failed to fetch data. This might be a permissions issue.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCompanyData();
    }
  }, [id, user, fetchDiscounts]);

  const calculateStats = (discountList) => {
    const validDiscounts = discountList.filter(d => typeof d.discount === 'number');
    if (validDiscounts.length === 0) {
        setAverageDiscount(0);
        setMedianDiscount(0);
        setDiscountCount(0);
        return;
    };
    const discountValues = validDiscounts.map(d => d.discount).sort((a, b) => a - b);
    const sum = discountValues.reduce((acc, val) => acc + val, 0);
    const avg = sum / discountValues.length;
    let median;
    const mid = Math.floor(discountValues.length / 2);
    if (discountValues.length % 2 === 0) {
      median = (discountValues[mid - 1] + discountValues[mid]) / 2;
    } else {
      median = discountValues[mid];
    }
    setAverageDiscount(avg.toFixed(2));
    setMedianDiscount(median.toFixed(2));
    setDiscountCount(discountValues.length);
  };

  const handleDiscountAdded = () => {
    fetchDiscounts();
  };

  if (loading) { return <div className="loading">Loading company details...</div>; }
  if (error) { return <div className="error">{error}</div>; }

  return (
    <div className="company-page-container">
      {company && (
        <>
          <header className="company-header">
            <h1>{company.name}</h1>
            <p className="company-meta">
              Industry: {company.industry} | HQ: {company.headquarters}
            </p>
          </header>
          
          <div className="company-main-content">
            <div className="company-details-column">
                <div className="detail-card">
                    <h2>About {company.name}</h2>
                    <p>{company.about || "No description available."}</p>
                </div>
                <div className="detail-card">
                    <h2>Primary Uses for Procurement Teams</h2>
                    {company.primaryUses && company.primaryUses.length > 0 ? (
                        <table className="info-table">
                            <tbody>
                                {company.primaryUses.map((use, index) => (
                                    <tr key={index}>
                                        <td className="info-title">{use.useCase}</td>
                                        <td>{use.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p>No primary uses listed.</p>}
                </div>
                 <div className="detail-card">
                    <h2>Competitor Snapshot</h2>
                    {company.competitorSnapshot && company.competitorSnapshot.length > 0 ? (
                        <table className="info-table">
                             <thead>
                                <tr>
                                    <th>Competitor</th>
                                    <th>Key Differentiator / Strength</th>
                                </tr>
                            </thead>
                            <tbody>
                                {company.competitorSnapshot.map((competitor, index) => (
                                    <tr key={index}>
                                        <td><strong>{competitor.name}</strong></td>
                                        <td>{competitor.strength}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p>No competitors listed.</p>}
                </div>
            </div>

            <div className="company-sidebar-column">
                <div className="detail-card negotiation-card">
                    <h2>Negotiation Insights</h2>
                    {user ? (
                        company.negotiationInsights ? (
                        <div className="insight-item">
                            <h4>Max Achievable Discount</h4>
                            <p>{company.negotiationInsights.maxAchievableDiscount}%</p>
                            <span>Based on deals of similar size and scope.</span>
                            <div className="insight-item-notes">
                                <p><strong>Key Insight:</strong> {company.negotiationInsights.notes}</p>
                            </div>
                        </div>
                        ) : <p>No negotiation insights available for this company yet.</p>
                    ) : (
                        <div className="login-prompt-small">
                            <p>Log in to view proprietary negotiation insights.</p>
                        </div>
                    )}
                </div>

                {user && (
                    <div className="detail-card">
                        <h2>User Submitted Data</h2>
                        <DataSummary 
                        averageDiscount={averageDiscount}
                        medianDiscount={medianDiscount}
                        discountCount={discountCount}
                        />
                        {/* THIS IS THE FIX: The DiscountTable is now rendered here */}
                        <DiscountTable discounts={discounts} />
                        <DiscountForm 
                            companyId={id} 
                            companyName={company.name} 
                            onDiscountAdded={handleDiscountAdded} 
                        />
                    </div>
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CompanyPage;