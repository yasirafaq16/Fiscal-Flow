import express from "express"
import User from "../models/User.js"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

router.use(requireAuth)

// Get user profile with financial information
router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      success: true,
      profile: {
        id: user._id,
        username: user.username,
        email: user.email,
        financialProfile: user.financialProfile || {},
        aiPreferences: user.aiPreferences || {},
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Failed to fetch profile" })
  }
})

// Update financial profile
router.put("/financial-profile", async (req, res) => {
  try {
    const { targetSavingsRate, riskTolerance, financialGoals, monthlyIncome, employmentStatus } = req.body
    
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Initialize financialProfile if it doesn't exist
    if (!user.financialProfile) {
      user.financialProfile = {}
    }

    // Update allowed fields
    if (targetSavingsRate !== undefined) user.financialProfile.targetSavingsRate = targetSavingsRate
    if (riskTolerance !== undefined) user.financialProfile.riskTolerance = riskTolerance
    if (monthlyIncome !== undefined) user.financialProfile.monthlyIncome = monthlyIncome
    if (employmentStatus !== undefined) user.financialProfile.employmentStatus = employmentStatus
    
    // Handle financial goals
    if (financialGoals !== undefined) {
      if (Array.isArray(financialGoals)) {
        user.financialProfile.financialGoals = financialGoals
      }
    }

    await user.save()

    res.json({
      success: true,
      message: "Financial profile updated successfully",
      financialProfile: user.financialProfile
    })
  } catch (error) {
    console.error("Update financial profile error:", error)
    res.status(500).json({ message: "Failed to update financial profile" })
  }
})

// Add a new financial goal
router.post("/financial-goals", async (req, res) => {
  try {
    const { type, targetAmount, targetDate, priority } = req.body
    
    if (!type || !targetAmount || !targetDate) {
      return res.status(400).json({ 
        message: "type, targetAmount, and targetDate are required" 
      })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!user.financialProfile) {
      user.financialProfile = {}
    }
    if (!user.financialProfile.financialGoals) {
      user.financialProfile.financialGoals = []
    }

    const newGoal = {
      type,
      targetAmount: Number(targetAmount),
      targetDate: new Date(targetDate),
      priority: priority || "medium"
    }

    user.financialProfile.financialGoals.push(newGoal)
    await user.save()

    res.json({
      success: true,
      message: "Financial goal added successfully",
      goal: newGoal
    })
  } catch (error) {
    console.error("Add financial goal error:", error)
    res.status(500).json({ message: "Failed to add financial goal" })
  }
})

// Update AI preferences
router.put("/ai-preferences", async (req, res) => {
  try {
    const { recommendationFrequency, notificationEnabled, insightTypes } = req.body
    
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Initialize aiPreferences if it doesn't exist
    if (!user.aiPreferences) {
      user.aiPreferences = {
        recommendationFrequency: "weekly",
        notificationEnabled: true,
        insightTypes: ["savings", "investments", "spending"]
      }
    }

    // Update allowed fields
    if (recommendationFrequency !== undefined) {
      user.aiPreferences.recommendationFrequency = recommendationFrequency
    }
    if (notificationEnabled !== undefined) {
      user.aiPreferences.notificationEnabled = notificationEnabled
    }
    if (insightTypes !== undefined) {
      user.aiPreferences.insightTypes = insightTypes
    }

    await user.save()

    res.json({
      success: true,
      message: "AI preferences updated successfully",
      aiPreferences: user.aiPreferences
    })
  } catch (error) {
    console.error("Update AI preferences error:", error)
    res.status(500).json({ message: "Failed to update AI preferences" })
  }
})

// Get financial goals with progress
router.get("/financial-goals", async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const goals = user.financialProfile?.financialGoals || []
    
    // TODO: Calculate actual progress based on transactions
    // For now, return goals without progress calculation
    res.json({
      success: true,
      goals: goals.map(goal => ({
        ...goal,
        progress: 0 // Placeholder - will be calculated based on actual savings
      }))
    })
  } catch (error) {
    console.error("Get financial goals error:", error)
    res.status(500).json({ message: "Failed to fetch financial goals" })
  }
})

// Delete a financial goal
router.delete("/financial-goals/:goalIndex", async (req, res) => {
  try {
    const { goalIndex } = req.params
    const index = parseInt(goalIndex)
    
    if (isNaN(index)) {
      return res.status(400).json({ message: "Invalid goal index" })
    }

    const user = await User.findById(req.user.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    if (!user.financialProfile?.financialGoals) {
      return res.status(404).json({ message: "No financial goals found" })
    }

    if (index < 0 || index >= user.financialProfile.financialGoals.length) {
      return res.status(400).json({ message: "Goal index out of range" })
    }

    user.financialProfile.financialGoals.splice(index, 1)
    await user.save()

    res.json({
      success: true,
      message: "Financial goal deleted successfully"
    })
  } catch (error) {
    console.error("Delete financial goal error:", error)
    res.status(500).json({ message: "Failed to delete financial goal" })
  }
})

export default router
