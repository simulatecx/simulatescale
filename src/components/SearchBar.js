import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// THE FIX IS HERE: We are now importing 'db' which is what client.js actually exports.
import { db } from '../firebase/client'; 
import { collection, getDocs } from 'firebase/firestore';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      // We now use the correctly imported 'db' object.
      const companiesCollection = collection(db, 'companies');
      const companySnapshot = await getDocs(companiesCollection);
      const companyList = companySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name
      }));
      setAllCompanies(companyList);
    };

    fetchCompanies();
  }, []);

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    if (newQuery.length > 1) {
      const filtered = allCompanies.filter(company =>
        company.name.toLowerCase().includes(newQuery.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const handleResultClick = (companyId) => {
    router.push(`/companies/${companyId}`);
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search for a company..."
        className="search-input"
      />
      {results.length > 0 && (
        <ul className="search-results">
          {results.map(company => (
            <li
              key={company.id}
              onClick={() => handleResultClick(company.id)}
              className="search-result-item"
            >
              {company.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;