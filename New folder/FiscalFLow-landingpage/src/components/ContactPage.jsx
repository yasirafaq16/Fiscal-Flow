import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail, MessageSquare, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact Us</h1>
          <p className="text-sm text-slate-500 mt-1">Have questions or feedback? We'd love to hear from you.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Email</h2>
            </div>
            <p className="text-sm text-slate-600">
              For general inquiries, bug reports, or feature requests, reach us at:
            </p>
            <p className="text-sm text-blue-600 font-medium mt-1"><a href="mailto:Yasirafaq16@gmail.com">Yasirafaq16@gmail.com</a></p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Feedback</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Found a bug? Have a suggestion for improving the dashboard, charts, or Excel import? We actively review all feedback and incorporate it into our updates. Please include your browser name and a screenshot if reporting a visual issue.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-900">Response Time</h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              We typically respond within 24–48 hours. For urgent issues like data not loading or login failures, please mention "URGENT" in the subject line and we'll prioritize it.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <h3 className="font-semibold text-slate-800 text-sm mb-2">Project Team</h3>
            <p className="text-xs text-slate-600">
              Mohd Yasir Afaq (2331070) &nbsp;•&nbsp; Ravi Bhushan Kumar (2331066)
            </p>
            <p className="text-xs text-slate-400 mt-1">
              UG Final Project — Department of Computer Science
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
