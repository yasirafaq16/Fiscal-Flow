import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Scale, AlertCircle, Shield } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
          <p className="text-sm text-slate-500 mt-1">Conditions of use and service for Fiscal Flow.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Acceptance of Terms</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              By accessing and using Fiscal Flow, you agree to be bound by these terms. If you do not agree with any part of these terms, you should not use the application. These terms apply to both registered users and guest mode users.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Use of Service</h2>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Fiscal Flow is provided for personal financial tracking and educational purposes only</li>
              <li>The AI insights are suggestions, not certified financial advice</li>
              <li>You are responsible for the accuracy of data you enter or import</li>
              <li>You must not use the service for any unlawful purpose</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">Disclaimer</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fiscal Flow is not a registered financial advisor. The insights and recommendations provided by the AI module are generated from your input data and general financial principles. Always consult a certified financial planner before making significant financial decisions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Service Availability</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              We strive to keep Fiscal Flow available at all times, but we do not guarantee uninterrupted access. Scheduled maintenance, updates, or unforeseen technical issues may temporarily affect availability. Guest mode data remains accessible offline as it is stored in your browser.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
