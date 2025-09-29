// src/components/TopDiscounts.js

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import Slider from 'react-slick';

const CompanyDiscountCard = ({ company }) => {
  return (
    <div className="discount-card-wrapper">
      <div className="discount-card">
        <h3>{company.name}</h3>
        <img src={company.logoUrl} alt={`${company.name} logo`} className="company-logo" />
        <div className="tier-grid">
          <div className="tier-item">
            <span>SMB</span>
            <strong>{company.discounts.smb ? `${company.discounts.smb}%` : 'N/A'}</strong>
          </div>
          <div className="tier-item">
            <span>Mid-Market</span>
            <strong>{company.discounts.midMarket ? `${company.discounts.midMarket}%` : 'N/A'}</strong>
          </div>
          <div className="tier-item enterprise">
            <span>Enterprise</span>
            <strong>{company.discounts.enterprise ? `${company.discounts.enterprise}%` : 'N/A'}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TopDiscounts() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    swipeToSlide: true,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3 } },
      { breakpoint: 992, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        setLoading(true);
        const discountsRef = collection(db, 'discounts');
        const discountsSnapshot = await getDocs(query(discountsRef, orderBy('discountPercentage', 'desc')));
        const allDiscounts = discountsSnapshot.docs.map(doc => doc.data());

        const companyData = {};
        for (const discount of allDiscounts) {
          const { companyName, tier, discountPercentage } = discount;
          if (!tier || !companyName || discountPercentage === undefined) {
            continue;
          }

          if (!companyData[companyName]) {
            companyData[companyName] = { name: companyName, maxDiscount: 0, discounts: { smb: null, midMarket: null, enterprise: null } };
          }
          
          // --- CHANGE 1: Round the discount before comparing ---
          const roundedDiscount = Math.ceil(discountPercentage);

          if (roundedDiscount > companyData[companyName].maxDiscount) {
            companyData[companyName].maxDiscount = roundedDiscount;
          }
          const tierKey = tier === 'Mid-Market' ? 'midMarket' : tier.toLowerCase();
          
          // --- CHANGE 2: Round the discount before storing ---
          if (!companyData[companyName].discounts[tierKey] || roundedDiscount > companyData[companyName].discounts[tierKey]) {
            companyData[companyName].discounts[tierKey] = roundedDiscount;
          }
        }
        
        const sortedCompanies = Object.values(companyData).sort((a, b) => b.maxDiscount - a.maxDiscount).slice(0, 8);

        const companyInfoPromises = sortedCompanies.map(comp => getDocs(query(collection(db, 'companies'), where('name', '==', comp.name), limit(1))));
        const companyInfoSnapshots = await Promise.all(companyInfoPromises);

        companyInfoSnapshots.forEach((snapshot, index) => {
          if (!snapshot.empty) {
            sortedCompanies[index].logoUrl = snapshot.docs[0].data().logoUrl || '/placeholder-logo.png';
          }
        });
        
        setCompanies(sortedCompanies);
      } catch (err) {
        console.error("Error fetching company discount data:", err);
        setError("Could not load top discounts.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyData();
  }, []);

  if (loading) return <p>Loading discounts...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <section className="top-discounts">
      <h2>Top Discounts by Company</h2>
      <div className="discount-carousel-container">
        {companies.length === 0 ? (
          <p>No valid discounts found to display.</p>
        ) : (
          <Slider {...settings}>
            {companies.map(company => (
              <CompanyDiscountCard key={company.name} company={company} />
            ))}
          </Slider>
        )}
      </div>
    </section>
  );
}