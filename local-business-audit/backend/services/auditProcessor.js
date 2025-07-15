// Enhanced Backend Audit Processor - Integrates ALL Service Files
// This version DOES reference and use all your service files

const competitorService = require('./competitorService');
const keywordService = require('./keywordService');
const pagespeedService = require('./pagespeedService');
const citationService = require('./citationService');
const reviewService = require('./reviewService');
const schemaService = require('./schemaService');
const websiteService = require('./websiteService');

class EnhancedAuditProcessor {
  async processAudit(businessData, options = {}) {
    try {
      const start = Date.now();
      console.log('🚀 Starting Enhanced Audit Processing with ALL Services...');

      // Configuration
      const config = {
        enableAllServices: options.enableAllServices !== false,
        analysisDepth: options.depth || 'comprehensive',
        enableFallbacks: options.enableFallbacks !== false
      };

      // === RUN ALL YOUR SERVICE FILES IN PARALLEL ===
      const serviceResults = await this.executeAllServices(businessData, config);
      
      // === ENHANCED PROCESSING OF SERVICE RESULTS ===
      const enhancedAnalysis = await this.processServiceResults(serviceResults, businessData);
      
      // === ADVANCED AGGREGATION ===
      const finalResults = await this.aggregateEnhancedResults(enhancedAnalysis, serviceResults, businessData);

      console.log(`✅ Enhanced audit completed in ${Date.now() - start}ms`);
      return finalResults;

    } catch (error) {
      console.error('❌ Enhanced audit processing failed:', error);
      return this.handleProcessingError(error, businessData);
    }
  }

  async executeAllServices(businessData, config) {
    console.log('⚡ Executing ALL service files...');
    
    // Execute all your service files in parallel
    const servicePromises = [
      this.safeServiceCall(websiteService, 'analyzeWebsite', businessData, 'website'),
      this.safeServiceCall(competitorService, 'analyzeCompetitors', businessData, 'competitor'),
      this.safeServiceCall(keywordService, 'analyzeKeywords', businessData, 'keyword'),
      this.safeServiceCall(citationService, 'analyzeCitations', businessData, 'citation'),
      this.safeServiceCall(pagespeedService, 'analyzePageSpeed', businessData, 'pagespeed'),
      this.safeServiceCall(schemaService, 'analyzeSchema', businessData, 'schema'),
      this.safeServiceCall(reviewService, 'analyzeReviews', businessData, 'review')
    ];

    const results = await Promise.allSettled(servicePromises);
    return this.processServicePromiseResults(results);
  }

  async safeServiceCall(service, methodName, businessData, serviceName) {
    const start = Date.now();
    
    try {
      console.log(`🔄 Executing ${serviceName} service...`);
      
      // Check if service and method exist
      if (!service || typeof service[methodName] !== 'function') {
        console.warn(`⚠️ Service ${serviceName}.${methodName} not available`);
        return this.getServiceFallback(serviceName);
      }

      // Execute the actual service
      const result = await service[methodName](businessData);
      const duration = Date.now() - start;
      
      console.log(`✅ ${serviceName} service completed in ${duration}ms`);
      
      return {
        ...result,
        serviceName,
        executionTime: duration,
        success: result.success !== false,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(`❌ ${serviceName} service failed:`, error.message);
      
      return {
        ...this.getServiceFallback(serviceName),
        serviceName,
        success: false,
        error: error.message,
        executionTime: Date.now() - start,
        timestamp: new Date().toISOString()
      };
    }
  }

  processServicePromiseResults(results) {
    const serviceResults = {};
    const serviceNames = ['website', 'competitor', 'keyword', 'citation', 'pagespeed', 'schema', 'review'];
    
    results.forEach((result, index) => {
      const serviceName = serviceNames[index];
      
      if (result.status === 'fulfilled') {
        serviceResults[serviceName] = result.value;
      } else {
        console.error(`Service ${serviceName} promise failed:`, result.reason);
        serviceResults[serviceName] = {
          ...this.getServiceFallback(serviceName),
          promiseError: result.reason.message
        };
      }
    });
    
    return serviceResults;
  }

  async processServiceResults(serviceResults, businessData) {
    console.log('📊 Processing service results with enhanced algorithms...');
    
    // Enhanced visibility scoring using ALL service results
    const visibilityAnalysis = this.calculateEnhancedVisibilityScore(serviceResults, businessData);
    
    // Content strategy analysis from website service
    const contentAnalysis = this.analyzeContentStrategy(serviceResults.website, businessData);
    
    // Technical analysis from pagespeed and schema services
    const technicalAnalysis = this.analyzeTechnicalPerformance(serviceResults.pagespeed, serviceResults.schema);
    
    // Local SEO analysis from citation and website services
    const localSEOAnalysis = this.analyzeLocalSEO(serviceResults.citation, serviceResults.website, businessData);
    
    // Competitive analysis from competitor service
    const competitiveAnalysis = this.analyzeCompetitivePosition(serviceResults.competitor, businessData);
    
    // Review and reputation analysis
    const reputationAnalysis = this.analyzeReputation(serviceResults.review, businessData);
    
    // Keyword performance analysis
    const keywordAnalysis = this.analyzeKeywordPerformance(serviceResults.keyword, businessData);

    return {
      visibilityAnalysis,
      contentAnalysis,
      technicalAnalysis,
      localSEOAnalysis,
      competitiveAnalysis,
      reputationAnalysis,
      keywordAnalysis,
      overallScore: this.calculateOverallScore([
        visibilityAnalysis.score,
        contentAnalysis.score,
        technicalAnalysis.score,
        localSEOAnalysis.score,
        competitiveAnalysis.score,
        reputationAnalysis.score,
        keywordAnalysis.score
      ])
    };
  }

  calculateEnhancedVisibilityScore(serviceResults, businessData) {
    // Use data from ALL services to calculate visibility
    const components = {
      websitePerformance: this.calculateWebsiteScore(serviceResults.website, serviceResults.pagespeed),
      localRanking: this.calculateRankingScore(businessData.currentRank || 0),
      citationQuality: this.calculateCitationScore(serviceResults.citation),
      reviewProfile: this.calculateReviewScore(serviceResults.review),
      contentQuality: this.calculateContentScore(serviceResults.website),
      technicalSEO: this.calculateTechnicalScore(serviceResults.schema, serviceResults.pagespeed),
      competitivePosition: this.calculateCompetitiveScore(serviceResults.competitor),
      keywordOptimization: this.calculateKeywordScore(serviceResults.keyword)
    };

    const weights = {
      websitePerformance: 0.20,
      localRanking: 0.20,
      citationQuality: 0.15,
      reviewProfile: 0.15,
      contentQuality: 0.10,
      technicalSEO: 0.10,
      competitivePosition: 0.05,
      keywordOptimization: 0.05
    };

    const weightedScore = Object.entries(weights).reduce((total, [component, weight]) => {
      return total + (components[component] * weight);
    }, 0);

    return {
      score: Math.round(weightedScore),
      breakdown: components,
      weights,
      performanceLevel: this.getPerformanceLevel(weightedScore)
    };
  }

  // Individual scoring methods using service results
  calculateWebsiteScore(websiteResults, pagespeedResults) {
    if (!websiteResults?.success && !pagespeedResults?.success) return 0;
    
    const performanceScore = pagespeedResults?.overallSummary?.averageScore || 0;
    const contentScore = websiteResults?.contentQuality || 0;
    const localOptimization = websiteResults?.localOptimization || 0;
    
    return Math.round((performanceScore * 0.4) + (contentScore * 0.3) + (localOptimization * 0.3));
  }

  calculateRankingScore(rank) {
    if (!rank || rank === 0) return 0;
    if (rank === 1) return 100;
    if (rank <= 3) return 85;
    if (rank <= 5) return 70;
    if (rank <= 10) return 50;
    return Math.max(0, 30 - rank);
  }

  calculateCitationScore(citationResults) {
    if (!citationResults?.success) return 0;
    
    const napScore = citationResults.napSummary?.consistencyScore || 0;
    const directoryCount = citationResults.directoryCount || 0;
    const socialScore = citationResults.socialSummary?.socialScore || 0;
    
    return Math.round((napScore * 0.5) + (Math.min(100, directoryCount * 2) * 0.3) + (socialScore * 0.2));
  }

  calculateReviewScore(reviewResults) {
    if (!reviewResults?.success) return 0;
    
    const averageRating = reviewResults.averageRating || 0;
    const totalReviews = reviewResults.totalReviews || 0;
    const sentiment = reviewResults.sentiment?.overall || 0;
    
    const ratingScore = (averageRating / 5) * 100;
    const volumeScore = Math.min(100, totalReviews * 4);
    const sentimentScore = sentiment * 100;
    
    return Math.round((ratingScore * 0.4) + (volumeScore * 0.4) + (sentimentScore * 0.2));
  }

  calculateContentScore(websiteResults) {
    if (!websiteResults?.success) return 0;
    
    const contentVolume = Math.min(100, (websiteResults.contentPages || 0) * 10);
    const localOptimization = websiteResults.localOptimization || 0;
    const keywordDensity = websiteResults.keywordOptimization || 0;
    
    return Math.round((contentVolume * 0.4) + (localOptimization * 0.4) + (keywordDensity * 0.2));
  }

  calculateTechnicalScore(schemaResults, pagespeedResults) {
    const schemaScore = schemaResults?.score || 0;
    const coreWebVitals = pagespeedResults?.coreWebVitals?.overall || 0;
    const mobileScore = pagespeedResults?.mobileOptimization || 0;
    
    return Math.round((schemaScore * 0.4) + (coreWebVitals * 0.4) + (mobileScore * 0.2));
  }

  calculateCompetitiveScore(competitorResults) {
    if (!competitorResults?.success) return 50; // Neutral when no data
    
    const marketPosition = competitorResults.marketPosition || 0;
    const competitiveAdvantages = (competitorResults.advantages?.length || 0) * 10;
    const threats = (competitorResults.threats?.length || 0) * 5;
    
    return Math.round(Math.max(0, Math.min(100, marketPosition + competitiveAdvantages - threats)));
  }

  calculateKeywordScore(keywordResults) {
    if (!keywordResults?.success) return 0;
    
    const rankingKeywords = keywordResults.rankings?.length || 0;
    const opportunityKeywords = keywordResults.opportunities?.length || 0;
    const keywordDifficulty = keywordResults.avgDifficulty || 100;
    
    const rankingScore = Math.min(100, rankingKeywords * 10);
    const opportunityScore = Math.min(50, opportunityKeywords * 5);
    const difficultyPenalty = Math.max(0, (keywordDifficulty - 50) / 2);
    
    return Math.round(Math.max(0, rankingScore + opportunityScore - difficultyPenalty));
  }

  // Analysis methods that process service results
  analyzeContentStrategy(websiteResults, businessData) {
    if (!websiteResults?.success) {
      return { score: 0, strategy: 'unavailable', recommendations: ['Website analysis required'] };
    }

    const score = this.calculateContentScore(websiteResults);
    
    return {
      score,
      strategy: score >= 70 ? 'advanced' : score >= 50 ? 'intermediate' : 'needs_development',
      contentVolume: websiteResults.contentPages || 0,
      localOptimization: websiteResults.localOptimization || 0,
      recommendations: this.generateContentRecommendations(score, websiteResults)
    };
  }

  analyzeTechnicalPerformance(pagespeedResults, schemaResults) {
    const score = this.calculateTechnicalScore(schemaResults, pagespeedResults);
    
    return {
      score,
      coreWebVitals: pagespeedResults?.coreWebVitals?.overall || 0,
      schemaImplementation: schemaResults?.score || 0,
      mobileOptimization: pagespeedResults?.mobileOptimization || 0,
      status: score >= 70 ? 'good' : score >= 50 ? 'fair' : 'needs_improvement',
      recommendations: this.generateTechnicalRecommendations(score, pagespeedResults, schemaResults)
    };
  }

  analyzeLocalSEO(citationResults, websiteResults, businessData) {
    const score = (this.calculateCitationScore(citationResults) + this.calculateContentScore(websiteResults)) / 2;
    
    return {
      score,
      napConsistency: citationResults?.napSummary?.consistencyScore || 0,
      directoryPresence: citationResults?.directoryCount || 0,
      localContent: websiteResults?.localOptimization || 0,
      status: score >= 70 ? 'optimized' : score >= 50 ? 'moderate' : 'poor',
      recommendations: this.generateLocalSEORecommendations(score, citationResults, websiteResults)
    };
  }

  analyzeCompetitivePosition(competitorResults, businessData) {
    const score = this.calculateCompetitiveScore(competitorResults);
    
    return {
      score,
      position: score >= 70 ? 'leader' : score >= 50 ? 'competitive' : 'challenger',
      threats: competitorResults?.threats?.length || 0,
      opportunities: competitorResults?.opportunities?.length || 0,
      recommendations: this.generateCompetitiveRecommendations(score, competitorResults)
    };
  }

  analyzeReputation(reviewResults, businessData) {
    const score = this.calculateReviewScore(reviewResults);
    
    return {
      score,
      averageRating: reviewResults?.averageRating || 0,
      totalReviews: reviewResults?.totalReviews || 0,
      sentiment: reviewResults?.sentiment?.overall || 0,
      status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement',
      recommendations: this.generateReputationRecommendations(score, reviewResults)
    };
  }

  analyzeKeywordPerformance(keywordResults, businessData) {
    const score = this.calculateKeywordScore(keywordResults);
    
    return {
      score,
      rankingKeywords: keywordResults?.rankings?.length || 0,
      opportunityKeywords: keywordResults?.opportunities?.length || 0,
      avgDifficulty: keywordResults?.avgDifficulty || 0,
      status: score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'weak',
      recommendations: this.generateKeywordRecommendations(score, keywordResults)
    };
  }

  // Recommendation generators
  generateContentRecommendations(score, websiteResults) {
    const recommendations = [];
    if (score < 50) recommendations.push('Develop comprehensive content strategy');
    if (!websiteResults.localContent) recommendations.push('Create location-specific content');
    if ((websiteResults.contentPages || 0) < 5) recommendations.push('Increase content volume');
    return recommendations;
  }

  generateTechnicalRecommendations(score, pagespeedResults, schemaResults) {
    const recommendations = [];
    if (score < 50) recommendations.push('Implement technical SEO improvements');
    if (!schemaResults?.hasLocalBusiness) recommendations.push('Add LocalBusiness schema');
    if ((pagespeedResults?.coreWebVitals?.overall || 0) < 70) recommendations.push('Optimize Core Web Vitals');
    return recommendations;
  }

  generateLocalSEORecommendations(score, citationResults, websiteResults) {
    const recommendations = [];
    if ((citationResults?.napSummary?.consistencyScore || 0) < 80) recommendations.push('Fix NAP consistency');
    if ((citationResults?.directoryCount || 0) < 20) recommendations.push('Increase directory presence');
    if ((websiteResults?.localOptimization || 0) < 60) recommendations.push('Improve local content optimization');
    return recommendations;
  }

  generateCompetitiveRecommendations(score, competitorResults) {
    const recommendations = [];
    if (score < 50) recommendations.push('Develop competitive differentiation');
    if ((competitorResults?.threats?.length || 0) > 0) recommendations.push('Address competitive threats');
    if ((competitorResults?.opportunities?.length || 0) > 0) recommendations.push('Capitalize on opportunities');
    return recommendations;
  }

  generateReputationRecommendations(score, reviewResults) {
    const recommendations = [];
    if ((reviewResults?.totalReviews || 0) < 10) recommendations.push('Increase review volume');
    if ((reviewResults?.averageRating || 0) < 4.5) recommendations.push('Improve service quality');
    if ((reviewResults?.sentiment?.overall || 0) < 0.8) recommendations.push('Address negative sentiment');
    return recommendations;
  }

  generateKeywordRecommendations(score, keywordResults) {
    const recommendations = [];
    if ((keywordResults?.rankings?.length || 0) < 5) recommendations.push('Improve keyword rankings');
    if ((keywordResults?.opportunities?.length || 0) > 0) recommendations.push('Target opportunity keywords');
    if ((keywordResults?.avgDifficulty || 0) > 70) recommendations.push('Focus on easier keywords');
    return recommendations;
  }

  async aggregateEnhancedResults(enhancedAnalysis, serviceResults, businessData) {
    console.log('📋 Aggregating comprehensive results from all services...');
    
    // Generate enhanced action items based on ALL service results
    const actionItems = this.generateEnhancedActionItems(enhancedAnalysis, serviceResults);
    
    return {
      success: true,
      
      // Overall metrics from enhanced analysis
      overallScore: enhancedAnalysis.overallScore,
      performanceLevel: enhancedAnalysis.visibilityAnalysis.performanceLevel,
      
      // Service-specific results
      websiteAnalysis: this.formatServiceResult(serviceResults.website, enhancedAnalysis.contentAnalysis),
      competitorAnalysis: this.formatServiceResult(serviceResults.competitor, enhancedAnalysis.competitiveAnalysis),
      keywordAnalysis: this.formatServiceResult(serviceResults.keyword, enhancedAnalysis.keywordAnalysis),
      citationAnalysis: this.formatServiceResult(serviceResults.citation, enhancedAnalysis.localSEOAnalysis),
      pagespeedAnalysis: this.formatServiceResult(serviceResults.pagespeed, enhancedAnalysis.technicalAnalysis),
      schemaAnalysis: this.formatServiceResult(serviceResults.schema, enhancedAnalysis.technicalAnalysis),
      reviewAnalysis: this.formatServiceResult(serviceResults.review, enhancedAnalysis.reputationAnalysis),
      
      // Enhanced analytics
      visibilityBreakdown: enhancedAnalysis.visibilityAnalysis.breakdown,
      contentStrategy: enhancedAnalysis.contentAnalysis,
      technicalPerformance: enhancedAnalysis.technicalAnalysis,
      localSEOStrategy: enhancedAnalysis.localSEOAnalysis,
      competitivePosition: enhancedAnalysis.competitiveAnalysis,
      reputationManagement: enhancedAnalysis.reputationAnalysis,
      keywordStrategy: enhancedAnalysis.keywordAnalysis,
      
      // Action items with service attribution
      actionItems,
      
      // Service execution metadata
      serviceExecutionTimes: Object.keys(serviceResults).reduce((acc, key) => {
        acc[key] = serviceResults[key].executionTime || 0;
        return acc;
      }, {}),
      
      servicesCompleted: Object.keys(serviceResults).reduce((acc, key) => {
        acc[key] = serviceResults[key].success !== false;
        return acc;
      }, {}),
      
      generatedAt: new Date().toISOString()
    };
  }

  formatServiceResult(serviceResult, enhancedAnalysis) {
    return {
      ...serviceResult,
      enhancedScore: enhancedAnalysis?.score || 0,
      enhancedStatus: enhancedAnalysis?.status || 'unknown',
      enhancedRecommendations: enhancedAnalysis?.recommendations || []
    };
  }

  generateEnhancedActionItems(enhancedAnalysis, serviceResults) {
    const critical = [];
    const moderate = [];
    const minor = [];

    // Analyze each service for action items
    Object.entries(serviceResults).forEach(([serviceName, result]) => {
      if (result.criticalIssues) {
        result.criticalIssues.forEach(issue => {
          critical.push({
            task: issue,
            source: serviceName,
            impact: 'High',
            category: serviceName
          });
        });
      }
      
      if (result.recommendations) {
        result.recommendations.forEach(rec => {
          moderate.push({
            task: rec,
            source: serviceName,
            impact: 'Medium',
            category: serviceName
          });
        });
      }
    });

    // Add analysis-based recommendations
    Object.entries(enhancedAnalysis).forEach(([analysisType, analysis]) => {
      if (analysis.recommendations) {
        analysis.recommendations.forEach(rec => {
          if (analysis.score < 40) {
            critical.push({ task: rec, source: analysisType, impact: 'High' });
          } else if (analysis.score < 70) {
            moderate.push({ task: rec, source: analysisType, impact: 'Medium' });
          } else {
            minor.push({ task: rec, source: analysisType, impact: 'Low' });
          }
        });
      }
    });

    return {
      critical: [...new Set(critical.map(item => item.task))].map(task => ({ task, impact: 'High' })),
      moderate: [...new Set(moderate.map(item => item.task))].map(task => ({ task, impact: 'Medium' })),
      minor: [...new Set(minor.map(item => item.task))].map(task => ({ task, impact: 'Low' })),
      all: [...new Set([...critical, ...moderate, ...minor].map(item => item.task))]
    };
  }

  calculateOverallScore(scores) {
    const validScores = scores.filter(score => typeof score === 'number' && !isNaN(score));
    return validScores.length ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length) : 0;
  }

  getPerformanceLevel(score) {
    if (score >= 90) return "Exceptional";
    if (score >= 80) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Needs Improvement";
    return "Critical";
  }

  getServiceFallback(serviceName) {
    const fallbacks = {
      website: { success: false, contentQuality: 0, localOptimization: 0 },
      competitor: { success: false, marketPosition: 0, threats: [], opportunities: [] },
      keyword: { success: false, rankings: [], opportunities: [], avgDifficulty: 100 },
      citation: { success: false, napSummary: { consistencyScore: 0 }, directoryCount: 0 },
      pagespeed: { success: false, overallSummary: { averageScore: 0 }, coreWebVitals: { overall: 0 } },
      schema: { success: false, score: 0, hasLocalBusiness: false },
      review: { success: false, averageRating: 0, totalReviews: 0, sentiment: { overall: 0 } }
    };

    return fallbacks[serviceName] || { success: false, message: `${serviceName} unavailable` };
  }

  handleProcessingError(error, businessData) {
    return {
      success: false,
      error: error.message,
      errorType: error.name || 'ProcessingError',
      timestamp: new Date().toISOString(),
      businessData: {
        businessName: businessData?.businessName || 'Unknown',
        location: businessData?.location || 'Unknown'
      },
      servicesFailed: true,
      recommendations: [
        'Check service file implementations',
        'Verify service method exports',
        'Review error logs for specific service failures'
      ]
    };
  }
}

module.exports = EnhancedAuditProcessor;
