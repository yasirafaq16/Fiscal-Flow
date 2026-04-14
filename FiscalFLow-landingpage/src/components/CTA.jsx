  import React from 'react'
  import { useNavigate } from 'react-router-dom'
  const CTA = () => {
    const navigate = useNavigate()
    return (
<section className="py-20 bg-gray-900 text-white max-w-full mx-4 md:mx-8 lg:mx-12 rounded-[2.5rem] my-12 overflow-hidden relative">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gray-800 rounded-full mix-blend-overlay filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gray-700 rounded-full mix-blend-overlay filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            Join over 50,000+ users who have already simplified their financial lives with Fiscal Flow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-white text-white-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100  hover:text-blue-700 transition-colors shadow-lg"
            >
              Get Started Now
            </button>
            <button className="bg-transparent border border-gray-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800  hover:text-blue-700 transition-colors">
              Contact Sales
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">No credit card required. Cancel anytime.</p>
        </div>
      </section>
    );
  };
  export default CTA;