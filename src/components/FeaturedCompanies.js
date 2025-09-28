import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function FeaturedCompanies() {
  const [companies, setCompanies] = useState([]);
  const { db } = useAuth();

  useEffect(() => {
    if (db) {
      const fetchCompanies = async () => {
        try {
          const companiesRef = collection(db, 'companies');
          // Fetch the first 10 companies for the carousel
          const q = query(companiesRef, limit(10));
          const companySnapshot = await getDocs(q);
          setCompanies(companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching featured companies:", error);
        }
      };
      fetchCompanies();
    }
  }, [db]);

  if (companies.length === 0) {
    return null; // Don't render anything if there are no companies to show
  }

  return (
    <section className="featured-companies-section">
      <h2>Companies with Recent Data</h2>
      <div className="carousel-container">
        {companies.map(company => (
          <Link href={`/companies/${company.id}`} key={company.id}>
            <a className="company-carousel-card">
              {company.logoUrl && <img src={company.logoUrl} alt={`${company.name} logo`} />}
              <h3>{company.name}</h3>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}