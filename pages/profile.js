import React from 'react';
import Head from 'next/head';
import { useAuth } from '../src/context/AuthContext';
import { admin, db } from '../src/firebase/admin-config';
import nookies from 'nookies';
import CompanyCard from '../src/components/CompanyCard';

const ProfilePage = ({ submissions, userData }) => { 
  const { user } = useAuth();

  return (
    <>
      <Head>
        <title>My Profile - SimulateScale</title>
      </Head>
      <div className="profile-page">
        <aside className="profile-sidebar">
          <div className="user-info">
            <div className="user-avatar">{user ? user.email.charAt(0).toUpperCase() : ''}</div>
            <h2 className="user-name">{userData.name || user.email}</h2>
            <p className="user-tier">Tier: {userData.tier}</p>
          </div>
          <nav className="profile-nav">
            <ul>
              <li className="active"><a href="/profile">My Submissions</a></li>
              <li><a href="#">Account Settings</a></li>
              <li><a href="#">Saved Companies</a></li>
            </ul>
          </nav>
        </aside>
        <main className="profile-content">
          <h1 className="content-title">My Submissions ({submissions.length})</h1>
          <p className="content-description">
            Thank you for your contribution to the community!
          </p>
          <div className="submissions-grid">
            {submissions.length > 0 ? (
              submissions.map(item => (
                <CompanyCard 
                  key={item.submission.id} 
                  company={item.company} 
                  userSubmission={item.submission} 
                />
              ))
            ) : (
              <p>You haven't submitted any discounts yet.</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export async function getServerSideProps(context) {
  try {
    const cookies = nookies.get(context);
    const token = await admin.auth().verifySessionCookie(cookies.token, true);
    const { uid } = token;

    // 1. Fetch user data
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // 2. Fetch the user's specific submissions
    const userDiscountsSnapshot = await db.collection('discounts').where('userId', '==', uid).get();
    const userSubmissions = userDiscountsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (userSubmissions.length === 0) {
      return { props: { submissions: [], userData: JSON.parse(JSON.stringify(userData)) } };
    }

    // --- THE FIX IS HERE: We now calculate the overall scores ---

    // 3. Fetch ALL companies and ALL discounts to perform calculations
    const allCompaniesSnapshot = await db.collection('companies').get();
    const baseCompanies = allCompaniesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const allDiscountsSnapshot = await db.collection('discounts').get();
    const allDiscounts = allDiscountsSnapshot.docs.map(doc => doc.data());

    // 4. Pre-calculate the aggregate data for every company
    const calculatedCompanyData = baseCompanies.map(company => {
      const companyDiscounts = allDiscounts.filter(d => d.companyName === company.name);
      
      let totalDiscount = 0, totalVendorScore = 0, vendorScoreCount = 0;
      const ratingKeys = ['salesProcessRating', 'understandingOfNeedsRating', 'negotiationTransparencyRating', 'implementationRating', 'trainingRating', 'productPromiseRating', 'supportQualityRating', 'successManagementRating', 'communicationRating', 'overallValueRating'];

      companyDiscounts.forEach(discount => {
        totalDiscount += discount.discountPercentage || 0;
        if (discount.ratings) {
          ratingKeys.forEach(key => {
            if (typeof discount.ratings[key] === 'number') {
              totalVendorScore += discount.ratings[key];
              vendorScoreCount++;
            }
          });
        }
      });

      const averageDiscount = companyDiscounts.length > 0 ? Math.round(totalDiscount / companyDiscounts.length) : 0;
      const totalSubmissions = companyDiscounts.length;
      const averageRawScore = vendorScoreCount > 0 ? totalVendorScore / vendorScoreCount : 0;
      const vendorScore = parseFloat((averageRawScore / 2).toFixed(1));

      return { ...company, averageDiscount, totalSubmissions, vendorScore };
    });

    // 5. Combine the user's submissions with the fully calculated company data
    const submissions = userSubmissions.map(submission => {
      const companyData = calculatedCompanyData.find(c => c.name === submission.companyName) || null;
      return { submission, company: companyData };
    }).filter(item => item.company !== null);

    return {
      props: {
        submissions: JSON.parse(JSON.stringify(submissions)),
        userData: JSON.parse(JSON.stringify(userData)),
      },
    };

  } catch (err) {
    console.error("Auth error/redirect in profile getServerSideProps:", err.message);
    return {
      redirect: {
        destination: '/auth',
        permanent: false,
      },
    };
  }
}

export default ProfilePage;