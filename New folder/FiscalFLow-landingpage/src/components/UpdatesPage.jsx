import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Package, Wrench, Zap } from 'lucide-react'

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Updates</h1>
          <p className="text-sm text-slate-500 mt-1">Latest releases, new features, and improvements.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">v0.0 — Current Release</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">May 2026</p>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Excel import with SheetJS — supports .xlsx, .xls, and .csv files</li>
              <li>Robust amount parsing — handles negatives, currency symbols, and accounting parentheses</li>
              <li>AI-powered financial diagnostics with XGBoost integration</li>
              <li>Cash flow analytics with monthly trend charts</li>
              <li>Category-wise expenditure breakdown</li>
              <li>Guest mode with localStorage persistence</li>
              <li>JWT authentication with bcrypt password hashing</li>
               <li>Added financial profile and goals tracking</li>
              <li>Import guide page for Excel formatting help</li>
              <li>Improved dashboard layout and summary cards</li>
              <li>Bug fixes for date parsing inconsistencies</li>
                        <li>Core transaction management — add, view, delete</li>
              <li>Earnings, savings, and expenditure tracking</li>
              <li>User registration and login</li>
              <li>Responsive landing page</li>
              <li>MongoDB backend with Express.js REST API</li>
            </ul>
          </div>

          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">v1.5</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">April 2026</p>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Added financial profile and goals tracking</li>
              <li>Import guide page for Excel formatting help</li>
              <li>Improved dashboard layout and summary cards</li>
              <li>Bug fixes for date parsing inconsistencies</li>
            </ul>
          </div> */}

          {/* <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">v1.0 — Initial Launch</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">March 2026</p>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li>Core transaction management — add, view, delete</li>
              <li>Earnings, savings, and expenditure tracking</li>
              <li>User registration and login</li>
              <li>Responsive landing page</li>
              <li>MongoDB backend with Express.js REST API</li>
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  )
}
