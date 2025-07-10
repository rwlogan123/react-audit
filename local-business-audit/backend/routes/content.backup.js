// /backend/routes/content.js
const express = require('express');
const { body, validationResult } = require('express-validator');

// Import terminal logger from server
const { terminal } = require('../server');

// Models
const Content = require('../models/Content');
const Conversation = require('../models/Conversation');
const Payment = require('../models/Payment');

// Services
const BlogGenerator = require('../services/marketing/blogGenerator');
const SocialAdaptor = require('../services/marketing/socialAdaptor');
const ContentOrchestrator = require('../services/marketing/contentOrchestrator');
const distributionManager = require('../services/marketing/distributionManager');

// Middleware
const rateLimiter = require('../middleware/rateLimiting');

const router = express.Router();

/**
 * POST /api/content/generate-from-interview
 * Generate content from interview data (new endpoint)
 */
router.post('/generate-from-interview', rateLimiter.createLimiter(10, 3600), [
  body('businessId').isMongoId().withMessage('Valid business ID required'),
  body('interviewData').isObject().withMessage('Interview data required'),
  body('interviewData.businessName').notEmpty().withMessage('Business name required'),
  body('interviewData.businessType').notEmpty().withMessage('Business type required'),
  body('interviewData.location').notEmpty().withMessage('Location required'),
  body('interviewData.primaryServices').notEmpty().withMessage('Primary services required'),
  body('contentTypes').optional().isArray().withMessage('Content types must be an array')
], async (req, res) => {
  const generationId = `content_gen_${Date.now()}`;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { businessId, interviewData, contentTypes = ['blog', 'social', 'email'] } = req.body;

    terminal.startGeneration(generationId);
    terminal.info('📝 Content generation from interview started', {
      generationId,
      businessId,
      businessName: interviewData.businessName,
      contentTypes,
      interviewDataKeys: Object.keys(interviewData)
    });

    // Log the full interview data for debugging
    terminal.info('🎤 Interview Data Input', {
      generationId,
      interviewData: interviewData
    });

    // Initialize content orchestrator with progress tracking
    const orchestrator = new ContentOrchestrator(interviewData, {
      businessId,
      onProgress: (message, progress) => {
        terminal.info(`📊 Generation Progress: ${progress}%`, {
          generationId,
          businessId,
          message,
          progress
        });
      },
      onStepComplete: (step, data) => {
        terminal.success(`✅ Step Completed: ${step}`, {
          generationId,
          businessId,
          step,
          dataPreview: data ? Object.keys(data) : null
        });
      },
      onError: (step, error) => {
        terminal.error(`❌ Error in ${step}`, {
          generationId,
          businessId,
          step,
          error: error.message
        });
      }
    });

    // Generate all content
    terminal.info('🚀 Starting content generation process', { generationId });
    const results = await terminal.measurePerformance(`contentGeneration_${generationId}`, async () => {
      return await orchestrator.generateAll();
    });
    
    // Log AI outputs
    terminal.success('🤖 AI Content Generated', {
      generationId,
      businessId,
      summary: {
        blogPosts: results.blogPosts?.length || 0,
        socialPosts: results.socialPosts?.length || 0,
        emails: results.emails?.length || 0,
        totalPieces: (results.blogPosts?.length || 0) + (results.socialPosts?.length || 0) + (results.emails?.length || 0)
      },
      sampleOutput: {
        firstBlogTitle: results.blogPosts?.[0]?.title,
        firstSocialPost: results.socialPosts?.[0]?.content?.substring(0, 100) + '...',
        errors: results.errors
      }
    });
    
    // Save to database
    terminal.info('💾 Saving content to database', { generationId });
    const savedContent = await terminal.measurePerformance(`saveContent_${generationId}`, async () => {
      return await orchestrator.saveToDatabase();
    });

    terminal.endGeneration(generationId, true);
    terminal.success('🎉 Content generation completed', {
      generationId,
      businessId,
      contentId: savedContent._id,
      totalTime: results.metadata.generationTime
    });

    // Return detailed results
    res.json({
      success: true,
      data: {
        contentId: savedContent._id,
        businessId,
        summary: orchestrator.getSummary(),
        content: {
          blogPosts: results.blogPosts.length,
          socialPosts: results.socialPosts.length,
          emails: results.emails.length
        },
        errors: results.errors,
        generationTime: results.metadata.generationTime
      }
    });

  } catch (error) {
    terminal.endGeneration(generationId, false);
    terminal.error('❌ Generate content from interview error', {
      generationId,
      businessId: req.body.businessId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate content from interview data',
      details: error.message
    });
  }
});

/**
 * POST /api/content/generate
 * Generate content from conversation problems (original endpoint)
 */
router.post('/generate', rateLimiter.createLimiter(10, 3600), [
  body('conversationId').isMongoId().withMessage('Valid conversation ID required'),
  body('contentTypes').isArray().withMessage('Content types array required'),
  body('priority').optional().isIn(['high', 'medium', 'low']).withMessage('Invalid priority')
], async (req, res) => {
  const generationId = `content_gen_${Date.now()}`;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId, contentTypes, priority = 'high' } = req.body;

    terminal.startGeneration(generationId);
    terminal.info('📝 Content generation from conversation started', {
      generationId,
      conversationId,
      contentTypes,
      priority
    });

    // Get conversation and validate
    const conversation = await Conversation.findById(conversationId)
      .populate('paymentId');

    if (!conversation) {
      terminal.warning('⚠️ Conversation not found', { conversationId });
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

    terminal.info('🎯 Problems selected for content', {
      generationId,
      problemCount: problems.length,
      problems: problems.map(p => ({
        problem: p.problem,
        category: p.category,
        priority: p.priority
      }))
    });

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
          terminal.info(`🔄 Generating ${contentType} for problem`, {
            generationId,
            contentType,
            problem: problem.problem,
            category: problem.category
          });

          let content;

          switch (contentType) {
            case 'blog':
              // Log blog generation input
              terminal.info('🤖 Blog Generation AI Input', {
                generationId,
                businessContext: conversation.businessContext,
                problem: problem.problem,
                targetKeyword: problem.category
              });

              const blogGen = new BlogGenerator({
                ...conversation.businessContext,
                topProblems: problem.problem,
                idealCustomer: conversation.businessContext.targetAudience
              });
              
              content = await terminal.measurePerformance(`blogGen_${generationId}`, async () => {
                return await blogGen.generatePost({
                  title: problem.problem,
                  target_keyword: problem.category
                });
              });

              // Log blog generation output
              terminal.success('✅ Blog Generation AI Output', {
                generationId,
                title: content.title,
                wordCount: content.content?.split(' ').length,
                seoKeyword: content.seoData?.keyword,
                preview: content.content?.substring(0, 200) + '...'
              });
              break;

            case 'social':
              // Log social generation input
              terminal.info('🤖 Social Posts Generation AI Input', {
                generationId,
                businessContext: conversation.businessContext.businessName,
                problem: problem.problem,
                postsRequested: 5
              });

              const socialGen = new SocialAdaptor({
                ...conversation.businessContext,
                topProblems: problem.problem
              });
              
              const socialResults = await terminal.measurePerformance(`socialGen_${generationId}`, async () => {
                return await socialGen.generatePosts(5); // 5 posts per problem
              });

              // Log social generation output
              terminal.success('✅ Social Posts Generation AI Output', {
                generationId,
                postsGenerated: socialResults.posts?.length,
                platforms: ['facebook', 'instagram', 'linkedin'],
                firstPost: socialResults.posts?.[0]?.content?.substring(0, 100) + '...',
                hashtags: socialResults.posts?.[0]?.hashtags
              });

              content = {
                title: `Social posts for: ${problem.problem}`,
                content: socialResults.posts,
                platforms: ['facebook', 'instagram', 'linkedin']
              };
              break;

            case 'email':
              terminal.info('🤖 Email Generation AI Input', {
                generationId,
                problem: problem.problem,
                businessName: conversation.businessContext.name
              });

              content = await terminal.measurePerformance(`emailGen_${generationId}`, async () => {
                return await generateEmailContent({
                  problem: problem.problem,
                  businessContext: conversation.businessContext
                });
              });

              terminal.success('✅ Email Generation AI Output', {
                generationId,
                subject: content.title,
                preview: content.content?.substring(0, 150) + '...'
              });
              break;

            case 'video':
              terminal.info('🤖 Video Script Generation AI Input', {
                generationId,
                problem: problem.problem,
                businessName: conversation.businessContext.name
              });

              content = await terminal.measurePerformance(`videoGen_${generationId}`, async () => {
                return await generateVideoScript({
                  problem: problem.problem,
                  businessContext: conversation.businessContext
                });
              });

              terminal.success('✅ Video Script Generation AI Output', {
                generationId,
                title: content.title,
                duration: content.duration,
                preview: content.content?.substring(0, 150) + '...'
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
              model: content.model || 'gpt-3.5-turbo',
              tokensUsed: content.tokensUsed
            },
            status: 'draft',
            platforms: content.platforms || [],
            seoData: content.seoData || {},
            tags: [problem.category, contentType, conversation.businessContext.type]
          });

          await contentRecord.save();
          generatedContent.push(contentRecord);

          terminal.success(`✅ ${contentType} content saved`, {
            generationId,
            contentId: contentRecord._id,
            title: contentRecord.title
          });

        } catch (contentError) {
          terminal.error(`❌ Error generating ${contentType} for problem`, {
            generationId,
            contentType,
            problem: problem.problem,
            error: contentError.message
          });
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

    terminal.endGeneration(generationId, true);
    terminal.success('🎉 All content generation completed', {
      generationId,
      totalGenerated: generatedContent.length,
      breakdown: contentTypes.map(type => ({
        type,
        count: generatedContent.filter(c => c.contentType === type).length
      }))
    });

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
    terminal.endGeneration(generationId, false);
    terminal.error('❌ Generate content error', {
      generationId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

/**
 * POST /api/content/test-generation
 * Test content generation with sample data
 */
router.post('/test-generation', async (req, res) => {
  const testId = `test_gen_${Date.now()}`;
  
  const sampleData = {
    businessName: "LM Finishing and Construction",
    businessType: "Carpenter / Construction Contractor",
    location: "Eagle Mountain, UT",
    primaryServices: "Basement finishing, custom carpentry, home remodeling",
    marketingGoal: "Get more basement finishing leads",
    idealCustomer: "Homeowners aged 30-50 with growing families",
    topProblems: "Need more living space; Unfinished basement is wasted space",
    uniqueSolution: "We maximize every square foot with smart design",
    commonQuestions: "How much does it cost?; How long will it take?",
    brandPersonality: "Professional but approachable",
    specialOffers: "10% off for first responders",
    nextStep: "Free 30-minute consultation",
    projectStory: "The Johnson family with 5 kids transformed their basement",
    misconceptions: "People think it's just drywall",
    serviceAreas: "Eagle Mountain, Lehi, American Fork"
  };
  
  try {
    terminal.startGeneration(testId);
    terminal.info('🧪 Test generation started', {
      testId,
      businessName: sampleData.businessName,
      businessType: sampleData.businessType
    });

    // Log the sample data being used
    terminal.info('📋 Test Data Input', {
      testId,
      sampleData
    });

    // For testing, let's just generate a few items
    const blogGen = new BlogGenerator(sampleData);
    const socialGen = new SocialAdaptor(sampleData);
    
    terminal.info('🎯 Generating 3 blog topics for testing...', { testId });
    const topics = await terminal.measurePerformance(`topicGen_${testId}`, async () => {
      return await blogGen.generateTopics();
    });
    const limitedTopics = topics.slice(0, 3); // Only 3 for testing
    
    terminal.success('✅ Blog topics generated', {
      testId,
      topicsCount: limitedTopics.length,
      topics: limitedTopics.map(t => t.title)
    });
    
    terminal.info('📝 Generating blog posts...', { testId });
    const blogPosts = [];
    for (let i = 0; i < limitedTopics.length; i++) {
      terminal.info(`📄 Generating blog ${i + 1}/${limitedTopics.length}`, {
        testId,
        topic: limitedTopics[i].title,
        keyword: limitedTopics[i].target_keyword
      });
      
      const post = await terminal.measurePerformance(`blogPost_${testId}_${i}`, async () => {
        return await blogGen.generatePost(limitedTopics[i]);
      });
      
      terminal.success(`✅ Blog post ${i + 1} generated`, {
        testId,
        title: post.title,
        wordCount: post.content?.split(' ').length,
        seoKeyword: post.seoData?.keyword
      });
      
      blogPosts.push(post);
    }
    
    terminal.info('📱 Generating 5 social media posts...', { testId });
    const socialResult = await terminal.measurePerformance(`socialPosts_${testId}`, async () => {
      return await socialGen.generatePosts(5); // Only 5 for testing
    });
    
    terminal.success('✅ Social posts generated', {
      testId,
      postsCount: socialResult.posts.length,
      platforms: socialResult.posts[0]?.platforms || ['facebook', 'instagram', 'linkedin'],
      firstPostPreview: socialResult.posts[0]?.content?.substring(0, 100) + '...'
    });

    terminal.endGeneration(testId, true);
    terminal.success('🎉 Test generation completed', {
      testId,
      totalBlogPosts: blogPosts.length,
      totalSocialPosts: socialResult.posts.length
    });
    
    res.json({
      success: true,
      note: "This is test data - limited generation for faster testing",
      summary: {
        businessName: sampleData.businessName,
        blogPostsGenerated: blogPosts.length,
        socialPostsGenerated: socialResult.posts.length
      },
      content: {
        blogPosts: blogPosts,
        socialPosts: socialResult.posts
      },
      sampleContent: {
        firstBlogPost: blogPosts[0],
        firstSocialPost: socialResult.posts[0]
      }
    });
    
  } catch (error) {
    terminal.endGeneration(testId, false);
    terminal.error('❌ Test generation error', {
      testId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
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

    terminal.info('📚 Fetching business content', {
      businessId,
      contentType,
      status,
      limit,
      offset
    });

    // Build query
    const query = { businessId };
    
    if (contentType) {
      query.contentType = contentType;
    }
    
    if (status !== 'all') {
      query.status = status;
    }

    // Execute query
    const content = await terminal.measurePerformance('fetchBusinessContent', async () => {
      return await Content.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .populate('conversationId', 'businessContext startedAt completedAt');
    });

    const total = await Content.countDocuments(query);

    terminal.success('✅ Business content retrieved', {
      businessId,
      contentCount: content.length,
      totalAvailable: total
    });

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
    terminal.error('❌ Get content error', {
      businessId: req.params.businessId,
      error: error.message
    });
    
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

    terminal.info('🔍 Fetching content item', { contentId });

    const content = await terminal.measurePerformance('fetchContentItem', async () => {
      return await Content.findById(contentId)
        .populate('conversationId', 'businessContext')
        .populate('businessId');
    });

    if (!content) {
      terminal.warning('⚠️ Content not found', { contentId });
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    terminal.success('✅ Content item retrieved', {
      contentId,
      contentType: content.contentType,
      status: content.status,
      title: content.title
    });

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    terminal.error('❌ Get content item error', {
      contentId: req.params.contentId,
      error: error.message
    });
    
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

    terminal.info('📝 Updating content item', {
      contentId,
      updates: Object.keys(updates)
    });

    const content = await Content.findById(contentId);
    if (!content) {
      terminal.warning('⚠️ Content not found for update', { contentId });
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

    terminal.success('✅ Content updated', {
      contentId,
      updatedFields: Object.keys(updates),
      newStatus: content.status
    });

    res.json({
      success: true,
      data: content
    });

  } catch (error) {
    terminal.error('❌ Update content error', {
      contentId: req.params.contentId,
      error: error.message
    });
    
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
  const publishId = `publish_${Date.now()}`;
  
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

    terminal.info('🚀 Publishing content request', {
      publishId,
      contentId,
      platforms,
      scheduleDate
    });

    const content = await Content.findById(contentId);
    if (!content) {
      terminal.warning('⚠️ Content not found for publishing', { contentId });
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

      terminal.success('📅 Content scheduled', {
        publishId,
        contentId,
        scheduleDate,
        platforms
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
      terminal.info('📤 Publishing content to platforms', {
        publishId,
        contentId,
        platforms
      });

      const publishResults = await terminal.measurePerformance(`publish_${publishId}`, async () => {
        return await distributionManager.publishContent({
          content,
          platforms
        });
      });

      content.status = 'published';
      content.publishDate = new Date();
      content.platforms = platforms;
      content.publishResults = publishResults;

      await content.save();

      terminal.success('✅ Content published', {
        publishId,
        contentId,
        platforms,
        results: publishResults
      });

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
    terminal.error('❌ Publish content error', {
      publishId,
      contentId: req.params.contentId,
      error: error.message
    });
    
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

    terminal.info('🗑️ Delete content request', { contentId });

    const content = await Content.findById(contentId);
    if (!content) {
      terminal.warning('⚠️ Content not found for deletion', { contentId });
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    if (content.status === 'published') {
      terminal.warning('⚠️ Attempted to delete published content', { contentId });
      return res.status(400).json({
        success: false,
        error: 'Cannot delete published content. Archive it instead.'
      });
    }

    await Content.findByIdAndDelete(contentId);

    terminal.success('✅ Content deleted', {
      contentId,
      title: content.title,
      contentType: content.contentType
    });

    res.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    terminal.error('❌ Delete content error', {
      contentId: req.params.contentId,
      error: error.message
    });
    
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

    terminal.info('📊 Fetching content analytics', {
      businessId,
      timeframe
    });

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

    const analytics = await terminal.measurePerformance('contentAnalytics', async () => {
      return await Content.aggregate([
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
    });

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

    terminal.success('✅ Analytics retrieved', {
      businessId,
      timeframe,
      totalContent: analytics[0]?.totalContent || 0
    });

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
    terminal.error('❌ Get content analytics error', {
      businessId: req.params.businessId,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get content analytics'
    });
  }
});

/**
 * POST /api/content/generate-single/:type
 * Generate a single piece of content
 */
router.post('/generate-single/:type', rateLimiter.createLimiter(20, 3600), [
  body('topic').notEmpty().withMessage('Topic required'),
  body('businessData').isObject().withMessage('Business data required')
], async (req, res) => {
  const generationId = `single_gen_${Date.now()}`;
  
  try {
    const { type } = req.params;
    const { topic, businessData } = req.body;
    
    terminal.startGeneration(generationId);
    terminal.info(`🎯 Single ${type} generation started`, {
      generationId,
      type,
      topic,
      businessName: businessData.businessName
    });

    // Log the input data
    terminal.info('🤖 AI Generation Input', {
      generationId,
      type,
      topic,
      businessData
    });
    
    let result;
    
    switch (type) {
      case 'blog':
        const blogGen = new BlogGenerator(businessData);
        result = await terminal.measurePerformance(`singleBlog_${generationId}`, async () => {
          return await blogGen.generatePost({ title: topic, target_keyword: topic });
        });
        
        terminal.success('✅ Blog AI Output', {
          generationId,
          title: result.title,
          wordCount: result.content?.split(' ').length,
          seoKeyword: result.seoData?.keyword,
          preview: result.content?.substring(0, 200) + '...'
        });
        break;
        
      case 'social':
        const socialGen = new SocialAdaptor(businessData);
        result = await terminal.measurePerformance(`singleSocial_${generationId}`, async () => {
          return await socialGen.generatePosts(5);
        });
        
        terminal.success('✅ Social Posts AI Output', {
          generationId,
          postsGenerated: result.posts?.length,
          firstPost: result.posts?.[0]?.content,
          platforms: result.posts?.[0]?.platforms
        });
        break;
        
      default:
        terminal.warning('⚠️ Invalid content type requested', { type });
        return res.status(400).json({
          success: false,
          error: 'Invalid content type'
        });
    }
    
    terminal.endGeneration(generationId, true);
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    terminal.endGeneration(generationId, false);
    terminal.error('❌ Generate single content error', {
      generationId,
      type: req.params.type,
      error: error.message
    });
    
    res.status(500).json({
      success: false,
      error: 'Failed to generate content'
    });
  }
});

// Helper functions with logging
async function generateEmailContent({ problem, businessContext }) {
  const helperGenId = `email_helper_${Date.now()}`;
  
  terminal.info('📧 Email Helper - AI Input', {
    helperGenId,
    problem,
    businessName: businessContext.name
  });

  // TODO: Implement with OpenAI
  const result = {
    title: `Re: ${problem}`,
    content: `Email content addressing ${problem} for ${businessContext.name}`,
    model: 'gpt-3.5-turbo',
    tokensUsed: 500
  };

  terminal.success('✅ Email Helper - AI Output', {
    helperGenId,
    subject: result.title,
    tokensUsed: result.tokensUsed
  });

  return result;
}

async function generateVideoScript({ problem, businessContext }) {
  const helperGenId = `video_helper_${Date.now()}`;
  
  terminal.info('🎥 Video Script Helper - AI Input', {
    helperGenId,
    problem,
    businessName: businessContext.name
  });

  // TODO: Implement with OpenAI
  const result = {
    title: `Video: How We Solve ${problem}`,
    content: `Video script about ${problem} for ${businessContext.name}`,
    model: 'gpt-3.5-turbo',
    tokensUsed: 800,
    duration: '3-5 minutes'
  };

  terminal.success('✅ Video Script Helper - AI Output', {
    helperGenId,
    title: result.title,
    duration: result.duration,
    tokensUsed: result.tokensUsed
  });

  return result;
}

module.exports = router;