import Head from 'next/head';

import CompanyList from '../../src/components/CompanyList'; // Correct component for this page


export default function CompaniesPage() {
  return (
    <div>
      <Head>
        <title>Browse All Companies - Project Scale</title>
        <meta name="description" content="Find and compare enterprise software companies. View crowdsourced discount data to help your negotiation." />
      </Head>
      <main className="companies-page-container">
        <h1>All Companies</h1>
        <p>Select a company to view detailed discount information and negotiation insights.</p>
        <CompanyList />
      </main>
    </div>
  );
}