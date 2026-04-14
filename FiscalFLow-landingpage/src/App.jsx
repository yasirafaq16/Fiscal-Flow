import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
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

function App() {
  const [count, setCount] = useState(0)
  // <Navbar />
  //      <Hero />
  //      <Features />
  //      <ContentBlock />
  //      <CTA />
  //      <Footer />
    //  <Dashboard/>
    //  <LoginPage/>
    //  <RegisterPage/>
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
