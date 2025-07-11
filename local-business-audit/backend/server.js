// backend/server.js
// Complete Local Business Audit Tool API with all 8 services integrated
// UPDATED VERSION - Now with MongoDB storage integration and strict audit limits
// PLUS: Local Brand Builder marketing automation routes
// PLUS: Terminal Dashboard for real-time monitoring
// PLUS: Client Dashboard Content Management APIs

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

const app = express();
const PORT = 5000; // Changed from 3001 to 5000 to match your ClientDashboard

// PROPER CORS FIX - Use cors package
app.use(cors({
  origin: true,  // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key', 'X-Audit-Token'],
  credentials: true
}));

// Fix for Codespaces proxy environment
app.set('trust proxy', true);

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
      terminal.info("📊 Client Dashboard Content APIs loaded");
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

// ===== HEALTH CHECK ENDPOINT =====
// Root route for basic API info
app.get('/', (req, res) => {
  res.json({
    message: 'BRANDAIDE API Server',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      audit: '/api/audit',
      content: '/api/content/*',
      business: '/api/business/*'
    },
    documentation: 'https://docs.brandaide.com'
  });
});

app.get("/api/health", (req, res) => {
  const healthStatus = {
    status: "healthy", 
    timestamp: new Date().toISOString(),
    services: "all systems operational",
    database: database.getDb() ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || 'development',
    version: "1.0.0"
  };
  
  terminal.info("💚 Health check requested", { 
    status: healthStatus.status,
    database: healthStatus.database 
  });
  
  res.json(healthStatus);
});

// ===== AUDIT ENDPOINTS (YOUR EXISTING AUDIT SYSTEM) =====
app.post("/api/audit", async (req, res) => {
  const auditId = `audit_${Date.now()}`;
  
  try {
    const auditData = req.body;
    
    terminal.startAudit(auditId);
    terminal.info('🎯 Audit started', {
      auditId,
      website: auditData.website,
      businessName: auditData.businessName,
      location: auditData.location
    });

    // Check audit limits
    const limitCheck = await auditLimiter.checkLimits(req.ip, auditData.website);
    if (!limitCheck.allowed) {
      terminal.warning('⚠️ Audit limit exceeded', {
        auditId,
        reason: limitCheck.reason,
        ip: req.ip
      });
      return res.status(429).json({
        success: false,
        error: limitCheck.reason,
        nextAllowedTime: limitCheck.nextAllowedTime
      });
    }

    // Store audit in database
    await auditStorage.saveAuditStart(auditId, auditData, req.ip);

    // Process the audit
    const auditResults = await auditProcessor.processFullAudit(auditData, auditId, terminal);

    // Store results in database
    await auditStorage.saveAuditComplete(auditId, auditResults);

    terminal.success('✅ Audit completed successfully', {
      auditId,
      duration: auditResults.processingTime,
      totalIssues: auditResults.summary?.totalIssues || 0
    });

    res.json({
      success: true,
      auditId,
      data: auditResults
    });

  } catch (error) {
    terminal.error("❌ Audit processing error", {
      auditId,
      error: error.message,
      stack: error.stack
    });

    // Store error in database
    await auditStorage.saveAuditError(auditId, error.message);

    res.status(500).json({
      success: false,
      error: error.message,
      auditId
    });
  }
});

// ===== CLIENT DASHBOARD CONTENT ENDPOINTS =====

// Generate test content for demo/development
app.post("/api/content/test-generation", async (req, res) => {
  try {
    const businessId = req.body.businessId || 'demo-business';
    
    terminal.info("📝 Generating test content", { businessId });
    
    // Mock content generation (replace with real AI generation later)
    const content = {
      blogPosts: [
        {
          id: `blog-${Date.now()}-1`,
          title: "Emergency Plumbing Services in Eagle Mountain",
          content: "When plumbing emergencies strike, Eagle Mountain residents need fast, reliable service. Our team provides 24/7 emergency plumbing services to handle burst pipes, clogged drains, and water heater failures. With over 10 years serving the Eagle Mountain community, we understand the unique plumbing challenges in our area.",
          seoKeywords: ["emergency plumbing Eagle Mountain", "24/7 plumber", "burst pipe repair"],
          status: 'pending',
          createdAt: new Date()
        },
        {
          id: `blog-${Date.now()}-2`, 
          title: "Water Heater Replacement Guide for Eagle Mountain Homes",
          content: "Is your water heater showing signs of failure? Our comprehensive guide helps Eagle Mountain homeowners recognize when it's time for a replacement. From energy efficiency improvements to cost considerations, we cover everything you need to know about upgrading your water heater.",
          seoKeywords: ["water heater replacement Eagle Mountain", "plumbing repair", "energy efficient water heater"],
          status: 'pending',
          createdAt: new Date()
        }
      ],
      socialPosts: [
        {
          id: `social-${Date.now()}-1`,
          platform: 'Facebook',
          content: "🚨 Emergency plumbing situation? Don't panic! Our Eagle Mountain team is available 24/7 for all your plumbing emergencies. Fast response times, fair pricing, and quality work guaranteed. Call us now! #EmergencyPlumbing #EagleMountain #24HourService",
          hashtags: ["#EmergencyPlumbing", "#EagleMountain", "#24HourService"],
          status: 'pending',
          createdAt: new Date()
        },
        {
          id: `social-${Date.now()}-2`,
          platform: 'Instagram', 
          content: "✨ Before & after: basement flood cleanup transformed! 💪 When water damage strikes, professional restoration makes all the difference. Trust our Eagle Mountain team for emergency water cleanup and plumbing repairs. #BeforeAndAfter #WaterDamage #ProfessionalService",
          hashtags: ["#BeforeAndAfter", "#WaterDamage", "#ProfessionalService"],
          status: 'pending',
          createdAt: new Date()
        }
      ],
      emailSequence: [
        {
          id: `email-${Date.now()}-1`,
          subject: "Welcome to Eagle Mountain Plumbing - Your Trusted Local Experts!",
          content: "Thank you for choosing Eagle Mountain Plumbing for your home service needs! As your local plumbing experts, we're committed to providing fast, reliable service to keep your home running smoothly. Over the next few days, you'll receive helpful tips and important information about maintaining your plumbing system.",
          sequencePosition: 1,
          status: 'pending',
          createdAt: new Date()
        }
      ]
    };

    terminal.success("📝 Generated test content", { 
      businessId, 
      blogPosts: content.blogPosts.length,
      socialPosts: content.socialPosts.length,
      emails: content.emailSequence.length 
    });

    res.json({
      success: true,
      message: "Test content generated successfully",
      businessId,
      content,
      summary: {
        total: content.blogPosts.length + content.socialPosts.length + content.emailSequence.length,
        blogPosts: content.blogPosts.length,
        socialPosts: content.socialPosts.length,
        emailSequence: content.emailSequence.length
      }
    });

  } catch (error) {
    terminal.error("❌ Error generating test content", { error: error.message });
    res.status(500).json({ 
      success: false,
      error: "Failed to generate test content" 
    });
  }
});

// Get all content for a business
app.get("/api/content/business/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { type, status } = req.query;

    terminal.info("📋 Fetching business content", { businessId, filters: { type, status } });

    // Mock data (replace with database query later)
    let allContent = [
      {
        _id: '1',
        businessId,
        type: 'blog',
        status: 'pending',
        title: 'Emergency Plumbing Services in Eagle Mountain',
        content: 'When plumbing emergencies happen, you need fast, reliable service...',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        seoKeywords: ['emergency plumbing', 'Eagle Mountain plumber'],
        wordCount: 1200
      },
      {
        _id: '2',
        businessId,
        type: 'blog', 
        status: 'approved',
        title: 'Water Heater Maintenance Tips for Homeowners',
        content: 'Regular maintenance extends the life of your water heater...',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        wordCount: 950
      },
      {
        _id: '3',
        businessId,
        type: 'social',
        status: 'pending',
        platform: 'Facebook',
        content: '🔧 Need a reliable plumber in Eagle Mountain? We\'re here 24/7! Fast service, fair pricing, guaranteed satisfaction.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        hashtags: ['#EagleMountainPlumber', '#EmergencyService']
      },
      {
        _id: '4',
        businessId,
        type: 'email',
        status: 'approved',
        subject: 'Welcome to Eagle Mountain Plumbing',
        content: 'Thank you for choosing our services. Here\'s what you can expect...',
        sequencePosition: 1,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    // Filter by type if specified
    if (type) {
      allContent = allContent.filter(item => item.type === type);
    }

    // Filter by status if specified
    if (status) {
      allContent = allContent.filter(item => item.status === status);
    }

    terminal.success("✅ Business content retrieved", { 
      businessId, 
      total: allContent.length,
      filters: { type, status }
    });

    res.json({
      success: true,
      data: {
        content: allContent,
        total: allContent.length,
        businessId
      }
    });

  } catch (error) {
    terminal.error("❌ Error fetching business content", { error: error.message });
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch content" 
    });
  }
});

// Get content statistics/status for dashboard metrics
app.get("/api/content/status/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    terminal.info("📊 Fetching content status", { businessId });

    // Mock statistics (replace with database aggregation later)
    const stats = {
      total: 48,
      pending: 12,
      approved: 28,
      rejected: 8,
      byType: [
        { _id: 'blog', count: 10 },
        { _id: 'social', count: 30 },
        { _id: 'email', count: 5 },
        { _id: 'website', count: 3 }
      ]
    };

    terminal.success("✅ Content status retrieved", { businessId, stats });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    terminal.error("❌ Error fetching content status", { error: error.message });
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch content status" 
    });
  }
});

// Approve content
app.post("/api/content/:contentId/approve", async (req, res) => {
  try {
    const { contentId } = req.params;
    const { approvedBy = 'client' } = req.body;

    terminal.success("✅ Content approved", { contentId, approvedBy });

    // Mock approval (replace with database update later)
    const updatedContent = {
      contentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date()
    };

    res.json({
      success: true,
      message: "Content approved successfully",
      data: updatedContent
    });

  } catch (error) {
    terminal.error("❌ Error approving content", { error: error.message });
    res.status(500).json({ 
      success: false,
      error: "Failed to approve content" 
    });
  }
});

// Reject content with feedback
app.post("/api/content/:contentId/reject", async (req, res) => {
  try {
    const { contentId } = req.params;
    const { feedback, rejectedBy = 'client' } = req.body;

    if (!feedback) {
      return res.status(400).json({
        success: false,
        error: "Feedback is required for rejection"
      });
    }

    terminal.warning("❌ Content rejected", { contentId, rejectedBy, feedback });

    // Mock rejection (replace with database update later)
    const updatedContent = {
      contentId,
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date(),
      feedback
    };

    res.json({
      success: true,
      message: "Content rejected with feedback",
      data: updatedContent
    });

  } catch (error) {
    terminal.error("❌ Error rejecting content", { error: error.message });
    res.status(500).json({ 
      success: false,
      error: "Failed to reject content" 
    });
  }
});

// Bulk approve multiple content items
app.post("/api/content/bulk-approve", async (req, res) => {
  try {
    const { contentIds, approvedBy = 'client' } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "contentIds array is required"
      });
    }

    terminal.success("✅ Bulk content approved", { 
      count: contentIds.length, 
      approvedBy,
      contentIds 
    });

    // Mock bulk approval (replace with database bulk update later)
    const approvedContent = contentIds.map(contentId => ({
      contentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date()
    }));

    res.json({
      success: true,
      message: `Approved ${contentIds.length} content items`,
      data: {
        approvedCount: contentIds.length,
        approvedContent
      }
    });

  } catch (error) {
    terminal.error("❌ Error bulk approving content", { error: error.message });
    res.status(500).json({ 
      success: false,
      error: "Failed to bulk approve content" 
    });
  }
});

// Get business information for dashboard header
app.get("/api/business/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

    terminal.info("🏢 Fetching business info", { businessId });

    // Mock business data (replace with database query later)
    const businesses = {
      'eagle-mountain-plumbing': {
        businessName: 'Eagle Mountain Plumbing',
        location: 'Eagle Mountain, UT',
        industry: 'Plumbing Services',
        plan: 'Professional',
        monthlyPrice: '$599',
        contactEmail: 'info@eaglemountainplumbing.com',
        website: 'https://eaglemountainplumbing.com',
        projectStatus: {
          websiteComplete: false,
          contentApproved: true,
          adsActive: true,
          citationsOngoing: true,
          reviewsActive: true
        }
      },
      'demo-business': {
        businessName: 'Demo Business',
        location: 'Salt Lake City, UT', 
        industry: 'Home Services',
        plan: 'Professional',
        monthlyPrice: '$599',
        contactEmail: 'demo@brandaide.com',
        website: 'https://demo.brandaide.com',
        projectStatus: {
          websiteComplete: false,
          contentApproved: false,
          adsActive: false,
          citationsOngoing: true,
          reviewsActive: true
        }
      }
    };

    const business = businesses[businessId] || businesses['demo-business'];

    terminal.success("✅ Business info retrieved", { businessId, businessName: business.businessName });

    res.json({
      success: true,
      business
    });

  } catch (error) {
    terminal.error("❌ Error fetching business info", { error: error.message });
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch business information" 
    });
  }
});

// Simple test endpoint
app.get("/api/test", (req, res) => {
  terminal.info("🧪 API test endpoint called");
  
  res.json({
    success: true,
    message: "API is working!",
    timestamp: new Date().toISOString(),
    endpoints: [
      "POST /api/content/test-generation",
      "GET /api/content/business/:businessId", 
      "GET /api/content/status/:businessId",
      "POST /api/content/:contentId/approve",
      "POST /api/content/:contentId/reject",
      "POST /api/content/bulk-approve",
      "GET /api/business/:businessId"
    ]
  });
});

// ===== GHL COMPATIBILITY ROUTES =====
// These routes make your backend compatible with your frontend expectations

// Alias for audit submission (frontend expects /api/audit/submit)
app.post("/api/audit/submit", async (req, res) => {
  // Forward to your existing audit endpoint
  req.url = '/api/audit';
  return app._router.handle(req, res);
});

// Generic error handling middleware
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
    requestId: req.requestId,
    message: "Something went wrong. We're here to help.",
    email: "support@brandaide.com",
    phone: "(555) 123-4567",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
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