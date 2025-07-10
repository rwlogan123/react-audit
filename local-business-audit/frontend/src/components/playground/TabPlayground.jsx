// frontend/src/components/playground/TabPlayground.jsx
// Use this to test individual tabs in isolation

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuditDashboard from "../../dashboards/AuditDashboard/AuditDashboard"; // Fixed import path

// Mock data structure that matches the API response
const mockData = {
  success: true,
  data: {
    businessName: "LM Finishing and Construction",
    location: "Eagle Mountain, UT",
    businessType: "Carpenter",
    visibilityScore: 75,
    localContentScore: 10,
    websiteScore: 55,
    schemaScore: 0,
    pageSpeed: "19.9s",
    completenessScore: 92,
    currentRank: 3,
    reviewCount: 21,
    rating: 4.8,
    photoCount: 12,
    tier1DirectoryCoverage: 33,
    directoryLinksCount: 6,
    pagespeedAnalysis: { 
      mobileScore: 45, 
      desktopScore: 55,
      metrics: {
        firstContentfulPaint: "3.8s",
        largestContentfulPaint: "19.9s",
        cumulativeLayoutShift: "0",
      },
    },
    socialMediaAnalysis: { 
      socialScore: 30, 
      platforms: ["facebook", "instagram"],
      facebook: "https://www.facebook.com/lm.fconstruction/",
      instagram: "https://www.instagram.com/lm.fconstruction/",
    },
    napAnalysis: { 
      consistencyScore: 40 
    },
    citationAnalysis: { 
      citationCompletionRate: 35,
      tier1Coverage: 33
    },
    actionItems: {
      critical: [
        "Website speed is critically slow",
        "Missing local SEO optimization",
        "No schema markup found"
      ],
      moderate: [
        "Need more Google reviews",
        "Social media presence is weak"
      ]
    },
    competitors: [
      {
        name: "Top Competitor",
        rank: 1,
        reviews: 45,
        rating: 4.9
      },
      {
        name: "Second Competitor", 
        rank: 2,
        reviews: 38,
        rating: 4.7
      }
    ],
    auditSummary: "LM Finishing and Construction currently ranks #3 with a 4.8⭐ rating, but critical technical gaps are limiting your visibility potential. Your website's slow speed and missing local SEO are causing you to lose customers to competitors.",
    rawBusinessData: {
      address: "1760 E Fall St, Eagle Mountain, UT 84005"
    }
  }
};

// Create a wrapper component that can control the AuditDashboard's state
const PlaygroundDashboard = ({ mockData, forcedTab }) => {
  // We'll create a modified version of AuditDashboard inline here
  // since we can't modify the original component's props
  
  const [activeTab, setActiveTab] = useState(forcedTab || "overview");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  // Update active tab when forcedTab changes
  useEffect(() => {
    if (forcedTab) {
      setActiveTab(forcedTab);
    }
  }, [forcedTab]);

  // Copy of the AuditDashboard color scheme
  const colors = {
    primary: "#2A3B4A",
    white: "#FFFFFF",
    lightGray: "#E1E1E1",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  };

  // For playground, we'll just render the AuditDashboard without popup
  return (
    <div style={{ position: 'relative' }}>
      {/* Override message */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: colors.primary,
        color: 'white',
        padding: '12px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontSize: '14px'
      }}>
        🎮 Playground Mode - Popup disabled
      </div>
      
      {/* Render the actual dashboard */}
      <AuditDashboard 
        auditData={mockData}
        onStartOver={() => console.log('Start over clicked')}
      />
    </div>
  );
};

const TabPlayground = () => {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showFullDashboard, setShowFullDashboard] = useState(true);

  const tabs = [
    { id: "overview", name: "Overview", emoji: "📊" },
    { id: "competitors", name: "Competitors", emoji: "🏆" },
    { id: "keywords", name: "Keywords", emoji: "🔍" },
    { id: "google", name: "Google Business", emoji: "📍" },
    { id: "website", name: "Website", emoji: "🌐" },
    { id: "social", name: "Social Media", emoji: "📱" },
    { id: "citations", name: "Citations", emoji: "📋" },
    { id: "action-plan", name: "Action Plan", emoji: "✅" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Enhanced Playground Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #2A3B4A 0%, #1a2b38 100%)",
          color: "#FFFFFF",
          padding: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "12px"
          }}>
            <div>
              <div style={{ fontSize: "24px", fontWeight: "700", marginBottom: "4px" }}>
                🛠️ Tab Playground
              </div>
              <div style={{ fontSize: "14px", opacity: 0.9 }}>
                Test individual tabs with mock data - LM Finishing and Construction
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setShowFullDashboard(!showFullDashboard)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                }}
              >
                {showFullDashboard ? "🎯 Tab Content Only" : "📊 Show Full Dashboard"}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  background: "transparent",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.3)",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#FFFFFF";
                  e.target.style.background = "rgba(255,255,255,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.3)";
                  e.target.style.background = "transparent";
                }}
              >
                ← Back to Main App
              </button>
            </div>
          </div>
          
          {/* Tab Selector */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
              padding: "16px 0",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                style={{
                  background: selectedTab === tab.id ? "#FFFFFF" : "rgba(255,255,255,0.1)",
                  color: selectedTab === tab.id ? "#2A3B4A" : "#FFFFFF",
                  border: selectedTab === tab.id ? "2px solid #FFFFFF" : "2px solid rgba(255,255,255,0.3)",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "600",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
                onMouseEnter={(e) => {
                  if (selectedTab !== tab.id) {
                    e.target.style.background = "rgba(255,255,255,0.2)";
                    e.target.style.borderColor = "rgba(255,255,255,0.5)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTab !== tab.id) {
                    e.target.style.background = "rgba(255,255,255,0.1)";
                    e.target.style.borderColor = "rgba(255,255,255,0.3)";
                  }
                }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        background: "linear-gradient(90deg, #FEF3C7 0%, #FDE68A 100%)",
        borderBottom: "2px solid #F59E0B",
        padding: "16px 20px",
        textAlign: "center",
        fontSize: "14px",
        color: "#92400E",
        fontWeight: "500"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          ⚠️ <strong>Playground Mode:</strong> Testing with mock data for LM Finishing and Construction. 
          {showFullDashboard 
            ? " Showing full dashboard - tabs below are interactive."
            : ` Showing only ${tabs.find(t => t.id === selectedTab)?.name || 'Overview'} tab content.`
          }
        </div>
      </div>

      {/* Render based on mode */}
      {showFullDashboard ? (
        <PlaygroundDashboard mockData={mockData} forcedTab={selectedTab} />
      ) : (
        <div style={{ 
          maxWidth: "1200px", 
          margin: "0 auto", 
          padding: "20px",
          background: "white",
          minHeight: "calc(100vh - 300px)"
        }}>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "700", 
            marginBottom: "24px",
            color: "#2A3B4A",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            {tabs.find(t => t.id === selectedTab)?.emoji} {tabs.find(t => t.id === selectedTab)?.name} Tab Content
          </h2>
          
          <div style={{
            background: "#f8fafc",
            border: "2px dashed #E1E1E1",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            color: "#666"
          }}>
            <p style={{ fontSize: "16px", marginBottom: "20px" }}>
              This would show only the <strong>{tabs.find(t => t.id === selectedTab)?.name}</strong> tab content.
            </p>
            <p style={{ fontSize: "14px", color: "#999" }}>
              In production, this would render the specific tab component with the mock data.
            </p>
            <button
              onClick={() => setShowFullDashboard(true)}
              style={{
                marginTop: "20px",
                background: "#2A3B4A",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Show Full Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Floating Debug Panel */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        background: "rgba(42, 59, 74, 0.95)",
        color: "white",
        padding: "16px",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        fontSize: "12px",
        maxWidth: "250px",
        backdropFilter: "blur(10px)",
      }}>
        <div style={{ fontWeight: "700", marginBottom: "8px", fontSize: "14px" }}>
          🐛 Debug Info
        </div>
        <div style={{ opacity: 0.9 }}>
          <div>Mode: {showFullDashboard ? "Full Dashboard" : "Tab Only"}</div>
          <div>Selected Tab: {selectedTab}</div>
          <div>Mock Business: LM Finishing</div>
          <div>Popup: Disabled in playground</div>
        </div>
      </div>
    </div>
  );
};

export default TabPlayground;