// backend/services/pagespeedService.js
// Migrated from ActivePieces Step 6: Google PageSpeed Insights Analysis

/**
 * PageSpeed Analysis Service
 * Uses Google PageSpeed Insights API to analyze Core Web Vitals and performance metrics
 * Tests both mobile and desktop performance with detailed Lighthouse metrics
 */

const analyzePageSpeed = async (businessData, apiCredentials) => {
  const { website = businessData.website || "" } = businessData;

  const {
    googleApiKey = process.env.GOOGLE_PAGESPEED_API_KEY ||
      apiCredentials?.googleApiKey ||
      "",
  } = apiCredentials || {};

  try {
    // Validate inputs
    if (!googleApiKey) {
      throw new Error("Google PageSpeed Insights API key is required");
    }

    if (!website || !website.startsWith("http")) {
      throw new Error("Invalid or missing website URL");
    }

    console.log(`⚡ Starting PageSpeed analysis for: ${website}`);

    const strategies = ["mobile", "desktop"];
    const insights = [];

    for (const strategy of strategies) {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        website,
      )}&strategy=${strategy}&key=${googleApiKey}`;

      try {
        console.log(`📱 Testing ${strategy} performance...`);

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.error) {
          insights.push({
            strategy,
            error: data.error.message,
            success: false,
          });
          console.log(`❌ ${strategy} test failed: ${data.error.message}`);
        } else {
          const lighthouse = data.lighthouseResult;

          // Extract performance score (0-1 scale, convert to 0-100)
          const performanceScore = lighthouse.categories.performance.score;
          const performanceScorePercent = Math.round(performanceScore * 100);

          // Extract Core Web Vitals and other metrics
          const metrics = {
            firstContentfulPaint:
              lighthouse.audits["first-contentful-paint"]?.displayValue ||
              "N/A",
            speedIndex: lighthouse.audits["speed-index"]?.displayValue || "N/A",
            largestContentfulPaint:
              lighthouse.audits["largest-contentful-paint"]?.displayValue ||
              "N/A",
            interactive:
              lighthouse.audits["interactive"]?.displayValue || "N/A",
            totalBlockingTime:
              lighthouse.audits["total-blocking-time"]?.displayValue || "N/A",
            cumulativeLayoutShift:
              lighthouse.audits["cumulative-layout-shift"]?.displayValue ||
              "N/A",
          };

          // Extract numeric values for scoring
          const numericMetrics = {
            firstContentfulPaint:
              lighthouse.audits["first-contentful-paint"]?.numericValue || 0,
            speedIndex: lighthouse.audits["speed-index"]?.numericValue || 0,
            largestContentfulPaint:
              lighthouse.audits["largest-contentful-paint"]?.numericValue || 0,
            interactive: lighthouse.audits["interactive"]?.numericValue || 0,
            totalBlockingTime:
              lighthouse.audits["total-blocking-time"]?.numericValue || 0,
            cumulativeLayoutShift:
              lighthouse.audits["cumulative-layout-shift"]?.numericValue || 0,
          };

          insights.push({
            strategy,
            success: true,
            performanceScore: performanceScore,
            performanceScorePercent: performanceScorePercent,
            metrics: metrics,
            numericMetrics: numericMetrics,
            // Add Core Web Vitals assessment
            coreWebVitals: assessCoreWebVitals(numericMetrics, strategy),
          });

          console.log(
            `✅ ${strategy} performance: ${performanceScorePercent}%`,
          );
        }
      } catch (err) {
        insights.push({
          strategy,
          error: err.message,
          success: false,
        });
        console.log(`❌ ${strategy} test error: ${err.message}`);
      }
    }

    // Calculate overall performance summary
    const successfulTests = insights.filter((insight) => insight.success);
    const overallSummary = calculateOverallSummary(successfulTests);

    // Generate performance recommendations
    const recommendations = generatePerformanceRecommendations(successfulTests);

    console.log(
      `✅ PageSpeed analysis complete: Overall score ${overallSummary.averageScore}%`,
    );

    return {
      success: true,
      url: website,
      insights: insights,
      overallSummary: overallSummary,
      recommendations: recommendations,
      analysisTimestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`❌ PageSpeed analysis failed: ${error.message}`);

    return {
      success: false,
      error: error.message,
      url: website || "Unknown",
      insights: [],
      overallSummary: {
        averageScore: 0,
        mobileScore: 0,
        desktopScore: 0,
        status: "Error",
      },
      recommendations: [],
    };
  }
};

// Assess Core Web Vitals based on Google's thresholds
function assessCoreWebVitals(metrics, strategy) {
  const assessments = {};

  // Largest Contentful Paint (LCP) - Good: ≤2.5s, Needs Improvement: ≤4s, Poor: >4s
  const lcp = metrics.largestContentfulPaint / 1000; // Convert to seconds
  if (lcp <= 2.5) {
    assessments.lcp = { status: "good", value: lcp, threshold: "≤2.5s" };
  } else if (lcp <= 4) {
    assessments.lcp = {
      status: "needs-improvement",
      value: lcp,
      threshold: "≤4s",
    };
  } else {
    assessments.lcp = { status: "poor", value: lcp, threshold: ">4s" };
  }

  // First Input Delay (FID) / Total Blocking Time (TBT) - Good: ≤100ms, Needs Improvement: ≤300ms, Poor: >300ms
  const tbt = metrics.totalBlockingTime;
  if (tbt <= 200) {
    // TBT threshold is more lenient than FID
    assessments.tbt = { status: "good", value: tbt, threshold: "≤200ms" };
  } else if (tbt <= 600) {
    assessments.tbt = {
      status: "needs-improvement",
      value: tbt,
      threshold: "≤600ms",
    };
  } else {
    assessments.tbt = { status: "poor", value: tbt, threshold: ">600ms" };
  }

  // Cumulative Layout Shift (CLS) - Good: ≤0.1, Needs Improvement: ≤0.25, Poor: >0.25
  const cls = metrics.cumulativeLayoutShift;
  if (cls <= 0.1) {
    assessments.cls = { status: "good", value: cls, threshold: "≤0.1" };
  } else if (cls <= 0.25) {
    assessments.cls = {
      status: "needs-improvement",
      value: cls,
      threshold: "≤0.25",
    };
  } else {
    assessments.cls = { status: "poor", value: cls, threshold: ">0.25" };
  }

  // First Contentful Paint (FCP) - Good: ≤1.8s, Needs Improvement: ≤3s, Poor: >3s
  const fcp = metrics.firstContentfulPaint / 1000;
  if (fcp <= 1.8) {
    assessments.fcp = { status: "good", value: fcp, threshold: "≤1.8s" };
  } else if (fcp <= 3) {
    assessments.fcp = {
      status: "needs-improvement",
      value: fcp,
      threshold: "≤3s",
    };
  } else {
    assessments.fcp = { status: "poor", value: fcp, threshold: ">3s" };
  }

  return assessments;
}

// Calculate overall performance summary
function calculateOverallSummary(successfulTests) {
  if (successfulTests.length === 0) {
    return {
      averageScore: 0,
      mobileScore: 0,
      desktopScore: 0,
      status: "No data",
      coreWebVitalsStatus: "unknown",
    };
  }

  const mobileTest = successfulTests.find((test) => test.strategy === "mobile");
  const desktopTest = successfulTests.find(
    (test) => test.strategy === "desktop",
  );

  const mobileScore = mobileTest ? mobileTest.performanceScorePercent : 0;
  const desktopScore = desktopTest ? desktopTest.performanceScorePercent : 0;

  const averageScore =
    successfulTests.length > 0
      ? Math.round(
          successfulTests.reduce(
            (sum, test) => sum + test.performanceScorePercent,
            0,
          ) / successfulTests.length,
        )
      : 0;

  // Determine overall status
  let status;
  if (averageScore >= 90) {
    status = "Excellent";
  } else if (averageScore >= 50) {
    status = "Needs Improvement";
  } else {
    status = "Poor";
  }

  // Assess Core Web Vitals status
  let coreWebVitalsStatus = "unknown";
  if (mobileTest && mobileTest.coreWebVitals) {
    const vitals = mobileTest.coreWebVitals;
    const goodCount = Object.values(vitals).filter(
      (v) => v.status === "good",
    ).length;
    const totalCount = Object.keys(vitals).length;

    if (goodCount === totalCount) {
      coreWebVitalsStatus = "good";
    } else if (goodCount >= totalCount / 2) {
      coreWebVitalsStatus = "needs-improvement";
    } else {
      coreWebVitalsStatus = "poor";
    }
  }

  return {
    averageScore,
    mobileScore,
    desktopScore,
    status,
    coreWebVitalsStatus,
    testsCompleted: successfulTests.length,
  };
}

// Generate performance recommendations based on results
function generatePerformanceRecommendations(successfulTests) {
  const recommendations = [];

  if (successfulTests.length === 0) {
    return [
      "Unable to analyze website performance - check if website is accessible",
    ];
  }

  const mobileTest = successfulTests.find((test) => test.strategy === "mobile");
  const desktopTest = successfulTests.find(
    (test) => test.strategy === "desktop",
  );

  // Overall performance recommendations
  const avgScore =
    successfulTests.reduce(
      (sum, test) => sum + test.performanceScorePercent,
      0,
    ) / successfulTests.length;

  if (avgScore < 50) {
    recommendations.push(
      "Website performance is poor - prioritize speed optimization immediately",
    );
  } else if (avgScore < 90) {
    recommendations.push(
      "Website performance needs improvement - consider optimization strategies",
    );
  }

  // Mobile-specific recommendations
  if (mobileTest) {
    if (mobileTest.performanceScorePercent < 50) {
      recommendations.push(
        "Mobile performance is critical - optimize for mobile users first",
      );
    }

    const mobileCWV = mobileTest.coreWebVitals;
    if (mobileCWV) {
      if (mobileCWV.lcp && mobileCWV.lcp.status !== "good") {
        recommendations.push(
          "Improve Largest Contentful Paint (LCP) - optimize images and server response times",
        );
      }
      if (mobileCWV.cls && mobileCWV.cls.status !== "good") {
        recommendations.push(
          "Fix Cumulative Layout Shift (CLS) - ensure elements don't move during page load",
        );
      }
      if (mobileCWV.tbt && mobileCWV.tbt.status !== "good") {
        recommendations.push(
          "Reduce Total Blocking Time (TBT) - minimize JavaScript execution time",
        );
      }
      if (mobileCWV.fcp && mobileCWV.fcp.status !== "good") {
        recommendations.push(
          "Improve First Contentful Paint (FCP) - optimize critical rendering path",
        );
      }
    }
  }

  // Desktop-specific recommendations
  if (
    desktopTest &&
    desktopTest.performanceScorePercent < mobileTest?.performanceScorePercent
  ) {
    recommendations.push(
      "Desktop performance is worse than mobile - investigate desktop-specific issues",
    );
  }

  // Generic recommendations if no specific issues found
  if (recommendations.length === 0) {
    recommendations.push(
      "Performance is good - maintain current optimization practices",
    );
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

module.exports = {
  analyzePageSpeed,
};
