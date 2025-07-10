// /backend/routes/content.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Models
const Content = require('../models/Content');
const Conversation = require('../models/Conversation');
const Payment = require('../models/Payment');

// Services
const blogGenerator = require('../services/marketing/blogGenerator');
const socialAdaptor = require('../services/marketing/socialAdaptor');
const distributionManager = require('../services/marketing/distributionManager');

// Middleware
const rateLimiter = require('../middleware/rateLimiting');

/**
 * POST /api/content/generate
 * Generate content from conversation problems
 */
router.post('/generate', rateLimiter.createLimiter(10, 3600), [
  body('conversationId').isMongoId().withMessage('Valid conversation ID required'),
  body('contentTypes').isArray().withMessage('Content types array required'),
  body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId, contentTypes, priority = 'high' } = req.body;

    // Get conversation and validate
    const conversation = await Conversation.findById(conversationId)
      .populate('paymentId');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Conversation must be completed first'
      });
    }

    // Get problems ready for content generation
    const problems = conversation.getProblemsForContentGeneration()
      .filter(p => priority === 'high' ? p.priority === 'high' : true)
      .slice(0, 10); // Limit to top 10 problems

    if (problems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No problems available for content generation'
      });
    }

    // Generate content for each problem and type
    const generatedContent = [];
    
    for (const problem of problems) {
      for (const contentType of contentTypes) {
        try {
          let content;

          switch (contentType) {
            case 'blog':
              content = await blogGenerator.generateBlogPost({
                problem: problem.problem,
                description: problem.description,
                businessContext: conversation.businessContext,
                category: problem.category
              });
              break;

            case 'social':
              content = await socialAdaptor.generateSocialPosts({
                problem: problem.problem,
                businessContext: conversation.businessContext,
                platforms: ['facebook', 'instagram', 'linkedin']
              });
              break;

            case 'email':
              content = await generateEmailContent({
                problem: problem.problem,
                businessContext: conversation.businessContext
              });
              break;

            case 'video':
              content = await generateVideoScript({
                problem: problem.problem,
                businessContext: conversation.businessContext
              });
              break;

            default:
              continue;
          }

          // Store content in database
          const contentRecord = new Content({
            businessId: conversation.businessId,
            conversationId: conversation._id,
            contentType,
            title: content.title,
            content: content.content,
            targetProblem: problem.problem,
            metadata: {
              problemId: problem._id,
              category: problem.category,
              priority: problem.priority,
              generatedBy: 'ai',
              model: content.model || 'gpt-4',
              tokensUsed: content.tokensUsed
            },
            status: 'draft',
            platforms: content.platforms || [],
            seoData: content.seoData || {},
            tags: [problem.category, contentType, conversation.businessContext.type]
          });

          await contentRecord.save();
          generatedContent.push(contentRecord);

        } catch (contentError) {
          console.error(`Error generating ${contentType} for problem:`, contentError);
          // Continue with other content types
        }
      }
    }

    // Update conversation content generation status
    conversation.contentGeneration.initiated = true;
    conversation.contentGeneration.initiatedAt = new Date();
    conversation.contentGeneration.blogPostsGenerated = generatedContent.filter(c => c.contentType === 'blog').length;
    conversation.contentGeneration.socialPostsGenerated = generatedContent.filter(c => c.contentType === 'social').length;
    conversation.contentGeneration.status = 'completed';
    
    await conversation.save();

    res.json({
      success: true,
      data: {
        contentGenerated: generatedContent.length,
        contentByType: contentTypes.map(type => ({
          type,
          count: generatedContent.filter(c => c.contentType === type).length
        })),
        problems: problems.length,
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Generate content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

/**
 * GET /api/content/:businessId
 * Get all content for a business
 */
router.get('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { 
      contentType, 
      status = 'all', 
      limit = 20, 
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { businessId };
    
    if (contentType) {
      query.contentType = contentType;
    }
    
    if (status !== 'all') {
      query.status = status;
    }

    // Execute query
    const content = await Content.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('conversationId', 'businessContext startedAt completedAt');

    const total = await Content.countDocuments(query);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: (parseInt(offset) + parseInt(limit)) < total
        }
      }
    });

  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content'
    });
  }
});

/**
 * GET /api/content/item/:contentId
 * Get specific content item
 */
router.get('/item/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId)
      .populate('conversationId', 'businessContext')
      .populate('businessId');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Get content item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content item'
    });
  }
});

/**
 * PUT /api/content/:contentId
 * Update content item
 */
router.put('/:contentId', [
  body('title').optional().isString().isLength({ min: 1, max: 200 }),
  body('content').optional().isString().isLength({ min: 1 }),
  body('status').optional().isIn(['draft', 'scheduled', 'published', 'archived']),
  body('publishDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { contentId } = req.params;
    const updates = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    // Update content
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        content[key] = updates[key];
      }
    });

    // Update modification tracking
    content.lastModified = new Date();
    content.modifiedBy = 'user'; // Could be user ID in real implementation

    await content.save();

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update content'
    });
  }
});

/**
 * POST /api/content/:contentId/publish
 * Publish content to specified platforms
 */
router.post('/:contentId/publish', [
  body('platforms').isArray().withMessage('Platforms array required'),
  body('scheduleDate').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { contentId } = req.params;
    const { platforms, scheduleDate } = req.body;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    // Publish or schedule content
    if (scheduleDate) {
      // Schedule for later
      content.status = 'scheduled';
      content.publishDate = new Date(scheduleDate);
      content.platforms = platforms;
      
      await content.save();

      // Add to scheduling queue
      await distributionManager.scheduleContent({
        contentId: content._id,
        platforms,
        scheduleDate: new Date(scheduleDate)
      });

      res.json({
        success: true,
        data: {
          status: 'scheduled',
          publishDate: content.publishDate,
          platforms
        }
      });

    } else {
      // Publish immediately
      const publishResults = await distributionManager.publishContent({
        content,
        platforms
      });

      content.status = 'published';
      content.publishDate = new Date();
      content.platforms = platforms;
      content.publishResults = publishResults;

      await content.save();

      res.json({
        success: true,
        data: {
          status: 'published',
          publishDate: content.publishDate,
          platforms,
          results: publishResults
        }
      });
    }

  } catch (error) {
    console.error('Publish content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to publish content'
    });
  }
});

/**
 * DELETE /api/content/:contentId
 * Delete content item
 */
router.delete('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    if (content.status === 'published') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete published content. Archive it instead.'
      });
    }

    await Content.findByIdAndDelete(contentId);

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete content'
    });
  }
});

/**
 * GET /api/content/analytics/:businessId
 * Get content performance analytics
 */
router.get('/analytics/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;
    const { timeframe = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await Content.aggregate([
      {
        $match: {
          businessId: businessId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          publishedContent: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftContent: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          scheduledContent: {
            $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
          },
          contentByType: {
            $push: '$contentType'
          }
        }
      }
    ]);

    // Content by type breakdown
    const contentByType = await Content.aggregate([
      {
        $match: {
          businessId: businessId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$contentType',
          count: { $sum: 1 },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        timeframe,
        overview: analytics[0] || {},
        contentByType,
        publishRate: analytics[0] ? 
          (analytics[0].publishedContent / analytics[0].totalContent * 100) : 0
      }
    });

  } catch (error) {
    console.error('Get content analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get content analytics'
    });
  }
});

// Helper functions
async function generateEmailContent({ problem, businessContext }) {
  // Implementation for email content generation
  return {
    title: `Email: ${problem}`,
    content: `Email content about ${problem} for ${businessContext.name}`,
    model: 'gpt-4',
    tokensUsed: 500
  };
}

async function generateVideoScript({ problem, businessContext }) {
  // Implementation for video script generation
  return {
    title: `Video: ${problem}`,
    content: `Video script about ${problem} for ${businessContext.name}`,
    model: 'gpt-4',
    tokensUsed: 800
  };
}

module.exports = router;