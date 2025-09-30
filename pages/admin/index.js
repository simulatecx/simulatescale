// pages/admin/index.js

import { useState, useEffect } from 'react';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'next/router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../src/firebase/config'; // For CLIENT-SIDE actions
import { admin, db as adminDb } from '../../src/firebase/admin-config'; // For SERVER-SIDE fetching

// --- REPORTING SUB-COMPONENTS ---
const StatCard = ({ title, value }) => (
  <div className="stat-card">
    <p className="stat-title">{title}</p>
    <p className="stat-value">{value}</p>
  </div>
);

const ProductReport = ({ productsWithSubs, productsWithoutSubs }) => (
    <div className="report-section">
        <h3>Product Submission Report</h3>
        <div className="product-report-columns">
            <div className="product-column">
                <h4>Products WITH Submissions ({productsWithSubs.length})</h4>
                <ul>
                    {productsWithSubs.map(p => <li key={p}>{p}</li>)}
                </ul>
            </div>
            <div className="product-column">
                <h4>Products WITHOUT Submissions ({productsWithoutSubs.length})</h4>
                <ul>
                    {productsWithoutSubs.map(p => <li key={p.id}>{p.name}</li>)}
                </ul>
            </div>
        </div>
    </div>
);

// --- MAIN ADMIN PAGE COMPONENT ---
const AdminPage = ({ users, allCompanies, initialPending }) => {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(initialPending);
  const [filteredPending, setFilteredPending] = useState(initialPending);
  const [selectedProduct, setSelectedProduct] = useState('all');

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, loading, isAdmin, router]);

  useEffect(() => {
    if (selectedProduct === 'all') {
      setFilteredPending(pending);
    } else {
      setFilteredPending(pending.filter(p => p.companyName === selectedProduct));
    }
  }, [selectedProduct, pending]);

  const handleApprove = async (id) => {
    const docRef = doc(db, 'discounts', id);
    await updateDoc(docRef, { status: 'verified' });
    setPending(pending.filter(p => p.id !== id));
  };

  const handleReject = async (id) => {
    const docRef = doc(db, 'discounts', id);
    await updateDoc(docRef, { status: 'rejected' });
    setPending(pending.filter(p => p.id !== id));
  };

  if (loading || !isAdmin) {
    return <div className="container"><p>Loading or redirecting...</p></div>;
  }
  
  const totalUsers = users.length;
  const productsWithSubmissions = [...new Set(initialPending.map(p => p.companyName))];
  const productsWithoutSubmissions = allCompanies.filter(c => !productsWithSubmissions.includes(c.name));

  return (
    <div className="admin-page-container">
      <h1>Admin Dashboard</h1>
      <div className="stats-grid">
        <StatCard title="Total Users" value={totalUsers} />
        <StatCard title="Pending Submissions" value={pending.length} />
        <StatCard title="Products w/ Submissions" value={productsWithSubmissions.length} />
        <StatCard title="Products to Prospect" value={productsWithoutSubmissions.length} />
      </div>
      <ProductReport productsWithSubs={productsWithSubmissions} productsWithoutSubs={productsWithoutSubmissions} />
      <div className="pending-section">
        <h2>Pending Submissions ({filteredPending.length})</h2>
        <div className="filter-container">
            <label htmlFor="product-filter">Filter by Product: </label>
            <select id="product-filter" value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
                <option value="all">All Products</option>
                {productsWithSubmissions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
        </div>
        <div className="pending-list">
          {filteredPending.map(p => {
            const submittingUser = users.find(u => u.uid === p.userId);
            return (
              <div key={p.id} className="pending-card">
                <h3>{p.companyName} - {p.discountPercentage}% Discount</h3>
                <div className="user-details">
                    <p><strong>User Email:</strong> {submittingUser?.email || 'N/A'}</p>
                    <p><strong>User ID:</strong> {p.userId}</p>
                    <p><strong>Account Created:</strong> {submittingUser ? new Date(submittingUser.creationTime).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="actions">
                  <button onClick={() => handleApprove(p.id)} className="approve-btn">Approve</button>
                  <button onClick={() => handleReject(p.id)} className="reject-btn">Reject</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context) {
    try {
        const userRecords = await admin.auth().listUsers(1000);
        const users = userRecords.users.map(u => ({
            uid: u.uid,
            email: u.email,
            creationTime: u.metadata.creationTime,
        }));
        const companiesSnapshot = await adminDb.collection('companies').get();
        const allCompanies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pendingSnapshot = await adminDb.collection('discounts').where('status', '==', 'pending').get();
        const initialPending = pendingSnapshot.docs.map(doc => {
            const data = doc.data();
            return { ...data, id: doc.id, createdAt: data.createdAt.toDate().toISOString() }
        });
        return {
            props: {
                users: JSON.parse(JSON.stringify(users)),
                allCompanies: JSON.parse(JSON.stringify(allCompanies)),
                initialPending: JSON.parse(JSON.stringify(initialPending)),
            }
        }
    } catch (error) {
        console.error("Error in admin getServerSideProps: ", error);
        return { props: { users: [], allCompanies: [], initialPending: [] } };
    }
}

export default AdminPage;