import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    // Enhanced financial profile fields
    financialProfile: {
      targetSavingsRate: { type: Number, default: 0.2, min: 0, max: 1 },
      riskTolerance: { 
        type: String, 
        enum: ["conservative", "moderate", "aggressive"], 
        default: "moderate" 
      },
      financialGoals: [{
        type: { type: String, required: true }, // emergency_fund, retirement, house, etc.
        targetAmount: { type: Number, required: true },
        targetDate: { type: Date, required: true },
        priority: { type: String, enum: ["low", "medium", "high"], default: "medium" }
      }],
      monthlyIncome: { type: Number, default: 0 },
      employmentStatus: { 
        type: String, 
        enum: ["employed", "self-employed", "unemployed", "student"], 
        default: "employed" 
      }
    },
    // AI preferences
    aiPreferences: {
      recommendationFrequency: { 
        type: String, 
        enum: ["daily", "weekly", "monthly"], 
        default: "weekly" 
      },
      notificationEnabled: { type: Boolean, default: true },
      insightTypes: [{
        type: String,
        enum: ["savings", "investments", "spending", "budget", "goals"]
      }]
    },
    // Privacy and data settings
    dataSettings: {
      shareAnonymousData: { type: Boolean, default: false },
      dataRetentionMonths: { type: Number, default: 24, min: 6, max: 120 }
    }
  },
  { timestamps: true }
)

// Virtual for calculating financial health score
userSchema.virtual("financialHealthScore").get(function() {
  // This will be calculated dynamically based on transactions
  return null // Placeholder - calculated in the advisor
})

// Method to update financial profile
userSchema.methods.updateFinancialProfile = async function(updates) {
  Object.keys(updates).forEach(key => {
    if (this.financialProfile.hasOwnProperty(key)) {
      this.financialProfile[key] = updates[key]
    }
  })
  return this.save()
}

// Method to add financial goal
userSchema.methods.addFinancialGoal = async function(goal) {
  this.financialProfile.financialGoals.push(goal)
  return this.save()
}

// Method to update AI preferences
userSchema.methods.updateAIPreferences = async function(preferences) {
  Object.keys(preferences).forEach(key => {
    if (this.aiPreferences.hasOwnProperty(key)) {
      this.aiPreferences[key] = preferences[key]
    }
  })
  return this.save()
}

const User = mongoose.model("User", userSchema)

export default User
