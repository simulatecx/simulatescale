import { useState } from 'react';
import { useRouter } from 'next/router';

export default function HeroSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // We will build out the search results page later.
      // For now, this will redirect to a placeholder URL.
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="hero-section g2-style">
      <div className="hero-content">
        <h1>Find the Right Software. Get the Best Price.</h1>
        <p>Leverage crowdsourced data to make smarter software purchasing decisions.</p>
        <form className="hero-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a company (e.g., Salesforce, Microsoft...)"
            aria-label="Search for a company"
          />
          <button type="submit">Search</button>
        </form>
      </div>
    </section>
  );
}