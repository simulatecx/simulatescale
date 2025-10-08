import Head from 'next/head';
import { db } from '../src/firebase/admin-config'; 
import HeroSection from '../src/components/HeroSection';
import ValueProps from '../src/components/ValueProps'; // Our new component
import CategoryBrowser from '../src/components/CategoryBrowser'; // Your existing component

// Note: I'm leaving out FeaturedCompanies for now as requested, 
// but you can easily add it back in if you wish.

const HomePage = ({ companies }) => {
  return (
    <>
      <Head>
        <title>SimulateScale - Enterprise Software Discount Transparency</title>
        <meta name="description" content="Find and share real discounts on enterprise software. Make your next software purchase with confidence." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        {/* Your existing Hero Section */}
        <HeroSection />
        {/* Your existing "Browse by Category" block */}
        <CategoryBrowser companies={companies} />
        {/* The new "Why SimulateScale?" block, placed right below the hero */}
        <ValueProps />
      </main>
    </>
  );
}

// This data-fetching function is correct and remains unchanged.
export async function getStaticProps() {
  try {
    const companiesSnapshot = await db.collection('companies').get();
    const baseCompanies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const allDiscountsSnapshot = await db.collection('discounts').get();
    const allDiscounts = allDiscountsSnapshot.docs.map(doc => doc.data());

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

    return {
      props: {
        companies: JSON.parse(JSON.stringify(companiesWithCalculatedData)),
      },
      revalidate: 3600,
    };

  } catch (error) {
    console.error("Error fetching companies for homepage:", error);
    return { props: { companies: [] } };
  }
}

export default HomePage;