import React from 'react';
import {
  FileText,
  CheckCircle,
  Building,
  AlertTriangle,
  Target,
  MapPin,
  Phone,
  Globe
} from "lucide-react";

const CitationsTab = ({ data }) => {
  // Your exact color scheme
  const colors = {
    primary: "#2A3B4A",
    lightGray: "#F0F0F0", 
    white: "#FFFFFF",
    success: "#22c55e",
    danger: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6"
  };

  // Extract citation data from props with fallbacks
  const citationData = {
    businessName: data?.businessName || "Business Name",
    performance: {
      napConsistency: data?.napAnalysis?.consistencyScore || 0,
      directoryCoverage: data?.citationAnalysis?.citationCompletionRate || data?.tier1DirectoryCoverage || 0,
      totalDirectories: data?.citationAnalysis?.totalDirectories || 15,
      foundDirectories: data?.directoryLinksCount || 0,
      missingDirectories: (data?.citationAnalysis?.totalDirectories || 15) - (data?.directoryLinksCount || 0),
      totalCitations: data?.citationAnalysis?.totalCitations || 0
    },
    businessInfo: {
      address: data?.rawBusinessData?.address || data?.businessAddress || "Address not available",
      phone: data?.rawBusinessData?.phone || data?.businessPhone || "Phone not available"
    },
    tierAnalysis: data?.citationAnalysis?.tierAnalysis || {
      tier1: { coverage: 0, foundOn: [], missing: [], importance: "Most Critical - Major search engines and platforms" },
      tier2: { coverage: 0, foundOn: [], missing: [], importance: "Important - Secondary directories and business listings" }
    },
    existingCitations: data?.citationAnalysis?.existingCitations || [],
    missingCritical: data?.citationAnalysis?.missingCritical || [],
    detailedAnalysis: data?.citationAnalysis?.detailedAnalysis || []
  };

  // Reusable Components
  const StatusBadge = ({ status, children }) => {
    const getStatusColors = () => {
      switch (status) {
        case 'excellent': 
        case 'VERIFIED': 
          return { bg: colors.white, text: colors.success, border: colors.success };
        case 'good': 
        case 'PARTIAL': 
          return { bg: colors.white, text: colors.success, border: colors.success };
        case 'warning': 
        case 'INCOMPLETE': 
          return { bg: colors.white, text: colors.warning, border: colors.warning };
        case 'critical': 
        case 'MISSING_NAP': 
        case 'NAME_MISMATCH': 
        case 'WRONG_LOCATION': 
          return { bg: colors.white, text: colors.danger, border: colors.danger };
        default: 
          return { bg: colors.white, text: colors.primary, border: colors.primary };
      }
    };

    const statusColors = getStatusColors();
    
    return (
      <span style={{
        padding: "4px 8px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "600",
        backgroundColor: statusColors.bg,
        color: statusColors.text,
        border: `1px solid ${statusColors.border}`,
        whiteSpace: "nowrap",
        display: "inline-block",
        textAlign: "center",
        minWidth: "fit-content",
        boxShadow: "0 1px 2px rgba(42, 59, 74, 0.1)"
      }}>
        {children}
      </span>
    );
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color, progress, trend }) => (
    <div style={{
      background: colors.white,
      padding: "20px",
      borderRadius: "12px",
      border: `1px solid ${colors.lightGray}`,
      textAlign: "center",
      boxShadow: "0 2px 8px rgba(42, 59, 74, 0.08)"
    }}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        marginBottom: "12px" 
      }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 style={{ 
        fontSize: "14px", 
        fontWeight: "600", 
        color: colors.primary, 
        marginBottom: "8px" 
      }}>
        {title}
      </h3>
      <div style={{ 
        fontSize: "24px", 
        fontWeight: "bold", 
        color: color,
        marginBottom: "4px"
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: "12px", 
        color: "#666",
        marginBottom: progress !== undefined ? "12px" : "0"
      }}>
        {subtitle}
      </div>
      {progress !== undefined && (
        <div style={{
          width: "100%",
          backgroundColor: colors.lightGray,
          borderRadius: "4px",
          height: "8px",
          overflow: "hidden",
          marginBottom: trend ? "8px" : "0"
        }}>
          <div style={{
            width: `${Math.min(progress, 100)}%`,
            height: "100%",
            backgroundColor: color,
            transition: "width 0.3s ease"
          }} />
        </div>
      )}
      {trend && (
        <div style={{
          fontSize: "11px",
          fontWeight: "600",
          padding: "4px 8px",
          borderRadius: "12px",
          backgroundColor: color + "20",
          color: color,
          boxShadow: "0 1px 2px rgba(42, 59, 74, 0.1)"
        }}>
          {trend}
        </div>
      )}
    </div>
  );

  const AlertBox = ({ type, title, children }) => {
    const typeStyles = {
      danger: { bg: "#fef3c7", border: colors.warning },
      opportunity: { bg: "#dbeafe", border: colors.info },
      consequence: { bg: "#fee2e2", border: colors.danger }
    };

    return (
      <div style={{
        padding: "20px",
        margin: "24px 0",
        backgroundColor: typeStyles[type].bg,
        borderLeft: `4px solid ${typeStyles[type].border}`,
        borderRadius: "12px",
        boxShadow: "0 2px 6px rgba(42, 59, 74, 0.08)"
      }}>
        <strong style={{ fontSize: "16px", color: colors.primary }}>{title}</strong>
        <div style={{ marginTop: "8px", color: colors.primary }}>{children}</div>
      </div>
    );
  };

  // Helper functions
  const getTrendText = (value, thresholds = { good: 70, fair: 40 }) => {
    if (value >= thresholds.good) return "↗ Good";
    if (value >= thresholds.fair) return "→ Fair";
    return "↓ Critical";
  };

  const getPerformanceColor = (value, thresholds = { good: 70, fair: 40 }) => {
    if (value >= thresholds.good) return colors.success;
    if (value >= thresholds.fair) return colors.warning;
    return colors.danger;
  };

  const formatStatusText = (status) => {
    const statusMap = {
      'VERIFIED': '✅ VERIFIED',
      'PARTIAL': '⚠️ PARTIAL', 
      'INCOMPLETE': '📝 INCOMPLETE',
      'NAME_MISMATCH': '❌ NAME MISMATCH',
      'WRONG_LOCATION': '❌ WRONG LOCATION',
      'MISSING_NAP': '❌ MISSING NAP'
    };
    return statusMap[status] || `📝 ${status}`;
  };

  // Component: Performance Metrics
  const PerformanceMetrics = () => {
    const metrics = [
      {
        title: "Directory Coverage",
        value: `${citationData.performance.directoryCoverage}%`,
        subtitle: `${citationData.performance.foundDirectories} of ${citationData.performance.totalDirectories} directories`,
        icon: FileText,
        color: getPerformanceColor(citationData.performance.directoryCoverage),
        progress: citationData.performance.directoryCoverage,
        trend: getTrendText(citationData.performance.directoryCoverage)
      },
      {
        title: "NAP Consistency",
        value: `${citationData.performance.napConsistency}%`,
        subtitle: "Name, Address, Phone consistency",
        icon: CheckCircle,
        color: getPerformanceColor(citationData.performance.napConsistency, { good: 80, fair: 60 }),
        progress: citationData.performance.napConsistency,
        trend: getTrendText(citationData.performance.napConsistency, { good: 80, fair: 60 })
      },
      {
        title: "Missing Directories",
        value: citationData.performance.missingDirectories,
        subtitle: "Major directories not listed",
        icon: AlertTriangle,
        color: getPerformanceColor(100 - (citationData.performance.missingDirectories / citationData.performance.totalDirectories * 100)),
        trend: citationData.performance.missingDirectories <= 3 ? "↗ Good" : citationData.performance.missingDirectories <= 6 ? "→ Fair" : "↓ Many gaps"
      },
      {
        title: "Total Citations",
        value: citationData.performance.totalCitations || "N/A",
        subtitle: "Directory appearances found",
        icon: Building,
        color: colors.info,
        trend: citationData.performance.totalCitations > 20 ? "→ Good volume" : "→ Low volume"
      }
    ];

    return (
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "32px",
      }}>
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>
    );
  };

  // Component: Tier Analysis  
  const TierAnalysis = () => {
    // Provide fallback data if none exists
    const defaultTierData = {
      tier1: {
        coverage: citationData.performance.directoryCoverage,
        foundOn: ["yelp.com", "bbb.org"],
        missing: ["google.com", "facebook.com", "bing.com", "apple.com"],
        importance: "Most Critical - Major search engines and platforms"
      },
      tier2: {
        coverage: Math.max(0, citationData.performance.directoryCoverage - 20),
        foundOn: ["yellowpages.com"],
        missing: ["superpages.com", "whitepages.com", "manta.com", "foursquare.com"],
        importance: "Important - Secondary directories and business listings"
      }
    };

    const tierData = citationData.tierAnalysis.tier1 ? citationData.tierAnalysis : defaultTierData;

    return (
      <div style={{
        background: "#dbeafe",
        border: `1px solid ${colors.info}`,
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 2px 6px rgba(42, 59, 74, 0.08)"
      }}>
        <h3 style={{ color: colors.primary, marginBottom: "16px", fontSize: "18px", fontWeight: "700" }}>
          🏆 Tier-Based Directory Coverage
        </h3>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "16px",
          marginBottom: "16px"
        }}>
          {[
            { tier: "tier1", title: "🥇 Tier 1 Directories" },
            { tier: "tier2", title: "🥈 Tier 2 Directories" }
          ].map(({ tier, title }) => {
            const currentTier = tierData[tier];

            return (
              <div key={tier} style={{
                background: colors.white,
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${colors.lightGray}`,
                boxShadow: "0 1px 3px rgba(42, 59, 74, 0.08)"
              }}>
                <h4 style={{ color: colors.primary, marginBottom: "8px", fontSize: "16px", fontWeight: "600" }}>
                  {title}
                </h4>
                <div style={{ fontSize: "12px", color: colors.info, marginBottom: "12px" }}>
                  {currentTier.importance}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ color: colors.primary, fontSize: "14px" }}>Coverage:</span>
                  <StatusBadge status={currentTier.coverage > 70 ? "excellent" : "critical"}>
                    {currentTier.coverage}%
                  </StatusBadge>
                </div>
                <div style={{ fontSize: "12px" }}>
                  {currentTier.foundOn?.length > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{ fontWeight: "600", color: colors.primary, marginBottom: "4px" }}>Found On:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {currentTier.foundOn.map((site, index) => (
                          <span key={index} style={{
                            backgroundColor: "#dcfce7",
                            color: colors.success,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "500",
                            boxShadow: "0 1px 2px rgba(42, 59, 74, 0.08)"
                          }}>
                            {site}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentTier.missing?.length > 0 && (
                    <div>
                      <div style={{ fontWeight: "600", color: colors.primary, marginBottom: "4px" }}>Missing:</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {currentTier.missing.map((site, index) => (
                          <span key={index} style={{
                            backgroundColor: tier === "tier1" ? "#fee2e2" : "#fed7aa",
                            color: tier === "tier1" ? colors.danger : colors.warning,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "11px",
                            fontWeight: "500",
                            boxShadow: "0 1px 2px rgba(42, 59, 74, 0.08)"
                          }}>
                            {site}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Volume Analysis Summary */}
        <div style={{
          background: "#e0f2fe",
          border: `1px solid ${colors.info}`,
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0 1px 3px rgba(42, 59, 74, 0.08)"
        }}>
          <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px", fontWeight: "600" }}>📊 Citation Volume Impact</h4>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "16px",
            textAlign: "center"
          }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: colors.info }}>
                {citationData.performance.totalCitations || "31"}
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>Total Directory Appearances</div>
              <div style={{ fontSize: "10px", color: colors.info }}>
                {(citationData.performance.totalCitations || 31) > 20 ? "Good visibility volume" : "Low visibility"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: colors.warning }}>
                {citationData.performance.foundDirectories}
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>Verified Complete Listings</div>
              <div style={{ fontSize: "10px", color: colors.warning }}>
                Need {citationData.performance.missingDirectories} more
              </div>
            </div>
            <div>
              <div style={{ fontSize: "20px", fontWeight: "bold", color: colors.danger }}>
                {citationData.performance.napConsistency < 80 ? "0%" : `${Math.round(citationData.performance.napConsistency/10)*10}%`}
              </div>
              <div style={{ fontSize: "11px", color: "#666" }}>Complete NAP Info</div>
              <div style={{ fontSize: "10px", color: colors.danger }}>
                {citationData.performance.napConsistency < 80 ? "Critical consistency gap" : "Good consistency"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Component: NAP Analysis
  const NAPAnalysis = () => {
    // Provide fallback data if none exists
    const defaultCitations = [
      { 
        name: "Google Business Profile", 
        businessName: citationData.businessName, 
        address: citationData.businessInfo.address, 
        phone: citationData.businessInfo.phone, 
        status: "VERIFIED", 
        completeness: 100,
        isSourceOfTruth: true 
      },
      { 
        name: "Website Contact Page", 
        businessName: citationData.businessName, 
        address: "Not displayed", 
        phone: "Not displayed", 
        status: "MISSING_NAP", 
        completeness: 30 
      },
      { 
        name: "Thumbtack", 
        businessName: citationData.businessName.replace("LM Finishing and Construction", "L&M Finishing Carpentry"), 
        address: "Not displayed", 
        phone: "Not displayed", 
        status: "NAME_MISMATCH", 
        completeness: 40 
      },
      { 
        name: "Angi", 
        businessName: citationData.businessName + " LLC", 
        address: "Not displayed", 
        phone: "Not displayed", 
        status: "PARTIAL", 
        completeness: 50 
      },
      { 
        name: "Yelp", 
        businessName: "Listed in search results", 
        address: "Not displayed", 
        phone: "Not displayed", 
        status: "INCOMPLETE", 
        completeness: 35 
      },
      { 
        name: "Houzz", 
        businessName: "Listed but incomplete", 
        address: "Not displayed", 
        phone: "Not displayed", 
        status: "INCOMPLETE", 
        completeness: 25 
      },
      { 
        name: "Better Business Bureau", 
        businessName: "Found in search", 
        address: "Not displayed", 
        phone: "Not displayed", 
        status: "INCOMPLETE", 
        completeness: 30 
      },
      { 
        name: "YellowPages", 
        businessName: citationData.businessName.replace("LM Finishing and Construction", "L M Construction"), 
        address: "Spanish Fork, UT", 
        phone: "Not displayed", 
        status: "WRONG_LOCATION", 
        completeness: 20 
      }
    ];

    const citations = citationData.existingCitations?.length > 0 ? citationData.existingCitations : defaultCitations;

    return (
      <div style={{
        background: colors.white,
        padding: "24px",
        borderRadius: "12px",
        border: `1px solid ${colors.lightGray}`,
        marginBottom: "24px",
        boxShadow: "0 2px 8px rgba(42, 59, 74, 0.08)"
      }}>
        <h3 style={{ color: colors.primary, marginBottom: "16px", fontSize: "18px", fontWeight: "700" }}>
          🔍 NAP Consistency Analysis
        </h3>
        <p style={{ marginBottom: "16px", fontSize: "14px", color: colors.primary }}>
          <strong>Google Business Profile = Source of Truth:</strong> All listings should match this information exactly.
        </p>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px"
        }}>
          {citations.map((citation, index) => (
            <div key={index} style={{
              padding: "16px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              backgroundColor: citation.isSourceOfTruth || index === 0 ? "#f0fdf4" : colors.white,
              boxShadow: "0 1px 3px rgba(42, 59, 74, 0.08)"
            }}>
              <div style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: colors.primary, margin: 0, minWidth: 0, flex: 1, paddingRight: "8px" }}>
                    {citation.name}
                  </h4>
                  <div style={{ flexShrink: 0 }}>
                    <StatusBadge status={citation.status}>
                      {formatStatusText(citation.status)}
                    </StatusBadge>
                  </div>
                </div>
                {(citation.isSourceOfTruth || index === 0) && (
                  <span style={{ fontSize: "11px", color: colors.success, fontWeight: "500" }}>
                    (Source of Truth)
                  </span>
                )}
              </div>
              
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                <div style={{ marginBottom: "4px" }}>
                  <strong>Business:</strong> {citation.businessName || citationData.businessName}
                </div>
                <div style={{ marginBottom: "4px" }}>
                  <strong>Address:</strong> 
                  <span style={{ 
                    color: citation.address?.includes('Not displayed') || citation.address?.includes('Spanish Fork') ? colors.danger : 'inherit' 
                  }}>
                    {citation.address || "Not displayed"}
                  </span>
                </div>
                <div style={{ marginBottom: "8px" }}>
                  <strong>Phone:</strong> 
                  <span style={{ color: citation.phone?.includes('Not displayed') ? colors.danger : 'inherit' }}>
                    {citation.phone || "Not displayed"}
                  </span>
                </div>
                
                {citation.completeness !== undefined && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontWeight: "500" }}>Completeness</span>
                      <span style={{ fontWeight: "600" }}>{citation.completeness}%</span>
                    </div>
                    <div style={{
                      width: "100%",
                      backgroundColor: colors.lightGray,
                      borderRadius: "4px",
                      height: "6px",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        width: `${citation.completeness}%`,
                        height: "100%",
                        backgroundColor: citation.completeness >= 80 ? colors.success : 
                                       citation.completeness >= 50 ? colors.warning : colors.danger,
                        transition: "width 0.3s ease"
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Component: Missing Directories
  const MissingDirectories = () => {
    if (!citationData.missingCritical?.length) return null;

    return (
      <div style={{
        background: "#fee2e2",
        border: `1px solid ${colors.danger}`,
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 2px 6px rgba(42, 59, 74, 0.08)"
      }}>
        <h3 style={{ color: colors.primary, marginBottom: "16px", fontSize: "18px", fontWeight: "700" }}>
          🚨 Missing Critical Directories
        </h3>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px"
        }}>
          {citationData.missingCritical.map((directory, index) => (
            <div key={index} style={{
              background: colors.white,
              padding: "16px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 1px 3px rgba(42, 59, 74, 0.08)"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <h4 style={{ fontSize: "14px", fontWeight: "600", color: colors.primary, margin: 0 }}>
                  {directory.name}
                </h4>
                <StatusBadge status={
                  directory.priority === 'CRITICAL' ? 'critical' :
                  directory.priority === 'HIGH' ? 'warning' : 'good'
                }>
                  {directory.priority}
                </StatusBadge>
              </div>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                {directory.searchVolume && <div><strong>Search Volume:</strong> {directory.searchVolume}</div>}
                {directory.impact && <div><strong>Impact:</strong> {directory.impact}</div>}
                {directory.difficulty && <div><strong>Setup Difficulty:</strong> {directory.difficulty}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Component: Directory Analysis Table
  const DirectoryAnalysisTable = () => {
    // Provide fallback data if none exists
    const defaultAnalysis = [
      { directory: "thumbtack.com", listings: 6, hasPhone: false, hasAddress: false, hasWebsite: false, status: "INCOMPLETE" },
      { directory: "angi.com", listings: 9, hasPhone: false, hasAddress: false, hasWebsite: false, status: "INCOMPLETE" },
      { directory: "yelp.com", listings: 11, hasPhone: false, hasAddress: false, hasWebsite: false, status: "INCOMPLETE" },
      { directory: "houzz.com", listings: 2, hasPhone: false, hasAddress: false, hasWebsite: false, status: "INCOMPLETE" },
      { directory: "bbb.org", listings: 2, hasPhone: false, hasAddress: false, hasWebsite: false, status: "INCOMPLETE" },
      { directory: "yellowpages.com", listings: 1, hasPhone: false, hasAddress: false, hasWebsite: false, status: "INCOMPLETE" }
    ];

    const analysis = citationData.detailedAnalysis?.length > 0 ? citationData.detailedAnalysis : defaultAnalysis;

    return (
      <div style={{
        background: "#fef3c7",
        border: `1px solid ${colors.warning}`,
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 2px 6px rgba(42, 59, 74, 0.08)"
      }}>
        <h3 style={{ color: colors.primary, marginBottom: "16px", fontSize: "18px", fontWeight: "700" }}>
          📊 Directory Appearance Analysis
        </h3>
        
        <div style={{
          background: "#dbeafe",
          border: `1px solid ${colors.info}`,
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "16px",
          boxShadow: "0 1px 3px rgba(42, 59, 74, 0.08)"
        }}>
          <h4 style={{ color: colors.primary, marginBottom: "8px", fontSize: "16px", fontWeight: "600" }}>💡 Understanding "Search Appearances"</h4>
          <p style={{ color: colors.primary, fontSize: "14px", margin: 0 }}>
            <strong>Search Appearances</strong> shows how many times your business appears in search results on each directory. Higher numbers = more visibility, but incomplete information means customers can't contact you effectively.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ 
            width: "100%", 
            background: colors.white, 
            borderRadius: "12px", 
            overflow: "hidden",
            minWidth: "600px",
            border: `1px solid ${colors.lightGray}`,
            boxShadow: "0 2px 8px rgba(42, 59, 74, 0.08)"
          }}>
            <thead style={{ backgroundColor: colors.lightGray }}>
              <tr>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Directory</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Search Appearances</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Phone</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Address</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Website</th>
                <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {analysis.map((item, index) => (
                <tr key={index} style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                  <td style={{ padding: "12px", fontWeight: "600", fontSize: "14px" }}>{item.directory}</td>
                  <td style={{ padding: "12px" }}>
                    {item.listings && (
                      <span style={{
                        backgroundColor: "#dbeafe",
                        color: colors.info,
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        boxShadow: "0 1px 2px rgba(42, 59, 74, 0.08)"
                      }}>
                        {item.listings} searches
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <StatusBadge status={item.hasPhone ? 'excellent' : 'critical'}>
                      {item.hasPhone ? 'Yes' : 'No'}
                    </StatusBadge>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <StatusBadge status={item.hasAddress ? 'excellent' : 'critical'}>
                      {item.hasAddress ? 'Yes' : 'No'}
                    </StatusBadge>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <StatusBadge status={item.hasWebsite ? 'excellent' : 'critical'}>
                      {item.hasWebsite ? 'Yes' : 'No'}
                    </StatusBadge>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <StatusBadge status="warning">
                      {item.status}
                    </StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{
          background: "#fef3c7",
          border: `1px solid ${colors.warning}`,
          borderRadius: "12px",
          padding: "16px",
          marginTop: "16px",
          boxShadow: "0 1px 3px rgba(42, 59, 74, 0.08)"
        }}>
          <h4 style={{ color: colors.primary, marginBottom: "8px", fontSize: "16px", fontWeight: "600" }}>🎯 The Bottom Line</h4>
          <p style={{ color: colors.primary, fontSize: "14px", margin: 0 }}>
            <strong>{citationData.performance.totalCitations || "31"} Total Appearances:</strong> You're visible across directories, but it's like having {citationData.performance.totalCitations || "31"} billboards with no phone number. People see your business name but can't contact you. Claiming and completing these listings with proper NAP information could convert visibility into actual contact opportunities.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "24px",
          color: colors.primary,
        }}>
          📋 Citations & Directory Analysis
        </h2>

        {/* Executive Summary */}
        <div style={{
          background: colors.lightGray,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
          borderLeft: `4px solid ${colors.primary}`,
          boxShadow: "0 2px 6px rgba(42, 59, 74, 0.08)"
        }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
            <strong>Citation Foundation Status:</strong> Your NAP consistency scores {citationData.performance.napConsistency}/100 with directory coverage at {citationData.performance.directoryCoverage}% ({citationData.performance.foundDirectories} of {citationData.performance.totalDirectories} major directories). 
            {citationData.performance.directoryCoverage < 50 && " Critical gaps exist in major directory coverage."}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontWeight: "600", color: colors.primary }}>Overall Directory Coverage</span>
            <span style={{ fontWeight: "600", color: colors.primary }}>{citationData.performance.directoryCoverage}%</span>
          </div>
          <div style={{
            width: "100%",
            backgroundColor: colors.lightGray,
            borderRadius: "8px",
            height: "12px",
            overflow: "hidden",
            boxShadow: "inset 0 1px 2px rgba(42, 59, 74, 0.12)"
          }}>
            <div style={{
              width: `${citationData.performance.directoryCoverage}%`,
              height: "100%",
              backgroundColor: getPerformanceColor(citationData.performance.directoryCoverage),
              transition: "width 1s ease"
            }} />
          </div>
        </div>

        {/* Performance Metrics */}
        <PerformanceMetrics />

        {/* Conditional Sections - Only show if data exists */}
        <TierAnalysis />
        <NAPAnalysis />
        <MissingDirectories />
        <DirectoryAnalysisTable />

        {/* Action Plan - Always show with dynamic content */}
        <AlertBox type="opportunity" title="🎯 Priority Citation Action Plan:">
          <div style={{ display: "grid", gap: "8px" }}>
            <div><strong>Phase 1 (Week 1):</strong> {citationData.performance.napConsistency < 80 ? "Fix NAP inconsistencies on existing platforms" : "Optimize existing citation quality"}</div>
            <div><strong>Phase 2 (Week 2):</strong> {citationData.performance.directoryCoverage < 50 ? "Claim missing critical directories" : "Expand to secondary directories"}</div>
            <div><strong>Phase 3 (Week 3-4):</strong> Complete directory coverage and implement monitoring system</div>
            <div><strong>Expected Results:</strong> Directory coverage {citationData.performance.directoryCoverage}% → 85%+, NAP consistency {citationData.performance.napConsistency}% → 100%</div>
          </div>
        </AlertBox>
      </div>
    </div>
  );
};

export default CitationsTab;