const express = require("express");
const router = express.Router();

router.post("/audit", async (req, res) => {
  try {
    console.log("📝 Audit request received:", req.body.businessName);

    await new Promise((resolve) => setTimeout(resolve, 3000));

    const auditResults = {
      businessName: req.body.businessName,
      location: req.body.location,
      website: req.body.website,
      visibilityScore: 79,
      websiteScore: 55,
      localContentScore: 10,
      schemaScore: 0,
      actionItems: {
        critical: [
          {
            task: "Add LocalBusiness schema markup",
            impact: "High",
            effort: "Low",
          },
        ],
      },
      auditSummary: `${req.body.businessName} audit completed successfully!`,
      generatedAt: new Date().toISOString(),
      executionTimeMs: 3000,
    };

    res.json({
      success: true,
      data: auditResults,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Audit processing failed",
      message: error.message,
    });
  }
});

module.exports = router;
