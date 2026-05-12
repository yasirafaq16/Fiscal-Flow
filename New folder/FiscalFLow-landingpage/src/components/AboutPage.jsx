import React from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HERO */}
      <section className="text-center py-20 px-6">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
          About Fiscal Flow
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
          Master your money with confidence. Fiscal Flow is your all-in-one
          platform to track expenses, manage investments, and plan your
          financial future with ease.
        </p>
      </section>

      {/* MISSION & VISION */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            🎯 Our Mission
          </h2>
          <p className="text-gray-600 leading-relaxed">
            We aim to simplify financial management for everyone. No more
            spreadsheets or confusion—just smart tools that help you grow your
            wealth effortlessly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-8 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-3 text-gray-800">
            🚀 Our Vision
          </h2>
          <p className="text-gray-600 leading-relaxed">
            To become the most trusted financial platform for individuals and
            businesses worldwide by combining technology with simplicity.
          </p>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Why Choose Fiscal Flow?
          </h2>
          <p className="text-gray-500 mb-10">
            Everything you need to manage and grow your finances in one place.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Smart Budgeting",
              "Investment Tracking",
              "Bank-Grade Security",
              "Instant Alerts",
              "Multi-Currency Support",
              "Custom Reports",
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-gray-50 rounded-2xl shadow hover:shadow-lg transition"
              >
                <p className="font-semibold text-gray-700">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Trusted by 50+ Users
        </h2>
        <p className="mb-6">
          Join thousands of users who simplified their financial lives.
        </p>
        <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold shadow hover:shadow-lg">
          Get Started
        </button>
      </section>

      {/* TEAM */}
      <section className="py-12 px-6 text-center bg-gray-100">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Built By
        </h3>
        <p className="text-gray-600">
          Ravi Bhushan Kumar (2331066) &  Mohd Yasir Afaq (2331070) 
        </p>
      </section>
    </div>
  );
}