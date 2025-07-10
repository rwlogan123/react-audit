// backend/services/marketing/blogGenerator.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class BlogGenerator {
  constructor(interviewData) {
    this.data = interviewData;
  }

  // Generate blog topics based on interview data
  async generateTopics() {
    try {
      const prompt = `You are a content strategist for local service businesses. Based on the following business information, generate 10 highly relevant, SEO-friendly blog post topics.

Business Information:
- Business Name: ${this.data.businessName}
- Type: ${this.data.businessType}
- Location: ${this.data.location}
- Services: ${this.data.primaryServices}
- Marketing Goal: ${this.data.marketingGoal}

Key Customer Insights:
- Ideal Customer: ${this.data.idealCustomer}
- Top Problems: ${this.data.topProblems}
- Common Questions: ${this.data.commonQuestions}
- Service Areas: ${this.data.serviceAreas}

Instructions:
1. Create blog titles that directly address customer problems and questions
2. Include local SEO elements (city/area names) in 2-3 titles
3. Mix educational, problem-solving, and buying-guide content
4. Make titles specific and actionable
5. Include cost/pricing content (highly searched)
6. Address urgency factors mentioned: ${this.data.urgentProblems || 'N/A'}

Return ONLY a JSON array with exactly 10 blog post objects:
[{"title": "...", "category": "educational|problem-solving|buying-guide|local", "target_keyword": "...", "search_intent": "informational|commercial|transactional"}]`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an expert content strategist for local businesses. Always return valid JSON arrays." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const content = response.choices[0].message.content;
      return JSON.parse(content);
      
    } catch (error) {
      console.error('Error generating blog topics:', error);
      throw new Error(`Failed to generate blog topics: ${error.message}`);
    }
  }

  // Generate a single blog post
  async generatePost(topic) {
    try {
      console.log('🚀 Starting blog post generation for:', topic.title);
      console.log('📝 Using OpenAI model:', process.env.OPENAI_MODEL || "gpt-3.5-turbo");
      
      const prompt = `Write a comprehensive, engaging blog post for a local service business.

Blog Topic: ${topic.title}
Target Keyword: ${topic.target_keyword}
Business: ${this.data.businessName} in ${this.data.location}

Business Context:
- Services: ${this.data.primaryServices}
- Unique Value: ${this.data.uniqueSolution}
- Brand Voice: ${this.data.brandPersonality || 'Professional and friendly'}

Content Requirements:
1. Length: 800-1200 words
2. Structure: 
   - Engaging introduction that addresses the reader's problem
   - 3-5 main sections with descriptive H2 headers
   - Use examples from: ${this.data.projectStory || 'real customer experiences'}
   - Address misconceptions: ${this.data.misconceptions || 'common misunderstandings'}
   - Include local references to ${this.data.serviceAreas || this.data.location}

3. Call to Action:
   - Reference: ${this.data.nextStep || 'Contact us for a free consultation'}
   - Mention offers: ${this.data.specialOffers || 'our current promotions'}
   - Create urgency using: ${this.data.urgentProblems || 'the benefits of acting now'}

Return a JSON object:
{
  "title": "Final blog title",
  "metaDescription": "155 character meta description",
  "content": "Full blog post content with markdown formatting (use ## for headers)",
  "wordCount": actual word count,
  "targetKeyword": "${topic.target_keyword}",
  "suggestedImages": ["image 1 description", "image 2 description"]
}`;

      console.log('📤 Sending request to OpenAI API...');
      const startTime = Date.now();
      
      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are an expert blog writer for local service businesses. Write engaging, informative content that converts readers into customers. Always return valid JSON." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2500
      });

      const responseTime = Date.now() - startTime;
      console.log(`✅ OpenAI response received in ${responseTime}ms`);
      console.log('📊 Tokens used:', response.usage?.total_tokens || 'unknown');

      const blogPost = JSON.parse(response.choices[0].message.content);
      
      // Calculate actual word count if not provided
      if (!blogPost.wordCount) {
        blogPost.wordCount = blogPost.content.split(/\s+/).length;
      }
      
      console.log(`✅ Blog post generated successfully: "${blogPost.title}" (${blogPost.wordCount} words)`);
      return blogPost;
      
    } catch (error) {
      console.error('❌ Error generating blog post:', error.message);
      console.error('🔍 Full error:', error);
      throw new Error(`Failed to generate blog post: ${error.message}`);
    }
  }

  // Generate all blog posts with rate limiting
  async generateAllPosts(topics = null) {
    try {
      // If no topics provided, generate them first
      if (!topics) {
        console.log('Generating blog topics...');
        topics = await this.generateTopics();
      }

      console.log(`Generating ${topics.length} blog posts...`);
      const blogPosts = [];
      
      for (let i = 0; i < topics.length; i++) {
        console.log(`Generating blog ${i + 1}/${topics.length}: ${topics[i].title}`);
        
        try {
          const post = await this.generatePost(topics[i]);
          blogPosts.push({
            ...post,
            topic: topics[i]
          });
        } catch (error) {
          console.error(`Failed to generate blog post ${i + 1}:`, error);
          // Continue with other posts even if one fails
        }
        
        // Rate limit delay (2 seconds between posts)
        if (i < topics.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      return {
        topics,
        posts: blogPosts,
        summary: {
          totalRequested: topics.length,
          totalGenerated: blogPosts.length,
          failed: topics.length - blogPosts.length
        }
      };
      
    } catch (error) {
      console.error('Error generating all blog posts:', error);
      throw error;
    }
  }
}

// Export a static method for easy use
const generateBlogContent = async (interviewData) => {
  const generator = new BlogGenerator(interviewData);
  return await generator.generateAllPosts();
};

module.exports = BlogGenerator;
module.exports.generateBlogContent = generateBlogContent;