// keywordService.js - Enhanced Keyword Analysis with Advanced SEO Intelligence
// Upgraded from basic analysis to comprehensive keyword opportunity identification

const analyzeKeywords = async (businessData, websiteData, competitorData, apiCredentials) => {
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
    console.log(`🔍 Starting enhanced keyword analysis for: ${businessType} in ${location}`);

    if (!apiUsername || !apiPassword) {
      throw new Error("DataForSEO API credentials required");
    }

    // Prepare API credentials
    const auth = Buffer.from(`${apiUsername}:${apiPassword}`).toString('base64');
    const headers = {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    };

    // 1. COMPREHENSIVE KEYWORD DISCOVERY
    
    // Industry-specific keyword seeds
    const keywordSeeds = generateKeywordSeeds(businessType, location);
    
    // Extract website keywords if available
    const websiteKeywords = extractWebsiteKeywords(websiteData);
    
    // Competitor keyword analysis
    const competitorKeywords = extractCompetitorKeywords(competitorData);

    // 2. KEYWORD RESEARCH & ANALYSIS
    let allKeywordData = [];
    
    // Research primary keyword clusters
    for (const seedKeyword of keywordSeeds.slice(0, 5)) { // Limit API calls
      try {
        const keywordData = await performKeywordResearch(seedKeyword, location, headers);
        if (keywordData && keywordData.length > 0) {
          allKeywordData.push(...keywordData);
        }
      } catch (apiError) {
        console.log(`⚠️ Keyword research failed for: ${seedKeyword}`);
      }
    }

    // 3. RANKING ANALYSIS
    const rankingData = await analyzeCurrentRankings(website, keywordSeeds, headers);

    // 4. ADVANCED KEYWORD INTELLIGENCE

    // Deduplicate and enrich keywords
    const processedKeywords = processKeywordData(allKeywordData, websiteKeywords, competitorKeywords);

    // Opportunity scoring
    const keywordOpportunities = identifyKeywordOpportunities(processedKeywords, rankingData);

    // Local SEO keywords
    const localKeywords = identifyLocalKeywords(processedKeywords, location);

    // Commercial intent keywords
    const commercialKeywords = identifyCommercialKeywords(processedKeywords);

    // Long-tail opportunities
    const longTailKeywords = identifyLongTailKeywords(processedKeywords);

    // 5. COMPETITIVE KEYWORD ANALYSIS
    const competitiveAnalysis = analyzeCompetitiveKeywords(processedKeywords, competitorData);

    // 6. CONTENT GAP ANALYSIS
    const contentGaps = identifyContentGaps(keywordOpportunities, websiteKeywords, businessType);

    // 7. KEYWORD DIFFICULTY & OPPORTUNITY SCORING
    const opportunityMatrix = createOpportunityMatrix(keywordOpportunities);

    // 8. STRATEGIC RECOMMENDATIONS
    const strategicRecommendations = generateKeywordStrategy(
      keywordOpportunities,
      competitiveAnalysis,
      contentGaps,
      businessType
    );

    const result = {
      success: true,
      
      // Core Keyword Data
      primaryKeywords: keywordOpportunities.slice(0, 10),
      localKeywords: localKeywords.slice(0, 8),
      commercialKeywords: commercialKeywords.slice(0, 8),
      longTailKeywords: longTailKeywords.slice(0, 12),
      
      // Advanced Analysis
      keywordOpportunities: opportunityMatrix.highOpportunity,
      competitiveAnalysis,
      contentGaps,
      
      // Current Performance
      currentRankings: rankingData.rankings || [],
      rankingKeywords: rankingData.trackingKeywords || [],
      avgPosition: rankingData.avgPosition || 0,
      
      // Metrics & Scoring
      keywordMetrics: {
        totalKeywordsAnalyzed: processedKeywords.length,
        highOpportunityCount: opportunityMatrix.highOpportunity.length,
        commercialKeywordCount: commercialKeywords.length,
        localKeywordCount: localKeywords.length,
        avgSearchVolume: calculateAvgSearchVolume(processedKeywords),
        avgDifficulty: calculateAvgDifficulty(processedKeywords)
      },
      
      // Strategic Intelligence
      strategicRecommendations,
      priorityActions: strategicRecommendations.slice(0, 3),
      
      // Industry Insights
      industryAnalysis: {
        primaryIndustryKeywords: keywordSeeds.slice(0, 5),
        seasonalKeywords: identifySeasonalKeywords(processedKeywords, businessType),
        emergencyKeywords: identifyEmergencyKeywords(processedKeywords, businessType),
        serviceAreaKeywords: generateServiceAreaKeywords(businessType, location)
      },
      
      generatedAt: new Date().toISOString(),
      analysisDepth: 'comprehensive'
    };

    console.log(`✅ Enhanced keyword analysis complete: ${processedKeywords.length} keywords analyzed`);
    console.log(`🎯 High opportunity keywords: ${opportunityMatrix.highOpportunity.length}`);
    console.log(`📊 Average search volume: ${result.keywordMetrics.avgSearchVolume}`);

    return result;

  } catch (error) {
    console.error(`❌ Keyword analysis failed: ${error.message}`);
    
    return {
      success: false,
      error: error.message,
      primaryKeywords: [],
      localKeywords: [],
      commercialKeywords: [],
      longTailKeywords: [],
      keywordOpportunities: [],
      competitiveAnalysis: {},
      contentGaps: [],
      currentRankings: [],
      keywordMetrics: {},
      strategicRecommendations: [],
      industryAnalysis: {},
      generatedAt: new Date().toISOString()
    };
  }
};

// HELPER FUNCTIONS

function generateKeywordSeeds(businessType, location) {
  const businessLower = businessType.toLowerCase();
  
  const industryKeywords = {
    carpenter: ['carpenter', 'carpentry', 'custom carpentry', 'trim work', 'cabinet making', 'deck builder'],
    plumber: ['plumber', 'plumbing', 'drain cleaning', 'pipe repair', 'water heater', 'emergency plumber'],
    electrician: ['electrician', 'electrical', 'wiring', 'electrical repair', 'panel upgrade', 'emergency electrician'],
    hvac: ['hvac', 'heating', 'cooling', 'air conditioning', 'furnace repair', 'ac repair'],
    restaurant: ['restaurant', 'dining', 'food delivery', 'catering', 'takeout', 'breakfast'],
    dental: ['dentist', 'dental', 'teeth cleaning', 'dental implants', 'orthodontist', 'emergency dentist'],
    lawyer: ['lawyer', 'attorney', 'legal services', 'law firm', 'legal advice', 'consultation']
  };

  let baseKeywords = [businessType];
  
  // Find industry-specific keywords
  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (businessLower.includes(industry)) {
      baseKeywords = keywords;
      break;
    }
  }

  // Generate location variations
  const locationKeywords = [];
  baseKeywords.forEach(keyword => {
    locationKeywords.push(
      `${keyword} ${location}`,
      `${keyword} near me`,
      `${keyword} in ${location}`,
      `best ${keyword} ${location}`,
      `local ${keyword}`,
      `${keyword} services ${location}`
    );
  });

  return [...baseKeywords, ...locationKeywords];
}

async function performKeywordResearch(seedKeyword, location, headers) {
  try {
    const requestBody = [{
      language_name: "English",
      location_name: location,
      keyword: seedKeyword,
      search_partners: false,
      date_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days ago
    }];

    const response = await fetch('https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    if (data.status_code === 20000 && data.tasks?.[0]?.result) {
      return data.tasks[0].result.map(item => ({
        keyword: item.keyword,
        searchVolume: item.search_volume || 0,
        competition: item.competition || 0,
        cpc: item.cpc || 0,
        difficulty: calculateKeywordDifficulty(item)
      }));
    }

    return [];
  } catch (error) {
    console.log(`⚠️ Keyword research API error: ${error.message}`);
    return [];
  }
}

function calculateKeywordDifficulty(keywordData) {
  // Simple difficulty calculation based on competition and volume
  const competition = keywordData.competition || 0;
  const volume = keywordData.search_volume || 0;
  
  if (volume > 1000 && competition > 0.7) return 80;
  if (volume > 500 && competition > 0.5) return 60;
  if (volume > 100 && competition > 0.3) return 40;
  return 20;
}

function extractWebsiteKeywords(websiteData) {
  if (!websiteData || !websiteData.success) return [];
  
  const keywords = [];
  
  // Extract from website analysis
  if (websiteData.primaryKeywords) {
    keywords.push(...websiteData.primaryKeywords);
  }
  
  if (websiteData.serviceKeywords) {
    keywords.push(...websiteData.serviceKeywords);
  }
  
  return keywords.filter(Boolean);
}

function extractCompetitorKeywords(competitorData) {
  if (!competitorData || !competitorData.competitors) return [];
  
  const keywords = [];
  
  // Extract keywords from competitor business names and descriptions
  competitorData.competitors.forEach(comp => {
    if (comp.title) {
      const titleWords = comp.title.toLowerCase().split(/\s+/);
      keywords.push(...titleWords.filter(word => word.length > 3));
    }
  });
  
  return [...new Set(keywords)]; // Remove duplicates
}

function processKeywordData(allKeywordData, websiteKeywords, competitorKeywords) {
  const keywordMap = new Map();
  
  // Process API keyword data
  allKeywordData.forEach(kw => {
    if (!keywordMap.has(kw.keyword)) {
      keywordMap.set(kw.keyword, {
        ...kw,
        sources: ['api'],
        relevanceScore: calculateRelevanceScore(kw, websiteKeywords, competitorKeywords)
      });
    }
  });
  
  return Array.from(keywordMap.values());
}

function calculateRelevanceScore(keyword, websiteKeywords, competitorKeywords) {
  let score = 50; // Base score
  
  // Boost if found on website
  if (websiteKeywords.some(wk => keyword.keyword.includes(wk))) {
    score += 20;
  }
  
  // Boost if competitors use it
  if (competitorKeywords.some(ck => keyword.keyword.includes(ck))) {
    score += 15;
  }
  
  // Boost for search volume
  if (keyword.searchVolume > 1000) score += 10;
  if (keyword.searchVolume > 100) score += 5;
  
  // Penalize for high difficulty
  if (keyword.difficulty > 70) score -= 15;
  if (keyword.difficulty > 50) score -= 10;
  
  return Math.min(100, Math.max(0, score));
}

function identifyKeywordOpportunities(keywords, rankingData) {
  return keywords
    .filter(kw => kw.relevanceScore > 60 && kw.difficulty < 60)
    .sort((a, b) => (b.searchVolume * b.relevanceScore) - (a.searchVolume * a.relevanceScore))
    .slice(0, 20);
}

function identifyLocalKeywords(keywords, location) {
  const locationTerms = [location.toLowerCase(), 'near me', 'local', 'in ' + location.toLowerCase()];
  
  return keywords.filter(kw => 
    locationTerms.some(term => kw.keyword.toLowerCase().includes(term))
  );
}

function identifyCommercialKeywords(keywords) {
  const commercialTerms = ['buy', 'hire', 'book', 'quote', 'estimate', 'cost', 'price', 'service', 'repair', 'install'];
  
  return keywords.filter(kw =>
    commercialTerms.some(term => kw.keyword.toLowerCase().includes(term))
  );
}

function identifyLongTailKeywords(keywords) {
  return keywords.filter(kw => 
    kw.keyword.split(' ').length >= 3 && kw.difficulty < 40
  );
}

function analyzeCompetitiveKeywords(keywords, competitorData) {
  if (!competitorData || !competitorData.competitors) return {};
  
  const topCompetitors = competitorData.competitors.slice(0, 5);
  const competitorStrength = topCompetitors.reduce((sum, comp) => 
    sum + (comp.rating?.votes_count || 0), 0) / topCompetitors.length;
  
  return {
    avgCompetitorStrength: Math.round(competitorStrength),
    competitiveKeywords: keywords.filter(kw => kw.difficulty > 50),
    opportunityKeywords: keywords.filter(kw => kw.difficulty < 30),
    marketGaps: keywords.filter(kw => kw.searchVolume > 100 && kw.difficulty < 40)
  };
}

function identifyContentGaps(opportunities, websiteKeywords, businessType) {
  const gaps = [];
  
  // Service-specific content gaps
  const serviceKeywords = opportunities.filter(kw => 
    kw.keyword.includes('service') || kw.keyword.includes('repair') || kw.keyword.includes('install')
  );
  
  if (serviceKeywords.length > 0 && websiteKeywords.length < 5) {
    gaps.push({
      type: 'service_pages',
      opportunity: 'Create dedicated service pages',
      keywords: serviceKeywords.slice(0, 3)
    });
  }
  
  // Location-specific content gaps
  const locationKeywords = opportunities.filter(kw => kw.keyword.includes('near me'));
  if (locationKeywords.length > 0) {
    gaps.push({
      type: 'location_content',
      opportunity: 'Add location-specific content',
      keywords: locationKeywords.slice(0, 3)
    });
  }
  
  return gaps;
}

function createOpportunityMatrix(keywords) {
  const highOpportunity = keywords.filter(kw => 
    kw.searchVolume > 50 && kw.difficulty < 50 && kw.relevanceScore > 70
  );
  
  const mediumOpportunity = keywords.filter(kw =>
    kw.searchVolume > 20 && kw.difficulty < 70 && kw.relevanceScore > 50
  );
  
  return { highOpportunity, mediumOpportunity };
}

function generateKeywordStrategy(opportunities, competitive, gaps, businessType) {
  const recommendations = [];
  
  if (opportunities.length > 0) {
    recommendations.push(`Target high-opportunity keyword: "${opportunities[0].keyword}" (${opportunities[0].searchVolume} searches/month)`);
  }
  
  if (competitive.marketGaps && competitive.marketGaps.length > 0) {
    recommendations.push(`Exploit market gap: "${competitive.marketGaps[0].keyword}" (low competition, good volume)`);
  }
  
  if (gaps.length > 0) {
    recommendations.push(`Create ${gaps[0].type.replace('_', ' ')}: ${gaps[0].opportunity}`);
  }
  
  // Industry-specific recommendations
  if (businessType.toLowerCase().includes('emergency') || businessType.toLowerCase().includes('24')) {
    recommendations.push('Optimize for emergency/urgent keywords with high commercial intent');
  }
  
  return recommendations;
}

function identifySeasonalKeywords(keywords, businessType) {
  const seasonalTerms = ['winter', 'summer', 'holiday', 'seasonal', 'spring', 'fall'];
  return keywords.filter(kw => 
    seasonalTerms.some(term => kw.keyword.toLowerCase().includes(term))
  );
}

function identifyEmergencyKeywords(keywords, businessType) {
  const emergencyTerms = ['emergency', 'urgent', '24/7', 'same day', 'immediate'];
  return keywords.filter(kw =>
    emergencyTerms.some(term => kw.keyword.toLowerCase().includes(term))
  );
}

function generateServiceAreaKeywords(businessType, location) {
  // Generate nearby cities/areas for service area expansion
  return [
    `${businessType} near ${location}`,
    `${businessType} serving ${location}`,
    `${businessType} ${location} area`
  ];
}

function calculateAvgSearchVolume(keywords) {
  if (keywords.length === 0) return 0;
  return Math.round(keywords.reduce((sum, kw) => sum + (kw.searchVolume || 0), 0) / keywords.length);
}

function calculateAvgDifficulty(keywords) {
  if (keywords.length === 0) return 0;
  return Math.round(keywords.reduce((sum, kw) => sum + (kw.difficulty || 0), 0) / keywords.length);
}

async function analyzeCurrentRankings(website, keywords, headers) {
  // This would require additional API calls to check current rankings
  // For now, return basic structure
  return {
    rankings: [],
    trackingKeywords: keywords.slice(0, 5),
    avgPosition: 0
  };
}

module.exports = {
  analyzeKeywords
};
