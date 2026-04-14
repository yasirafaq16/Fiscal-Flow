import React from 'react';
import { ChevronRight, ArrowRight, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-800 mb-8 animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
          v2.0 is now live
          <ChevronRight size={14} className="text-gray-400" />
        </div> */}

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.1]">
          Master your money <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-gray-900 via-gray-700 to-gray-500">
            with Fiscal Flow.
          </span>
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed">
          The all-in-one platform to track expenses, manage investments, and plan your financial future with confidence.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-8 py-4 bg-black  text-white hover:text-blue-700 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200/50 flex items-center gap-2"
          >
            Start for free <ArrowRight size={18} />
          </button>
          <button className="px-8 py-4 bg-black text-white hover:text-blue-700 rounded-full font-medium hover:bg-gray-800 shadow-gray-200 text-lg  transition-all flex items-center gap-2">
            <Smartphone size={18} /> Download App 
          </button>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="relative mx-auto max-w-5xl">
          <div className="relative rounded-2xl bg-gray-900 p-2 shadow-2xl ring-1 ring-gray-900/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-24 w-150 h-75 bg-linear-to-r from-blue-500/20 to-purple-500/20 blur-[80px] rounded-full -z-10"></div>
            <div className="rounded-xl bg-white overflow-hidden border border-gray-200">
               {/* Mockup Header */}
               <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
                 <div className="w-3 h-3 rounded-full bg-red-400"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                 <div className="w-3 h-3 rounded-full bg-green-400"></div>
               </div>
               {/* Mockup Content */}
               <div className="grid grid-cols-12 gap-0 h-125 overflow-hidden">
                  {/* Sidebar */}
                  <div className="hidden md:block col-span-2 bg-gray-50 border-r border-gray-100 p-4 space-y-4">
                     <div className="h-8 w-24 bg-gray-200 rounded animate-pulse mb-6"></div>
                     <div className="space-y-3">
                       <div className="h-4 w-full bg-gray-200 rounded opacity-60"></div>
                       <div className="h-4 w-3/4 bg-gray-200 rounded opacity-60"></div>
                       <div className="h-4 w-5/6 bg-gray-200 rounded opacity-60"></div>
                     </div>
                  </div>
                  {/* Main */}
                  <div className="col-span-12 md:col-span-10 p-8 bg-white">
                     <div className="flex justify-between items-end mb-8">
                       <div>
                         <div className="text-sm text-gray-400 font-medium mb-1">Total Balance</div>
                         <div className="text-4xl font-bold text-gray-900">$124,500.00</div>
                       </div>
                       <div className="flex gap-2">
                         <div className="h-8 w-8 bg-gray-100 rounded-full"></div>
                         <div className="h-8 w-8 bg-black rounded-full text-white flex items-center justify-center text-xs">+</div>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-6 mb-8">
                       <div className="p-4 rounded-xl border border-gray-100 shadow-sm">
                         <div className="text-sm text-gray-400 mb-2">Income</div>
                         <div className="text-xl font-semibold text-green-600">+$8,240</div>
                       </div>
                       <div className="p-4 rounded-xl border border-gray-100 shadow-sm">
                         <div className="text-sm text-gray-400 mb-2">Expenses</div>
                         <div className="text-xl font-semibold text-red-500">-$3,402</div>
                       </div>
                       <div className="p-4 rounded-xl border border-gray-100 shadow-sm">
                         <div className="text-sm text-gray-400 mb-2">Investments</div>
                         <div className="text-xl font-semibold text-blue-600">+$1,200</div>
                       </div>
                     </div>

                     {/* Chart Placeholder */}
                     <div className="h-48 w-full bg-gray-50 rounded-xl border border-gray-100 flex items-end justify-between px-4 pb-0 overflow-hidden gap-2">
                       {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((h, i) => (
                         <div key={i} style={{ height: `${h}%` }} className="w-full bg-gray-900/5 rounded-t-md hover:bg-gray-900/10 transition-colors"></div>
                       ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
export default Hero;