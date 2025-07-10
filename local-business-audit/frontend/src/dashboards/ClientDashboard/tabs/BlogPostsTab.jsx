// File: src/dashboards/ClientDashboard/tabs/BlogPostsTab.jsx
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

// API Functions (these should match your existing API)
const API_BASE = 'http://localhost:5000/api';

const contentApi = {
  getBusinessContent: async (businessId, filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE}/content/${businessId}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    } catch (error) {
      console.error('Get business content error:', error);
      throw error;
    }
  },

  approveContent: async (contentId) => {
    try {
      const response = await fetch(`${API_BASE}/content/${contentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to approve content');
      return response.json();
    } catch (error) {
      console.error('Approve content error:', error);
      throw error;
    }
  },

  rejectContent: async (contentId, feedback) => {
    try {
      const response = await fetch(`${API_BASE}/content/${contentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback })
      });
      if (!response.ok) throw new Error('Failed to reject content');
      return response.json();
    } catch (error) {
      console.error('Reject content error:', error);
      throw error;
    }
  },

  bulkApprove: async (contentIds) => {
    try {
      const response = await fetch(`${API_BASE}/content/bulk-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentIds })
      });
      if (!response.ok) throw new Error('Failed to bulk approve');
      return response.json();
    } catch (error) {
      console.error('Bulk approve error:', error);
      throw error;
    }
  }
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

// Content Card Component
const ContentCard = ({ item, isSelected, onToggleSelect, onApprove, onReject }) => {
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
            <span style={{ fontSize: '24px' }}>📝</span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, margin: 0 }}>
              {item.title || `Blog Post ${item._id?.slice(-4) || 'Draft'}`}
            </h3>
          </div>
          <p style={{ color: '#666', margin: '8px 0', fontSize: '14px', lineHeight: '1.5' }}>
            {item.content ? item.content.substring(0, 150) + '...' : 'Content preview not available'}
          </p>
          
          {/* Metadata */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#666' }}>
            <span>📄 {item.content?.split(' ').length || 0} words</span>
            {item.seoData && <span>🎯 SEO: {item.seoData.keyword}</span>}
            <span>📅 {new Date(item.createdAt || Date.now()).toLocaleDateString()}</span>
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
            onClick={() => onApprove(item._id || item.id)}
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
            onClick={() => onReject(item._id || item.id)}
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
        </div>
      )}
    </div>
  );
};

// Main BlogPostsTab component - THIS IS THE ONE BEING EXPORTED
const BlogPostsTab = ({ 
  businessId,
  filter: externalFilter = 'all',
  onApprove,
  onReject
}) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(externalFilter);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (businessId) {
      fetchBlogPosts();
    }
  }, [businessId, filter]);

  useEffect(() => {
    setFilter(externalFilter);
  }, [externalFilter]);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const response = await contentApi.getBusinessContent(businessId, { 
        contentType: 'blog',
        status: filter === 'all' ? undefined : filter 
      });
      setBlogPosts(response.data?.content || []);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId) => {
    try {
      await onApprove(contentId);
      fetchBlogPosts(); // Refresh the list
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (contentId) => {
    const feedback = prompt('Please provide feedback for rejection:');
    if (feedback) {
      try {
        await onReject(contentId, feedback);
        fetchBlogPosts(); // Refresh the list
      } catch (error) {
        console.error('Failed to reject:', error);
      }
    }
  };

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkApprove = async () => {
    try {
      await contentApi.bulkApprove(selectedItems);
      setSelectedItems([]);
      fetchBlogPosts();
    } catch (error) {
      console.error('Failed to bulk approve:', error);
    }
  };

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
        <p style={{ color: colors.primary }}>Loading blog posts...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const filteredContent = blogPosts.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: colors.primary }}>
        📝 Blog Posts
      </h2>

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
            {selectedItems.length} items selected
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

      {/* Filter Bar */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px'
      }}>
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
          All ({blogPosts.length})
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
          Pending ({blogPosts.filter(c => c.status === 'pending').length})
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
          Approved ({blogPosts.filter(c => c.status === 'approved').length})
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
          Needs Revision ({blogPosts.filter(c => c.status === 'rejected').length})
        </button>
      </div>

      {/* Content List */}
      {filteredContent.length === 0 ? (
        <div style={{
          background: colors.lightGray,
          padding: "40px",
          borderRadius: "12px",
          textAlign: "center"
        }}>
          <p>No blog posts found. Generate some test content to get started!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredContent.map((post) => (
            <ContentCard 
              key={post._id || post.id} 
              item={post}
              isSelected={selectedItems.includes(post._id || post.id)}
              onToggleSelect={() => handleToggleSelect(post._id || post.id)}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPostsTab;