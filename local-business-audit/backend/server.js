// backend/server.js
// Complete Local Business Audit Tool API with all 8 services integrated
// UPDATED VERSION - Now with MongoDB storage integration and strict audit limits
// PLUS: Local Brand Builder marketing automation routes

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import MongoDB services
const database = require("./services/database");
const auditStorage = require("./services/auditStorage");

// Import existing services
const { analyzeWebsite } = require("./services/websiteService");
const { analyzeCompetitors } = require("./services/competitorService");
const { analyzeKeywords } = require("./services/keywordService");
const { analyzeCitations } = require("./services/citationService");
const { analyzePageSpeed } = require("./services/pagespeedService");
const { analyzeSchema } = require("./services/schemaService");
const { analyzeReviews } = require("./services/reviewService");
const auditProcessor = require("./services/auditProcessor");
const auditLimiter = require("./services/auditLimiter");

// Import new Local Brand Builder routes
const landingRoutes = require('./routes/landing');
const paymentRoutes = require('./routes/payment');
const onboardingRoutes = require('./routes/onboarding');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = 3001;

// Security middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests" }
});
app.use(limiter);

app.use(
  cors({
    origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : ["http://localhost:5173", "https://react-audit.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

// Raw body parser for webhooks (must be before other parsers)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Add new Local Brand Builder route middlewares
app.use('/api/landing', landingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/content', contentRoutes);

// Initialize database connection
async function initializeApp() {
  try {
    await database.connect();
    console.log("✅ MongoDB connected successfully");
    
    // Start server after database connection
    app.listen(PORT, () => {
      console.log(
        `🚀 Local Business Audit Tool API running on http://localhost:${PORT}`
      );
      console.log("✅ Complete audit pipeline ready with 8 integrated services:");
      console.log("   1. 🌐 Website Content Analysis");
      console.log("   2. 🏆 Competitor Analysis & Benchmarking");
      console.log("   3. 🔍 AI-Powered Keyword Analysis");
      console.log("   4. 📊 Citation & NAP Consistency Analysis");
      console.log("   5. ⚡ PageSpeed Performance Analysis");
      console.log("   6. 🏗️ Schema Markup Validation");
      console.log("   7. 🌟 Review & Reputation Analysis");
      console.log("   8. 📋 Final Audit Processing & Report Generation");
      console.log("🔑 API Integrations configured:");
      console.log("   • DataForSEO API (Competitor, Citation, Maps & Review data)");
      console.log("   • OpenAI API (AI keyword analysis)");
      console.log("   • Google PageSpeed API (Performance metrics)");
      console.log("   • Google Sheets API (Results storage) - Optional");
      console.log("   • MongoDB Atlas (Audit history & persistence)");
      console.log("🚀 NEW: Local Brand Builder Routes:");
      console.log("   • /api/landing - Landing page data and analytics");
      console.log("   • /api/payment - Payment processing and subscriptions");
      console.log("   • /api/onboarding - AI chat onboarding system");
      console.log("   • /api/content - Content generation and publishing");
      console.log("🎯 Ready to generate comprehensive local business audits and convert to customers!");
    });
  } catch (error) {
    console.error("❌ Failed to initialize app:", error);
    process.exit(1);
  }
}

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    services: "all systems operational",
    database: database.getDb() ? "connected" : "disconnected",
    newRoutes: {
      landing: "available",
      payment: "available", 
      onboarding: "available",
      content: "available"
    }
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// MAIN AUDIT ENDPOINT - Now with strict one-time audits and sales focus
app.post("/api/audit", async (req, res) => {
  try {
    console.log(
      "📝 Comprehensive audit request received:",
      req.body.businessName
    );

    // Get client IP address
    const ipAddress = req.headers["x-forwarded-for"] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress ||
                     "unknown";

    // Extract admin key or token if provided
    const adminKey = req.headers["x-admin-key"];
    const auditToken = req.headers["x-audit-token"];

    // Check if audit is allowed
    let canAudit;
    
    if (auditToken) {
      // Verify one-time token
      const tokenResult = auditLimiter.verifyAuditToken(auditToken);
      if (tokenResult.valid) {
        canAudit = { allowed: true, message: "Valid audit token" };
      } else {
        canAudit = { allowed: false, reason: "invalid_token", message: tokenResult.reason };
      }
    } else {
      // Regular audit limit check
      canAudit = await auditLimiter.canRunAudit(
        req.body.businessName,
        req.body.location || `${req.body.city}, ${req.body.state}`,
        ipAddress,
        adminKey
      );
    }

    // Log the attempt (tracks leads!)
    await auditLimiter.logAuditAttempt(
      req.body.businessName,
      req.body.location,
      ipAddress,
      canAudit.allowed,
      canAudit.reason
    );

    // If audit not allowed, return sales-focused response
    if (!canAudit.allowed) {
      console.log(`❌ Audit blocked for ${req.body.businessName}: ${canAudit.reason}`);
      
      // Different responses for different scenarios
      if (canAudit.reason === "duplicate") {
        return res.status(403).json({
          success: false,
          error: "Free audit already completed",
          reason: canAudit.reason,
          existingAuditId: canAudit.auditId,
          lastAuditDate: canAudit.lastAuditDate,
          visibilityScore: canAudit.visibilityScore,
          message: "Great news! We've already analyzed your business.",
          callToAction: "Ready to turn your audit results into real growth?",
          contactInfo: {
            headline: "Get Your Personalized SEO Strategy",
            email: "your-email@domain.com", // UPDATE THIS
            phone: "(555) 123-4567", // UPDATE THIS
            calendlyLink: "https://calendly.com/your-link", // UPDATE THIS
            website: "https://yourwebsite.com/consultation" // UPDATE THIS
          },
          benefits: [
            "📊 Detailed breakdown of your audit results",
            "🎯 Custom SEO strategy tailored to your business",
            "💰 Clear ROI projections and realistic timeline",
            "🚀 Priority action items for quick wins",
            "🔍 Competitor analysis and market positioning",
            "📈 Monthly growth tracking and reporting"
          ],
          nextSteps: "Schedule your free 30-minute consultation to discuss your results and growth strategy."
        });
      } else if (canAudit.reason === "rate_limit") {
        return res.status(429).json({
          success: false,
          error: "Daily audit limit reached",
          reason: canAudit.reason,
          resetTime: canAudit.resetTime,
          message: "You've used all available free audits for today.",
          callToAction: "Looking to audit multiple businesses?",
          contactInfo: {
            headline: "Let's Discuss an Agency Partnership",
            email: "your-email@domain.com", // UPDATE THIS
            phone: "(555) 123-4567", // UPDATE THIS
            calendlyLink: "https://calendly.com/your-link" // UPDATE THIS
          },
          agencyBenefits: [
            "🔓 Unlimited business audits",
            "🏷️ White-label reporting options",
            "📊 Bulk audit capabilities",
            "💼 Agency dashboard access",
            "🤝 Dedicated account management",
            "💰 Volume pricing available"
          ]
        });
      }
      
      // Generic error
      return res.status(403).json({
        success: false,
        error: canAudit.message || "Audit not allowed",
        reason: canAudit.reason
      });
    }

    const startTime = Date.now();

    const businessData = {
      ...req.body,
      city: req.body.city || "",
      state: req.body.state || "",
      location: req.body.city && req.body.state 
        ? `${req.body.city}, ${req.body.state}` 
        : req.body.location || "",
      // Store normalized business ID for future lookups
      businessId: auditLimiter.normalizeBusinessId(
        req.body.businessName,
        req.body.location || `${req.body.city}, ${req.body.state}`
      )
    };

    console.log("📍 Business location data:", {
      city: businessData.city,
      state: businessData.state,
      location: businessData.location
    });

    const apiCredentials = {
      username: process.env.DATAFORSEO_USER,
      password: process.env.DATAFORSEO_PASS,
      openaiApiKey: process.env.OPENAI_API_KEY,
      googleApiKey: process.env.GOOGLE_PAGESPEED_API_KEY,
      googleSheetsApiKey: process.env.GOOGLE_SHEETS_API_KEY
    };

    console.log("🔑 API Keys Status:");
    console.log("DataForSEO User:", apiCredentials.username ? "✅ SET" : "❌ MISSING");
    console.log("DataForSEO Pass:", apiCredentials.password ? "✅ SET" : "❌ MISSING");
    console.log("OpenAI:", apiCredentials.openaiApiKey ? "✅ SET" : "❌ MISSING");
    console.log("Google PageSpeed:", apiCredentials.googleApiKey ? "✅ SET" : "❌ MISSING");
    console.log("Google Sheets:", apiCredentials.googleSheetsApiKey ? "✅ SET" : "❌ MISSING");

    // STEP 1: Website Content Analysis
    console.log("🌐 Step 1: Starting website analysis...");
    const websiteResults = await analyzeWebsite(businessData);
    console.log("✅ Website analysis complete");

    // STEP 2: Competitor Analysis
    console.log("🏆 Step 2: Starting competitor analysis...");
    const competitorResults = await analyzeCompetitors(
      businessData,
      apiCredentials
    );
    console.log("✅ Competitor analysis complete");

    // STEP 3: Keyword Analysis
    console.log("🔍 Step 3: Starting keyword analysis...");
    const keywordResults = await analyzeKeywords(
      websiteResults,
      competitorResults,
      apiCredentials
    );
    console.log("✅ Keyword analysis complete");

    // STEP 4: Citation Analysis
    console.log("📊 Step 4: Starting citation analysis...");
    const citationResults = await analyzeCitations(
      businessData,
      websiteResults,
      competitorResults,
      apiCredentials
    );
    console.log("✅ Citation analysis complete");

    // STEP 5: PageSpeed Analysis
    console.log("⚡ Step 5: Starting PageSpeed analysis...");
    const pagespeedResults = await analyzePageSpeed(businessData, apiCredentials);
    console.log("✅ PageSpeed analysis complete");

    // STEP 6: Schema Markup Analysis
    console.log("🏗️ Step 6: Starting schema analysis...");
    const schemaResults = await analyzeSchema(businessData);
    console.log("✅ Schema analysis complete");

    // STEP 7: Review & Reputation Analysis
    console.log("🌟 Step 7: Starting review & reputation analysis...");
    const reviewResults = await analyzeReviews(
      businessData,
      competitorResults,
      apiCredentials
    );
    console.log("✅ Review analysis complete");

    // STEP 8: Final Audit Processing & Report Generation
    console.log("📋 Step 8: Starting comprehensive audit processing...");
    
    const businessDataWithResults = {
      ...businessData,
      allAnalysisResults: {
        websiteResults,
        competitorResults,
        keywordResults,
        citationResults,
        pagespeedResults,
        schemaResults,
        reviewResults,
      }
    };

    const finalAuditResults = await auditProcessor.processAudit(businessDataWithResults);
    console.log("✅ Comprehensive audit processing complete");

    const executionTime = Date.now() - startTime;

    // Enhanced audit results combining all services with final processing
    const auditResults = {
      businessName: businessData.businessName,
      location: businessData.location,
      website: businessData.website,
      ...finalAuditResults,
      serviceResults: {
        websiteAnalysis: websiteResults,
        competitorAnalysis: competitorResults,
        keywordAnalysis: keywordResults,
        citationAnalysis: citationResults,
        pagespeedAnalysis: pagespeedResults,
        schemaAnalysis: schemaResults,
        reviewAnalysis: reviewResults,
      },
      auditSummary:
        finalAuditResults.auditSummary ||
        `${businessData.businessName} comprehensive analysis completed successfully!`,
      generatedAt: new Date().toISOString(),
      executionTimeMs: executionTime,
      servicesCompleted: {
        websiteAnalysis: websiteResults.success !== false,
        competitorAnalysis: competitorResults.success !== false,
        keywordAnalysis: keywordResults.success !== false,
        citationAnalysis: citationResults.success !== false,
        pagespeedAnalysis: pagespeedResults.success !== false,
        schemaAnalysis: schemaResults.success !== false,
        reviewAnalysis: reviewResults.success !== false,
        finalProcessing: finalAuditResults.success !== false,
      },
      allImprovementOpportunities: [
        ...(websiteResults.improvementOpportunities || []),
        ...(competitorResults.businessData?.improvementOpportunities || []),
        ...(keywordResults.parsedSections?.missingServiceKeywords || []).map(
          (kw) => `Target keyword: "${kw}"`
        ),
        ...(citationResults.recommendations || []),
        ...(pagespeedResults.recommendations || []),
        ...(schemaResults.recommendations || []),
        ...(reviewResults.recommendations || []),
      ],
      performanceMetrics: {
        overallVisibilityScore: finalAuditResults.visibilityScore || 0,
        websitePerformanceScore:
          pagespeedResults.overallSummary?.averageScore || 0,
        localContentScore: websiteResults.localContentScore || 0,
        competitivePosition:
          competitorResults.businessData?.completenessLevel || "Unknown",
        reviewPerformance: {
          businessReviewCount: reviewResults.businessReviewCount || 0,
          businessRating: reviewResults.businessRating || 0,
          competitorComparison: {
            avgCompetitorReviews: reviewResults.avgCompetitorReviewCount || 0,
            avgCompetitorRating: reviewResults.avgCompetitorRating || 0,
          },
        },
        citationConsistency:
          citationResults.consistencyScores?.napConsistency || 0,
        schemaImplementation: schemaResults.score || 0,
      },
    };

    // SAVE TO MONGODB
    console.log("💾 Saving audit to MongoDB...");
    
    // Extract business data for MongoDB storage
    const businessDataForStorage = {
      name: businessData.businessName,
      address: businessData.address || businessData.location,
      phone: businessData.phone,
      website: businessData.website,
      place_id: businessData.businessId, // Use normalized ID
      location: businessData.location,
      ipAddress: ipAddress, // Store IP for rate limiting
      email: businessData.email || req.body.email // Store email for recovery
    };

    // Save audit results to MongoDB
    const saveResult = await auditStorage.saveAudit(businessDataForStorage, auditResults);
    console.log("✅ Audit saved to MongoDB with ID:", saveResult.auditId);

    console.log(`🎉 Complete audit finished in ${executionTime}ms`);
    console.log(
      `📊 Final visibility score: ${finalAuditResults.visibilityScore}/100`
    );
    console.log(`🎯 Performance level: ${finalAuditResults.performanceLevel}`);
    console.log(`⚠️ Issues found: ${finalAuditResults.totalImprovementsCount}`);

    // Return response in the format the frontend expects
    res.json({
      success: true,
      data: auditResults,
      auditId: saveResult.auditId,
      contactId: `ghl_${Date.now()}`, // Generate contact ID for frontend
      paymentLink: 'https://pay.example.com/checkout', // TODO: Replace with real payment link
      results: {
        visibilityScore: auditResults.performanceMetrics.overallVisibilityScore,
        localSeoScore: auditResults.performanceMetrics.localContentScore || 0,
        websiteScore: auditResults.performanceMetrics.websitePerformanceScore || 0,
        socialScore: Math.round((auditResults.performanceMetrics.reviewPerformance.businessRating || 0) * 20), // Convert 5-star to percentage
        competitorScore: competitorResults.businessData?.competitiveScore || 70,
        overallScore: auditResults.performanceMetrics.overallVisibilityScore
      },
      message: `Audit completed and saved with ID: ${saveResult.auditId}`
    });
  } catch (error) {
    console.error("❌ Complete audit processing failed:", error);
    res.status(500).json({
      success: false,
      error: "Complete audit processing failed",
      message: error.message,
      contactInfo: {
        message: "Experiencing technical difficulties? We're here to help.",
        email: "your-email@domain.com", // UPDATE THIS
        phone: "(555) 123-4567" // UPDATE THIS
      },
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// ===== GHL COMPATIBILITY ROUTES =====
// These routes make your backend compatible with your frontend expectations

// Alias for audit submission (frontend expects /api/audit/submit)
app.post("/api/audit/submit", async (req, res) => {
  // Forward to your existing audit endpoint
  req.url = '/api/audit';
  return app._router.handle(req, res);
});

// GHL contact endpoint - get audit data by contact ID
app.get("/api/ghl/contact/:contactId", async (req, res) => {
  try {
    // Extract business ID from contact ID (you stored it as ghl_timestamp)
    const contactId = req.params.contactId;
    
    // For now, let's extract timestamp and find recent audit
    const timestamp = contactId.replace('ghl_', '');
    const searchTime = new Date(parseInt(timestamp));
    
    // Search for audit created around that time
    const db = database.getDb();
    const audit = await db.collection("audits").findOne({
      createdAt: {
        $gte: new Date(searchTime.getTime() - 60000), // Within 1 minute
        $lte: new Date(searchTime.getTime() + 60000)
      }
    });
    
    if (!audit) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    res.json({
      businessInfo: {
        businessName: audit.businessData.name,
        businessType: audit.businessData.businessType || req.body.businessType || 'local business',
        location: audit.businessData.location
      },
      auditData: {
        ...audit.businessData,
        visibilityScore: audit.data.visibilityScore || audit.data.performanceMetrics?.overallVisibilityScore,
        localSeoScore: audit.data.performanceMetrics?.localContentScore || 0,
        websiteScore: audit.data.performanceMetrics?.websitePerformanceScore || 0,
        socialScore: Math.round((audit.data.performanceMetrics?.reviewPerformance?.businessRating || 0) * 20),
        overallScore: audit.data.visibilityScore || audit.data.performanceMetrics?.overallVisibilityScore
      }
    });
    
  } catch (error) {
    console.error('GHL contact lookup error:', error);
    res.status(500).json({ error: 'Failed to get contact data' });
  }
});

// GHL onboarding endpoint - save interview responses
app.post("/api/ghl/onboarding/:contactId", async (req, res) => {
  try {
    const { responses } = req.body;
    const contactId = req.params.contactId;
    
    // Store the onboarding responses in MongoDB
    const db = database.getDb();
    
    // Create onboarding document
    const onboardingData = {
      contactId,
      responses,
      createdAt: new Date(),
      status: 'completed'
    };
    
    const result = await db.collection("onboarding").insertOne(onboardingData);
    
    console.log('Onboarding data saved:', result.insertedId);
    
    // TODO: Trigger content generation here
    // You can integrate with your existing content routes
    
    res.json({
      success: true,
      interviewId: result.insertedId.toString(),
      message: 'Onboarding data saved successfully'
    });
    
  } catch (error) {
    console.error('Onboarding save error:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// Recovery endpoint - find audit by email
app.post("/api/recover-audit", async (req, res) => {
  try {
    const { email, token } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }
    
    // Search for audits by email
    const db = database.getDb();
    const audit = await db.collection("audits").findOne({
      "businessData.email": email
    }, {
      sort: { createdAt: -1 } // Get most recent
    });
    
    if (!audit) {
      return res.json({ found: false });
    }
    
    res.json({
      found: true,
      businessInfo: {
        businessName: audit.businessData.name,
        businessType: audit.businessData.businessType || 'local business'
      },
      auditId: audit._id.toString(),
      contactId: `ghl_${new Date(audit.createdAt).getTime()}` // Recreate contact ID
    });
    
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ error: 'Recovery failed' });
  }
});

// Content stats endpoint (if not already in your content routes)
app.get("/api/content/user/:userId", async (req, res) => {
  // Mock response until you implement full content generation
  res.json({
    content: [
      { id: '1', type: 'blog', title: 'SEO Best Practices for Local Businesses', status: 'completed' },
      { id: '2', type: 'social', title: 'Facebook Post - Special Offer', status: 'generating' }
    ],
    stats: {
      total: 48,
      completed: 12,
      generating: 6,
      pending: 30
    }
  });
});

// NEW MONGODB ENDPOINTS

// Get audit by ID
app.get("/api/audit/:id", async (req, res) => {
  try {
    const audit = await auditStorage.getAuditById(req.params.id);
    if (!audit) {
      return res.status(404).json({ 
        success: false, 
        error: "Audit not found" 
      });
    }
    res.json({
      success: true,
      data: audit
    });
  } catch (error) {
    console.error("❌ Error fetching audit:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get audit history for a business
app.get("/api/audits/business/:businessId", async (req, res) => {
  try {
    const audits = await auditStorage.getAuditHistory(
      req.params.businessId,
      parseInt(req.query.limit) || 10
    );
    res.json({
      success: true,
      data: audits,
      count: audits.length
    });
  } catch (error) {
    console.error("❌ Error fetching audit history:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Search audits by business name
app.get("/api/audits/search", async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) {
      return res.status(400).json({ 
        success: false, 
        error: "Search query required" 
      });
    }
    
    const audits = await auditStorage.searchAudits(q, parseInt(limit));
    res.json({
      success: true,
      data: audits,
      count: audits.length,
      query: q
    });
  } catch (error) {
    console.error("❌ Error searching audits:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get audit statistics
app.get("/api/audits/stats", async (req, res) => {
  try {
    const stats = await auditStorage.getAuditStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("❌ Error fetching audit stats:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Re-run audit for a business - ADMIN ONLY
app.post("/api/audit/rerun/:businessId", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  
  if (!adminKey || adminKey !== process.env.AUDIT_ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      error: "Admin access required",
      message: "Re-audits require admin authorization. Please contact support."
    });
  }
  
  try {
    // Get the latest audit for this business
    const lastAudit = await auditStorage.getLatestAudit(req.params.businessId);
    if (!lastAudit) {
      return res.status(404).json({ 
        success: false, 
        error: "No previous audit found for this business" 
      });
    }
    
    // Re-run audit with the same business data
    const businessData = {
      businessName: lastAudit.businessData.name,
      website: lastAudit.businessData.website,
      address: lastAudit.businessData.address,
      phone: lastAudit.businessData.phone,
      location: lastAudit.businessData.location
    };
    
    // Set admin key for the audit
    req.body = businessData;
    req.headers["x-admin-key"] = adminKey;
    
    // Redirect to main audit endpoint
    return app._router.handle(req, res);
  } catch (error) {
    console.error("❌ Error re-running audit:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check for individual services
app.get("/api/health/services", (req, res) => {
  res.json({
    status: "OK",
    services: {
      websiteAnalysis: "Available",
      competitorAnalysis: "Available",
      keywordAnalysis: "Available",
      citationAnalysis: "Available",
      pagespeedAnalysis: "Available",
      schemaAnalysis: "Available",
      reviewAnalysis: "Available",
      auditProcessor: "Available",
      mongoDatabase: database.getDb() ? "Connected" : "Disconnected",
    },
    newRoutes: {
      landing: "Available",
      payment: "Available",
      onboarding: "Available", 
      content: "Available"
    },
    timestamp: new Date().toISOString(),
  });
});

// ADMIN ENDPOINTS

// Generate one-time audit token
app.post("/api/admin/generate-audit-token", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  
  if (!adminKey || adminKey !== process.env.AUDIT_ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
  }
  
  const { businessName, location, expiresIn } = req.body;
  
  if (!businessName || !location) {
    return res.status(400).json({
      success: false,
      error: "Business name and location required"
    });
  }
  
  const token = auditLimiter.generateAuditToken(businessName, location, expiresIn);
  
  res.json({
    success: true,
    token,
    expiresAt: new Date(Date.now() + (expiresIn || 3600000)),
    usage: "Include token in X-Audit-Token header when calling /api/audit"
  });
});

// Force audit with admin override
app.post("/api/admin/force-audit", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  
  if (!adminKey || adminKey !== process.env.AUDIT_ADMIN_KEY) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized"
    });
  }
  
  // Set admin key in request for the audit endpoint
  req.headers["x-admin-key"] = adminKey;
  
  // Forward to regular audit endpoint
  return app._router.handle(req, res);
});

// NEW ADMIN ENDPOINTS FOR LEAD MANAGEMENT

// Admin: View all audits with contact opportunities
app.get("/api/admin/audit-leads", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  
  if (!adminKey || adminKey !== process.env.AUDIT_ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Get all audits
    const db = database.getDb();
    const audits = await db.collection("audits")
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    // Group by business to find repeat attempts
    const businessAttempts = {};
    const ipAttempts = {};
    
    audits.forEach(audit => {
      const businessId = audit.businessData?.place_id || "unknown";
      const ip = audit.businessData?.ipAddress || "unknown";
      
      // Track by business
      if (!businessAttempts[businessId]) {
        businessAttempts[businessId] = {
          businessName: audit.businessData?.name,
          attempts: []
        };
      }
      businessAttempts[businessId].attempts.push({
        date: audit.createdAt,
        score: audit.data?.visibilityScore,
        ip: ip
      });
      
      // Track by IP
      if (!ipAttempts[ip]) {
        ipAttempts[ip] = new Set();
      }
      ipAttempts[ip].add(businessId);
    });

    // Find hot leads (businesses with multiple attempts)
    const hotLeads = Object.entries(businessAttempts)
      .filter(([_, data]) => data.attempts.length > 1)
      .map(([businessId, data]) => ({
        businessId,
        businessName: data.businessName,
        attemptCount: data.attempts.length,
        firstAttempt: data.attempts[data.attempts.length - 1].date,
        lastAttempt: data.attempts[0].date,
        attempts: data.attempts
      }))
      .sort((a, b) => b.attemptCount - a.attemptCount);

    // Find IPs auditing multiple businesses (agencies)
    const agencyProspects = Object.entries(ipAttempts)
      .filter(([_, businesses]) => businesses.size > 2)
      .map(([ip, businesses]) => ({
        ip,
        businessCount: businesses.size,
        businesses: Array.from(businesses)
      }))
      .sort((a, b) => b.businessCount - a.businessCount);

    res.json({
      success: true,
      summary: {
        totalAudits: audits.length,
        uniqueBusinesses: Object.keys(businessAttempts).length,
        hotLeadsCount: hotLeads.length,
        agencyProspectsCount: agencyProspects.length
      },
      hotLeads: hotLeads.slice(0, 20), // Top 20 hot leads
      agencyProspects: agencyProspects.slice(0, 10), // Top 10 agency prospects
      recentAudits: audits.slice(0, 10).map(audit => ({
        businessName: audit.businessData?.name,
        date: audit.createdAt,
        score: audit.data?.visibilityScore,
        issues: audit.data?.totalImprovementsCount
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Delete audit to allow re-run
app.delete("/api/admin/audit/:businessId", async (req, res) => {
  const adminKey = req.headers["x-admin-key"];
  
  if (!adminKey || adminKey !== process.env.AUDIT_ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const db = database.getDb();
    const result = await db.collection("audits").deleteMany({ 
      "businessData.place_id": req.params.businessId 
    });
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} audits for business ${req.params.businessId}`,
      businessCanReaudit: true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down gracefully...");
  await database.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n👋 Shutting down gracefully...");
  await database.disconnect();
  process.exit(0);
});

// Initialize the application
initializeApp();