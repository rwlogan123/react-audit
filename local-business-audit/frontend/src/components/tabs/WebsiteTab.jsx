import React from 'react';
import { 
  Smartphone, 
  Globe, 
  MapPin, 
  Building, 
  AlertTriangle,
  Clock,
  Target,
  TrendingUp,
  Code,
  Search,
  Zap,
  BarChart3,
  CheckCircle,
  XCircle
} from 'lucide-react';

// Your app's exact colors
const colors = {
  primary: "#2A3B4A",
  lightGray: "#F5F5F5", 
  white: "#FFFFFF",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B"
};

// Extracted shadow constants
const shadows = {
  card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  small: "0 2px 4px -1px rgba(0, 0, 0, 0.1)"
};

// Reusable style objects
const cardStyle = {
  background: colors.white,
  padding: "24px",
  borderRadius: "12px",
  border: `1px solid ${colors.lightGray}`,
  boxShadow: shadows.card
};

const nestedBoxStyle = {
  borderRadius: "8px",
  padding: "16px",
  boxShadow: shadows.small
};

// Data constants (extracted from hardcoded arrays)
const LOCAL_SEO_ISSUES = [
  'Page title missing "Eagle Mountain"',
  'Meta description lacks local references', 
  'H1/H2 headings without location terms',
  'No Eagle Mountain service pages'
];

const SCHEMA_MISSING = [
  'LocalBusiness schema',
  'Review schema for 5.0⭐ rating',
  'Service schema markup',
  'Contact information structured data'
];

const DESKTOP_METRICS = {
  firstContentfulPaint: "0.9s",
  speedIndex: "2.3s",
  largestContentfulPaint: "3.7s",
  timeToInteractive: "4.1s",
  totalBlockingTime: "120ms",
  cumulativeLayoutShift: "0"
};

// Your exact MetricCard component (with extracted shadows)
const MetricCard = ({ title, value, subtitle, icon: Icon, color, progress }) => (
  <div style={{
    background: colors.white,
    padding: "20px",
    borderRadius: "12px",
    border: `1px solid ${colors.lightGray}`,
    boxShadow: shadows.card,
    textAlign: "center",
    transition: "transform 0.2s ease, box-shadow 0.2s ease"
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = "translateY(-2px)";
    e.target.style.boxShadow = shadows.cardHover;
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = "translateY(0)";
    e.target.style.boxShadow = shadows.card;
  }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "12px" }}>
      <Icon size={20} style={{ color }} />
      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: colors.primary }}>{title}</h4>
    </div>
    <div style={{ fontSize: "24px", fontWeight: "700", color, marginBottom: "4px" }}>{value}</div>
    <div style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>{subtitle}</div>
    <div style={{ width: "100%", height: "4px", backgroundColor: "#E5E7EB", borderRadius: "2px", overflow: "hidden" }}>
      <div style={{
        width: `${progress}%`,
        height: "100%",
        backgroundColor: color,
        transition: "width 0.3s ease"
      }} />
    </div>
  </div>
);

// Your exact ProgressBar component
const ProgressBar = ({ value, color, showLabel = true }) => (
  <div style={{ marginBottom: showLabel ? "16px" : "0" }}>
    {showLabel && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontWeight: "600", color: colors.primary }}>Progress</span>
        <span style={{ fontWeight: "600", color: colors.primary }}>{value}%</span>
      </div>
    )}
    <div style={{ width: "100%", height: "8px", backgroundColor: "#E5E7EB", borderRadius: "4px", overflow: "hidden" }}>
      <div style={{
        width: `${value}%`,
        height: "100%",
        backgroundColor: color || (value >= 80 ? colors.success : value >= 60 ? colors.warning : colors.danger),
        transition: "width 0.3s ease"
      }} />
    </div>
  </div>
);

// Status Badge following your design system
const StatusBadge = ({ status, children }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'excellent': 
      case 'good': 
        return { background: colors.white, color: colors.success, border: `1px solid ${colors.success}` };
      case 'warning': 
        return { background: colors.white, color: colors.warning, border: `1px solid ${colors.warning}` };
      case 'critical': 
        return { background: colors.white, color: colors.danger, border: `1px solid ${colors.danger}` };
      default: 
        return { background: colors.white, color: "#666", border: "1px solid #E5E7EB" };
    }
  };

  const styles = getStatusColors();
  return (
    <span style={{
      padding: "4px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      ...styles
    }}>
      {children}
    </span>
  );
};

// Alert Box using your styling (with extracted shadows)
const AlertBox = ({ type, title, children }) => {
  const typeStyles = {
    danger: { borderLeft: `4px solid ${colors.warning}`, background: "#FEF3C7" },
    opportunity: { borderLeft: `4px solid #3B82F6`, background: "#DBEAFE" },
    consequence: { borderLeft: `4px solid ${colors.danger}`, background: "#FEE2E2" }
  };

  return (
    <div style={{
      padding: "20px",
      margin: "24px 0",
      borderRadius: "12px",
      boxShadow: shadows.card,
      ...typeStyles[type]
    }}>
      <strong style={{ fontSize: "16px", display: "block", marginBottom: "8px" }}>{title}</strong>
      <div>{children}</div>
    </div>
  );
};

const WebsiteTab = ({ data = {} }) => {
  // Provide safe defaults for all data access
  const safeData = {
    businessName: data.businessName || 'LM Finishing and Construction',
    pagespeedAnalysis: {
      mobileScore: data.pagespeedAnalysis?.mobileScore || 55,
      desktopScore: data.pagespeedAnalysis?.desktopScore || 58,
      metrics: data.pagespeedAnalysis?.metrics || {
        firstContentfulPaint: "3.8s",
        speedIndex: "6.0s",
        largestContentfulPaint: "19.9s",
        timeToInteractive: "19.9s",
        totalBlockingTime: "310ms",
        cumulativeLayoutShift: "0"
      }
    },
    pageSpeed: data.pageSpeed || "19.9s",
    localContentScore: data.localContentScore || 10,
    schemaScore: data.schemaScore || 0
  };

  const performanceOverall = Math.round((safeData.pagespeedAnalysis.mobileScore + safeData.pagespeedAnalysis.desktopScore) / 2);
  
  const performanceMetrics = [
    {
      title: "Mobile Speed",
      value: `${safeData.pagespeedAnalysis.mobileScore}/100`,
      trend: safeData.pagespeedAnalysis.mobileScore >= 70 ? "Good" : safeData.pagespeedAnalysis.mobileScore >= 50 ? "Fair" : "Critical",
      description: `Load time: ${safeData.pageSpeed}`,
      performance: safeData.pagespeedAnalysis.mobileScore
    },
    {
      title: "Desktop Speed",
      value: `${safeData.pagespeedAnalysis.desktopScore}/100`,
      trend: safeData.pagespeedAnalysis.desktopScore >= 70 ? "Good" : safeData.pagespeedAnalysis.desktopScore >= 50 ? "Fair" : "Needs work",
      description: "Interactive: 4.1s",
      performance: safeData.pagespeedAnalysis.desktopScore
    },
    {
      title: "Local SEO Score",
      value: `${safeData.localContentScore}/100`,
      trend: safeData.localContentScore >= 70 ? "Good" : safeData.localContentScore >= 40 ? "Fair" : "Critical",
      description: "Missing Eagle Mountain optimization",
      performance: safeData.localContentScore
    },
    {
      title: "Schema Markup",
      value: `${safeData.schemaScore}/100`,
      trend: safeData.schemaScore > 0 ? "Partial" : "Missing",
      description: "No structured data found",
      performance: safeData.schemaScore
    }
  ];

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "24px",
          color: colors.primary,
        }}>
          🌐 Website Performance & Technical SEO
        </h2>
        
        <div style={{
          background: colors.lightGray,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          borderLeft: `4px solid ${colors.primary}`,
          boxShadow: shadows.card,
        }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
            <strong>Website Performance Summary:</strong> Your website faces critical performance challenges with mobile speed at {safeData.pagespeedAnalysis.mobileScore}/100 and desktop at {safeData.pagespeedAnalysis.desktopScore}/100 (average: {performanceOverall}/100). Mobile pages take {safeData.pageSpeed} to load fully. Your local SEO optimization scores {safeData.localContentScore}/100 due to missing "Eagle Mountain" references throughout the site. No schema markup is implemented, limiting search engine understanding of your business.
          </p>
        </div>

        <ProgressBar value={performanceOverall} color={colors.danger} />

        {/* Performance Metrics Dashboard */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}>
          {performanceMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={`${metric.trend} - ${metric.description}`}
              icon={index === 0 ? Smartphone : index === 1 ? Globe : index === 2 ? MapPin : Building}
              color={metric.performance >= 70 ? colors.success : metric.performance >= 50 ? colors.warning : colors.danger}
              progress={metric.performance}
            />
          ))}
        </div>

        {/* Critical Performance Issues Alert */}
        <AlertBox type="consequence" title="🚨 Critical Performance Issues Found:">
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ lineHeight: "1.5" }}>• <strong>Mobile Load Time:</strong> {safeData.pageSpeed} (should be under 3s)</div>
            <div style={{ lineHeight: "1.5" }}>• <strong>Local SEO Gap:</strong> "Eagle Mountain" missing from titles, headings, and content</div>
            <div style={{ lineHeight: "1.5" }}>• <strong>Schema Markup:</strong> Zero structured data implementation</div>
            <div style={{ lineHeight: "1.5" }}>• <strong>Technical Foundation:</strong> Missing critical local business optimization elements</div>
          </div>
        </AlertBox>

        {/* 2x2 Grid Layout: Mobile Performance | Desktop Performance, Local SEO | Schema */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "32px"
        }}>
          {/* Mobile Performance */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <BarChart3 size={20} style={{ color: colors.primary }} />
              <h3 style={{ margin: 0, color: colors.primary }}>📱 Mobile Performance</h3>
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <StatusBadge status="critical">{safeData.pagespeedAnalysis.mobileScore}/100</StatusBadge>
            </div>
            
            <div style={{ display: "grid", gap: "12px" }}>
              {Object.entries(safeData.pagespeedAnalysis.metrics).map(([key, value], index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#666", textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span style={{ 
                    fontWeight: "600", 
                    color: key.includes('Paint') && parseFloat(value) > 2.5 ? colors.danger :
                           key.includes('Interactive') && parseFloat(value) > 3 ? colors.danger :
                           key.includes('Blocking') && parseFloat(value) > 200 ? colors.danger :
                           colors.primary
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Performance Impact */}
            <div style={{ 
              background: "#FEF3C7", 
              border: `1px solid ${colors.warning}`, 
              marginTop: "16px",
              ...nestedBoxStyle
            }}>
              <h4 style={{ color: colors.warning, marginBottom: "8px", fontSize: "14px" }}>📊 Performance Impact</h4>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                • Users typically leave after 3s load time<br/>
                • Current: {safeData.pageSpeed} load time<br/>
                • Significant optimization opportunity available
              </div>
            </div>
          </div>

          {/* Desktop Performance */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <Globe size={20} style={{ color: colors.primary }} />
              <h3 style={{ margin: 0, color: colors.primary }}>🖥️ Desktop Performance</h3>
            </div>
            
            <div style={{ marginBottom: "16px" }}>
              <StatusBadge status="critical">{safeData.pagespeedAnalysis.desktopScore}/100</StatusBadge>
            </div>
            
            <div style={{ display: "grid", gap: "12px" }}>
              {Object.entries(DESKTOP_METRICS).map(([key, value], index) => (
                <div key={index} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "14px", color: "#666", textTransform: "capitalize" }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}:
                  </span>
                  <span style={{ 
                    fontWeight: "600", 
                    color: key.includes('Paint') && parseFloat(value) > 2.5 ? colors.warning :
                           key.includes('Interactive') && parseFloat(value) > 3 ? colors.warning :
                           colors.success
                  }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {/* Desktop Impact */}
            <div style={{ 
              background: "#F0FDF4", 
              border: `1px solid ${colors.success}`, 
              marginTop: "16px",
              ...nestedBoxStyle
            }}>
              <h4 style={{ color: colors.success, marginBottom: "8px", fontSize: "14px" }}>💡 Desktop Analysis</h4>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                • Better than mobile but still needs improvement<br/>
                • Interactive in 4.1s (target: under 3s)<br/>
                • Good layout stability (CLS: 0)
              </div>
            </div>
          </div>

          {/* Local SEO Issues */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <Search size={20} style={{ color: colors.primary }} />
              <h3 style={{ margin: 0, color: colors.primary }}>📍 Local SEO Issues</h3>
            </div>

            <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
              {LOCAL_SEO_ISSUES.map((issue, index) => (
                <div key={index} style={{ display: "flex", alignItems: "start", gap: "8px" }}>
                  <XCircle size={16} style={{ color: colors.danger, marginTop: "2px" }} />
                  <span style={{ fontSize: "14px" }}>{issue}</span>
                </div>
              ))}
            </div>

            {/* Quick Fixes */}
            <div style={{ 
              background: "#F0FDF4", 
              border: `1px solid ${colors.success}`,
              ...nestedBoxStyle
            }}>
              <h4 style={{ color: colors.success, marginBottom: "8px", fontSize: "14px" }}>🚀 Quick Fixes</h4>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                • Add "Eagle Mountain Carpenter" to title<br/>
                • Include city in H1 and H2 headings<br/>
                • Update meta description with location<br/>
                • Potential to improve local SEO score significantly
              </div>
            </div>
          </div>

          {/* Schema Markup Missing */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <Code size={20} style={{ color: colors.primary }} />
              <h3 style={{ margin: 0, color: colors.primary }}>🏗️ Schema Markup Missing</h3>
            </div>

            <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
              {SCHEMA_MISSING.map((item, index) => (
                <div key={index} style={{ display: "flex", alignItems: "start", gap: "8px" }}>
                  <XCircle size={16} style={{ color: colors.danger, marginTop: "2px" }} />
                  <span style={{ fontSize: "14px" }}>{item}</span>
                </div>
              ))}
            </div>

            {/* Schema Benefits */}
            <div style={{ 
              background: "#DBEAFE", 
              border: "1px solid #93C5FD",
              ...nestedBoxStyle
            }}>
              <h4 style={{ color: "#1E40AF", marginBottom: "8px", fontSize: "14px" }}>📈 Implementation Benefits</h4>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                • Show 5.0⭐ rating in search results<br/>
                • Improved local search visibility<br/>
                • Enhanced click-through rates<br/>
                • Implementation time: 2-4 hours
              </div>
            </div>
          </div>
        </div>

        {/* Schema Implementation Example */}
        <div style={{ ...cardStyle, marginBottom: "24px" }}>
          <h3 style={{ color: colors.primary, marginBottom: "16px" }}>📝 LocalBusiness Schema Example</h3>
          <div style={{ background: colors.primary, color: colors.success, padding: "16px", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace", overflow: "auto" }}>
{`{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${safeData.businessName}",
  "description": "Premier carpenter and finishing contractor in Eagle Mountain, UT",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1760 E Fall St",
    "addressLocality": "Eagle Mountain",
    "addressRegion": "UT",
    "postalCode": "84005"
  },
  "telephone": "+1385-500-8437",
  "url": "https://lmfinishing.com/",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "21"
  }
}`}
          </div>
        </div>

        {/* Optimization Roadmap */}
        <div style={cardStyle}>
          <h3 style={{ color: colors.primary, marginBottom: "16px" }}>🗺️ 3-Phase Optimization Roadmap</h3>
          
          <div style={{ display: "grid", gap: "16px" }}>
            {/* Phase 1 */}
            <div style={{ 
              background: colors.lightGray,
              ...nestedBoxStyle
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ background: colors.success, color: "white", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>1</div>
                <h4 style={{ margin: 0, color: colors.primary, fontSize: "16px" }}>Local SEO Foundation (Week 1)</h4>
              </div>
              <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                <strong>Tasks (2-3 hours):</strong> Update page title with "Eagle Mountain" • Add city to headings • Include location in meta descriptions<br/>
                <strong>Results:</strong> Improved local SEO optimization and search visibility
              </div>
            </div>

            {/* Phase 2 */}
            <div style={{ 
              background: colors.lightGray,
              ...nestedBoxStyle
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <div style={{ background: "#3B82F6", color: "white", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>2</div>
                <h4 style={{ margin: 0, color: colors.primary, fontSize: "16px" }}>Technical Implementation (Week 2)</h4>
              </div>
              <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                <strong>Tasks (4-6 hours):</strong> Implement LocalBusiness schema • Add review schema • Optimize images • Enable caching<br/>
                <strong>Results:</strong> Enhanced website performance and search engine understanding
              </div>
            </div>

            {/* Summary */}
            <div style={{ 
              background: "#DBEAFE", 
              border: "1px solid #93C5FD",
              ...nestedBoxStyle
            }}>
              <h4 style={{ color: "#1E40AF", marginBottom: "8px" }}>📋 Implementation Summary: Professional optimization approach • 12-16h total work • 2-3 weeks timeline</h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteTab;