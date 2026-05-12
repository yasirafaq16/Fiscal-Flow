import Transaction from "../models/Transaction.js"

class FinancialAdvisor {
  constructor(userId) {
    this.userId = userId
  }

  async getUserTransactions(timeRange = "12m") {
    const now = new Date()
    let startDate = new Date()

    switch (timeRange) {
      case "1m":
        startDate.setMonth(now.getMonth() - 1)
        break
      case "3m":
        startDate.setMonth(now.getMonth() - 3)
        break
      case "6m":
        startDate.setMonth(now.getMonth() - 6)
        break
      case "12m":
      default:
        startDate.setFullYear(now.getFullYear() - 1)
        break
    }

    return await Transaction.find({
      userId: this.userId,
      date: { $gte: startDate, $lte: now }
    }).sort({ date: -1 })
  }

  calculateFinancialMetrics(transactions) {
    const metrics = {
      totalEarnings: 0,
      totalSavings: 0,
      totalExpenditures: 0,
      monthlyData: {},
      categoryBreakdown: {
        earnings: {},
        savings: {},
        expenditures: {}
      },
      trends: {
        earnings: [],
        savings: [],
        expenditures: []
      }
    }

    transactions.forEach(tx => {
      const amount = tx.amount
      const type = tx.type
      const category = tx.category
      const monthKey = tx.date.toISOString().slice(0, 7) // YYYY-MM

      // Initialize month data if needed
      if (!metrics.monthlyData[monthKey]) {
        metrics.monthlyData[monthKey] = {
          earnings: 0,
          savings: 0,
          expenditures: 0,
          net: 0
        }
      }

      // Update totals
      if (type === "earning") {
        metrics.totalEarnings += amount
        metrics.monthlyData[monthKey].earnings += amount
        metrics.categoryBreakdown.earnings[category] = 
          (metrics.categoryBreakdown.earnings[category] || 0) + amount
      } else if (type === "savings") {
        metrics.totalSavings += amount
        metrics.monthlyData[monthKey].savings += amount
        metrics.categoryBreakdown.savings[category] = 
          (metrics.categoryBreakdown.savings[category] || 0) + amount
      } else if (type === "expenditure") {
        metrics.totalExpenditures += amount
        metrics.monthlyData[monthKey].expenditures += amount
        metrics.categoryBreakdown.expenditures[category] = 
          (metrics.categoryBreakdown.expenditures[category] || 0) + amount
      }

      // Calculate monthly net
      metrics.monthlyData[monthKey].net = 
        metrics.monthlyData[monthKey].earnings - 
        metrics.monthlyData[monthKey].expenditures
    })

    // Calculate trends
    const sortedMonths = Object.keys(metrics.monthlyData).sort()
    sortedMonths.forEach(month => {
      const data = metrics.monthlyData[month]
      metrics.trends.earnings.push(data.earnings)
      metrics.trends.savings.push(data.savings)
      metrics.trends.expenditures.push(data.expenditures)
    })

    return metrics
  }

  analyzeSpendingPatterns(metrics) {
    const patterns = {
      highSpendingCategories: [],
      recurringExpenses: [],
      seasonalTrends: [],
      riskFactors: []
    }

    // Identify high spending categories
    const expenditures = Object.entries(metrics.categoryBreakdown.expenditures)
      .sort(([,a], [,b]) => b - a)
    
    if (expenditures.length > 0) {
      const totalExp = metrics.totalExpenditures
      expenditures.forEach(([category, amount]) => {
        const percentage = (amount / totalExp) * 100
        if (percentage > 20) {
          patterns.highSpendingCategories.push({
            category,
            amount,
            percentage: Math.round(percentage)
          })
        }
      })
    }

    // Analyze monthly trends for seasonal patterns
    const monthlyData = metrics.monthlyData
    const months = Object.keys(monthlyData).sort()
    
    if (months.length >= 3) {
      const recentMonths = months.slice(-3)
      const avgRecentExpenditure = recentMonths.reduce((sum, month) => 
        sum + monthlyData[month].expenditures, 0) / recentMonths.length
      
      const olderMonths = months.slice(0, -3)
      if (olderMonths.length > 0) {
        const avgOlderExpenditure = olderMonths.reduce((sum, month) => 
          sum + monthlyData[month].expenditures, 0) / olderMonths.length
        
        if (avgRecentExpenditure > avgOlderExpenditure * 1.2) {
          patterns.seasonalTrends.push({
            type: "increasing_spending",
            message: "Spending has increased significantly in recent months"
          })
        }
      }
    }

    // Identify risk factors
    const savingsRate = metrics.totalEarnings > 0 ? 
      (metrics.totalSavings / metrics.totalEarnings) : 0
    
    if (savingsRate < 0.1) {
      patterns.riskFactors.push({
        type: "low_savings_rate",
        severity: "high",
        message: "Savings rate is below 10%, which is concerning for financial health"
      })
    } else if (savingsRate < 0.2) {
      patterns.riskFactors.push({
        type: "low_savings_rate",
        severity: "medium",
        message: "Consider increasing savings rate to at least 20%"
      })
    }

    return patterns
  }

  generateSavingsRecommendations(metrics, patterns) {
    const recommendations = []

    // Analyze spending reduction opportunities
    if (patterns.highSpendingCategories.length > 0) {
      const topCategory = patterns.highSpendingCategories[0]
      recommendations.push({
        type: "reduce_spending",
        priority: "high",
        category: topCategory.category,
        currentAmount: topCategory.amount,
        suggestedReduction: Math.round(topCategory.amount * 0.15),
        potentialSavings: Math.round(topCategory.amount * 0.15),
        message: `Reduce ${topCategory.category} spending by 15% to save $${Math.round(topCategory.amount * 0.15)} monthly`
      })
    }

    // Suggest automated savings
    const avgMonthlyEarnings = Object.keys(metrics.monthlyData).length > 0 ?
      Object.values(metrics.monthlyData).reduce((sum, month) => sum + month.earnings, 0) / 
      Object.keys(metrics.monthlyData).length : 0

    if (avgMonthlyEarnings > 0) {
      const suggestedAutoSave = Math.round(avgMonthlyEarnings * 0.1)
      recommendations.push({
        type: "automated_savings",
        priority: "medium",
        suggestedAmount: suggestedAutoSave,
        message: `Set up automatic savings of $${suggestedAutoSave} monthly (10% of average income)`
      })
    }

    // Emergency fund recommendation
    const monthlyExpenditure = Object.keys(metrics.monthlyData).length > 0 ?
      Object.values(metrics.monthlyData).reduce((sum, month) => sum + month.expenditures, 0) / 
      Object.keys(metrics.monthlyData).length : 0

    const emergencyFundTarget = monthlyExpenditure * 6
    const currentEmergencyFund = metrics.totalSavings

    if (currentEmergencyFund < emergencyFundTarget) {
      recommendations.push({
        type: "emergency_fund",
        priority: "high",
        currentAmount: currentEmergencyFund,
        targetAmount: Math.round(emergencyFundTarget),
        shortfall: Math.round(emergencyFundTarget - currentEmergencyFund),
        message: `Build emergency fund: Need $${Math.round(emergencyFundTarget - currentEmergencyFund)} more to reach 6-month expenses`
      })
    }

    return recommendations
  }

  generateInvestmentSuggestions(metrics) {
    const suggestions = []
    const availableForInvestment = Math.max(0, metrics.totalSavings * 0.3)

    if (availableForInvestment > 1000) {
      suggestions.push({
        type: "diversified_portfolio",
        priority: "medium",
        suggestedAmount: Math.round(availableForInvestment * 0.6),
        message: `Consider investing $${Math.round(availableForInvestment * 0.6)} in diversified index funds`
      })
    }

    if (metrics.totalEarnings > 50000) {
      suggestions.push({
        type: "retirement_account",
        priority: "high",
        suggestedPercentage: 10,
        message: "Maximize retirement account contributions for tax benefits"
      })
    }

    return suggestions
  }

  async generateComprehensiveAnalysis() {
    const transactions = await this.getUserTransactions()
    const metrics = this.calculateFinancialMetrics(transactions)
    const patterns = this.analyzeSpendingPatterns(metrics)
    const recommendations = this.generateSavingsRecommendations(metrics, patterns)
    const investmentSuggestions = this.generateInvestmentSuggestions(metrics)

    // Calculate financial health score
    const healthScore = this.calculateFinancialHealthScore(metrics, patterns)

    return {
      summary: {
        totalEarnings: metrics.totalEarnings,
        totalSavings: metrics.totalSavings,
        totalExpenditures: metrics.totalExpenditures,
        savingsRate: metrics.totalEarnings > 0 ? 
          Math.round((metrics.totalSavings / metrics.totalEarnings) * 100) : 0,
        healthScore
      },
      monthlyTrends: metrics.monthlyData,
      categoryBreakdown: metrics.categoryBreakdown,
      patterns,
      recommendations,
      investmentSuggestions,
      insights: this.generatePersonalizedInsights(metrics, patterns)
    }
  }

  calculateFinancialHealthScore(metrics, patterns) {
    let score = 50 // Base score

    // Savings rate impact (40 points max)
    const savingsRate = metrics.totalEarnings > 0 ? 
      (metrics.totalSavings / metrics.totalEarnings) : 0
    if (savingsRate >= 0.2) score += 40
    else if (savingsRate >= 0.1) score += 25
    else if (savingsRate >= 0.05) score += 10

    // Risk factors penalty
    patterns.riskFactors.forEach(risk => {
      if (risk.severity === "high") score -= 20
      else if (risk.severity === "medium") score -= 10
    })

    // Diversification bonus
    const earningCategories = Object.keys(metrics.categoryBreakdown.earnings).length
    if (earningCategories >= 2) score += 10

    return Math.max(0, Math.min(100, score))
  }

  generatePersonalizedInsights(metrics, patterns) {
    const insights = []

    // Income analysis
    if (metrics.totalEarnings > 0) {
      const monthlyAvg = metrics.totalEarnings / Math.max(1, Object.keys(metrics.monthlyData).length)
      insights.push(`Your average monthly income is $${Math.round(monthlyAvg)}`)
    }

    // Spending insights
    if (patterns.highSpendingCategories.length > 0) {
      const top = patterns.highSpendingCategories[0]
      insights.push(`${top.category} represents ${top.percentage}% of your total spending`)
    }

    // Savings insights
    const savingsRate = metrics.totalEarnings > 0 ? 
      (metrics.totalSavings / metrics.totalEarnings) : 0
    if (savingsRate > 0.2) {
      insights.push("Excellent savings rate! You're on track for financial independence")
    } else if (savingsRate > 0.1) {
      insights.push("Good savings habits, but consider increasing to 20% for optimal growth")
    } else {
      insights.push("Focus on building savings to create financial security")
    }

    return insights
  }
}

export default FinancialAdvisor
