import Head from 'next/head';
import Navbar from '../src/components/Navbar';
import HeroSection from '../src/components/HeroSection';
import DataSummary from '../src/components/DataSummary';
import Footer from '../src/components/Footer';

export default function HomePage() {
  return (
    <div>
      <Head>
        <title>Project Scale - Enterprise Software Discount Transparency</title>
        <meta name="description" content="Anonymously share and view real-world discount data for enterprise software. Negotiate fairer deals and save on procurement." />
      </Head>
      <Navbar />
      <HeroSection />
      <DataSummary />
      <Footer />
    </div>
  );
}