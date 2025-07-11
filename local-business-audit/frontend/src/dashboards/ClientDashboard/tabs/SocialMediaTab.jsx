import React, { useState, useEffect } from 'react';

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

// StatusBadge component
const StatusBadge = ({ status, children }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#D97706', label: 'Pending Review' };
      case 'approved':
        return { bg: '#D1FAE5', color: '#065F46', label: 'Approved' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Needs Revision' };
      default:
        return { bg: colors.lightGray, color: '#666', label: status };
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
      {children || style.label}
    </span>
  );
};

// Social Media Content Card Component
const SocialContentCard = ({ item, isSelected, onToggleSelect, onApprove, onReject }) => {
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'Facebook': return '📘';
      case 'Instagram': return '📷';
      case 'LinkedIn': return '💼';
      default: return '📱';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Facebook': return '#1877F2';
      case 'Instagram': return '#E4405F';
      case 'LinkedIn': return '#0A66C2';
      default: return colors.info;
    }
  };

  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderLeft: `4px solid ${
        item.status === 'approved' ? colors.success :
        item.status === 'rejected' ? colors.danger :
        colors.warning
      }`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {item.status === 'pending' && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            )}
            <span style={{ fontSize: '24px' }}>{getPlatformIcon(item.platform)}</span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, margin: 0 }}>
              {item.platform} Post
            </h3>
            <span style={{
              background: getPlatformColor(item.platform),
              color: colors.white,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {item.platform}
            </span>
          </div>
          
          {/* Post Content Preview */}
          <div style={{
            background: '#F9FAFB',
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <p style={{ color: colors.primary, margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.5' }}>
              {item.content}
            </p>
            {item.hashtags && (
              <p style={{ color: colors.info, margin: 0, fontSize: '13px' }}>
                {item.hashtags.join(' ')}
              </p>
            )}
          </div>
          
          {/* Metadata */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#666' }}>
            <span>📝 {item.content.length} characters</span>
            <span>🏷️ {item.hashtags ? item.hashtags.length : 0} hashtags</span>
            <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
            {item.scheduledFor && (
              <span>⏰ Scheduled: {new Date(item.scheduledFor).toLocaleDateString()}</span>
            )}
          </div>

          {/* Feedback */}
          {item.feedback && (
            <div style={{
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              fontSize: '13px',
              color: '#92400E'
            }}>
              <strong>Revision Request:</strong> {item.feedback}
            </div>
          )}
        </div>
        
        <StatusBadge status={item.status} />
      </div>

      {/* Action Buttons */}
      {item.status === 'pending' && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${colors.lightGray}`
        }}>
          <button
            onClick={() => onApprove(item.id)}
            style={{
              background: colors.success,
              color: colors.white,
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✅ Approve
          </button>
          <button
            onClick={() => onReject(item.id)}
            style={{
              background: colors.white,
              color: colors.danger,
              border: `2px solid ${colors.danger}`,
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.danger;
              e.target.style.color = colors.white;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = colors.white;
              e.target.style.color = colors.danger;
            }}
          >
            ✏️ Request Changes
          </button>
          <button
            style={{
              background: colors.white,
              color: '#666',
              border: `2px solid ${colors.lightGray}`,
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#999';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = colors.lightGray;
            }}
          >
            👁️ Preview
          </button>
        </div>
      )}
    </div>
  );
};

// Main SocialMediaTab component
const SocialMediaTab = ({ 
  businessName = "Sample Business",
  location = "Eagle Mountain, UT",
  content = [],
  onApprove = () => {},
  onReject = () => {},
  onBulkApprove = () => {}
}) => {
  const [filter, setFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate mock social content
  const generateMockSocialContent = () => {
    const platforms = ['Facebook', 'Instagram', 'LinkedIn'];
    const postTemplates = [
      {
        content: `Check out our latest project! 🏠✨ Another beautiful basement transformation in ${location.split(',')[0]}. Ready to transform your space? Call us today for your free consultation!`,
        hashtags: ['#BasementFinishing', '#HomeImprovement', '#EagleMountain', '#CustomCarpentry']
      },
      {
        content: `💡 Pro Tip: Planning a basement renovation? Here are 3 things to consider before you start... 1) Moisture control 2) Proper lighting 3) Electrical planning. Questions? We're here to help!`,
        hashtags: ['#BasementTips', '#HomeRenovation', '#ExpertAdvice', '#UtahContractor']
      },
      {
        content: `🛠️ Behind the scenes at our latest kitchen remodel! Our team takes pride in every detail. Quality craftsmanship is what sets us apart. Book your consultation today!`,
        hashtags: ['#KitchenRemodel', '#QualityCraftsmanship', '#HomeDesign', '#UtahHomes']
      },
      {
        content: `⭐ "The team at ${businessName} exceeded our expectations! Professional, on-time, and amazing results." - Sarah M. Thank you for trusting us with your home!`,
        hashtags: ['#CustomerReview', '#HappyCustomers', '#FiveStars', '#TrustedContractor']
      }
    ];

    return Array.from({ length: 30 }, (_, i) => {
      const template = postTemplates[i % postTemplates.length];
      const platform = platforms[i % platforms.length];
      
      return {
        id: `social-${i}`,
        type: 'social',
        platform: platform,
        status: i < 22 ? 'pending' : i < 28 ? 'approved' : 'rejected',
        content: template.content,
        hashtags: template.hashtags,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        scheduledFor: null,
        feedback: i >= 28 ? 'Please make the tone more engaging and add a stronger call-to-action' : null
      };
    });
  };

  const [socialContent, setSocialContent] = useState([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setSocialContent(content.length > 0 ? content.filter(c => c.type === 'social') : generateMockSocialContent());
      setLoading(false);
    }, 500);
  }, [content]);

  const filteredContent = socialContent.filter(item => {
    if (filter !== 'all' && item.status !== filter) return false;
    if (platformFilter !== 'all' && item.platform !== platformFilter) return false;
    return true;
  });

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkApprove = () => {
    const updatedContent = socialContent.map(item => 
      selectedItems.includes(item.id) ? { ...item, status: 'approved' } : item
    );
    setSocialContent(updatedContent);
    setSelectedItems([]);
    onBulkApprove(selectedItems);
  };

  const handleApprove = (itemId) => {
    const updatedContent = socialContent.map(item => 
      item.id === itemId ? { ...item, status: 'approved' } : item
    );
    setSocialContent(updatedContent);
    onApprove(itemId);
  };

  const handleReject = (itemId) => {
    // In real implementation, this would open a feedback modal
    const feedback = prompt('Please provide feedback for revision:');
    if (feedback) {
      const updatedContent = socialContent.map(item => 
        item.id === itemId ? { ...item, status: 'rejected', feedback } : item
      );
      setSocialContent(updatedContent);
      onReject(itemId, feedback);
    }
  };

  // Get platform stats
  const platformStats = ['Facebook', 'Instagram', 'LinkedIn'].map(platform => ({
    platform,
    total: socialContent.filter(c => c.platform === platform).length,
    pending: socialContent.filter(c => c.platform === platform && c.status === 'pending').length,
    approved: socialContent.filter(c => c.platform === platform && c.status === 'approved').length
  }));

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${colors.primary}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: colors.primary }}>Loading social media posts...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Platform Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {platformStats.map(stat => (
          <div key={stat.platform} style={{
            background: colors.white,
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>
              {stat.platform === 'Facebook' ? '📘' : stat.platform === 'Instagram' ? '📷' : '💼'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.primary }}>
              {stat.total}
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
              {stat.platform} Posts
            </div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {stat.pending} pending • {stat.approved} approved
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div style={{
          background: colors.primary,
          color: colors.white,
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600' }}>
            {selectedItems.length} posts selected
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBulkApprove}
              style={{
                background: colors.success,
                color: colors.white,
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Approve All Selected
            </button>
            <button
              onClick={() => setSelectedItems([])}
              style={{
                background: 'transparent',
                color: colors.white,
                border: `1px solid ${colors.white}`,
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filter Bars */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px'
      }}>
        {/* Status Filter */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>
            Filter by Status:
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'all' ? colors.primary : colors.lightGray,
                color: filter === 'all' ? colors.white : '#666',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              All ({socialContent.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'pending' ? colors.warning : colors.lightGray,
                color: filter === 'pending' ? colors.white : '#666',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Pending ({socialContent.filter(c => c.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'approved' ? colors.success : colors.lightGray,
                color: filter === 'approved' ? colors.white : '#666',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Approved ({socialContent.filter(c => c.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'rejected' ? colors.danger : colors.lightGray,
                color: filter === 'rejected' ? colors.white : '#666',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Needs Revision ({socialContent.filter(c => c.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Platform Filter */}
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>
            Filter by Platform:
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setPlatformFilter('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: platformFilter === 'all' ? colors.primary : colors.lightGray,
                color: platformFilter === 'all' ? colors.white : '#666',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              All Platforms
            </button>
            {['Facebook', 'Instagram', 'LinkedIn'].map(platform => (
              <button
                key={platform}
                onClick={() => setPlatformFilter(platform)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: platformFilter === platform ? colors.info : colors.lightGray,
                  color: platformFilter === platform ? colors.white : '#666',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {platform} ({socialContent.filter(c => c.platform === platform).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content List */}
      {filteredContent.map(item => (
        <SocialContentCard 
          key={item.id} 
          item={item}
          isSelected={selectedItems.includes(item.id)}
          onToggleSelect={() => handleToggleSelect(item.id)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}

      {filteredContent.length === 0 && (
        <div style={{
          background: colors.white,
          border: `1px solid ${colors.lightGray}`,
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', fontSize: '16px' }}>
            No {filter !== 'all' ? filter : ''} {platformFilter !== 'all' ? platformFilter : ''} posts found.
          </p>
        </div>
      )}
    </div>
  );
};

export default SocialMediaTab;