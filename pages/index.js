import Head from 'next/head';
import { db } from '../src/firebase/admin-config'; 
import HeroSection from '../src/components/HeroSection';
import FeaturedCompanies from '../src/components/FeaturedCompanies';
import CategoryBrowser from '../src/components/CategoryBrowser';

const HomePage = ({ companies }) => {
  // We'll add a log here to see what data the component actually receives
  console.log('[CLIENT-SIDE] HomePage component received companies:', companies);
  
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
  console.log("\n--- [SERVER-SIDE DEBUG] Starting getStaticProps for homepage ---");
  try {
    // 1. Fetch all companies
    console.log("[SERVER-SIDE DEBUG] Step 1: Fetching documents from 'companies' collection...");
    const companiesSnapshot = await db.collection('companies').get();
    const baseCompanies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`[SERVER-SIDE DEBUG] --> Found ${baseCompanies.length} base companies.`);

    // 2. Fetch all discounts
    console.log("[SERVER-SIDE DEBUG] Step 2: Fetching documents from 'discounts' collection...");
    const allDiscountsSnapshot = await db.collection('discounts').get();
    const allDiscounts = allDiscountsSnapshot.docs.map(doc => doc.data());
    console.log(`[SERVER-SIDE DEBUG] --> Found ${allDiscounts.length} total discounts.`);

    // 3. Process the data with the CORRECT filtering logic
    const companiesWithCalculatedData = baseCompanies.map(company => {
      const companyDiscounts = allDiscounts.filter(discount => discount.companyName === company.name);
      
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
    
    console.log("[SERVER-SIDE DEBUG] Step 3: Finished calculating data. Passing to page.");

    return {
      props: {
        companies: JSON.parse(JSON.stringify(companiesWithCalculatedData)),
      },
      revalidate: 3600,
    };

  } catch (error) {
    console.error("[SERVER-SIDE DEBUG] 🔥🔥🔥 FATAL ERROR in getStaticProps:", error);
    return { props: { companies: [] } };
  }
}

export default HomePage;