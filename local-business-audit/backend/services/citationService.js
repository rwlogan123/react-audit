// backend/services/citationService.js
// Migrated from ActivePieces Step 5: NAP & Social Citation Analysis with Website Integration

/**
 * Citation Analysis Service
 * Analyzes NAP (Name, Address, Phone) consistency across directories and social platforms
 * Integrates website social media data with SERP-discovered citations
 * Uses DataForSEO API for comprehensive directory and social media discovery
 */

const analyzeCitations = async (
  businessData,
  websiteData,
  competitorData,
  apiCredentials,
) => {
  const {
    businessName = businessData.businessName || "",
    city = businessData.city || "",
    state = businessData.state || "",
    website = businessData.website || "",
  } = businessData;

  const {
    apiUsername = process.env.DATAFORSEO_USER || apiCredentials?.username || "",
    apiPassword = process.env.DATAFORSEO_PASS || apiCredentials?.password || "",
  } = apiCredentials || {};

  const debugLog = [];

  // Configuration
  const LOCATION_CODES = { Utah: 1023191, California: 1023232, Texas: 1023218 };
  const DEFAULT_LOCATION_CODE = 1023191;
  const BASE_DIRECTORIES = [
    "yelp.com",
    "bbb.org",
    "yellowpages.com",
    "angi.com",
    "houzz.com",
    "homeadvisor.com",
    "thumbtack.com",
    "facebook.com",
  ];
  const SOCIAL_PLATFORMS = [
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "twitter.com",
  ];

  try {
    debugLog.push(
      "🚀 Enhanced NAP & Social Analysis with Website Integration started",
    );

    // Validate inputs
    if (!apiUsername || !apiPassword) {
      throw new Error("DataForSEO API credentials required");
    }

    if (!businessName || !city || !state) {
      throw new Error("Business name, city, and state required");
    }

    console.log(
      `🔍 Starting citation analysis for: ${businessName} in ${city}, ${state}`,
    );

    // Extract anchor data from competitor analysis (Google Business Profile data)
    const anchorPhone = competitorData.businessData?.phone || "";
    const anchorAddress = competitorData.businessData?.address || "";
    const anchorWebsite = competitorData.businessData?.url || website || "";

    debugLog.push("✅ Inputs validated successfully");
    debugLog.push(`🏢 Business: ${businessName}`);
    debugLog.push(`📍 Location: ${city}, ${state}`);
    debugLog.push(`🎯 Anchor Phone: ${anchorPhone}`);
    debugLog.push(`🎯 Anchor Address: ${anchorAddress}`);

    // Website analysis integration
    debugLog.push(
      `🌐 Website analysis data received: ${websiteData.success ? "Yes" : "No"}`,
    );
    if (websiteData.socialMediaLinks) {
      const websiteSocialPlatforms = Object.keys(
        websiteData.socialMediaLinks,
      ).filter((platform) => websiteData.socialMediaLinks[platform]);
      debugLog.push(
        `🌐 Website found ${websiteSocialPlatforms.length} social platforms: ${websiteSocialPlatforms.join(", ")}`,
      );
    }

    // Test DataForSEO connection
    const connectionTest = await testDataForSEOConnection(
      apiUsername,
      apiPassword,
      debugLog,
    );
    if (!connectionTest.success) {
      throw new Error("DataForSEO connection failed");
    }

    // Fetch SERP data with targeted queries
    const serpData = await fetchSERPDataLive(
      apiUsername,
      apiPassword,
      businessName,
      city,
      state,
      debugLog,
    );

    // Process results with location filtering and website integration
    const processedData = processResults(
      serpData.results,
      businessName,
      city,
      state,
      websiteData,
      debugLog,
    );

    // Detect inconsistencies against anchor data (Google Business Profile)
    const anchorData = {
      phone: anchorPhone,
      address: anchorAddress,
      website: anchorWebsite,
    };

    const inconsistencies = detectInconsistencies(
      processedData.napData,
      anchorData,
      debugLog,
    );

    // Calculate scores with inconsistency penalties
    const scores = calculateScores(
      processedData.napData,
      processedData.socialData,
      inconsistencies,
    );

    // Generate summary data
    const napSummary = {
      businessName: businessName,
      anchorPhone: anchorPhone,
      anchorAddress: anchorAddress,
      foundPhones: processedData.napData.phones,
      foundAddresses: processedData.napData.addresses,
      primaryWebsite:
        processedData.napData.websites[0] || anchorWebsite || null,
      allWebsites: processedData.napData.websites,
      consistent: scores.napConsistency,
      consistencyScore: scores.napScore,
      inconsistencyCount: inconsistencies.length,
    };

    // Enhanced social summary with website data integration
    const socialSummary = {
      platforms: Object.keys(processedData.socialData),
      socialScore: scores.socialScore,
      facebook: processedData.socialData["facebook"]?.[0] || null,
      instagram: processedData.socialData["instagram"]?.[0] || null,
      linkedin: processedData.socialData["linkedin"]?.[0] || null,
      twitter: processedData.socialData["twitter"]?.[0] || null,
      dataSource: {
        fromSERP: Object.keys(processedData.socialData).filter(
          (platform) =>
            processedData.socialData[platform] &&
            processedData.socialData[platform].length > 0,
        ).length,
        fromWebsite: websiteData.socialMediaFound || 0,
        totalFound: scores.foundSocialPlatforms.length,
      },
    };

    // Generate recommendations
    const recommendations = [];
    if (inconsistencies.length > 0) {
      recommendations.push(
        `Fix ${inconsistencies.length} NAP inconsistencies found across directories`,
      );
    }
    if (scores.socialScore < 50) {
      recommendations.push("Add presence on major social platforms");
    }
    if (processedData.directoryLinks.length < 5) {
      recommendations.push(
        "Increase directory listings for better local SEO visibility",
      );
    }

    debugLog.push("✅ Analysis completed successfully");
    debugLog.push(
      `📈 NAP Score: ${scores.napScore}%, Social Score: ${scores.socialScore}%`,
    );
    debugLog.push(`🚨 Found ${inconsistencies.length} inconsistencies`);
    debugLog.push(
      `🌐 Final social media platforms: ${Object.keys(processedData.socialData).join(", ")}`,
    );

    console.log(
      `✅ Citation analysis complete: NAP score ${scores.napScore}%, ${inconsistencies.length} inconsistencies`,
    );

    return {
      success: true,
      businessName: businessName,
      analysisTimestamp: new Date().toISOString(),

      totalCost: serpData.totalCost,
      totalResults: serpData.results.length,
      directoryCount: processedData.directoryLinks.length,
      socialCitationCount: processedData.socialCitations.length,

      napSummary: napSummary,
      socialSummary: socialSummary,
      recommendations: recommendations,

      // Detailed inconsistency analysis
      inconsistencies: inconsistencies,
      inconsistencySummary: {
        total: inconsistencies.length,
        high: inconsistencies.filter((i) => i.severity === "high").length,
        medium: inconsistencies.filter((i) => i.severity === "medium").length,
        low: inconsistencies.filter((i) => i.severity === "low").length,
      },

      directoryLinks: processedData.directoryLinks,
      socialCitations: processedData.socialCitations,

      consistencyScores: {
        napConsistency: scores.napScore,
        socialPresence: scores.socialScore,
      },

      // Website integration details
      websiteIntegration: {
        websiteAnalysisReceived: !!websiteData.success,
        websiteSocialMediaFound: websiteData.socialMediaFound || 0,
        websiteSocialScore: websiteData.socialMediaScore || 0,
        websiteSocialLinks: websiteData.socialMediaLinks || {},
        integrationStatus: "completed",
      },

      debugLog: debugLog,
    };
  } catch (error) {
    console.error(`❌ Citation analysis failed: ${error.message}`);
    debugLog.push("❌ Error: " + error.message);

    return {
      success: false,
      error: true,
      message: error.message,
      businessName: businessName || "Unknown",
      websiteIntegration: {
        websiteAnalysisReceived: !!(websiteData && websiteData.success),
        integrationStatus: "failed",
      },
      debugLog: debugLog,
    };
  }
};

// Utility Functions
function getLocationCode(state) {
  const LOCATION_CODES = { Utah: 1023191, California: 1023232, Texas: 1023218 };
  return LOCATION_CODES[state] || 1023191;
}

function getValidAreaCodes(state) {
  const areaCodeMap = {
    Utah: ["385", "435", "801"],
    California: [
      "209",
      "213",
      "279",
      "310",
      "323",
      "408",
      "415",
      "424",
      "442",
      "510",
      "530",
      "559",
      "562",
      "619",
      "626",
      "628",
      "650",
      "657",
      "661",
      "669",
      "707",
      "714",
      "747",
      "760",
      "805",
      "818",
      "831",
      "858",
      "909",
      "916",
      "925",
      "949",
      "951",
    ],
    Texas: [
      "214",
      "254",
      "281",
      "325",
      "346",
      "361",
      "409",
      "430",
      "432",
      "469",
      "512",
      "713",
      "737",
      "806",
      "817",
      "832",
      "903",
      "915",
      "936",
      "940",
      "956",
      "972",
      "979",
    ],
    Florida: [
      "239",
      "305",
      "321",
      "352",
      "386",
      "407",
      "561",
      "727",
      "754",
      "772",
      "786",
      "813",
      "850",
      "863",
      "904",
      "941",
      "954",
    ],
    "New York": [
      "212",
      "315",
      "347",
      "516",
      "518",
      "585",
      "607",
      "631",
      "646",
      "680",
      "716",
      "718",
      "845",
      "914",
      "917",
      "929",
      "934",
    ],
  };
  return areaCodeMap[state] || [];
}

function normalizePhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return (
      "(" +
      digits.slice(0, 3) +
      ") " +
      digits.slice(3, 6) +
      "-" +
      digits.slice(6)
    );
  } else if (digits.length === 11 && digits.startsWith("1")) {
    return (
      "(" +
      digits.slice(1, 4) +
      ") " +
      digits.slice(4, 7) +
      "-" +
      digits.slice(7)
    );
  }
  return phone.trim();
}

function normalizeAddress(address) {
  if (!address) return null;
  return address
    .trim()
    .replace(/\s+/g, " ")
    .replace(
      /\b(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl|Way|Parkway|Pkwy)\b\.?/gi,
      function (match) {
        return match.replace(".", "").toLowerCase();
      },
    );
}

function extractPhone(text, state) {
  const phonePattern = /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phonePattern);
  if (matches && matches.length > 0) {
    const validAreaCodes = getValidAreaCodes(state);

    const validPhones = matches.filter((phone) => {
      const digits = phone.replace(/\D/g, "");
      const areaCode = digits.substring(0, 3);

      const isBasicValid =
        digits !== "0000000000" &&
        digits !== "1111111111" &&
        digits !== "1234567890" &&
        !digits.startsWith("000") &&
        !digits.startsWith("111") &&
        (digits.length === 10 ||
          (digits.length === 11 && digits.startsWith("1")));

      const isAreaCodeValid =
        validAreaCodes.length === 0 || validAreaCodes.includes(areaCode);

      return isBasicValid && isAreaCodeValid;
    });

    if (validPhones.length > 0) {
      return normalizePhone(validPhones[0]);
    }
  }
  return null;
}

function extractAddress(text, city, state) {
  const addressPattern =
    /\b\d{1,6}\s+[A-Za-z\s]{2,50}(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Circle|Cir|Court|Ct|Place|Pl|Way|Parkway|Pkwy)\b/gi;
  const matches = text.match(addressPattern);

  if (matches && matches.length > 0) {
    const relevantAddress = matches.find((match) => {
      const lower = match.toLowerCase();
      const textLower = text.toLowerCase();
      const matchIndex = textLower.indexOf(lower);

      const contextWindow = textLower.substring(
        Math.max(0, matchIndex - 50),
        matchIndex + match.length + 50,
      );

      return (
        (contextWindow.includes(city.toLowerCase()) ||
          contextWindow.includes(state.toLowerCase()) ||
          contextWindow.includes("ut ") ||
          contextWindow.includes("utah")) &&
        !lower.includes("top ") &&
        !lower.includes("best ") &&
        !lower.includes("page ") &&
        !lower.includes("result") &&
        match.length > 10
      );
    });

    if (relevantAddress) {
      return relevantAddress.trim();
    }
  }

  const cityStatePattern = new RegExp(
    `\\b[A-Za-z\\s]{3,25},\\s*${state}\\b`,
    "gi",
  );
  const cityStateMatches = text.match(cityStatePattern);
  if (cityStateMatches && cityStateMatches.length > 0) {
    return cityStateMatches[0].trim();
  }

  return null;
}

function extractWebsite(text) {
  const websitePattern =
    /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(websitePattern);
  if (matches && matches.length > 0) {
    const validSite = matches.find((site) => {
      const lower = site.toLowerCase();
      return (
        !lower.includes("facebook") &&
        !lower.includes("instagram") &&
        !lower.includes("twitter") &&
        !lower.includes("linkedin") &&
        !lower.includes("google") &&
        !lower.includes("yelp") &&
        !lower.includes("angi") &&
        !lower.includes("bbb") &&
        !lower.includes("thumbtack") &&
        !lower.includes(".gov") &&
        !lower.includes(".edu") &&
        !lower.includes(".pdf") &&
        !lower.includes(".jpg") &&
        !lower.includes(".png") &&
        lower.length > 8 &&
        lower.split(".").length >= 2
      );
    });
    if (validSite) {
      return validSite.startsWith("http") ? validSite : "https://" + validSite;
    }
  }
  return null;
}

function extractSocial(text, businessName) {
  const social = {};

  // Facebook
  const fbPattern =
    /(?:https?:\/\/)?(?:www\.)?facebook\.com\/[A-Za-z0-9\.\-_]+/gi;
  const fbMatches = text.match(fbPattern);
  if (fbMatches) {
    fbMatches.forEach(function (match) {
      const cleanUrl = match.startsWith("http") ? match : "https://" + match;
      if (!social["facebook"]) social["facebook"] = [];
      if (social["facebook"].indexOf(cleanUrl) === -1) {
        social["facebook"].push(cleanUrl);
      }
    });
  }

  // Instagram
  const igPattern =
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/[A-Za-z0-9\.\-_]+/gi;
  const igMatches = text.match(igPattern);
  if (igMatches) {
    igMatches.forEach(function (match) {
      const cleanUrl = match.startsWith("http") ? match : "https://" + match;
      if (!social["instagram"]) social["instagram"] = [];
      if (social["instagram"].indexOf(cleanUrl) === -1) {
        social["instagram"].push(cleanUrl);
      }
    });
  }

  // LinkedIn
  const liPattern =
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[A-Za-z0-9\.\-_\/]+/gi;
  const liMatches = text.match(liPattern);
  if (liMatches) {
    liMatches.forEach(function (match) {
      const cleanUrl = match.startsWith("http") ? match : "https://" + match;
      if (!social["linkedin"]) social["linkedin"] = [];
      if (social["linkedin"].indexOf(cleanUrl) === -1) {
        social["linkedin"].push(cleanUrl);
      }
    });
  }

  // Twitter/X
  const twPattern =
    /(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/[A-Za-z0-9\.\-_]+/gi;
  const twMatches = text.match(twPattern);
  if (twMatches) {
    twMatches.forEach(function (match) {
      const cleanUrl = match.startsWith("http") ? match : "https://" + match;
      if (!social["twitter"]) social["twitter"] = [];
      if (social["twitter"].indexOf(cleanUrl) === -1) {
        social["twitter"].push(cleanUrl);
      }
    });
  }

  return social;
}

function isDirectoryDomain(domain) {
  const BASE_DIRECTORIES = [
    "yelp.com",
    "bbb.org",
    "yellowpages.com",
    "angi.com",
    "houzz.com",
    "homeadvisor.com",
    "thumbtack.com",
    "facebook.com",
  ];
  return BASE_DIRECTORIES.some(function (dir) {
    return domain.toLowerCase().includes(dir);
  });
}

function isSocialDomain(domain) {
  const SOCIAL_PLATFORMS = [
    "facebook.com",
    "instagram.com",
    "linkedin.com",
    "twitter.com",
  ];
  return SOCIAL_PLATFORMS.some(function (platform) {
    return domain.toLowerCase().includes(platform);
  });
}

function filterLocationRelevant(results, city, state, debugLog) {
  const cityLower = city.toLowerCase();
  const stateLower = state.toLowerCase();

  const filtered = results.filter((item) => {
    if (!item.title && !item.snippet && !item.url) return false;

    const text = (
      item.title +
      " " +
      (item.snippet || "") +
      " " +
      item.url
    ).toLowerCase();

    const hasSpecificLocation =
      (text.includes(cityLower) && text.includes(stateLower)) ||
      (text.includes(cityLower) && text.includes(" ut ")) ||
      (text.includes(cityLower) && text.includes("utah")) ||
      (text.includes(cityLower) && text.includes(", ut"));

    const hasWrongLocation =
      text.includes("california") ||
      text.includes("florida") ||
      text.includes("texas") ||
      text.includes("new york") ||
      text.includes(" ca ") ||
      text.includes(" fl ") ||
      text.includes(" tx ") ||
      text.includes(" ny ");

    return hasSpecificLocation && !hasWrongLocation;
  });

  debugLog.push(
    `🔍 STRICT location filter: ${results.length} → ${filtered.length} (removed out-of-state/irrelevant)`,
  );
  return filtered;
}

function detectInconsistencies(foundData, anchorData, debugLog) {
  const inconsistencies = [];
  const anchorPhone = normalizePhone(anchorData.phone);
  const anchorAddress = normalizeAddress(anchorData.address);

  debugLog.push(
    `🎯 Anchor data - Phone: ${anchorPhone}, Address: ${anchorAddress}`,
  );

  // Phone inconsistencies
  foundData.phones.forEach((phone) => {
    const normalizedFound = normalizePhone(phone);
    if (normalizedFound !== anchorPhone) {
      inconsistencies.push({
        type: "phone",
        field: "Phone Number",
        correct: anchorPhone,
        found: normalizedFound,
        severity: "high",
        impact: "Customers may call wrong number, hurting conversion rates",
        action: `Update directory listings to use ${anchorPhone}`,
      });
    }
  });

  // Address inconsistencies
  if (foundData.addresses.length === 0) {
    inconsistencies.push({
      type: "address",
      field: "Business Address",
      correct: anchorAddress,
      found: "Missing from search results",
      severity: "medium",
      impact: "Reduced local search visibility and customer confusion",
      action: "Add complete address to major directory listings",
    });
  } else {
    foundData.addresses.forEach((address) => {
      const normalizedFound = normalizeAddress(address);
      if (normalizedFound !== anchorAddress) {
        inconsistencies.push({
          type: "address",
          field: "Business Address",
          correct: anchorAddress,
          found: normalizedFound,
          severity: "medium",
          impact: "Confuses Google and customers about business location",
          action: `Standardize address across all listings to ${anchorAddress}`,
        });
      }
    });
  }

  // Website inconsistencies
  if (anchorData.website) {
    const anchorDomain = anchorData.website
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];
    let websiteFound = false;

    foundData.websites.forEach((website) => {
      const foundDomain = website
        .replace(/^https?:\/\//, "")
        .replace(/^www\./, "")
        .split("/")[0];
      if (foundDomain === anchorDomain) {
        websiteFound = true;
      }
    });

    if (!websiteFound && foundData.websites.length > 0) {
      inconsistencies.push({
        type: "website",
        field: "Website URL",
        correct: anchorData.website,
        found: "Different or missing website in listings",
        severity: "low",
        impact: "May direct customers to wrong website",
        action: `Ensure ${anchorData.website} is listed in all directory profiles`,
      });
    }
  }

  debugLog.push(`🚨 Found ${inconsistencies.length} NAP inconsistencies`);
  return inconsistencies;
}

async function testDataForSEOConnection(apiUsername, apiPassword, debugLog) {
  try {
    const credentials = Buffer.from(`${apiUsername}:${apiPassword}`).toString(
      "base64",
    );
    debugLog.push("🔍 Testing DataForSEO connection...");

    const response = await fetch(
      "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + credentials,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            keyword: "test query",
            location_code: 1023191,
            language_code: "en",
            device: "desktop",
            depth: 5,
          },
        ]),
      },
    );

    if (response.ok) {
      const data = await response.json();
      if (data.status_code === 20000) {
        debugLog.push("✅ Authentication working - account is valid");
        return { success: true };
      } else if (data.status_code === 40100) {
        debugLog.push("❌ Authentication failed - check credentials");
        return { success: false, reason: "auth_failed" };
      }
    }

    return { success: false, reason: "unknown" };
  } catch (error) {
    debugLog.push("❌ Connection test error: " + error.message);
    return { success: false, reason: "network_error" };
  }
}

async function fetchSERPDataLive(
  apiUsername,
  apiPassword,
  businessName,
  city,
  state,
  debugLog,
) {
  try {
    debugLog.push("🚀 Using targeted DataForSEO Live API searches...");

    const locationCode = getLocationCode(state);
    const credentials = Buffer.from(`${apiUsername}:${apiPassword}`).toString(
      "base64",
    );

    const queries = [
      `"${businessName}" "${city}" "${state}"`,
      `"${businessName}" ${city} ${state} phone address`,
      `"${businessName}" ${city} ${state} yelp angi bbb houzz`,
      `"${businessName}" ${city} ${state} facebook instagram linkedin`,
      `${businessName} ${city} utah directory listing contact`,
    ];

    let allResults = [];
    let totalCost = 0;

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      debugLog.push(
        `Processing targeted query ${i + 1}/${queries.length}: ${query}`,
      );

      try {
        const response = await fetch(
          "https://api.dataforseo.com/v3/serp/google/organic/live/regular",
          {
            method: "POST",
            headers: {
              Authorization: "Basic " + credentials,
              "Content-Type": "application/json",
            },
            body: JSON.stringify([
              {
                keyword: query,
                location_code: locationCode,
                language_code: "en",
                device: "desktop",
                depth: 25,
              },
            ]),
          },
        );

        if (!response.ok) {
          debugLog.push(`Query ${i + 1} HTTP error: ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (data.status_code === 20000) {
          const task = data.tasks && data.tasks[0];
          if (task && task.result && task.result[0]) {
            const results = task.result[0].items || [];
            allResults = allResults.concat(results);
            totalCost += task.cost || 0;
            debugLog.push(
              `Query ${i + 1} returned ${results.length} results (cost: $${(task.cost || 0).toFixed(3)})`,
            );
          }
        } else {
          debugLog.push(`Query ${i + 1} failed: ${data.status_message}`);
        }

        if (i < queries.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      } catch (queryError) {
        debugLog.push(`Query ${i + 1} error: ${queryError.message}`);
        continue;
      }
    }

    debugLog.push(
      `✅ Live API completed - Total cost: $${totalCost.toFixed(3)}`,
    );
    debugLog.push(`Total results collected: ${allResults.length}`);

    return {
      results: allResults,
      totalCost: totalCost,
      queryCount: queries.length,
    };
  } catch (error) {
    debugLog.push("❌ Live API error: " + error.message);
    throw error;
  }
}

function integrateWebsiteSocialMedia(socialData, websiteAnalysis, debugLog) {
  debugLog.push("🌐 Integrating website analysis social media data...");

  if (!websiteAnalysis || !websiteAnalysis.socialMediaLinks) {
    debugLog.push("⚠️ No website social media data available");
    return socialData;
  }

  const websiteSocialMedia = websiteAnalysis.socialMediaLinks;
  let addedCount = 0;

  Object.keys(websiteSocialMedia).forEach((platform) => {
    const websiteLink = websiteSocialMedia[platform];
    if (websiteLink && websiteLink.trim() !== "") {
      if (!socialData[platform]) {
        socialData[platform] = [];
      }

      if (socialData[platform].indexOf(websiteLink) === -1) {
        socialData[platform].push(websiteLink);
        debugLog.push(`✅ Added ${platform} from website: ${websiteLink}`);
        addedCount++;
      } else {
        debugLog.push(
          `ℹ️ ${platform} already found in SERP data: ${websiteLink}`,
        );
      }
    }
  });

  debugLog.push(
    `📊 Website integration complete - Added ${addedCount} new social media links`,
  );
  return socialData;
}

function processResults(
  results,
  businessName,
  city,
  state,
  websiteAnalysis,
  debugLog,
) {
  const filteredResults = filterLocationRelevant(
    results,
    city,
    state,
    debugLog,
  );

  const directoryLinks = [];
  const socialCitations = [];
  const otherCitations = [];

  const napData = {
    names: [],
    addresses: [],
    phones: [],
    websites: [],
  };

  let socialData = {};

  if (Array.isArray(filteredResults)) {
    filteredResults.forEach(function (item) {
      if (!item.url || !item.title) return;

      const domain = item.domain || "";
      const isDirectory = isDirectoryDomain(domain);
      const isSocial = isSocialDomain(domain);

      const combinedText =
        item.title + " " + (item.snippet || "") + " " + item.url;

      const phone = extractPhone(combinedText, state);
      const address = extractAddress(combinedText, city, state);
      const website = extractWebsite(combinedText);
      const social = extractSocial(item.url + " " + combinedText, businessName);

      const resultEntry = {
        title: item.title,
        link: item.url,
        domain: domain,
        snippet: item.snippet || "",
        phone: phone,
        address: address,
        website: website,
        social: social,
      };

      if (isDirectory) {
        directoryLinks.push(resultEntry);
      } else if (isSocial) {
        socialCitations.push(resultEntry);
      } else {
        otherCitations.push(resultEntry);
      }

      // Collect unique NAP data
      if (phone && napData.phones.indexOf(phone) === -1) {
        napData.phones.push(phone);
      }
      if (address && napData.addresses.indexOf(address) === -1) {
        napData.addresses.push(address);
      }
      if (website && napData.websites.indexOf(website) === -1) {
        napData.websites.push(website);
      }

      // Collect social data from SERP
      Object.keys(social).forEach(function (platform) {
        if (!socialData[platform]) {
          socialData[platform] = [];
        }
        social[platform].forEach(function (url) {
          if (socialData[platform].indexOf(url) === -1) {
            socialData[platform].push(url);
          }
        });
      });
    });
  }

  debugLog.push(
    `📊 SERP processed: ${directoryLinks.length} directories, ${socialCitations.length} social, ${otherCitations.length} other`,
  );
  debugLog.push(
    `📊 SERP found: ${napData.addresses.length} addresses, ${napData.phones.length} phones`,
  );
  debugLog.push(`📊 SERP social platforms: ${Object.keys(socialData).length}`);

  // Integrate website social media data
  socialData = integrateWebsiteSocialMedia(
    socialData,
    websiteAnalysis,
    debugLog,
  );

  debugLog.push(
    `📊 Final social platforms after website integration: ${Object.keys(socialData).length}`,
  );

  return {
    directoryLinks: directoryLinks,
    socialCitations: socialCitations,
    otherCitations: otherCitations,
    napData: napData,
    socialData: socialData,
  };
}

function calculateScores(napData, socialData, inconsistencies) {
  let napScore = 100;
  inconsistencies.forEach((inc) => {
    if (inc.severity === "high") napScore -= 30;
    else if (inc.severity === "medium") napScore -= 20;
    else napScore -= 10;
  });
  napScore = Math.max(0, napScore);

  const socialPlatforms = ["facebook", "instagram", "linkedin", "twitter"];
  const foundSocialPlatforms = socialPlatforms.filter(function (platform) {
    return socialData[platform] && socialData[platform].length > 0;
  });
  const socialScore = Math.round(
    (foundSocialPlatforms.length / socialPlatforms.length) * 100,
  );

  return {
    napConsistency: inconsistencies.length === 0,
    napScore: napScore,
    socialScore: socialScore,
    foundSocialPlatforms: foundSocialPlatforms,
    inconsistencyCount: inconsistencies.length,
  };
}

module.exports = {
  analyzeCitations,
};
