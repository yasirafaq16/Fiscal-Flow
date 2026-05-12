import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, TrendingDown, PiggyBank, Receipt, Lightbulb } from 'lucide-react'

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">Blog</h1>
          <p className="text-sm text-slate-500 mt-1">Tips on budgeting, saving, and managing your finances better.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-900">The 50/30/20 Rule: A Simple Budgeting Framework</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">5 min read</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Allocate 50% of your income to needs (rent, groceries, utilities), 30% to wants (entertainment, dining out), and 20% to savings and debt repayment. It's a straightforward way to ensure you're not overspending while still building a safety net. Fiscal Flow automatically categorizes your expenses so you can see exactly where each rupee goes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <PiggyBank className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Why You Need an Emergency Fund</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">4 min read</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              An emergency fund covering 3–6 months of expenses can protect you from unexpected job loss, medical bills, or urgent repairs. Start small — even ₹5,000 saved is better than zero. Use Fiscal Flow's savings tracker to set a target and watch your progress each month. The AI diagnostics feature can tell you how many days of expenses your current savings can cover.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">Tracking Subscriptions: The Hidden Drain</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">3 min read</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              The average person spends over ₹3,000/month on subscriptions they rarely use — streaming services, apps, gym memberships. Review your bank statement monthly and cancel anything you haven't used in the past 30 days. Import your expense data into Fiscal Flow via Excel to quickly spot recurring charges eating into your budget.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-slate-900">Automate Your Savings</h2>
            </div>
            <p className="text-xs text-slate-400 mb-3">3 min read</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Treat savings like a bill. Set up an automatic transfer on payday so a fixed amount moves to your savings account before you can spend it. Even ₹2,000/month adds up to ₹24,000/year. Use Fiscal Flow's target savings rate slider to find the right percentage for your income level.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
