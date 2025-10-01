// pages/_app.js

// Import all global stylesheets here
import '../src/index.css';
import '../src/App.css';
import '../src/components/Navbar.css';
import '../src/components/HeroSection.css';
import '../src/components/DataSummary.css';
import '../src/components/DiscountForm.css';
import '../src/components/DiscountTable.css';
import '../src/components/Footer.css';
import '../src/pages/AuthPage.css';
import '../src/pages/AdminPage.css';
import '../src/components/FeaturedCompanies.css'; 
import '../src/components/TopDiscounts.css'; 
import '../src/components/Modal.css'; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import '../src/components/Layout.css';
import '../src/components/VendorScoreDetails.css'
import '../src/pages/ProfilePage.css';
import '../src/pages/CompanyPage.css';
import '../src/pages/CompaniesPage.css';
import '../src/components/CompanyCard.css';
import '../src/components/CategoryBrowser.css';
import '../src/components/SearchBar.css';

// Import the component with its correct, exported name
import { AuthContextProvider } from '../src/context/AuthContext';
import { UIProvider, useUI } from '../src/context/UIContext';
import Modal from '../src/components/Modal';
import DiscountForm from '../src/components/DiscountForm';
import Layout from '../src/components/Layout'; // <-- Import the Layout component

function GlobalModal() {
  const { isDiscountModalOpen, closeDiscountModal } = useUI();
  return (
    <Modal isOpen={isDiscountModalOpen} onClose={closeDiscountModal}>
      <DiscountForm onSubmission={closeDiscountModal} />
    </Modal>
  );
}

function MyApp({ Component, pageProps }) {
  return (
    <AuthContextProvider>
      <UIProvider>
        <Layout> {/* The Layout component now wraps every page */}
          <Component {...pageProps} />
        </Layout>
        <GlobalModal />
      </UIProvider>
    </AuthContextProvider>
  );
}

export default MyApp;