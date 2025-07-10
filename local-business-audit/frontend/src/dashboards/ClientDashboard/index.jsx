// src/dashboards/ClientDashboard/index.jsx
import React, { useState } from 'react';
import MetricCard from '../../components/shared/MetricCard';
import StatusBadge from '../../components/shared/StatusBadge';
import { colors } from '../../components/shared/colors';

const ClientDashboard = ({ 
  businessName = "Sample Business", 
  location = "Eagle Mountain, UT",
  userPlan = { tier: 'professional' },
  user = { name: "Demo Client" }
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock stats
  const stats = {
    total: 48,
    pending: 12,
    approved: 28,
    rejected: 8
  };

  // Plan features
  const planFeatures = {
    content: true,
    website: true,
    citations: true,
    reviews: userPlan.tier !== 'starter',
    serviceAreas: userPlan.tier !== 'starter',
    ads: userPlan.tier === 'premium',
    publishing: true
  };

  // Available tabs based on plan
  const tabs = [
    { id: 'overview', label: 'Overview', emoji: '📊', alwaysShow: true },
    { id: 'blog', label: 'Blog Posts', emoji: '📝', show: planFeatures.content, count: 10 },
    { id: 'social', label: 'Social Media', emoji: '📱', show: planFeatures.content, count: 30 },
    { id: 'email', label: 'Email Sequence', emoji: '✉️', show: planFeatures.content, count: 5 },
    { id: 'website', label: 'Website', emoji: '🌐', show: planFeatures.website, badge: 'In Progress' },
    { id: 'citations', label: 'Citations', emoji: '📋', show: planFeatures.citations, badge: 'Active' },
    { id: 'reviews', label: 'Reviews', emoji: '⭐', show: planFeatures.reviews, badge: '3 new' },
    { id: 'ads', label: 'Advertising', emoji: '💰', show: planFeatures.ads, badge: 'Active' }
  ].filter(tab => tab.alwaysShow || tab.show);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: colors.primary, marginBottom: '24px' }}>Content Package Overview</h2>
            
            <div style={{
              background: '#EBF8FF',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '32px'
            }}>
              <p style={{ margin: 0, color: colors.primary }}>
                <strong>Quick Summary:</strong> We've created {stats.total} pieces of custom content for {businessName}. 
                {stats.pending > 0 && ` ${stats.pending} items need your review.`}
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              marginBottom: '32px'
            }}>
              {planFeatures.content && (
                <div style={{
                  background: colors.white,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <h3 style={{ color: colors.info, marginBottom: '16px' }}>📝 Blog Posts (10)</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <StatusBadge status="good">Average SEO: 85/100</StatusBadge>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <StatusBadge status="excellent">8,500 words total</StatusBadge>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    Long-form content optimized for local searches
                  </p>
                </div>
              )}

              {planFeatures.content && (
                <div style={{
                  background: colors.white,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <h3 style={{ color: colors.success, marginBottom: '16px' }}>📱 Social Media (30)</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <StatusBadge status="good">FB: 10</StatusBadge>
                    <span style={{ margin: '0 8px' }}></span>
                    <StatusBadge status="good">IG: 10</StatusBadge>
                    <span style={{ margin: '0 8px' }}></span>
                    <StatusBadge status="good">LI: 10</StatusBadge>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    Platform-ready posts with hashtags and CTAs
                  </p>
                </div>
              )}

              {planFeatures.website && (
                <div style={{
                  background: colors.white,
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '12px',
                  padding: '24px'
                }}>
                  <h3 style={{ color: colors.primary, marginBottom: '16px' }}>🌐 Website Development</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <StatusBadge status="warning">In Progress</StatusBadge>
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>
                    Custom 10-page website with SEO optimization
                  </p>
                </div>
              )}
            </div>

            {stats.pending > 0 && (
              <div style={{
                background: '#FEF3C7',
                border: '1px solid #FCD34D',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#92400E', marginBottom: '16px' }}>Quick Actions Needed</h3>
                <p style={{ color: '#92400E', marginBottom: '20px' }}>
                  You have {stats.pending} pieces of content waiting for your review.
                </p>
                <button
                  onClick={() => setActiveTab('blog')}
                  style={{
                    background: colors.warning,
                    color: colors.white,
                    border: 'none',
                    padding: '12px 32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '16px'
                  }}
                >
                  Review Pending Content →
                </button>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ color: colors.primary, marginBottom: '24px' }}>
              {tabs.find(t => t.id === activeTab)?.emoji} {tabs.find(t => t.id === activeTab)?.label}
            </h2>
            <div style={{
              background: colors.white,
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '18px', color: '#666' }}>
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management coming soon...
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
        color: colors.white,
        padding: "40px 20px"
      }}>
        {/* Logo and Title */}
        <div style={{
          maxWidth: "1200px",
          margin: "0 auto",
          textAlign: "center",
          marginBottom: "32px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px"
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
              fontSize: "20px"
            }}>
              B
            </div>
            <div>
              <span style={{ fontSize: "24px", fontWeight: "600" }}>BRANDAIDE</span>
              <div style={{ fontSize: "12px", opacity: "0.8" }}>Client Dashboard</div>
            </div>
          </div>

          <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "8px" }}>
            Content Review Portal
          </h1>
          <h2 style={{ fontSize: "20px", marginBottom: "24px", opacity: "0.9" }}>
            {businessName} - {location}
          </h2>

          {user && (
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px'
            }}>
              Welcome back, {user.name} • {userPlan.tier.charAt(0).toUpperCase() + userPlan.tier.slice(1)} Plan
            </div>
          )}
        </div>

        {/* Metrics using your MetricCard */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          <MetricCard
            title="Total Content"
            value={stats.total}
            subtitle="Ready for review"
            color={colors.info}
          />
          <MetricCard
            title="Pending Review"
            value={stats.pending}
            subtitle="Awaiting your approval"
            color={colors.warning}
            progress={Math.round((stats.pending / stats.total) * 100)}
          />
          <MetricCard
            title="Approved"
            value={stats.approved}
            subtitle="Ready to publish"
            color={colors.success}
            progress={Math.round((stats.approved / stats.total) * 100)}
          />
          <MetricCard
            title="Needs Revision"
            value={stats.rejected}
            subtitle="Feedback provided"
            color={colors.danger}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: colors.white,
        borderBottom: `1px solid ${colors.lightGray}`,
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          display: "flex",
          overflowX: "auto",
          padding: "0 20px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
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
                color: activeTab === tab.id ? colors.primary : "#666",
                borderBottom: activeTab === tab.id 
                  ? `3px solid ${colors.primary}` 
                  : "3px solid transparent"
              }}
            >
              <span>{tab.emoji} {tab.label}</span>
              
              {tab.count && (
                <span style={{
                  background: activeTab === tab.id ? colors.primary : colors.lightGray,
                  color: activeTab === tab.id ? colors.white : "#666",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600"
                }}>
                  {tab.count}
                </span>
              )}
              
              {tab.badge && (
                <StatusBadge status="good">{tab.badge}</StatusBadge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main>
        {renderTabContent()}
      </main>

      {/* Footer */}
      <footer style={{
        background: colors.primary,
        color: colors.white,
        padding: '20px',
        textAlign: 'center',
        marginTop: '40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            © 2024 BRANDAIDE - Professional Content Management Platform
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ClientDashboard;