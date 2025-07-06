// Temporary API endpoint for testing
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

  // Return comprehensive mock data that matches your AuditDashboard
  const mockAuditResults = {
    success: true,
    data: {
      // Business Info
      businessName: req.body.businessName || "Sample Business",
      location: `${req.body.city || "Eagle Mountain"}, ${req.body.state || "UT"}`,
      businessType: req.body.businessType || "Home Services",
      
      // Core Scores
      visibilityScore: 75,
      localContentScore: 10,
      websiteScore: 55,
      schemaScore: 0,
      completenessScore: 92,
      
      // Rankings & Reviews
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
        socialScore: 30, 
        platforms: ["facebook", "instagram"] 
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
      
      // Action Items
      actionItems: {
        critical: [
          "Website speed is critically slow",
          "Missing local SEO optimization",
          "No schema markup found"
        ],
        moderate: [
          "Need more Google reviews",
          "Social media presence is weak"
        ]
      },
      
      // Competitors (for competitor tab)
      competitors: [
        {
          name: "Competitor 1",
          rank: 1,
          reviews: 45,
          rating: 4.9
        },
        {
          name: "Competitor 2", 
          rank: 2,
          reviews: 38,
          rating: 4.7
        }
      ],
      
      // Summary
      auditSummary: `${req.body.businessName || "Your business"} currently ranks #3 with a ${4.8}⭐ rating, but critical technical gaps are limiting your visibility potential. Your website's slow speed and missing local SEO are causing you to lose customers to competitors.`,
      
      // Raw business data (for compatibility)
      rawBusinessData: {
        address: `${req.body.address || "123 Main St"}, ${req.body.city || "Eagle Mountain"}, ${req.body.state || "UT"}`
      }
    }
  };

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  res.status(200).json(mockAuditResults);
}