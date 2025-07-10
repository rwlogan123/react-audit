// /backend/models/Conversation.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['assistant', 'user', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    tokens: Number,
    model: String,
    responseTime: Number,
    sentiment: String,
    confidence: Number
  }
});

const extractedProblemSchema = new mongoose.Schema({
  problem: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['seasonal', 'pricing', 'technical', 'service', 'communication', 'trust', 'competition', 'other']
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  frequency: String, // How often customers ask about this
  customerType: String, // Who typically asks about this
  seasonality: String, // When this problem occurs
  contentOpportunity: {
    blogPostIdeas: [String],
    socialMediaAngles: [String],
    videoTopics: [String],
    emailSubjects: [String]
  },
  extractedAt: {
    type: Date,
    default: Date.now
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  }
});

const conversationSchema = new mongoose.Schema({
  // References
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
    index: true
  },
  
  // Business context from audit
  businessContext: {
    name: String,
    type: String, // HVAC, plumbing, roofing, etc.
    location: String,
    website: String,
    auditScore: Number,
    criticalIssues: [String],
    mainServices: [String]
  },
  
  // Conversation data
  messages: [messageSchema],
  
  // Extracted insights
  extractedProblems: [extractedProblemSchema],
  
  // Conversation status
  status: {
    type: String,
    enum: ['initiated', 'in_progress', 'paused', 'completed', 'abandoned'],
    default: 'initiated',
    index: true
  },
  
  // Progress tracking
  progress: {
    problemsIdentified: {
      type: Number,
      default: 0
    },
    targetProblems: {
      type: Number,
      default: 10
    },
    completionPercentage: {
      type: Number,
      default: 0
    },
    estimatedTimeRemaining: Number, // in minutes
    currentPhase: {
      type: String,
      enum: ['introduction', 'problem_discovery', 'deep_dive', 'validation', 'wrap_up'],
      default: 'introduction'
    }
  },
  
  // Conversation settings
  settings: {
    voiceEnabled: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    interviewStyle: {
      type: String,
      enum: ['conversational', 'structured', 'quick'],
      default: 'conversational'
    },
    maxDuration: {
      type: Number,
      default: 60 // minutes
    }
  },
  
  // Analytics
  analytics: {
    totalMessages: {
      type: Number,
      default: 0
    },
    userMessages: {
      type: Number,
      default: 0
    },
    assistantMessages: {
      type: Number,
      default: 0
    },
    averageResponseTime: Number,
    totalTokensUsed: Number,
    sessionDuration: Number, // in minutes
    engagementScore: Number, // 0-100
    satisfactionRating: Number // 1-5, if provided
  },
  
  // Timestamps
  startedAt: {
    type: Date,
    default: Date.now
  },
  
  lastActiveAt: {
    type: Date,
    default: Date.now
  },
  
  completedAt: Date,
  
  // Content generation status
  contentGeneration: {
    initiated: {
      type: Boolean,
      default: false
    },
    initiatedAt: Date,
    blogPostsGenerated: {
      type: Number,
      default: 0
    },
    socialPostsGenerated: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'failed'],
      default: 'pending'
    }
  },
  
  // Quality control
  qualityChecks: {
    problemsValidated: {
      type: Boolean,
      default: false
    },
    duplicatesRemoved: {
      type: Boolean,
      default: false
    },
    businessRelevanceScore: Number,
    contentPotentialScore: Number
  },
  
  // Notes and tags
  notes: String,
  tags: [String],
  
}, {
  timestamps: true,
  collection: 'conversations'
});

// Indexes for performance
conversationSchema.index({ businessId: 1, status: 1 });
conversationSchema.index({ paymentId: 1 });
conversationSchema.index({ status: 1, lastActiveAt: -1 });
conversationSchema.index({ 'businessContext.type': 1 });
conversationSchema.index({ completedAt: -1 });

// Virtual fields
conversationSchema.virtual('problemCount').get(function() {
  return this.extractedProblems.length;
});

conversationSchema.virtual('isComplete').get(function() {
  return this.status === 'completed' && this.extractedProblems.length >= 10;
});

conversationSchema.virtual('duration').get(function() {
  if (this.completedAt) {
    return Math.round((this.completedAt - this.startedAt) / (1000 * 60)); // minutes
  }
  return Math.round((Date.now() - this.startedAt) / (1000 * 60));
});

// Methods
conversationSchema.methods.addMessage = function(role, content, metadata = {}) {
  const message = {
    role,
    content,
    timestamp: new Date(),
    metadata
  };
  
  this.messages.push(message);
  this.analytics.totalMessages++;
  
  if (role === 'user') {
    this.analytics.userMessages++;
  } else if (role === 'assistant') {
    this.analytics.assistantMessages++;
  }
  
  this.lastActiveAt = new Date();
  
  return this.save();
};

conversationSchema.methods.extractProblem = function(problemData) {
  const problem = {
    ...problemData,
    extractedAt: new Date()
  };
  
  this.extractedProblems.push(problem);
  this.progress.problemsIdentified = this.extractedProblems.length;
  this.progress.completionPercentage = Math.min(
    (this.extractedProblems.length / this.progress.targetProblems) * 100,
    100
  );
  
  return this.save();
};

conversationSchema.methods.completeConversation = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  this.progress.completionPercentage = 100;
  this.analytics.sessionDuration = this.duration;
  
  return this.save();
};

conversationSchema.methods.getConversationSummary = function() {
  return {
    businessName: this.businessContext.name,
    businessType: this.businessContext.type,
    duration: this.duration,
    problemsIdentified: this.extractedProblems.length,
    status: this.status,
    completionPercentage: this.progress.completionPercentage,
    messageCount: this.analytics.totalMessages,
    startedAt: this.startedAt,
    completedAt: this.completedAt
  };
};

conversationSchema.methods.getProblemsForContentGeneration = function() {
  return this.extractedProblems
    .filter(p => p.confidence >= 0.7)
    .sort((a, b) => {
      // Sort by priority (high first) then confidence
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.confidence - a.confidence;
    });
};

// Static methods
conversationSchema.statics.getActiveConversations = function() {
  return this.find({
    status: { $in: ['initiated', 'in_progress', 'paused'] },
    lastActiveAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
  });
};

conversationSchema.statics.getCompletedConversations = function(limit = 50) {
  return this.find({ status: 'completed' })
    .sort({ completedAt: -1 })
    .limit(limit)
    .populate('paymentId', 'businessInfo plan');
};

conversationSchema.statics.getAnalytics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalConversations: { $sum: 1 },
        completedConversations: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageProblems: { $avg: { $size: '$extractedProblems' } },
        averageDuration: { $avg: '$analytics.sessionDuration' },
        totalProblemsExtracted: { $sum: { $size: '$extractedProblems' } }
      }
    }
  ]);
};

module.exports = mongoose.model('Conversation', conversationSchema);