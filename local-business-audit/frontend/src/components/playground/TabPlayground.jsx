// frontend/src/components/playground/TabPlayground.jsx
// Use this to test individual tabs in isolation

import { useState } from "react";
import DigitalAuditReport from "../AuditDashboard";

// Mock data for testing (replace with your actual API response structure)
const mockData = {
  businessName: "LM Finishing and Construction",
  location: "Eagle Mountain, UT",
  rating: 5,
  reviewCount: 21,
  photoCount: 29,
  currentRank: 1,
  completenessScore: 92,
  visibilityScore: 79,
  localContentScore: 10,
  websiteScore: 55,
  schemaScore: 0,
  pageSpeed: "19.9s",
  tier1DirectoryCoverage: 33,
  criticalCitationScore: 33,
  directoryLinksCount: 6,
  avgCompetitorRating: 4.9,
  avgCompetitorReviews: 31,
  pagespeedAnalysis: {
    mobileScore: 55,
    desktopScore: 58,
    metrics: {
      firstContentfulPaint: "3.8s",
      largestContentfulPaint: "19.9s",
      cumulativeLayoutShift: "0",
    },
  },
  socialMediaAnalysis: {
    socialScore: 50,
    platforms: ["facebook", "instagram"],
    facebook: "https://www.facebook.com/lmfinishing",
    instagram: "https://www.instagram.com/lmfinishing",
  },
  napAnalysis: {
    consistencyScore: 40,
  },
  citationAnalysis: {
    citationCompletionRate: 40,
    tier1Coverage: 33,
  },
  rawBusinessData: {
    address: "1760 E Fall St, Eagle Mountain, UT 84005",
    phone: "+1385-500-8437",
  },
  competitors: [
    {
      title: "LM Finishing and Construction",
      rating: 5,
      reviewCount: 21,
      photoCount: 29,
      domain: "lmfinishing.com",
    },
    {
      title: "GCR Millworks Finish Carpentry",
      rating: 5,
      reviewCount: 75,
      photoCount: 216,
      domain: "www.gcrmillworks.com",
    },
    {
      title: "New Springs Construction LLC",
      rating: 4.8,
      reviewCount: 26,
      photoCount: 51,
      domain: "newspringsconstruction.com",
    },
  ],
  keywordPerformance: {
    totalTrackedKeywords: 15,
    primaryKeyword: "Carpenter",
    topRankingKeywords: [
      {
        keyword: "basement finishing Utah",
        searchVolume: 390,
        competition: "MEDIUM",
      },
      {
        keyword: "basement finishing Draper",
        searchVolume: 70,
        competition: "LOW",
      },
    ],
  },
  topDirectories: ["yelp.com", "bbb.org", "thumbtack.com", "angi.com"],
  actionItems: {
    critical: [
      {
        task: "Fix NAP consistency across all platforms",
        description: "Standardize business name, address, and phone number",
        impact: "High",
        effort: "Medium",
        timeframe: "1-2 weeks",
      },
      {
        task: "Implement LocalBusiness schema markup",
        description:
          "Add structured data to website for better search visibility",
        impact: "High",
        effort: "Low",
        timeframe: "1 week",
      },
    ],
    moderate: [
      {
        task: "Optimize website images for faster loading",
        description: "Compress and resize images to improve page speed",
        impact: "Medium",
        effort: "Medium",
        timeframe: "2-3 weeks",
      },
    ],
    minor: [
      {
        task: "Add FAQ section to Google Business Profile",
        description: "Answer common customer questions",
        impact: "Low",
        effort: "Low",
        timeframe: "1 week",
      },
    ],
  },
};

const TabPlayground = () => {
  const [selectedTab, setSelectedTab] = useState("overview");

  const tabs = [
    { id: "overview", name: "Overview" },
    { id: "competitors", name: "Competitors" },
    { id: "keywords", name: "Keywords" },
    { id: "google", name: "Google Business" },
    { id: "website", name: "Website" },
    { id: "social", name: "Social Media" },
    { id: "citations", name: "Citations" },
    { id: "action-plan", name: "Action Plan" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Tab Selector Header */}
      <div
        style={{
          background: "#2A3B4A",
          color: "#FFFFFF",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}>
          <div style={{ fontSize: "18px", fontWeight: "600" }}>
            🛠️ Tab Playground - Individual Tab Testing
          </div>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "transparent",
              color: "#FFFFFF",
              border: "1px solid #FFFFFF",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            ← Back to Main App
          </button>
        </div>
        
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            justifyContent: "center",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                background: selectedTab === tab.id ? "#FFFFFF" : "transparent",
                color: selectedTab === tab.id ? "#2A3B4A" : "#FFFFFF",
                border: "2px solid #FFFFFF",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Render the actual dashboard component with forced tab */}
      <DigitalAuditReport 
        auditData={mockData} 
        forcedActiveTab={selectedTab}
      />
    </div>
  );
};

export default TabPlayground;