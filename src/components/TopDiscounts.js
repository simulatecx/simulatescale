import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function TopDiscounts() {
  const [discounts, setDiscounts] = useState([]);
  const { db } = useAuth();

  useEffect(() => {
    if (db) {
      const fetchDiscounts = async () => {
        try {
          const discountsRef = collection(db, 'discounts');
          // Fetch the top 5 deals, ordered by the discount amount
          const q = query(discountsRef, orderBy('amount', 'desc'), limit(5));
          const discountSnapshot = await getDocs(q);
          setDiscounts(discountSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching top discounts:", error);
        }
      };
      fetchDiscounts();
    }
  }, [db]);

  if (discounts.length === 0) {
    return null;
  }

  return (
    <section className="top-discounts-section">
      <h2>Recently Submitted Top Discounts</h2>
      <div className="discounts-grid">
        {discounts.map(deal => (
          <Link href={`/companies/${deal.companyId}`} key={deal.id}>
            <a className="discount-card">
              <div className="discount-value">{deal.amount}%</div>
              <div className="discount-company">{deal.companyName}</div>
              <div className="discount-meta">for {deal.licenses} licenses</div>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
}