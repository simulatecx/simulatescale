import Head from 'next/head';
import { useRouter } from 'next/router';
import adminDb from '../../src/firebase/admin-config';
import Navbar from '../../src/components/Navbar';
import DiscountTable from '../../src/components/DiscountTable';
import DiscountForm from '../../src/components/DiscountForm';
import Footer from '../../src/components/Footer';

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const docRef = adminDb.collection('companies').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return { notFound: true };
    }

    const companyData = { id: docSnap.id, ...docSnap.data() };
    return {
      props: {
        company: JSON.parse(JSON.stringify(companyData)),
      },
    };
  } catch (error) {
    console.error("Error in getServerSideProps for [id].js:", error);
    return { notFound: true };
  }
}

export default function CompanyPage({ company }) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Head>
        <title>{company.name} Discounts | Project Scale</title>
        <meta name="description" content={`View real-world discount data for ${company.name} and learn how to negotiate a better deal.`} />
      </Head>
      <Navbar />
      <main className="company-page-container">
        <header className="company-header">
          {company.logoUrl && <img src={company.logoUrl} alt={`${company.name} logo`} className="company-logo" />}
          <div>
            <h1>{company.name}</h1>
            <p>{company.description}</p>
          </div>
        </header>
        
        <div className="company-content-grid">
          <section className="discount-data-section">
            <h2>Crowdsourced Discount Data</h2>
            <DiscountTable companyId={company.id} />
          </section>
          
          <aside className="add-discount-section">
            <DiscountForm companyId={company.id} />
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}