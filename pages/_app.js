// Import all global stylesheets here
import '../src/index.css';
import '../src/App.css';
import '../src/components/Navbar.css';
import '../src/components/HeroSection.css';
import '../src/components/DataSummary.css';
import '../src/components/CompanyList.css';
import '../src/components/DiscountForm.css';
import '../src/components/DiscountTable.css';
import '../src/components/Footer.css';
import '../src/pages/AuthPage.css';
import '../src/pages/CompaniesPage.css';
import '../src/pages/CompanyPage.css';
import '../src/components/FeaturedCompanies.css'; 
import '../src/components/TopDiscounts.css'; 

import { AuthContextProvider } from '../src/context/AuthContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <Component {...pageProps} />
    </AuthContextProvider>
  );
}

export default MyApp;