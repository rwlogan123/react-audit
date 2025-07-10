// File: src/components/shared/DashboardHeader.jsx
import React, { useState } from 'react';

const colors = {
  primary: "#2A3B4A",
  white: "#FFFFFF",
  lightGray: "#E1E1E1",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const MetricCard = ({ title, value, subtitle, status, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    switch (status) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'danger': return colors.danger;
      case 'info': return colors.info;
      default: return colors.primary;
    }
  };

  return (
    <div
      style={{
        background: isHovered ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
        padding: "20px",
        borderRadius: "12px",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        transform: isHovered ? "translateY(-2px)" : "translateY(0)",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ fontSize: "13px", opacity: "0.8", color: colors.white, marginBottom: "8px" }}>
        {title}
      </div>
      <div style={{ fontSize: "36px", fontWeight: "bold", color: colors.white, marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "12px", color: getStatusColor(), fontWeight: "600" }}>
        {subtitle}
      </div>
    </div>
  );
};

const DashboardHeader = ({ 
  title,
  subtitle,
  businessName,
  location,
  metrics = [],
  user = null,
  userPlan = null,
  onMetricClick = () => {},
  onGenerateTest = null,
  loading = false,
  showLogo = true,
  logoText = "BRANDAIDE",
  headerActions = null
}) => {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
      color: colors.white,
      padding: "40px 20px",
      textAlign: "center",
    }}>
      {/* Top Bar with Logo and User Info */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "1200px",
        margin: "0 auto 32px",
      }}>
        {/* Logo Section */}
        {showLogo && (
          <div style={{
            display: "flex",
            alignItems: "center",
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              marginRight: "16px",
              background: colors.white,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.primary,
              fontWeight: "bold",
              fontSize: "20px",
            }}>
              {logoText.charAt(0)}
            </div>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: "24px", fontWeight: "600" }}>{logoText}</span>
              <div style={{ fontSize: "12px", opacity: "0.8", marginTop: "2px" }}>
                {subtitle || "Dashboard"}
              </div>
            </div>
          </div>
        )}

        {/* User Info */}
        {user && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "14px", fontWeight: "500" }}>
                Welcome back, {user.name}
              </div>
              {userPlan && (
                <div style={{ fontSize: "12px", opacity: "0.8" }}>
                  {userPlan.tier.charAt(0).toUpperCase() + userPlan.tier.slice(1)} Plan
                </div>
              )}
            </div>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "600"
            }}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        )}

        {/* Custom Header Actions */}
        {headerActions}
      </div>

      {/* Main Titles */}
      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
        {title}
      </h1>
      {businessName && location && (
        <h2 style={{ fontSize: "20px", marginBottom: "24px", opacity: "0.9" }}>
          {businessName} - {location}
        </h2>
      )}

      {/* Test Data Button for Development */}
      {onGenerateTest && process.env.NODE_ENV === 'development' && (
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={onGenerateTest}
            disabled={loading}
            style={{
              background: loading ? colors.lightGray : colors.warning,
              color: loading ? '#666' : colors.white,
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Generating...' : '🧪 Generate Test Content'}
          </button>
        </div>
      )}

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(metrics.length, 6)}, 1fr)`,
          gap: "16px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
        className="metric-grid"
        >
          {metrics.map((metric, index) => (
            <MetricCard 
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              status={metric.status}
              onClick={() => onMetricClick(metric.id || metric.title)}
            />
          ))}
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .metric-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardHeader;