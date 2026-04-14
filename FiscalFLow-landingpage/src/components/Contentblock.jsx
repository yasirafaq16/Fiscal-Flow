import React from 'react';
import { CheckCircle2, Star, CreditCard, Smartphone } from 'lucide-react';
const ContentBlock = ({ reversed }) => {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex flex-col ${reversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16`}>
          
          {/* Text Content */}
          <div className="flex-1 space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              Visualize your cash flow like never before.
            </h3>
            <p className="text-lg text-gray-500">
              Understand exactly where your money goes. Categorize transactions automatically and identify cutting opportunities instantly.
            </p>
            
            <div className="space-y-4">
              {[
                "Automatic Bank Syncing",
                "Receipt Scanning",
                "Goal Setting & Tracking"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="text-black" size={20} />
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <button className="text-black font-bold border-b-2 border-black pb-0.5 hover:text-blue-700 hover:border-gray-700bg-black text-white px-5 py-2.5 rounded-full font-medium shadow-gray-200">
              Learn more about analytics &rarr;
            </button>
          </div>

          {/* Image/Graphic */}
          <div className="flex-1 w-full bg-gray-100 rounded-3xl p-8 lg:p-12 border border-gray-100 shadow-inner">
             <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="p-6 border-b border-gray-50">
                   <div className="flex items-center justify-between">
                      <div className="font-bold text-lg">Monthly Spending</div>
                      <div className="text-sm text-gray-400">Oct 2024</div>
                   </div>
                </div>
                <div className="p-6">
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><Star size={18} /></div>
                            <div>
                               <div className="font-semibold text-gray-900">Grocery</div>
                               <div className="text-xs text-gray-400">12 transactions</div>
                            </div>
                         </div>
                         <div className="font-bold text-gray-900">-$450.20</div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><CreditCard size={18} /></div>
                            <div>
                               <div className="font-semibold text-gray-900">Utilities</div>
                               <div className="text-xs text-gray-400">3 transactions</div>
                            </div>
                         </div>
                         <div className="font-bold text-gray-900">-$120.00</div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Smartphone size={18} /></div>
                            <div>
                               <div className="font-semibold text-gray-900">Electronics</div>
                               <div className="text-xs text-gray-400">1 transaction</div>
                            </div>
                         </div>
                         <div className="font-bold text-gray-900">-$899.00</div>
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
export default ContentBlock;