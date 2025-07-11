// backend/routes/content.js
const express = require('express');
const router = express.Router();

// Import your terminal logger if available
let terminal;
try {
  terminal = require('../Utils/terminalLogger');
} catch (err) {
  // Fallback to console if terminal logger not available
  terminal = {
    info: console.log,
    success: console.log,
    warning: console.warn,
    error: console.error
  };
}

// ===== CONTENT MANAGEMENT ENDPOINTS =====

// Generate test content for demo/development
router.post("/test-generation", async (req, res) => {
  try {
    const businessId = req.body.businessId || 'demo-business';
    
    // Mock content generation (replace with real AI generation later)
    const content = {
      blogPosts: [
        {
          id: `blog-${Date.now()}-1`,
          title: "Emergency Plumbing Services in Eagle Mountain",
          content: "When plumbing emergencies strike...",
          seoKeywords: ["emergency plumbing", "Eagle Mountain plumber"],
          status: 'pending',
          createdAt: new Date()
        },
        {
          id: `blog-${Date.now()}-2`, 
          title: "Water Heater Replacement Guide",
          content: "Signs your water heater needs replacement...",
          seoKeywords: ["water heater replacement", "plumbing repair"],
          status: 'pending',
          createdAt: new Date()
        }
      ],
      socialPosts: [
        {
          id: `social-${Date.now()}-1`,
          platform: 'Facebook',
          content: "🚨 Emergency plumbing? We're available 24/7! Call now for immediate service.",
          hashtags: ["#emergency", "#plumbing", "#EagleMountain"],
          status: 'pending',
          createdAt: new Date()
        },
        {
          id: `social-${Date.now()}-2`,
          platform: 'Instagram', 
          content: "✨ Before & after: basement flood cleanup! Professional service you can trust.",
          hashtags: ["#beforeafter", "#plumbing", "#professional"],
          status: 'pending',
          createdAt: new Date()
        }
      ],
      emailSequence: [
        {
          id: `email-${Date.now()}-1`,
          subject: "Welcome to Eagle Mountain Plumbing!",
          content: "Thank you for choosing us for your plumbing needs...",
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
router.get("/business/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { type, status } = req.query;

    // Mock data (replace with database query later)
    let allContent = [
      {
        _id: '1',
        businessId,
        type: 'blog',
        status: 'pending',
        title: 'Emergency Plumbing Services',
        content: 'When plumbing emergencies happen...',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        seoKeywords: ['emergency plumbing', 'Eagle Mountain']
      },
      {
        _id: '2',
        businessId,
        type: 'blog', 
        status: 'approved',
        title: 'Water Heater Maintenance Tips',
        content: 'Regular maintenance extends life...',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        _id: '3',
        businessId,
        type: 'social',
        status: 'pending',
        platform: 'Facebook',
        content: '🔧 Need a reliable plumber? We\'re here 24/7!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        _id: '4',
        businessId,
        type: 'email',
        status: 'approved',
        subject: 'Welcome to Our Service',
        content: 'Thank you for choosing us...',
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

    terminal.info("📋 Fetched business content", { 
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
router.get("/status/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

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

    terminal.info("📊 Fetched content status", { businessId, stats });

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
router.post("/:contentId/approve", async (req, res) => {
  try {
    const { contentId } = req.params;
    const { approvedBy = 'client' } = req.body;

    // Mock approval (replace with database update later)
    const updatedContent = {
      contentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date()
    };

    terminal.success("✅ Content approved", { contentId, approvedBy });

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
router.post("/:contentId/reject", async (req, res) => {
  try {
    const { contentId } = req.params;
    const { feedback, rejectedBy = 'client' } = req.body;

    if (!feedback) {
      return res.status(400).json({
        success: false,
        error: "Feedback is required for rejection"
      });
    }

    // Mock rejection (replace with database update later)
    const updatedContent = {
      contentId,
      status: 'rejected',
      rejectedBy,
      rejectedAt: new Date(),
      feedback
    };

    terminal.warning("❌ Content rejected", { contentId, rejectedBy, feedback });

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
router.post("/bulk-approve", async (req, res) => {
  try {
    const { contentIds, approvedBy = 'client' } = req.body;

    if (!contentIds || !Array.isArray(contentIds) || contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "contentIds array is required"
      });
    }

    // Mock bulk approval (replace with database bulk update later)
    const approvedContent = contentIds.map(contentId => ({
      contentId,
      status: 'approved',
      approvedBy,
      approvedAt: new Date()
    }));

    terminal.success("✅ Bulk content approved", { 
      count: contentIds.length, 
      approvedBy,
      contentIds 
    });

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
router.get("/business/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;

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

    terminal.info("🏢 Fetched business info", { businessId, businessName: business.businessName });

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

module.exports = router;