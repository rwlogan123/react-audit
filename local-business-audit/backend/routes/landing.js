// /backend/routes/landing.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Models
const Payment = require('../models/Payment');

// Services
const auditStorage = require('../services/auditStorage');
const emailService = require('../services/shared/emailService');

// Middleware
const rateLimiter = require('../middleware/rateLimiting');

/**
 * GET /api/landing/data
 * Get landing page data for a specific audit
 */
router.get('/data', async (req, res) => {
  try {
    const { auditId, sessionToken } = req.query;
    
    if (!auditId && !sessionToken) {
      return res.status(400).json({
        success: false,
        error: 'Either auditId or sessionToken is required'
      });
    }
    
    let auditData;
    
    // Get audit data from database or session
    if (auditId) {
      auditData = await auditStorage.getAuditById(auditId);
    } else if (sessionToken) {
      // Decode session token to get audit data
      auditData = await auditStorage.getAuditBySession(sessionToken);
    }
    
    if (!auditData) {
      return res.status(404).json({
        success: false,
        error: 'Audit data not found'
      });
    }
    
    // Extract problems and metrics for landing page
    const landingData = {
      businessInfo: {
        name: auditData.businessName,
        location: auditData.location,
        website: auditData.website,
        phone: auditData.phone
      },
      auditSummary: {
        visibilityScore: auditData.visibilityScore,
        criticalIssues: auditData.actionItems?.critical?.length || 0,
        monthlyLoss: calculateMonthlyLoss(auditData),
        problems: extractProblemsForLanding(auditData)
      },
      recommendations: {
        quickWins: identifyQuickWins(auditData),
        longTermGoals: identifyLongTermGoals(auditData),
        contentOpportunities: identifyContentOpportunities(auditData)
      },
      pricing: {
        standard: {
          name: 'Standard',
          price: 2997,
          savings: calculatePotentialSavings(auditData, 'standard'),
          features: getStandardFeatures()
        },
        premium: {
          name: 'Premium',
          price: 5997,
          savings: calculatePotentialSavings(auditData, 'premium'),
          features: getPremiumFeatures()
        }
      }
    };
    
    res.json({
      success: true,
      data: landingData
    });
    
  } catch (error) {
    console.error('Landing data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load landing page data'
    });
  }
});

/**
 * POST /api/landing/track-visit
 * Track landing page visits for analytics
 */
router.post('/track-visit', rateLimiter.createLimiter(100, 60), [
  body('auditId').isMongoId().withMessage('Valid audit ID required'),
  body('source').optional().isString(),
  body('utm_source').optional().isString(),
  body('utm_medium').optional().isString(),
  body('utm_campaign').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { auditId, source, utm_source, utm_medium, utm_campaign } = req.body;
    
    // Track the visit in analytics
    await trackLandingPageVisit({
      auditId,
      source,
      utm_source,
      utm_medium,
      utm_campaign,
      timestamp: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Visit tracked'
    });
    
  } catch (error) {
    console.error('Track visit error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track visit'
    });
  }
});

/**
 * POST /api/landing/request-demo
 * Handle demo requests from landing page
 */
router.post('/request-demo', rateLimiter.createLimiter(5, 3600), [
  body('auditId').isMongoId().withMessage('Valid audit ID required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone(),
  body('preferredTime').optional().isString(),
  body('questions').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { auditId, email, phone, preferredTime, questions } = req.body;
    
    // Get audit data for context
    const auditData = await auditStorage.getAuditById(auditId);
    if (!auditData) {
      return res.status(404).json({
        success: false,
        error: 'Audit not found'
      });
    }
    
    // Store demo request
    const demoRequest = {
      auditId,
      businessName: auditData.businessName,
      email,
      phone,
      preferredTime,
      questions,
      auditSummary: {
        score: auditData.visibilityScore,
        criticalIssues: auditData.actionItems?.critical?.length || 0
      },
      requestedAt: new Date(),
      status: 'pending'
    };
    
    await storeDemoRequest(demoRequest);
    
    // Send confirmation email to customer
    await emailService.sendDemoConfirmation({
      to: email,
      businessName: auditData.businessName,
      auditScore: auditData.visibilityScore
    });
    
    // Send notification to sales team
    await emailService.sendDemoNotification({
      demoRequest,
      auditData
    });
    
    res.json({
      success: true,
      message: 'Demo request submitted successfully'
    });
    
  } catch (error) {
    console.error('Demo request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process demo request'
    });
  }
});

/**
 * GET /api/landing/testimonials
 * Get testimonials for landing page
 */
router.get('/testimonials', async (req, res) => {
  try {
    const { businessType } = req.query;
    
    const testimonials = await getTestimonials(businessType);
    
    res.json({
      success: true,
      data: testimonials
    });
    
  } catch (error) {
    console.error('Testimonials error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load testimonials'
    });
  }
});

/**
 * GET /api/landing/case-studies
 * Get case studies for social proof
 */
router.get('/case-studies', async (req, res) => {
  try {
    const { businessType, limit = 3 } = req.query;
    
    const caseStudies = await getCaseStudies(businessType, parseInt(limit));
    
    res.json({
      success: true,
      data: caseStudies
    });
    
  } catch (error) {
    console.error('Case studies error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load case studies'
    });
  }
});

// Helper functions
function calculateMonthlyLoss(auditData) {
  let monthlyLoss = 0;
  
  // Calculate based on audit findings
  if (auditData.citationAnalysis?.citationCompletionRate < 60) {
    monthlyLoss += 800; // Missing citations
  }
  
  if (auditData.socialMediaAnalysis?.socialScore < 40) {
    monthlyLoss += 600; // Poor social presence
  }
  
  if (auditData.pagespeedAnalysis?.mobileScore < 70) {
    monthlyLoss += 900; // Slow website
  }
  
  if (auditData.reviewCount < 20) {
    monthlyLoss += 700; // Low review count
  }
  
  if (auditData.localContentScore < 50) {
    monthlyLoss += 1200; // Poor local SEO
  }
  
  return monthlyLoss;
}

function extractProblemsForLanding(auditData) {
  const problems = [];
  
  if (auditData.citationAnalysis?.citationCompletionRate < 60) {
    problems.push({
      title: 'Missing Directory Listings',
      description: `Only found in ${auditData.citationAnalysis.citationCompletionRate}% of key directories`,
      impact: 'Customers can\'t find you when searching online',
      urgency: 'high'
    });
  }
  
  if (auditData.socialMediaAnalysis?.socialScore < 40) {
    problems.push({
      title: 'Weak Social Media Presence',
      description: `Social score: ${auditData.socialMediaAnalysis.socialScore}/100`,
      impact: 'Missing opportunities to engage with potential customers',
      urgency: 'medium'
    });
  }
  
  if (auditData.pagespeedAnalysis?.mobileScore < 70) {
    problems.push({
      title: 'Slow Website Performance',
      description: `Mobile speed: ${auditData.pagespeedAnalysis.mobileScore}/100`,
      impact: 'Visitors leave before your page loads',
      urgency: 'high'
    });
  }
  
  if (auditData.localContentScore < 50) {
    problems.push({
      title: 'Poor Local SEO',
      description: `Local content score: ${auditData.localContentScore}/100`,
      impact: 'Not showing up in local search results',
      urgency: 'high'
    });
  }
  
  return problems;
}

function identifyQuickWins(auditData) {
  const quickWins = [];
  
  if (!auditData.schemaScore || auditData.schemaScore < 50) {
    quickWins.push('Add Local Business Schema markup');
  }
  
  if (auditData.reviewCount < 20) {
    quickWins.push('Set up automated review request system');
  }
  
  if (auditData.localContentScore < 30) {
    quickWins.push('Add location keywords to page titles');
  }
  
  return quickWins;
}

function identifyLongTermGoals(auditData) {
  return [
    'Build comprehensive citation profile across 50+ directories',
    'Create consistent content marketing strategy',
    'Develop local SEO authority in your market',
    'Build automated customer acquisition system'
  ];
}

function identifyContentOpportunities(auditData) {
  const businessType = auditData.businessType || 'home services';
  
  const opportunities = {
    'HVAC': [
      'Seasonal maintenance tips',
      'Energy efficiency guides',
      'Common repair problems',
      'Upgrade vs repair decisions'
    ],
    'Plumbing': [
      'Emergency prevention tips',
      'Seasonal pipe care',
      'DIY vs professional guidance',
      'Water efficiency solutions'
    ],
    'Roofing': [
      'Storm damage assessment',
      'Maintenance schedules',
      'Material comparisons',
      'Insurance claim guidance'
    ]
  };
  
  return opportunities[businessType] || opportunities['HVAC'];
}

function calculatePotentialSavings(auditData, plan) {
  const monthlyLoss = calculateMonthlyLoss(auditData);
  const planMultiplier = plan === 'premium' ? 0.8 : 0.6;
  
  return Math.round(monthlyLoss * planMultiplier);
}

function getStandardFeatures() {
  return [
    'AI-powered content strategy interview',
    '10+ blog posts per month targeting customer problems',
    'Social media content adapted from blogs',
    'Google Business Profile optimization',
    'Citation building to 25+ directories',
    'Basic review management system',
    'Monthly performance reports'
  ];
}

function getPremiumFeatures() {
  return [
    'Everything in Standard, plus:',
    'Weekly AI strategy calls',
    'Advanced review response automation',
    'Citation building to 50+ directories',
    'Video script generation',
    'Email marketing sequences',
    'Competitor monitoring and alerts',
    'Priority support and implementation'
  ];
}

// Analytics and storage functions (would typically be in separate services)
async function trackLandingPageVisit(visitData) {
  // Implementation for tracking visits
  // Could store in MongoDB, send to analytics service, etc.
  console.log('Landing page visit tracked:', visitData);
}

async function storeDemoRequest(demoRequest) {
  // Implementation for storing demo requests
  // Could store in MongoDB, send to CRM, etc.
  console.log('Demo request stored:', demoRequest);
}

async function getTestimonials(businessType) {
  // Implementation for getting testimonials
  // Could come from database, external service, etc.
  return [
    {
      text: "The AI interview was incredible - it pulled out customer problems I never thought to write about. Now we're getting calls from people who found our blog posts.",
      author: "Mike Johnson",
      business: "Johnson HVAC",
      location: "Dallas, TX",
      businessType: "HVAC",
      rating: 5
    },
    {
      text: "Went from 2 Google reviews to 47 in 3 months. The content system actually works - customers are engaging and calling.",
      author: "Sarah Martinez",
      business: "Martinez Plumbing",
      location: "Phoenix, AZ",
      businessType: "Plumbing",
      rating: 5
    }
  ];
}

async function getCaseStudies(businessType, limit) {
  // Implementation for getting case studies
  return [
    {
      businessName: "Elite HVAC Services",
      businessType: "HVAC",
      location: "Austin, TX",
      challenge: "No online presence, competing with big chains",
      solution: "AI-generated content strategy focusing on local expertise",
      results: {
        reviewIncrease: "300%",
        callIncrease: "150%",
        revenueIncrease: "$45,000/month"
      },
      timeframe: "6 months"
    }
  ];
}

module.exports = router;