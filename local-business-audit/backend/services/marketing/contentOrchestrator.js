// backend/services/marketing/contentOrchestrator.js
const BlogGenerator = require('./blogGenerator');
const SocialAdaptor = require('./socialAdaptor');
const Content = require('../../models/Content');

class ContentOrchestrator {
  constructor(interviewData, options = {}) {
    this.interviewData = this.parseInterviewData(interviewData);
    this.options = options;
    this.results = {
      blogPosts: [],
      socialPosts: [],
      emails: [],
      errors: [],
      metadata: {
        startTime: Date.now(),
        businessName: interviewData.businessName,
        businessId: options.businessId
      }
    };
    
    // Progress callbacks
    this.onProgress = options.onProgress || (() => {});
    this.onStepComplete = options.onStepComplete || (() => {});
    this.onError = options.onError || (() => {});
  }

  // Parse interview data and extract arrays
  parseInterviewData(data) {
    return {
      ...data,
      topProblemsArray: data.topProblems?.split(/[;\n]/).filter(p => p.trim()) || [],
      commonQuestionsArray: data.commonQuestions?.split(/[;\n]/).filter(q => q.trim()) || [],
      serviceAreasArray: data.serviceAreas?.split(',').map(area => area.trim()) || []
    };
  }

  // Generate all content types
  async generateAll() {
    try {
      this.onProgress('Starting content generation', 0);
      
      // Generate blog content
      await this.generateBlogContent();
      
      // Generate social media content
      await this.generateSocialContent();
      
      // Generate email sequence (if you have an email generator)
      // await this.generateEmailContent();
      
      // Calculate generation time
      this.results.metadata.generationTime = 
        (Date.now() - this.results.metadata.startTime) / 1000;
      
      this.onProgress('Content generation complete', 100);
      return this.results;
      
    } catch (error) {
      this.onError('Content generation failed', error);
      this.results.errors.push({
        stage: 'overall',
        error: error.message
      });
      throw error;
    }
  }

  // Generate blog content
  async generateBlogContent() {
    try {
      this.onProgress('Generating blog content', 20);
      
      const blogGenerator = new BlogGenerator(this.interviewData);
      const blogResults = await blogGenerator.generateAllPosts();
      
      this.results.blogPosts = blogResults.posts;
      this.results.blogTopics = blogResults.topics;
      
      this.onStepComplete('Blog generation', {
        count: blogResults.posts.length,
        topics: blogResults.topics.length
      });
      
      this.onProgress('Blog content complete', 60);
      
    } catch (error) {
      this.onError('Blog generation failed', error);
      this.results.errors.push({
        stage: 'blog',
        error: error.message
      });
    }
  }

  // Generate social media content
  async generateSocialContent() {
    try {
      this.onProgress('Generating social media content', 60);
      
      const socialAdaptor = new SocialAdaptor(this.interviewData);
      const socialResults = await socialAdaptor.generatePosts(30);
      
      this.results.socialPosts = socialResults.posts;
      this.results.socialSummary = socialResults.summary;
      
      // Generate platform-specific adaptations
      this.results.socialAdapted = await socialAdaptor.adaptForPlatforms(
        socialResults.posts
      );
      
      this.onStepComplete('Social media generation', {
        count: socialResults.posts.length,
        platforms: Object.keys(this.results.socialAdapted)
      });
      
      this.onProgress('Social content complete', 90);
      
    } catch (error) {
      this.onError('Social generation failed', error);
      this.results.errors.push({
        stage: 'social',
        error: error.message
      });
    }
  }

  // Save all content to database
  async saveToDatabase() {
    try {
      this.onProgress('Saving to database', 95);
      
      const content = new Content({
        businessId: this.options.businessId,
        businessName: this.interviewData.businessName,
        interviewData: this.interviewData,
        content: {
          blogPosts: this.results.blogPosts,
          socialPosts: this.results.socialPosts,
          emails: this.results.emails
        },
        metadata: this.results.metadata,
        status: this.results.errors.length > 0 ? 'partial' : 'completed'
      });
      
      const saved = await content.save();
      
      this.onStepComplete('Database save', { 
        contentId: saved._id 
      });
      
      return saved;
      
    } catch (error) {
      this.onError('Database save failed', error);
      throw error;
    }
  }

  // Get formatted summary
  getSummary() {
    return {
      businessName: this.interviewData.businessName,
      generationTime: `${this.results.metadata.generationTime?.toFixed(2) || 0} seconds`,
      content: {
        blogPosts: this.results.blogPosts.length,
        blogTopics: this.results.blogTopics?.length || 0,
        socialPosts: this.results.socialPosts.length,
        emails: this.results.emails.length
      },
      errors: this.results.errors.length,
      status: this.results.errors.length > 0 ? 'completed with errors' : 'success'
    };
  }
}

// Export static method for easy use
const generateAllContent = async (interviewData, options = {}) => {
  const orchestrator = new ContentOrchestrator(interviewData, options);
  const results = await orchestrator.generateAll();
  
  if (options.save !== false) {
    await orchestrator.saveToDatabase();
  }
  
  return {
    results,
    summary: orchestrator.getSummary()
  };
};

module.exports = ContentOrchestrator;
module.exports.generateAllContent = generateAllContent;