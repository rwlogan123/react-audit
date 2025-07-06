// backend/services/competitorService.js
// Migrated from ActivePieces Step 3: Competitor Analysis & Competitive Benchmarking
// ENHANCED WITH DEBUG LOGGING

/**
 * Competitor Analysis Service
 * Uses DataForSEO Maps API to discover competitors and perform competitive benchmarking
 * Provides detailed market intelligence and strategic positioning insights
 */

const analyzeCompetitors = async (businessData, apiCredentials) => {
  const {
    businessName = businessData.businessName || "",
    city = businessData.city || "",
    state = businessData.state || "",
    tradeType = businessData.tradeType || businessData.businessType || "",
    zip = businessData.zipCode || businessData.zip || "",
  } = businessData;

  const {
    apiUsername = process.env.DATAFORSEO_USER || apiCredentials?.username || "",
    apiPassword = process.env.DATAFORSEO_PASS || apiCredentials?.password || "",
  } = apiCredentials || {};

  const debugLog = [];
  const trimmedKeyword = tradeType.trim();
  const trimmedCity = city.trim();
  const trimmedState = state.trim();
  const formattedKeyword =
    `${trimmedKeyword} ${trimmedCity} ${trimmedState}`.trim();

  // Create base64 auth string
  const authString = Buffer.from(`${apiUsername}:${apiPassword}`).toString(
    "base64",
  );

  const locationCode = 2840; // United States
  const languageCode = "en";

  let competitors = [];
  let enhancedBusinessData = null;
  let competitiveAnalysis = null;
  let keywordData = [];

  debugLog.push(`📌 Business: ${businessName}`);
  debugLog.push(`📍 Keyword: ${formattedKeyword}`);
  debugLog.push(`🎯 Using COMPETITIVE BENCHMARKING strategy`);

  try {
    // Validate inputs
    if (!apiUsername || !apiPassword) {
      throw new Error("DataForSEO API credentials are required");
    }

    if (!businessName) {
      throw new Error("Business name is required");
    }

    console.log(`🔍 Starting competitor analysis for: ${formattedKeyword}`);

    // 🔍 ENHANCED DEBUG: Show exactly what we're sending
    console.log('🔍 Debug - Credentials and Request Details:');
    console.log('Username being used:', apiUsername);
    console.log('Username length:', apiUsername?.length);
    console.log('Password length:', apiPassword?.length);
    console.log('Password first 8 chars:', apiPassword?.substring(0, 8) + '...');
    console.log('Auth string length:', authString?.length);
    console.log('Formatted keyword:', formattedKeyword);

    // STEP 1: Get competitor data from DataForSEO Maps API
    const mapsPayload = [
      {
        keyword: formattedKeyword,
        location_code: locationCode,
        language_code: languageCode,
        depth: 20,
      },
    ];

    // 🔍 ENHANCED DEBUG: Show exact request details
    console.log('🔍 Debug - API Request Details:');
    console.log('URL:', "https://api.dataforseo.com/v3/serp/google/maps/live/advanced");
    console.log('Method:', 'POST');
    console.log('Headers:', {
      Authorization: `Basic ${authString.substring(0, 20)}...`,
      "Content-Type": "application/json"
    });
    console.log('Payload:', JSON.stringify(mapsPayload, null, 2));

    console.log(`📡 Calling DataForSEO Maps API...`);
    const mapsResponse = await fetch(
      "https://api.dataforseo.com/v3/serp/google/maps/live/advanced",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mapsPayload),
      },
    );

    // 🔍 ENHANCED DEBUG: Show response details
    console.log('🔍 Debug - API Response Details:');
    console.log('Status:', mapsResponse.status);
    console.log('Status Text:', mapsResponse.statusText);
    console.log('Headers:', Object.fromEntries(mapsResponse.headers.entries()));

    if (!mapsResponse.ok) {
      // 🔍 Try to get response body for more details
      let errorBody = '';
      try {
        errorBody = await mapsResponse.text();
        console.log('🔍 Error response body:', errorBody);
      } catch (e) {
        console.log('🔍 Could not read error response body');
      }
      
      throw new Error(
        `Maps API request failed: ${mapsResponse.status} ${mapsResponse.statusText}. Body: ${errorBody.substring(0, 200)}`,
      );
    }

    const mapsResult = await mapsResponse.json();
    
    // 🔍 ENHANCED DEBUG: Show API result structure
    console.log('🔍 Debug - API Result Structure:');
    console.log('Status code:', mapsResult.status_code);
    console.log('Status message:', mapsResult.status_message);
    console.log('Tasks length:', mapsResult.tasks?.length);
    console.log('Result length:', mapsResult.tasks?.[0]?.result?.length);
    
    debugLog.push(`➡️ Maps API status: ${mapsResponse.status}`);

    if (mapsResult.status_code !== 20000) {
      console.log('🔍 Full API result for debugging:', JSON.stringify(mapsResult, null, 2));
      throw new Error(
        `Maps API error: ${mapsResult.status_message || "Unknown error"}`,
      );
    }

    const items = mapsResult?.tasks?.[0]?.result?.[0]?.items || [];
    console.log(`📊 Found ${items.length} potential competitors`);

    // Process competitors
    competitors = items.map((item, index) => {
      if (index < 3) {
        debugLog.push(
          `🔍 Available fields for ${item.title}: ${Object.keys(item).join(", ")}`,
        );
      }

      return {
        title: item.title || null,
        domain: item.domain || null,
        url: item.url || null,
        rating: item.rating?.value || null,
        reviewCount: item.rating?.votes_count || null,
        address: item.address || null,
        phone: item.phone || null,
        categories: item.category
          ? [item.category]
          : item.categories || item.business_categories || [],
        snippet: item.snippet || null,
        features: item.features || [],
        latitude: item.coordinates?.latitude || null,
        longitude: item.coordinates?.longitude || null,
        workingHours: item.work_hours || null,
        photoCount: item.total_photos || 0,
        placeId: item.place_id || null,
      };
    });

    // STEP 2: Get keyword volume data for market research
    debugLog.push(`🔍 Fetching keyword volume data...`);

    const competitorLocations = competitors
      .filter((comp) => comp.address)
      .map((comp) => {
        const addressParts = comp.address.split(",");
        return addressParts.length >= 2
          ? addressParts[addressParts.length - 2].trim()
          : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    // Generate keyword variations based on business type
    const getBaseServices = (businessType) => {
      const type = businessType.toLowerCase();
      if (type.includes("carpenter") || type.includes("construction")) {
        return [
          "basement finishing",
          "custom carpentry",
          "finish carpentry",
          "home renovation",
          "contractor",
        ];
      } else if (type.includes("plumber")) {
        return [
          "plumbing",
          "emergency plumber",
          "drain cleaning",
          "pipe repair",
          "water heater",
        ];
      } else if (type.includes("electrician")) {
        return [
          "electrical",
          "emergency electrician",
          "electrical repair",
          "wiring",
          "electrical installation",
        ];
      } else if (type.includes("hvac")) {
        return [
          "hvac",
          "air conditioning",
          "heating",
          "furnace repair",
          "ac repair",
        ];
      } else {
        return [
          businessType,
          `${businessType} service`,
          `${businessType} repair`,
          `${businessType} installation`,
          `${businessType} contractor`,
        ];
      }
    };

    const baseServices = getBaseServices(tradeType);
    const keywordsToTest = [];

    keywordsToTest.push(formattedKeyword);

    baseServices.forEach((service) => {
      keywordsToTest.push(`${service} ${trimmedCity}`);
      keywordsToTest.push(`${service} ${trimmedState}`);

      competitorLocations.forEach((location) => {
        keywordsToTest.push(`${service} ${location}`);
      });
    });

    const uniqueKeywords = [...new Set(keywordsToTest)].slice(0, 15);

    const keywordsPayload = [
      {
        keywords: uniqueKeywords,
        location_code: locationCode,
        language_code: languageCode,
      },
    ];

    console.log(
      `📈 Fetching keyword volume data for ${uniqueKeywords.length} keywords...`,
    );
    const keywordsResponse = await fetch(
      "https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authString}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(keywordsPayload),
      },
    );

    if (keywordsResponse.ok) {
      const keywordsResult = await keywordsResponse.json();
      if (keywordsResult.status_code === 20000) {
        const keywordItems = keywordsResult?.tasks?.[0]?.result || [];
        keywordData = keywordItems.map((item) => ({
          keyword: item.keyword,
          searchVolume: item.search_volume || 0,
          competition: item.competition || null,
          competitionIndex: item.competition_index || null,
          cpc: item.cpc || null,
        }));
        console.log(
          `📊 Retrieved keyword data for ${keywordData.length} keywords`,
        );
      }
    }

    // STEP 3: COMPETITIVE BENCHMARKING ANALYSIS
    const validCompetitors = competitors.filter((comp) => comp.rating !== null);

    // Calculate competitive tiers
    const sortedByRating = [...validCompetitors].sort(
      (a, b) => b.rating - a.rating,
    );
    const sortedByReviews = [...competitors].sort(
      (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0),
    );
    const sortedByPhotos = [...competitors].sort(
      (a, b) => (b.photoCount || 0) - (a.photoCount || 0),
    );

    // Define competitive tiers
    const getCompetitiveTiers = (metric) => {
      const values = competitors
        .map((comp) => comp[metric] || 0)
        .filter((v) => v > 0)
        .sort((a, b) => b - a);
      if (values.length === 0)
        return { top10: 0, top25: 0, median: 0, bottom25: 0 };

      return {
        top10: values[Math.floor(values.length * 0.1)] || values[0],
        top25: values[Math.floor(values.length * 0.25)] || values[0],
        median: values[Math.floor(values.length * 0.5)] || values[0],
        bottom25: values[Math.floor(values.length * 0.75)] || values[0],
      };
    };

    const reviewTiers = getCompetitiveTiers("reviewCount");
    const photoTiers = getCompetitiveTiers("photoCount");
    const ratingTiers = {
      top10:
        sortedByRating[Math.floor(sortedByRating.length * 0.1)]?.rating || 5.0,
      top25:
        sortedByRating[Math.floor(sortedByRating.length * 0.25)]?.rating || 5.0,
      median:
        sortedByRating[Math.floor(sortedByRating.length * 0.5)]?.rating || 4.5,
      bottom25:
        sortedByRating[Math.floor(sortedByRating.length * 0.75)]?.rating || 4.0,
    };

    const competitiveTiers = {
      reviews: reviewTiers,
      photos: photoTiers,
      ratings: ratingTiers,
    };

    competitiveAnalysis = {
      totalCompetitors: competitors.length,
      validRatings: validCompetitors.length,

      // Competitive Tiers
      competitiveTiers,

      // Traditional averages (for reference)
      averageRating:
        validCompetitors.length > 0
          ? parseFloat(
              (
                validCompetitors.reduce((sum, comp) => sum + comp.rating, 0) /
                validCompetitors.length
              ).toFixed(1),
            )
          : 0,
      averageReviews:
        competitors.length > 0
          ? Math.round(
              competitors.reduce(
                (sum, comp) => sum + (comp.reviewCount || 0),
                0,
              ) / competitors.length,
            )
          : 0,
      averagePhotos:
        competitors.length > 0
          ? Math.round(
              competitors.reduce(
                (sum, comp) => sum + (comp.photoCount || 0),
                0,
              ) / competitors.length,
            )
          : 0,

      // Market presence metrics
      websitePercentage:
        competitors.length > 0
          ? Math.round(
              (competitors.filter((comp) => comp.domain).length /
                competitors.length) *
                100,
            )
          : 0,
      categoryPercentage:
        competitors.length > 0
          ? Math.round(
              (competitors.filter((comp) => comp.categories.length > 0).length /
                competitors.length) *
                100,
            )
          : 0,
      featurePercentage:
        competitors.length > 0
          ? Math.round(
              (competitors.filter((comp) => comp.features.length > 0).length /
                competitors.length) *
                100,
            )
          : 0,

      // Top performers
      topPerformers: {
        highestRated: sortedByRating[0] || null,
        mostReviews: sortedByReviews[0] || null,
        mostPhotos: sortedByPhotos[0] || null,
        top3Rated: sortedByRating.slice(0, 3),
        top3Reviews: sortedByReviews.slice(0, 3),
        top3Photos: sortedByPhotos.slice(0, 3),
      },
    };

    // Find the business's own data in competitor results
    const businessIndex = competitors.findIndex(
      (comp) =>
        comp.title &&
        businessName &&
        comp.title.toLowerCase().includes(businessName.toLowerCase()),
    );

    if (businessIndex !== -1) {
      const targetBusiness = competitors[businessIndex];

      // COMPETITIVE BENCHMARKING COMPLETENESS ASSESSMENT
      const calculateCompetitiveCompleteness = (business, tiers, analysis) => {
        const factors = [];

        // CRITICAL FACTORS (Based on what competitors have)
        factors.push(
          {
            check: !!business.title,
            points: 15,
            name: "Business Name",
            missing: "Add complete business name",
            category: "critical",
          },
          {
            check: !!business.phone,
            points: 15,
            name: "Phone Number",
            missing: "Add phone number",
            category: "critical",
          },
          {
            check: !!business.address,
            points: 15,
            name: "Complete Address",
            missing: "Add complete business address",
            category: "critical",
          },
        );

        // COMPETITIVE FACTORS (Based on competitor performance)

        // Categories - check if most competitors have them
        if (analysis.categoryPercentage > 50) {
          factors.push({
            check: business.categories.length > 0,
            points: 12,
            name: "Business Categories",
            missing: "Add business categories (most competitors have them)",
            category: "competitive",
          });
        }

        // Website - check competitive advantage
        if (analysis.websitePercentage > 30) {
          factors.push({
            check: !!business.domain || !!business.url,
            points: 10,
            name: "Website",
            missing: `Add website URL (${analysis.websitePercentage}% of competitors have websites)`,
            category: "competitive",
          });
        }

        // Hours
        factors.push({
          check: !!business.workingHours?.timetable,
          points: 8,
          name: "Business Hours",
          missing: "Add complete business hours",
          category: "operational",
        });

        // PERFORMANCE TARGETS (Based on competitive tiers)

        // Photo targets based on competitive performance
        if (business.photoCount < tiers.photos.bottom25) {
          factors.push({
            check: false,
            points: 10,
            name: "Minimum Photos",
            missing: `Add ${tiers.photos.bottom25 - business.photoCount} photos to reach bottom 25% (currently ${business.photoCount})`,
            category: "performance",
          });
        } else if (business.photoCount < tiers.photos.median) {
          factors.push({
            check: false,
            points: 8,
            name: "Competitive Photos",
            missing: `Add ${tiers.photos.median - business.photoCount} photos to reach median (currently ${business.photoCount})`,
            category: "performance",
          });
        } else if (business.photoCount < tiers.photos.top25) {
          factors.push({
            check: false,
            points: 5,
            name: "Top-Tier Photos",
            missing: `Add ${tiers.photos.top25 - business.photoCount} photos to reach top 25% (currently ${business.photoCount})`,
            category: "optimization",
          });
        } else {
          factors.push({
            check: true,
            points: 10,
            name: "Competitive Photo Count",
            missing: "",
            category: "strength",
          });
        }

        // Review targets based on competitive performance
        const currentReviews = business.reviewCount || 0;
        if (currentReviews < tiers.reviews.bottom25) {
          factors.push({
            check: false,
            points: 12,
            name: "Minimum Reviews",
            missing: `Get ${tiers.reviews.bottom25 - currentReviews} reviews to reach bottom 25% (currently ${currentReviews})`,
            category: "performance",
          });
        } else if (currentReviews < tiers.reviews.median) {
          factors.push({
            check: false,
            points: 10,
            name: "Competitive Reviews",
            missing: `Get ${tiers.reviews.median - currentReviews} reviews to reach median (currently ${currentReviews})`,
            category: "performance",
          });
        } else if (currentReviews < tiers.reviews.top25) {
          factors.push({
            check: false,
            points: 7,
            name: "Top-Tier Reviews",
            missing: `Get ${tiers.reviews.top25 - currentReviews} reviews to reach top 25% (currently ${currentReviews})`,
            category: "optimization",
          });
        } else {
          factors.push({
            check: true,
            points: 12,
            name: "Competitive Review Count",
            missing: "",
            category: "strength",
          });
        }

        // Rating competitive assessment
        const currentRating = business.rating || 0;
        if (currentRating < tiers.ratings.bottom25) {
          factors.push({
            check: false,
            points: 8,
            name: "Competitive Rating",
            missing: `Improve service quality - rating below bottom 25% (${currentRating} vs ${tiers.ratings.bottom25})`,
            category: "performance",
          });
        } else if (currentRating >= tiers.ratings.top25) {
          factors.push({
            check: true,
            points: 8,
            name: "Strong Rating",
            missing: "",
            category: "strength",
          });
        }

        // Features - if competitors have them
        if (analysis.featurePercentage > 20) {
          factors.push({
            check: business.features.length > 0,
            points: 5,
            name: "Business Features",
            missing: `Add business features (${analysis.featurePercentage}% of competitors have features)`,
            category: "competitive",
          });
        }

        // Calculate scores
        const maxPossiblePoints = factors.reduce(
          (sum, factor) => sum + factor.points,
          0,
        );
        let earnedPoints = 0;
        const missingItems = [];
        const completedItems = [];
        const strengthAreas = [];

        factors.forEach((factor) => {
          if (factor.check) {
            earnedPoints += factor.points;
            if (factor.category === "strength") {
              strengthAreas.push(factor.name);
            } else {
              completedItems.push(factor.name);
            }
          } else {
            missingItems.push(factor.missing);
          }
        });

        const completenessScore = Math.round(
          (earnedPoints / maxPossiblePoints) * 100,
        );

        // Competitive-based levels
        let completenessLevel, completenessMessage, priority;

        if (completenessScore >= 85) {
          completenessLevel = "Market Leader";
          completenessMessage = "Profile outperforms most competitors";
          priority = "maintain";
        } else if (completenessScore >= 70) {
          completenessLevel = "Competitive";
          completenessMessage = "Profile competitive with market standards";
          priority = "optimize";
        } else if (completenessScore >= 55) {
          completenessLevel = "Below Average";
          completenessMessage = "Profile underperforms vs competitors";
          priority = "improve";
        } else {
          completenessLevel = "High Risk";
          completenessMessage = "Profile significantly behind competitors";
          priority = "urgent";
        }

        return {
          completenessScore,
          completenessLevel,
          completenessMessage,
          priority,
          earnedPoints,
          maxPossiblePoints,
          completedItems,
          missingItems,
          strengthAreas,
          improvementOpportunities: missingItems.slice(0, 5),
        };
      };

      // Calculate competitive position more precisely
      const calculateCompetitivePosition = (business, competitors) => {
        const position = {
          overallRank: businessIndex + 1,
          ratingRank:
            competitors.filter(
              (comp) => comp.rating && comp.rating > (business.rating || 0),
            ).length + 1,
          reviewRank:
            competitors.filter(
              (comp) => (comp.reviewCount || 0) > (business.reviewCount || 0),
            ).length + 1,
          photoRank:
            competitors.filter(
              (comp) => (comp.photoCount || 0) > (business.photoCount || 0),
            ).length + 1,

          // Percentile rankings
          ratingPercentile: Math.round(
            (1 -
              competitors.filter(
                (comp) => comp.rating && comp.rating > (business.rating || 0),
              ).length /
                validCompetitors.length) *
              100,
          ),
          reviewPercentile: Math.round(
            (1 -
              competitors.filter(
                (comp) => (comp.reviewCount || 0) > (business.reviewCount || 0),
              ).length /
                competitors.length) *
              100,
          ),
          photoPercentile: Math.round(
            (1 -
              competitors.filter(
                (comp) => (comp.photoCount || 0) > (business.photoCount || 0),
              ).length /
                competitors.length) *
              100,
          ),

          // Gaps to next tier
          gapToTop25Reviews: Math.max(
            0,
            competitiveTiers.reviews.top25 - (business.reviewCount || 0),
          ),
          gapToTop25Photos: Math.max(
            0,
            competitiveTiers.photos.top25 - (business.photoCount || 0),
          ),
          gapToTopRating: Math.max(
            0,
            competitiveTiers.ratings.top25 - (business.rating || 0),
          ),

          // Competitive advantages
          advantages: [],
          disadvantages: [],
        };

        // Identify advantages and disadvantages
        if (position.ratingPercentile >= 75)
          position.advantages.push("Rating in top 25%");
        if (position.reviewPercentile >= 75)
          position.advantages.push("Reviews in top 25%");
        if (position.photoPercentile >= 75)
          position.advantages.push("Photos in top 25%");

        if (position.ratingPercentile <= 25)
          position.disadvantages.push("Rating in bottom 25%");
        if (position.reviewPercentile <= 25)
          position.disadvantages.push("Reviews in bottom 25%");
        if (position.photoPercentile <= 25)
          position.disadvantages.push("Photos in bottom 25%");

        return position;
      };

      // Enhanced analysis using competitive benchmarking
      const completenessAnalysis = calculateCompetitiveCompleteness(
        targetBusiness,
        competitiveTiers,
        competitiveAnalysis,
      );
      const competitivePosition = calculateCompetitivePosition(
        targetBusiness,
        competitors,
      );

      enhancedBusinessData = {
        ...targetBusiness,
        currentRank: businessIndex + 1,

        // Competitive completeness
        completenessScore: completenessAnalysis.completenessScore,
        completenessLevel: completenessAnalysis.completenessLevel,
        completenessMessage: completenessAnalysis.completenessMessage,
        priority: completenessAnalysis.priority,
        improvementOpportunities: completenessAnalysis.improvementOpportunities,
        strengthAreas: completenessAnalysis.strengthAreas,

        // Detailed competitive position
        competitivePosition,

        // Competitive tiers for reference
        competitiveBenchmarks: competitiveTiers,

        // Detailed breakdown
        completenessBreakdown: {
          earnedPoints: completenessAnalysis.earnedPoints,
          maxPossiblePoints: completenessAnalysis.maxPossiblePoints,
          completedItems: completenessAnalysis.completedItems,
          allMissingItems: completenessAnalysis.missingItems,
        },
      };

      debugLog.push(
        `🎯 Competitive completeness: ${completenessAnalysis.completenessScore}% (${completenessAnalysis.completenessLevel})`,
      );
      debugLog.push(
        `📊 Position: Rank #${businessIndex + 1}, Rating ${targetBusiness.rating} (${competitivePosition.ratingPercentile}th percentile)`,
      );
      debugLog.push(
        `📈 Performance: ${competitivePosition.reviewPercentile}th percentile reviews, ${competitivePosition.photoPercentile}th percentile photos`,
      );
      debugLog.push(
        `🏆 Advantages: ${competitivePosition.advantages.join(", ") || "None identified"}`,
      );
      debugLog.push(
        `⚠️ Gaps: ${competitivePosition.disadvantages.join(", ") || "None identified"}`,
      );
    }

    debugLog.push(`📊 Analyzed ${competitors.length} direct competitors`);
    debugLog.push(
      `🎯 Competitive tiers: Top 25% photos (${photoTiers.top25}), reviews (${reviewTiers.top25}), rating (${ratingTiers.top25})`,
    );

    console.log(
      `✅ Competitor analysis complete: ${competitors.length} competitors, ${keywordData.length} keywords analyzed`,
    );

    return {
      success: true,
      keyword: formattedKeyword,
      competitors,
      businessData: enhancedBusinessData,
      competitiveAnalysis,
      keywordData,
      debugLog,
    };
  } catch (err) {
    console.error(`❌ Competitor analysis failed: ${err.message}`);
    debugLog.push(`❌ Error: ${err.message}`);

    return {
      success: false,
      error: true,
      message: err.message,
      keyword: formattedKeyword,
      competitors: [],
      businessData: null,
      competitiveAnalysis: null,
      keywordData: [],
      debugLog,
    };
  }
};

module.exports = {
  analyzeCompetitors,
};