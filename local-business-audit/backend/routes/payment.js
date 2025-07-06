// /backend/routes/payment.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Models
const Payment = require('../models/Payment');

// Services
const paymentService = require('../services/shared/paymentService');
const auditStorage = require('../services/auditStorage');
const emailService = require('../services/shared/emailService');

// Middleware
const rateLimiter = require('../middleware/rateLimiting');

/**
 * GET /api/payment/plans
 * Get available pricing plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = {
      standard: {
        id: 'standard',
        name: 'Standard',
        price: 2997,
        currency: 'usd',
        billing: 'monthly',
        description: 'Complete AI-powered local marketing automation',
        features: [
          'AI-powered content strategy interview',
          '10+ blog posts per month targeting customer problems',
          'Social media content adapted from blogs',
          'Google Business Profile optimization',
          'Citation building to 25+ directories',
          'Basic review management system',
          'Monthly performance reports'
        ],
        limits: {
          blogPosts: 10,
          socialPosts: 50,
          citations: 25,
          reviewRequests: 100
        },
        popular: false
      },
      premium: {
        id: 'premium',
        name: 'Premium',
        price: 5997,
        currency: 'usd',
        billing: 'monthly',
        description: 'Everything in Standard plus advanced automation and support',
        features: [
          'Everything in Standard, plus:',
          'Weekly AI strategy calls',
          'Advanced review response automation',
          'Citation building to 50+ directories',
          'Video script generation',
          'Email marketing sequences',
          'Competitor monitoring and alerts',
          'Priority support and implementation'
        ],
        limits: {
          blogPosts: 20,
          socialPosts: 100,
          citations: 50,
          reviewRequests: 250,
          strategyCalls: 4
        },
        popular: true
      }
    };

    res.json({
      success: true,
      data: plans
    });

  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load pricing plans'
    });
  }
});

/**
 * POST /api/payment/create-intent
 * Create a payment intent for checkout
 */
router.post('/create-intent', rateLimiter.createLimiter(10, 3600), [
  body('auditId').isMongoId().withMessage('Valid audit ID required'),
  body('plan').isIn(['standard', 'premium']).withMessage('Valid plan required'),
  body('customerInfo.email').isEmail().withMessage('Valid email required'),
  body('customerInfo.name').notEmpty().withMessage('Name is required'),
  body('customerInfo.phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { auditId, plan, customerInfo } = req.body;

    // Get audit data
    const auditData = await auditStorage.getAuditById(auditId);
    if (!auditData) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }

    // Check if payment already exists for this audit
    const existingPayment = await Payment.findOne({ 
      auditId, 
      status: { $in: ['paid', 'processing'] } 
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'Payment already exists for this audit'
      });
    }

    // Get plan details
    const planDetails = await paymentService.getPlanDetails(plan);
    if (!planDetails) {
      return res.status(400).json({
        success: false,
        error: 'Invalid plan selected'
      });
    }

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      amount: planDetails.price,
      currency: 'usd',
      customerInfo,
      metadata: {
        auditId,
        plan,
        businessName: auditData.businessName
      }
    });

    // Store payment record
    const payment = new Payment({
      auditId,
      customerId: paymentIntent.customerId,
      amount: planDetails.price,
      plan,
      planDetails,
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      businessInfo: {
        name: auditData.businessName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: auditData.location,
        website: auditData.website,
        businessType: auditData.businessType
      },
      auditSummary: {
        visibilityScore: auditData.visibilityScore,
        criticalIssues: auditData.actionItems?.critical?.length || 0,
        monthlyLoss: calculateMonthlyLoss(auditData),
        problems: extractProblems(auditData)
      }
    });

    await payment.save();

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment._id,
        amount: planDetails.price,
        plan: planDetails
      }
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment intent'
    });
  }
});

/**
 * POST /api/payment/confirm
 * Confirm payment completion
 */
router.post('/confirm', [
  body('paymentId').isMongoId().withMessage('Valid payment ID required'),
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paymentId, paymentIntentId } = req.body;

    // Get payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Verify payment with payment processor
    const paymentStatus = await paymentService.verifyPayment(paymentIntentId);
    
    if (paymentStatus.status === 'succeeded') {
      // Mark payment as paid
      await payment.markAsPaid({
        paymentIntentId,
        subscriptionId: paymentStatus.subscriptionId,
        paymentMethod: paymentStatus.paymentMethod
      });

      // Send confirmation email
      await emailService.sendPaymentConfirmation({
        to: payment.businessInfo.email,
        businessName: payment.businessInfo.name,
        plan: payment.planDetails,
        amount: payment.amount
      });

      // Send onboarding email
      await emailService.sendOnboardingWelcome({
        to: payment.businessInfo.email,
        businessName: payment.businessInfo.name,
        onboardingUrl: `${process.env.FRONTEND_URL}/onboarding/${payment._id}`
      });

      res.json({
        success: true,
        data: {
          paymentId: payment._id,
          status: 'paid',
          onboardingUrl: `/onboarding/${payment._id}`,
          message: 'Payment confirmed successfully'
        }
      });

    } else if (paymentStatus.status === 'processing') {
      payment.status = 'processing';
      await payment.save();

      res.json({
        success: true,
        data: {
          paymentId: payment._id,
          status: 'processing',
          message: 'Payment is being processed'
        }
      });

    } else {
      payment.status = 'failed';
      await payment.save();

      res.status(400).json({
        success: false,
        error: 'Payment failed',
        data: { paymentId: payment._id }
      });
    }

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    });
  }
});

/**
 * GET /api/payment/:paymentId/status
 * Get payment status
 */
router.get('/:paymentId/status', async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        status: payment.status,
        plan: payment.plan,
        amount: payment.amount,
        businessName: payment.businessInfo.name,
        createdAt: payment.createdAt,
        onboardingCompleted: payment.onboardingCompleted
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
});

/**
 * POST /api/payment/webhook
 * Handle payment processor webhooks
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const event = paymentService.verifyWebhook(req.body, sig);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
});

/**
 * POST /api/payment/:paymentId/cancel
 * Cancel a subscription
 */
router.post('/:paymentId/cancel', [
  body('reason').optional().isString(),
  body('feedback').optional().isString()
], async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, feedback } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status !== 'paid' || !payment.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Subscription is not active'
      });
    }

    // Cancel subscription with payment processor
    if (payment.subscriptionId) {
      await paymentService.cancelSubscription(payment.subscriptionId);
    }

    // Update payment record
    await payment.cancelSubscription(reason, 'customer');

    // Send cancellation confirmation
    await emailService.sendCancellationConfirmation({
      to: payment.businessInfo.email,
      businessName: payment.businessInfo.name,
      cancellationDate: payment.cancellationDate
    });

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
});

// Helper functions
async function handlePaymentSuccess(paymentIntent) {
  const payment = await Payment.findOne({ 
    paymentIntentId: paymentIntent.id 
  });
  
  if (payment && payment.status !== 'paid') {
    await payment.markAsPaid({
      paymentIntentId: paymentIntent.id,
      paymentMethod: {
        type: paymentIntent.payment_method?.type,
        last4: paymentIntent.payment_method?.card?.last4,
        brand: paymentIntent.payment_method?.card?.brand
      }
    });
  }
}

async function handlePaymentFailure(paymentIntent) {
  const payment = await Payment.findOne({ 
    paymentIntentId: paymentIntent.id 
  });
  
  if (payment) {
    payment.status = 'failed';
    await payment.save();
  }
}

async function handleSubscriptionPayment(invoice) {
  const payment = await Payment.findOne({ 
    subscriptionId: invoice.subscription 
  });
  
  if (payment) {
    // Update next billing date
    const nextBilling = new Date(invoice.period_end * 1000);
    payment.nextBillingDate = nextBilling;
    await payment.save();
  }
}

async function handleSubscriptionCancellation(subscription) {
  const payment = await Payment.findOne({ 
    subscriptionId: subscription.id 
  });
  
  if (payment) {
    await payment.cancelSubscription('webhook_cancellation', 'system');
  }
}

function calculateMonthlyLoss(auditData) {
  // Same logic as in landing.js
  let monthlyLoss = 0;
  
  if (auditData.citationAnalysis?.citationCompletionRate < 60) {
    monthlyLoss += 800;
  }
  
  if (auditData.socialMediaAnalysis?.socialScore < 40) {
    monthlyLoss += 600;
  }
  
  if (auditData.pagespeedAnalysis?.mobileScore < 70) {
    monthlyLoss += 900;
  }
  
  if (auditData.reviewCount < 20) {
    monthlyLoss += 700;
  }
  
  if (auditData.localContentScore < 50) {
    monthlyLoss += 1200;
  }
  
  return monthlyLoss;
}

function extractProblems(auditData) {
  const problems = [];
  
  if (auditData.citationAnalysis?.citationCompletionRate < 60) {
    problems.push('Missing directory listings');
  }
  
  if (auditData.socialMediaAnalysis?.socialScore < 40) {
    problems.push('Weak social media presence');
  }
  
  if (auditData.pagespeedAnalysis?.mobileScore < 70) {
    problems.push('Slow website performance');
  }
  
  if (auditData.localContentScore < 50) {
    problems.push('Poor local SEO');
  }
  
  return problems;
}

module.exports = router;