// pages/companies/index.js

import { useState, useEffect, useMemo } from 'react';
import { db } from '../../src/firebase/admin-config';
import CompanyList from '../../src/components/CompanyList';
import CompanyFilters from '../../src/components/CompanyFilters';
import Head from 'next/head';

function CompaniesPage({ companies }) {
  const [allCompanies, setAllCompanies] = useState(companies);
  const [filteredCompanies, setFilteredCompanies] = useState(companies);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name-asc');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // useMemo will re-calculate the list only when its dependencies change
  const sortedAndFilteredCompanies = useMemo(() => {
    let result = allCompanies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(company => { // <-- ADD THIS NEW FILTER BLOCK
      if (selectedCategory === 'all') return true;
      return company.category === selectedCategory;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'score-desc':
          return b.avgVendorScore - a.avgVendorScore;
        case 'discount-desc':
          return b.avgDiscount - a.avgDiscount;
        case 'name-asc':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [allCompanies, searchTerm, sortBy, selectedCategory]);

  return (
    <>
      <Head>
        <title>All Companies | SimulateScale</title>
        <meta name="description" content="Browse and compare enterprise software discounts and vendor scores." />
      </Head>
      <div className="container">
        <h1>All Companies</h1>
        <p>Browse our full list of companies to find discount data and vendor insights.</p>
        <CompanyFilters
          onSearch={setSearchTerm}
          onSort={setSortBy}
        />
        <CompanyList companies={sortedAndFilteredCompanies} />
      </div>
    </>
  );
}

// Fetch and process all company and discount data on the server
export async function getServerSideProps() {
  const companiesSnapshot = await db.collection('companies').get();
  const companies = companiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const discountsSnapshot = await db.collection('discounts').where('status', '==', 'verified').get();
  const discounts = discountsSnapshot.docs.map(doc => doc.data());

  // Create a map to aggregate discount data for each company
  const companyDataMap = {};
  companies.forEach(c => {
    companyDataMap[c.name] = {
      discounts: [],
      scores: [],
    };
  });

  discounts.forEach(d => {
    if (companyDataMap[d.companyName]) {
      companyDataMap[d.companyName].discounts.push(d.discountPercentage);
      if (d.vendorScore) {
        companyDataMap[d.companyName].scores.push(d.vendorScore);
      }
    }
  });
  
  // Calculate averages and merge back into the main company list
  const companiesWithStats = companies.map(company => {
    const data = companyDataMap[company.name];
    const avgDiscount = data.discounts.length > 0
      ? Math.ceil(data.discounts.reduce((a, b) => a + b, 0) / data.discounts.length)
      : 0;
    const avgVendorScore = data.scores.length > 0
      ? (data.scores.reduce((a, b) => a + b, 0) / data.scores.length).toFixed(1)
      : 0;
    
    return {
      ...company,
      avgDiscount,
      avgVendorScore,
    };
  });

  return {
    props: {
      companies: JSON.parse(JSON.stringify(companiesWithStats)),
    },
  };
}

export default CompaniesPage;