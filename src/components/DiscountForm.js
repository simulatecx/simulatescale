import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function DiscountForm({ companyId }) {
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('Annual');
  const [date, setDate] = useState('');
  const { user, db } = useAuth(); // Get user and db from context

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to submit data.");
    if (!db) return alert("Database service is not available.");

    try {
      await addDoc(collection(db, 'companies', companyId, 'discounts'), {
        amount: Number(amount),
        term,
        date,
        submittedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setAmount('');
      setTerm('Annual');
      setDate('');
      alert("Discount data submitted successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to submit discount data.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="discount-form">
      <h3>Share a Discount</h3>
      <div className="form-group">
        <label htmlFor="amount">Discount Amount (%)</label>
        <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" max="100" />
      </div>
      <div className="form-group">
        <label htmlFor="term">Contract Term</label>
        <select id="term" value={term} onChange={(e) => setTerm(e.target.value)}>
          <option value="Annual">Annual</option>
          <option value="Multi-Year">Multi-Year</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="date">Date of Deal</label>
        <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <button type="submit" disabled={!user}>Submit Anonymously</button>
      {!user && <p className="auth-prompt">Please log in to submit data.</p>}
    </form>
  );
}