import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Cookie, Settings, BarChart3 } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cookie Policy</h1>
          <p className="text-sm text-slate-500 mt-1">What we store and why.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Cookie className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-slate-900">What We Use</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fiscal Flow uses browser localStorage, not traditional cookies, to store your data. This means the information stays on your device and is not sent to our servers with every request.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">What We Store Locally</h2>
            </div>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li><strong>fiscalflow_jwt</strong> — Your authentication token (logged-in users only)</li>
              <li><strong>fiscalflow_user</strong> — Your user profile data (username, email)</li>
              <li><strong>fiscalflow_guest_data_v2</strong> — Your transactions when using guest mode</li>
            </ul>
            <p className="text-sm text-slate-600 mt-3">
              These are essential for the app to function. Without them, you would need to log in again on every page load and your guest data would be lost.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">No Tracking Cookies</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              We do not use any analytics cookies, advertising cookies, or third-party tracking scripts. We have no interest in tracking you across the web. The only data stored is what's necessary for the app to work.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">How to Clear Your Data</h2>
            <ul className="text-sm text-slate-600 space-y-2 list-disc list-inside">
              <li><strong>Logged in:</strong> Use the logout button, which clears your token and local session</li>
              <li><strong>Guest mode:</strong> Clear your browser's localStorage via Settings → Clear browsing data</li>
              <li><strong>All data:</strong> Clear site data from your browser's developer tools (Application → Storage)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
