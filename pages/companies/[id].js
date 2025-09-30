// pages/companies/[id].js

import { useState } from 'react';
import { db } from '../../src/firebase/admin-config';
import DiscountTable from '../../src/components/DiscountTable';
import VendorScoreDetails from '../../src/components/VendorScoreDetails'; // Import the new component
import ConcessionsDetails from '../../src/components/ConcessionsDetails';
import { useAuth } from '../../src/context/AuthContext';
import Head from 'next/head';

const CompanyPageHeader = ({ company, stats }) => (
    // ... This component's code remains the same
  <div className="company-header">
    <img src={company.logoUrl} alt={`${company.name} logo`} className="company-logo-large" />
    <h1>{company.name}</h1>
    <div className="company-stats">
      <div className="stat-item">
        <span className="stat-value">{stats.averageDiscount}%</span>
        <span className="stat-label">Avg. Discount</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.vendorScore}/10</span>
        <span className="stat-label">Vendor Score</span>
      </div>
      <div className="stat-item">
        <span className="stat-value">{stats.totalSubmissions}</span>
        <span className="stat-label">Total Submissions</span>
      </div>
    </div>
  </div>
);

function CompanyPage({ company, discounts }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discounts'); // State for active tab

  const calculateStats = (discounts) => {
    // ... This function's code remains the same
    if (!discounts || discounts.length === 0) {
      return { averageDiscount: 0, vendorScore: 'N/A', totalSubmissions: 0 };
    }
    const totalDiscount = discounts.reduce((acc, d) => acc + d.discountPercentage, 0);
    const scoredDiscounts = discounts.filter(d => d.vendorScore);
    const totalScore = scoredDiscounts.reduce((acc, d) => acc + d.vendorScore, 0);

    return {
      averageDiscount: Math.ceil(totalDiscount / discounts.length),
      vendorScore: scoredDiscounts.length > 0 ? (totalScore / scoredDiscounts.length).toFixed(1) : 'N/A',
      totalSubmissions: discounts.length,
    };
  };

  const stats = calculateStats(discounts);

  if (!company) {
    return <div className="container"><p>Company not found.</p></div>;
  }

  return (
    <>
      <Head>
        <title>{company.name} Discount & Vendor Data | SimulateScale</title>
        <meta name="description" content={`View crowdsourced discount data and vendor scores for ${company.name}.`} />
      </Head>
      <div className="company-page-container">
        <CompanyPageHeader company={company} stats={stats} />

        {/* --- New Tab Navigation --- */}
        <div className="page-tabs">
          <button onClick={() => setActiveTab('discounts')} className={activeTab === 'discounts' ? 'active' : ''}>
            Discount Data
          </button>
          <button onClick={() => setActiveTab('scores')} className={activeTab === 'scores' ? 'active' : ''}>
            Vendor Score Details
          </button>
          <button onClick={() => setActiveTab('concessions')} className={activeTab === 'concessions' ? 'active' : ''}>
            Common Concessions
          </button>
        </div>

        {/* --- Conditionally Rendered Content --- */}
        <div className="tab-content">
          {activeTab === 'discounts' && <DiscountTable discounts={discounts} user={user} />}
          {activeTab === 'scores' && <VendorScoreDetails discounts={discounts} />}
          {activeTab === 'concessions' && <ConcessionsDetails discounts={discounts} />}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
    // ... This function's code remains the same
  const { id } = context.params;

  try {
    const companyDoc = await db.collection('companies').doc(id).get();
    if (!companyDoc.exists) {
      return { notFound: true };
    }
    const company = { id: companyDoc.id, ...companyDoc.data() };

    const discountsSnapshot = await db.collection('discounts')
      .where('companyName', '==', company.name)
      .where('status', '==', 'verified')
      .orderBy('createdAt', 'desc')
      .get();
      
    const discounts = discountsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate().toISOString(),
      };
    });

    return {
      props: { 
        company: JSON.parse(JSON.stringify(company)),
        discounts: JSON.parse(JSON.stringify(discounts)),
      },
    };
  } catch (error) {
    console.error('Error fetching company page data:', error);
    return { props: { error: 'Failed to fetch data.' } };
  }
}

export default CompanyPage;