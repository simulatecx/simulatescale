import Head from 'next/head';
import Navbar from '../src/components/Navbar';
import HeroSection from '../src/components/HeroSection';
import FeaturedCompanies from '../src/components/FeaturedCompanies';
import TopDiscounts from '../src/components/TopDiscounts';
import Footer from '../src/components/Footer';

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Project Scale - Enterprise Software Discount Transparency</title>
        <meta name="description" content="Leverage crowdsourced data to find the right software and get the best price. Anonymously share and view real-world discount data." />
      </Head>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedCompanies />
        <TopDiscounts />
      </main>
      <Footer />
    </div>
  );
}