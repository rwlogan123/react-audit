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
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Failed' };
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

// Monthly Progress Component
const MonthlyProgress = ({ monthlyQuota, completedThisMonth, inProgress, totalBuilt }) => {
  const remaining = monthlyQuota - completedThisMonth - inProgress;
  const progressPercentage = ((completedThisMonth + inProgress) / monthlyQuota) * 100;

  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '20px' }}>
        📅 {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Progress
      </h3>
      
      {/* Progress Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Monthly Citation Quota</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>
            {completedThisMonth + inProgress}/{monthlyQuota} citations
          </span>
        </div>
        <div style={{ width: '100%', height: '24px', background: colors.lightGray, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ height: '100%', display: 'flex' }}>
            <div style={{
              width: `${(completedThisMonth / monthlyQuota) * 100}%`,
              background: colors.success,
              transition: 'width 0.5s ease'
            }} />
            <div style={{
              width: `${(inProgress / monthlyQuota) * 100}%`,
              background: colors.warning,
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '24px', marginTop: '12px', fontSize: '13px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: colors.success, borderRadius: '2px' }} />
            Completed ({completedThisMonth})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: colors.warning, borderRadius: '2px' }} />
            In Progress ({inProgress})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', background: colors.lightGray, borderRadius: '2px' }} />
            Remaining ({remaining})
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        <div style={{ textAlign: 'center', padding: '16px', background: '#F0FDF4', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.success }}>{completedThisMonth}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Completed</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: '#FEF3C7', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.warning }}>{inProgress}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>In Progress</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: '#EBF8FF', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.info }}>{remaining}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Queued</div>
        </div>
        <div style={{ textAlign: 'center', padding: '16px', background: '#F3F4F6', borderRadius: '8px' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>{totalBuilt}</div>
          <div style={{ fontSize: '13px', color: '#666' }}>Total Built</div>
        </div>
      </div>
    </div>
  );
};

// Citation Activity Log Component
const CitationActivityLog = ({ citations, onDownloadReport }) => {
  return (
    <div style={{ 
      background: colors.white, 
      border: `1px solid ${colors.lightGray}`, 
      borderRadius: '12px', 
      overflow: 'hidden', 
      marginBottom: '24px' 
    }}>
      <div style={{ 
        padding: '20px', 
        borderBottom: `1px solid ${colors.lightGray}`, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, margin: 0 }}>
          📋 Citation Activity Log
        </h3>
        <button 
          onClick={onDownloadReport}
          style={{
            background: colors.info,
            color: colors.white,
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Download Report
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Directory</th>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Action</th>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Status</th>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>NAP Status</th>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {citations.map((citation, index) => (
              <tr key={index} style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '500' }}>{citation.directory}</td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    background: citation.action === 'created' ? '#DBEAFE' : '#FEF3C7',
                    color: citation.action === 'created' ? '#1E40AF' : '#92400E',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '14px' }}>
                      {citation.action === 'created' ? '+' : citation.action === 'fixing' ? '🔧' : '✏️'}
                    </span>
                    <span>
                      {citation.action === 'created' ? 'Created' : citation.action === 'fixing' ? 'Fixing' : 'Updated'}
                    </span>
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <StatusBadge status={citation.status}>
                    {citation.status === 'approved' ? '✓ Completed' : 
                     citation.status === 'in_progress' ? '⏳ In Progress' : 
                     '📋 Queued'}
                  </StatusBadge>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {citation.status === 'approved' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                      <span style={{ color: colors.danger, textDecoration: 'line-through' }}>{citation.napBefore}</span>
                      <span>→</span>
                      <span style={{ color: colors.success, fontWeight: '500' }}>{citation.napAfter}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#666' }}>{citation.napBefore}</span>
                  )}
                </td>
                <td style={{ padding: '16px 20px', fontSize: '13px', color: '#666' }}>
                  {citation.date ? citation.date.toLocaleDateString() : 'Scheduled'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Citation History Component
const CitationHistory = ({ history }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '20px' }}>
        📊 Citation Building History
      </h3>
      <div style={{ display: 'grid', gap: '12px' }}>
        {history.map((month, index) => (
          <div key={index} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#F9FAFB',
            borderRadius: '8px'
          }}>
            <span style={{ fontWeight: '500', color: colors.primary }}>{month.month}</span>
            <div style={{ display: 'flex', gap: '20px', fontSize: '14px' }}>
              <span><strong style={{ color: colors.info }}>{month.created}</strong> created</span>
              <span><strong style={{ color: colors.warning }}>{month.fixed}</strong> fixed</span>
              <span style={{ color: colors.success, fontWeight: '600' }}>{month.total} total</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// NAP Consistency Tracker Component
const NAPConsistencyTracker = ({ businessInfo, napData }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '20px' }}>
        🎯 NAP Consistency Tracking
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>
          Business Information:
        </div>
        <div style={{ display: 'grid', gap: '8px', fontSize: '13px' }}>
          <div><strong>Name:</strong> {businessInfo.name}</div>
          <div><strong>Address:</strong> {businessInfo.address}</div>
          <div><strong>Phone:</strong> {businessInfo.phone}</div>
          <div><strong>Website:</strong> {businessInfo.website}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '12px' }}>
          Consistency Status:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          <div style={{ textAlign: 'center', padding: '12px', background: '#F0FDF4', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.success }}>{napData.consistent}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Consistent</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#FEF3C7', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.warning }}>{napData.inconsistent}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Inconsistent</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#FEE2E2', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.danger }}>{napData.missing}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Missing</div>
          </div>
          <div style={{ textAlign: 'center', padding: '12px', background: '#EBF8FF', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: colors.info }}>
              {Math.round((napData.consistent / (napData.consistent + napData.inconsistent + napData.missing)) * 100)}%
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Accuracy</div>
          </div>
        </div>
      </div>

      <div style={{
        background: '#EBF8FF',
        border: '1px solid #BEE3F8',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', color: colors.info, marginBottom: '8px' }}>
          🎯 Impact of NAP Consistency
        </h4>
        <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: colors.primary, lineHeight: '1.5' }}>
          <li>Consistent NAP data helps Google verify your business legitimacy</li>
          <li>Improves local search rankings and map pack visibility</li>
          <li>Reduces customer confusion and builds trust</li>
          <li>Essential for local SEO success</li>
        </ul>
      </div>
    </div>
  );
};

// Main CitationsTab component
const CitationsTab = ({ 
  businessName = "Sample Business",
  location = "Eagle Mountain, UT",
  userPlan = { tier: 'professional' },
  onDownloadReport = () => {}
}) => {
  const [loading, setLoading] = useState(true);
  const [citationData, setCitationData] = useState(null);

  // Plan-based monthly quotas
  const getMonthlyQuota = (tier) => {
    switch (tier) {
      case 'starter': return 10;
      case 'professional': return 20;
      case 'premium': return 30;
      default: return 20;
    }
  };

  useEffect(() => {
    // Simulate loading citation data
    setTimeout(() => {
      const monthlyQuota = getMonthlyQuota(userPlan.tier);
      
      setCitationData({
        monthlyQuota,
        completedThisMonth: 5,
        inProgress: 2,
        totalBuilt: 68,
        currentMonthCitations: [
          { directory: 'Yelp for Business', status: 'approved', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), action: 'created', napBefore: 'missing', napAfter: 'consistent' },
          { directory: 'Apple Maps Connect', status: 'approved', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), action: 'created', napBefore: 'missing', napAfter: 'consistent' },
          { directory: 'Bing Places', status: 'approved', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), action: 'updated', napBefore: 'inconsistent', napAfter: 'consistent' },
          { directory: 'Yellow Pages', status: 'approved', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), action: 'created', napBefore: 'missing', napAfter: 'consistent' },
          { directory: 'Foursquare', status: 'approved', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), action: 'fixing', napBefore: 'inconsistent', napAfter: 'consistent' },
          { directory: 'Angi (Angie\'s List)', status: 'in_progress', date: new Date(), action: 'creating', napBefore: 'missing', napAfter: 'pending' },
          { directory: 'HomeAdvisor', status: 'in_progress', date: new Date(), action: 'creating', napBefore: 'missing', napAfter: 'pending' },
          { directory: 'Thumbtack', status: 'pending', date: null, action: 'update', napBefore: 'inconsistent', napAfter: 'pending' },
          { directory: 'Better Business Bureau', status: 'pending', date: null, action: 'create', napBefore: 'missing', napAfter: 'pending' },
          { directory: 'Nextdoor Business', status: 'pending', date: null, action: 'create', napBefore: 'missing', napAfter: 'pending' },
        ],
        citationHistory: [
          { month: 'December 2024', created: 18, fixed: 2, total: 20 },
          { month: 'November 2024', created: 15, fixed: 5, total: 20 },
          { month: 'October 2024', created: 17, fixed: 3, total: 20 },
        ],
        businessInfo: {
          name: businessName,
          address: `123 Main Street, ${location}`,
          phone: '(801) 555-0123',
          website: 'www.eaglemountainremodeling.com'
        },
        napData: {
          consistent: 45,
          inconsistent: 15,
          missing: 8,
        }
      });
      setLoading(false);
    }, 500);
  }, [userPlan.tier, businessName, location]);

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
        <p style={{ color: colors.primary }}>Loading citation data...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const { 
    monthlyQuota, 
    completedThisMonth, 
    inProgress, 
    totalBuilt, 
    currentMonthCitations, 
    citationHistory, 
    businessInfo, 
    napData 
  } = citationData;

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>
          Citation Building & Management
        </h2>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Your {userPlan.tier?.charAt(0).toUpperCase() + userPlan.tier?.slice(1)} plan includes {monthlyQuota} citations per month
        </p>
      </div>

      {/* Monthly Progress */}
      <MonthlyProgress 
        monthlyQuota={monthlyQuota}
        completedThisMonth={completedThisMonth}
        inProgress={inProgress}
        totalBuilt={totalBuilt}
      />

      {/* Citation Activity Log */}
      <CitationActivityLog 
        citations={currentMonthCitations}
        onDownloadReport={onDownloadReport}
      />

      {/* NAP Consistency Tracker */}
      <NAPConsistencyTracker 
        businessInfo={businessInfo}
        napData={napData}
      />

      {/* Citation History */}
      <CitationHistory history={citationHistory} />

      {/* Directory Coverage Overview */}
      <div style={{
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.success, marginBottom: '16px' }}>
          🎯 Directory Coverage Strategy
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>
              Tier 1 Directories (High Impact)
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#666' }}>
              <li>Google My Business</li>
              <li>Bing Places</li>
              <li>Apple Maps</li>
              <li>Yelp</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>
              Industry-Specific Directories
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#666' }}>
              <li>Angi (Angie's List)</li>
              <li>HomeAdvisor</li>
              <li>Thumbtack</li>
              <li>Houzz</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: colors.primary, marginBottom: '8px' }}>
              Local Directories
            </h4>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '13px', color: '#666' }}>
              <li>Chamber of Commerce</li>
              <li>Local business associations</li>
              <li>City/county websites</li>
              <li>Nextdoor Business</li>
            </ul>
          </div>
        </div>
        <div style={{
          background: colors.white,
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <strong style={{ color: colors.success }}>Building Authority:</strong> Each citation acts as a "vote of confidence" for your business, helping improve local search rankings and making it easier for customers to find you across the web.
        </div>
      </div>

      {/* Vendor Note */}
      <div style={{
        background: '#F3F4F6',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '24px',
        fontSize: '13px',
        color: '#666',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>
          💡 All citations are manually verified for accuracy. Each submission includes NAP consistency checks and duplicate removal.
        </p>
      </div>
    </div>
  );
};

// Demo wrapper
const CitationsTabDemo = () => {
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
        <h1>📋 Citations Tab Component</h1>
        <p style={{ opacity: 0.8 }}>Monthly quota tracking and NAP consistency management</p>
      </div>

      <CitationsTab 
        businessName="Eagle Mountain Remodeling"
        location="Eagle Mountain, UT"
        userPlan={{ tier: 'professional' }}
        onDownloadReport={() => console.log('Download citation report')}
      />

      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", opacity: "0.8" }}>
          Ready for: src/dashboards/ClientDashboard/tabs/CitationsTab.jsx
        </div>
      </div>
    </div>
  );
};

export default CitationsTab;