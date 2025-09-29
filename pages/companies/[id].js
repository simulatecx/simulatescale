import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../../src/context/AuthContext';
import adminDb from '../../src/firebase/admin-config';
import DiscountTable from '../../src/components/DiscountTable';
import DiscountForm from '../../src/components/DiscountForm';

// This function runs on the server and fetches the company's core data.
export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const docRef = adminDb.collection('companies').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { notFound: true };
    }
    const companyData = { id: docSnap.id, ...docSnap.data() };
    return {
      props: {
        company: JSON.parse(JSON.stringify(companyData)),
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps:", error);
    return { notFound: true };
  }
}

// This is the main page component.
export default function CompanyPage({ company }) {
  const router = useRouter();
  const { user, db } = useAuth();
  const [discounts, setDiscounts] = useState([]);
  const [maxDiscount, setMaxDiscount] = useState(0);

  // This effect runs in the browser to fetch real-time discount data.
  useEffect(() => {
    if (!db || !user) return; // Wait for the DB and user to be ready.

    const discountsRef = collection(db, 'discounts');
    const q = query(
      discountsRef,
      where('companyId', '==', company.id),
      where('tier', '==', 'SMB'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const discountsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDiscounts(discountsData);

      // Calculate the "Max Achievable Discount" from the fetched data.
      if (discountsData.length > 0) {
        const calculatedDiscounts = discountsData
          .filter(d => d.discountMethod === 'values' && d.listPrice > 0)
          .map(d => ((d.listPrice - d.finalPrice) / d.listPrice) * 100);
        
        if (calculatedDiscounts.length > 0) {
          setMaxDiscount(Math.max(...calculatedDiscounts));
        }
      }
    });

    return () => unsubscribe();
  }, [company.id, db, user]);

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Head>
        <title>{company.name} Discounts & Intel | Project Scale</title>
        <meta name="description" content={`Crowdsourced discount data and negotiation insights for ${company.name}.`} />
      </Head>
      <main className="company-page-container">
        <header className="company-header">
          {company.logoUrl && <img src={company.logoUrl} alt={`${company.name} logo`} className="company-logo-large" />}
          <div>
            <h1>{company.name}</h1>
            <p className="company-meta">
              {company.industry && <span>Industry: {company.industry}</span>}
              {company.headquarters && <span>HQ: {company.headquarters}</span>}
            </p>
          </div>
        </header>

        <div className="company-main-content">
          {/* Main Column */}
          <div className="company-details-column">
            <div className="detail-card">
              <h2>About {company.name}</h2>
              <p>{company.description || "No description available."}</p>
            </div>
            {company.primaryUses && (
              <div className="detail-card">
                <h2>Primary Use Cases</h2>
                <ul className="info-list">
                  {company.primaryUses.map((use, index) => (
                    <li key={index}><strong>{use.useCase}:</strong> {use.description}</li>
                  ))}
                </ul>
              </div>
            )}
            {company.competitorSnapshot && (
               <div className="detail-card">
                <h2>Competitor Snapshot</h2>
                <table className="info-table">
                  <thead>
                    <tr><th>Competitor</th><th>Key Strength</th></tr>
                  </thead>
                  <tbody>
                    {company.competitorSnapshot.map((c, i) => <tr key={i}><td><strong>{c.name}</strong></td><td>{c.strength}</td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Sidebar Column */}
          <div className="company-sidebar-column">
            <div className="detail-card negotiation-card">
              <h2>Negotiation Insights</h2>
              <div className="insight-item">
                <h4>Max Achievable Discount</h4>
                <p className="insight-value">{maxDiscount > 0 ? `${maxDiscount.toFixed(0)}%` : 'N/A'}</p>
                <span className="insight-note">Based on submitted SMB deals.</span>
              </div>
            </div>
            <div className="detail-card">
              <h2>Crowdsourced Discounts</h2>
              <DiscountTable discounts={discounts} />
            </div>
            <div className="detail-card">
              <DiscountForm companyId={company.id} companyName={company.name} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}