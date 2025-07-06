// backend/services/reviewService.js
// Migrated from ActivePieces Step 7: Review & Reputation Analysis

const analyzeReviews = async (
  businessData,
  competitorResults,
  apiCredentials,
) => {
  try {
    console.log("🌟 Starting review & reputation analysis...");
    console.log(`Business name: "${businessData.businessName}"`);

    // Extract competitors data from competitor analysis results
    let competitors = [];

    if (competitorResults?.competitors) {
      console.log("Found competitors from competitor analysis");
      if (Array.isArray(competitorResults.competitors)) {
        competitors = competitorResults.competitors;
      } else if (Array.isArray(competitorResults.competitors.competitors)) {
        competitors = competitorResults.competitors.competitors;
      } else if (
        Array.isArray(competitorResults.competitors.peopleAlsoSearch)
      ) {
        competitors = competitorResults.competitors.peopleAlsoSearch;
      }
    }

    console.log(`Competitors array length: ${competitors.length}`);

    if (!competitors.length) {
      console.log("No competitors data found for review analysis");
      return {
        success: false,
        error:
          "No competitors data found. Review analysis requires competitor data.",
        businessReviewCount: 0,
        businessRating: 0,
        competitorAnalysis: [],
        competitiveInsights: [],
        improvementOpportunities: [],
        reviewScore: 0,
        debugInfo: {
          competitorResultsKeys: Object.keys(competitorResults || {}),
          competitorsType: typeof competitorResults?.competitors,
          hasCompetitorsArray: Array.isArray(competitorResults?.competitors),
        },
      };
    }

    // Try to find the business in the competitors list
    const businessIndex = competitors.findIndex((comp) =>
      comp?.title
        ?.toLowerCase()
        .includes(businessData.businessName.toLowerCase()),
    );

    console.log(`Business index in competitors: ${businessIndex}`);

    if (businessIndex === -1) {
      console.log(
        `Business "${businessData.businessName}" not found in competitors list`,
      );
      return {
        success: false,
        error: `Business "${businessData.businessName}" not found in competitors data`,
        businessReviewCount: 0,
        businessRating: 0,
        competitorAnalysis: [],
        competitiveInsights: [],
        improvementOpportunities: [],
        reviewScore: 0,
      };
    }

    // Extract business review data
    const businessCompetitorData = competitors[businessIndex];
    const reviewCount = businessCompetitorData.reviewCount || 0;
    const rating =
      businessCompetitorData.rating?.value ||
      businessCompetitorData.rating ||
      0;

    console.log(
      `Business review data: reviews=${reviewCount}, rating=${rating}`,
    );

    // Analyze other competitors (exclude the business itself)
    const otherCompetitors = competitors
      .filter((_, i) => i !== businessIndex)
      .sort((a, b) => {
        const aScore =
          (a.reviewCount || 0) * (a.rating?.value || a.rating || 0);
        const bScore =
          (b.reviewCount || 0) * (b.rating?.value || b.rating || 0);
        return bScore - aScore;
      });

    const topCompetitors = otherCompetitors.slice(0, 5);

    // Calculate competitor averages
    const competitorReviewCounts = topCompetitors.map(
      (c) => c.reviewCount || 0,
    );
    const competitorRatings = topCompetitors.map(
      (c) => c.rating?.value || c.rating || 0,
    );

    const avgCompetitorReviewCount = competitorReviewCounts.length
      ? Math.round(
          competitorReviewCounts.reduce((sum, val) => sum + val, 0) /
            competitorReviewCounts.length,
        )
      : 0;

    const avgCompetitorRating = competitorRatings.length
      ? parseFloat(
          (
            competitorRatings.reduce((sum, val) => sum + val, 0) /
            competitorRatings.length
          ).toFixed(1),
        )
      : 0;

    // Calculate performance differences
    const reviewCountDifference = reviewCount - avgCompetitorReviewCount;
    const ratingDifference = rating - avgCompetitorRating;

    // Generate competitive insights
    const competitiveInsights = [];

    if (reviewCountDifference < 0) {
      competitiveInsights.push(
        `Your review count (${reviewCount}) is ${Math.abs(reviewCountDifference)} lower than your competitors' average (${avgCompetitorReviewCount})`,
      );
    } else if (reviewCountDifference > 0) {
      competitiveInsights.push(
        `Your review count (${reviewCount}) is ${reviewCountDifference} higher than your competitors' average (${avgCompetitorReviewCount})`,
      );
    } else {
      competitiveInsights.push(
        `Your review count (${reviewCount}) is equal to your competitors' average`,
      );
    }

    if (ratingDifference < -0.3) {
      competitiveInsights.push(
        `Your rating (${rating}) is lower than your competitors' average (${avgCompetitorRating})`,
      );
    } else if (ratingDifference > 0.3) {
      competitiveInsights.push(
        `Your rating (${rating}) is higher than your competitors' average (${avgCompetitorRating})`,
      );
    } else {
      competitiveInsights.push(
        `Your rating (${rating}) is similar to your competitors' average (${avgCompetitorRating})`,
      );
    }

    // Generate improvement opportunities
    const improvementOpportunities = [];

    if (reviewCount < 10) {
      improvementOpportunities.push(
        "Implement a review generation strategy to get your first 10 reviews",
      );
    } else if (reviewCount < avgCompetitorReviewCount) {
      improvementOpportunities.push(
        `Increase review volume to match competitors (aim for ${avgCompetitorReviewCount}+ reviews)`,
      );
    }

    if (rating < 4.0) {
      improvementOpportunities.push(
        "Improve service quality to raise your rating above 4.0",
      );
    } else if (rating < avgCompetitorRating) {
      improvementOpportunities.push(
        `Work on improving your rating to beat the competitor average of ${avgCompetitorRating}`,
      );
    }

    // Calculate review score (0-100 scale)
    let ratingScore = (rating / 5) * 50; // Rating component (max 50 points)
    let reviewCountScore =
      reviewCount > 0 ? Math.min(40, Math.log10(reviewCount) * 20) : 0; // Review count component (max 40 points)
    let competitiveBonus = 0; // Competitive bonus (max 10 points)

    if (
      reviewCount > avgCompetitorReviewCount &&
      rating >= avgCompetitorRating
    ) {
      competitiveBonus = 10; // Beating competitors in both metrics
    } else if (
      reviewCount > avgCompetitorReviewCount ||
      rating > avgCompetitorRating
    ) {
      competitiveBonus = 5; // Beating competitors in one metric
    }

    const reviewScore = Math.round(
      ratingScore + reviewCountScore + competitiveBonus,
    );

    // Prepare competitor analysis data
    const competitorAnalysis = topCompetitors.map((comp) => ({
      name: comp.title || "",
      reviewCount: comp.reviewCount || 0,
      rating: comp.rating?.value || comp.rating || 0,
      hasWebsite: !!comp.domain,
    }));

    const result = {
      success: true,
      businessReviewCount: reviewCount,
      businessRating: rating,
      avgCompetitorReviewCount,
      avgCompetitorRating,
      reviewCountDifference,
      ratingDifference,
      reviewScore,
      competitiveInsights,
      improvementOpportunities,
      competitorAnalysis,

      // Additional analysis metrics
      reputationSummary: {
        overallScore: reviewScore,
        reviewVolume:
          reviewCount >= avgCompetitorReviewCount
            ? "Above Average"
            : "Below Average",
        ratingQuality:
          rating >= avgCompetitorRating ? "Above Average" : "Below Average",
        competitivePosition:
          reviewScore >= 75
            ? "Strong"
            : reviewScore >= 50
              ? "Moderate"
              : "Needs Improvement",
      },

      // Recommendations based on analysis
      recommendations: [
        ...improvementOpportunities,
        ...(reviewCount >= avgCompetitorReviewCount && rating >= 4.5
          ? [
              "Maintain your strong review performance and consider showcasing reviews on your website",
            ]
          : []),
        ...(reviewCount < 5
          ? ["Set up automated review request systems after job completion"]
          : []),
        ...(rating < 4.0
          ? ["Address any service quality issues mentioned in negative reviews"]
          : []),
      ],
    };

    console.log("✅ Review analysis completed");
    console.log(`Review score: ${reviewScore}/100`);
    console.log(`Business: ${reviewCount} reviews, ${rating} rating`);
    console.log(
      `Competitors avg: ${avgCompetitorReviewCount} reviews, ${avgCompetitorRating} rating`,
    );

    return result;
  } catch (error) {
    console.error("❌ Review analysis failed:", error);
    return {
      success: false,
      error: "Review analysis failed",
      message: error.message,
      businessReviewCount: 0,
      businessRating: 0,
      competitorAnalysis: [],
      competitiveInsights: [],
      improvementOpportunities: [],
      reviewScore: 0,
    };
  }
};

module.exports = {
  analyzeReviews,
};
