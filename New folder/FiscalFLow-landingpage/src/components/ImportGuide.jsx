import { Link } from 'react-router-dom'
import { ArrowLeft, FileSpreadsheet, Table2, ListChecks } from 'lucide-react'

export default function ImportGuide() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Excel Import Guide</h1>
          <p className="text-sm text-slate-500 mt-1">Follow these steps to correctly format your Excel file for import.</p>
        </div>

        {/* Step 1 – Sheet Names */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Table2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">1. Create Separate Sheets for Each Type</h2>
          </div>
          <p className="text-sm text-slate-600">
            Your Excel workbook must have <strong>one sheet per transaction type</strong>. The sheet name determines where the data goes:
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { name: 'Earnings', keywords: 'earning, income, revenue', color: 'bg-blue-50 border-blue-200 text-blue-800' },
              { name: 'Savings', keywords: 'saving, savings', color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
              { name: 'Expenditure', keywords: 'expenditure, expense', color: 'bg-orange-50 border-orange-200 text-orange-800' },
            ].map(s => (
              <div key={s.name} className={`rounded-xl p-4 border ${s.color}`}>
                <p className="font-semibold text-sm">{s.name}</p>
                <p className="text-xs mt-1 opacity-80">Keywords: {s.keywords}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            Example: Name your sheet <strong>"Earnings"</strong>, <strong>"Savings"</strong>, or <strong>"Expenditure"</strong> — the app matches by keyword.
          </p>
        </div>

        {/* Step 2 – Column Headers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">2. Use the Correct Column Headers</h2>
          </div>
          <p className="text-sm text-slate-600">
            Each sheet must have these columns (first row = header row). Alternate names are also accepted:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Column</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Accepted Headers</th>
                  <th className="text-left px-4 py-2.5 font-semibold text-slate-700 border-b border-slate-200">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-800">Label</td>
                  <td className="px-4 py-2.5 text-slate-600">Label, Name, Description, Item</td>
                  <td className="px-4 py-2.5 text-slate-500">Monthly Salary</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-800">Category</td>
                  <td className="px-4 py-2.5 text-slate-600">Category, Cat, Group</td>
                  <td className="px-4 py-2.5 text-slate-500">Salary</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-800">Amount</td>
                  <td className="px-4 py-2.5 text-slate-600">Amount, Value, Total, Price</td>
                  <td className="px-4 py-2.5 text-slate-500">65000</td>
                </tr>
                <tr>
                  <td className="px-4 py-2.5 font-medium text-slate-800">Date</td>
                  <td className="px-4 py-2.5 text-slate-600">Date, Dt</td>
                  <td className="px-4 py-2.5 text-slate-500">2026-01-15</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 3 – Example */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">3. Example Workbook</h2>
          </div>
          <p className="text-sm text-slate-600">Here's how your Excel file should look:</p>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Sheet: Earnings</p>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead><tr className="bg-blue-50"><th className="px-3 py-2 text-left">Label</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Amount</th><th className="px-3 py-2 text-left">Date</th></tr></thead>
                  <tbody>
                    <tr className="border-t border-slate-100"><td className="px-3 py-2">Monthly Salary</td><td className="px-3 py-2">Salary</td><td className="px-3 py-2">65000</td><td className="px-3 py-2">2026-01-01</td></tr>
                    <tr className="border-t border-slate-100"><td className="px-3 py-2">Freelance Project</td><td className="px-3 py-2">Freelance</td><td className="px-3 py-2">20000</td><td className="px-3 py-2">2026-01-15</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Sheet: Savings</p>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead><tr className="bg-emerald-50"><th className="px-3 py-2 text-left">Label</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Amount</th><th className="px-3 py-2 text-left">Date</th></tr></thead>
                  <tbody>
                    <tr className="border-t border-slate-100"><td className="px-3 py-2">Emergency Fund</td><td className="px-3 py-2">Emergency Fund</td><td className="px-3 py-2">50000</td><td className="px-3 py-2">2026-02-01</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">Sheet: Expenditure</p>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead><tr className="bg-orange-50"><th className="px-3 py-2 text-left">Label</th><th className="px-3 py-2 text-left">Category</th><th className="px-3 py-2 text-left">Amount</th><th className="px-3 py-2 text-left">Date</th></tr></thead>
                  <tbody>
                    <tr className="border-t border-slate-100"><td className="px-3 py-2">Groceries</td><td className="px-3 py-2">Food</td><td className="px-3 py-2">5000</td><td className="px-3 py-2">2026-01-05</td></tr>
                    <tr className="border-t border-slate-100"><td className="px-3 py-2">Electricity Bill</td><td className="px-3 py-2">Utilities</td><td className="px-3 py-2">2500</td><td className="px-3 py-2">2026-01-10</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200 space-y-2">
          <h3 className="font-semibold text-amber-800 text-sm">Tips</h3>
          <ul className="text-xs text-amber-700 space-y-1.5 list-disc list-inside">
            <li>Date format: <strong>YYYY-MM-DD</strong> (e.g. 2026-01-15) works best. DD-MM-YYYY is also accepted.</li>
            <li>Amounts should be numbers only — no currency symbols or commas.</li>
            <li>Column headers are case-insensitive and extra spaces are trimmed automatically.</li>
            <li>If a sheet name doesn't match any keyword, its rows default to <strong>Expenditure</strong>.</li>
            <li>Rows with no Label and no Amount are skipped automatically.</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
