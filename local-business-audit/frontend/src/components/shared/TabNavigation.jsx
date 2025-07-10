// File: src/components/shared/TabNavigation.jsx
import React from 'react';

const colors = {
  primary: "#2A3B4A",
  white: "#FFFFFF",
  lightGray: "#E1E1E1",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

const StatusBadge = ({ status, children }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#D97706' };
      case 'approved':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B' };
      case 'good':
        return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'warning':
        return { bg: '#FEF3C7', color: '#D97706' };
      case 'critical':
        return { bg: '#FEE2E2', color: '#991B1B' };
      case 'excellent':
        return { bg: '#D1FAE5', color: '#065F46' };
      default:
        return { bg: colors.lightGray, color: '#666' };
    }
  };

  const style = getStatusStyle();
  
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
};

const TabNavigation = ({ 
  tabs = [], 
  activeTab = 'overview', 
  onTabChange = () => {},
  sticky = true
}) => {
  
  return (
    <div style={{
      background: colors.white,
      borderBottom: `1px solid ${colors.lightGray}`,
      position: sticky ? "sticky" : "static",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        display: "flex",
        overflowX: "auto",
        padding: "0 20px",
        maxWidth: "1200px",
        margin: "0 auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitScrollbar: { display: "none" }
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.inactive && onTabChange(tab.id)}
            style={{
              background: "none",
              border: "none",
              padding: "16px 20px",
              cursor: tab.inactive ? 'not-allowed' : 'pointer',
              fontSize: "14px",
              fontWeight: "500",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: activeTab === tab.id ? colors.primary : tab.inactive ? '#ccc' : "#666",
              borderBottom: activeTab === tab.id 
                ? `3px solid ${colors.primary}` 
                : "3px solid transparent",
              opacity: tab.inactive ? 0.6 : 1,
              transition: "all 0.2s ease",
              minWidth: "fit-content"
            }}
            disabled={tab.inactive}
            title={tab.description}
          >
            <span style={{ 
              opacity: tab.inactive ? 0.5 : 1,
              fontSize: "16px" 
            }}>
              {tab.emoji}
            </span>
            <span>{tab.label}</span>
            
            {/* Content Count Badge */}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? colors.primary : colors.lightGray,
                color: activeTab === tab.id ? colors.white : "#666",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: "12px",
                fontWeight: "600",
                minWidth: "24px",
                textAlign: "center"
              }}>
                {tab.count}
              </span>
            )}
            
            {/* Status Badge */}
            {tab.badge && (
              <StatusBadge status={tab.badgeStatus || 'good'}>
                {tab.badge}
              </StatusBadge>
            )}
          </button>
        ))}
      </div>

      {/* Gradient fade for horizontal scroll */}
      <style>{`
        @media (max-width: 768px) {
          div::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TabNavigation;