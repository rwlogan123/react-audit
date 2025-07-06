// API endpoint ready for Go HighLevel integration
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract form data
    const formData = req.body;
    
    // TODO: Replace with actual GHL webhook URL
    const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL || 'https://services.leadconnectorhq.com/hooks/YOUR_WEBHOOK_ID';
    
    // Prepare data for Go HighLevel
    const ghlData = {
      // Contact Information
      firstName: formData.contactInfo?.firstName || '',
      lastName: formData.contactInfo?.lastName || '',
      email: formData.contactInfo?.email || '',
      phone: formData.contactInfo?.phone || '',
      
      // Business Information
      businessName: formData.businessName || '',
      businessType: formData.businessType || '',
      businessPhone: formData.phone || '',
      businessAddress: formData.address || '',
      city: formData.city || '',
      state: formData.state || '',
      zipCode: formData.zipCode || '',
      
      // Online Presence
      website: formData.website || '',
      googleBusinessProfile: formData.businessContext?.socialMedia?.googleBusinessProfile || '',
      facebook: formData.businessContext?.socialMedia?.facebook || '',
      instagram: formData.businessContext?.socialMedia?.instagram || '',
      
      // Goals & Marketing
      primaryGoal: formData.primaryGoal || '',
      marketingChallenges: formData.marketingChallenges?.join(', ') || '',
      currentMarketing: formData.currentMarketing?.join(', ') || '',
      monthlyBudget: formData.monthlyBudget || '',
      
      // Metadata
      source: 'Local Brand Builder Audit',
      submittedAt: new Date().toISOString(),
      isMockData: formData.submissionMetadata?.isMockData || false,
      
      // Custom Fields for GHL
      customFields: {
        serviceAreas: formData.serviceAreas || '',
        primaryServices: formData.primaryServices || '',
        managesGoogleProfile: formData.businessContext?.socialMedia?.managesGoogleProfile || '',
      }
    };

    // If using real GHL integration
    if (process.env.GHL_WEBHOOK_URL && process.env.NODE_ENV === 'production') {
      try {
        // Send to Go HighLevel
        const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Add any GHL authentication headers if needed
          },
          body: JSON.stringify(ghlData)
        });

        if (!ghlResponse.ok) {
          console.error('GHL webhook failed:', await ghlResponse.text());
          // Continue with mock data even if GHL fails
        } else {
          console.log('Successfully sent to GHL');
        }
      } catch (ghlError) {
        console.error('Error sending to GHL:', ghlError);
        // Continue with mock data
      }
    }

    // Generate audit results (mock for now, will be replaced with real audit logic)
    const auditResults = {
      success: true,
      data: {
        // Business Info
        businessName: formData.businessName || "Sample Business",
        location: `${formData.city || "City"}, ${formData.state || "State"}`,
        businessType: formData.businessType || "Business Type",
        
        // Core Scores (will be calculated by audit engine)
        visibilityScore: calculateVisibilityScore(formData),
        localContentScore: 10,
        websiteScore: formData.website ? 55 : 0,
        schemaScore: 0,
        completenessScore: calculateCompletenessScore(formData),
        
        // Rankings & Reviews (will fetch from Google)
        currentRank: 3,
        reviewCount: 21,
        rating: 4.8,
        photoCount: 12,
        
        // Directory & Citations
        tier1DirectoryCoverage: 33,
        directoryLinksCount: 6,
        
        // Detailed Analysis
        pagespeedAnalysis: { 
          mobileScore: 45, 
          desktopScore: 55 
        },
        socialMediaAnalysis: { 
          socialScore: calculateSocialScore(formData), 
          platforms: getPlatforms(formData)
        },
        napAnalysis: { 
          consistencyScore: 40 
        },
        citationAnalysis: { 
          citationCompletionRate: 35,
          tier1Coverage: 33
        },
        
        // Page Speed Details
        pageSpeed: "19.9s",
        
        // Action Items (generated based on scores)
        actionItems: generateActionItems(formData),
        
        // Competitors (will fetch from local search)
        competitors: [
          {
            name: "Top Competitor",
            rank: 1,
            reviews: 45,
            rating: 4.9
          },
          {
            name: "Second Competitor", 
            rank: 2,
            reviews: 38,
            rating: 4.7
          }
        ],
        
        // Summary
        auditSummary: generateAuditSummary(formData),
        
        // Raw business data
        rawBusinessData: {
          address: `${formData.address || "Address"}, ${formData.city || "City"}, ${formData.state || "State"} ${formData.zipCode || ""}`
        },
        
        // GHL Integration Status
        ghlContactId: null, // Will be populated when GHL responds
        ghlStatus: process.env.GHL_WEBHOOK_URL ? 'pending' : 'not_configured'
      }
    };

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    res.status(200).json(auditResults);
    
  } catch (error) {
    console.error('Audit API error:', error);
    res.status(500).json({ 
      error: 'Failed to process audit',
      message: error.message 
    });
  }
}

// Helper functions for calculating scores
function calculateVisibilityScore(data) {
  let score = 50; // Base score
  if (data.website) score += 10;
  if (data.businessContext?.socialMedia?.googleBusinessProfile) score += 15;
  if (data.businessContext?.socialMedia?.facebook) score += 5;
  if (data.businessContext?.socialMedia?.instagram) score += 5;
  if (data.marketingChallenges?.includes("Low Visibility on Google")) score -= 10;
  return Math.max(0, Math.min(100, score));
}

function calculateCompletenessScore(data) {
  const fields = [
    data.businessName,
    data.businessType,
    data.website,
    data.phone,
    data.address,
    data.city,
    data.state,
    data.zipCode,
    data.primaryServices,
    data.businessContext?.socialMedia?.googleBusinessProfile
  ];
  
  const filledFields = fields.filter(field => field && field.trim() !== '').length;
  return Math.round((filledFields / fields.length) * 100);
}

function calculateSocialScore(data) {
  let score = 0;
  if (data.businessContext?.socialMedia?.facebook) score += 40;
  if (data.businessContext?.socialMedia?.instagram) score += 30;
  if (data.businessContext?.socialMedia?.googleBusinessProfile) score += 30;
  return score;
}

function getPlatforms(data) {
  const platforms = [];
  if (data.businessContext?.socialMedia?.facebook) platforms.push("facebook");
  if (data.businessContext?.socialMedia?.instagram) platforms.push("instagram");
  if (data.businessContext?.socialMedia?.googleBusinessProfile) platforms.push("google");
  return platforms;
}

function generateActionItems(data) {
  const critical = [];
  const moderate = [];
  
  // Critical items
  if (!data.website || data.website === '') {
    critical.push("No website found - you're missing 90% of potential customers");
  } else {
    critical.push("Website speed is critically slow");
  }
  
  if (!data.businessContext?.socialMedia?.googleBusinessProfile) {
    critical.push("Google Business Profile not set up or claimed");
  }
  
  critical.push("No schema markup found");
  
  // Moderate items
  if (data.marketingChallenges?.includes("Not Enough Reviews")) {
    moderate.push("Need more Google reviews to compete");
  }
  
  if (!data.businessContext?.socialMedia?.facebook && !data.businessContext?.socialMedia?.instagram) {
    moderate.push("No social media presence detected");
  } else {
    moderate.push("Social media presence needs improvement");
  }
  
  if (data.marketingChallenges?.includes("Low Visibility on Google")) {
    moderate.push("Local SEO optimization needed");
  }
  
  return { critical, moderate };
}

function generateAuditSummary(data) {
  const hasWebsite = data.website && data.website !== '';
  const hasGBP = data.businessContext?.socialMedia?.googleBusinessProfile;
  
  if (!hasWebsite && !hasGBP) {
    return `${data.businessName || "Your business"} has minimal online presence. Without a website or Google Business Profile, you're invisible to 95% of potential customers searching online. Immediate action is needed to establish your digital footprint.`;
  } else if (!hasWebsite) {
    return `${data.businessName || "Your business"} has a Google Business Profile but no website. You're missing out on 70% of potential customers who want to learn more about your services before calling.`;
  } else if (!hasGBP) {
    return `${data.businessName || "Your business"} has a website but no Google Business Profile. You're missing from local search results where 80% of customers find services like yours.`;
  } else {
    return `${data.businessName || "Your business"} currently ranks #3 with a 4.8⭐ rating, but critical technical gaps are limiting your visibility potential. Your website's slow speed and missing local SEO are causing you to lose customers to competitors.`;
  }
}