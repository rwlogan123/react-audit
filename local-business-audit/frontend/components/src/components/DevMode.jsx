import React, { useState } from 'react';
import ComprehensiveAuditForm from './ComprehensiveAuditForm';
import AuditDashboard from './AuditDashboard';
import colors from './shared/colors';

// Mock data scenarios for testing
const MOCK_SCENARIOS = {
  restaurant: {
    name: "Mario's Pizza Palace",
    data: {
      visibilityScore: 85,
      businessName: "Mario's Pizza Palace",
      currentRank: 2,
      rating: 4.8,
      reviewCount: 156,
      photoCount: 45,
      completenessScore: 92,
      actionItems: {
        critical: ["Fix NAP inconsistencies", "Add missing business hours"],
        moderate: ["Respond to recent reviews", "Add more photos"],
        minor: ["Update business description", "Add FAQ section"]
      },
      competitors: [
        {
          name: "Tony's Italian Kitchen",
          ranking: 1,
          rating: 4.9,
          reviews: 203,
          distance: "0.2 miles",
          strengths: ["More reviews", "Better online presence"],
          weaknesses: ["Higher prices", "Limited parking"]
        },
        {
          name: "Pizza Corner",
          ranking: 3,
          rating: 4.3,
          reviews: 89,
          distance: "0.5 miles",
          strengths: ["Fast delivery", "Good value"],
          weaknesses: ["Fewer reviews", "Basic website"]
        }
      ],
      keywordPerformance: {
        primaryKeywords: ["pizza delivery", "italian restaurant", "best pizza near me"],
        searchVolumes: [2400, 1800, 1200],
        difficulty: [45, 60, 55],
        currentRankings: [2, 5, 8],
        opportunities: ["family restaurant", "pizza catering", "lunch specials"]
      },
      pagespeedAnalysis: {
        desktop: { score: 78, metrics: { "FCP": "1.8s", "LCP": "2.5s", "CLS": "0.1" }},
        mobile: { score: 65, metrics: { "FCP": "2.8s", "LCP": "4.2s", "CLS": "0.15" }},
        recommendations: ["Optimize images", "Enable compression", "Minify CSS/JS"]
      },
      socialMediaAnalysis: {
        platforms: {
          facebook: { present: true, followers: 1200, engagement: "high" },
          instagram: { present: true, followers: 850, engagement: "medium" },
          twitter: { present: false },
          yelp: { present: true, reviews: 156, rating: 4.8 }
        },
        recommendations: ["Post more frequently", "Engage with followers", "Add Twitter presence"]
      },
      citationAnalysis: {
        totalCitations: 45,
        accuracy: 0.89,
        consistent: 40,
        inconsistent: 5,
        missingDirectories: ["Better Business Bureau", "Foursquare"],
        commonIssues: ["Phone format varies", "Hours missing on some sites"]
      }
    }
  },
  
  dentist: {
    name: "Smile Dental Care",
    data: {
      visibilityScore: 72,
      businessName: "Smile Dental Care",
      currentRank: 4,
      rating: 4.6,
      reviewCount: 89,
      photoCount: 23,
      completenessScore: 78,
      actionItems: {
        critical: ["Claim Google Business Profile", "Add business hours"],
        moderate: ["Get more patient reviews", "Add office photos"],
        minor: ["Update services list", "Add insurance information"]
      },
      competitors: [
        {
          name: "Downtown Dental Group",
          ranking: 1,
          rating: 4.8,
          reviews: 145,
          distance: "0.3 miles",
          strengths: ["More reviews", "Modern facility"],
          weaknesses: ["Higher prices", "Limited availability"]
        }
      ],
      keywordPerformance: {
        primaryKeywords: ["dentist near me", "dental cleaning", "emergency dentist"],
        searchVolumes: [3200, 1500, 800],
        difficulty: [55, 40, 65],
        currentRankings: [4, 7, 12],
        opportunities: ["family dentist", "cosmetic dentistry", "dental implants"]
      },
      pagespeedAnalysis: {
        desktop: { score: 82, metrics: { "FCP": "1.5s", "LCP": "2.1s", "CLS": "0.05" }},
        mobile: { score: 75, metrics: { "FCP": "2.2s", "LCP": "3.1s", "CLS": "0.08" }},
        recommendations: ["Optimize images", "Reduce server response time"]
      },
      socialMediaAnalysis: {
        platforms: {
          facebook: { present: true, followers: 450, engagement: "low" },
          instagram: { present: false },
          twitter: { present: false },
          yelp: { present: true, reviews: 89, rating: 4.6 }
        },
        recommendations: ["Add Instagram", "Post patient education content", "Share success stories"]
      },
      citationAnalysis: {
        totalCitations: 32,
        accuracy: 0.75,
        consistent: 24,
        inconsistent: 8,
        missingDirectories: ["Healthgrades", "Vitals", "WebMD"],
        commonIssues: ["Inconsistent practice name", "Missing specialties"]
      }
    }
  },

  lowPerforming: {
    name: "Struggling Business",
    data: {
      visibilityScore: 35,
      businessName: "Old Town Hardware",
      currentRank: 15,
      rating: 3.8,
      reviewCount: 12,
      photoCount: 3,
      completenessScore: 45,
      actionItems: {
        critical: [
          "Claim Google Business Profile",
          "Add business hours and contact info",
          "Get more customer reviews",
          "Add business photos"
        ],
        moderate: [
          "Update business description",
          "Add services and products",
          "Respond to existing reviews"
        ],
        minor: ["Add payment methods", "Update business logo"]
      },
      competitors: [
        {
          name: "Home Depot",
          ranking: 1,
          rating: 4.2,
          reviews: 2850,
          distance: "2.1 miles",
          strengths: ["Massive inventory", "Strong online presence"],
          weaknesses: ["Less personal service", "Further away"]
        }
      ],
      keywordPerformance: {
        primaryKeywords: ["hardware store", "tools", "home improvement"],
        searchVolumes: [1800, 2200, 3500],
        difficulty: [35, 45, 70],
        currentRankings: [15, 20, 25],
        opportunities: ["local hardware store", "tool rental", "keys made"]
      },
      pagespeedAnalysis: {
        desktop: { score: 45, metrics: { "FCP": "3.2s", "LCP": "5.8s", "CLS": "0.25" }},
        mobile: { score: 28, metrics: { "FCP": "5.1s", "LCP": "8.3s", "CLS": "0.35" }},
        recommendations: [
          "Critical: Optimize images - they're too large",
          "Enable compression and caching",
          "Remove unused plugins",
          "Upgrade hosting plan"
        ]
      },
      socialMediaAnalysis: {
        platforms: {
          facebook: { present: false },
          instagram: { present: false },
          twitter: { present: false },
          yelp: { present: true, reviews: 8, rating: 3.5 }
        },
        recommendations: [
          "Create Facebook business page",
          "Start Instagram for DIY tips",
          "Encourage customer photos of projects"
        ]
      },
      citationAnalysis: {
        totalCitations: 8,
        accuracy: 0.50,
        consistent: 4,
        inconsistent: 4,
        missingDirectories: [
          "Google My Business",
          "Yelp", 
          "Yellow Pages",
          "Better Business Bureau",
          "Angie's List"
        ],
        commonIssues: [
          "Business name varies (Hardware vs Hardware Store)",
          "Old phone number on some sites",
          "Missing or incorrect hours"
        ]
      }
    }
  }
};

const DevMode = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // 'form' or 'dashboard'
  const [selectedScenario, setSelectedScenario] = useState('restaurant');
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (formData) => {
    console.log('🔧 DEV: Form submitted with data:', formData);
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsLoading(false);
      setCurrentView('dashboard');
    }, 1500);
  };

  const switchScenario = (scenarioKey) => {
    setSelectedScenario(scenarioKey);
    console.log(`🔧 DEV: Switched to ${MOCK_SCENARIOS[scenarioKey].name} scenario`);
  };

  const currentScenario = MOCK_SCENARIOS[selectedScenario];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Dev Controls Header */}
      <div style={{
        background: colors.primary,
        color: 'white',
        padding: '15px 20px',
        borderBottom: '3px solid #1a252f'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>🔧 Development Mode</h2>
          
          {/* View Toggle */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setCurrentView('form')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: currentView === 'form' ? 'white' : 'rgba(255,255,255,0.2)',
                color: currentView === 'form' ? colors.primary : 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📝 Form View
            </button>
            <button
              onClick={() => setCurrentView('dashboard')}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                background: currentView === 'dashboard' ? 'white' : 'rgba(255,255,255,0.2)',
                color: currentView === 'dashboard' ? colors.primary : 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📊 Dashboard View
            </button>
          </div>

          {/* Scenario Selector */}
          {currentView === 'dashboard' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px' }}>Test Scenario:</span>
              <select
                value={selectedScenario}
                onChange={(e) => switchScenario(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  fontSize: '14px'
                }}
              >
                <option value="restaurant">🍕 High-Performing Restaurant</option>
                <option value="dentist">🦷 Average Dental Practice</option>
                <option value="lowPerforming">🔧 Struggling Hardware Store</option>
              </select>
            </div>
          )}

          {/* Current Scenario Info */}
          {currentView === 'dashboard' && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              Testing: <strong>{currentScenario.name}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '0' }}>
        {currentView === 'form' ? (
          <ComprehensiveAuditForm onSubmit={handleFormSubmit} loading={isLoading} />
        ) : (
          <AuditDashboard data={currentScenario.data} />
        )}
      </div>

      {/* Dev Info Footer */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>🔧 Dev Mode Active</div>
        <div>View: {currentView === 'form' ? 'Form' : 'Dashboard'}</div>
        {currentView === 'dashboard' && <div>Scenario: {selectedScenario}</div>}
      </div>
    </div>
  );
};

export default DevMode;