import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
// CORRECTED PATH: From 'src/components', we go up one level to 'src/' then into 'firebase/'
import { db } from '../firebase/config';

export default function HeroSection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);
    const router = useRouter();
    const searchContainerRef = useRef(null);

    useEffect(() => {
        // Debounced fetch for suggestions
        if (searchQuery.trim().length < 2) {
            setSuggestions([]);
            setSuggestionsVisible(false);
            return;
        }

        const fetchSuggestions = async () => {
            // Ensure db is valid before querying
            if (!db) {
                console.error("Firestore db object is not available.");
                return;
            }
            const companiesRef = collection(db, 'companies');
            const q = query(
                companiesRef,
                where('name', '>=', searchQuery),
                where('name', '<=', searchQuery + '\uf8ff'),
                limit(5)
            );
            
            const querySnapshot = await getDocs(q);
            const fetchedSuggestions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            setSuggestions(fetchedSuggestions);
            setSuggestionsVisible(fetchedSuggestions.length > 0);
        };

        const debounceTimer = setTimeout(() => {
            fetchSuggestions();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    useEffect(() => {
        // Effect to close suggestions when clicking outside
        const handleClickOutside = (event) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
                setSuggestionsVisible(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };
    
    const handleSuggestionClick = (suggestionName) => {
        setSearchQuery(suggestionName);
        setSuggestionsVisible(false);
        router.push(`/search?q=${encodeURIComponent(suggestionName)}`);
    };

    return (
        <section className="hero-section g2-style">
            <div className="hero-content">
                <h1>Find the Right Software. Get the Best Price.</h1>
                <p>Leverage crowdsourced data to make smarter software purchasing decisions.</p>
                <form className="hero-search-form" onSubmit={handleSearch} ref={searchContainerRef}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSuggestionsVisible(suggestions.length > 0)}
                        placeholder="Search for a company (e.g., Salesforce, Microsoft...)"
                        aria-label="Search for a company"
                        autoComplete="off"
                    />
                    <button type="submit">Search</button>
                    
                    {isSuggestionsVisible && suggestions.length > 0 && (
                        <ul className="suggestions-list">
                            {suggestions.map((company) => (
                                <li key={company.id} onMouseDown={() => handleSuggestionClick(company.name)}>
                                    {company.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </form>
            </div>
        </section>
    );
}