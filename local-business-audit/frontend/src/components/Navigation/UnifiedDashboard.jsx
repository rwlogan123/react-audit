import React, { useState } from 'react';

// Your actual StatusBadge component
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

// Your actual TabNavigation Component
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
      marginBottom: '24px'
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

// Your actual MetricCard component 
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

// Your actual DashboardHeader component
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
      padding: window.innerWidth <= 768 ? "20px 15px" : "40px 20px",
      textAlign: "center",
    }}>
      {/* Top Bar with Logo and User Info */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%", // Use full width
        margin: window.innerWidth <= 768 ? "0 0 20px 0" : "0 0 32px 0", // Remove auto centering
        flexWrap: "wrap",
        gap: "16px",
        padding: window.innerWidth <= 768 ? "0 16px" : "0 40px", // Reduced mobile padding to match
        boxSizing: "border-box"
      }}>
        {/* Logo Section */}
        {showLogo && (
          <div style={{
            display: "flex",
            alignItems: "center",
            minWidth: "200px"
          }}>
            <div style={{
              width: window.innerWidth <= 768 ? "32px" : "40px",
              height: window.innerWidth <= 768 ? "32px" : "40px",
              marginRight: "16px",
              background: colors.white,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.primary,
              fontWeight: "bold",
              fontSize: window.innerWidth <= 768 ? "16px" : "20px",
            }}>
              {logoText.charAt(0)}
            </div>
            <div style={{ textAlign: "left" }}>
              <span style={{ fontSize: window.innerWidth <= 768 ? "18px" : "24px", fontWeight: "600" }}>{logoText}</span>
              <div style={{ fontSize: window.innerWidth <= 768 ? "10px" : "12px", opacity: "0.8", marginTop: "2px" }}>
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
              <div style={{ fontSize: window.innerWidth <= 768 ? "12px" : "14px", fontWeight: "500" }}>
                Welcome back, {user.name}
              </div>
              {userPlan && (
                <div style={{ fontSize: window.innerWidth <= 768 ? "10px" : "12px", opacity: "0.8" }}>
                  {userPlan.tier.charAt(0).toUpperCase() + userPlan.tier.slice(1)} Plan
                </div>
              )}
            </div>
            <div style={{
              width: window.innerWidth <= 768 ? "32px" : "40px",
              height: window.innerWidth <= 768 ? "32px" : "40px",
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
      <h1 style={{ fontSize: window.innerWidth <= 768 ? "24px" : "32px", fontWeight: "700", marginBottom: "8px" }}>
        {title}
      </h1>
      {businessName && location && (
        <h2 style={{ fontSize: window.innerWidth <= 768 ? "16px" : "20px", marginBottom: window.innerWidth <= 768 ? "16px" : "24px", opacity: "0.9" }}>
          {businessName} - {location}
        </h2>
      )}

      {/* Test Data Button for Development */}
      {onGenerateTest && (
        <div style={{ marginBottom: window.innerWidth <= 768 ? "16px" : "24px" }}>
          <button
            onClick={onGenerateTest}
            disabled={loading}
            style={{
              background: loading ? colors.lightGray : colors.warning,
              color: loading ? '#666' : colors.white,
              border: 'none',
              padding: window.innerWidth <= 768 ? '8px 16px' : '10px 20px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: window.innerWidth <= 768 ? '12px' : '14px',
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
          gridTemplateColumns: window.innerWidth <= 480 ? '1fr' : 
                             window.innerWidth <= 768 ? 'repeat(2, 1fr)' : 
                             'repeat(4, 1fr)', // Always 4 columns on desktop as per your design
          gap: window.innerWidth <= 768 ? "12px" : "16px",
          maxWidth: "100%", // Use full available width instead of fixed 1200px
          margin: "0 auto",
          padding: window.innerWidth <= 768 ? "0 16px" : "0 40px", // Reduced mobile padding
          boxSizing: "border-box"
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

      <style>{`
        @media (max-width: 768px) {
          .metric-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 0 12px !important;
          }
        }
        @media (max-width: 480px) {
          .metric-grid {
            grid-template-columns: 1fr !important;
            gap: 8px !important;
            padding: 0 12px !important;
          }
        }
        @media (max-width: 1024px) {
          .metric-grid {
            grid-template-columns: repeat(3, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

// Colors configuration
const colors = {
  primary: "#2A3B4A",
  secondary: "#1a2b38",
  white: "#FFFFFF",
  lightGray: "#E1E1E1",
  gray: "#6B7280",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
  background: "#F8FAFC",
  sidebarBg: "#1F2937",
  sidebarHover: "#374151"
};

// Mock user data - in production this would come from auth
const mockUser = {
  name: "John Doe",
  email: "john@example.com",
  role: "admin", // "admin", "client", or "developer"
  avatar: null
};

// API configuration - matches your backend setup
// In your actual Vite app, you'd use: import.meta.env.VITE_API_URL
const API_BASE = 'https://your-backend.onrender.com/api'; // Your Render backend URL

// Navigation items configuration based on your actual project structure
const getNavigationItems = (userRole) => {
  const items = [
    {
      section: "Audit Tools",
      icon: "🔍",
      visible: ["admin", "developer"],
      items: [
        { name: "New Audit", icon: "📝", path: "/audit/form", component: "AuditForm" },
        { name: "Audit Dashboard", icon: "📊", path: "/audit/dashboard", component: "AuditDashboard" },
        { name: "Audit History", icon: "📚", path: "/audit/history", component: "AuditHistory" }
      ]
    },
    {
      section: "Content Management",
      icon: "📝",
      visible: ["admin", "client", "developer"],
      items: [
        { name: "Content Dashboard", icon: "📄", path: "/client/dashboard", component: "ClientDashboard" },
        // Removed individual content types - they're now tabs within the dashboard
      ]
    },
    {
      section: "Business Tools",
      icon: "💼",
      visible: ["admin", "client"],
      items: [
        { name: "Business Profile", icon: "🏢", path: "/business/profile", component: "BusinessProfile" },
        { name: "Team Management", icon: "👥", path: "/business/team", component: "TeamManagement" },
        { name: "Analytics & Reports", icon: "📈", path: "/business/analytics", component: "BusinessAnalytics" },
        { name: "Settings", icon: "⚙️", path: "/business/settings", component: "BusinessSettings" }
      ]
    },
    {
      section: "Development Tools",
      icon: "🛠️",
      visible: ["developer"],
      items: [
        { name: "Component Playground", icon: "🎮", path: "/dev/playground", component: "TabPlayground" },
        { name: "API Monitor", icon: "📡", path: "/dev/api", component: "ApiMonitor" },
        { name: "Backend Status", icon: "🖥️", path: "/dev/backend", component: "BackendStatus" },
        { name: "Test Data Generator", icon: "🎲", path: "/dev/test-data", component: "TestDataGenerator" }
      ]
    }
  ];

  // Filter sections based on user role
  return items.filter(section => section.visible.includes(userRole));
};

// Sidebar Component
const Sidebar = ({ isOpen, onToggle, activeItem, onNavigate, userRole }) => {
  const navigationItems = getNavigationItems(userRole);
  const [expandedSections, setExpandedSections] = useState(
    navigationItems.reduce((acc, section) => ({ ...acc, [section.section]: true }), {})
  );

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onToggle}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 40,
            display: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'block' : 'none'
          }}
        />
      )}

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: isOpen ? (typeof window !== 'undefined' && window.innerWidth <= 768 ? '100%' : '280px') : '70px',
          background: colors.sidebarBg,
          transition: 'width 0.3s ease, transform 0.3s ease',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
          transform: typeof window !== 'undefined' && window.innerWidth <= 768 && !isOpen ? 'translateX(-100%)' : 'translateX(0)'
        }}
      >
        {/* Logo Section */}
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${colors.sidebarHover}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: colors.white,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>B</span>
            </div>
            {isOpen && (
              <span style={{ color: colors.white, fontSize: '18px', fontWeight: '600' }}>
                BRANDAIDE
              </span>
            )}
          </div>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              color: colors.white,
              cursor: 'pointer',
              padding: '4px',
              fontSize: '20px'
            }}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Items */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 0'
        }}>
          {navigationItems.map((section) => (
            <div key={section.section} style={{ marginBottom: '20px' }}>
              {/* Section Header */}
              <div
                onClick={() => isOpen && toggleSection(section.section)}
                style={{
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isOpen ? 'pointer' : 'default',
                  color: colors.gray,
                  fontSize: '12px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{section.icon}</span>
                  {isOpen && <span>{section.section}</span>}
                </div>
                {isOpen && (
                  <span style={{ fontSize: '10px' }}>
                    {expandedSections[section.section] ? '▼' : '▶'}
                  </span>
                )}
              </div>

              {/* Section Items */}
              {(!isOpen || expandedSections[section.section]) && (
                <div>
                  {section.items.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => onNavigate(item.path)}
                      style={{
                        padding: isOpen ? '12px 20px 12px 40px' : '12px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        background: activeItem === item.path ? colors.sidebarHover : 'transparent',
                        borderLeft: activeItem === item.path ? `3px solid ${colors.info}` : '3px solid transparent',
                        color: activeItem === item.path ? colors.white : colors.gray,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.sidebarHover;
                        e.currentTarget.style.color = colors.white;
                      }}
                      onMouseLeave={(e) => {
                        if (activeItem !== item.path) {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = colors.gray;
                        }
                      }}
                      title={!isOpen ? item.name : ''}
                    >
                      <span style={{ fontSize: '18px' }}>{item.icon}</span>
                      {isOpen && <span style={{ fontSize: '14px' }}>{item.name}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Section */}
        <div style={{
          padding: '20px',
          borderTop: `1px solid ${colors.sidebarHover}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: colors.info,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <span style={{ color: colors.white, fontWeight: '600' }}>
              {mockUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          {isOpen && (
            <div style={{ flex: 1 }}>
              <div style={{ color: colors.white, fontSize: '14px', fontWeight: '500' }}>
                {mockUser.name}
              </div>
              <div style={{ color: colors.gray, fontSize: '12px' }}>
                {mockUser.role}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Main Content Area - uses your actual components
const MainContent = ({ activeItem, userRole, isMobile, sidebarOpen }) => {
  // State for tab navigation within each section
  const [activeContentTab, setActiveContentTab] = useState('overview');
  
  // Your existing tabs from the TabNavigation component
  const contentTabs = [
    { id: "overview", label: "Overview", emoji: "📊" },
    { id: "blog", label: "Blog Posts", emoji: "📝", count: 10 },
    { id: "social", label: "Social Media", emoji: "📱", count: 30 },
    { id: "email", label: "Email Sequence", emoji: "✉️", count: 5 },
    { id: "website", label: "Website", emoji: "🌐", badge: "In Progress", badgeStatus: "pending" },
    { id: "service-areas", label: "Service Areas", emoji: "📍" },
    { id: "schedule", label: "Publishing", emoji: "📅" },
    { id: "citations", label: "Citations", emoji: "📋", badge: "Active", badgeStatus: "good" },
    { id: "reviews", label: "Reviews", emoji: "⭐", badge: "3 new", badgeStatus: "warning" },
  ];

  // Sample metrics data for your DashboardHeader (4 cards as in your original)
  const sampleMetrics = [
    { title: "Total Content", value: "45", subtitle: "Ready to publish", status: "success" },
    { title: "Blog Posts", value: "10", subtitle: "8 approved", status: "success" }, // Changed to success for better visibility
    { title: "Social Posts", value: "30", subtitle: "All platforms", status: "info" },
    { title: "Email Campaigns", value: "5", subtitle: "Active sequences", status: "warning" }
  ];

  const sampleUser = {
    name: "John Doe",
    email: "john@example.com"
  };

  const sampleUserPlan = {
    tier: "professional"
  };

  // This would render your actual components based on activeItem
  const renderContent = () => {
    switch (activeItem) {
      case '/client/dashboard':
        return (
          <div style={{ 
            background: colors.background, 
            margin: '0', // Remove all negative margins
            minHeight: 'calc(100vh - 200px)', 
            width: '100%'
          }}>
            {/* Your actual DashboardHeader component */}
            <DashboardHeader 
              title="Content Dashboard"
              subtitle="Manage all your content"
              businessName="Your Business"
              location="Your Location"
              metrics={sampleMetrics}
              user={sampleUser}
              userPlan={sampleUserPlan}
              onMetricClick={(metricId) => {
                console.log('Metric clicked:', metricId);
                // This could filter content or navigate to specific tabs
                if (metricId === 'Blog Posts') setActiveContentTab('blog');
                if (metricId === 'Social Posts') setActiveContentTab('social');
                if (metricId === 'Email Campaigns') setActiveContentTab('email');
              }}
              onGenerateTest={() => {
                console.log('Generate test content clicked');
                // Your generateTestContent function would go here
              }}
              loading={false}
            />
            
            <div style={{ padding: isMobile ? '16px' : '32px' }}>
              {/* Your existing TabNavigation integrated here */}
              <TabNavigation 
                tabs={contentTabs}
                activeTab={activeContentTab}
                onTabChange={setActiveContentTab}
                sticky={false}
              />
              
              {/* Content based on active tab */}
              {activeContentTab === 'overview' && (
                <div style={{ 
                  background: colors.white, 
                  padding: '24px', 
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  marginBottom: '20px' 
                }}>
                  <h3 style={{ color: colors.primary, marginTop: 0 }}>Content Overview</h3>
                  <p>Your main dashboard view with content statistics and recent activity.</p>
                  <p>• Real-time content metrics from Header</p>
                  <p>• Connected to backend: <code>{API_BASE}</code></p>
                  <p>• Click on metric cards above to filter content</p>
                </div>
              )}
              
              {activeContentTab === 'blog' && (
                <div style={{ 
                  background: colors.white, 
                  padding: '24px', 
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  marginBottom: '20px' 
                }}>
                  <h3 style={{ color: colors.primary, marginTop: 0 }}>Blog Posts Management</h3>
                  <p><strong>Your BlogPostsTab component renders here</strong></p>
                  <p>• Full CRUD functionality for blog posts</p>
                  <p>• Approve/Reject with feedback modal</p>
                  <p>• Expandable content preview</p>
                  <p>• Real-time updates after actions</p>
                  <p>• 10 blog posts ready for review</p>
                </div>
              )}
              
              {activeContentTab === 'social' && (
                <div style={{ 
                  background: colors.white, 
                  padding: '24px', 
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  marginBottom: '20px' 
                }}>
                  <h3 style={{ color: colors.primary, marginTop: 0 }}>Social Media Management</h3>
                  <p><strong>Your Social Media component renders here</strong></p>
                  <p>• 30 social media posts ready</p>
                  <p>• Platform-specific content (Facebook, Instagram, LinkedIn)</p>
                  <p>• Scheduling and approval workflow</p>
                  <p>• Hashtag and mention management</p>
                </div>
              )}
              
              {activeContentTab === 'email' && (
                <div style={{ 
                  background: colors.white, 
                  padding: '24px', 
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  marginBottom: '20px' 
                }}>
                  <h3 style={{ color: colors.primary, marginTop: 0 }}>Email Sequence Management</h3>
                  <p><strong>Your Email component renders here</strong></p>
                  <p>• 5 active email sequences</p>
                  <p>• Drip campaign management</p>
                  <p>• A/B testing capabilities</p>
                  <p>• Performance analytics</p>
                </div>
              )}
              
              {(activeContentTab !== 'overview' && activeContentTab !== 'blog' && activeContentTab !== 'social' && activeContentTab !== 'email') && (
                <div style={{ 
                  background: colors.white, 
                  padding: '24px', 
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  marginBottom: '20px' 
                }}>
                  <h3 style={{ color: colors.primary, marginTop: 0 }}>
                    {contentTabs.find(tab => tab.id === activeContentTab)?.label} Management
                  </h3>
                  <p>Your {activeContentTab} component would render here</p>
                  <p>This section would contain the specific functionality for managing {activeContentTab}.</p>
                </div>
              )}
            </div>
          </div>
        );
      
      case '/audit/form':
        return (
          <div>
            <h1 style={{ color: colors.primary, marginBottom: '16px' }}>New Audit</h1>
            <div style={{ 
              background: colors.lightGray, 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              <p><strong>Your Audit Form component renders here</strong></p>
              <p>• Form for creating new audits</p>
              <p>• Connects to MongoDB backend on Render</p>
            </div>
          </div>
        );
        
      case '/audit/dashboard':
        return (
          <div>
            <h1 style={{ color: colors.primary, marginBottom: '16px' }}>Audit Dashboard</h1>
            <div style={{ 
              background: colors.lightGray, 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              <p><strong>Your AuditDashboard component renders here</strong></p>
              <p>• Display audit results</p>
              <p>• Imported in TabPlayground.jsx</p>
            </div>
          </div>
        );
        
      case '/dev/playground':
        return (
          <div>
            <h1 style={{ color: colors.primary, marginBottom: '16px' }}>Component Playground</h1>
            <div style={{ 
              background: colors.lightGray, 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              <p><strong>Your TabPlayground component renders here</strong></p>
              <p>• Development tool for testing components</p>
              <p>• Only visible to developers</p>
            </div>
          </div>
        );
        
      case '/dev/backend':
        return (
          <div>
            <h1 style={{ color: colors.primary, marginBottom: '16px' }}>Backend Status</h1>
            <div style={{ 
              background: colors.lightGray, 
              padding: '20px', 
              borderRadius: '8px',
              marginBottom: '20px' 
            }}>
              <p><strong>Backend Connection Status</strong></p>
              <p>• API Base: <code>{API_BASE}</code></p>
              <p>• Status: {API_BASE.includes('localhost') ? '🔴 Local Development' : '🟢 Production (Render)'}</p>
              <p>• MongoDB: Connected & Hosted</p>
              <p>• CORS: Configured for Vercel deployment</p>
              <p>• Content Routes: /api/content with approve/reject endpoints</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div>
            <h1 style={{ color: colors.primary, marginBottom: '24px' }}>
              Welcome to BRANDAIDE {userRole === 'developer' ? 'Development' : 'Dashboard'}
            </h1>
            <div style={{ 
              background: colors.lightGray, 
              padding: '24px', 
              borderRadius: '12px',
              marginBottom: '24px' 
            }}>
              <h3 style={{ marginTop: 0, color: colors.primary }}>Current Project Status:</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div>✅ <strong>Backend Integration:</strong> Node.js/Express on Render</div>
                <div>✅ <strong>Database:</strong> MongoDB hosted storage</div>
                <div>✅ <strong>Frontend:</strong> React (Vite) on Vercel</div>
                <div>✅ <strong>Content Routes:</strong> Full CRUD with approve/reject</div>
                <div>✅ <strong>Dashboard Components:</strong> Header, TabNavigation, BlogPostsTab</div>
                <div>✅ <strong>Deployment:</strong> Production ready!</div>
                <div>⚠️ <strong>Authentication:</strong> Role-based access needed</div>
                <div>🎯 <strong>Next:</strong> Integrate this navigation structure</div>
              </div>
            </div>
            
            <div style={{ 
              background: colors.info + '10', 
              border: `1px solid ${colors.info}`, 
              padding: '20px', 
              borderRadius: '8px' 
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: colors.info }}>How Your Components Work Together:</h4>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>Sidebar Navigation:</strong> High-level sections (Audit Tools, Content Management, etc.)
              </p>
              <p style={{ margin: '0 0 12px 0' }}>
                <strong>DashboardHeader:</strong> Beautiful header with metrics that users can click to filter content
              </p>
              <p style={{ margin: 0 }}>
                <strong>TabNavigation:</strong> Detailed content tabs within each section (Blog, Social, Email, etc.)
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      background: colors.background,
      minHeight: '100vh',
      padding: activeItem === '/client/dashboard' ? '0' : '24px'
    }}>
      {activeItem !== '/client/dashboard' && (
        <div style={{
          background: colors.white,
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {renderContent()}
        </div>
      )}
      {activeItem === '/client/dashboard' && renderContent()}
    </div>
  );
};

// Main Dashboard Component
const UnifiedDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeItem, setActiveItem] = useState('/client/dashboard');
  const [userRole, setUserRole] = useState('developer'); // Change to test different views

  // Handle responsive sidebar
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (path) => {
    setActiveItem(path);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
    console.log(`Navigating to: ${path}`);
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: colors.background
    }}>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        activeItem={activeItem}
        onNavigate={handleNavigate}
        userRole={userRole}
      />
      
      <div style={{
        flex: 1,
        marginLeft: 0, // Remove all margin on mobile and desktop
        transition: 'margin-left 0.3s ease',
        width: '100%', // Always use full width
        overflow: 'hidden' // Prevent any overflow issues
      }}>
        {/* Top Bar */}
        <div style={{
          background: colors.white,
          padding: '16px 24px',
          borderBottom: `1px solid ${colors.lightGray}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: colors.primary
                }}
              >
                ☰
              </button>
            )}
            <div>
              <h2 style={{ margin: 0, color: colors.primary, fontSize: isMobile ? '20px' : '24px' }}>
                BRANDAIDE Dashboard
              </h2>
              <p style={{ margin: '4px 0 0 0', color: colors.gray, fontSize: '14px' }}>
                Backend: {API_BASE.includes('localhost') ? 'Local Development' : 'Production'}
              </p>
            </div>
          </div>
          
          {/* Role Switcher for Demo & Environment Info */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ 
              padding: '6px 12px', 
              background: API_BASE.includes('localhost') ? colors.warning + '20' : colors.success + '20',
              color: API_BASE.includes('localhost') ? colors.warning : colors.success,
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {API_BASE.includes('localhost') ? '🚧 DEV MODE' : '🚀 PRODUCTION'}
            </div>
            {!isMobile && (
              <>
                <span style={{ fontSize: '14px', color: colors.gray }}>View as:</span>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: `1px solid ${colors.lightGray}`,
                    background: colors.white,
                    cursor: 'pointer'
                  }}
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                  <option value="developer">Developer</option>
                </select>
              </>
            )}
          </div>
        </div>
        
        <MainContent activeItem={activeItem} userRole={userRole} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .metric-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
        }
        @media (max-width: 480px) {
          .metric-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UnifiedDashboard;