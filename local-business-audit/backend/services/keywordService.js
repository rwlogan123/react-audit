// backend/services/keywordService.js
// Migrated from ActivePieces Step 4: ChatGPT Keyword Intent Analysis

/**
 * Keyword Analysis Service
 * Uses OpenAI to analyze extracted keywords and competitive data
 * Generates strategic keyword recommendations based on search volume and intent
 */

const analyzeKeywords = async (websiteData, competitorData, apiCredentials) => {
  const {
    businessName = websiteData.businessName || "",
    city = websiteData.city || "",
    state = websiteData.state || "",
    tradeType = websiteData.tradeType || websiteData.businessType || "",
    website = websiteData.website || "",
  } = websiteData;

  const {
    openaiApiKey = process.env.OPENAI_API_KEY ||
      apiCredentials?.openaiApiKey ||
      "",
  } = apiCredentials || {};

  try {
    // Validate inputs
    if (!openaiApiKey) {
      throw new Error("OpenAI API key is required for keyword analysis");
    }

    console.log(`🔍 Starting keyword analysis for: ${businessName}`);

    // Combine all available keyword data
    const combinedData = {
      // Website keywords
      extractedKeywords: websiteData.extractedKeywords || [],
      serviceKeywords: websiteData.serviceKeywords || [],
      locationKeywords: websiteData.locationKeywords || [],
      keywordCombos: websiteData.keywordCombos || [],
      topIntentKeywords: websiteData.topIntentKeywords || [],

      // Competitor keyword volume data
      keywordData: competitorData.keywordData || [],

      // Business context
      businessType: tradeType,
      location: `${city}, ${state}`,
      website: website,

      // Competitive context
      totalCompetitors:
        competitorData.competitiveAnalysis?.totalCompetitors || 0,
      competitiveTiers:
        competitorData.competitiveAnalysis?.competitiveTiers || {},
    };

    // Create the detailed prompt for ChatGPT
    const prompt = `You're an expert in local SEO and keyword intent modeling. Based on the extracted keyword data below, generate the most valuable keywords and search phrases this business should be targeting in Google.

The business is a "${tradeType}" in "${city}, ${state}", and their website is "${website}".

CRITICAL REQUIREMENT: ONLY recommend keywords that have searchVolume greater than 0 in the keywordData provided. Any keyword with searchVolume of 0 or null must be completely excluded from ALL recommendations. Prioritize keywords by their actual search volume numbers, with highest volume getting top priority.

Use this data to identify:
1. Top high-intent search terms (ready to buy/book)
2. Keyword combinations with service + city
3. Any missing service-related keywords not detected on the website
4. Which extracted keywords are most relevant to lead generation
5. Red flags (irrelevant or too generic terms)

Output in the following format:
- 🔥 Top Intent Keywords:
- ✅ Priority Keyword Combos:
- 🧱 Missing Service Keywords:
- 🧲 Keywords Most Likely to Generate Leads:
- ⚠️ Keywords That Should Be Avoided or Refined:

Here is the extracted keyword data:

${JSON.stringify(combinedData, null, 2)}`;

    console.log(`🤖 Sending keyword analysis request to OpenAI...`);

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant specializing in local SEO and keyword strategy.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.9,
        presence_penalty: 0.6,
        frequency_penalty: 0,
        top_p: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const result = await response.json();
    const analysis = result.choices[0]?.message?.content || "";

    console.log(`✅ Keyword analysis complete`);

    // Parse the structured output
    const parseKeywordSections = (text) => {
      const sections = {
        topIntentKeywords: [],
        priorityKeywordCombos: [],
        missingServiceKeywords: [],
        leadGeneratingKeywords: [],
        keywordsToAvoid: [],
      };

      // Parse each section using regex
      const patterns = {
        topIntentKeywords: /🔥 Top Intent Keywords:(.*?)(?=✅|🧱|🧲|⚠️|$)/s,
        priorityKeywordCombos:
          /✅ Priority Keyword Combos:(.*?)(?=🔥|🧱|🧲|⚠️|$)/s,
        missingServiceKeywords:
          /🧱 Missing Service Keywords:(.*?)(?=🔥|✅|🧲|⚠️|$)/s,
        leadGeneratingKeywords:
          /🧲 Keywords Most Likely to Generate Leads:(.*?)(?=🔥|✅|🧱|⚠️|$)/s,
        keywordsToAvoid:
          /⚠️ Keywords That Should Be Avoided or Refined:(.*?)(?=🔥|✅|🧱|🧲|$)/s,
      };

      Object.keys(patterns).forEach((key) => {
        const match = text.match(patterns[key]);
        if (match) {
          // Extract bullet points and clean them
          const items = match[1]
            .split("\n")
            .map((line) => line.trim())
            .filter(
              (line) =>
                line.length > 0 &&
                (line.startsWith("-") || line.startsWith("•")),
            )
            .map((line) => line.replace(/^[-•]\s*/, "").trim())
            .filter((line) => line.length > 0);

          sections[key] = items;
        }
      });

      return sections;
    };

    const parsedSections = parseKeywordSections(analysis);

    // Extract high-value keywords with search volume data
    const keywordsWithVolume = (competitorData.keywordData || [])
      .filter((kw) => kw.searchVolume > 0)
      .sort((a, b) => b.searchVolume - a.searchVolume);

    // Calculate keyword metrics
    const keywordMetrics = {
      totalKeywordsAnalyzed: combinedData.extractedKeywords.length,
      keywordsWithVolume: keywordsWithVolume.length,
      totalSearchVolume: keywordsWithVolume.reduce(
        (sum, kw) => sum + kw.searchVolume,
        0,
      ),
      averageSearchVolume:
        keywordsWithVolume.length > 0
          ? Math.round(
              keywordsWithVolume.reduce((sum, kw) => sum + kw.searchVolume, 0) /
                keywordsWithVolume.length,
            )
          : 0,
      highVolumeKeywords: keywordsWithVolume.filter(
        (kw) => kw.searchVolume >= 100,
      ).length,
      mediumVolumeKeywords: keywordsWithVolume.filter(
        (kw) => kw.searchVolume >= 20 && kw.searchVolume < 100,
      ).length,
      lowVolumeKeywords: keywordsWithVolume.filter(
        (kw) => kw.searchVolume > 0 && kw.searchVolume < 20,
      ).length,
    };

    // Generate strategic recommendations
    const strategicInsights = {
      primaryFocus: keywordsWithVolume.slice(0, 3).map((kw) => ({
        keyword: kw.keyword,
        searchVolume: kw.searchVolume,
        competition: kw.competition,
        cpc: kw.cpc,
      })),
      localOpportunities: keywordsWithVolume.filter(
        (kw) =>
          kw.keyword.toLowerCase().includes(city.toLowerCase()) ||
          kw.keyword.toLowerCase().includes(state.toLowerCase()),
      ),
      serviceOpportunities: keywordsWithVolume.filter(
        (kw) =>
          kw.keyword.toLowerCase().includes(tradeType.toLowerCase()) ||
          combinedData.serviceKeywords.some((service) =>
            kw.keyword.toLowerCase().includes(service.toLowerCase()),
          ),
      ),
    };

    return {
      success: true,
      analysis: analysis,
      parsedSections: parsedSections,
      keywordMetrics: keywordMetrics,
      strategicInsights: strategicInsights,
      keywordsWithVolume: keywordsWithVolume,
      combinedData: {
        websiteKeywords: combinedData.extractedKeywords.length,
        competitorKeywords: combinedData.keywordData.length,
        totalDataPoints:
          combinedData.extractedKeywords.length +
          combinedData.keywordData.length,
      },
    };
  } catch (error) {
    console.error(`❌ Keyword analysis failed: ${error.message}`);

    return {
      success: false,
      error: error.message,
      analysis: "",
      parsedSections: {
        topIntentKeywords: [],
        priorityKeywordCombos: [],
        missingServiceKeywords: [],
        leadGeneratingKeywords: [],
        keywordsToAvoid: [],
      },
      keywordMetrics: {
        totalKeywordsAnalyzed: 0,
        keywordsWithVolume: 0,
        totalSearchVolume: 0,
        averageSearchVolume: 0,
        highVolumeKeywords: 0,
        mediumVolumeKeywords: 0,
        lowVolumeKeywords: 0,
      },
      strategicInsights: {
        primaryFocus: [],
        localOpportunities: [],
        serviceOpportunities: [],
      },
      keywordsWithVolume: [],
    };
  }
};

module.exports = {
  analyzeKeywords,
};
