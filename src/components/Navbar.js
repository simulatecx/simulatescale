import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuthContext } from '../context/AuthContext'; // Corrected import name

// styles
import './Navbar.css';

export default function Navbar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const { user } = useAuthContext(); // Corrected hook name
  const navigate = useNavigate();
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (searchTerm.trim() === '') {
        setSearchResults([]);
        setShowResults(false);
        return;
      }

      const searchTermLower = searchTerm.toLowerCase();
      const companiesRef = collection(db, 'companies');
      const q = query(
        companiesRef,
        where('companyNameLower', '>=', searchTermLower),
        where('companyNameLower', '<=', searchTermLower + '\uf8ff'),
        orderBy('companyNameLower'),
        limit(5)
      );

      try {
        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSearchResults(results);
        setShowResults(true);
      } catch (error) {
        console.error("Error searching companies:", error);
      }
    };

    const debounceTimeout = setTimeout(() => {
      fetchResults();
    }, 300); // Debounce API calls

    return () => clearTimeout(debounceTimeout);
  }, [searchTerm]);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful. AuthContext will handle state update.
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  const handleResultClick = (id) => {
    setSearchTerm('');
    setShowResults(false);
    navigate(`/company/${id}`);
  };

  return (
    <nav className="navbar">
      <ul>
        <li className="logo">
          <Link to="/">
            <span>SimulateScale</span>
          </Link>
        </li>

        <li className="search-container" ref={searchContainerRef}>
          <input
            type="text"
            className="search-input"
            placeholder="Search for a company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {showResults && searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((company) => (
                <li key={company.id} onClick={() => handleResultClick(company.id)}>
                  {company.companyName}
                </li>
              ))}
            </ul>
          )}
        </li>

        {!user && (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </>
        )}

        {user && (
          <>
            <li>Hello, {user.email}</li>
            <li>
              <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
