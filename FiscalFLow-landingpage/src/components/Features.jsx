import React from 'react';
import { 
  PieChart, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe, 
  LayoutDashboard 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <PieChart size={24} className="text-white" />,
      title: "Smart Budgeting",
      desc: "Set budgets that automatically adjust based on your spending habits."
    },
    {
      icon: <TrendingUp size={24} className="text-white" />,
      title: "Investment Tracking",
      desc: "Monitor all your stocks, crypto, and assets in one unified dashboard."
    },
    {
      icon: <Shield size={24} className="text-white" />,
      title: "Bank-Grade Security",
      desc: "Your data is encrypted with 256-bit SSL technology. Safe and private."
    },
    {
      icon: <Zap size={24} className="text-white" />,
      title: "Instant Alerts",
      desc: "Get notified immediately about unusual charges or bill due dates."
    },
    {
      icon: <Globe size={24} className="text-white" />,
      title: "Multi-Currency",
      desc: "Perfect for travelers. Auto-convert transactions to your home currency."
    },
    {
      icon: <LayoutDashboard size={24} className="text-white" />,
      title: "Custom Reports",
      desc: "Export detailed PDF reports for tax season or personal archiving."
    }
  ];

  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-base font-semibold text-gray-500 tracking-wide uppercase mb-2">Why Fiscal Flow?</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to grow your wealth.</h3>
          <p className="text-lg text-gray-500">
            Stop using spreadsheets. Upgrade to a modern platform designed for the new economy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-gray-900/20 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Features;