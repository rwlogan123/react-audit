// /backend/models/Content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  // References
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  
  // Content details
  contentType: {
    type: String,
    enum: ['blog', 'social', 'email', 'video', 'podcast', 'newsletter', 'ad_copy'],
    required: true,
    index: true
  },
  
  title: {
    type: String,
    required: true,
    maxLength: 200
  },
  
  content: {
    type: String,
    required: true
  },
  
  excerpt: {
    type: String,
    maxLength: 500
  },
  
  // Problem this content addresses
  targetProblem: {
    type: String,
    required: true
  },
  
  // Content metadata
  metadata: {
    problemId: mongoose.Schema.Types.ObjectId,
    category: {
      type: String,
      enum: ['seasonal', 'pricing', 'technical', 'service', 'communication', 'trust', 'competition', 'other']
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    },
    generatedBy: {
      type: String,
      enum: ['ai', 'human', 'hybrid'],
      default: 'ai'
    },
    model: String, // AI model used (gpt-4, claude, etc.)
    tokensUsed: Number,
    generationTime: Number, // milliseconds
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.8
    }
  },
  
  // Publishing status
  status: {
    type: String,
    enum: ['draft', 'review', 'approved', 'scheduled', 'published', 'archived'],
    default: 'draft',
    index: true
  },
  
  // Platform distribution
  platforms: [{
    type: String,
    enum: ['blog', 'facebook', 'instagram', 'linkedin', 'twitter', 'google_business', 'youtube', 'tiktok', 'email']
  }],
  
  publishDate: Date,
  scheduledDate: Date,
  
  // Platform-specific configurations
  platformSettings: {
    facebook: {
      postType: String, // text, photo, video, link
      hashtags: [String],
      mentionBusiness: Boolean
    },
    instagram: {
      postType: String,
      hashtags: [String],
      location: String
    },
    linkedin: {
      postType: String,
      hashtags: [String],
      professional: Boolean
    },
    google_business: {
      postType: String, // update, offer, event, product
      callToAction: String,
      buttonText: String,
      buttonUrl: String
    },
    blog: {
      slug: String,
      featuredImage: String,
      categories: [String],
      tags: [String]
    }
  },
  
  // SEO data for blog posts
  seoData: {
    metaTitle: String,
    metaDescription: String,
    focusKeyword: String,
    keywords: [String],
    slug: String,
    readabilityScore: Number,
    seoScore: Number
  },
  
  // Content structure for blog posts
  structure: {
    introduction: String,
    mainPoints: [String],
    conclusion: String,
    callToAction: String,
    faq: [{
      question: String,
      answer: String
    }]
  },
  
  // Performance tracking
  performance: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    engagement: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  
  // Publishing results
  publishResults: [{
    platform: String,
    status: {
      type: String,
      enum: ['success', 'failed', 'pending']
    },
    platformId: String, // ID from the platform (post ID, etc.)
    url: String,
    publishedAt: Date,
    error: String
  }],
  
  // Content variations
  variations: [{
    type: {
      type: String,
      enum: ['A/B_test', 'platform_specific', 'length_variant']
    },
    title: String,
    content: String,
    platform: String,
    performance: {
      views: Number,
      clicks: Number,
      engagement: Number
    }
  }],
  
  // Editorial workflow
  workflow: {
    assignedTo: String, // User ID or 'ai'
    reviewedBy: String,
    approvedBy: String,
    reviewNotes: String,
    revisionCount: {
      type: Number,
      default: 0
    },
    lastReviewDate: Date
  },
  
  // Content relationships
  relatedContent: [{
    contentId: mongoose.Schema.Types.ObjectId,
    relationship: {
      type: String,
      enum: ['series', 'follow_up', 'related_topic', 'updated_version']
    }
  }],
  
  // Quality metrics
  quality: {
    readabilityScore: Number, // Flesch-Kincaid, etc.
    grammarScore: Number,
    originalityScore: Number,
    relevanceScore: Number,
    brandAlignmentScore: Number
  },
  
  // User feedback
  feedback: [{
    type: {
      type: String,
      enum: ['like', 'dislike', 'helpful', 'not_helpful', 'improvement_suggestion']
    },
    comment: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    submittedBy: String // User ID
  }],
  
  // Tags and categorization
  tags: [String],
  
  // Custom fields for specific content types
  customFields: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  
  // Tracking fields
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  modifiedBy: String, // User ID or 'ai'
  
  version: {
    type: Number,
    default: 1
  }
  
}, {
  timestamps: true,
  collection: 'content'
});

// Indexes for performance
contentSchema.index({ businessId: 1, contentType: 1, status: 1 });
contentSchema.index({ conversationId: 1 });
contentSchema.index({ publishDate: -1 });
contentSchema.index({ 'metadata.category': 1 });
contentSchema.index({ 'metadata.priority': 1 });
contentSchema.index({ platforms: 1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ 'seoData.focusKeyword': 1 });

// Virtual fields
contentSchema.virtual('wordCount').get(function() {
  return this.content ? this.content.split(/\s+/).length : 0;
});

contentSchema.virtual('readingTime').get(function() {
  const wordsPerMinute = 200;
  const words = this.wordCount;
  return Math.ceil(words / wordsPerMinute);
});

contentSchema.virtual('engagementRate').get(function() {
  const views = this.performance.views || 0;
  const engagements = (this.performance.likes || 0) + 
                     (this.performance.shares || 0) + 
                     (this.performance.comments || 0);
  
  return views > 0 ? (engagements / views) * 100 : 0;
});

contentSchema.virtual('isPublished').get(function() {
  return this.status === 'published';
});

contentSchema.virtual('isScheduled').get(function() {
  return this.status === 'scheduled' && this.scheduledDate > new Date();
});

// Instance methods
contentSchema.methods.publish = function(platforms = []) {
  this.status = 'published';
  this.publishDate = new Date();
  
  if (platforms.length > 0) {
    this.platforms = platforms;
  }
  
  return this.save();
};

contentSchema.methods.schedule = function(scheduleDate, platforms = []) {
  this.status = 'scheduled';
  this.scheduledDate = new Date(scheduleDate);
  
  if (platforms.length > 0) {
    this.platforms = platforms;
  }
  
  return this.save();
};

contentSchema.methods.archive = function() {
  this.status = 'archived';
  return this.save();
};

contentSchema.methods.addPerformanceData = function(performanceData) {
  Object.keys(performanceData).forEach(key => {
    if (this.performance[key] !== undefined) {
      this.performance[key] = performanceData[key];
    }
  });
  
  return this.save();
};

contentSchema.methods.addFeedback = function(feedbackData) {
  this.feedback.push({
    ...feedbackData,
    submittedAt: new Date()
  });
  
  return this.save();
};

contentSchema.methods.createVariation = function(variationData) {
  this.variations.push(variationData);
  return this.save();
};

contentSchema.methods.getContentSummary = function() {
  return {
    id: this._id,
    title: this.title,
    contentType: this.contentType,
    status: this.status,
    targetProblem: this.targetProblem,
    platforms: this.platforms,
    wordCount: this.wordCount,
    readingTime: this.readingTime,
    publishDate: this.publishDate,
    performance: this.performance,
    engagementRate: this.engagementRate
  };
};

// Static methods
contentSchema.statics.getContentByBusiness = function(businessId, options = {}) {
  const query = { businessId };
  
  if (options.contentType) {
    query.contentType = options.contentType;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

contentSchema.statics.getPublishedContent = function(businessId, limit = 10) {
  return this.find({ 
    businessId, 
    status: 'published' 
  })
    .sort({ publishDate: -1 })
    .limit(limit);
};

contentSchema.statics.getScheduledContent = function() {
  return this.find({
    status: 'scheduled',
    scheduledDate: { $lte: new Date() }
  });
};

contentSchema.statics.getContentAnalytics = function(businessId, timeframe = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeframe);
  
  return this.aggregate([
    {
      $match: {
        businessId: businessId,
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$contentType',
        count: { $sum: 1 },
        published: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        totalViews: { $sum: '$performance.views' },
        totalEngagements: {
          $sum: {
            $add: [
              '$performance.likes',
              '$performance.shares',
              '$performance.comments'
            ]
          }
        }
      }
    }
  ]);
};

contentSchema.statics.getTopPerformingContent = function(businessId, limit = 5) {
  return this.find({
    businessId,
    status: 'published'
  })
    .sort({ 'performance.engagement': -1 })
    .limit(limit);
};

// Pre-save middleware
contentSchema.pre('save', function(next) {
  // Update last modified timestamp
  this.lastModified = new Date();
  
  // Increment version on content changes
  if (this.isModified('content') || this.isModified('title')) {
    this.version += 1;
  }
  
  // Generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }
  
  // Generate slug for blog posts
  if (this.contentType === 'blog' && !this.seoData.slug) {
    this.seoData.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }
  
  next();
});

module.exports = mongoose.model('Content', contentSchema);