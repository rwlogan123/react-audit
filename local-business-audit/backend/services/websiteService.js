// backend/services/websiteService.js
// Migrated from ActivePieces Step 2: Website Content Analysis

/**
 * Website Content Analysis Service
 * Analyzes website content for local SEO optimization, social media presence,
 * keyword extraction, and technical SEO factors.
 */

const analyzeWebsite = async (businessData) => {
  const {
    website = businessData.website || "",
    city = (businessData.city || "").trim(),
    state = (businessData.state || "").trim(),
    businessName = (businessData.businessName || "").trim(),
    businessType = (
      businessData.tradeType ||
      businessData.businessType ||
      ""
    ).trim(),
  } = businessData;

  if (!website || !website.startsWith("http")) {
    return {
      success: false,
      error: "Invalid website URL",
      localContentScore: 0,
      localOptimizationStatus: "Unknown",
    };
  }

  const results = {
    success: true,
    url: website,
    localContentScore: 0,
    localOptimizationStatus: "Unknown",
    hasCityInTitle: false,
    hasCityInMetaDescription: false,
    hasCityInHeadings: false,
    hasServicePagesForLocation: false,
    hasContactPage: false,
    hasAddress: false,
    hasPhone: false,
    hasLocalSchema: false,
    hasMultipleLocationPages: false,
    hasReviewsPage: false,
    hasServiceAreaPage: false,
    blogLinks: [],
    extractedKeywords: [],
    serviceKeywords: [],
    locationKeywords: [],
    keywordCombos: [],
    businessRelevantKeywords: [],
    topIntentKeywords: [],
    keywordSources: {},
    socialMediaLinks: {},
    socialMediaScore: 0,
    socialMediaFound: 0,
    errors: [],
    warnings: [],
    improvementOpportunities: [],
  };

  try {
    console.log(`🌐 Analyzing website: ${website}`);

    const response = await fetch(website, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok)
      throw new Error(`Failed to fetch website: ${response.status}`);
    const html = await response.text();

    console.log(`📄 HTML fetched: ${html.length} characters`);

    // Add delay to allow any immediate JavaScript execution
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Extract basic HTML elements
    const title = extractTagContent(html, "title") || "";
    const metaDescription = extractMetaDescription(html) || "";
    const h1s = extractAllTags(html, "h1");
    const h2s = extractAllTags(html, "h2");
    const h3s = extractAllTags(html, "h3");
    const paragraphs = extractAllTags(html, "p");
    const links = extractLinks(html);

    console.log(
      `📊 Content extracted - Title: "${title}", Meta: "${metaDescription}", H1s: ${h1s.length}, Links: ${links.length}`,
    );

    // BULLETPROOF SOCIAL MEDIA EXTRACTION
    const socialMediaLinks = await extractSocialMediaBulletproof(website, html);
    const socialMediaScore = calculateSocialMediaScore(socialMediaLinks);
    const socialMediaFound = Object.values(socialMediaLinks).filter(
      (link) => link !== null,
    ).length;

    // Add social media data to results
    results.socialMediaLinks = socialMediaLinks;
    results.socialMediaScore = socialMediaScore;
    results.socialMediaFound = socialMediaFound;

    console.log(
      `📱 Social media analysis complete: ${socialMediaFound}/6 platforms found (${socialMediaScore}% score)`,
    );

    const cityLC = city.toLowerCase();
    const stateLC = state.toLowerCase();
    const businessLC = businessType.toLowerCase();

    // Enhanced Keyword Extraction
    const keywordAnalysis = extractKeywords(
      html,
      title,
      metaDescription,
      h1s,
      h2s,
      h3s,
      paragraphs,
      businessType,
      city,
      state,
    );
    results.extractedKeywords = keywordAnalysis.allKeywords;
    results.serviceKeywords = keywordAnalysis.serviceKeywords;
    results.locationKeywords = keywordAnalysis.locationKeywords;
    results.businessRelevantKeywords = keywordAnalysis.businessRelevantKeywords;
    results.keywordCombos = keywordAnalysis.keywordCombos;
    results.topIntentKeywords = keywordAnalysis.topIntentKeywords;

    // Store keyword sources for reporting transparency
    results.keywordSources = {
      title,
      metaDescription,
      h1s,
      h2s,
      h3s,
      topParagraphs: paragraphs.slice(0, 5),
    };

    console.log(
      `🔍 Keywords extracted: ${results.extractedKeywords.length} total, ${results.serviceKeywords.length} service, ${results.topIntentKeywords.length} high-intent`,
    );

    // LOCAL SEO ANALYSIS
    results.hasCityInTitle = title.toLowerCase().includes(cityLC);
    if (!results.hasCityInTitle)
      results.improvementOpportunities.push(`Add "${city}" to your page title`);

    results.hasCityInMetaDescription = metaDescription
      .toLowerCase()
      .includes(cityLC);
    if (!results.hasCityInMetaDescription)
      results.improvementOpportunities.push(
        `Include "${city}" in your meta description`,
      );

    const allHeadings = [...h1s, ...h2s, ...h3s];
    results.hasCityInHeadings = allHeadings.some((h) =>
      h.toLowerCase().includes(cityLC),
    );
    if (!results.hasCityInHeadings)
      results.improvementOpportunities.push(
        `Add "${city}" to at least one main heading (H1, H2, or H3)`,
      );

    // SERVICE PAGE ANALYSIS
    const serviceLinks = links.filter((link) => {
      const l = link.toLowerCase();
      return (
        (l.includes("service") || l.includes(businessLC)) &&
        (l.includes(cityLC) || l.includes(stateLC))
      );
    });
    results.hasServicePagesForLocation = serviceLinks.length > 0;
    if (!results.hasServicePagesForLocation)
      results.improvementOpportunities.push(
        `Create dedicated service pages for ${city}`,
      );

    // TECHNICAL SEO CHECKS
    results.hasContactPage = links.some((link) =>
      link.toLowerCase().includes("contact"),
    );
    if (!results.hasContactPage)
      results.improvementOpportunities.push("Add a dedicated contact page");

    const addressPattern = new RegExp(
      `(street|st|ave|avenue|blvd|boulevard|rd|road|ln|lane|dr|drive|way)`,
      "i",
    );
    results.hasAddress = paragraphs.some(
      (p) => p.includes(city) && addressPattern.test(p),
    );
    if (!results.hasAddress)
      results.improvementOpportunities.push(
        `Add your full address including ${city} to your website`,
      );

    const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    results.hasPhone = html.match(phonePattern) !== null;
    if (!results.hasPhone)
      results.improvementOpportunities.push(
        "Add your phone number to your website",
      );

    results.hasLocalSchema =
      html.includes('"@type":"LocalBusiness"') ||
      html.includes('"@type": "LocalBusiness"');
    if (!results.hasLocalSchema)
      results.improvementOpportunities.push(
        "Add LocalBusiness schema markup to your website",
      );

    const locationLinks = links.filter(
      (link) =>
        link.toLowerCase().includes("location") ||
        link.toLowerCase().includes("service-area") ||
        link.toLowerCase().includes("areas-we-serve"),
    );
    results.hasMultipleLocationPages = locationLinks.length > 0;
    if (!results.hasMultipleLocationPages)
      results.improvementOpportunities.push(
        "Create a service area or locations page",
      );

    results.hasReviewsPage = links.some(
      (link) =>
        link.toLowerCase().includes("review") ||
        link.toLowerCase().includes("testimonial"),
    );
    if (!results.hasReviewsPage)
      results.improvementOpportunities.push(
        "Add a testimonials or reviews page",
      );

    const blogLinks = links.filter(
      (link) =>
        link.toLowerCase().includes("blog") ||
        link.toLowerCase().includes("articles") ||
        link.toLowerCase().includes("news"),
    );
    results.blogLinks = blogLinks;

    // SOCIAL MEDIA RECOMMENDATIONS
    if (socialMediaScore < 50) {
      results.improvementOpportunities.push(
        "Add links to your social media profiles",
      );
    }
    if (!socialMediaLinks.facebook) {
      results.improvementOpportunities.push(
        "Consider adding a Facebook business page link",
      );
    }
    if (!socialMediaLinks.instagram) {
      results.improvementOpportunities.push(
        "Consider adding an Instagram business profile link",
      );
    }

    // CALCULATE FINAL SCORE
    const score = [
      results.hasCityInTitle ? 15 : 0,
      results.hasCityInMetaDescription ? 10 : 0,
      results.hasCityInHeadings ? 15 : 0,
      results.hasServicePagesForLocation ? 15 : 0,
      results.hasContactPage ? 5 : 0,
      results.hasAddress ? 10 : 0,
      results.hasPhone ? 10 : 0,
      results.hasLocalSchema ? 10 : 0,
      results.hasMultipleLocationPages ? 5 : 0,
      results.hasReviewsPage ? 5 : 0,
    ];
    results.localContentScore = score.reduce((sum, val) => sum + val, 0);

    if (results.localContentScore >= 80) {
      results.localOptimizationStatus = "Excellent";
    } else if (results.localContentScore >= 60) {
      results.localOptimizationStatus = "Good";
    } else if (results.localContentScore >= 40) {
      results.localOptimizationStatus = "Fair";
    } else {
      results.localOptimizationStatus = "Poor";
    }

    console.log(
      `✅ Website analysis complete: ${results.localContentScore}/100 (${results.localOptimizationStatus})`,
    );
    return results;
  } catch (error) {
    console.error(`❌ Website analysis failed: ${error.message}`);
    return {
      success: false,
      error: error.message,
      localContentScore: 0,
      localOptimizationStatus: "Error",
      improvementOpportunities: ["Fix website access issues"],
    };
  }
};

// SOCIAL MEDIA EXTRACTION FUNCTIONS
async function extractSocialMediaBulletproof(website, html) {
  const socialMediaLinks = {
    facebook: null,
    instagram: null,
    linkedin: null,
    twitter: null,
    youtube: null,
    tiktok: null,
  };

  console.log("🔍 Starting bulletproof social media extraction...");

  // METHOD 1: Traditional HTML scanning (for static sites)
  console.log("📄 Method 1: Scanning HTML content...");
  const staticResults = extractSocialMediaFromHTML(html);
  Object.keys(staticResults).forEach((platform) => {
    if (staticResults[platform] && !socialMediaLinks[platform]) {
      socialMediaLinks[platform] = staticResults[platform];
      console.log(`✅ Found ${platform} in HTML: ${staticResults[platform]}`);
    }
  });

  // METHOD 2: Extract and scan JavaScript files (for SPAs like React/Vue)
  console.log("📜 Method 2: Scanning JavaScript files...");
  const scriptTags =
    html.match(/<script[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];

  for (const scriptTag of scriptTags.slice(0, 5)) {
    // Limit to first 5 scripts for performance
    const srcMatch = scriptTag.match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      let scriptUrl = srcMatch[1];

      // Handle relative URLs
      if (scriptUrl.startsWith("/")) {
        const baseUrl = new URL(website).origin;
        scriptUrl = baseUrl + scriptUrl;
      } else if (!scriptUrl.startsWith("http")) {
        const baseUrl = new URL(website).origin;
        scriptUrl = baseUrl + "/" + scriptUrl;
      }

      try {
        console.log(`🔗 Fetching JavaScript: ${scriptUrl}`);
        const scriptResponse = await fetch(scriptUrl, { timeout: 5000 });
        if (scriptResponse.ok) {
          const scriptContent = await scriptResponse.text();
          const jsResults = extractSocialMediaFromText(scriptContent);

          Object.keys(jsResults).forEach((platform) => {
            if (jsResults[platform] && !socialMediaLinks[platform]) {
              socialMediaLinks[platform] = jsResults[platform];
              console.log(`✅ Found ${platform} in JS: ${jsResults[platform]}`);
            }
          });
        }
      } catch (error) {
        console.log(`❌ Failed to fetch ${scriptUrl}: ${error.message}`);
      }
    }
  }

  // METHOD 3: Scan inline JavaScript
  const inlineScripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
  for (const script of inlineScripts) {
    const jsResults = extractSocialMediaFromText(script);
    Object.keys(jsResults).forEach((platform) => {
      if (jsResults[platform] && !socialMediaLinks[platform]) {
        socialMediaLinks[platform] = jsResults[platform];
      }
    });
  }

  // Clean up and validate URLs
  Object.keys(socialMediaLinks).forEach((platform) => {
    if (socialMediaLinks[platform]) {
      let url = socialMediaLinks[platform];

      // Ensure proper protocol
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }

      // Remove trailing garbage
      url = url.replace(/['">\\s,;.!?]+$/, "");

      // Validate that it's actually a social media URL
      if (
        url.includes(platform === "twitter" ? "twitter.com" : `${platform}.com`)
      ) {
        socialMediaLinks[platform] = url;
      } else {
        socialMediaLinks[platform] = null;
      }
    }
  });

  console.log("🏁 Final social media results:", socialMediaLinks);
  return socialMediaLinks;
}

function extractSocialMediaFromHTML(html) {
  const socialMediaLinks = {
    facebook: null,
    instagram: null,
    linkedin: null,
    twitter: null,
    youtube: null,
    tiktok: null,
  };

  // Enhanced patterns - look for ANY mention
  const patterns = {
    facebook: [
      /https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9\.\-_]+\/?/gi,
      /facebook\.com\/[A-Za-z0-9\.\-_]+\/?/gi,
      /href=["']https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9\.\-_]+\/?["']/gi,
      /["']https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9\.\-_]+\/?["']/gi,
    ],
    instagram: [
      /https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9\.\-_]+\/?/gi,
      /instagram\.com\/[A-Za-z0-9\.\-_]+\/?/gi,
      /href=["']https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9\.\-_]+\/?["']/gi,
      /["']https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9\.\-_]+\/?["']/gi,
    ],
    linkedin: [
      /https?:\/\/(?:www\.)?linkedin\.com\/(?:company\/|in\/)[A-Za-z0-9\.\-_]+\/?/gi,
      /linkedin\.com\/(?:company\/|in\/)[A-Za-z0-9\.\-_]+\/?/gi,
    ],
    twitter: [
      /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9\.\-_]+\/?/gi,
      /(?:twitter|x)\.com\/[A-Za-z0-9\.\-_]+\/?/gi,
    ],
    youtube: [
      /https?:\/\/(?:www\.)?youtube\.com\/(?:channel\/|c\/|user\/|@)[A-Za-z0-9\.\-_]+\/?/gi,
      /youtube\.com\/(?:channel\/|c\/|user\/|@)[A-Za-z0-9\.\-_]+\/?/gi,
    ],
    tiktok: [
      /https?:\/\/(?:www\.)?tiktok\.com\/@[A-Za-z0-9\.\-_]+\/?/gi,
      /tiktok\.com\/@[A-Za-z0-9\.\-_]+\/?/gi,
    ],
  };

  Object.keys(patterns).forEach((platform) => {
    patterns[platform].forEach((pattern) => {
      if (!socialMediaLinks[platform]) {
        const matches = html.match(pattern);
        if (matches && matches.length > 0) {
          socialMediaLinks[platform] = matches[0];
        }
      }
    });
  });

  return socialMediaLinks;
}

function extractSocialMediaFromText(text) {
  const socialMediaLinks = {
    facebook: null,
    instagram: null,
    linkedin: null,
    twitter: null,
    youtube: null,
    tiktok: null,
  };

  const patterns = {
    facebook: [
      /https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9\.\-_]+/gi,
      /facebook\.com\/[A-Za-z0-9\.\-_]+/gi,
      /"https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9\.\-_]+"/gi,
      /'https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9\.\-_]+'/gi,
    ],
    instagram: [
      /https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9\.\-_]+/gi,
      /instagram\.com\/[A-Za-z0-9\.\-_]+/gi,
      /"https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9\.\-_]+"/gi,
      /'https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9\.\-_]+'/gi,
    ],
    linkedin: [
      /https?:\/\/(?:www\.)?linkedin\.com\/(?:company\/|in\/)[A-Za-z0-9\.\-_]+/gi,
      /linkedin\.com\/(?:company\/|in\/)[A-Za-z0-9\.\-_]+/gi,
    ],
    twitter: [
      /https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9\.\-_]+/gi,
      /(?:twitter|x)\.com\/[A-Za-z0-9\.\-_]+/gi,
    ],
    youtube: [
      /https?:\/\/(?:www\.)?youtube\.com\/(?:channel\/|c\/|user\/|@)[A-Za-z0-9\.\-_]+/gi,
      /youtube\.com\/(?:channel\/|c\/|user\/|@)[A-Za-z0-9\.\-_]+/gi,
    ],
    tiktok: [
      /https?:\/\/(?:www\.)?tiktok\.com\/@[A-Za-z0-9\.\-_]+/gi,
      /tiktok\.com\/@[A-Za-z0-9\.\-_]+/gi,
    ],
  };

  Object.keys(patterns).forEach((platform) => {
    patterns[platform].forEach((pattern) => {
      if (!socialMediaLinks[platform]) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          let url = matches[0];
          // Clean up quotes and other characters
          url = url.replace(/['"]/g, "");
          socialMediaLinks[platform] = url;
        }
      }
    });
  });

  return socialMediaLinks;
}

function calculateSocialMediaScore(socialMediaLinks) {
  const platforms = ["facebook", "instagram", "linkedin", "twitter"];
  const foundPlatforms = platforms.filter(
    (platform) => socialMediaLinks[platform],
  );
  return Math.round((foundPlatforms.length / platforms.length) * 100);
}

// KEYWORD EXTRACTION FUNCTIONS
function extractKeywords(
  html,
  title,
  metaDescription,
  h1s,
  h2s,
  h3s,
  paragraphs,
  businessType,
  city,
  state,
) {
  // Common stop words to filter out
  const stopWords = new Set([
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "am",
    "an",
    "and",
    "any",
    "are",
    "aren't",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "can't",
    "cannot",
    "could",
    "couldn't",
    "did",
    "didn't",
    "do",
    "does",
    "doesn't",
    "doing",
    "don't",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "hadn't",
    "has",
    "hasn't",
    "have",
    "haven't",
    "having",
    "he",
    "he'd",
    "he'll",
    "he's",
    "her",
    "here",
    "here's",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "how's",
    "i",
    "i'd",
    "i'll",
    "i'm",
    "i've",
    "if",
    "in",
    "into",
    "is",
    "isn't",
    "it",
    "it's",
    "its",
    "itself",
    "let's",
    "me",
    "more",
    "most",
    "mustn't",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "ought",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "same",
    "shan't",
    "she",
    "she'd",
    "she'll",
    "she's",
    "should",
    "shouldn't",
    "so",
    "some",
    "such",
    "than",
    "that",
    "that's",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "there's",
    "these",
    "they",
    "they'd",
    "they'll",
    "they're",
    "they've",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "wasn't",
    "we",
    "we'd",
    "we'll",
    "we're",
    "we've",
    "were",
    "weren't",
    "what",
    "what's",
    "when",
    "when's",
    "where",
    "where's",
    "which",
    "while",
    "who",
    "who's",
    "whom",
    "why",
    "why's",
    "with",
    "won't",
    "would",
    "wouldn't",
    "you",
    "you'd",
    "you'll",
    "you're",
    "you've",
    "your",
    "yours",
    "yourself",
    "yourselves",
    // Common website words
    "home",
    "page",
    "website",
    "site",
    "click",
    "here",
    "learn",
    "read",
    "view",
    "see",
    "get",
    "find",
    "search",
    "menu",
    "navigation",
    "footer",
    "header",
    "contact",
    "info",
    "information",
  ]);

  // Service keywords by industry
  const serviceKeywordsByIndustry = {
    carpenter: [
      "carpentry",
      "finishing",
      "renovation",
      "construction",
      "custom",
      "repair",
      "installation",
    ],
    plumber: ["plumbing", "repair", "installation", "emergency", "service"],
    electrician: [
      "electrical",
      "wiring",
      "installation",
      "repair",
      "emergency",
    ],
    hvac: [
      "heating",
      "cooling",
      "air",
      "conditioning",
      "installation",
      "repair",
    ],
    roofing: ["roofing", "repair", "installation", "replacement"],
    landscaping: ["landscaping", "lawn", "maintenance", "design"],
    cleaning: ["cleaning", "service", "maintenance"],
    pest: ["pest", "control", "exterminator", "treatment"],
    auto: ["auto", "repair", "service", "maintenance"],
  };

  // Get relevant service keywords based on business type
  const businessTypeLC = businessType.toLowerCase();
  let relevantServiceKeywords = [];
  for (const [industry, keywords] of Object.entries(
    serviceKeywordsByIndustry,
  )) {
    if (businessTypeLC.includes(industry)) {
      relevantServiceKeywords = keywords;
      break;
    }
  }

  // Extract all text content with different weights
  const weightedContent = [
    { text: title, weight: 3 },
    { text: metaDescription, weight: 2 },
    ...h1s.map((text) => ({ text, weight: 2 })),
    ...h2s.map((text) => ({ text, weight: 1.5 })),
    ...h3s.map((text) => ({ text, weight: 1.2 })),
    ...paragraphs.map((text) => ({ text, weight: 1 })),
  ];

  const keywordFrequency = new Map();
  const allKeywords = new Set();
  const serviceKeywords = new Set();
  const locationKeywords = new Set();

  // High-intent keywords that indicate buyer readiness
  const intentKeywords = new Set([
    "emergency",
    "urgent",
    "same day",
    "24/7",
    "immediate",
    "repair",
    "fix",
    "broken",
    "replace",
    "install",
    "installation",
    "quote",
    "estimate",
    "cost",
    "price",
    "pricing",
    "affordable",
    "cheap",
    "budget",
    "call",
    "contact",
    "book",
    "schedule",
    "appointment",
    "consultation",
    "near me",
    "nearby",
    "local",
    "close",
    "best",
    "top",
    "rated",
    "reviews",
    "trusted",
    "professional",
    "licensed",
    "free",
    "discount",
    "special",
    "deal",
    "offer",
    "commercial",
    "residential",
    "business",
    "home",
    "expert",
    "experts",
    "custom",
    "premier",
    "quality",
    "experienced",
  ]);

  const topIntentKeywords = new Set();

  // Process each content piece
  weightedContent.forEach(({ text, weight }) => {
    if (!text) return;

    // Extract individual words and phrases
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word),
      );

    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (
        phrase.length > 5 &&
        !phrase.includes(city.toLowerCase()) &&
        !phrase.includes(state.toLowerCase())
      ) {
        const currentWeight = keywordFrequency.get(phrase) || 0;
        keywordFrequency.set(phrase, currentWeight + weight);
        allKeywords.add(phrase);
      }
    }

    // Process individual words
    words.forEach((word) => {
      if (typeof word !== "string") return; // Type guard

      const currentWeight = keywordFrequency.get(word) || 0;
      keywordFrequency.set(word, currentWeight + weight);
      allKeywords.add(word);

      // Categorize keywords
      if (
        relevantServiceKeywords.includes(word) ||
        [
          "service",
          "services",
          "repair",
          "installation",
          "maintenance",
          "emergency",
          "commercial",
          "residential",
        ].includes(word)
      ) {
        serviceKeywords.add(word);
      }

      // Location-related keywords
      if (
        ["local", "area", "nearby", "serving", "coverage", "zone"].includes(
          word,
        )
      ) {
        locationKeywords.add(word);
      }

      // Track high-intent keywords
      if (intentKeywords.has(word)) {
        topIntentKeywords.add(word);
      }
    });

    // Also check for multi-word intent phrases
    const textLower = text.toLowerCase();
    ["near me", "same day", "24/7", "free estimate", "free quote"].forEach(
      (phrase) => {
        if (textLower.includes(phrase)) {
          topIntentKeywords.add(phrase);
        }
      },
    );
  });

  // Sort keywords by frequency/weight
  const sortedKeywords = Array.from(allKeywords)
    .sort(
      (a, b) => (keywordFrequency.get(b) || 0) - (keywordFrequency.get(a) || 0),
    )
    .slice(0, 50); // Top 50 keywords

  // Create business-relevant keyword combinations
  const businessRelevantKeywords = Array.from(serviceKeywords)
    .concat(
      Array.from(allKeywords).filter((keyword) => {
        if (typeof keyword !== "string") return false; // Type guard
        return businessTypeLC
          .split(" ")
          .some((businessWord) => keyword.includes(businessWord));
      }),
    )
    .slice(0, 20);

  // Simplified keyword combinations
  const cityTrimmed = city.trim();
  const stateTrimmed = state.trim();
  const businessTypeTrimmed = businessType.trim();

  const keywordCombos = [
    `${businessTypeTrimmed} ${cityTrimmed}`,
    `${businessTypeTrimmed} ${cityTrimmed} ${stateTrimmed}`,
    `${businessTypeTrimmed} near me`,
    `best ${businessTypeTrimmed} ${cityTrimmed}`,
    `local ${businessTypeTrimmed} ${cityTrimmed}`,
  ].filter((combo) => combo.length > 5 && !combo.includes("  "));

  return {
    allKeywords: sortedKeywords,
    serviceKeywords: Array.from(serviceKeywords),
    locationKeywords: Array.from(locationKeywords),
    businessRelevantKeywords,
    keywordCombos,
    topIntentKeywords: Array.from(topIntentKeywords),
  };
}

// HTML PARSING HELPER FUNCTIONS
function extractTagContent(html, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, "i");
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractMetaDescription(html) {
  const regex = /<meta\s+name=["']description["']\s+content=["'](.*?)["']/i;
  const match = html.match(regex);
  return match ? match[1].trim() : null;
}

function extractAllTags(html, tag) {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, "gi");
  const matches = [...html.matchAll(regex)];
  return matches.map((match) => match[1].trim());
}

function extractLinks(html) {
  const regex = /<a\s+[^>]*href=["'](.*?)["'][^>]*>/gi;
  const matches = [...html.matchAll(regex)];
  return matches
    .map((match) => match[1].trim())
    .filter((link) => link.startsWith("/") || link.startsWith("http"));
}

module.exports = {
  analyzeWebsite,
};
