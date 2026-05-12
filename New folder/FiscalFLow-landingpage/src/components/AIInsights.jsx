import React, { useMemo } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  AlertTriangle,
  Lightbulb,
  PiggyBank,
  Target
} from "lucide-react"

const formatMoney = (num) => {
  if (!num || isNaN(num)) return "0"
  return num.toLocaleString("en-IN", { maximumFractionDigits: 0 })
}

const AIInsights = ({ transactions, summary }) => {
  const insights = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return {
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          netSavings: 0,
          savingsRate: 0,
          healthScore: 0
        },
        patterns: {
          highSpendingCategories: [],
          riskFactors: []
        },
        recommendations: [],
        investmentSuggestions: []
      }
    }

    const totals = summary?.totalsByType || { earning: 0, savings: 0, expenditure: 0 }
    const totalIncome = totals.earning || 0
    const totalExpenses = totals.expenditure || 0
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    // Calculate health score
    let healthScore = 0
    if (savingsRate >= 20) healthScore += 40
    else if (savingsRate >= 10) healthScore += 25
    else if (savingsRate >= 5) healthScore += 10

    if (totals.savings > 0) healthScore += 30
    if (netSavings > 0) healthScore += 30

    healthScore = Math.min(100, Math.max(0, healthScore))

    // Analyze spending patterns
    const categoryBreakdown = {}
    transactions.forEach(tx => {
      if (tx.type === "expenditure") {
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount
      }
    })

    const highSpendingCategories = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    // Generate recommendations
    const recommendations = []
    const riskFactors = []

    if (savingsRate < 10) {
      recommendations.push({
        type: "automated_savings",
        priority: "high",
        message: "Your savings rate is below 10%. Consider setting up automatic transfers to savings.",
        suggestedAmount: Math.round(totalIncome * 0.1),
        potentialSavings: Math.round(totalIncome * 0.1 - totals.savings)
      })
      riskFactors.push({
        type: "low_savings_rate",
        severity: "high",
        message: "Low savings rate may leave you vulnerable to emergencies."
      })
    }

    if (totalExpenses > totalIncome * 0.8) {
      recommendations.push({
        type: "reduce_spending",
        priority: "medium",
        message: "Your expenses are high relative to income. Review and cut non-essential spending.",
        suggestedReduction: Math.round(totalExpenses - totalIncome * 0.7),
        potentialSavings: Math.round(totalExpenses - totalIncome * 0.7)
      })
    }

    if (totals.savings < totalIncome * 0.1) {
      recommendations.push({
        type: "emergency_fund",
        priority: "high",
        message: "Build an emergency fund covering 3-6 months of expenses.",
        suggestedAmount: Math.round(totalExpenses * 3)
      })
    }

    // Investment suggestions
    const investmentSuggestions = []
    if (totals.savings > totalIncome * 0.2) {
      investmentSuggestions.push({
        type: "mutual_funds",
        priority: "medium",
        message: "Consider investing in diversified mutual funds for long-term growth.",
        suggestedAmount: Math.round(totals.savings * 0.3),
        suggestedPercentage: 30
      })
    }

    if (netSavings > totalIncome * 0.15) {
      investmentSuggestions.push({
        type: "fixed_deposit",
        priority: "low",
        message: "Fixed deposits offer stable returns for emergency funds.",
        suggestedAmount: Math.round(netSavings * 0.2)
      })
    }

    return {
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate),
        healthScore
      },
      patterns: {
        highSpendingCategories,
        riskFactors
      },
      recommendations,
      investmentSuggestions
    }
  }, [transactions, summary])

  const [activeTab, setActiveTab] = React.useState("overview")

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-black">AI Financial Insights</h2>
        <div className="flex gap-2">
          {["overview", "recommendations", "patterns", "investments"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-lg text-sm font-black transition-all ${
                activeTab === tab
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && <OverviewTab insights={insights} />}
      {activeTab === "recommendations" && <RecommendationsTab recommendations={insights.recommendations} />}
      {activeTab === "patterns" && <PatternsTab patterns={insights.patterns} />}
      {activeTab === "investments" && <InvestmentsTab suggestions={insights.investmentSuggestions} />}
    </div>
  )
}

const OverviewTab = ({ insights }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-slate-600 uppercase">Total Income</span>
          <TrendingUp className="text-green-600" size={20} />
        </div>
        <p className="text-2xl font-black text-green-600">?{formatMoney(insights.summary.totalIncome)}</p>
      </div>
      
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-slate-600 uppercase">Total Expenses</span>
          <TrendingDown className="text-red-600" size={20} />
        </div>
        <p className="text-2xl font-black text-red-600">?{formatMoney(insights.summary.totalExpenses)}</p>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black text-slate-600 uppercase">Net Savings</span>
          <DollarSign className="text-blue-600" size={20} />
        </div>
        <p className="text-2xl font-black text-blue-600">?{formatMoney(insights.summary.netSavings)}</p>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-black mb-4">Financial Health</h3>
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-black text-slate-600 uppercase">Overall Score</span>
          <span className="text-2xl font-black text-blue-600">{insights.summary.healthScore}/100</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
            style={{ width: `${insights.summary.healthScore}%` }}
          ></div>
        </div>
        <p className="text-sm text-slate-600">
          Your financial health is {
            insights.summary.healthScore >= 70 ? "strong" : 
            insights.summary.healthScore >= 50 ? "moderate" : 
            "needs attention"
          }.
        </p>
      </div>
    </div>
  </div>
)

const RecommendationsTab = ({ recommendations }) => (
  <div className="space-y-4">
    {recommendations.length === 0 ? (
      <div className="text-center py-8 text-slate-500">
        <Shield className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>No specific recommendations at this time. Keep up the good work!</p>
      </div>
    ) : (
      recommendations.map((rec, index) => (
        <div key={index} className={`p-6 rounded-2xl border ${
          rec.priority === "high"
            ? "bg-red-50 border-red-200"
            : rec.priority === "medium"
            ? "bg-yellow-50 border-yellow-200"
            : "bg-blue-50 border-blue-200"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-xl ${
              rec.priority === "high"
                ? "bg-red-100"
                : rec.priority === "medium"
                ? "bg-yellow-100"
                : "bg-blue-100"
            }`}>
              {rec.type === "reduce_spending" && <TrendingDown className="w-5 h-5 text-red-600" />}
              {rec.type === "automated_savings" && <PiggyBank className="w-5 h-5 text-green-600" />}
              {rec.type === "emergency_fund" && <Shield className="w-5 h-5 text-blue-600" />}
              {!["reduce_spending", "automated_savings", "emergency_fund"].includes(rec.type) && <Lightbulb className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1">
              <h4 className="font-black mb-2 capitalize">{rec.type.replace(/_/g, " ")}</h4>
              <p className="text-sm text-slate-700 mb-3">{rec.message}</p>
              {rec.suggestedReduction && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-black">Potential savings: ?{rec.potentialSavings.toLocaleString()}</span>
                </div>
              )}
              {rec.suggestedAmount && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-black">Suggested amount: ?{rec.suggestedAmount.toLocaleString()}</span>
                </div>
              )}
            </div>
            <span className={`px-2 py-1 text-xs font-black rounded-lg ${
              rec.priority === "high"
                ? "bg-red-200 text-red-800"
                : rec.priority === "medium"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-blue-200 text-blue-800"
            }`}>
              {rec.priority}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
)

const PatternsTab = ({ patterns }) => (
  <div className="space-y-6">
    {patterns.highSpendingCategories.length > 0 && (
      <div>
        <h3 className="text-lg font-black mb-4">High Spending Categories</h3>
        <div className="space-y-3">
          {patterns.highSpendingCategories.map((category, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
              <div>
                <p className="font-black">{category.category}</p>
                <p className="text-sm text-slate-500">{category.percentage}% of total spending</p>
              </div>
              <p className="font-black">?{category.amount.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {patterns.riskFactors.length > 0 && (
      <div>
        <h3 className="text-lg font-black mb-4 text-red-600">Risk Factors</h3>
        <div className="space-y-3">
          {patterns.riskFactors.map((risk, index) => (
            <div key={index} className={`p-4 rounded-xl border ${
              risk.severity === "high" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="font-black capitalize">{risk.type.replace(/_/g, " ")}</span>
              </div>
              <p className="text-sm text-slate-700">{risk.message}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)

const InvestmentsTab = ({ suggestions }) => (
  <div className="space-y-4">
    {suggestions.length === 0 ? (
      <div className="text-center py-8 text-slate-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-slate-300" />
        <p>No investment suggestions available yet. Build your savings first!</p>
      </div>
    ) : (
      suggestions.map((suggestion, index) => (
        <div key={index} className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-black mb-2 capitalize">{suggestion.type.replace(/_/g, " ")}</h4>
              <p className="text-sm text-slate-700 mb-3">{suggestion.message}</p>
              {suggestion.suggestedAmount && (
                <p className="text-sm font-black">Suggested amount: ?{suggestion.suggestedAmount.toLocaleString()}</p>
              )}
              {suggestion.suggestedPercentage && (
                <p className="text-sm font-black">Suggested: {suggestion.suggestedPercentage}% of income</p>
              )}
            </div>
            <span className="px-2 py-1 text-xs font-black bg-blue-200 text-blue-800 rounded-lg">
              {suggestion.priority}
            </span>
          </div>
        </div>
      ))
    )}
  </div>
)

export default AIInsights
