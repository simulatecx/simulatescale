import Head from 'next/head';
import { db } from '../src/firebase/admin-config'; 
import HeroSection from '../src/components/HeroSection';
import FeaturedCompanies from '../src/components/FeaturedCompanies';
import CategoryBrowser from '../src/components/CategoryBrowser';

const HomePage = ({ companies }) => {
  return (
    <>
      <Head>
        <title>SimulateScale - Enterprise Software Discount Transparency</title>
        <meta name="description" content="Find and share real discounts on enterprise software. Make your next software purchase with confidence." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <HeroSection />
        <CategoryBrowser companies={companies} />
        <FeaturedCompanies />
      </main>
    </>
  );
}

export async function getStaticProps() {
  try {
    // 1. Fetch all companies
    const companiesSnapshot = await db.collection('companies').get();
    const baseCompanies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 2. Fetch all discounts
    const allDiscountsSnapshot = await db.collection('discounts').get();
    const allDiscounts = allDiscountsSnapshot.docs.map(doc => doc.data());

    // 3. Process the data with the CORRECT filtering logic
    const companiesWithCalculatedData = baseCompanies.map(company => {
      
      // THE FIX: We now filter by matching company.name with discount.companyName
      const companyDiscounts = allDiscounts.filter(discount => discount.companyName === company.name);

      // --- Calculation logic (this part was always correct) ---
      let totalDiscount = 0;
      let totalVendorScore = 0;
      let vendorScoreCount = 0;
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

    return {
      props: {
        companies: JSON.parse(JSON.stringify(companiesWithCalculatedData)),
      },
      revalidate: 3600,
    };

  } catch (error) {
    console.error("Error fetching and calculating company data for homepage:", error);
    return { props: { companies: [] } };
  }
}

export default HomePage;