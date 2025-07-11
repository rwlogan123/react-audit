// File: src/dashboards/ClientDashboard/tabs/PublishingTab.jsx
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

// Status Badge Component
const StatusBadge = ({ status, children }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'scheduled':
        return { bg: '#DBEAFE', color: '#1E40AF' };
      case 'published':
        return { bg: '#D1FAE5', color: '#065F46' };
      case 'draft':
        return { bg: '#F3F4F6', color: '#6B7280' };
      case 'failed':
        return { bg: '#FEE2E2', color: '#991B1B' };
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

// Platform Icon Component
const PlatformIcon = ({ platform }) => {
  const icons = {
    'website': '🌐',
    'facebook': '📘',
    'instagram': '📷',
    'linkedin': '💼',
    'twitter': '🐦',
    'email': '📧',
    'google': '🌐'
  };
  
  return <span style={{ fontSize: '20px' }}>{icons[platform] || '📄'}</span>;
};

// Scheduled Content Card Component
const ScheduledContentCard = ({ item, onEdit, onDelete, onPublishNow }) => {
  const timeUntilPublish = new Date(item.scheduledFor) - new Date();
  const isOverdue = timeUntilPublish < 0;
  
  const formatTimeUntil = (ms) => {
    if (ms < 0) return 'Overdue';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderLeft: `4px solid ${
        item.status === 'published' ? colors.success :
        item.status === 'failed' ? colors.danger :
        item.status === 'scheduled' ? colors.info :
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
            <PlatformIcon platform={item.platform} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, margin: 0 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#666', margin: '4px 0 0 0' }}>
                {item.platform.charAt(0).toUpperCase() + item.platform.slice(1)} • {item.type}
              </p>
            </div>
          </div>
          
          <p style={{ color: '#666', margin: '8px 0', fontSize: '14px', lineHeight: '1.5' }}>
            {item.content ? item.content.substring(0, 120) + '...' : 'Content preview not available'}
          </p>
          
          {/* Scheduling Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginTop: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Scheduled For</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>
                {new Date(item.scheduledFor).toLocaleDateString()} at{' '}
                {new Date(item.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Time Until Publish</div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: isOverdue ? colors.danger : colors.success 
              }}>
                {formatTimeUntil(timeUntilPublish)}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {item.status === 'failed' && item.errorMessage && (
            <div style={{
              background: '#FEF2F2',
              border: `1px solid ${colors.danger}`,
              borderRadius: '6px',
              padding: '12px',
              marginTop: '12px',
              fontSize: '13px',
              color: colors.danger
            }}>
              <strong>Publishing Failed:</strong> {item.errorMessage}
            </div>
          )}
        </div>
        
        <StatusBadge status={item.status}>
          {item.status === 'scheduled' ? 'Scheduled' :
           item.status === 'published' ? 'Published' :
           item.status === 'failed' ? 'Failed' : 'Draft'}
        </StatusBadge>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: `1px solid ${colors.lightGray}`,
        flexWrap: 'wrap'
      }}>
        {item.status === 'scheduled' && (
          <>
            <button
              onClick={() => onPublishNow(item)}
              style={{
                background: colors.success,
                color: colors.white,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px'
              }}
            >
              🚀 Publish Now
            </button>
            <button
              onClick={() => onEdit(item)}
              style={{
                background: colors.primary,
                color: colors.white,
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px'
              }}
            >
              ✏️ Edit
            </button>
          </>
        )}
        
        {item.status === 'failed' && (
          <button
            onClick={() => onPublishNow(item)}
            style={{
              background: colors.warning,
              color: colors.white,
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px'
            }}
          >
            🔄 Retry
          </button>
        )}

        {item.status === 'published' && (
          <button
            style={{
              background: colors.white,
              color: colors.info,
              border: `1px solid ${colors.info}`,
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px'
            }}
          >
            📊 View Analytics
          </button>
        )}

        <button
          onClick={() => onDelete(item)}
          style={{
            background: colors.white,
            color: colors.danger,
            border: `1px solid ${colors.danger}`,
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '12px'
          }}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

// Main PublishingTab Component
const PublishingTab = ({ businessId, filter, onApprove, onReject }) => {
  const [scheduledContent, setScheduledContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock scheduled content data (replace with real API call later)
  useEffect(() => {
    setScheduledContent([
      {
        id: 1,
        type: 'blog',
        platform: 'website',
        title: 'Winter Roof Maintenance Tips',
        content: 'As winter approaches, Eagle Mountain homeowners need to prepare their roofs for harsh weather conditions. Our comprehensive guide covers essential maintenance tasks that can prevent costly repairs...',
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        status: 'scheduled',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        type: 'social',
        platform: 'facebook',
        title: 'Before & After: Eagle Mountain Project',
        content: '🏠 Amazing transformation! Check out this Eagle Mountain home we just completed. From damaged shingles to a beautiful new roof that will protect this family for decades. #EagleMountain #RoofingExperts',
        scheduledFor: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        status: 'scheduled',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        type: 'social',
        platform: 'instagram',
        title: 'Free Roof Inspection Offer',
        content: '✨ FREE roof inspection this week only! Spots are filling up fast. Book your appointment today and get peace of mind before winter hits. Link in bio! 📞 Call now!',
        scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(), // 12 hours from now
        status: 'scheduled',
        createdAt: new Date().toISOString()
      },
      {
        id: 4,
        type: 'email',
        platform: 'email',
        title: 'January Newsletter - Roof Care Tips',
        content: 'Dear Eagle Mountain neighbors, January is the perfect time to assess your roof\'s condition after the holiday season. Our latest newsletter includes...',
        scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        status: 'scheduled',
        createdAt: new Date().toISOString()
      },
      {
        id: 5,
        type: 'blog',
        platform: 'website',
        title: 'Holiday Roof Safety Guide',
        content: 'The holidays are here, and many homeowners are thinking about decorating their roofs with lights and decorations...',
        scheduledFor: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        status: 'published',
        createdAt: new Date().toISOString()
      },
      {
        id: 6,
        type: 'social',
        platform: 'linkedin',
        title: 'Professional Roofing Services',
        content: 'Eagle Mountain businesses trust us for their commercial roofing needs. Professional installation, maintenance, and repairs...',
        scheduledFor: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        status: 'failed',
        errorMessage: 'Authentication failed - LinkedIn token expired',
        createdAt: new Date().toISOString()
      }
    ]);
  }, [businessId]);

  const handleEdit = (item) => {
    alert(`Edit functionality for "${item.title}" would open a scheduling modal here`);
  };

  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      setScheduledContent(prev => prev.filter(content => content.id !== item.id));
    }
  };

  const handlePublishNow = (item) => {
    setScheduledContent(prev => 
      prev.map(content => 
        content.id === item.id 
          ? { ...content, status: 'published', publishedAt: new Date().toISOString() }
          : content
      )
    );
  };

  // Filter content based on active filter
  const filteredContent = scheduledContent.filter(item => {
    if (activeFilter === 'all') return true;
    return item.status === activeFilter;
  });

  // Calculate stats
  const stats = {
    scheduled: scheduledContent.filter(c => c.status === 'scheduled').length,
    published: scheduledContent.filter(c => c.status === 'published').length,
    failed: scheduledContent.filter(c => c.status === 'failed').length,
    total: scheduledContent.length
  };

  const nextPost = scheduledContent
    .filter(c => c.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))[0];

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
        <p style={{ color: colors.primary }}>Loading publishing schedule...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", margin: 0, color: colors.primary }}>
          📅 Publishing Schedule
        </h2>
        <button
          style={{
            background: colors.success,
            color: colors.white,
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Schedule New Post
        </button>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.info}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.info, marginBottom: '8px' }}>
            {stats.scheduled}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Scheduled</div>
        </div>
        
        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.success}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.success, marginBottom: '8px' }}>
            {stats.published}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Published</div>
        </div>

        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.danger}`
        }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: colors.danger, marginBottom: '8px' }}>
            {stats.failed}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Failed</div>
        </div>

        <div style={{
          background: colors.white,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          borderLeft: `4px solid ${colors.primary}`
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>
            {nextPost ? (
              <>
                Next: {new Date(nextPost.scheduledFor).toLocaleDateString()}<br/>
                <span style={{ fontSize: '14px', fontWeight: '400' }}>
                  {nextPost.title.substring(0, 25)}...
                </span>
              </>
            ) : (
              'No upcoming posts'
            )}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Next Scheduled</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'all', label: 'All', count: stats.total },
          { id: 'scheduled', label: 'Scheduled', count: stats.scheduled },
          { id: 'published', label: 'Published', count: stats.published },
          { id: 'failed', label: 'Failed', count: stats.failed }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setActiveFilter(filterOption.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeFilter === filterOption.id ? colors.primary : colors.lightGray,
              color: activeFilter === filterOption.id ? colors.white : '#666',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Scheduled Content List */}
      {filteredContent.length === 0 ? (
        <div style={{
          background: colors.lightGray,
          padding: "40px",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <h3 style={{ margin: '0 0 8px 0', color: colors.text }}>No Scheduled Content</h3>
          <p style={{ margin: 0, color: '#666' }}>
            Schedule your approved content to automatically publish across your marketing channels.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredContent
            .sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor))
            .map((item) => (
              <ScheduledContentCard 
                key={item.id} 
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onPublishNow={handlePublishNow}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default PublishingTab;