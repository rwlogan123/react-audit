// File: src/dashboards/AuditDashboard/AuditDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../../components/shared/DashboardHeader';
import TabNavigation from '../../components/shared/TabNavigation';
import OverviewTab from './tabs/OverviewTab';
import UpgradePopup from '../../components/UpgradePopup';

const AuditDashboard = ({ auditData, onStartOver }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  console.log("AuditDashboard mounted, showPopup is:", showPopup);

  // Show popup after 7 seconds
  useEffect(() => {
    console.log("Setting up timer for popup...");
    const timer = setTimeout(() => {
      console.log("Showing upgrade popup after 7 seconds");
      setShowPopup(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  // BRANDAIDE color scheme
  const colors = {
    primary: "#2A3B4A",
    white: "#FFFFFF",
    lightGray: "#E1E1E1",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  };

  // Safe data extraction
  const getSafeData = () => {
    if (!auditData) {
      return {
        businessName: "Sample Business",
        location: "Sample Location",
        visibilityScore: 79,
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
        pagespeedAnalysis: { mobileScore: 45, desktopScore: 55 },
        socialMediaAnalysis: { socialScore: 30, platforms: ["facebook", "instagram"] },
        napAnalysis: { consistencyScore: 40 },
        citationAnalysis: { citationCompletionRate: 35, tier1Coverage: 33 },
        actionItems: { critical: [], moderate: [] },
        competitors: [],
        auditSummary: "Sample Business ranks #3 with 4.8⭐ rating, but critical technical gaps are limiting your visibility potential."
      };
    }

    let data = auditData;
    if (auditData.success && auditData.data) {
      data = auditData.data;
    } else if (auditData.data) {
      data = auditData.data;
    }

    return {
      businessName: data.businessName || "Sample Business",
      location: data.location || data.rawBusinessData?.address?.split(",").slice(-2).join(",").trim() || "Sample Location",
      visibilityScore: data.visibilityScore || data.summary?.score || 75,
      localContentScore: data.localContentScore || 10,
      websiteScore: data.websiteScore || 55,
      schemaScore: data.schemaScore || 0,
      pageSpeed: data.pageSpeed || "19.9s",
      completenessScore: data.completenessScore || 92,
      currentRank: data.currentRank || 3,
      reviewCount: data.reviewCount || 21,
      rating: data.rating || 4.8,
      photoCount: data.photoCount || 12,
      tier1DirectoryCoverage: data.tier1DirectoryCoverage || 33,
      directoryLinksCount: data.directoryLinksCount || 6,
      pagespeedAnalysis: data.pagespeedAnalysis || { mobileScore: 45, desktopScore: 55 },
      socialMediaAnalysis: data.socialMediaAnalysis || { socialScore: 30, platforms: ["facebook", "instagram"] },
      napAnalysis: data.napAnalysis || { consistencyScore: 40 },
      citationAnalysis: data.citationAnalysis || { citationCompletionRate: 35, tier1Coverage: 33 },
      actionItems: data.actionItems || { critical: [], moderate: [] },
      competitors: data.competitors || [],
      auditSummary: data.auditSummary || "Your business currently ranks #3 with a 4.8⭐ rating, but critical technical gaps are limiting your visibility potential.",
      ...data
    };
  };

  const data = getSafeData();

  // Store business data in sessionStorage when popup shows
  useEffect(() => {
    if (showPopup) {
      sessionStorage.setItem('businessData', JSON.stringify({
        businessName: data.businessName,
        businessType: data.businessType || "Home Services",
        location: data.location,
        localContentScore: data.localContentScore,
        pagespeedAnalysis: data.pagespeedAnalysis,
        socialMediaAnalysis: data.socialMediaAnalysis,
        citationAnalysis: data.citationAnalysis,
        napAnalysis: data.napAnalysis,
        schemaScore: data.schemaScore,
        websiteScore: data.websiteScore,
        visibilityScore: data.visibilityScore,
        completenessScore: data.completenessScore
      }));
    }
  }, [showPopup, data]);

  // Define tabs
  const tabs = [
    { id: "overview", label: "Overview", emoji: "📊" },
    { id: "competitors", label: "Competitors", emoji: "🏆" },
    { id: "keywords", label: "Keywords", emoji: "🔍" },
    { id: "google", label: "Google", emoji: "📍" },
    { id: "website", label: "Website", emoji: "🌐" },
    { id: "social", label: "Social", emoji: "📱" },
    { id: "citations", label: "Citations", emoji: "📋" },
    { id: "action-plan", label: "Action Plan", emoji: "✅" },
  ];

  // Define metrics for header
  const metrics = [
    {
      id: "visibility",
      title: "Market Position",
      value: `${data.visibilityScore}/100`,
      subtitle: data.visibilityScore >= 80 ? "Excellent" : data.visibilityScore >= 60 ? "Good" : "Needs improvement",
      status: data.visibilityScore >= 80 ? "excellent" : data.visibilityScore >= 60 ? "good" : "critical",
    },
    {
      id: "local-seo",
      title: "Local SEO",
      value: `${data.localContentScore}/100`,
      subtitle: "Need immediate attention",
      status: "critical",
    },
    {
      id: "google-profile",
      title: "Google Profile",
      value: `${data.completenessScore}/100`,
      subtitle: "Strong foundation",
      status: "good",
    },
    {
      id: "website-speed",
      title: "Website Speed",
      value: `${data.pagespeedAnalysis.desktopScore}/100`,
      subtitle: "Optimization needed",
      status: "critical",
    },
    {
      id: "social-media",
      title: "Social Media",
      value: `${data.socialMediaAnalysis.socialScore}/100`,
      subtitle: "Opportunities missed",
      status: "critical",
    },
    {
      id: "citations",
      title: "Citations",
      value: `${data.napAnalysis.consistencyScore}/100`,
      subtitle: "Critical issues found",
      status: "critical",
    }
  ];

  const handleMetricClick = (metricId) => {
    switch (metricId) {
      case "visibility":
        setActiveTab("overview");
        break;
      case "local-seo":
      case "google-profile":
        setActiveTab("google");
        break;
      case "website-speed":
        setActiveTab("website");
        break;
      case "social-media":
        setActiveTab("social");
        break;
      case "citations":
        setActiveTab("citations");
        break;
      default:
        setActiveTab("overview");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab data={data} colors={colors} navigate={navigate} />;
      
      default:
        return (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <h2>{tabs.find(tab => tab.id === activeTab)?.emoji} {tabs.find(tab => tab.id === activeTab)?.label}</h2>
            <p>Content for {activeTab} coming soon...</p>
            <div style={{
              background: colors.lightGray,
              padding: "20px",
              borderRadius: "12px",
              marginTop: "20px",
            }}>
              <p>In your actual project, this will be replaced with:</p>
              <code style={{ 
                background: colors.white, 
                padding: "8px 12px", 
                borderRadius: "4px",
                display: "inline-block",
                marginTop: "8px"
              }}>
                {`<${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}Tab data={data} colors={colors} />`}
              </code>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: "100vh",
      background: "#f8fafc",
    }}>
      {/* Header with Metrics */}
      <DashboardHeader
        title="📊 Digital Audit Results"
        subtitle="Digital Marketing Audit Platform"
        businessName={data.businessName}
        location={data.location}
        metrics={metrics}
        onMetricClick={handleMetricClick}
        logoText="BRANDAIDE"
      />
      
      {/* Tab Navigation */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Tab Content */}
      <div style={{ minHeight: "calc(100vh - 300px)" }}>
        {renderTabContent()}
      </div>
      
      {/* Footer */}
      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", opacity: "0.8" }}>
          © 2024 BRANDAIDE - Digital Marketing Audit Platform
        </div>
      </div>

      {/* Upgrade Popup */}
      <UpgradePopup
        isVisible={showPopup}
        onClose={() => setShowPopup(false)}
        businessData={data}
        colors={colors}
      />
    </div>
  );
};

export default AuditDashboard;