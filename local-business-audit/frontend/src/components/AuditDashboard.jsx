import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import UpgradePopup from './UpgradePopup';

const AuditDashboard = ({ auditData, onStartOver }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  console.log("AuditDashboard mounted, showPopup is:", showPopup); // Debug log

  // Show popup after 7 seconds
  useEffect(() => {
    console.log("Setting up timer for popup..."); // Debug log
    const timer = setTimeout(() => {
      console.log("Showing upgrade popup after 7 seconds");
      setShowPopup(true);
    }, 7000);

    return () => clearTimeout(timer);
  }, []); // Empty dependency array ensures this only runs once on mount

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

  // Reusable styles
  const styles = {
    metricBox: {
      background: "rgba(255,255,255,0.1)",
      padding: "20px",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      position: "relative",
    },
    statusBadge: {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap'
    },
    tabButton: {
      background: "none",
      border: "none",
      padding: "16px 20px",
      cursor: "pointer",
      fontSize: "14px",
      fontWeight: "500",
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }
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

  // Helper Components
  const StatusBadge = ({ status, children }) => {
    const getStatusColors = () => {
      switch (status) {
        case 'excellent': 
        case 'good': 
          return { bg: colors.white, text: colors.success, border: colors.success };
        case 'warning': 
          return { bg: colors.white, text: colors.warning, border: colors.warning };
        case 'critical': 
          return { bg: colors.white, text: colors.danger, border: colors.danger };
        default: 
          return { bg: colors.white, text: '#666', border: '#ccc' };
      }
    };

    const statusColors = getStatusColors();
    return (
      <span style={{
        ...styles.statusBadge,
        background: statusColors.bg,
        color: statusColors.text,
        border: `1px solid ${statusColors.border}`
      }}>
        {children}
      </span>
    );
  };

  const MetricBox = ({ title, score, subtitle, status, statusText, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    
    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
      <div
        style={{
          ...styles.metricBox,
          background: isHovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
          transform: isHovered ? "translateY(-2px)" : "translateY(0)",
        }}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={() => {}}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '8px'
        }}>
          <div style={{ fontSize: "13px", opacity: "0.8", color: colors.white }}>{title}</div>
          <StatusBadge status={status}>{statusText}</StatusBadge>
        </div>
        <div style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "8px", color: colors.white }}>
          {score}
        </div>
        <div style={{ 
          fontSize: "11px", 
          opacity: "1",
          fontWeight: "500",
          color: status === 'excellent' || status === 'good' ? colors.success : 
                 status === 'warning' ? colors.warning : colors.danger
        }}>
          {subtitle}
        </div>
      </div>
    );
  };

  // Helper component for analysis cards
  const AnalysisCard = ({ title, color, items, description }) => (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderLeft: `4px solid ${color}`,
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '700',
        color: color,
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {title}
      </h3>
      <div style={{ marginBottom: '16px' }}>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '12px' }}>
            <div style={{ 
              fontSize: '14px', 
              fontWeight: '500', 
              color: colors.primary, 
              marginBottom: '4px' 
            }}>
              {item.label}:
            </div>
            <StatusBadge status={item.status}>{item.value}</StatusBadge>
          </div>
        ))}
      </div>
      <div style={{
        background: color === colors.success ? '#F0FDF4' : 
                   color === colors.danger ? '#FEF2F2' : '#FFFBEB',
        border: `1px solid ${color === colors.success ? '#BBF7D0' : 
                            color === colors.danger ? '#FECACA' : '#FDE68A'}`,
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        color: colors.primary
      }}>
        <strong style={{ color: color }}>{description.title}:</strong> {description.text}
      </div>
    </div>
  );

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

  const metricBoxes = [
    {
      title: "Market Position",
      score: `${data.visibilityScore}/100`,
      subtitle: data.visibilityScore >= 80 ? "Excellent" : data.visibilityScore >= 60 ? "Good" : "Needs improvement",
      status: data.visibilityScore >= 80 ? "excellent" : data.visibilityScore >= 60 ? "good" : "critical",
      statusText: `#${data.currentRank} of 18`,
      onClick: () => setActiveTab("overview")
    },
    {
      title: "Local SEO",
      score: `${data.localContentScore}/100`,
      subtitle: "Need immediate attention",
      status: "critical",
      statusText: "Critical",
      onClick: () => setActiveTab("google")
    },
    {
      title: "Google Profile",
      score: `${data.completenessScore}/100`,
      subtitle: "Strong foundation",
      status: "good",
      statusText: "Strong",
      onClick: () => setActiveTab("google")
    },
    {
      title: "Website Speed",
      score: `${data.pagespeedAnalysis.desktopScore}/100`,
      subtitle: "Optimization needed",
      status: "critical",
      statusText: "Slow",
      onClick: () => setActiveTab("website")
    },
    {
      title: "Social Media",
      score: `${data.socialMediaAnalysis.socialScore}/100`,
      subtitle: "Opportunities missed",
      status: "critical",
      statusText: "Missing",
      onClick: () => setActiveTab("social")
    },
    {
      title: "Citations",
      score: `${data.napAnalysis.consistencyScore}/100`,
      subtitle: "Critical issues found",
      status: "critical",
      statusText: "Critical Gap",
      onClick: () => setActiveTab("citations")
    }
  ];

  const Header = () => (
    <div style={{
      background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
      color: colors.white,
      padding: "40px 20px",
      textAlign: "center",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "20px",
      }}>
        <img
          src="/assets/images/White logo - no background.png"
          alt="BRANDAIDE Logo"
          style={{
            width: "40px",
            height: "40px",
            marginRight: "16px",
            borderRadius: "8px",
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div style={{
          width: "40px",
          height: "40px",
          marginRight: "16px",
          background: colors.white,
          borderRadius: "8px",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
          color: colors.primary,
          fontWeight: "bold",
          fontSize: "20px",
        }}>
          B
        </div>
        <span style={{ fontSize: "24px", fontWeight: "600" }}>BRANDAIDE</span>
      </div>

      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
        📊 Digital Audit Results
      </h1>
      <h2 style={{ fontSize: "20px", marginBottom: "24px", opacity: "0.9" }}>
        {data.businessName} - {data.location}
      </h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}>
        {metricBoxes.map((box, index) => (
          <MetricBox key={index} {...box} />
        ))}
      </div>
    </div>
  );

  const TabNavigation = () => (
    <div style={{
      background: colors.white,
      borderBottom: `1px solid ${colors.lightGray}`,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: "flex",
        overflowX: "auto",
        padding: "0 20px",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tabButton,
              color: activeTab === tab.id ? colors.primary : "#666",
              borderBottom: activeTab === tab.id 
                ? `3px solid ${colors.primary}` 
                : "3px solid transparent",
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );

  // Inline OverviewTab component
  const OverviewTab = ({ data, colors }) => (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "16px",
        color: colors.primary,
      }}>
        Executive Summary
      </h2>
      
      <div style={{
        background: colors.lightGray,
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "24px",
        borderLeft: `4px solid ${colors.primary}`,
      }}>
        <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
          <strong>Bottom Line:</strong> {data.auditSummary} Your Google Business Profile completeness is strong at {data.completenessScore}%, but social media presence is minimal at {data.socialMediaAnalysis.socialScore}% and citation coverage is critically low at {data.napAnalysis.consistencyScore}%. While you lead in quality, competitors are gaining ground through better digital optimization.
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontWeight: '600', color: colors.primary }}>Progress</span>
          <span style={{ fontWeight: '600', color: colors.primary }}>{data.visibilityScore}%</span>
        </div>
        <div style={{
          width: '100%',
          background: colors.lightGray,
          borderRadius: '6px',
          height: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            borderRadius: '6px',
            background: data.visibilityScore >= 80 ? colors.success : 
                       data.visibilityScore >= 60 ? colors.warning : colors.danger,
            width: `${data.visibilityScore}%`,
            transition: 'width 1s ease-in-out'
          }} />
        </div>
      </div>

      {/* Analysis Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <AnalysisCard 
          title="📍 Google Business Profile"
          color={colors.success}
          items={[
            { label: "Rating & Reviews", status: "excellent", value: `${data.rating}⭐ (${data.reviewCount} reviews) - Excellent` },
            { label: "Photos Uploaded", status: "warning", value: `${data.photoCount} photos - Need 8 more` },
            { label: "Profile Completeness", status: "good", value: `${data.completenessScore}% - Very Good` },
            { label: "Recent Activity", status: "critical", value: "No posts in 3 months" }
          ]}
          description={{
            title: "Strength",
            text: "Perfect rating puts you ahead of 90% of competitors. Regular posting could boost visibility significantly."
          }}
        />

        <AnalysisCard 
          title="📱 Social Media Presence"
          color={colors.danger}
          items={[
            { label: "Active Platforms", status: "critical", value: `${data.socialMediaAnalysis.platforms.length} of 4 recommended` },
            { label: "Instagram", status: "good", value: "Active (247 followers)" },
            { label: "Facebook Business", status: "critical", value: "Active but limited" },
            { label: "LinkedIn & YouTube", status: "critical", value: "Missing" }
          ]}
          description={{
            title: "Critical Gap",
            text: `Social score of ${data.socialMediaAnalysis.socialScore}/100 means you're missing significant opportunities for local customer discovery.`
          }}
        />

        <AnalysisCard 
          title="📋 Citations & Directories"
          color={colors.warning}
          items={[
            { label: "Directory Coverage", status: "critical", value: `${data.citationAnalysis.citationCompletionRate}% (${data.directoryLinksCount} of 15 key directories)` },
            { label: "NAP Consistency", status: "critical", value: `${data.napAnalysis.consistencyScore}% - Critical Issues` },
            { label: "Found On", status: "warning", value: "Thumbtack, Angi, Yelp" },
            { label: "Missing From", status: "critical", value: "Apple Maps, Bing, HomeAdvisor" }
          ]}
          description={{
            title: "Impact",
            text: "Missing key directories means you're invisible to 35%+ of local searches. Inconsistent contact info confuses customers."
          }}
        />

        <AnalysisCard 
          title="🌐 Website & Local SEO"
          color={colors.danger}
          items={[
            { label: "Mobile Speed", status: "critical", value: `${data.pagespeedAnalysis.mobileScore}/100 (${data.pageSpeed} load time)` },
            { label: "Desktop Speed", status: "critical", value: `${data.pagespeedAnalysis.desktopScore}/100 (4.1s interactive)` },
            { label: "Local SEO Score", status: "critical", value: `${data.localContentScore}/100 - Critical` },
            { label: "Schema Markup", status: "critical", value: `${data.schemaScore}/100 - Missing` }
          ]}
          description={{
            title: "Critical Issue",
            text: "Website completely missing location keywords in titles and headings. Slow speeds are killing mobile conversions."
          }}
        />
      </div>

      {/* Local Search Optimization Status */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.info}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: colors.info,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔍 Local Search Optimization Status
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <h4 style={{
              fontWeight: '600',
              color: colors.primary,
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              Current Keyword Performance:
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { label: "Local optimization score:", value: `${data.localContentScore}/100` },
                { label: '"Eagle Mountain" in titles:', value: "Missing" },
                { label: "Local service pages:", value: "None" },
                { label: "Keyword visibility:", value: "0/100" }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: colors.primary, fontWeight: '500' }}>{item.label}</span>
                  <StatusBadge status="critical">{item.value}</StatusBadge>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{
              fontWeight: '600',
              color: colors.primary,
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              Immediate Opportunities:
            </h4>
            <ul style={{
              color: '#666',
              paddingLeft: '0',
              margin: 0,
              listStyle: 'none'
            }}>
              {[
                'Add "Eagle Mountain" to website title',
                'Create local service pages',
                'Optimize for "basement finishing Eagle Mountain"',
                'Target "custom carpentry Eagle Mountain"'
              ].map((item, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: colors.info, fontWeight: '700', fontSize: '18px' }}>•</span>
                  <span style={{ fontWeight: '500' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{
          background: '#EBF8FF',
          border: `1px solid #BAE6FD`,
          borderRadius: '8px',
          padding: '16px',
          marginTop: '20px'
        }}>
          <p style={{
            color: colors.primary,
            fontWeight: '500',
            margin: 0
          }}>
            <strong style={{ color: colors.info }}>Quick Win Opportunity:</strong> Simply adding "Eagle Mountain" to your page titles and headings could improve your local content score from {data.localContentScore}/100 to 60/100+ within days.
          </p>
        </div>
      </div>

      {/* Performance Impact Projection */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.success}`,
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: colors.success,
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📈 Optimization Impact Potential
        </h3>
        <p style={{ marginBottom: '16px', color: colors.primary }}>
          Based on current gaps and optimization opportunities:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { value: "85%", label: "Directory Coverage Target", subtitle: `From current ${data.citationAnalysis.citationCompletionRate}%` },
            { value: "100%", label: "NAP Consistency", subtitle: `From current ${data.napAnalysis.consistencyScore}%` },
            { value: "42%", label: "Visibility Gap Found", subtitle: "Technical optimization opportunity" },
            { value: "2-3 weeks", label: "Implementation Timeline", subtitle: "For foundation fixes" }
          ].map((item, index) => (
            <div key={index} style={{
              background: colors.white,
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${colors.lightGray}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.success }}>{item.value}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Button Section */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.primary}`,
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: colors.primary,
          marginBottom: '16px'
        }}>
          🚀 Want us to fix these problems?
        </h3>
        <p style={{ marginBottom: '16px', color: colors.primary }}>
          We found {metricBoxes.filter(box => box.status === 'critical').length} critical issues. 
          Our AI-powered system can create content that solves your customers' problems.
        </p>
        <button 
          onClick={() => navigate('/upgrade')}
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(42, 59, 74, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          See How It Works
        </button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (activeTab === "overview") {
      return <OverviewTab data={data} colors={colors} />;
    }
    
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
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: "100vh",
      background: "#f8fafc",
    }}>
      <Header />
      <TabNavigation />
      <div style={{ minHeight: "calc(100vh - 300px)" }}>
        {renderTabContent()}
      </div>
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

      {/* Add the Upgrade Popup - Fixed version */}
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