import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  
  // Get data from session
  const onboardingData = JSON.parse(sessionStorage.getItem('onboardingData') || '{}');
  const businessInfo = onboardingData.businessInfo || {};
  const responses = onboardingData.responses || {};
  
  // Mock data for demo
  const businessName = businessInfo.businessName || 'Your Business';
  const firstName = businessInfo.contactInfo?.firstName || 'there';
  
  // Calculate content generation progress (mock)
  const [progress, setProgress] = useState(15);
  
  useEffect(() => {
    // Simulate content generation progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 2000);
    
    return () => clearInterval(timer);
  }, []);

  const colors = {
    primary: "#2A3B4A",
    secondary: "#10B981",
    white: "#FFFFFF",
    gray: "#F3F4F6",
    lightGray: "#E5E7EB",
    text: "#1F2937",
    textLight: "#6B7280",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  };

  // Mock content library
  const contentLibrary = {
    blogPosts: [
      {
        id: 1,
        title: "5 Signs Your Water Heater Is About to Fail",
        status: progress >= 25 ? 'ready' : 'generating',
        excerpt: "Don't wait until you're taking cold showers. Here are the warning signs every homeowner should know...",
        wordCount: 1200,
        seoScore: 92
      },
      {
        id: 2,
        title: "Emergency Plumbing: What to Do Before We Arrive",
        status: progress >= 50 ? 'ready' : 'generating',
        excerpt: "When water is flooding your home, every second counts. Here's your step-by-step emergency guide...",
        wordCount: 1000,
        seoScore: 88
      },
      {
        id: 3,
        title: "The True Cost of DIY Plumbing Repairs",
        status: progress >= 75 ? 'ready' : 'generating',
        excerpt: "That $50 DIY fix could cost you thousands. Learn when to call a professional...",
        wordCount: 1100,
        seoScore: 90
      }
    ],
    socialPosts: [
      {
        id: 1,
        platform: 'Facebook',
        content: "🚨 Toilet overflowing at 2am? Here's the #1 thing to do FIRST (hint: it's not what you think)...",
        status: progress >= 30 ? 'ready' : 'generating',
        engagement: 'High'
      },
      {
        id: 2,
        platform: 'Instagram',
        content: "That tiny drip = 3,000 gallons wasted per year 💧 Swipe to see how much you're really losing...",
        status: progress >= 60 ? 'ready' : 'generating',
        engagement: 'Very High'
      }
    ],
    googlePosts: [
      {
        id: 1,
        type: 'What\'s New',
        title: "24/7 Emergency Service Now Available",
        content: "Burst pipe at midnight? We're here for you. Call now for immediate help.",
        status: progress >= 40 ? 'ready' : 'generating'
      },
      {
        id: 2,
        type: 'Offer',
        title: "$50 Off Your First Service Call",
        content: "New customers save $50 on any plumbing service. Mention this post when calling.",
        status: progress >= 80 ? 'ready' : 'generating'
      }
    ],
    emailTemplates: [
      {
        id: 1,
        name: "Welcome Series (5 emails)",
        purpose: "Nurture new leads into customers",
        status: progress >= 90 ? 'ready' : 'generating'
      },
      {
        id: 2,
        name: "Seasonal Maintenance Reminders",
        purpose: "Keep customers engaged year-round",
        status: progress >= 100 ? 'ready' : 'generating'
      }
    ]
  };

  // Content preview modal
  const ContentPreviewModal = () => {
    if (!showContentPreview || !selectedContent) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}>
        <div style={{
          background: colors.white,
          borderRadius: '12px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{
            padding: '24px',
            borderBottom: `1px solid ${colors.lightGray}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: colors.text }}>Content Preview</h3>
            <button
              onClick={() => setShowContentPreview(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: colors.textLight
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ padding: '24px' }}>
            <h2 style={{ color: colors.primary, marginBottom: '16px' }}>
              {selectedContent.title}
            </h2>
            <div style={{
              background: colors.gray,
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ margin: 0, lineHeight: '1.6', color: colors.text }}>
                {selectedContent.excerpt}
              </p>
              <p style={{ 
                marginTop: '16px', 
                color: colors.textLight,
                fontSize: '14px'
              }}>
                [Content continues with detailed tips, local examples, and a clear call-to-action...]
              </p>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowContentPreview(false)}
                style={{
                  background: 'transparent',
                  color: colors.primary,
                  border: `1px solid ${colors.primary}`,
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Close
              </button>
              <button
                style={{
                  background: colors.secondary,
                  color: colors.white,
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Download All Content
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'blog', label: 'Blog Posts', icon: '📝' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'google', label: 'Google Posts', icon: '📍' },
    { id: 'email', label: 'Email Templates', icon: '✉️' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.gray,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: colors.white,
        borderBottom: `1px solid ${colors.lightGray}`,
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: colors.primary,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.white,
              fontWeight: 'bold',
              fontSize: '18px',
            }}>
              B
            </div>
            <div>
              <h1 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                color: colors.text 
              }}>
                Content Dashboard
              </h1>
              <p style={{ 
                margin: 0, 
                fontSize: '14px', 
                color: colors.textLight 
              }}>
                {businessName}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              color: colors.primary,
              border: `1px solid ${colors.primary}`,
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Welcome Section */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
        color: colors.white,
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: '700',
          marginBottom: '16px' 
        }}>
          Welcome back, {firstName}! 🎉
        </h2>
        <p style={{ 
          fontSize: '18px',
          opacity: 0.9,
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          Your personalized content library is being created. 
          This typically takes 24 hours, but we're giving you a sneak peek!
        </p>
        
        {/* Progress Bar */}
        <div style={{
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <span>Content Generation Progress</span>
            <span>{progress}%</span>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            height: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: colors.secondary,
              height: '100%',
              width: `${progress}%`,
              transition: 'width 0.5s ease',
              borderRadius: '8px'
            }} />
          </div>
          <p style={{
            marginTop: '8px',
            fontSize: '14px',
            opacity: 0.8
          }}>
            {progress < 100 
              ? 'Our AI is crafting content specifically for your business...'
              : '✅ All content ready for download!'
            }
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        background: colors.white,
        borderBottom: `1px solid ${colors.lightGray}`,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          overflowX: 'auto',
          padding: '0 20px'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '16px 24px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: activeTab === tab.id ? colors.primary : colors.textLight,
                borderBottom: activeTab === tab.id 
                  ? `3px solid ${colors.primary}` 
                  : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        maxWidth: '1200px',
        margin: '20px auto',
        padding: '0 20px'
      }}>
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}>
              <div style={{
                background: colors.white,
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${colors.secondary}`
              }}>
                <div style={{ fontSize: '14px', color: colors.textLight, marginBottom: '8px' }}>
                  Total Content Pieces
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text }}>
                  48
                </div>
                <div style={{ fontSize: '12px', color: colors.secondary, marginTop: '4px' }}>
                  Across all platforms
                </div>
              </div>
              
              <div style={{
                background: colors.white,
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${colors.info}`
              }}>
                <div style={{ fontSize: '14px', color: colors.textLight, marginBottom: '8px' }}>
                  Estimated Reach
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text }}>
                  5,000+
                </div>
                <div style={{ fontSize: '12px', color: colors.info, marginTop: '4px' }}>
                  Monthly impressions
                </div>
              </div>
              
              <div style={{
                background: colors.white,
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${colors.warning}`
              }}>
                <div style={{ fontSize: '14px', color: colors.textLight, marginBottom: '8px' }}>
                  Time Saved
                </div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: colors.text }}>
                  40 hrs
                </div>
                <div style={{ fontSize: '12px', color: colors.warning, marginTop: '4px' }}>
                  Of content creation
                </div>
              </div>
            </div>

            {/* Content Preview */}
            <div style={{
              background: colors.white,
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: colors.text,
                marginBottom: '20px'
              }}>
                Your Content Library Preview
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px'
              }}>
                {/* Blog Posts */}
                <div style={{
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.primary,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📝 Blog Posts ({contentLibrary.blogPosts.length})
                  </h4>
                  <ul style={{
                    margin: 0,
                    padding: 0,
                    listStyle: 'none'
                  }}>
                    {contentLibrary.blogPosts.slice(0, 3).map(post => (
                      <li key={post.id} style={{
                        padding: '8px 0',
                        borderBottom: `1px solid ${colors.lightGray}`,
                        fontSize: '14px',
                        color: colors.text,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (post.status === 'ready') {
                          setSelectedContent(post);
                          setShowContentPreview(true);
                        }
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {post.status === 'ready' ? '✅' : '⏳'}
                          <span style={{ 
                            flex: 1,
                            opacity: post.status === 'ready' ? 1 : 0.5
                          }}>
                            {post.title}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Social Media */}
                <div style={{
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.primary,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📱 Social Media (30 posts)
                  </h4>
                  <div style={{ fontSize: '14px', color: colors.text }}>
                    <div style={{ marginBottom: '8px' }}>
                      📘 Facebook: 10 posts
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      📷 Instagram: 10 posts
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      💼 LinkedIn: 10 posts
                    </div>
                  </div>
                </div>

                {/* Google Business */}
                <div style={{
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '8px',
                  padding: '20px'
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: colors.primary,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    📍 Google Business (5 posts)
                  </h4>
                  <div style={{ fontSize: '14px', color: colors.text }}>
                    <div style={{ marginBottom: '8px' }}>
                      🆕 What's New: 2 posts
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      🎯 Offers: 2 posts
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      📅 Events: 1 post
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div style={{
              background: '#F0FDF4',
              border: `1px solid ${colors.secondary}`,
              borderRadius: '12px',
              padding: '24px',
              marginTop: '20px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: colors.secondary,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🚀 What Happens Next?
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: colors.text, marginBottom: '4px' }}>
                    Within 24 Hours
                  </div>
                  <div style={{ fontSize: '14px', color: colors.textLight }}>
                    All content will be ready for download
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: colors.text, marginBottom: '4px' }}>
                    Publishing Calendar
                  </div>
                  <div style={{ fontSize: '14px', color: colors.textLight }}>
                    We'll provide a 90-day posting schedule
                  </div>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: colors.text, marginBottom: '4px' }}>
                    Training Video
                  </div>
                  <div style={{ fontSize: '14px', color: colors.textLight }}>
                    Learn how to customize and post content
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div style={{
            background: colors.white,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '20px'
            }}>
              Blog Posts Library
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              {contentLibrary.blogPosts.map(post => (
                <div key={post.id} style={{
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: '8px',
                  padding: '20px',
                  cursor: post.status === 'ready' ? 'pointer' : 'default',
                  opacity: post.status === 'ready' ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}
                onClick={() => {
                  if (post.status === 'ready') {
                    setSelectedContent(post);
                    setShowContentPreview(true);
                  }
                }}
                onMouseEnter={(e) => {
                  if (post.status === 'ready') {
                    e.currentTarget.style.borderColor = colors.primary;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.lightGray;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: colors.primary,
                      margin: 0,
                      flex: 1
                    }}>
                      {post.title}
                    </h4>
                    <span style={{
                      background: post.status === 'ready' ? colors.secondary : colors.warning,
                      color: colors.white,
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {post.status === 'ready' ? 'Ready' : 'Generating...'}
                    </span>
                  </div>
                  
                  <p style={{
                    fontSize: '14px',
                    color: colors.textLight,
                    marginBottom: '12px',
                    lineHeight: '1.5'
                  }}>
                    {post.excerpt}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '13px',
                    color: colors.textLight
                  }}>
                    <span>📝 {post.wordCount} words</span>
                    <span>🎯 SEO Score: {post.seoScore}/100</span>
                    {post.status === 'ready' && (
                      <span style={{ color: colors.info, fontWeight: '600' }}>
                        Click to preview →
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other tabs */}
        {(activeTab === 'social' || activeTab === 'google' || activeTab === 'email') && (
          <div style={{
            background: colors.white,
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {tabs.find(t => t.id === activeTab)?.icon}
            </div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '12px'
            }}>
              {tabs.find(t => t.id === activeTab)?.label} Coming Soon!
            </h3>
            <p style={{
              fontSize: '16px',
              color: colors.textLight,
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              Your {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} content is being crafted by our AI. 
              Check back in a few hours!
            </p>
            
            <div style={{
              marginTop: '32px',
              padding: '20px',
              background: colors.gray,
              borderRadius: '8px',
              display: 'inline-block'
            }}>
              <div style={{
                fontSize: '14px',
                color: colors.textLight,
                marginBottom: '8px'
              }}>
                Generation Progress
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: colors.primary
              }}>
                {progress}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Preview Modal */}
      <ContentPreviewModal />
    </div>
  );
};

export default Dashboard;