// /backend/routes/onboarding.js
const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// Models
const Conversation = require('../models/Conversation');
const Payment = require('../models/Payment');

// Services
const conversationEngine = require('../services/marketing/conversationEngine');
const conversationStorage = require('../services/marketing/conversationStorage');
const problemAnalyzer = require('../services/marketing/problemAnalyzer');
const onboardingManager = require('../services/marketing/onboardingManager');

// Middleware
const rateLimiter = require('../middleware/rateLimiting');

/**
 * POST /api/onboarding/start
 * Start AI onboarding conversation for a paid customer
 */
router.post('/start', rateLimiter.createLimiter(5, 3600), [
  body('paymentId').isMongoId().withMessage('Valid payment ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paymentId } = req.body;

    // Verify payment exists and is paid
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Payment not confirmed'
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({ paymentId });
    
    if (!conversation) {
      // Create new conversation
      conversation = await onboardingManager.initializeConversation(payment);
    }

    // Get the initial greeting message
    const greeting = await conversationEngine.generateGreeting({
      businessName: payment.businessInfo.name,
      businessType: payment.businessInfo.businessType,
      auditSummary: payment.auditSummary
    });

    // Add greeting to conversation if it's new
    if (conversation.messages.length === 0) {
      await conversation.addMessage('assistant', greeting);
    }

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        businessInfo: {
          name: payment.businessInfo.name,
          type: payment.businessInfo.businessType
        },
        progress: conversation.progress,
        initialMessage: greeting,
        status: conversation.status
      }
    });

  } catch (error) {
    console.error('Start onboarding error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start onboarding'
    });
  }
});

/**
 * POST /api/onboarding/:conversationId/message
 * Send a message in the AI conversation
 */
router.post('/:conversationId/message', rateLimiter.createLimiter(30, 900), [
  body('message').isString().isLength({ min: 1, max: 2000 }).withMessage('Valid message required'),
  body('messageType').optional().isIn(['text', 'voice']).withMessage('Invalid message type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { message, messageType = 'text' } = req.body;

    // Get conversation
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Conversation is already completed'
      });
    }

    // Add user message to conversation
    await conversation.addMessage('user', message, { type: messageType });

    // Analyze message for problems in real-time
    const extractedProblems = await problemAnalyzer.analyzeMessage({
      message,
      businessContext: conversation.businessContext,
      conversationHistory: conversation.messages
    });

    // Add any new problems found
    for (const problem of extractedProblems) {
      await conversation.extractProblem(problem);
    }

    // Generate AI response
    const aiResponse = await conversationEngine.generateResponse({
      conversation,
      userMessage: message,
      extractedProblems: conversation.extractedProblems
    });

    // Add AI response to conversation
    await conversation.addMessage('assistant', aiResponse.content, {
      model: aiResponse.model,
      tokens: aiResponse.tokensUsed,
      responseTime: aiResponse.responseTime
    });

    // Update conversation progress
    await updateConversationProgress(conversation);

    res.json({
      success: true,
      data: {
        response: aiResponse.content,
        progress: conversation.progress,
        extractedProblems: conversation.extractedProblems.length,
        status: conversation.status,
        suggestions: aiResponse.suggestions || []
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message'
    });
  }
});

/**
 * GET /api/onboarding/:conversationId/status
 * Get conversation status and progress
 */
router.get('/:conversationId/status', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId)
      .populate('paymentId', 'businessInfo plan');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        status: conversation.status,
        progress: conversation.progress,
        businessInfo: conversation.businessContext,
        extractedProblems: conversation.extractedProblems,
        messageCount: conversation.messages.length,
        duration: conversation.duration,
        startedAt: conversation.startedAt,
        lastActiveAt: conversation.lastActiveAt,
        completedAt: conversation.completedAt
      }
    });

  } catch (error) {
    console.error('Get conversation status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation status'
    });
  }
});

/**
 * POST /api/onboarding/:conversationId/complete
 * Mark conversation as complete and start content generation
 */
router.post('/:conversationId/complete', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.extractedProblems.length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Need at least 5 problems to complete onboarding'
      });
    }

    // Mark conversation as complete
    await conversation.completeConversation();

    // Update payment record
    const payment = await Payment.findById(conversation.paymentId);
    if (payment) {
      payment.onboardingCompleted = true;
      await payment.save();
    }

    // Start content generation process
    await onboardingManager.startContentGeneration(conversation);

    res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        status: 'completed',
        problemsIdentified: conversation.extractedProblems.length,
        nextSteps: 'Content generation has been initiated',
        summary: conversation.getConversationSummary()
      }
    });

  } catch (error) {
    console.error('Complete conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete conversation'
    });
  }
});

/**
 * GET /api/onboarding/:conversationId/problems
 * Get extracted problems with content opportunities
 */
router.get('/:conversationId/problems', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Get problems formatted for content generation
    const problemsForContent = conversation.getProblemsForContentGeneration();

    // Enhance problems with content opportunities
    const enhancedProblems = await Promise.all(
      problemsForContent.map(async (problem) => {
        const contentOpportunities = await problemAnalyzer.generateContentOpportunities({
          problem: problem.problem,
          description: problem.description,
          businessType: conversation.businessContext.type,
          category: problem.category
        });

        return {
          ...problem.toObject(),
          contentOpportunities
        };
      })
    );

    res.json({
      success: true,
      data: {
        problems: enhancedProblems,
        totalProblems: conversation.extractedProblems.length,
        highPriorityProblems: enhancedProblems.filter(p => p.priority === 'high').length,
        contentReadyProblems: enhancedProblems.filter(p => p.confidence >= 0.8).length
      }
    });

  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get problems'
    });
  }
});

/**
 * POST /api/onboarding/:conversationId/pause
 * Pause conversation (user can resume later)
 */
router.post('/:conversationId/pause', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    conversation.status = 'paused';
    conversation.lastActiveAt = new Date();
    await conversation.save();

    res.json({
      success: true,
      data: {
        status: 'paused',
        message: 'Conversation paused. You can resume anytime.',
        resumeUrl: `/onboarding/${conversationId}`
      }
    });

  } catch (error) {
    console.error('Pause conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause conversation'
    });
  }
});

/**
 * POST /api/onboarding/:conversationId/resume
 * Resume a paused conversation
 */
router.post('/:conversationId/resume', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (conversation.status !== 'paused') {
      return res.status(400).json({
        success: false,
        error: 'Conversation is not paused'
      });
    }

    conversation.status = 'in_progress';
    conversation.lastActiveAt = new Date();
    await conversation.save();

    // Generate resume message
    const resumeMessage = await conversationEngine.generateResumeMessage({
      conversation,
      pauseDuration: Date.now() - conversation.lastActiveAt
    });

    await conversation.addMessage('assistant', resumeMessage);

    res.json({
      success: true,
      data: {
        status: 'in_progress',
        message: resumeMessage,
        progress: conversation.progress
      }
    });

  } catch (error) {
    console.error('Resume conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume conversation'
    });
  }
});

/**
 * GET /api/onboarding/:conversationId/history
 * Get conversation message history
 */
router.get('/:conversationId/history', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Get paginated messages
    const messages = conversation.messages
      .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
      .map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
        metadata: msg.metadata
      }));

    res.json({
      success: true,
      data: {
        messages,
        totalMessages: conversation.messages.length,
        hasMore: (parseInt(offset) + parseInt(limit)) < conversation.messages.length
      }
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get conversation history'
    });
  }
});

/**
 * POST /api/onboarding/:conversationId/feedback
 * Submit feedback about the conversation
 */
router.post('/:conversationId/feedback', [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
  body('feedback').optional().isString().isLength({ max: 1000 }),
  body('category').optional().isIn(['helpful', 'confusing', 'too_long', 'too_short', 'technical_issues'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const { rating, feedback, category } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Update conversation with feedback
    conversation.analytics.satisfactionRating = rating;
    if (feedback) {
      conversation.notes = (conversation.notes || '') + `\nFeedback: ${feedback}`;
    }
    if (category) {
      conversation.tags.push(`feedback_${category}`);
    }

    await conversation.save();

    // Store detailed feedback for analysis
    await storeFeedback({
      conversationId,
      rating,
      feedback,
      category,
      businessType: conversation.businessContext.type,
      duration: conversation.duration,
      problemsFound: conversation.extractedProblems.length,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

/**
 * GET /api/onboarding/analytics
 * Get onboarding analytics (admin/internal use)
 */
router.get('/analytics', async (req, res) => {
  try {
    const { timeframe = '30d', businessType } = req.query;

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

    const matchCriteria = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    if (businessType) {
      matchCriteria['businessContext.type'] = businessType;
    }

    const analytics = await Conversation.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalConversations: { $sum: 1 },
          completedConversations: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          averageProblems: { $avg: { $size: '$extractedProblems' } },
          averageDuration: { $avg: '$analytics.sessionDuration' },
          totalProblemsExtracted: { $sum: { $size: '$extractedProblems' } },
          averageRating: { $avg: '$analytics.satisfactionRating' }
        }
      }
    ]);

    const completionRate = analytics[0] ? 
      (analytics[0].completedConversations / analytics[0].totalConversations * 100) : 0;

    res.json({
      success: true,
      data: {
        timeframe,
        businessType: businessType || 'all',
        metrics: analytics[0] || {},
        completionRate: Math.round(completionRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics'
    });
  }
});

// Helper functions
async function updateConversationProgress(conversation) {
  const problemCount = conversation.extractedProblems.length;
  const targetProblems = conversation.progress.targetProblems;
  
  conversation.progress.problemsIdentified = problemCount;
  conversation.progress.completionPercentage = Math.min(
    (problemCount / targetProblems) * 100,
    100
  );

  // Update conversation phase based on progress
  if (problemCount === 0) {
    conversation.progress.currentPhase = 'introduction';
  } else if (problemCount < 3) {
    conversation.progress.currentPhase = 'problem_discovery';
  } else if (problemCount < 8) {
    conversation.progress.currentPhase = 'deep_dive';
  } else if (problemCount < targetProblems) {
    conversation.progress.currentPhase = 'validation';
  } else {
    conversation.progress.currentPhase = 'wrap_up';
  }

  // Estimate time remaining
  const avgTimePerProblem = 3; // minutes
  const remainingProblems = Math.max(0, targetProblems - problemCount);
  conversation.progress.estimatedTimeRemaining = remainingProblems * avgTimePerProblem;

  await conversation.save();
}

async function storeFeedback(feedbackData) {
  // Implementation for storing detailed feedback
  // Could be separate collection, external analytics service, etc.
  console.log('Feedback stored:', feedbackData);
}

module.exports = router;