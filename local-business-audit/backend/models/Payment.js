// /backend/models/Payment.js
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Reference to original audit
  auditId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  
  // Customer information
  customerId: {
    type: String, // Stripe customer ID
    required: true,
    index: true
  },
  
  // Payment details
  amount: {
    type: Number,
    required: true
  },
  
  currency: {
    type: String,
    default: 'usd'
  },
  
  // Plan information
  plan: {
    type: String,
    enum: ['standard', 'premium'],
    required: true
  },
  
  planDetails: {
    name: String,
    price: Number,
    features: [String],
    billing: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  
  // Payment status
  status: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // External payment references
  paymentIntentId: String, // Stripe payment intent
  subscriptionId: String,  // Stripe subscription ID
  invoiceId: String,       // Stripe invoice ID
  
  // Business information from audit
  businessInfo: {
    name: String,
    email: String,
    phone: String,
    address: String,
    website: String,
    businessType: String
  },
  
  // Timestamps
  paymentDate: Date,
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
  nextBillingDate: Date,
  
  // Audit summary for reference
  auditSummary: {
    visibilityScore: Number,
    criticalIssues: Number,
    monthlyLoss: Number,
    problems: [String]
  },
  
  // Payment method
  paymentMethod: {
    type: String,
    last4: String,
    brand: String
  },
  
  // Additional tracking
  referralSource: String,
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Internal flags
  isActive: {
    type: Boolean,
    default: true
  },
  
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  
  contentGenerationStarted: {
    type: Boolean,
    default: false
  },
  
  // Notes and tags
  notes: String,
  tags: [String],
  
  // Cancellation details
  cancellationReason: String,
  cancellationDate: Date,
  cancellationRequestedBy: String,
  
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'payments'
});

// Indexes for performance
paymentSchema.index({ auditId: 1, status: 1 });
paymentSchema.index({ customerId: 1, isActive: 1 });
paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ nextBillingDate: 1 });

// Virtual for total revenue calculation
paymentSchema.virtual('monthlyRevenue').get(function() {
  if (this.status === 'paid' && this.isActive) {
    return this.planDetails.billing === 'monthly' ? this.amount : this.amount / 12;
  }
  return 0;
});

// Methods
paymentSchema.methods.markAsPaid = function(paymentDetails) {
  this.status = 'paid';
  this.paymentDate = new Date();
  this.subscriptionStartDate = new Date();
  
  // Set next billing date based on plan
  const nextBilling = new Date();
  if (this.planDetails.billing === 'monthly') {
    nextBilling.setMonth(nextBilling.getMonth() + 1);
  } else {
    nextBilling.setFullYear(nextBilling.getFullYear() + 1);
  }
  this.nextBillingDate = nextBilling;
  
  if (paymentDetails) {
    this.paymentIntentId = paymentDetails.paymentIntentId;
    this.subscriptionId = paymentDetails.subscriptionId;
    this.paymentMethod = paymentDetails.paymentMethod;
  }
  
  return this.save();
};

paymentSchema.methods.cancelSubscription = function(reason, requestedBy) {
  this.isActive = false;
  this.status = 'cancelled';
  this.cancellationDate = new Date();
  this.cancellationReason = reason;
  this.cancellationRequestedBy = requestedBy;
  
  return this.save();
};

paymentSchema.methods.getBusinessSummary = function() {
  return {
    businessName: this.businessInfo.name,
    plan: this.plan,
    monthlyValue: this.planDetails.price,
    status: this.status,
    startDate: this.subscriptionStartDate,
    nextBilling: this.nextBillingDate,
    criticalIssues: this.auditSummary.criticalIssues,
    onboardingComplete: this.onboardingCompleted
  };
};

// Static methods
paymentSchema.statics.getActiveSubscriptions = function() {
  return this.find({ 
    status: 'paid', 
    isActive: true 
  });
};

paymentSchema.statics.getMonthlyRevenue = function() {
  return this.aggregate([
    {
      $match: { 
        status: 'paid', 
        isActive: true 
      }
    },
    {
      $group: {
        _id: null,
        totalMonthly: {
          $sum: {
            $cond: [
              { $eq: ['$planDetails.billing', 'monthly'] },
              '$amount',
              { $divide: ['$amount', 12] }
            ]
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);
};

paymentSchema.statics.getChurnAnalysis = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.aggregate([
    {
      $facet: {
        churned: [
          {
            $match: {
              status: 'cancelled',
              cancellationDate: { $gte: thirtyDaysAgo }
            }
          },
          { $count: 'count' }
        ],
        active: [
          {
            $match: {
              status: 'paid',
              isActive: true
            }
          },
          { $count: 'count' }
        ]
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);