import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, isAuthenticated } from '../auth/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const authed = isAuthenticated();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLoginPage = location.pathname === '/login';

  const handleLogout = () => {
    clearToken();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
            <span className="font-bold text-xl tracking-tight text-gray-900">Fiscal Flow</span>
          </Link>

          {/* Desktop Menu */}
          {!isAuthPage && (
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-black font-medium transition-colors">Features</a>
              <a href="#testimonials" className="text-gray-600 hover:text-black font-medium transition-colors">Testimonials</a>
              <a href="#pricing" className="text-gray-600 hover:text-black font-medium transition-colors">Pricing</a>
              <a href="#about" className="text-gray-600 hover:text-black font-medium transition-colors">About</a>
            </div>
          )}

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {authed ? (
              <button
                type="button"
                onClick={handleLogout}
                className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md inline-block text-center"
              >
                Logout
              </button>
            ) : (
              <>
                {!isLoginPage && (
                  <Link 
                    to="/login" 
                    className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md inline-block text-center"
                  >
                    Log in
                  </Link>
                )}
                
                <Link 
                  to="/dashboard" 
                  className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md inline-block text-center"
                >
                  {isLoginPage ? 'Register Now' : 'Get Started'}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 p-2 focus:outline-none">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {!isAuthPage && (
              <>
                <a href="#features" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Features</a>
                <a href="#testimonials" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Testimonials</a>
                <a href="#pricing" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">Pricing</a>
                <a href="#about" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-700">About</a>
              </>
            )}
            
            <div className="mt-4 flex flex-col gap-3">
              {authed ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    handleLogout()
                  }}
                  className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md text-center"
                >
                  Logout
                </button>
              ) : (
                <>
                  {!isLoginPage && (
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)} 
                      className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md text-center"
                    >
                      Log in
                    </Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsOpen(false)} 
                    className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-md text-center"
                  >
                    {isLoginPage ? 'Register Now' : 'Get Started'}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;