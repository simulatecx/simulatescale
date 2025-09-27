import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function DiscountTable({ companyId }) {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { db } = useAuth(); // Get db from context

  useEffect(() => {
    if (!db) return; // Wait for db to be available

    const q = query(collection(db, 'companies', companyId, 'discounts'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setDiscounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching discounts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [companyId, db]); // Rerun when db is available

  if (loading) return <p>Loading discount data...</p>;
  if (discounts.length === 0) return <p>No discount data has been shared yet. Be the first!</p>;

  return (
    <table className="discount-table">
      <thead>
        <tr>
          <th>Discount (%)</th>
          <th>Term</th>
          <th>Date of Deal</th>
        </tr>
      </thead>
      <tbody>
        {discounts.map(discount => (
          <tr key={discount.id}>
            <td>{discount.amount}%</td>
            <td>{discount.term}</td>
            <td>{discount.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}