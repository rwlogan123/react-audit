// backend/services/marketing/socialAdaptor.js
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class SocialAdaptor {
  constructor(interviewData) {
    this.data = interviewData;
  }

  async generatePosts(count = 30) {
    try {
      console.log(`📱 Starting social media generation for ${count} posts...`);
      
      const prompt = `Create ${count} engaging social media posts for a local service business.

Business Info:
- Name: ${this.data.businessName}
- Services: ${this.data.primaryServices}
- Location: ${this.data.location}
- Personality: ${this.data.brandPersonality || 'Professional and friendly'}

Content Sources:
- Customer Problems: ${this.data.topProblems}
- Success Story: ${this.data.projectStory || 'Share success stories and testimonials'}
- Special Offers: ${this.data.specialOffers || 'Highlight your services'}
- Expertise: ${this.data.expertise || this.data.primaryServices}

Create exactly ${count} posts with this mix:
- ${Math.floor(count * 0.33)} Educational tips (share expertise, solve problems)
- ${Math.floor(count * 0.17)} Problem/solution posts (address pain points)
- ${Math.floor(count * 0.17)} Social proof posts (testimonials, success stories)
- ${Math.floor(count * 0.10)} Behind-the-scenes posts (team, process, values)
- ${Math.floor(count * 0.13)} Promotional posts (services, offers, CTAs)
- ${Math.floor(count * 0.10)} Community/local posts (local involvement, area-specific)

Requirements for each post:
- Length: 100-150 words
- Include relevant emojis
- End with engagement question or clear CTA
- Be platform-agnostic (works on Facebook, Instagram, LinkedIn)

Return ONLY a JSON array of ${count} posts:
[{
  "postNumber": 1, 
  "category": "educational|problem-solving|social-proof|behind-scenes|promotional|community", 
  "content": "post content with emojis", 
  "hashtags": ["#relevant", "#hashtags", "#local${this.data.location.replace(/[^a-zA-Z]/g, '')}"],
  "cta": "Call to action or engagement question"
}]`;

      console.log('📤 Sending social media request to OpenAI...');
      const startTime = Date.now();

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a social media expert for local businesses. Create engaging, authentic posts that drive engagement and conversions. Use emojis appropriately. Always return valid JSON." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4000
      });

      const responseTime = Date.now() - startTime;
      console.log(`✅ OpenAI social response received in ${responseTime}ms`);
      
      // Handle response that might include markdown code blocks
      let content = response.choices[0].message.content;
      console.log('📝 Raw response preview:', content.substring(0, 100) + '...');
      
      // Remove markdown code blocks if present
      if (content.includes('```json')) {
        console.log('🔧 Removing markdown code blocks...');
        content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      console.log('🔍 Attempting to parse JSON...');
      const posts = JSON.parse(content.trim());
      
      console.log(`✅ Successfully parsed ${posts.length} social media posts`);
      
      // Validate and ensure we have the right number of posts
      if (posts.length !== count) {
        console.warn(`Expected ${count} posts but got ${posts.length}`);
      }
      
      return {
        posts,
        summary: {
          total: posts.length,
          byCategory: this.categorizePost(posts)
        }
      };
      
    } catch (error) {
      console.error('❌ Error generating social posts:', error.message);
      console.error('🔍 Full error:', error);
      throw new Error(`Failed to generate social posts: ${error.message}`);
    }
  }

  // Helper method to categorize posts
  categorizePost(posts) {
    const categories = {};
    posts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });
    return categories;
  }

  // Generate platform-specific variations
  async adaptForPlatforms(posts) {
    const adapted = {
      facebook: [],
      instagram: [],
      linkedin: []
    };

    posts.forEach(post => {
      // Facebook - can be longer, more conversational
      adapted.facebook.push({
        ...post,
        content: post.content,
        hashtags: post.hashtags.slice(0, 5) // Fewer hashtags on Facebook
      });

      // Instagram - more visual focus, more hashtags
      adapted.instagram.push({
        ...post,
        content: post.content + '\n.\n.\n.\n' + post.hashtags.join(' '),
        imagePrompt: this.generateImagePrompt(post)
      });

      // LinkedIn - more professional tone
      if (['educational', 'problem-solving', 'promotional'].includes(post.category)) {
        adapted.linkedin.push({
          ...post,
          content: this.professionalizeContent(post.content),
          hashtags: post.hashtags.slice(0, 3)
        });
      }
    });

    return adapted;
  }

  // Generate image prompt for visual content
  generateImagePrompt(post) {
    const prompts = {
      'educational': 'Professional infographic or diagram related to the tip',
      'problem-solving': 'Before/after image or problem visualization',
      'social-proof': 'Happy customer or completed project photo',
      'behind-scenes': 'Team at work or process photo',
      'promotional': 'Service in action or promotional graphic',
      'community': 'Local landmark or community event photo'
    };
    
    return prompts[post.category] || 'Relevant business photo';
  }

  // Make content more professional for LinkedIn
  professionalizeContent(content) {
    // Remove excessive emojis for LinkedIn
    return content.replace(/([😊🎉🏠💪✨🔧🛠️⭐]{2,})/g, '');
  }
}

// Export static method for easy use
const generateSocialContent = async (interviewData, count = 30) => {
  const adaptor = new SocialAdaptor(interviewData);
  const { posts, summary } = await adaptor.generatePosts(count);
  const adapted = await adaptor.adaptForPlatforms(posts);
  
  return {
    posts,
    adapted,
    summary
  };
};

module.exports = SocialAdaptor;
module.exports.generateSocialContent = generateSocialContent;