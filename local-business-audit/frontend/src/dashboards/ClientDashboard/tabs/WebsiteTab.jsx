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
        return { bg: '#FEF3C7', color: '#D97706', label: 'Pending' };
      case 'approved':
        return { bg: '#D1FAE5', color: '#065F46', label: 'Completed' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Needs Revision' };
      case 'in_progress':
        return { bg: '#DBEAFE', color: '#1E40AF', label: 'In Progress' };
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

// Website Status Overview Component
const WebsiteStatusOverview = ({ websiteStatus }) => {
  const getStatusInfo = () => {
    switch (websiteStatus.status) {
      case 'planning':
        return { icon: '📋', text: 'Planning Phase', color: colors.warning };
      case 'in_progress':
        return { icon: '🔨', text: 'In Development', color: colors.info };
      case 'review':
        return { icon: '👀', text: 'In Review', color: colors.warning };
      case 'live':
        return { icon: '🟢', text: 'Live', color: colors.success };
      default:
        return { icon: '📋', text: 'Planning', color: colors.warning };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
      color: colors.white,
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '32px'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Website Status</div>
          <div style={{ fontSize: '24px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{statusInfo.icon}</span>
            {statusInfo.text}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Preview URL</div>
          <a href={`https://${websiteStatus.url}`} style={{ 
            fontSize: '16px', 
            color: colors.white, 
            textDecoration: 'underline' 
          }}>
            {websiteStatus.url}
          </a>
        </div>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Expected Launch</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            {websiteStatus.launchDate.toLocaleDateString()}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Progress</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>
            {Math.round((websiteStatus.completedPhases.length / websiteStatus.totalPhases) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
};

// Development Phases Component
const DevelopmentPhases = ({ phases, currentPhase }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '24px' }}>
        🚀 Development Progress
      </h3>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {phases.map((phase, index) => {
          const isCompleted = phase.status === 'completed';
          const isInProgress = phase.status === 'in_progress';
          const isPending = phase.status === 'pending';

          return (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              background: isCompleted ? '#F0FDF4' : 
                         isInProgress ? '#FEF3C7' : '#F9FAFB',
              borderRadius: '8px',
              border: `1px solid ${
                isCompleted ? '#BBF7D0' : 
                isInProgress ? '#FDE68A' : colors.lightGray
              }`
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isCompleted ? colors.success : 
                           isInProgress ? colors.warning : colors.lightGray,
                color: colors.white,
                fontSize: '16px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {isCompleted ? '✓' : 
                 isInProgress ? '•' : 
                 index + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: colors.primary, marginBottom: '4px' }}>
                  {phase.name}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>{phase.description}</div>
                {phase.deliverables && (
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    Deliverables: {phase.deliverables.join(', ')}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <StatusBadge status={phase.status}>
                  {isCompleted ? 'Completed' : 
                   isInProgress ? 'In Progress' : 'Pending'}
                </StatusBadge>
                {phase.completedDate && (
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {new Date(phase.completedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Page Status Component
const PageStatus = ({ pages, onPageReview }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '32px'
    }}>
      <div style={{ 
        padding: '20px', 
        borderBottom: `1px solid ${colors.lightGray}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, margin: 0 }}>
          📄 Page Development Status
        </h3>
        <button style={{
          background: colors.info,
          color: colors.white,
          border: 'none',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          Preview Site →
        </button>
      </div>
      
      <div style={{ padding: '20px' }}>
        {pages.map((page, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderBottom: index < pages.length - 1 ? `1px solid ${colors.lightGray}` : 'none'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: page.status === 'completed' ? colors.success : 
                           page.status === 'in_progress' ? colors.warning : colors.lightGray
              }} />
              <div>
                <div style={{ fontWeight: '600', color: colors.primary }}>{page.name}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{page.path}</div>
                {page.features && (
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>
                    Features: {page.features.join(', ')}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {page.seoScore > 0 && (
                <span style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: page.seoScore >= 80 ? colors.success : colors.warning
                }}>
                  SEO: {page.seoScore}/100
                </span>
              )}
              {page.wordCount && (
                <span style={{
                  fontSize: '13px',
                  color: '#666'
                }}>
                  {page.wordCount} words
                </span>
              )}
              <StatusBadge status={page.status}>
                {page.status === 'completed' ? 'Completed' : 
                 page.status === 'in_progress' ? 'In Progress' : 'Pending'}
              </StatusBadge>
              <button 
                onClick={() => onPageReview(page)}
                style={{
                  padding: '6px 12px',
                  background: colors.primary,
                  color: colors.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Features Checklist Component
const FeaturesChecklist = ({ features }) => {
  return (
    <div style={{
      background: '#EBF8FF',
      border: '1px solid #BEE3F8',
      borderRadius: '12px',
      padding: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.info, marginBottom: '16px' }}>
        🚀 Website Features Included
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
        {features.map((feature, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              color: feature.included ? colors.success : '#ccc', 
              fontSize: '16px' 
            }}>
              {feature.included ? '✓' : '○'}
            </span>
            <span style={{ 
              fontSize: '14px', 
              color: feature.included ? colors.primary : '#999',
              textDecoration: feature.included ? 'none' : 'line-through'
            }}>
              {feature.name}
            </span>
            {feature.status && (
              <StatusBadge status={feature.status}>
                {feature.statusText}
              </StatusBadge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main WebsiteTab component
const WebsiteTab = ({ 
  businessName = "Sample Business",
  location = "Eagle Mountain, UT",
  onPageReview = () => {}
}) => {
  const [loading, setLoading] = useState(true);
  const [websiteData, setWebsiteData] = useState(null);

  useEffect(() => {
    // Simulate loading website data
    setTimeout(() => {
      setWebsiteData({
        websiteStatus: {
          status: 'in_progress', // planning, in_progress, review, live
          currentPhase: 'design',
          completedPhases: ['discovery', 'sitemap'],
          totalPhases: 6,
          url: 'preview.brandaide.com/sample-business',
          launchDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        },
        phases: [
          { 
            name: 'Discovery & Planning', 
            status: 'completed', 
            description: 'Business analysis, target audience research, and project requirements',
            deliverables: ['Project brief', 'Sitemap', 'Wireframes'],
            completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          },
          { 
            name: 'Content Strategy', 
            status: 'completed', 
            description: 'SEO keyword research and content planning for all pages',
            deliverables: ['Content strategy', 'Keyword research', 'Content outlines'],
            completedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          },
          { 
            name: 'Design & Branding', 
            status: 'in_progress', 
            description: 'Visual design, brand integration, and UI/UX development',
            deliverables: ['Design mockups', 'Style guide', 'Brand elements']
          },
          { 
            name: 'Development', 
            status: 'pending', 
            description: 'Frontend and backend development, CMS setup',
            deliverables: ['Functional website', 'CMS setup', 'Forms integration']
          },
          { 
            name: 'Content Integration', 
            status: 'pending', 
            description: 'Adding all content, images, and SEO optimization',
            deliverables: ['Content population', 'Image optimization', 'SEO implementation']
          },
          { 
            name: 'Testing & Launch', 
            status: 'pending', 
            description: 'Quality assurance, performance optimization, and go-live',
            deliverables: ['QA testing', 'Performance optimization', 'Live launch']
          },
        ],
        pages: [
          { 
            name: 'Home', 
            status: 'completed', 
            path: '/', 
            seoScore: 92, 
            wordCount: 1200,
            features: ['Hero section', 'Services overview', 'Testimonials', 'CTA forms']
          },
          { 
            name: 'About Us', 
            status: 'completed', 
            path: '/about', 
            seoScore: 88, 
            wordCount: 800,
            features: ['Company story', 'Team profiles', 'Certifications']
          },
          { 
            name: 'Services', 
            status: 'in_progress', 
            path: '/services', 
            seoScore: 0, 
            wordCount: 0,
            features: ['Service listings', 'Portfolio gallery', 'Pricing info']
          },
          { 
            name: 'Basement Finishing', 
            status: 'in_progress', 
            path: '/services/basement-finishing', 
            seoScore: 0, 
            wordCount: 0,
            features: ['Service details', 'Process overview', 'Before/after gallery']
          },
          { 
            name: 'Kitchen Remodeling', 
            status: 'pending', 
            path: '/services/kitchen-remodeling', 
            seoScore: 0, 
            wordCount: 0,
            features: ['Service details', 'Design options', 'Portfolio']
          },
          { 
            name: 'Portfolio', 
            status: 'pending', 
            path: '/portfolio', 
            seoScore: 0, 
            wordCount: 0,
            features: ['Project gallery', 'Case studies', 'Client testimonials']
          },
          { 
            name: 'Contact', 
            status: 'pending', 
            path: '/contact', 
            seoScore: 0, 
            wordCount: 0,
            features: ['Contact form', 'Location map', 'Business hours']
          },
          { 
            name: 'Blog', 
            status: 'pending', 
            path: '/blog', 
            seoScore: 0, 
            wordCount: 0,
            features: ['Blog listing', 'Categories', 'Search functionality']
          },
        ],
        features: [
          { name: 'Mobile Responsive Design', included: true, status: 'completed', statusText: 'Done' },
          { name: 'SSL Security Certificate', included: true, status: 'completed', statusText: 'Active' },
          { name: 'Google Analytics Integration', included: true, status: 'pending', statusText: 'Setup' },
          { name: 'Contact Form with Spam Protection', included: true, status: 'pending', statusText: 'Dev' },
          { name: 'SEO Optimization (All Pages)', included: true, status: 'in_progress', statusText: 'Ongoing' },
          { name: 'Fast Loading Speed (<3s)', included: true, status: 'in_progress', statusText: 'Optimizing' },
          { name: 'Social Media Integration', included: true, status: 'pending', statusText: 'Planned' },
          { name: 'Blog/News Section', included: true, status: 'pending', statusText: 'Planned' },
          { name: 'Service Area Pages', included: true, status: 'pending', statusText: 'Phase 2' },
          { name: 'Lead Capture Forms', included: true, status: 'pending', statusText: 'Dev' },
          { name: 'Live Chat Widget', included: false },
          { name: 'E-commerce Functionality', included: false },
        ]
      });
      setLoading(false);
    }, 500);
  }, []);

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
        <p style={{ color: colors.primary }}>Loading website status...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const { websiteStatus, phases, pages, features } = websiteData;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>
        Website Development
      </h2>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        Track your custom website development from concept to launch
      </p>

      {/* Status Overview */}
      <WebsiteStatusOverview websiteStatus={websiteStatus} />

      {/* Development Phases */}
      <DevelopmentPhases phases={phases} currentPhase={websiteStatus.currentPhase} />

      {/* Page Status */}
      <PageStatus pages={pages} onPageReview={onPageReview} />

      {/* Features Checklist */}
      <FeaturesChecklist features={features} />

      {/* Timeline Note */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '12px',
        padding: '24px',
        marginTop: '32px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '12px' }}>
          📅 Project Timeline
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Project Start:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>2 weeks ago</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Current Phase:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Design & Branding (Week 3-4)</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Expected Launch:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{websiteStatus.launchDate.toLocaleDateString()}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Total Duration:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>6-8 weeks</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo wrapper
const WebsiteTabDemo = () => {
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
        <h1>🌐 Website Tab Component</h1>
        <p style={{ opacity: 0.8 }}>Development tracking with phases, pages, and features</p>
      </div>

      <WebsiteTab 
        businessName="Eagle Mountain Remodeling"
        location="Eagle Mountain, UT"
        onPageReview={(page) => console.log('Review page:', page)}
      />

      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", opacity: "0.8" }}>
          Ready for: src/dashboards/ClientDashboard/tabs/WebsiteTab.jsx
        </div>
      </div>
    </div>
  );
};

export default WebsiteTabDemo;