import React from 'react';
import { MapPin, Globe, Users, AlertTriangle, Star, Clock, TrendingUp, Smartphone, Monitor, Camera, MessageSquare } from 'lucide-react';

const OverviewTab = ({ data }) => {
  // Your app's color system
  const colors = {
    primary: '#2A3B4A',
    lightGray: '#F5F5F5',
    success: '#16A34A',
    warning: '#F59E0B',
    danger: '#DC2626',
    info: '#3B82F6',
    white: '#FFFFFF'
  };

  // Enhanced audit data with comprehensive structure from original
  const auditData = {
    success: true,
    visibilityScore: data?.visibilityScore || 79,
    localContentScore: data?.localContentScore || 10,
    websiteScore: data?.websiteScore || 55,
    schemaScore: data?.schemaScore || 0,
    pageSpeed: data?.pageSpeed || "19.9s",
    completenessScore: data?.completenessScore || 92,
    currentRank: data?.currentRank || 1,
    reviewCount: data?.reviewCount || 21,
    rating: data?.rating || 5,
    photoCount: data?.photoCount || 29,
    businessName: data?.businessName || "LM Finishing and Construction",
    tier1DirectoryCoverage: data?.tier1DirectoryCoverage || 33,
    criticalCitationScore: data?.criticalCitationScore || 33,
    directoryLinksCount: data?.directoryLinksCount || 6,
    pagespeedAnalysis: data?.pagespeedAnalysis || {
      mobileScore: 55,
      desktopScore: 58
    },
    socialMediaAnalysis: data?.socialMediaAnalysis || {
      socialScore: 50,
      platforms: ["facebook", "instagram"]
    },
    napAnalysis: data?.napAnalysis || {
      consistencyScore: 40
    },
    citationAnalysis: data?.citationAnalysis || {
      citationCompletionRate: 40,
      tier1Coverage: 33
    },
    rawBusinessData: data?.rawBusinessData || {
      address: "1760 E Fall St, Eagle Mountain, UT 84005",
      phone: "+1385-500-8437"
    }
  };

  // Helper Components using your styling
  const StatusBadge = ({ status, children, className = "" }) => {
    const getStatusColors = () => {
      switch (status) {
        case 'excellent': 
        case 'good': 
          return { bg: colors.white, text: colors.success, border: colors.success };
        case 'warning': 
          return { bg: colors.white, text: colors.warning, border: colors.warning };
        case 'critical': 
          return { bg: colors.white, text: colors.danger, border: colors.danger };
        default: 
          return { bg: colors.white, text: '#666', border: '#ccc' };
      }
    };

    const statusColors = getStatusColors();
    return (
      <span style={{
        background: statusColors.bg,
        color: statusColors.text,
        border: `1px solid ${statusColors.border}`,
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        whiteSpace: 'nowrap',
        ...className
      }}>
        {children}
      </span>
    );
  };

  const StatusItem = ({ label, status, children }) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ 
        color: colors.primary, 
        fontSize: '14px', 
        marginBottom: '4px',
        fontWeight: '500'
      }}>
        {label}:
      </div>
      <StatusBadge status={status}>{children}</StatusBadge>
    </div>
  );

  const SummaryCard = ({ title, color, items, description }) => {
    return (
      <div style={{
        background: `${color}08`,
        border: `1px solid ${color}30`,
        borderLeft: `4px solid ${color}`,
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: '700',
          color: color,
          marginBottom: '20px'
        }}>
          {title}
        </h3>
        <div style={{ marginBottom: '20px' }}>
          {items.map((item, index) => (
            <StatusItem key={index} label={item.label} status={item.status}>
              {item.value}
            </StatusItem>
          ))}
        </div>
        <div style={{
          background: colors.white,
          padding: '16px',
          borderRadius: '8px',
          fontSize: '14px',
          color: colors.primary
        }}>
          <strong>{description.title}:</strong> {description.text}
        </div>
      </div>
    );
  };

  const ProgressBar = ({ value, className = "", showLabel = true }) => (
    <div style={{ marginBottom: '24px' }}>
      {showLabel && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <span style={{ fontWeight: '600', color: colors.primary }}>Overall Visibility Score</span>
          <span style={{ fontWeight: '600', color: colors.primary }}>{value}%</span>
        </div>
      )}
      <div style={{
        width: '100%',
        background: '#E5E7EB',
        borderRadius: '6px',
        height: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          borderRadius: '6px',
          background: value >= 80 ? colors.success : value >= 60 ? colors.warning : colors.danger,
          width: `${value}%`,
          transition: 'width 1s ease-in-out'
        }} />
      </div>
    </div>
  );

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1F3F76 0%, #284D90 100%)',
          color: colors.white,
          padding: '32px',
          borderRadius: '12px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '8px',
              margin: 0
            }}>
              🏗️ Digital Presence Audit
            </h1>
            <h2 style={{
              fontSize: '20px',
              marginBottom: '24px',
              opacity: 0.9,
              margin: '8px 0 24px 0'
            }}>
              {auditData.businessName} - Eagle Mountain, UT
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Market Position</div>
                  <span style={{
                    background: colors.white,
                    color: colors.success,
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    #1 of 18
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>95/100</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Perfect {auditData.rating}⭐ rating</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Local SEO</div>
                  <span style={{
                    background: colors.white,
                    color: colors.danger,
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Critical
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{auditData.localContentScore}/100</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>Missing Eagle Mountain</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Google Profile</div>
                  <span style={{
                    background: colors.white,
                    color: colors.success,
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Strong
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{auditData.completenessScore}/100</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{auditData.rating}⭐ • {auditData.reviewCount} reviews</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Website Speed</div>
                  <span style={{
                    background: colors.white,
                    color: colors.danger,
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Slow
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{auditData.pagespeedAnalysis.desktopScore}/100</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>{auditData.pageSpeed} mobile load</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Social Media</div>
                  <span style={{
                    background: colors.white,
                    color: colors.danger,
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Missing
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{auditData.socialMediaAnalysis.socialScore}/100</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>1 of 4 platforms</div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '16px',
                borderRadius: '12px',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '4px'
                }}>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>Citations</div>
                  <span style={{
                    background: colors.white,
                    color: colors.danger,
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: '600'
                  }}>
                    Critical Gap
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>{auditData.napAnalysis.consistencyScore}/100</div>
                <div style={{ fontSize: '11px', opacity: 0.7 }}>6 of 15 directories</div>
              </div>
            </div>
          </div>
        </div>

        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "24px",
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
            <strong>Bottom Line:</strong> You're ranking #{auditData.currentRank} with a perfect {auditData.rating}⭐ rating, but critical technical gaps are limiting your visibility potential. Your Google Business Profile completeness is strong at {auditData.completenessScore}%, but social media presence is minimal at {auditData.socialMediaAnalysis.socialScore}% and citation coverage is critically low at {auditData.napAnalysis.consistencyScore}%. While you lead in quality, competitors are gaining ground through better digital optimization.
          </p>
        </div>

        <ProgressBar value={auditData.visibilityScore} />

        {/* Core Digital Assets Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          
          <SummaryCard 
            title="📍 Google Business Profile"
            color={colors.success}
            items={[
              { label: "Rating & Reviews", status: "excellent", value: `${auditData.rating}⭐ (${auditData.reviewCount} reviews) - Excellent` },
              { label: "Photos Uploaded", status: "warning", value: `${auditData.photoCount} photos - Need 8 more` },
              { label: "Profile Completeness", status: "good", value: `${auditData.completenessScore}% - Very Good` },
              { label: "Recent Activity", status: "critical", value: "No posts in 3 months" }
            ]}
            description={{
              title: "Strength",
              text: "Perfect rating puts you ahead of 90% of competitors. Regular posting could boost visibility significantly."
            }}
          />

          <SummaryCard 
            title="📱 Social Media Presence"
            color={colors.danger}
            items={[
              { label: "Active Platforms", status: "critical", value: `${auditData.socialMediaAnalysis.platforms?.length || 2} of 4 recommended` },
              { label: "Instagram", status: "good", value: "Active (247 followers)" },
              { label: "Facebook Business", status: "critical", value: "Active but limited" },
              { label: "LinkedIn & YouTube", status: "critical", value: "Missing" }
            ]}
            description={{
              title: "Critical Gap",
              text: `Social score of ${auditData.socialMediaAnalysis.socialScore}/100 means you're missing significant opportunities for local customer discovery.`
            }}
          />

          <SummaryCard 
            title="📋 Citations & Directories"
            color={colors.warning}
            items={[
              { label: "Directory Coverage", status: "critical", value: `${auditData.citationAnalysis.citationCompletionRate}% (${auditData.directoryLinksCount} of 15 key directories)` },
              { label: "NAP Consistency", status: "critical", value: `${auditData.napAnalysis.consistencyScore}% - Critical Issues` },
              { label: "Found On", status: "warning", value: "Thumbtack, Angi, Yelp" },
              { label: "Missing From", status: "critical", value: "Apple Maps, Bing, HomeAdvisor" }
            ]}
            description={{
              title: "Impact",
              text: "Missing key directories means you're invisible to 35%+ of local searches. Inconsistent contact info confuses customers."
            }}
          />

          <SummaryCard 
            title="🌐 Website & Local SEO"
            color={colors.danger}
            items={[
              { label: "Mobile Speed", status: "critical", value: `${auditData.pagespeedAnalysis.mobileScore}/100 (${auditData.pageSpeed} load time)` },
              { label: "Desktop Speed", status: "critical", value: `${auditData.pagespeedAnalysis.desktopScore}/100 (4.1s interactive)` },
              { label: "Local SEO Score", status: "critical", value: `${auditData.localContentScore}/100 - Critical` },
              { label: "Schema Markup", status: "critical", value: `${auditData.schemaScore}/100 - Missing` }
            ]}
            description={{
              title: "Critical Issue",
              text: "Website completely missing \"Eagle Mountain\" in titles and headings. Slow speeds are killing mobile conversions."
            }}
          />
        </div>

        {/* Competitive Landscape Warning */}
        <div style={{
          background: `${colors.warning}08`,
          border: `1px solid ${colors.warning}30`,
          borderLeft: `4px solid ${colors.warning}`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: colors.warning,
            marginBottom: '16px'
          }}>
            ⚠️ Competitive Landscape Alert
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <h4 style={{
                fontWeight: '600',
                color: colors.primary,
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                Your Current Position:
              </h4>
              <ul style={{
                fontSize: '14px',
                color: '#666',
                paddingLeft: '16px',
                margin: 0
              }}>
                <li>#{auditData.currentRank} ranking with perfect {auditData.rating}⭐ rating</li>
                <li>{auditData.reviewCount} reviews (excellent quality)</li>
                <li>Strong reputation and quality work</li>
                <li>Early morning availability advantage (7am start)</li>
              </ul>
            </div>
            <div>
              <h4 style={{
                fontWeight: '600',
                color: colors.primary,
                marginBottom: '12px',
                fontSize: '16px'
              }}>
                Emerging Threats:
              </h4>
              <ul style={{
                fontSize: '14px',
                color: '#666',
                paddingLeft: '16px',
                margin: 0
              }}>
                <li>Competitors with 6x more photos (216 vs {auditData.photoCount})</li>
                <li>New Springs Construction: 26 reviews, strong web presence</li>
                <li>Multiple competitors with better technical SEO</li>
                <li>Missing from major directories hurts visibility</li>
              </ul>
            </div>
          </div>
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.warning}30`,
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <p style={{
              color: colors.primary,
              fontSize: '14px',
              margin: 0
            }}>
              <strong>Strategic Insight:</strong> While your reputation is excellent, competitors are using digital optimization to capture more visibility. Your technical foundation needs immediate attention to maintain market leadership.
            </p>
          </div>
        </div>

        {/* Keyword Optimization Status */}
        <div style={{
          background: `${colors.info}08`,
          border: `1px solid ${colors.info}30`,
          borderLeft: `4px solid ${colors.info}`,
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: colors.info,
            marginBottom: '20px'
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
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: colors.primary, fontWeight: '500' }}>Local optimization score:</span>
                  <StatusBadge status="critical">{auditData.localContentScore}/100</StatusBadge>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: colors.primary, fontWeight: '500' }}>"Eagle Mountain" in titles:</span>
                  <StatusBadge status="critical">Missing</StatusBadge>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: colors.primary, fontWeight: '500' }}>Local service pages:</span>
                  <StatusBadge status="critical">None</StatusBadge>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: colors.primary, fontWeight: '500' }}>Keyword visibility:</span>
                  <StatusBadge status="critical">0/100</StatusBadge>
                </div>
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
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: colors.info, fontWeight: '700', fontSize: '18px' }}>•</span>
                  <span style={{ fontWeight: '500' }}>Add "Eagle Mountain" to website title</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: colors.info, fontWeight: '700', fontSize: '18px' }}>•</span>
                  <span style={{ fontWeight: '500' }}>Create local service pages</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: colors.info, fontWeight: '700', fontSize: '18px' }}>•</span>
                  <span style={{ fontWeight: '500' }}>Optimize for "basement finishing Eagle Mountain"</span>
                </li>
                <li style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ color: colors.info, fontWeight: '700', fontSize: '18px' }}>•</span>
                  <span style={{ fontWeight: '500' }}>Target "custom carpentry Eagle Mountain"</span>
                </li>
              </ul>
            </div>
          </div>
          <div style={{
            background: colors.white,
            border: `1px solid ${colors.info}30`,
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <p style={{
              color: colors.primary,
              fontWeight: '500',
              margin: 0
            }}>
              <strong>Quick Win Opportunity:</strong> Simply adding "Eagle Mountain" to your page titles and headings could improve your local content score from {auditData.localContentScore}/100 to 60/100+ within days.
            </p>
          </div>
        </div>

        {/* Critical Issues */}
        {auditData.actionItems?.critical?.length > 0 && (
          <div style={{
            background: "#FEF2F2",
            border: `1px solid #FECACA`,
            borderLeft: `4px solid ${colors.danger}`,
            padding: "24px",
            borderRadius: "12px",
            marginBottom: "24px",
          }}>
            <h3 style={{
              color: colors.danger,
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <AlertTriangle size={20} />
              Critical Issues Requiring Immediate Attention
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                {
                  task: "Fix NAP Consistency Issues",
                  impact: "High - affecting local search visibility",
                  effort: "Medium - 2-3 hours"
                },
                {
                  task: "Add LocalBusiness Schema Markup",
                  impact: "High - improves search understanding", 
                  effort: "Low - 1 hour"
                },
                {
                  task: "Optimize Website Speed (Mobile)",
                  impact: "Critical - 19.9s load time losing customers",
                  effort: "High - technical optimization needed"
                }
              ].map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: colors.white,
                    padding: "16px",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <div style={{
                    width: "8px",
                    height: "8px",
                    background: colors.danger,
                    borderRadius: "50%",
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: "600", color: colors.primary }}>
                      {item.task}
                    </div>
                    <div style={{ fontSize: "14px", color: "#666" }}>
                      Impact: {item.impact} • Effort: {item.effort}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Performance Impact Projection */}
        <div style={{
          background: `${colors.success}08`,
          border: `1px solid ${colors.success}30`,
          borderLeft: `4px solid ${colors.success}`,
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: colors.success,
            marginBottom: '16px'
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
            <div style={{
              background: colors.white,
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${colors.success}30`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.success }}>85%</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Directory Coverage Target</div>
              <div style={{ fontSize: '12px', color: '#666' }}>From current {auditData.citationAnalysis.citationCompletionRate}%</div>
            </div>
            <div style={{
              background: colors.white,
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${colors.success}30`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.success }}>100%</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>NAP Consistency</div>
              <div style={{ fontSize: '12px', color: '#666' }}>From current {auditData.napAnalysis.consistencyScore}%</div>
            </div>
            <div style={{
              background: colors.white,
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${colors.success}30`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.success }}>42%</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Visibility Gap Found</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Technical optimization opportunity</div>
            </div>
            <div style={{
              background: colors.white,
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${colors.success}30`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: colors.success }}>2-3 weeks</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Implementation Timeline</div>
              <div style={{ fontSize: '12px', color: '#666' }}>For foundation fixes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;