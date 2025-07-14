// competitorService.js - Enhanced Competitor Analysis with Advanced Business Intelligence
// Upgraded from basic DataForSEO to comprehensive competitive intelligence

const analyzeCompetitors = async (businessData, apiCredentials) => {
  const {
    businessName = businessData.businessName || "",
    location = businessData.location || businessData.city || "",
    businessType = businessData.businessType || businessData.keyword || "",
    website = businessData.website || ""
  } = businessData;

  const {
    apiUsername = process.env.DATAFORSEO_USER || apiCredentials?.username || "",
    apiPassword = process.env.DATAFORSEO_PASS || apiCredentials?.password || ""
  } = apiCredentials || {};

  try {
    console.log(`🏆 Starting enhanced competitor analysis for: ${businessName} in ${location}`);

    if (!apiUsername || !apiPassword) {
      throw new Error("DataForSEO API credentials required");
    }

    // Prepare API credentials
    const auth = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };

    // Enhanced search query for better competitor discovery
    const searchQueries = [
      `${businessType} ${location}`,
      `best ${businessType} ${location}`,
      `top ${businessType} near ${location}`,
      `${businessType} services ${location}`
    ];

    let allCompetitors = [];
    let businessData_found = null;

    // Multi-query approach for comprehensive competitor discovery
    for (const query of searchQueries) {
      try {
        const requestBody = [{
          language_name: "English",
          location_name: location,
          keyword: query,
          depth: 20, // Get more results
          device: "desktop",
          os: "windows"
        }];

        const response = await fetch('https://api.dataforseo.com/v3/business_data/google/my_business_listings/live', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        if (data.status_code === 20000 && data.tasks?.[0]?.result) {
          const results = data.tasks[0].result || [];
          allCompetitors.push(...results);
        }
      } catch (queryError) {
        console.log(`⚠️ Query failed: ${query} - ${queryError.message}`);
      }
    }

    // Deduplicate competitors by place_id or title
    const uniqueCompetitors = [];
    const seen = new Set();

    allCompetitors.forEach(comp => {
      const identifier = comp.place_id || comp.title || comp.domain;
      if (identifier && !seen.has(identifier)) {
        seen.add(identifier);
        uniqueCompetitors.push(comp);
      }
    });

    // Find the target business in results
    businessData_found = uniqueCompetitors.find(comp => 
      comp.title?.toLowerCase().includes(businessName.toLowerCase()) ||
      comp.domain?.includes(website.replace(/^https?:\/\//, '').replace(/^www\./, ''))
    );

    // Remove target business from competitors
    const competitors = uniqueCompetitors
      .filter(comp => comp !== businessData_found)
      .slice(0, 20); // Limit to top 20

    // ADVANCED COMPETITIVE INTELLIGENCE ANALYSIS
    
    // 1. Market Share Analysis
    const totalReviews = competitors.reduce((sum, comp) => sum + (comp.rating?.votes_count || 0), 0);
    const avgReviews = totalReviews / Math.max(competitors.length, 1);
    
    const marketShareAnalysis = {
      totalMarketReviews: totalReviews,
      avgCompetitorReviews: Math.round(avgReviews),
      businessMarketShare: businessData_found ? 
        Math.round(((businessData_found.rating?.votes_count || 0) / Math.max(totalReviews, 1)) * 100) : 0,
      marketDominance: businessData_found?.rating?.votes_count > avgReviews ? 'Above Average' : 'Below Average'
    };

    // 2. Competitive Positioning
    const sortedByReviews = [...competitors].sort((a, b) => 
      (b.rating?.votes_count || 0) - (a.rating?.votes_count || 0)
    );
    
    const sortedByRating = [...competitors].sort((a, b) => 
      (b.rating?.value || 0) - (a.rating?.value || 0)
    );

    const businessReviewRank = businessData_found ? 
      sortedByReviews.findIndex(comp => comp.place_id === businessData_found.place_id) + 1 : 0;
    
    const businessRatingRank = businessData_found ?
      sortedByRating.findIndex(comp => comp.place_id === businessData_found.place_id) + 1 : 0;

    // 3. Competitive Gaps Analysis
    const topPerformers = sortedByReviews.slice(0, 3);
    const avgTopPerformerReviews = topPerformers.reduce((sum, comp) => 
      sum + (comp.rating?.votes_count || 0), 0) / Math.max(topPerformers.length, 1);
    
    const reviewGap = businessData_found ? 
      Math.max(0, avgTopPerformerReviews - (businessData_found.rating?.votes_count || 0)) : avgTopPerformerReviews;

    // 4. Threat Assessment
    const threats = competitors.filter(comp => 
      (comp.rating?.votes_count || 0) > (businessData_found?.rating?.votes_count || 0) &&
      (comp.rating?.value || 0) >= (businessData_found?.rating?.value || 4.0)
    );

    const opportunities = competitors.filter(comp =>
      (comp.rating?.votes_count || 0) < (businessData_found?.rating?.votes_count || 0) ||
      (comp.rating?.value || 0) < (businessData_found?.rating?.value || 4.0)
    );

    // 5. Market Coverage Analysis
    const websitePresence = competitors.filter(comp => comp.domain).length;
    const websiteCoverage = Math.round((websitePresence / Math.max(competitors.length, 1)) * 100);
    
    const avgPhotos = competitors.reduce((sum, comp) => sum + (comp.photo_count || 0), 0) / Math.max(competitors.length, 1);
    
    // 6. Industry Benchmarks
    const industryBenchmarks = {
      avgRating: competitors.reduce((sum, comp) => sum + (comp.rating?.value || 0), 0) / Math.max(competitors.length, 1),
      avgReviewCount: avgReviews,
      avgPhotoCount: Math.round(avgPhotos),
      websiteAdoptionRate: websiteCoverage,
      topPerformerThreshold: {
        reviews: Math.round(avgTopPerformerReviews),
        rating: topPerformers.reduce((sum, comp) => sum + (comp.rating?.value || 0), 0) / Math.max(topPerformers.length, 1)
      }
    };

    // 7. Strategic Recommendations
    const strategicRecommendations = [];
    
    if (reviewGap > 10) {
      strategicRecommendations.push(`Bridge the review gap: Need ${Math.round(reviewGap)} more reviews to match top performers`);
    }
    
    if (threats.length > competitors.length * 0.5) {
      strategicRecommendations.push("High competitive pressure - prioritize review acquisition and customer experience");
    }
    
    if (businessData_found?.rating?.value < industryBenchmarks.avgRating) {
      strategicRecommendations.push("Rating below industry average - focus on service quality improvements");
    }
    
    if (!businessData_found?.domain && websiteCoverage > 50) {
      strategicRecommendations.push("Website presence critical - most competitors have websites");
    }

    // 8. Competitive Intelligence Summary
    const competitiveIntelligence = {
      marketPosition: businessReviewRank > 0 ? `#${businessReviewRank} by reviews, #${businessRatingRank} by rating` : 'Not ranked',
      competitiveStrength: businessData_found ? 
        (businessReviewRank <= 3 && businessRatingRank <= 3 ? 'Strong' : 
         businessReviewRank <= 10 && businessRatingRank <= 10 ? 'Moderate' : 'Weak') : 'Unknown',
      marketOpportunity: opportunities.length > threats.length ? 'High' : 'Moderate',
      urgencyLevel: threats.length > 5 ? 'High' : threats.length > 2 ? 'Medium' : 'Low'
    };

    // Enhanced competitor data with additional insights
    const enhancedCompetitors = competitors.map((comp, index) => ({
      ...comp,
      rank: index + 1,
      reviewScore: Math.round(((comp.rating?.votes_count || 0) * (comp.rating?.value || 0)) / 5),
      threatLevel: (comp.rating?.votes_count || 0) > (businessData_found?.rating?.votes_count || 0) ? 'High' : 'Low',
      hasWebsite: !!comp.domain,
      photoCount: comp.photo_count || 0,
      completenessScore: calculateCompleteness(comp)
    }));

    const result = {
      success: true,
      businessData: businessData_found ? {
        ...businessData_found,
        rank: businessReviewRank,
        marketShare: marketShareAnalysis.businessMarketShare,
        competitivePosition: competitiveIntelligence.competitiveStrength
      } : null,
      competitors: enhancedCompetitors,
      totalCompetitors: competitors.length,
      
      // Advanced Analytics
      marketShareAnalysis,
      competitiveIntelligence,
      industryBenchmarks,
      strategicRecommendations,
      
      // Threat & Opportunity Analysis
      threatAnalysis: {
        majorThreats: threats.slice(0, 3).map(comp => ({
          name: comp.title,
          reviews: comp.rating?.votes_count || 0,
          rating: comp.rating?.value || 0,
          domain: comp.domain
        })),
        opportunities: opportunities.slice(0, 3).map(comp => ({
          name: comp.title,
          weakness: (comp.rating?.value || 0) < 4.0 ? 'Low Rating' : 'Few Reviews'
        })),
        competitivePressure: threats.length > 5 ? 'High' : 'Moderate'
      },
      
      // Market Analysis
      marketAnalysis: {
        marketSaturation: competitors.length > 15 ? 'High' : 'Moderate',
        avgQualityLevel: industryBenchmarks.avgRating > 4.3 ? 'High' : 'Moderate',
        barrierToEntry: avgTopPerformerReviews > 50 ? 'High' : 'Low',
        websiteNecessity: websiteCoverage > 70 ? 'Essential' : 'Recommended'
      },
      
      generatedAt: new Date().toISOString(),
      querySearched: searchQueries,
      competitorsAnalyzed: uniqueCompetitors.length
    };

    console.log(`✅ Enhanced competitor analysis complete: Found ${competitors.length} competitors`);
    console.log(`📊 Business position: ${competitiveIntelligence.marketPosition}`);
    console.log(`🎯 Competitive strength: ${competitiveIntelligence.competitiveStrength}`);

    return result;

  } catch (error) {
    console.error(`❌ Competitor analysis failed: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      businessData: null,
      competitors: [],
      totalCompetitors: 0,
      marketShareAnalysis: {},
      competitiveIntelligence: {},
      industryBenchmarks: {},
      strategicRecommendations: [],
      threatAnalysis: {},
      marketAnalysis: {},
      generatedAt: new Date().toISOString()
    };
  }
};

// Helper function to calculate business completeness score
function calculateCompleteness(business) {
  let score = 0;
  let maxScore = 100;

  // Basic info (40 points)
  if (business.title) score += 10;
  if (business.address) score += 10;
  if (business.phone) score += 10;
  if (business.website || business.domain) score += 10;

  // Reviews (30 points)
  const reviewCount = business.rating?.votes_count || 0;
  if (reviewCount > 0) score += 10;
  if (reviewCount > 5) score += 10;
  if (reviewCount > 20) score += 10;

  // Photos (20 points)
  const photoCount = business.photo_count || 0;
  if (photoCount > 0) score += 7;
  if (photoCount > 5) score += 7;
  if (photoCount > 15) score += 6;

  // Additional features (10 points)
  if (business.category) score += 3;
  if (business.rating?.value >= 4.0) score += 4;
  if (business.work_time) score += 3;

  return Math.round((score / maxScore) * 100);
}

module.exports = {
  analyzeCompetitors
};
