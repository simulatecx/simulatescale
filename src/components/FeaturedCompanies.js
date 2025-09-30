// src/components/FeaturedCompanies.js

import { useState, useEffect } from 'react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import Link from 'next/link';

const FeaturedCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const companiesRef = collection(db, 'companies');
        // Let's fetch the first 4 companies as "featured"
        const q = query(companiesRef, limit(4));
        const querySnapshot = await getDocs(q);
        const featuredCompanies = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCompanies(featuredCompanies);
      } catch (error) {
        console.error("Error fetching featured companies:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <section className="featured-companies">
        <h2>Featured Companies</h2>
        <p>Loading...</p>
      </section>
    );
  }

  if (companies.length === 0) {
    return (
       <section className="featured-companies">
        <h2>Featured Companies</h2>
        <p>No companies have been added to the database yet.</p>
      </section>
    );
  }

  return (
    <section className="featured-companies">
      <h2>Featured Companies</h2>
      <div className="company-grid">
        {companies.map(company => (
          <Link key={company.id} href={`/companies/${company.id}`}>
            <a className="company-card">
              <img src={company.logoUrl} alt={`${company.name} logo`} />
              <h3>{company.name}</h3>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCompanies;