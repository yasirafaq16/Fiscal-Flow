import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Navbar from './components/Navbar'
import Features from './components/Features'
import CTA from './components/CTA'
import ContentBlock from './components/Contentblock'
import Hero from './components/Hero'
import Footer from './components/Footer'  
import LoginPage from './components/login'
import RegisterPage from './components/register'
import DashboardMain from './components/DashboardMain'
import PrivateRoute from './components/PrivateRoute'
import AboutPage from './components/AboutPage'
import PricingPage from './components/Pricing'
import TestimonialsPage from './components/testimonials'
import FeaturesPage from './components/Features'
import ImportGuide from './components/ImportGuide'
import SecurityPage from './components/SecurityPage'
import UpdatesPage from './components/UpdatesPage'
import BlogPage from './components/BlogPage'
import ContactPage from './components/ContactPage'
import PrivacyPage from './components/PrivacyPage'
import TermsPage from './components/TermsPage'
import CookiesPage from './components/CookiesPage'

function App() {
  return (
    <>
  <Router>
      <div className="min-h-screen bg-white">
        {/* Navbar stays at the top of every page */}
        <Navbar />

        <main>
          <Routes>
            {/* LANDING PAGE ROUTE */}
            {/* When at "/", all these components show up */}
            <Route path="/" element={
              <div className="max-w-450 mx-auto">
                <Hero />
                <Features />
                <ContentBlock />
                <CTA />
              </div>
            } />

            {/* LOGIN ROUTE */}
            {/* When at "/login", everything above is REPLACED by this */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* REGISTER ROUTE */}
            <Route path="/register" element={<RegisterPage />} />

            {/* DASHBOARD ROUTE */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardMain /></PrivateRoute>} />

            {/* ABOUT PAGE ROUTE */}
            <Route path="/about" element={<AboutPage />} />

            {/* FEATURES PAGE ROUTE */}
            <Route path="/features" element={<FeaturesPage />} />

            {/* PRICING PAGE ROUTE */}
            <Route path="/pricing" element={<PricingPage />} />

            {/* TESTIMONIALS PAGE ROUTE */}
            <Route path="/testimonials" element={<TestimonialsPage />} />

            {/* IMPORT GUIDE ROUTE */}
            <Route path="/import-guide" element={<ImportGuide />} />

            {/* FOOTER PAGES */}
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/updates" element={<UpdatesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
          </Routes>
        </main>

        {/* Footer stays at the bottom of every page */}
        <Footer />
      </div>
    </Router>

    </>
  )
}
export default App
