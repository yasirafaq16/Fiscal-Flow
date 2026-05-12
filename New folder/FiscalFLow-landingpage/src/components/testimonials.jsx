import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Aman Sharma",
    role: "Startup Founder",
    rating: 5,
    feedback:
      "FiscalFlow helped me gain complete control over my finances. The insights are clear and actionable.",
  },
  {
    name: "Priya Kaur",
    role: "Freelancer",
    rating: 4,
    feedback:
      "Tracking expenses has never been this easy. The dashboard is clean and intuitive.",
  },
  {
    name: "Rahul Verma",
    role: "Small Business Owner",
    rating: 5,
    feedback:
      "FiscalFlow streamlined my business cash flow tracking. Highly recommended!",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-extrabold mb-4 text-gray-800">
          Loved by Our Users ❤️
        </h1>
        <p className="text-gray-500 mb-12">
          See how FiscalFlow is helping people manage their finances smarter
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative bg-white/70 backdrop-blur-lg border border-gray-200 p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition duration-300"
            >
              {/* Quote Icon */}
              <div className="text-4xl text-gray-300 absolute top-4 left-4">“</div>

              {/* Rating */}
              <div className="flex mb-4 mt-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={
                      i < t.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }
                  />
                ))}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {t.feedback}
              </p>

              {/* Divider */}
              <div className="h-px bg-gray-200 mb-4"></div>

              {/* User Info */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold">
                  {t.name.charAt(0)}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800">
                    {t.name}
                  </h3>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}