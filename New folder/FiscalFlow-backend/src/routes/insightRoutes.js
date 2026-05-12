import express from "express"
import { spawn } from "child_process"
import FinancialAdvisor from "../ai/financialAdvisor.js"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

router.use(requireAuth)

// Enhanced AI-powered financial analysis
router.get("/comprehensive", async (req, res) => {
  try {
    const { timeRange = "12m" } = req.query
    const advisor = new FinancialAdvisor(req.user.userId)
    const analysis = await advisor.generateComprehensiveAnalysis()
    
    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Comprehensive analysis error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate comprehensive analysis"
    })
  }
})

// Personalized savings recommendations
router.get("/savings-recommendations", async (req, res) => {
  try {
    const advisor = new FinancialAdvisor(req.user.userId)
    const analysis = await advisor.generateComprehensiveAnalysis()
    
    res.json({
      success: true,
      recommendations: analysis.recommendations,
      healthScore: analysis.summary.healthScore,
      savingsRate: analysis.summary.savingsRate
    })
  } catch (error) {
    console.error("Savings recommendations error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate savings recommendations"
    })
  }
})

// Investment suggestions based on financial profile
router.get("/investment-suggestions", async (req, res) => {
  try {
    const advisor = new FinancialAdvisor(req.user.userId)
    const analysis = await advisor.generateComprehensiveAnalysis()
    
    res.json({
      success: true,
      suggestions: analysis.investmentSuggestions,
      riskProfile: analysis.summary.healthScore > 70 ? "conservative" : "moderate",
      availableForInvestment: Math.max(0, analysis.summary.totalSavings * 0.3)
    })
  } catch (error) {
    console.error("Investment suggestions error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate investment suggestions"
    })
  }
})

// Spending pattern analysis
router.get("/spending-patterns", async (req, res) => {
  try {
    const advisor = new FinancialAdvisor(req.user.userId)
    const analysis = await advisor.generateComprehensiveAnalysis()
    
    res.json({
      success: true,
      patterns: analysis.patterns,
      categoryBreakdown: analysis.categoryBreakdown,
      monthlyTrends: analysis.monthlyTrends
    })
  } catch (error) {
    console.error("Spending patterns error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to analyze spending patterns"
    })
  }
})

// Financial health score and insights
router.get("/health-score", async (req, res) => {
  try {
    const advisor = new FinancialAdvisor(req.user.userId)
    const analysis = await advisor.generateComprehensiveAnalysis()
    
    res.json({
      success: true,
      healthScore: analysis.summary.healthScore,
      insights: analysis.insights,
      summary: analysis.summary,
      recommendations: analysis.recommendations.filter(r => r.priority === "high")
    })
  } catch (error) {
    console.error("Health score error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to calculate health score"
    })
  }
})

// Budget optimization suggestions
router.get("/budget-optimization", async (req, res) => {
  try {
    const advisor = new FinancialAdvisor(req.user.userId)
    const analysis = await advisor.generateComprehensiveAnalysis()
    
    const optimizationSuggestions = {
      reduceHighSpending: analysis.patterns.highSpendingCategories.map(cat => ({
        category: cat.category,
        currentAmount: cat.amount,
        suggestedReduction: Math.round(cat.amount * 0.1),
        potentialSavings: Math.round(cat.amount * 0.1)
      })),
      automatedSavings: {
        suggestedAmount: Math.round(analysis.summary.totalEarnings * 0.1),
        frequency: "monthly"
      },
      emergencyFund: analysis.recommendations.find(r => r.type === "emergency_fund")
    }
    
    res.json({
      success: true,
      optimizationSuggestions,
      totalPotentialSavings: optimizationSuggestions.reduceSavings?.reduce(
        (sum, item) => sum + item.potentialSavings, 0
      ) || 0
    })
  } catch (error) {
    console.error("Budget optimization error:", error)
    res.status(500).json({
      success: false,
      message: "Failed to generate budget optimization"
    })
  }
})

// Legacy XGBoost endpoint for backward compatibility
router.post("/xgboost", async (req, res) => {
  const { earnings = [], savings = [], expenditures = [], targetSavingsRate } = req.body
  const pythonPayload = JSON.stringify({
    earnings,
    savings,
    expenditures,
    targetSavingsRate
  })

  const pythonCmd = process.env.PYTHON_CMD || "python"
  const py = spawn(pythonCmd, ["src/ai/xgboost_insights.py"], {
    stdio: ["pipe", "pipe", "pipe"]
  })

  let stdout = ""
  let stderr = ""

  py.stdout.on("data", (chunk) => {
    stdout += chunk.toString()
  })
  py.stderr.on("data", (chunk) => {
    stderr += chunk.toString()
  })

  py.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({
        message: "XGBoost insight generation failed",
        details: stderr || "Python process exited with error"
      })
    }
    try {
      const parsed = JSON.parse(stdout || "{}")
      return res.json(parsed)
    } catch {
      return res.status(500).json({ 
        message: "Invalid XGBoost response format" })
    }
  })

  py.stdin.write(pythonPayload)
  py.stdin.end()
})

export default router
