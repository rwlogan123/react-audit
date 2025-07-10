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
        return { bg: '#FEF3C7', color: '#D97706', label: 'Needs Response' };
      case 'approved':
        return { bg: '#D1FAE5', color: '#065F46', label: 'Responded' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Flagged' };
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

// Review Stats Overview Component
const ReviewStatsOverview = ({ stats }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.success}`,
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: colors.primary }}>
              {stats.average}⭐
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Average Rating</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '24px', fontWeight: '600', color: colors.primary }}>
              {stats.total}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Total Reviews</div>
          </div>
        </div>
      </div>

      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.warning}`,
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h4 style={{ color: colors.warning, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Response Rate</h4>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary }}>{stats.responseRate}%</div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {stats.needingResponse} reviews need responses
        </div>
      </div>

      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.info}`,
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h4 style={{ color: colors.info, marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>This Month</h4>
        <div style={{ fontSize: '32px', fontWeight: 'bold', color: colors.primary }}>+{stats.thisMonth}</div>
        <div style={{ fontSize: '14px', color: colors.success }}>
          ↑ {stats.monthlyGrowth}% from last month
        </div>
      </div>
    </div>
  );
};

// Review Card Component
const ReviewCard = ({ review, onRespond, onFlag }) => {
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'Google': return '#4285F4';
      case 'Facebook': return '#1877F2';
      case 'Yelp': return '#FF1C1C';
      default: return colors.info;
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderLeft: `4px solid ${review.responded ? colors.success : colors.warning}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{
              background: getPlatformColor(review.platform),
              color: colors.white,
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {review.platform}
            </span>
            <span style={{ color: colors.warning, fontSize: '16px' }}>
              {renderStars(review.rating)}
            </span>
            <span style={{ fontSize: '14px', color: '#666' }}>
              by {review.author}
            </span>
          </div>
          
          <div style={{
            background: '#F9FAFB',
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <p style={{ color: colors.primary, margin: '0', fontSize: '14px', lineHeight: '1.5' }}>
              "{review.text}"
            </p>
          </div>
          
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
            {review.date.toLocaleDateString()} • {review.verified ? 'Verified Customer' : 'Unverified'}
          </div>

          {/* Response Section */}
          {review.response && (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '16px',
              marginTop: '12px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: colors.success, marginBottom: '8px' }}>
                Response from {review.businessName}:
              </div>
              <p style={{ color: colors.primary, margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                {review.response}
              </p>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '8px' }}>
                Responded on {review.responseDate?.toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
        
        <StatusBadge status={review.responded ? 'approved' : 'pending'} />
      </div>

      {/* Action Buttons */}
      {!review.responded && (
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '16px',
          borderTop: `1px solid ${colors.lightGray}`
        }}>
          <button
            onClick={() => onRespond(review.id)}
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
            💬 Respond
          </button>
          <button
            onClick={() => onFlag(review.id)}
            style={{
              background: colors.white,
              color: colors.danger,
              border: `2px solid ${colors.danger}`,
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
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
            🚩 Flag
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
            🔗 View Original
          </button>
        </div>
      )}
    </div>
  );
};

// Review Generation Component
const ReviewGeneration = ({ onGenerateRequests, stats }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '16px' }}>
        🚀 Review Generation Campaign
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center', padding: '16px', background: '#EBF8FF', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.info }}>73%</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Request Open Rate</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: '#F0FDF4', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.success }}>28%</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Conversion to Review</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: '#FFFBEB', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.warning }}>156</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Requests Sent</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: '#FEF3C7', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>44</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Reviews Received</div>
        </div>
      </div>

      <div style={{
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: colors.success, marginBottom: '8px' }}>
          🎯 Automated Review Requests
        </h4>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: colors.primary, lineHeight: '1.5' }}>
          <li>Automatically sent 3 days after project completion</li>
          <li>Personalized messages with project photos</li>
          <li>Direct links to Google, Facebook, and Yelp</li>
          <li>Follow-up reminders for non-responders</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={onGenerateRequests}
          style={{
            background: colors.primary,
            color: colors.white,
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📧 Send Review Requests
        </button>
        <button
          style={{
            background: colors.white,
            color: colors.primary,
            border: `2px solid ${colors.primary}`,
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '16px'
          }}
        >
          ⚙️ Campaign Settings
        </button>
      </div>
    </div>
  );
};

// Rating Distribution Component
const RatingDistribution = ({ distribution }) => {
  const totalReviews = Object.values(distribution).reduce((sum, count) => sum + count, 0);

  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '20px' }}>
        📊 Rating Distribution
      </h3>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {[5, 4, 3, 2, 1].map(rating => {
          const count = distribution[rating] || 0;
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
          
          return (
            <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '60px', fontSize: '14px', fontWeight: '500' }}>
                {rating} ⭐
              </div>
              <div style={{ flex: 1, background: colors.lightGray, height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: rating >= 4 ? colors.success : rating >= 3 ? colors.warning : colors.danger,
                  transition: 'width 0.5s ease'
                }} />
              </div>
              <div style={{ width: '60px', textAlign: 'right', fontSize: '14px', color: '#666' }}>
                {count} ({Math.round(percentage)}%)
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{
        background: '#EBF8FF',
        border: '1px solid #BEE3F8',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.info, marginBottom: '8px' }}>
          💡 Review Strategy Insights
        </div>
        <div style={{ fontSize: '13px', color: colors.primary, lineHeight: '1.5' }}>
          {Math.round(((distribution[5] + distribution[4]) / totalReviews) * 100)}% of your reviews are 4-5 stars. 
          This strong reputation helps attract new customers and builds trust with prospects.
        </div>
      </div>
    </div>
  );
};

// Main ReviewsTab component
const ReviewsTab = ({ 
  businessName = "Sample Business",
  location = "Eagle Mountain, UT",
  onRespond = () => {},
  onFlag = () => {},
  onGenerateRequests = () => {}
}) => {
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [reviewData, setReviewData] = useState(null);

  useEffect(() => {
    // Simulate loading review data
    setTimeout(() => {
      setReviewData({
        stats: {
          total: 127,
          average: 4.8,
          responseRate: 68,
          needingResponse: 3,
          thisMonth: 8,
          monthlyGrowth: 23
        },
        distribution: {
          5: 98,
          4: 22,
          3: 5,
          2: 1,
          1: 1
        },
        reviews: [
          {
            id: 'review-1',
            platform: 'Google',
            author: 'Sarah M.',
            rating: 5,
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            text: 'Amazing work on our basement! The team was professional and finished on time. The quality exceeded our expectations.',
            responded: false,
            verified: true,
            businessName: businessName
          },
          {
            id: 'review-2',
            platform: 'Facebook',
            author: 'Mike Johnson',
            rating: 4,
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            text: 'Great service, just wish they had more availability. The work quality was excellent though.',
            responded: true,
            verified: true,
            businessName: businessName,
            response: 'Thank you for the feedback, Mike! We really appreciate your business and are glad you\'re happy with the quality. We\'re working on expanding our team to improve availability.',
            responseDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'review-3',
            platform: 'Yelp',
            author: 'Jennifer L.',
            rating: 5,
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            text: 'Highly recommend! They transformed our space beautifully. Professional, clean, and on budget.',
            responded: true,
            verified: true,
            businessName: businessName,
            response: 'Thank you so much, Jennifer! It was a pleasure working with you on your project. We\'re thrilled you love the transformation!',
            responseDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
          },
          {
            id: 'review-4',
            platform: 'Google',
            author: 'Robert K.',
            rating: 5,
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            text: 'Outstanding kitchen remodel! The attention to detail was impressive and they stayed within our timeline.',
            responded: false,
            verified: true,
            businessName: businessName
          },
          {
            id: 'review-5',
            platform: 'Facebook',
            author: 'Lisa T.',
            rating: 3,
            date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            text: 'Work was good but communication could have been better. Had to follow up multiple times for updates.',
            responded: false,
            verified: false,
            businessName: businessName
          }
        ]
      });
      setLoading(false);
    }, 500);
  }, [businessName]);

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
        <p style={{ color: colors.primary }}>Loading reviews...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const { stats, distribution, reviews } = reviewData;

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending' && review.responded) return false;
    if (filter === 'responded' && !review.responded) return false;
    if (platformFilter !== 'all' && review.platform !== platformFilter) return false;
    return true;
  });

  const handleRespond = (reviewId) => {
    const response = prompt('Enter your response to this review:');
    if (response) {
      const updatedReviews = reviews.map(review => 
        review.id === reviewId ? { 
          ...review, 
          responded: true, 
          response,
          responseDate: new Date()
        } : review
      );
      setReviewData(prev => ({ ...prev, reviews: updatedReviews }));
      onRespond(reviewId, response);
    }
  };

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, marginBottom: '24px' }}>
        Review Management
      </h2>

      {/* Review Stats */}
      <ReviewStatsOverview stats={stats} />

      {/* Review Generation */}
      <ReviewGeneration onGenerateRequests={onGenerateRequests} stats={stats} />

      {/* Rating Distribution */}
      <RatingDistribution distribution={distribution} />

      {/* Filter Controls */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
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
              All Reviews ({reviews.length})
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
              Need Response ({reviews.filter(r => !r.responded).length})
            </button>
            <button
              onClick={() => setFilter('responded')}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: filter === 'responded' ? colors.success : colors.lightGray,
                color: filter === 'responded' ? colors.white : '#666',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              Responded ({reviews.filter(r => r.responded).length})
            </button>
          </div>
        </div>

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
            {['Google', 'Facebook', 'Yelp'].map(platform => (
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
                {platform} ({reviews.filter(r => r.platform === platform).length})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px',
          borderBottom: `1px solid ${colors.lightGray}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, margin: 0 }}>
            Recent Reviews
          </h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Showing {filteredReviews.length} of {reviews.length} reviews
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          {filteredReviews.map(review => (
            <ReviewCard 
              key={review.id} 
              review={review}
              onRespond={handleRespond}
              onFlag={onFlag}
            />
          ))}

          {filteredReviews.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#666'
            }}>
              <p>No reviews found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo wrapper
const ReviewsTabDemo = () => {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: "100vh",
      background: "#f8fafc",
    }}>
      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <h1>⭐ Reviews Tab Component</h1>
        <p style={{ opacity: 0.8 }}>Review management with response tracking and generation</p>
      </div>

      <ReviewsTab 
        businessName="Eagle Mountain Remodeling"
        location="Eagle Mountain, UT"
        onRespond={(id, response) => console.log('Responded to review:', id, response)}
        onFlag={(id) => console.log('Flagged review:', id)}
        onGenerateRequests={() => console.log('Generate review requests')}
      />

      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", opacity: "0.8" }}>
          Ready for: src/dashboards/ClientDashboard/tabs/ReviewsTab.jsx
        </div>
      </div>
    </div>
  );
};

export default ReviewsTabDemo;