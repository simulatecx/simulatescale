import Head from 'next/head';
import HeroSection from '../src/components/HeroSection';
import FeaturedCompanies from '../src/components/FeaturedCompanies';
import TopDiscounts from '../src/components/TopDiscounts';

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Project Scale - Enterprise Software Discount Transparency</title>
        <meta name="description" content="Leverage crowdsourced data to find the right software and get the best price. Anonymously share and view real-world discount data." />
      </Head>
      <main>
        <HeroSection />
        <FeaturedCompanies />
        <TopDiscounts />
      </main>
    </div>
  );
}