import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { db } = useAuth();

  useEffect(() => {
    console.log("[CompanyList] Component mounted or db state changed. DB object:", db);

    if (db) {
      const fetchCompanies = async () => {
        console.log("[CompanyList] DB is available. Starting fetch...");
        setIsLoading(true);
        try {
          const companiesCollection = collection(db, 'companies');
          console.log("[CompanyList] Fetching documents from 'companies' collection...");
          const companySnapshot = await getDocs(companiesCollection);
          
          if (companySnapshot.empty) {
            console.warn("[CompanyList] Firestore query returned no documents.");
          } else {
            console.log(`[CompanyList] Firestore query returned ${companySnapshot.size} documents.`);
          }

          const companyData = companySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          console.log("[CompanyList] Fetched and mapped data:", companyData);
          setCompanies(companyData);

        } catch (error) {
          console.error("[CompanyList] Error during Firestore fetch:", error);
        } finally {
          setIsLoading(false);
          console.log("[CompanyList] Fetch finished. Loading set to false.");
        }
      };
      fetchCompanies();
    } else {
      console.log("[CompanyList] DB not yet available. Waiting...");
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
          <a className="company-list-card">
            {company.logoUrl && <img src={company.logoUrl} alt={`${company.name} logo`} />}
            <h3>{company.name}</h3>
            <p>{company.description}</p>
          </a>
        </Link>
      ))}
    </div>
  );
}