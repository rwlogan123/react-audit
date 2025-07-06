// frontend/src/App.jsx
// Updated with React Router while keeping all existing functionality

import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import AuditDashboard from "./components/AuditDashboard";
import ComprehensiveAuditForm from "./components/ComprehensiveAuditForm";
import TabPlayground from "./components/playground/TabPlayground";
import LandingPage from "./components/LandingPage";  // Make sure this component exists
// TODO: Uncomment these as we create the components
// import PaymentPage from "./components/PaymentPage";
// import OnboardingFlow from "./components/OnboardingFlow";
// import Dashboard from "./components/Dashboard";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const authToken = localStorage.getItem('authToken');
  return authToken ? children : <Navigate to="/" />;
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
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch audit results');
      }

      const data = await response.json();
      
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