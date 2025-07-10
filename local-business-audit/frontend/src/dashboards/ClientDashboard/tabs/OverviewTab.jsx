// File: src/dashboards/ClientDashboard/tabs/OverviewTab.jsx
import React from 'react';

// Colors configuration
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
      case 'excellent':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'good':
        return { bg: '#DBEAFE', color: '#1E40AF' };
      default:
        return { bg: colors.lightGray, color: '#666' };
    }
  };

  const style = getStatusStyle();
  
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      display: 'inline-block'
    }}>
      {children}
    </span>
  );
};

const OverviewTab = ({ 
  businessName, 
  location, 
  userPlan, 
  stats, 
  onSetFilter, 
  onSetActiveTab 
}) => {
  // Default plan configuration
  const defaultPlanFeatures = {
    starter: {
      content: true,
      website: true,
      citations: true,
      reviews: false,
      serviceAreas: false,
      ads: false,
      publishing: true
    },
    professional: {
      content: true,
      website: true,
      citations: true,
      reviews: true,
      serviceAreas: true,
      ads: false,
      publishing: true
    },
    premium: {
      content: true,
      website: true,
      citations: true,
      reviews: true,
      serviceAreas: true,
      ads: true,
      publishing: true
    }
  };

  const planFeatures = {
    ...defaultPlanFeatures[userPlan.tier || 'professional'],
    ...userPlan.customFeatures
  };

  const projectStatus = userPlan.projectStatus || {
    websiteComplete: false,
    contentApproved: false,
    adsActive: true,
    citationsOngoing: true,
    reviewsActive: true
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "16px",
        color: colors.primary,
      }}>
        Your Content Package Overview
      </h2>

      {/* Quick Summary */}
      <div style={{
        background: colors.lightGray,
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "24px",
        borderLeft: `4px solid ${colors.primary}`,
      }}>
        <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
          <strong>Quick Summary:</strong> We've created {stats.total} pieces of custom content for {businessName}. 
          {stats.pending > 0 && ` ${stats.pending} items need your review.`}
          {stats.approved > 0 && ` ${stats.approved} items are approved and ready to publish.`}
          {stats.rejected > 0 && ` ${stats.rejected} items need revision based on your feedback.`}
        </p>
      </div>

      {/* Plan Features Summary */}
      {userPlan.tier && (
        <div style={{
          background: colors.white,
          border: `1px solid ${colors.lightGray}`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '16px' }}>
            📋 Your {userPlan.tier.charAt(0).toUpperCase() + userPlan.tier.slice(1)} Plan Includes
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {Object.entries(planFeatures).map(([feature, included]) => (
              <div key={feature} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                opacity: included ? 1 : 0.5
              }}>
                <span style={{ 
                  color: included ? colors.success : '#ccc', 
                  fontSize: '16px' 
                }}>
                  {included ? '✓' : '✗'}
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  color: included ? colors.primary : '#999',
                  textTransform: 'capitalize'
                }}>
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Content Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}
      className="content-cards-grid"
      >
        {/* Blog Posts Card */}
        {planFeatures.content && (
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.lightGray}`,
            borderLeft: `4px solid ${colors.info}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.info,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📝 Blog Posts ({stats.byType?.find(t => t._id === 'blog')?.count || 0})
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary, marginBottom: '4px' }}>
                  SEO Performance:
                </div>
                <StatusBadge status='good'>Average Score: 85/100</StatusBadge>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary, marginBottom: '4px' }}>
                  Content Volume:
                </div>
                <StatusBadge status='excellent'>8,500 words total</StatusBadge>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary, marginBottom: '4px' }}>
                  Review Status:
                </div>
                <StatusBadge status={stats.pending > 0 ? 'pending' : 'approved'}>
                  {stats.pending > 0 ? `${stats.pending} pending` : 'All approved'}
                </StatusBadge>
              </div>
            </div>
            <div style={{
              background: '#EBF8FF',
              border: '1px solid #BEE3F8',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              color: colors.primary
            }}>
              <strong style={{ color: colors.info }}>Ready to Publish:</strong> Long-form content optimized for "{location.split(',')[0]}" local searches.
            </div>
          </div>
        )}

        {/* Social Media Card */}
        {planFeatures.content && (
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
              📱 Social Media Posts ({stats.byType?.find(t => t._id === 'social')?.count || 30})
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary, marginBottom: '4px' }}>
                  Platform Distribution:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <StatusBadge status='good'>Facebook: 10</StatusBadge>
                  <StatusBadge status='good'>Instagram: 10</StatusBadge>
                  <StatusBadge status='good'>LinkedIn: 10</StatusBadge>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary, marginBottom: '4px' }}>
                  Engagement Features:
                </div>
                <StatusBadge status='excellent'>Hashtags & CTAs included</StatusBadge>
              </div>
            </div>
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              color: colors.primary
            }}>
              <strong style={{ color: colors.success }}>High Impact:</strong> Mix of educational, promotional, and community-focused content.
            </div>
          </div>
        )}

        {/* Email Sequence Card */}
        {planFeatures.content && (
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.lightGray}`,
            borderLeft: `4px solid ${colors.warning}`,
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: colors.warning,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✉️ Email Sequence ({stats.byType?.find(t => t._id === 'email')?.count || 5})
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary, marginBottom: '4px' }}>
                  Sequence Type:
                </div>
                <StatusBadge status='good'>5-email nurture campaign</StatusBadge>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: colors.primary, marginBottom: '4px' }}>
                  Automation Ready:
                </div>
                <StatusBadge status='excellent'>5/5 approved</StatusBadge>
              </div>
            </div>
            <div style={{
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '14px',
              color: colors.primary
            }}>
              <strong style={{ color: colors.warning }}>Lead Nurturing:</strong> Automated sequence designed to convert inquiries into customers.
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {stats.pending > 0 && (
        <div style={{
          background: '#FEF3C7',
          border: '1px solid #FCD34D',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#92400E', marginBottom: '16px' }}>
            🎯 Quick Actions Needed
          </h3>
          <p style={{ color: '#92400E', marginBottom: '20px' }}>
            You have {stats.pending} pieces of content waiting for your review.
          </p>
          <button
            onClick={() => {
              onSetFilter('pending');
              onSetActiveTab('blog');
            }}
            style={{
              background: colors.warning,
              color: colors.white,
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
            }}
          >
            Review Pending Content →
          </button>
        </div>
      )}

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .content-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .content-cards-grid > div:last-child {
            grid-column: span 2;
          }
        }
      `}</style>
    </div>
  );
};

export default OverviewTab;