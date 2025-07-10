// backend/server.js
// Complete Local Business Audit Tool API with all 8 services integrated
// UPDATED VERSION - Now with MongoDB storage integration and strict audit limits
// PLUS: Local Brand Builder marketing automation routes
// PLUS: Terminal Dashboard for real-time monitoring

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const dotenv = require("dotenv");
const http = require("http");
const path = require("path");

// Load environment variables
dotenv.config();

// Import Terminal Logger
const TerminalLogger = require("./Utils/terminalLogger");

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
// DISABLED CONTENT ROUTES TO AVOID CONFLICTS
// const contentRoutes = require('./routes/content');

const app = express();
const PORT = 5000; // Changed from 3001 to 5000 to match your ClientDashboard

// PROPER CORS FIX - Use cors package
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key', 'X-Audit-Token'],
  credentials: true
}));

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize terminal logger
const terminal = new TerminalLogger(server);

// Security middleware with exceptions for terminal
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests" },
  handler: (req, res) => {
    terminal.warning('⚠️ Rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      method: req.method
    });
    res.status(429).json({ error: "Too many requests" });
  }
});
app.use(limiter);

// Serve static files from Public directory
app.use(express.static(path.join(__dirname, 'Public')));

// Terminal dashboard route
app.get('/terminal', (req, res) => {
  if (process.env.NODE_ENV === 'development' || req.query.admin === process.env.ADMIN_KEY) {
    res.sendFile(path.join(__dirname, 'Public', 'terminal.html'));
  } else {
    terminal.warning('🚫 Unauthorized terminal access attempt', {
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    res.status(403).json({ error: 'Unauthorized' });
  }
});

app.use(express.json());

// Raw body parser for webhooks (must be before other parsers)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Attach request ID for tracking
  req.requestId = requestId;
  
  terminal.info(`📨 ${req.method} ${req.path}`, {
    requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    origin: req.headers.origin,
    userAgent: req.headers['user-agent']
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (res.statusCode >= 200 && res.statusCode < 300) {
      terminal.success(`✅ Response sent: ${res.statusCode}`, {
        requestId,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`
      });
    } else if (res.statusCode >= 400 && res.statusCode < 500) {
      terminal.warning(`⚠️ Client error: ${res.statusCode}`, {
        requestId,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`
      });
    } else if (res.statusCode >= 500) {
      terminal.error(`❌ Server error: ${res.statusCode}`, {
        requestId,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`
      });
    }
  });

  next();
});

// Add new Local Brand Builder route middlewares
app.use('/api/landing', landingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/onboarding', onboardingRoutes);
// DISABLED CONTENT ROUTES TO AVOID CONFLICTS
// app.use('/api/content', contentRoutes);

// Initialize database connection
async function initializeApp() {
  try {
    terminal.info('🔌 Connecting to MongoDB...');
    await database.connect();
    terminal.success("✅ MongoDB connected successfully");
    
    // Start server after database connection
    server.listen(PORT, () => {
      terminal.success(`🚀 Server started on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        pid: process.pid,
        nodeVersion: process.version
      });
      
      terminal.info("✅ Complete audit pipeline ready with 8 integrated services");
      terminal.info("🔑 API Integrations configured", {
        dataForSEO: !!process.env.DATAFORSEO_USER,
        openAI: !!process.env.OPENAI_API_KEY,
        googlePageSpeed: !!process.env.GOOGLE_PAGESPEED_API_KEY,
        googleSheets: !!process.env.GOOGLE_SHEETS_API_KEY,
        mongoDBAtlas: !!database.getDb()
      });
      terminal.info("🚀 Local Brand Builder Routes active");
      terminal.success("🎯 Ready to generate comprehensive local business audits!");
    });
  } catch (error) {
    terminal.error("❌ Failed to initialize app", {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

app.get("/api/health", (req, res) => {
  const healthStatus = {
    status: "healthy", 
    timestamp: new Date().toISOString(),
    services: "all systems operational",
    database: database.getDb() ? "connected" : "disconnected",
    cors: "enabled",
    origin: req.headers.origin,
    newRoutes: {
      landing: "available",
      payment: "available", 
      onboarding: "available",
      content: "available"
    }
  };
  
  terminal.info('🏥 Health check requested', healthStatus);
  res.json(healthStatus);
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

// ===== CONTENT MANAGEMENT ENDPOINTS =====
// These endpoints are now defined in server.js to avoid routing conflicts

// Test content generation endpoint - WORKING VERSION
app.post("/api/content/test-generation", async (req, res) => {
  const testId = `test_gen_${Date.now()}`;
  
  try {
    terminal.info('🧪 Test content generation requested', { testId });
    
    // Generate mock content for testing
    const businessId = `test_business_${Date.now()}`;
    const mockContent = {
      blogPosts: Array.from({ length: 10 }, (_, i) => ({
        _id: `blog_${businessId}_${i}`,
        businessId: businessId,
        title: `Blog Post ${i + 1}: Local SEO Tips for Eagle Mountain Businesses`,
        content: `This is a comprehensive guide about local SEO for businesses in Eagle Mountain, UT. Content includes optimization strategies, keyword research, and local citation building.`,
        status: i < 3 ? 'pending' : i < 8 ? 'approved' : 'rejected',
        contentType: 'blog',
        seoData: {
          keyword: `Eagle Mountain ${['SEO', 'marketing', 'business', 'local'][i % 4]}`
        },
        feedback: i >= 8 ? 'Please make the content more conversational and add local examples' : null,
        createdAt: new Date()
      })),
      socialPosts: Array.from({ length: 30 }, (_, i) => ({
        _id: `social_${businessId}_${i}`,
        businessId: businessId,
        title: `Social Media Post ${i + 1}`,
        content: `Engaging social media content for local audience...`,
        status: 'approved',
        contentType: 'social',
        createdAt: new Date()
      })),
      emailSequence: Array.from({ length: 5 }, (_, i) => ({
        _id: `email_${businessId}_${i}`,
        businessId: businessId,
        title: `Email ${i + 1}: Nurture Sequence`,
        content: `Email content for lead nurturing...`,
        status: 'approved',
        contentType: 'email',
        createdAt: new Date()
      }))
    };

    terminal.success('✅ Test content generated successfully', {
      testId,
      blogCount: mockContent.blogPosts.length,
      socialCount: mockContent.socialPosts.length,
      emailCount: mockContent.emailSequence.length
    });

    res.json({
      success: true,
      content: mockContent,
      summary: {
        businessId: businessId,
        totalItems: mockContent.blogPosts.length + mockContent.socialPosts.length + mockContent.emailSequence.length
      }
    });

  } catch (error) {
    terminal.error('❌ Test content generation failed', {
      testId,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to generate test content',
      message: error.message
    });
  }
});

// Approve content item
app.post("/api/content/:contentId/approve", async (req, res) => {
  try {
    const { contentId } = req.params;
    terminal.info('✅ Approving content', { contentId });
    
    res.json({
      success: true,
      message: 'Content approved successfully',
      contentId: contentId,
      status: 'approved',
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    terminal.error('❌ Error approving content', {
      contentId: req.params.contentId,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to approve content'
    });
  }
});

// Reject content item with feedback
app.post("/api/content/:contentId/reject", async (req, res) => {
  try {
    const { contentId } = req.params;
    const { feedback } = req.body;
    
    terminal.info('❌ Rejecting content', { 
      contentId, 
      feedbackLength: feedback?.length || 0 
    });
    
    res.json({
      success: true,
      message: 'Content rejected successfully',
      contentId: contentId,
      status: 'rejected',
      feedback: feedback,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    terminal.error('❌ Error rejecting content', {
      contentId: req.params.contentId,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to reject content'
    });
  }
});

// Bulk approve multiple content items
app.post("/api/content/bulk-approve", async (req, res) => {
  try {
    const { contentIds } = req.body;
    
    if (!Array.isArray(contentIds)) {
      return res.status(400).json({
        success: false,
        error: 'contentIds must be an array'
      });
    }
    
    terminal.info('✅ Bulk approving content', { 
      count: contentIds.length 
    });
    
    res.json({
      success: true,
      message: `Successfully approved ${contentIds.length} content items`,
      approvedIds: contentIds,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    terminal.error('❌ Error bulk approving content', {
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to bulk approve content'
    });
  }
});

// Get content status/metrics for a business
app.get("/api/content/status/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    
    terminal.info('📊 Getting content status', { businessId });
    
    const mockStats = {
      totalContent: 45,
      pendingReview: 3,
      approved: 38,
      rejected: 4,
      generating: 2,
      breakdown: {
        blogPosts: {
          total: 10,
          pending: 1,
          approved: 8,
          rejected: 1
        },
        socialPosts: {
          total: 30,
          pending: 2,
          approved: 25,
          rejected: 3
        },
        emailSequences: {
          total: 5,
          pending: 0,
          approved: 5,
          rejected: 0
        }
      }
    };
    
    res.json({
      success: true,
      businessId: businessId,
      stats: mockStats,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    terminal.error('❌ Error getting content status', {
      businessId: req.params.businessId,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get content status'
    });
  }
});

// Get all content for a business (with pagination)
app.get("/api/content/business/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { page = 1, limit = 20, status, type } = req.query;
    
    terminal.info('📋 Getting business content', { 
      businessId, 
      page, 
      limit, 
      status, 
      type 
    });
    
    const mockContent = Array.from({ length: parseInt(limit) }, (_, i) => ({
      _id: `content_${businessId}_${i}`,
      businessId: businessId,
      title: `Sample Content ${i + 1}`,
      content: `This is sample content for testing purposes...`,
      status: ['pending', 'approved', 'rejected'][i % 3],
      contentType: ['blog', 'social', 'email'][i % 3],
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      content: mockContent,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 100, // Mock total
        pages: Math.ceil(100 / parseInt(limit))
      },
      filters: {
        status,
        type
      }
    });
  } catch (error) {
    terminal.error('❌ Error getting business content', {
      businessId: req.params.businessId,
      error: error.message
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get business content'
    });
  }
});

// MAIN AUDIT ENDPOINT - Now with strict one-time audits and sales focus
app.post("/api/audit", async (req, res) => {
  const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    terminal.startGeneration(auditId);
    terminal.info("📝 Comprehensive audit request received", {
      auditId,
      businessName: req.body.businessName,
      location: req.body.location,
      requestId: req.requestId
    });

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
      canAudit = await terminal.measurePerformance('auditLimitCheck', async () => {
        return await auditLimiter.canRunAudit(
          req.body.businessName,
          req.body.location || `${req.body.city}, ${req.body.state}`,
          ipAddress,
          adminKey
        );
      });
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
      terminal.warning(`❌ Audit blocked`, {
        auditId,
        businessName: req.body.businessName,
        reason: canAudit.reason,
        ip: ipAddress
      });
      
      terminal.endGeneration(auditId, false);
      
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

    terminal.info("📍 Business location data", {
      auditId,
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

    terminal.info("🔑 API Keys Status", {
      auditId,
      dataForSEO: apiCredentials.username && apiCredentials.password ? "✅ SET" : "❌ MISSING",
      openAI: apiCredentials.openaiApiKey ? "✅ SET" : "❌ MISSING",
      googlePageSpeed: apiCredentials.googleApiKey ? "✅ SET" : "❌ MISSING",
      googleSheets: apiCredentials.googleSheetsApiKey ? "✅ SET" : "❌ MISSING"
    });

    // STEP 1: Website Content Analysis
    terminal.info("🌐 Step 1/8: Starting website analysis...", { auditId });
    const websiteResults = await terminal.measurePerformance('websiteAnalysis', async () => {
      return await analyzeWebsite(businessData);
    });
    terminal.success("✅ Website analysis complete", { auditId, step: "1/8" });

    // STEP 2: Competitor Analysis
    terminal.info("🏆 Step 2/8: Starting competitor analysis...", { auditId });
    const competitorResults = await terminal.measurePerformance('competitorAnalysis', async () => {
      return await analyzeCompetitors(businessData, apiCredentials);
    });
    terminal.success("✅ Competitor analysis complete", { auditId, step: "2/8" });

    // STEP 3: Keyword Analysis
    terminal.info("🔍 Step 3/8: Starting keyword analysis...", { auditId });
    const keywordResults = await terminal.measurePerformance('keywordAnalysis', async () => {
      return await analyzeKeywords(websiteResults, competitorResults, apiCredentials);
    });
    terminal.success("✅ Keyword analysis complete", { auditId, step: "3/8" });

    // STEP 4: Citation Analysis
    terminal.info("📊 Step 4/8: Starting citation analysis...", { auditId });
    const citationResults = await terminal.measurePerformance('citationAnalysis', async () => {
      return await analyzeCitations(businessData, websiteResults, competitorResults, apiCredentials);
    });
    terminal.success("✅ Citation analysis complete", { auditId, step: "4/8" });

    // STEP 5: PageSpeed Analysis
    terminal.info("⚡ Step 5/8: Starting PageSpeed analysis...", { auditId });
    const pagespeedResults = await terminal.measurePerformance('pageSpeedAnalysis', async () => {
      return await analyzePageSpeed(businessData, apiCredentials);
    });
    terminal.success("✅ PageSpeed analysis complete", { auditId, step: "5/8" });

    // STEP 6: Schema Markup Analysis
    terminal.info("🏗️ Step 6/8: Starting schema analysis...", { auditId });
    const schemaResults = await terminal.measurePerformance('schemaAnalysis', async () => {
      return await analyzeSchema(businessData);
    });
    terminal.success("✅ Schema analysis complete", { auditId, step: "6/8" });

    // STEP 7: Review & Reputation Analysis
    terminal.info("🌟 Step 7/8: Starting review & reputation analysis...", { auditId });
    const reviewResults = await terminal.measurePerformance('reviewAnalysis', async () => {
      return await analyzeReviews(businessData, competitorResults, apiCredentials);
    });
    terminal.success("✅ Review analysis complete", { auditId, step: "7/8" });

    // STEP 8: Final Audit Processing & Report Generation
    terminal.info("📋 Step 8/8: Starting comprehensive audit processing...", { auditId });
    
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

    const finalAuditResults = await terminal.measurePerformance('auditProcessing', async () => {
      return await auditProcessor.processAudit(businessDataWithResults);
    });
    terminal.success("✅ Comprehensive audit processing complete", { auditId, step: "8/8" });

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
    terminal.info("💾 Saving audit to MongoDB...", { auditId });
    
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
    const saveResult = await terminal.measurePerformance('saveToMongoDB', async () => {
      return await auditStorage.saveAudit(businessDataForStorage, auditResults);
    });
    terminal.success("✅ Audit saved to MongoDB", { 
      auditId, 
      mongoId: saveResult.auditId 
    });

    terminal.endGeneration(auditId, true);
    
    terminal.success(`🎉 Complete audit finished`, {
      auditId,
      executionTime: `${executionTime}ms`,
      visibilityScore: `${finalAuditResults.visibilityScore}/100`,
      performanceLevel: finalAuditResults.performanceLevel,
      issuesFound: finalAuditResults.totalImprovementsCount
    });

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
    terminal.endGeneration(auditId, false);
    terminal.error("❌ Complete audit processing failed", {
      auditId,
      error: error.message,
      stack: error.stack,
      businessName: req.body.businessName
    });
    
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

// Error handling middleware
app.use((err, req, res, next) => {
  terminal.error('💥 Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });
  
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.requestId 
  });
});

// Graceful shutdown
process.on("SIGINT", async () => {
  terminal.warning("👋 Shutting down gracefully...");
  await database.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  terminal.warning("👋 Shutting down gracefully...");
  await database.disconnect();
  process.exit(0);
});

// Global error handlers
process.on('uncaughtException', (error) => {
  terminal.error('💥 Uncaught Exception', {
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  terminal.error('💥 Unhandled Rejection', {
    reason: reason
  });
});

// Export terminal for use in other files
module.exports = { app, server, terminal };

// Initialize the application
initializeApp();