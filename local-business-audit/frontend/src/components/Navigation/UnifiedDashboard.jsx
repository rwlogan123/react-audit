// frontend/src/components/Navigation/UnifiedDashboard.jsx
// COMPLETE VERSION - Includes all original code plus wiring

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Import all your existing components
import ComprehensiveAuditForm from "../ComprehensiveAuditForm";
import AuditDashboard from "../../dashboards/AuditDashboard/AuditDashboard";
import ClientDashboard from "../../dashboards/ClientDashboard/ClientDashboard";
import TabPlayground from "../playground/TabPlayground";

// Import shared components
import TabNavigation from "../shared/TabNavigation";
import { colors } from "../shared/colors";

// API Configuration
const API_BASE = import.meta.env.VITE_API_URL || 'https://react-audit-backend.onrender.com/api';

// Navigation configuration with role-based visibility
const getNavigationItems = (userRole) => {
  const items = [
    {
      section: "Audit Tools",
      icon: "🔍",
      visible: ["admin", "developer", "user"],
      items: [
        { name: "New Audit", icon: "📝", path: "/audit/form", component: "ComprehensiveAuditForm" },
        { name: "Audit Dashboard", icon: "📊", path: "/audit/dashboard", component: "AuditDashboard" },
        { name: "Audit History", icon: "📚", path: "/audit/history", component: "AuditHistory" }
      ]
    },
    {
      section: "Content Management",
      icon: "📝",
      visible: ["admin", "developer", "user"],
      items: [
        { name: "Content Dashboard", icon: "📋", path: "/client/dashboard", component: "ClientDashboard" },
        { name: "Analytics", icon: "📈", path: "/content/analytics", component: "ContentAnalytics" },
        { name: "Publishing", icon: "📅", path: "/content/publishing", component: "PublishingSchedule" },
        { name: "Review Management", icon: "⭐", path: "/content/reviews", component: "ReviewManagement" }
      ]
    },
    {
      section: "Business Tools", 
      icon: "🏢",
      visible: ["admin", "developer", "user"],
      items: [
        { name: "Citation Management", icon: "📋", path: "/business/citations", component: "CitationManagement" },
        { name: "Local SEO Tools", icon: "🎯", path: "/business/seo", component: "LocalSEOTools" },
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

  return items.filter(section => section.visible.includes(userRole));
};

// Metric Card Component
const MetricCard = ({ title, value, subtitle, status = "info", onClick = null }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = () => {
    const statusColors = {
      success: "#4CAF50",
      warning: "#FF9800", 
      info: "#2196F3",
      critical: "#F44336"
    };
    return statusColors[status] || statusColors.info;
  };

  return (
    <div
      style={{
        background: isHovered 
          ? "rgba(255,255,255,0.15)" 
          : "rgba(255,255,255,0.1)",
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

// Complete DashboardHeader component
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
        width: "100%",
        margin: window.innerWidth <= 768 ? "0 0 20px 0" : "0 0 32px 0",
        flexWrap: "wrap",
        gap: "16px",
        padding: window.innerWidth <= 768 ? "0 16px" : "0 40px",
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
              <div style={{ fontSize: window.innerWidth <= 768 ? "11px" : "13px", opacity: "0.8" }}>
                Content Management Platform
              </div>
            </div>
          </div>
        )}

        {/* Center - Business Info */}
        <div style={{
          flex: "1",
          textAlign: "center",
          minWidth: "250px"
        }}>
          <h1 style={{ 
            fontSize: window.innerWidth <= 768 ? "20px" : "28px", 
            fontWeight: "700",
            margin: "0 0 8px 0",
            lineHeight: "1.2" 
          }}>
            {businessName || title || "Business Dashboard"}
          </h1>
          <div style={{ 
            fontSize: window.innerWidth <= 768 ? "14px" : "16px", 
            opacity: "0.9",
            margin: "0 0 4px 0" 
          }}>
            {location || subtitle || "Location"}
          </div>
          {user && userPlan && (
            <div style={{ 
              fontSize: window.innerWidth <= 768 ? "12px" : "14px", 
              opacity: "0.8" 
            }}>
              {user.name} • {userPlan.tier?.charAt(0).toUpperCase() + userPlan.tier?.slice(1)} Plan
            </div>
          )}
        </div>

        {/* Right - Action Buttons */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          minWidth: "200px",
          justifyContent: "flex-end"
        }}>
          {onGenerateTest && (
            <button
              onClick={onGenerateTest}
              disabled={loading}
              style={{
                background: loading ? colors.gray : "rgba(255,255,255,0.2)",
                color: colors.white,
                border: "none",
                padding: window.innerWidth <= 768 ? "8px 12px" : "10px 16px",
                borderRadius: "6px",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: window.innerWidth <= 768 ? "12px" : "14px",
                fontWeight: "500",
                transition: "all 0.2s ease",
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? "⏳ Generating..." : "🎲 Generate Test Content"}
            </button>
          )}
          {headerActions}
        </div>
      </div>

      {/* Metrics Cards Grid */}
      {metrics && metrics.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: window.innerWidth <= 768 
            ? "repeat(2, 1fr)" 
            : "repeat(auto-fit, minmax(200px, 1fr))",
          gap: window.innerWidth <= 768 ? "12px" : "20px",
          marginTop: "24px",
          padding: window.innerWidth <= 768 ? "0 16px" : "0 40px"
        }}>
          {metrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              status={metric.status}
              onClick={() => onMetricClick(metric, index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Placeholder components for missing ones
const AuditHistory = ({ userRole }) => (
  <div style={{ padding: '24px' }}>
    <h1 style={{ color: colors.primary, marginBottom: '16px' }}>Audit History</h1>
    <div style={{ 
      background: colors.lightGray, 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '20px' 
    }}>
      <p><strong>Audit History Component</strong></p>
      <p>• {userRole === 'developer' ? 'Shows all audits from all users' : 'Shows only this account\'s audits'}</p>
      <p>• Connects to MongoDB to fetch audit history</p>
      <p>• Displays audit results in searchable table</p>
      <p>• Allows re-running audits or viewing historical data</p>
    </div>
  </div>
);

const ApiMonitor = () => (
  <div style={{ padding: '24px' }}>
    <h1 style={{ color: colors.primary, marginBottom: '16px' }}>API Monitor</h1>
    <div style={{ 
      background: colors.lightGray, 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '20px' 
    }}>
      <p><strong>API Monitor Component</strong></p>
      <p>• Real-time API endpoint monitoring</p>
      <p>• Shows which APIs are working/failing</p>
      <p>• Response time tracking</p>
      <p>• Error rate monitoring</p>
      <p>• Backend health status</p>
    </div>
  </div>
);

const BackendStatus = () => (
  <div style={{ padding: '24px' }}>
    <h1 style={{ color: colors.primary, marginBottom: '16px' }}>Backend Status</h1>
    <div style={{ 
      background: colors.lightGray, 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '20px' 
    }}>
      <p><strong>Backend Status Component</strong></p>
      <p>• Server startup monitoring</p>
      <p>• System health checks</p>
      <p>• Database connection status</p>
      <p>• Memory and CPU usage</p>
      <p>• Service uptime tracking</p>
    </div>
  </div>
);

const TestDataGenerator = () => (
  <div style={{ padding: '24px' }}>
    <h1 style={{ color: colors.primary, marginBottom: '16px' }}>Test Data Generator</h1>
    <div style={{ 
      background: colors.lightGray, 
      padding: '20px', 
      borderRadius: '8px',
      marginBottom: '20px' 
    }}>
      <p><strong>Test Data Generator Component</strong></p>
      <p>• Generate sample audit data for testing</p>
      <p>• Create demo business profiles</p>
      <p>• Generate content samples for client dashboard</p>
      <p>• Reset test environments</p>
      <p>• Populate databases with demo data</p>
    </div>
  </div>
);

// Sidebar Component - Complete version
const Sidebar = ({ isOpen, onToggle, activeItem, onNavigate, userRole }) => {
  const navigationItems = getNavigationItems(userRole);
  const [expandedSections, setExpandedSections] = useState(
    navigationItems.reduce((acc, section) => ({ ...acc, [section.section]: true }), {})
  );

  const mockUser = {
    name: "John Doe",
    role: userRole
  };

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
                  color: colors.white,
                  opacity: 0.8,
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{section.icon}</span>
                  {isOpen && <span>{section.section}</span>}
                </div>
                {isOpen && (
                  <span style={{ 
                    transform: expandedSections[section.section] ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}>
                    ▶
                  </span>
                )}
              </div>

              {/* Section Items */}
              {(expandedSections[section.section] || !isOpen) && (
                <div>
                  {section.items.map((item) => (
                    <div
                      key={item.path}
                      onClick={() => onNavigate(item.path)}
                      style={{
                        padding: '12px 20px',
                        paddingLeft: isOpen ? '40px' : '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        color: colors.white,
                        background: activeItem === item.path ? colors.sidebarHover : 'transparent',
                        borderRadius: activeItem === item.path ? '8px' : '0',
                        margin: activeItem === item.path ? '0 10px' : '0',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (activeItem !== item.path) {
                          e.target.style.background = colors.sidebarHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeItem !== item.path) {
                          e.target.style.background = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>{item.icon}</span>
                      {isOpen && (
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                          {item.name}
                        </span>
                      )}
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

// Main Content Area - Complete version with all integrations
const MainContent = ({ activeItem, userRole, isMobile, sidebarOpen }) => {
  const navigate = useNavigate();
  const [activeContentTab, setActiveContentTab] = useState('overview');
  
  // Sample data
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

  const sampleMetrics = [
    { title: "Total Content", value: "45", subtitle: "Ready to publish", status: "success" },
    { title: "Blog Posts", value: "10", subtitle: "8 approved", status: "success" },
    { title: "Social Posts", value: "30", subtitle: "All platforms", status: "info" },
    { title: "Email Campaigns", value: "5", subtitle: "Active sequences", status: "warning" }
  ];

  const sampleUser = {
    name: "John Doe",
    email: "john@example.com"
  };

  const sampleUserPlan = {
    tier: 'professional',
    projectStatus: {
      websiteComplete: false,
      contentApproved: false,
      adsActive: true,
      citationsOngoing: true,
      reviewsActive: true
    }
  };

  // Handle audit form submission
  const handleAuditSubmit = async (formData) => {
    try {
      console.log("Audit form submitted:", formData);
      navigate('/dashboard/audit/dashboard');
    } catch (error) {
      console.error("Audit submission failed:", error);
    }
  };

  // Sample data for components that need it
  const sampleAuditData = JSON.parse(sessionStorage.getItem('auditResults') || 'null');
  const businessInfo = JSON.parse(sessionStorage.getItem('businessInfo') || '{}');

  const renderContent = () => {
    switch (activeItem) {
      case '/audit/form':
        return (
          <div style={{ padding: '0' }}>
            <ComprehensiveAuditForm 
              onSubmit={handleAuditSubmit}
              isLoading={false}
            />
          </div>
        );
        
      case '/audit/dashboard':
        return (
          <div style={{ padding: '0' }}>
            {sampleAuditData ? (
              <AuditDashboard 
                auditData={sampleAuditData}
                onStartOver={() => {
                  sessionStorage.removeItem('auditResults');
                  sessionStorage.removeItem('businessInfo');
                  navigate('/dashboard/audit/form');
                }}
              />
            ) : (
              <div style={{ 
                background: colors.lightGray, 
                padding: '40px', 
                borderRadius: '12px',
                textAlign: 'center',
                margin: '24px' 
              }}>
                <h3 style={{ color: colors.primary, marginTop: 0 }}>No Audit Data Available</h3>
                <p>Run a new audit to see results here.</p>
                <button
                  onClick={() => navigate('/dashboard/audit/form')}
                  style={{
                    background: colors.primary,
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  Start New Audit
                </button>
              </div>
            )}
          </div>
        );
        
      case '/audit/history':
        return <AuditHistory userRole={userRole} />;
        
      case '/client/dashboard':
        return (
          <div style={{ padding: '0' }}>
            {/* Use your existing DashboardHeader */}
            <DashboardHeader
              businessName={businessInfo.businessName || "Sample Business"}
              location={businessInfo.location || "Eagle Mountain, UT"}
              metrics={sampleMetrics}
              user={sampleUser}
              userPlan={sampleUserPlan}
              onMetricClick={(metric, index) => {
                console.log(`Clicked metric: ${metric.title}`);
                // You can add filtering logic here
              }}
              onGenerateTest={() => {
                console.log("Generate test content clicked");
                // Add your test content generation logic
              }}
            />
            
            {/* Content area with TabNavigation */}
            <div style={{ 
              padding: isMobile ? '16px' : '32px' 
            }}>
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
                  <p>• Approve/reject workflow with feedback</p>
                  <p>• SEO optimization tools</p>
                  <p>• Publishing schedule integration</p>
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
                  <p><strong>Your SocialMediaTab component renders here</strong></p>
                  <p>• Platform-specific post management</p>
                  <p>• Visual content preview</p>
                  <p>• Multi-platform publishing</p>
                  <p>• Engagement analytics</p>
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
                  <p><strong>Your EmailSequenceTab component renders here</strong></p>
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
        
      case '/dev/playground':
        return (
          <div style={{ padding: '24px' }}>
            <h1 style={{ color: colors.primary, marginBottom: '16px' }}>Component Playground</h1>
            <TabPlayground />
          </div>
        );
        
      case '/dev/api':
        return <ApiMonitor />;
        
      case '/dev/backend':
        return <BackendStatus />;
        
      case '/dev/test-data':
        return <TestDataGenerator />;
      
      default:
        return (
          <div style={{ padding: '24px' }}>
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
              <h4 style={{ margin: '0 0 12px 0', color: colors.info }}>Quick Actions:</h4>
              <div style={{ display: 'grid', gap: '12px' }}>
                <button
                  onClick={() => navigate('/dashboard/audit/form')}
                  style={{
                    background: colors.primary,
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  🔍 Start New Audit
                </button>
                <button
                  onClick={() => navigate('/dashboard/client/dashboard')}
                  style={{
                    background: colors.secondary,
                    color: 'white',
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  📋 Manage Content
                </button>
                {userRole === 'developer' && (
                  <button
                    onClick={() => navigate('/dashboard/dev/playground')}
                    style={{
                      background: colors.info,
                      color: 'white',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    🎮 Component Playground
                  </button>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      background: colors.background,
      minHeight: '100vh',
      padding: activeItem === '/client/dashboard' || activeItem === '/audit/form' || activeItem === '/audit/dashboard' ? '0' : '24px'
    }}>
      {/* Only wrap in card for certain components */}
      {(activeItem !== '/client/dashboard' && activeItem !== '/audit/form' && activeItem !== '/audit/dashboard') && (
        <div style={{
          background: colors.white,
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {renderContent()}
        </div>
      )}
      {(activeItem === '/client/dashboard' || activeItem === '/audit/form' || activeItem === '/audit/dashboard') && renderContent()}
    </div>
  );
};

// Main Dashboard Component
const UnifiedDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [activeItem, setActiveItem] = useState('/client/dashboard');
  const [userRole, setUserRole] = useState('developer');
  const navigate = useNavigate();
  const location = useLocation();

  // Handle responsive sidebar
  useEffect(() => {
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

  // Update active item based on URL
  useEffect(() => {
    const path = location.pathname.replace('/dashboard', '');
    if (path && path !== '/') {
      setActiveItem(path);
    }
  }, [location]);

  const handleNavigate = (path) => {
    setActiveItem(path);
    navigate(`/dashboard${path}`);
    
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
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
        marginLeft: 0,
        transition: 'margin-left 0.3s ease',
        width: '100%',
        overflow: 'hidden'
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
              <h2 style={{ margin: 0, color: colors.primary, fontSize: isMobile ? '18px' : '24px' }}>
                BRANDAIDE Dashboard
              </h2>
              <div style={{ fontSize: '14px', color: colors.gray, marginTop: '4px' }}>
                Backend: 🟢 Production (Render) • View as: {userRole}
              </div>
            </div>
          </div>
          
          {/* Role switcher for development */}
          {userRole === 'developer' && (
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${colors.lightGray}`,
                background: colors.white,
                color: colors.primary,
                fontSize: '14px'
              }}
            >
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          )}
        </div>

        {/* Main Content */}
        <MainContent
          activeItem={activeItem}
          isMobile={isMobile}
          sidebarOpen={sidebarOpen}
          userRole={userRole}
        />
      </div>
    </div>
  );
};

export default UnifiedDashboard;