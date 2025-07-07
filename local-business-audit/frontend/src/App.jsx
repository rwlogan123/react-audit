console.log("App Version: 1.2 - Using Mock API for Production Demo");
// frontend/src/App.jsx
// Updated with React Router while keeping all existing functionality

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import AuditDashboard from "./components/AuditDashboard";
import ComprehensiveAuditForm from "./components/ComprehensiveAuditForm";
import TabPlayground from "./components/playground/TabPlayground";
import LandingPage from "./components/LandingPage";  // Make sure this component exists
import OnboardingFlowDemo from "./components/tabs/OnboardingFlowDemo"; // Demo version for testing
// TODO: Uncomment these as we create the components
// import PaymentPage from "./components/PaymentPage";
// import OnboardingFlow from "./components/OnboardingFlow";
// import Dashboard from "./components/Dashboard";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  return authToken ? children : <Navigate to="/" />;
};

// Mock API function for local development
const mockAuditAPI = async (formData) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    data: {
      businessName: formData.businessName || "Sample Business",
      location: `${formData.city || "City"}, ${formData.state || "State"}`,
      businessType: formData.businessType || "Business Type",
      visibilityScore: 75,
      localContentScore: 10,
      websiteScore: formData.website ? 55 : 0,
      schemaScore: 0,
      completenessScore: 92,
      currentRank: 3,
      reviewCount: 21,
      rating: 4.8,
      photoCount: 12,
      tier1DirectoryCoverage: 33,
      directoryLinksCount: 6,
      pagespeedAnalysis: { 
        mobileScore: 45, 
        desktopScore: 55 
      },
      socialMediaAnalysis: { 
        socialScore: 30, 
        platforms: formData.businessContext?.socialMedia?.facebook ? ["facebook"] : [].concat(
          formData.businessContext?.socialMedia?.instagram ? ["instagram"] : []
        )
      },
      napAnalysis: { 
        consistencyScore: 40 
      },
      citationAnalysis: { 
        citationCompletionRate: 35,
        tier1Coverage: 33
      },
      pageSpeed: "19.9s",
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
      auditSummary: `${formData.businessName || "Your business"} currently ranks #3 with a 4.8⭐ rating, but critical technical gaps are limiting your visibility potential. Your website's slow speed and missing local SEO are causing you to lose customers to competitors.`,
      rawBusinessData: {
        address: `${formData.address || "Address"}, ${formData.city || "City"}, ${formData.state || "State"}`
      }
    }
  };
};

// Main audit flow component (your existing logic)
function AuditFlow() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  // Handle comprehensive form submission
  const handleFormSubmit = async (formData) => {
    setLoading(true);

    try {
      let data;
      
      // TEMPORARY: Use mock API for both development and production
      // This ensures your demo works on Vercel
      console.log('Using mock API (temporary for demo)');
      data = await mockAuditAPI(formData);
      
      /* 
      // UNCOMMENT THIS SECTION when your Vercel API is ready:
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('github.dev');
      
      if (isDevelopment) {
        console.log('Using mock API for local development');
        data = await mockAuditAPI(formData);
      } else {
        // Use real API in production
        const response = await fetch("/api/audit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch audit results');
        }

        data = await response.json();
      }
      */
      
      // Store the audit results in sessionStorage for use in other components
      sessionStorage.setItem('auditResults', JSON.stringify(data));
      sessionStorage.setItem('businessInfo', JSON.stringify({
        businessName: formData.businessName,
        businessType: formData.businessType,
        location: formData.location,
        primaryGoal: formData.primaryGoal,
        contactInfo: formData.contactInfo,
      }));
      
      setResults(data);
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Sorry, there was an error processing your audit. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset to start over
  const handleStartOver = () => {
    setResults(null);
    sessionStorage.removeItem('auditResults');
    sessionStorage.removeItem('businessInfo');
  };

  // Navigate to playground
  const goToPlayground = () => {
    navigate('/playground');
  };

  // Show results dashboard
  if (results) {
    return (
      <div>
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            zIndex: 1000,
            background: "#10B981",
            color: "white",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
          onClick={goToPlayground}
        >
          🛠️ Tab Playground
        </div>
        <AuditDashboard auditData={results} onStartOver={handleStartOver} />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2A3B4A 0%, #1a2b38 100%)",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔍</div>
          <h2>Analyzing Your Digital Presence...</h2>
          <p>This may take 30-60 seconds</p>
          <div
            style={{
              marginTop: "20px",
              fontSize: "14px",
              opacity: "0.8",
            }}
          >
            Running comprehensive audit across 8 analysis modules
          </div>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "#10B981",
          color: "white",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
        onClick={goToPlayground}
      >
        🛠️ Tab Playground
      </div>
      <ComprehensiveAuditForm onSubmit={handleFormSubmit} isLoading={loading} />
    </div>
  );
}

// Playground wrapper with back button
function PlaygroundWrapper() {
  const navigate = useNavigate();

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "#2A3B4A",
          color: "white",
          padding: "8px 16px",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px",
        }}
        onClick={() => navigate('/')}
      >
        ← Back to Main App
      </div>
      <TabPlayground />
    </div>
  );
}

// Main App component with routing
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<AuditFlow />} />
        <Route path="/playground" element={<PlaygroundWrapper />} />
        <Route path="/upgrade" element={<LandingPage />} />
        <Route path="/onboarding-demo" element={<OnboardingFlowDemo />} />
        
        {/* TODO: Uncomment these as we create the components
        <Route path="/payment" element={<PaymentPage />} />
        */}
        
        {/* Protected Routes - TODO: Uncomment when ready
        <Route path="/onboarding/:conversationId" element={
          <ProtectedRoute>
            <OnboardingFlow />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        */}
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;