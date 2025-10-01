import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { db } from '../../src/firebase/admin-config';
import CompanyCard from '../../src/components/CompanyCard';

const CompaniesPage = ({ companies }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  // useMemo will prevent recalculating the unique categories on every render
  const categories = useMemo(() => {
    const allCategories = companies.map(c => c.category).filter(Boolean);
    return ['All', ...new Set(allCategories)];
  }, [companies]);

  const filteredCompanies = companies.filter(company => {
    if (activeCategory === 'All') {
      return true;
    }
    return company.category === activeCategory;
  });

  return (
    <>
      <Head>
        <title>All Companies - SimulateScale</title>
        <meta name="description" content="Browse and search all enterprise software companies." />
      </Head>
      <main className="companies-page-main">
        <h1 className="page-title">All Companies</h1>
        <p className="page-description">
          Explore all software vendors on the platform. Click on any company to view detailed discount data and vendor scores.
        </p>

        {/* --- NEW: Category Filter Tabs --- */}
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`tab-button ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        <div className="companies-grid">
          {/* We now map over the filtered list */}
          {filteredCompanies.map(company => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </main>
    </>
  );
};

// The data-fetching logic remains the same, as it already gets all the data we need.
export async function getStaticProps() {
  try {
    const companiesSnapshot = await db.collection('companies').get();
    const baseCompanies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const allDiscountsSnapshot = await db.collection('discounts').get();
    const allDiscounts = allDiscountsSnapshot.docs.map(doc => doc.data());

    const companiesWithCalculatedData = baseCompanies.map(company => {
      const companyDiscounts = allDiscounts.filter(discount => discount.companyName === company.name);

      let totalDiscount = 0;
      let totalVendorScore = 0;
      let vendorScoreCount = 0;
      const ratingKeys = ['salesProcessRating', 'understandingOfNeedsRating', 'negotiationTransparencyRating', 'implementationRating', 'trainingRating', 'productPromiseRating', 'supportQualityRating', 'successManagementRating', 'communicationRating', 'overallValueRating'];

      companyDiscounts.forEach(discount => {
        totalDiscount += discount.discountPercentage || 0;
        if (discount.ratings) {
          ratingKeys.forEach(key => {
            if (typeof discount.ratings[key] === 'number') {
              totalVendorScore += discount.ratings[key];
              vendorScoreCount++;
            }
          });
        }
      });

      const averageDiscount = companyDiscounts.length > 0 ? Math.round(totalDiscount / companyDiscounts.length) : 0;
      const totalSubmissions = companyDiscounts.length;
      const averageRawScore = vendorScoreCount > 0 ? totalVendorScore / vendorScoreCount : 0;
      const vendorScore = parseFloat((averageRawScore / 2).toFixed(1));

      return { ...company, averageDiscount, totalSubmissions, vendorScore };
    });

    return {
      props: {
        companies: JSON.parse(JSON.stringify(companiesWithCalculatedData)),
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error("Error fetching companies for companies page:", error);
    return { props: { companies: [] } };
  }
}

export default CompaniesPage;