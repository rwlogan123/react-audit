require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Local Brand Builder Backend Running',
    frontend: process.env.FRONTEND_URL 
  });
});

// ===== AUDIT ENDPOINTS =====
app.post('/api/audit/submit', async (req, res) => {
  try {
    console.log('Received audit submission:', req.body.businessName);
    
    // Extract email from form data
    const email = req.body.email || 'test@example.com';
    
    // Create or update user
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          businessName: req.body.businessName,
          ghlContactId: `ghl_${Date.now()}`
        }
      });
    }
    
    // Generate scores (mock for now)
    const scores = {
      visibilityScore: Math.floor(Math.random() * 30) + 50,
      localSeoScore: Math.floor(Math.random() * 30) + 55,
      websiteScore: req.body.website ? Math.floor(Math.random() * 20) + 65 : 0,
      socialScore: Math.floor(Math.random() * 30) + 45,
      overallScore: Math.floor(Math.random() * 20) + 60
    };
    
    // Save audit
    const audit = await prisma.audit.create({
      data: {
        userId: user.id,
        businessName: req.body.businessName,
        businessType: req.body.businessType,
        email,
        website: req.body.website,
        location: req.body.location,
        ...scores,
        formData: JSON.stringify(req.body)
      }
    });
    
    // Return expected format
    res.json({
      success: true,
      auditId: audit.id,
      contactId: user.ghlContactId,
      paymentLink: `https://pay.example.com/checkout/${user.ghlContactId}`,
      results: scores
    });
    
  } catch (error) {
    console.error('Audit submission error:', error);
    res.status(500).json({ 
      error: 'Failed to process audit',
      details: error.message 
    });
  }
});

// ===== GHL ENDPOINTS =====
app.get('/api/ghl/contact/:contactId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { ghlContactId: req.params.contactId },
      include: { 
        audits: { 
          orderBy: { createdAt: 'desc' },
          take: 1 
        } 
      }
    });
    
    if (!user || user.audits.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    
    const audit = user.audits[0];
    const formData = JSON.parse(audit.formData || '{}');
    
    res.json({
      businessInfo: {
        businessName: audit.businessName,
        businessType: audit.businessType,
        location: formData.location || 'Not specified'
      },
      auditData: {
        ...formData,
        visibilityScore: audit.visibilityScore,
        localSeoScore: audit.localSeoScore,
        websiteScore: audit.websiteScore,
        socialScore: audit.socialScore,
        overallScore: audit.overallScore
      }
    });
    
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Failed to get contact data' });
  }
});

app.post('/api/ghl/onboarding/:contactId', async (req, res) => {
  try {
    const { responses } = req.body;
    console.log('Onboarding responses received for:', req.params.contactId);
    
    // TODO: Save interview responses
    // TODO: Trigger content generation
    
    res.json({
      success: true,
      interviewId: `interview_${Date.now()}`,
      message: 'Onboarding data saved successfully'
    });
    
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: 'Failed to save onboarding data' });
  }
});

// ===== RECOVERY ENDPOINT =====
app.post('/api/recover-audit', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        audits: { 
          orderBy: { createdAt: 'desc' },
          take: 1 
        } 
      }
    });
    
    if (user && user.audits.length > 0) {
      res.json({
        found: true,
        businessInfo: {
          businessName: user.audits[0].businessName,
          businessType: user.audits[0].businessType
        }
      });
    } else {
      res.json({ found: false });
    }
    
  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ error: 'Recovery failed' });
  }
});

// ===== CONTENT ENDPOINTS =====
app.get('/api/content/user/:userId', async (req, res) => {
  // Mock response for now
  res.json({
    content: [
      { id: '1', type: 'blog', title: 'Sample Blog Post', status: 'completed' },
      { id: '2', type: 'social', title: 'Social Media Post', status: 'generating' }
    ],
    stats: {
      total: 48,
      completed: 12,
      generating: 6,
      pending: 30
    }
  });
});

// Start server
async function startServer() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    
    app.listen(PORT, () => {
      console.log(`
🚀 Local Brand Builder Backend is running!
�� Server: http://localhost:${PORT}
🌐 Frontend: ${process.env.FRONTEND_URL}
❤️  Health check: http://localhost:${PORT}/health
      `);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

startServer();
