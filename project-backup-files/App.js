import { Routes, Route } from 'react-router-dom';

// pages & components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyPage from './pages/CompanyPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    // The <Router> component has been removed from this file.
    // It is already provided in your src/index.js file.
    <div className="App">
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/company/:id" element={<CompanyPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;

