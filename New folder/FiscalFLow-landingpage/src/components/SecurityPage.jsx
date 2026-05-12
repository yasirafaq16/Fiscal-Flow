import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Lock, Eye, Server } from 'lucide-react'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Security</h1>
          <p className="text-sm text-slate-500 mt-1">How we keep your financial data safe and protected.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Encrypted Data Storage</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              All your financial data is encrypted using AES-256 encryption both at rest and in transit. Your passwords are hashed with bcrypt before storage — we never store plaintext credentials.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">JWT-Based Authentication</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              We use JSON Web Tokens (JWT) for session management. Tokens are issued on login and must accompany every API request. Sessions expire automatically to prevent unauthorized access.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">No Third-Party Data Sharing</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your transaction data is never sold or shared with advertisers or third-party analytics services. Only you can see your financial records.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg font-semibold text-slate-900">Secure Infrastructure</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our backend runs on hardened servers with CORS policies, input validation, and rate limiting. All API communication happens over HTTPS to prevent man-in-the-middle attacks.
            </p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
            <h3 className="font-semibold text-amber-800 text-sm mb-2">Guest Mode Note</h3>
            <p className="text-xs text-amber-700">
              In guest mode, your data is stored locally in your browser's localStorage. This data never leaves your device and is not transmitted to any server. Clear your browser data to remove it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
