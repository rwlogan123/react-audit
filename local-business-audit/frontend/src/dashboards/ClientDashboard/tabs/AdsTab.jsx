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
        return { bg: '#D1FAE5', color: '#065F46', label: 'Active' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Paused' };
      case 'good':
        return { bg: '#DBEAFE', color: '#1E40AF', label: children || 'Good' };
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

// Budget Overview Component
const BudgetOverview = ({ adsData }) => {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const budgetPercentage = (adsData.spentThisMonth / adsData.totalBudget) * 100;
  const totalConversions = adsData.platforms.google.conversions + adsData.platforms.facebook.conversions;
  const roi = totalConversions > 0 ? ((totalConversions * 8500 - adsData.spentThisMonth) / adsData.spentThisMonth * 100) : 0;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
      color: colors.white,
      borderRadius: '12px',
      padding: '32px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
        {currentMonth} Performance Overview
      </h3>
      <p style={{ opacity: 0.8, marginBottom: '24px' }}>
        Track your advertising spend and return on investment
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(200px, 1fr))', gap: '32px' }}>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Monthly Budget</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>${adsData.totalBudget.toLocaleString()}</div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '4px',
            marginTop: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${budgetPercentage}%`,
              height: '100%',
              background: colors.warning,
              borderRadius: '4px'
            }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Spent This Month</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>${adsData.spentThisMonth.toLocaleString()}</div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
            ${(adsData.totalBudget - adsData.spentThisMonth).toFixed(2)} remaining
          </div>
        </div>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Total Conversions</div>
          <div style={{ fontSize: '32px', fontWeight: '700' }}>
            {totalConversions}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
            ${(adsData.spentThisMonth / totalConversions).toFixed(2)} per lead
          </div>
        </div>
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '8px' }}>Est. ROI</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: colors.success }}>
            {roi.toFixed(0)}%
          </div>
          <div style={{ fontSize: '14px', opacity: 0.8, marginTop: '4px' }}>
            @ $8,500 avg ticket
          </div>
        </div>
      </div>
    </div>
  );
};

// Platform Performance Component
const PlatformPerformance = ({ platforms }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      {/* Google Ads */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid #4285F4`,
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, margin: 0 }}>
            Google Ads
          </h3>
          <StatusBadge status='approved'>Active</StatusBadge>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>
              ${platforms.google.spend.toFixed(2)}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Spend</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.success }}>
              {platforms.google.conversions}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Conversions</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: colors.primary }}>
              {platforms.google.clicks}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Clicks</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: colors.primary }}>
              ${platforms.google.cpc.toFixed(2)}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Avg. CPC</div>
          </div>
        </div>
        
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${colors.lightGray}`,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px'
        }}>
          <span>CTR: {platforms.google.ctr}%</span>
          <span>Conv. Rate: {platforms.google.conversionRate}%</span>
        </div>
      </div>

      {/* Facebook Ads */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderLeft: `4px solid #1877F2`,
        borderRadius: '12px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, margin: 0 }}>
            Facebook Ads
          </h3>
          <StatusBadge status='approved'>Active</StatusBadge>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.primary }}>
              ${platforms.facebook.spend.toFixed(2)}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Spend</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: colors.success }}>
              {platforms.facebook.conversions}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Conversions</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: colors.primary }}>
              {platforms.facebook.clicks}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Clicks</div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: colors.primary }}>
              ${platforms.facebook.cpc.toFixed(2)}
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>Avg. CPC</div>
          </div>
        </div>
        
        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${colors.lightGray}`,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px'
        }}>
          <span>CTR: {platforms.facebook.ctr}%</span>
          <span>Conv. Rate: {platforms.facebook.conversionRate}%</span>
        </div>
      </div>
    </div>
  );
};

// Campaign Performance Component
const CampaignPerformance = ({ campaigns, onViewReports }) => {
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
          Active Campaigns
        </h3>
        <button 
          onClick={onViewReports}
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
          View All Reports →
        </button>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F9FAFB' }}>
              <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#666' }}>Campaign</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#666' }}>Platform</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#666' }}>Budget</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#666' }}>Spent</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#666' }}>Clicks</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#666' }}>Conv.</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#666' }}>CPC</th>
              <th style={{ padding: '12px 20px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#666' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign, index) => (
              <tr key={index} style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: '500', color: colors.primary }}>{campaign.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                    {campaign.topKeywords ? 
                      `Keywords: ${campaign.topKeywords[0]}...` :
                      `Audience: ${campaign.audiences[0]}...`
                    }
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <span style={{
                    background: campaign.platform === 'Google' ? '#E8F0FE' : '#E7F3FF',
                    color: campaign.platform === 'Google' ? '#1A73E8' : '#1877F2',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {campaign.platform}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '500' }}>
                  ${campaign.budget}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  ${campaign.spent.toFixed(2)}
                  <div style={{ fontSize: '11px', color: '#666' }}>
                    {((campaign.spent / campaign.budget) * 100).toFixed(0)}%
                  </div>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>{campaign.clicks}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center', fontWeight: '600', color: colors.success }}>
                  {campaign.conversions}
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>${campaign.cpc.toFixed(2)}</td>
                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                  <StatusBadge status='approved'>Active</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Monthly Trend Component
const MonthlyTrend = ({ monthlyTrend }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '20px' }}>
        📈 Performance Trend
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(100px, 1fr))', gap: '16px' }}>
        {monthlyTrend.map((month, index) => (
          <div key={index} style={{
            textAlign: 'center',
            padding: '16px',
            background: index === monthlyTrend.length - 1 ? '#EBF8FF' : '#F9FAFB',
            borderRadius: '8px',
            border: index === monthlyTrend.length - 1 ? '1px solid #BEE3F8' : 'none'
          }}>
            <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{month.month}</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: colors.primary }}>
              ${month.spend}
            </div>
            <div style={{ fontSize: '16px', fontWeight: '500', color: colors.success }}>
              {month.conversions} leads
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Performance Insights Component
const PerformanceInsights = ({ adsData }) => {
  const totalConversions = adsData.platforms.google.conversions + adsData.platforms.facebook.conversions;
  const costPerLead = adsData.spentThisMonth / totalConversions;
  const bestPerformer = adsData.platforms.google.conversionRate > adsData.platforms.facebook.conversionRate ? 'Google' : 'Facebook';

  return (
    <div style={{
      background: '#F0FDF4',
      border: '1px solid #BBF7D0',
      borderRadius: '12px',
      padding: '24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.success, marginBottom: '8px' }}>
          🎯 Performance Insights
        </h3>
        <p style={{ color: colors.primary, margin: 0 }}>
          Your cost per lead is ${costPerLead.toFixed(2)}. {bestPerformer} campaigns are performing best with strong conversion rates.
        </p>
      </div>
      <button style={{
        background: colors.success,
        color: colors.white,
        border: 'none',
        padding: '12px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        whiteSpace: 'nowrap'
      }}>
        Optimize Campaigns →
      </button>
    </div>
  );
};

// Main AdsTab component
const AdsTab = ({ 
  businessName = "Sample Business",
  location = "Eagle Mountain, UT",
  onViewReports = () => {},
  onOptimizeCampaigns = () => {}
}) => {
  const [loading, setLoading] = useState(true);
  const [adsData, setAdsData] = useState(null);

  useEffect(() => {
    // Simulate loading ads data
    setTimeout(() => {
      setAdsData({
        totalBudget: 2000,
        spentThisMonth: 1234.56,
        platforms: {
          google: {
            spend: 834.56,
            clicks: 342,
            impressions: 12847,
            conversions: 28,
            ctr: 2.66,
            cpc: 2.44,
            conversionRate: 8.19
          },
          facebook: {
            spend: 400.00,
            clicks: 189,
            impressions: 8923,
            conversions: 15,
            ctr: 2.12,
            cpc: 2.12,
            conversionRate: 7.94
          }
        },
        campaigns: [
          {
            name: 'Basement Finishing - Search',
            platform: 'Google',
            status: 'active',
            budget: 800,
            spent: 523.45,
            clicks: 156,
            conversions: 12,
            cpc: 3.35,
            topKeywords: ['basement finishing near me', 'basement contractors eagle mountain', 'finished basement cost']
          },
          {
            name: 'Kitchen Remodeling - Search',
            platform: 'Google',
            status: 'active',
            budget: 400,
            spent: 311.11,
            clicks: 98,
            conversions: 8,
            cpc: 3.17,
            topKeywords: ['kitchen remodeling eagle mountain', 'kitchen renovation cost', 'kitchen contractors']
          },
          {
            name: 'Home Services - Awareness',
            platform: 'Facebook',
            status: 'active',
            budget: 400,
            spent: 267.89,
            clicks: 134,
            conversions: 9,
            cpc: 2.00,
            audiences: ['Homeowners 30-55', 'Eagle Mountain + 10mi', 'Home Improvement Interest']
          },
          {
            name: 'Retargeting - Website Visitors',
            platform: 'Facebook',
            status: 'active',
            budget: 200,
            spent: 132.11,
            clicks: 55,
            conversions: 6,
            cpc: 2.40,
            audiences: ['Website visitors - 30 days', 'Facebook page engaged - 180 days']
          }
        ],
        monthlyTrend: [
          { month: 'Oct', spend: 1789, conversions: 34 },
          { month: 'Nov', spend: 1923, conversions: 41 },
          { month: 'Dec', spend: 1856, conversions: 38 },
          { month: 'Jan', spend: 1234, conversions: 28 }
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
        <p style={{ color: colors.primary }}>Loading advertising data...</p>
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
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: colors.primary, marginBottom: '8px' }}>
        Advertising Dashboard
      </h2>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Performance Overview
      </p>

      {/* Budget Overview */}
      <BudgetOverview adsData={adsData} />

      {/* Platform Performance */}
      <PlatformPerformance platforms={adsData.platforms} />

      {/* Campaign Performance */}
      <CampaignPerformance campaigns={adsData.campaigns} onViewReports={onViewReports} />

      {/* Monthly Trend */}
      <MonthlyTrend monthlyTrend={adsData.monthlyTrend} />

      {/* Performance Insights */}
      <PerformanceInsights adsData={adsData} />
    </div>
  );
};

// Demo wrapper
const AdsTabDemo = () => {
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
        <h1>💰 Ads Tab Component</h1>
        <p style={{ opacity: 0.8 }}>Advertising performance dashboard with budget and ROI tracking</p>
      </div>

      <AdsTab 
        businessName="Eagle Mountain Remodeling"
        location="Eagle Mountain, UT"
        onViewReports={() => console.log('View advertising reports')}
        onOptimizeCampaigns={() => console.log('Optimize campaigns')}
      />

      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", opacity: "0.8" }}>
          Ready for: src/dashboards/ClientDashboard/tabs/AdsTab.jsx
        </div>
      </div>
    </div>
  );
};

export default AdsTab;