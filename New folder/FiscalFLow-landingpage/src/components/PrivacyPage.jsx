import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Database, Eye, UserCheck, Trash2 } from 'lucide-react'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mt-1">How we handle your personal data.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">What We Collect</h2>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li><strong>Account info:</strong> Username, email address, and hashed password</li>
              <li><strong>Financial data:</strong> Transaction labels, amounts, categories, dates, and types you enter</li>
              <li><strong>Profile preferences:</strong> Target savings rate, risk tolerance, and financial goals</li>
            </ul>
            <p className="text-sm text-slate-600 mt-3">We do not collect browsing history, location data, or device information.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">How We Use Your Data</h2>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>To display your transactions and generate financial insights</li>
              <li>To authenticate you and protect your account</li>
              <li>To calculate savings rates, expense ratios, and AI recommendations</li>
            </ul>
            <p className="text-sm text-slate-600 mt-3">Your data is never used for advertising or sold to third parties.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Your Rights</h2>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>You can view all your stored data at any time via the dashboard</li>
              <li>You can delete individual transactions or your entire account</li>
              <li>Guest mode data stays on your device and is never sent to our servers</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-900">Data Retention</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your data is retained as long as your account is active. If you wish to delete your data, you can remove transactions from the dashboard or contact us to permanently delete your account and all associated records.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
