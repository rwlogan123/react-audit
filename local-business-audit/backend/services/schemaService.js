// backend/services/schemaService.js
// Migrated from ActivePieces Step 7: Schema Markup Validation

/**
 * Schema Markup Analysis Service
 * Validates JSON-LD structured data markup for local business schemas
 * Checks for required fields and provides scoring based on completeness
 */

const analyzeSchema = async (businessData) => {
  const { website = businessData.website || "" } = businessData;

  const result = {
    success: true,
    hasSchema: false,
    score: 0,
    schemaType: null,
    missingFields: [],
    errors: [],
    rawScriptFound: false,
    scriptContentSnippet: null,
    foundSchemas: [],
    recommendations: [],
  };

  try {
    // Validate website URL
    if (!website || !website.startsWith("http")) {
      throw new Error("Invalid or missing website URL");
    }

    console.log(`🏗️ Starting schema analysis for: ${website}`);

    const response = await fetch(website, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
      timeout: 10000,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    console.log(`📄 HTML fetched: ${html.length} characters`);

    // Match all <script type="application/ld+json"> blocks
    const schemaScripts = [
      ...html.matchAll(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis,
      ),
    ];

    if (!schemaScripts.length) {
      console.log("❌ No JSON-LD schema scripts found");
      result.recommendations.push(
        "Add LocalBusiness schema markup to improve local SEO",
      );
      return result;
    }

    result.rawScriptFound = true;
    console.log(`📊 Found ${schemaScripts.length} JSON-LD script(s)`);

    let bestSchema = null;
    let bestScore = 0;

    for (const [index, scriptMatch] of schemaScripts.entries()) {
      const scriptContent = scriptMatch[1].trim();
      result.scriptContentSnippet = scriptContent.slice(0, 300);

      let json;
      try {
        json = JSON.parse(scriptContent);
      } catch (e) {
        const error = `JSON parse error in script ${index + 1}: ${e.message}`;
        result.errors.push(error);
        console.log(`❌ ${error}`);
        continue;
      }

      // Handle both single objects and arrays
      const schemas = Array.isArray(json) ? json : [json];

      for (const schema of schemas) {
        const schemaAnalysis = analyzeSchemaObject(schema, index + 1);
        result.foundSchemas.push(schemaAnalysis);

        // Track the best business schema found
        if (
          schemaAnalysis.isBusinessSchema &&
          schemaAnalysis.score > bestScore
        ) {
          bestSchema = schemaAnalysis;
          bestScore = schemaAnalysis.score;
        }
      }
    }

    // Set result based on best schema found
    if (bestSchema) {
      result.hasSchema = true;
      result.schemaType = bestSchema.type;
      result.score = bestSchema.score;
      result.missingFields = bestSchema.missingFields;

      console.log(
        `✅ Found ${bestSchema.type} schema with score: ${bestSchema.score}%`,
      );

      // Generate recommendations based on score
      if (result.score === 100) {
        result.recommendations.push(
          "Excellent! LocalBusiness schema is complete and properly implemented",
        );
      } else if (result.score >= 67) {
        result.recommendations.push(
          "Good schema implementation - consider adding missing fields for better completeness",
        );
      } else {
        result.recommendations.push(
          "Schema markup needs improvement - add required business information",
        );
      }

      // Add specific field recommendations
      if (result.missingFields.length > 0) {
        result.recommendations.push(
          `Add missing schema fields: ${result.missingFields.join(", ")}`,
        );
      }
    } else {
      console.log("❌ No business-relevant schema found");
      result.recommendations.push(
        "Add LocalBusiness schema markup with name, address, and telephone",
      );

      // Check if other schema types were found
      const otherSchemas = result.foundSchemas.filter(
        (s) => !s.isBusinessSchema,
      );
      if (otherSchemas.length > 0) {
        const types = otherSchemas.map((s) => s.type).join(", ");
        result.recommendations.push(
          `Found other schema types (${types}) - consider adding LocalBusiness schema for local SEO`,
        );
      }
    }

    console.log(
      `✅ Schema analysis complete: ${result.hasSchema ? "Schema found" : "No business schema"}`,
    );

    return result;
  } catch (error) {
    console.error(`❌ Schema analysis failed: ${error.message}`);
    result.success = false;
    result.errors.push(`Fetch error: ${error.message}`);
    result.recommendations.push(
      "Fix website accessibility issues before implementing schema markup",
    );
    return result;
  }
};

// Analyze individual schema object
function analyzeSchemaObject(schema, scriptIndex) {
  const type = schema["@type"] || schema.type || "Unknown";

  // Define valid business schema types
  const validBusinessTypes = [
    "LocalBusiness",
    "Organization",
    "Contractor",
    "HomeAndConstructionBusiness",
    "GeneralContractor",
    "ElectricalContractor",
    "PlumbingContractor",
    "RoofingContractor",
    "MovingCompany",
    "LockSmith",
  ];

  const isBusinessSchema = validBusinessTypes.includes(type);

  const analysis = {
    scriptIndex: scriptIndex,
    type: type,
    isBusinessSchema: isBusinessSchema,
    score: 0,
    missingFields: [],
    presentFields: [],
    additionalFields: [],
    context: schema["@context"] || null,
  };

  if (isBusinessSchema) {
    // Required fields for local business
    const requiredFields = ["name", "address", "telephone"];

    // Recommended fields for better local SEO
    const recommendedFields = [
      "url",
      "description",
      "image",
      "priceRange",
      "geo",
      "openingHours",
      "areaServed",
    ];

    // Check required fields
    for (const field of requiredFields) {
      if (schema[field] && schema[field] !== "") {
        analysis.presentFields.push(field);
      } else {
        analysis.missingFields.push(field);
      }
    }

    // Check recommended fields
    for (const field of recommendedFields) {
      if (schema[field] && schema[field] !== "") {
        analysis.additionalFields.push(field);
      }
    }

    // Calculate score: 100 points minus 33 for each missing required field
    analysis.score = Math.max(0, 100 - analysis.missingFields.length * 33);

    // Bonus points for additional fields (max 10 points)
    const bonusPoints = Math.min(10, analysis.additionalFields.length * 2);
    analysis.score = Math.min(100, analysis.score + bonusPoints);
  }

  return analysis;
}

// Generate comprehensive schema recommendations
function generateSchemaRecommendations(result, businessData) {
  const recommendations = [...result.recommendations];

  if (!result.hasSchema) {
    // No schema found - provide implementation guidance
    recommendations.push(
      "Implement LocalBusiness schema markup to improve local search visibility",
    );
    recommendations.push(
      "Include business name, full address, and phone number in schema",
    );

    if (businessData.businessName) {
      recommendations.push(
        `Use "${businessData.businessName}" as the business name in schema`,
      );
    }

    if (businessData.city && businessData.state) {
      recommendations.push(
        `Include complete address with ${businessData.city}, ${businessData.state} in schema`,
      );
    }
  } else {
    // Schema found but may need improvements
    if (result.score < 100) {
      if (result.missingFields.includes("address")) {
        recommendations.push("Add complete business address to schema markup");
      }
      if (result.missingFields.includes("telephone")) {
        recommendations.push("Add business phone number to schema markup");
      }
      if (result.missingFields.includes("name")) {
        recommendations.push("Add business name to schema markup");
      }
    }

    // Advanced recommendations for complete schemas
    if (result.score >= 67) {
      recommendations.push(
        "Consider adding business hours (openingHours) to schema",
      );
      recommendations.push(
        "Add business description and service area to schema",
      );
      recommendations.push("Include business logo/image URL in schema markup");
    }
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

module.exports = {
  analyzeSchema,
};
