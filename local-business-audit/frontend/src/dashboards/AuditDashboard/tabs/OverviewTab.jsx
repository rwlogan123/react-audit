// File: src/dashboards/AuditDashboard/tabs/OverviewTab.jsx
import React from 'react';

const StatusBadge = ({ status, children }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'excellent': 
      case 'good': 
        return { bg: '#D1FAE5', color: '#065F46', border: '#10B981' };
      case 'warning': 
        return { bg: '#FEF3C7', color: '#D97706', border: '#F59E0B' };
      case 'critical': 
        return { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' };
      default: 
        return { bg: '#E1E1E1', color: '#666', border: '#ccc' };
    }
  };

  const statusColors = getStatusColors();
  return (
    <span style={{
      background: statusColors.bg,
      color: statusColors.color,
      border: `1px solid ${statusColors.border}`,
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

// Helper component for analysis cards
const AnalysisCard = ({ title, color, items, description }) => (
  <div style={{
    background: '#FFFFFF',
    border: '1px solid #E1E1E1',
    borderLeft: `4px solid ${color}`,
    borderRadius: '12px',
    padding: '24px'
  }}>
    <h3 style={{
      fontSize: '18px',
      fontWeight: '700',
      color: color,
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    }}>
      {title}
    </h3>
    <div style={{ marginBottom: '16px' }}>
      {items.map((item, index) => (
        <div key={index} style={{ marginBottom: '12px' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '500', 
            color: '#2A3B4A', 
            marginBottom: '4px' 
          }}>
            {item.label}:
          </div>
          <StatusBadge status={item.status}>{item.value}</StatusBadge>
        </div>
      ))}
    </div>
    <div style={{
      background: color === '#10B981' ? '#F0FDF4' : 
                 color === '#EF4444' ? '#FEF2F2' : '#FFFBEB',
      border: `1px solid ${color === '#10B981' ? '#BBF7D0' : 
                          color === '#EF4444' ? '#FECACA' : '#FDE68A'}`,
      padding: '16px',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#2A3B4A'
    }}>
      <strong style={{ color: color }}>{description.title}:</strong> {description.text}
    </div>
  </div>
);

const OverviewTab = ({ data, colors, navigate }) => {
  const metricBoxes = [
    {
      title: "Market Position",
      score: `${data.visibilityScore}/100`,
      subtitle: data.visibilityScore >= 80 ? "Excellent" : data.visibilityScore >= 60 ? "Good" : "Needs improvement",
      status: data.visibilityScore >= 80 ? "excellent" : data.visibilityScore >= 60 ? "good" : "critical",
    },
    {
      title: "Local SEO",
      score: `${data.localContentScore}/100`,
      subtitle: "Need immediate attention",
      status: "critical",
    },
    {
      title: "Google Profile",
      score: `${data.completenessScore}/100`,
      subtitle: "Strong foundation",
      status: "good",
    },
    {
      title: "Website Speed",
      score: `${data.pagespeedAnalysis.desktopScore}/100`,
      subtitle: "Optimization needed",
      status: "critical",
    },
    {
      title: "Social Media",
      score: `${data.socialMediaAnalysis.socialScore}/100`,
      subtitle: "Opportunities missed",
      status: "critical",
    },
    {
      title: "Citations",
      score: `${data.napAnalysis.consistencyScore}/100`,
      subtitle: "Critical issues found",
      status: "critical",
    }
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "16px",
        color: colors.primary,
      }}>
        Executive Summary
      </h2>
      
      <div style={{
        background: colors.lightGray,
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "24px",
        borderLeft: `4px solid ${colors.primary}`,
      }}>
        <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
          <strong>Bottom Line:</strong> {data.auditSummary} Your Google Business Profile completeness is strong at {data.completenessScore}%, but social media presence is minimal at {data.socialMediaAnalysis.socialScore}% and citation coverage is critically low at {data.napAnalysis.consistencyScore}%. While you lead in quality, competitors are gaining ground through better digital optimization.
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontWeight: '600', color: colors.primary }}>Progress</span>
          <span style={{ fontWeight: '600', color: colors.primary }}>{data.visibilityScore}%</span>
        </div>
        <div style={{
          width: '100%',
          background: colors.lightGray,
          borderRadius: '6px',
          height: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            borderRadius: '6px',
            background: data.visibilityScore >= 80 ? colors.success : 
                       data.visibilityScore >= 60 ? colors.warning : colors.danger,
            width: `${data.visibilityScore}%`,
            transition: 'width 1s ease-in-out'
          }} />
        </div>
      </div>

      {/* Analysis Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <AnalysisCard 
          title="📍 Google Business Profile"
          color={colors.success}
          items={[
            { label: "Rating & Reviews", status: "excellent", value: `${data.rating}⭐ (${data.reviewCount} reviews) - Excellent` },
            { label: "Photos Uploaded", status: "warning", value: `${data.photoCount} photos - Need 8 more` },
            { label: "Profile Completeness", status: "good", value: `${data.completenessScore}% - Very Good` },
            { label: "Recent Activity", status: "critical", value: "No posts in 3 months" }
          ]}
          description={{
            title: "Strength",
            text: "Perfect rating puts you ahead of 90% of competitors. Regular posting could boost visibility significantly."
          }}
        />

        <AnalysisCard 
          title="📱 Social Media Presence"
          color={colors.danger}
          items={[
            { label: "Active Platforms", status: "critical", value: `${data.socialMediaAnalysis.platforms.length} of 4 recommended` },
            { label: "Instagram", status: "good", value: "Active (247 followers)" },
            { label: "Facebook Business", status: "critical", value: "Active but limited" },
            { label: "LinkedIn & YouTube", status: "critical", value: "Missing" }
          ]}
          description={{
            title: "Critical Gap",
            text: `Social score of ${data.socialMediaAnalysis.socialScore}/100 means you're missing significant opportunities for local customer discovery.`
          }}
        />

        <AnalysisCard 
          title="📋 Citations & Directories"
          color={colors.warning}
          items={[
            { label: "Directory Coverage", status: "critical", value: `${data.citationAnalysis.citationCompletionRate}% (${data.directoryLinksCount} of 15 key directories)` },
            { label: "NAP Consistency", status: "critical", value: `${data.napAnalysis.consistencyScore}% - Critical Issues` },
            { label: "Found On", status: "warning", value: "Thumbtack, Angi, Yelp" },
            { label: "Missing From", status: "critical", value: "Apple Maps, Bing, HomeAdvisor" }
          ]}
          description={{
            title: "Impact",
            text: "Missing key directories means you're invisible to 35%+ of local searches. Inconsistent contact info confuses customers."
          }}
        />

        <AnalysisCard 
          title="🌐 Website & Local SEO"
          color={colors.danger}
          items={[
            { label: "Mobile Speed", status: "critical", value: `${data.pagespeedAnalysis.mobileScore}/100 (${data.pageSpeed} load time)` },
            { label: "Desktop Speed", status: "critical", value: `${data.pagespeedAnalysis.desktopScore}/100 (4.1s interactive)` },
            { label: "Local SEO Score", status: "critical", value: `${data.localContentScore}/100 - Critical` },
            { label: "Schema Markup", status: "critical", value: `${data.schemaScore}/100 - Missing` }
          ]}
          description={{
            title: "Critical Issue",
            text: "Website completely missing location keywords in titles and headings. Slow speeds are killing mobile conversions."
          }}
        />
      </div>

      {/* Local Search Optimization Status */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.info}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: colors.info,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🔍 Local Search Optimization Status
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          <div>
            <h4 style={{
              fontWeight: '600',
              color: colors.primary,
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              Current Keyword Performance:
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                { label: "Local optimization score:", value: `${data.localContentScore}/100` },
                { label: `"${data.location.split(',')[0]}" in titles:`, value: "Missing" },
                { label: "Local service pages:", value: "None" },
                { label: "Keyword visibility:", value: "0/100" }
              ].map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: colors.primary, fontWeight: '500' }}>{item.label}</span>
                  <StatusBadge status="critical">{item.value}</StatusBadge>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{
              fontWeight: '600',
              color: colors.primary,
              marginBottom: '16px',
              fontSize: '16px'
            }}>
              Immediate Opportunities:
            </h4>
            <ul style={{
              color: '#666',
              paddingLeft: '0',
              margin: 0,
              listStyle: 'none'
            }}>
              {[
                `Add "${data.location.split(',')[0]}" to website title`,
                'Create local service pages',
                `Optimize for "basement finishing ${data.location.split(',')[0]}"`,
                `Target "custom carpentry ${data.location.split(',')[0]}"`
              ].map((item, index) => (
                <li key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: colors.info, fontWeight: '700', fontSize: '18px' }}>•</span>
                  <span style={{ fontWeight: '500' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div style={{
          background: '#EBF8FF',
          border: `1px solid #BAE6FD`,
          borderRadius: '8px',
          padding: '16px',
          marginTop: '20px'
        }}>
          <p style={{
            color: colors.primary,
            fontWeight: '500',
            margin: 0
          }}>
            <strong style={{ color: colors.info }}>Quick Win Opportunity:</strong> Simply adding "{data.location.split(',')[0]}" to your page titles and headings could improve your local content score from {data.localContentScore}/100 to 60/100+ within days.
          </p>
        </div>
      </div>

      {/* Performance Impact Projection */}
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
          📈 Optimization Impact Potential
        </h3>
        <p style={{ marginBottom: '16px', color: colors.primary }}>
          Based on current gaps and optimization opportunities:
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { value: "85%", label: "Directory Coverage Target", subtitle: `From current ${data.citationAnalysis.citationCompletionRate}%` },
            { value: "100%", label: "NAP Consistency", subtitle: `From current ${data.napAnalysis.consistencyScore}%` },
            { value: "42%", label: "Visibility Gap Found", subtitle: "Technical optimization opportunity" },
            { value: "2-3 weeks", label: "Implementation Timeline", subtitle: "For foundation fixes" }
          ].map((item, index) => (
            <div key={index} style={{
              background: colors.white,
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${colors.lightGray}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.success }}>{item.value}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>{item.label}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.subtitle}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upgrade Button Section */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid ${colors.primary}`,
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: colors.primary,
          marginBottom: '16px'
        }}>
          🚀 Want us to fix these problems?
        </h3>
        <p style={{ marginBottom: '16px', color: colors.primary }}>
          We found {metricBoxes.filter(box => box.status === 'critical').length} critical issues. 
          Our AI-powered system can create content that solves your customers' problems.
        </p>
        <button 
          onClick={() => navigate('/upgrade')}
          style={{
            background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 20px rgba(42, 59, 74, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          See How It Works
        </button>
      </div>
    </div>
  );
};

export default OverviewTab;