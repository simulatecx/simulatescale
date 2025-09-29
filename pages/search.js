import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../src/firebase/config'; // Adjust this import path if needed
import Link from 'next/link';
import Navbar from '../src/components/Navbar'; // Adjust import path
import Footer from '../src/components/Footer'; // Adjust import path

const SearchResultsPage = () => {
  const router = useRouter();
  const { query: searchQuery } = router.query;
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (searchQuery) {
      const fetchResults = async () => {
        setLoading(true);
        const companiesRef = collection(db, 'companies');
        // This query is case-sensitive and looks for names starting with the search term.
        const q = query(
          companiesRef,
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );

        const querySnapshot = await getDocs(q);
        const companies = [];
        querySnapshot.forEach((doc) => {
          companies.push({ id: doc.id, ...doc.data() });
        });

        setResults(companies);
        setLoading(false);
      };

      fetchResults();
    } else {
      setLoading(false);
    }
  }, [searchQuery]);

  return (
    <div>
      <Navbar />
      <div className="container" style={{ minHeight: '80vh', paddingTop: '80px', paddingBottom: '40px' }}>
        <h1>Search Results for "{searchQuery}"</h1>
        {loading ? (
          <p>Loading...</p>
        ) : results.length > 0 ? (
          <ul className="search-results-list"> {/* Added a class for styling */}
            {results.map((company) => (
              <li key={company.id} className="search-result-item"> {/* Added a class for styling */}
                <Link href={`/companies/${company.id}`}>
                  <a>{company.name}</a>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No companies found matching your search.</p>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchResultsPage;