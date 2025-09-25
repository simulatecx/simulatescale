// src/pages/CompanyPage.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import DiscountForm from '../components/DiscountForm';
import DiscountTable from '../components/DiscountTable';
import DataSummary from '../components/DataSummary'; // 1. Import new component
import './CompanyPage.css';

const CompanyPage = () => {
  const { companyId } = useParams();
  const { currentUser } = useAuth();
  const [company, setCompany] = useState(null);
  const [discounts, setDiscounts] = useState([]); // 2. Add state for discounts
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      // Fetch company details
      const companyDocRef = doc(db, 'companies', companyId);
      const companyDocSnap = await getDoc(companyDocRef);
      if (companyDocSnap.exists()) {
        const companyData = companyDocSnap.data();
        setCompany(companyData);

        // Fetch discounts only if a user is logged in
        if (currentUser) {
          const discountsRef = collection(db, 'discounts');
          const q = query(
            discountsRef,
            where("companyName", "==", companyData.name),
            orderBy("submittedAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedDiscounts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setDiscounts(fetchedDiscounts);
        }
      } else {
        console.log("No such company document!");
      }
      setLoading(false);
    };
    fetchAllData();
  }, [companyId, currentUser]); // Rerun when user logs in/out

  if (loading) {
    return (
      <div>
        <Navbar />
        <p className="loading-text">Loading...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div>
        <Navbar />
        <p className="loading-text">Company not found.</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="company-header">
        <img src={company.logoUrl} alt={`${company.name} logo`} className="company-header-logo" />
        <div className="company-header-info">
          <h1>{company.name}</h1>
          <p>{company.description}</p>
        </div>
      </div>

      {currentUser ? (
        <>
          <DataSummary discounts={discounts} /> {/* 3. Add Summary component */}
          <DiscountTable discounts={discounts} /> {/* 4. Pass discounts to Table */}
        </>
      ) : (
        <div className="login-prompt">
          <h2>View Real-Time Discount Data</h2>
          <p>Sign in to view user-submitted discounts, price benchmarks, and more.</p>
        </div>
      )}

      <DiscountForm companyName={company.name} />
    </div>
  );
};

export default CompanyPage;