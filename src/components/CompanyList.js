import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { db } = useAuth();

  useEffect(() => {
    if (db) {
      const fetchCompanies = async () => {
        setIsLoading(true);
        try {
          const companiesCollection = collection(db, 'companies');
          const companySnapshot = await getDocs(companiesCollection);
          const companyData = companySnapshot.docs.map(doc => ({
            id: doc.id, ...doc.data()
          }));
          setCompanies(companyData);
        } catch (error) {
          console.error("Error fetching companies: ", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCompanies();
    }
  }, [db]);

  if (isLoading) {
    return <div className="loading-text">Loading Companies...</div>;
  }

  if (companies.length === 0) {
    return <div className="no-companies-text">No companies found in the database.</div>;
  }

  return (
    <div className="company-grid">
      {companies.map(company => (
        <Link href={`/companies/${company.id}`} key={company.id}>
          <a className="company-card">
            {company.logoUrl && <img src={company.logoUrl} alt={`${company.name} logo`} className="company-logo" />}
            <h3>{company.name}</h3>
            <p>{company.description}</p>
            <span className="view-details-button">View Details</span>
          </a>
        </Link>
      ))}
    </div>
  );
}