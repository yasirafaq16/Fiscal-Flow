import React, { useState } from "react";
import { motion } from "framer-motion";

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Basic",
      price: "₹49",
      duration: "per month",
      features: ["Expense Tracking", "Basic Analytics", "Email Support"],
    },
    {
      name: "Standard",
      price: "₹99",
      duration: "3 months",
      popular: true,
      features: [
        "Everything in Basic",
        "Investment Tracking",
        "Advanced Reports",
        "Priority Support",
      ],
    },
    {
      name: "Premium",
      price: "₹149",
      duration: "6 months",
      features: [
        "Everything in Standard",
        "Multi-Currency",
        "Custom Reports",
        "24/7 Support",
      ],
    },
  ];

  const handlePayment = (plan) => {
    setSelectedPlan(plan.name);
    setTimeout(() => {
      alert(`✅ Payment Successful for ${plan.name} Plan!`);
      setSelectedPlan(null);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4">
          Simple Pricing
        </h1>
        <p className="text-gray-500 mb-12">
          Choose a plan that fits your financial journey
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className={`relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 ${
                plan.popular ? "border-2 border-indigo-500 scale-105" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {plan.name}
              </h2>

              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <p className="text-gray-500">{plan.duration}</p>
              </div>

              <ul className="space-y-3 text-gray-600 mb-6 text-left">
                {plan.features.map((f, i) => (
                  <li key={i}>✔ {f}</li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment(plan)}
                disabled={selectedPlan === plan.name}
                className={`w-full py-2 rounded-lg font-medium transition ${
                  selectedPlan === plan.name
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {selectedPlan === plan.name ? "Processing..." : "Pay Now"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}