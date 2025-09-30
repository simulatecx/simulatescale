// pages/profile.js

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { db } from '../src/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import Head from 'next/head';

const ProfilePage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth');
      return;
    }

    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, 'discounts'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const userSubmissions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate().toLocaleDateString(),
        }));
        setSubmissions(userSubmissions);
      } catch (error) {
        console.error("Error fetching user submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div className="container"><p>Loading profile...</p></div>;
  }

  return (
    <>
      <Head>
        <title>My Profile | SimulateScale</title>
      </Head>
      <div className="profile-page-container">
        <h1>My Submissions</h1>
        {submissions.length > 0 ? (
          <div className="submissions-list">
            {submissions.map(sub => (
              <div key={sub.id} className="submission-card">
                <h3>{sub.companyName}</h3>
                <p><strong>Discount:</strong> {sub.discountPercentage}%</p>
                <p><strong>Vendor Score:</strong> {sub.vendorScore}/10</p>
                <p><strong>Date:</strong> {sub.createdAt}</p>
                  <div className="submission-status">
                    <span className={sub.status}>{sub.status}</span>
                    </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You have not submitted any discounts yet.</p>
        )}
      </div>
    </>
  );
};

export default ProfilePage;