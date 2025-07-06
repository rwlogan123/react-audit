import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UpgradePopup = ({ 
  isVisible = false,  // Changed default to false
  onClose = () => {}, 
  businessData = {},
  colors = {
    primary: "#2A3B4A",
    white: "#FFFFFF",
    lightGray: "#E1E1E1",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  }
}) => {
  const navigate = useNavigate();
  
  // Simply use the isVisible prop directly, no internal state needed
  if (!isVisible) return null;

  // Default business data if none provided
  const defaultData = {
    businessName: "Sample Business",
    location: "Eagle Mountain, UT",
    localContentScore: 10,
    pagespeedAnalysis: { desktopScore: 55 },
    socialMediaAnalysis: { socialScore: 50 },
    citationAnalysis: { citationCompletionRate: 40 }
  };

  const data = { ...defaultData, ...businessData };

  // Calculate critical issues count
  const criticalIssues = [
    { score: data.localContentScore, threshold: 40 },
    { score: data.pagespeedAnalysis.desktopScore, threshold: 60 },
    { score: data.socialMediaAnalysis.socialScore, threshold: 60 },
    { score: data.citationAnalysis.citationCompletionRate, threshold: 60 }
  ].filter(issue => issue.score < issue.threshold).length;

  const handleUpgradeClick = () => {
    onClose();
    navigate('/upgrade'); // Navigate to upgrade page
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      overflowY: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
        position: 'relative',
        margin: '20px auto'
      }}>
        {/* Close X button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#999',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            zIndex: 1001
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f5f5f5';
            e.target.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#999';
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚀</div>
          <h3 style={{ 
            fontSize: '28px', 
            marginBottom: '8px', 
            color: colors.primary,
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            We Found {criticalIssues} Critical Issues Costing You Customers
          </h3>
          <p style={{ 
            fontSize: '18px',
            color: '#666',
            margin: 0,
            fontWeight: '500'
          }}>
            Turn these problems into your biggest competitive advantage
          </p>
        </div>

        {/* Critical Issues with Impact */}
        <div style={{
          background: '#fff5f5',
          border: '1px solid #fed7d7',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h4 style={{ 
            color: colors.danger, 
            marginBottom: '16px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            ⚠️ Critical Issues Costing You Customers:
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #fed7d7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span style={{ fontWeight: '600', color: colors.primary }}>Local SEO: {data.localContentScore}/100</span>
              </div>
              <div style={{ fontSize: '14px', color: colors.danger, fontWeight: '500' }}>
                Losing 50+ customers/month to competitors
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #fed7d7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span style={{ fontWeight: '600', color: colors.primary }}>Website Speed: {data.pagespeedAnalysis.desktopScore}/100</span>
              </div>
              <div style={{ fontSize: '14px', color: colors.danger, fontWeight: '500' }}>
                73% of mobile users leave slow sites
              </div>
            </div>

            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #fed7d7'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '16px' }}>⚠️</span>
                <span style={{ fontWeight: '600', color: colors.primary }}>Social Media: {data.socialMediaAnalysis.socialScore}/100</span>
              </div>
              <div style={{ fontSize: '14px', color: colors.danger, fontWeight: '500' }}>
                Missing 70% of local discovery searches
              </div>
            </div>

            {criticalIssues > 3 && (
              <div style={{
                textAlign: 'center',
                padding: '8px',
                color: colors.danger,
                fontSize: '14px',
                fontWeight: '600'
              }}>
                Plus {criticalIssues - 3} more critical issue{criticalIssues - 3 > 1 ? 's' : ''}...
              </div>
            )}
          </div>
        </div>

        {/* Solution Preview */}
        <div style={{
          background: '#f0fff4',
          border: '1px solid #9ae6b4',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h4 style={{ 
            color: colors.success, 
            marginBottom: '16px',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            🎯 Our AI-Powered Local Brand Builder Creates:
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '16px' }}>✅</span>
              <span style={{ color: colors.primary, fontWeight: '500', fontSize: '14px' }}>
                Custom content solving your customers' exact problems
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '16px' }}>✅</span>
              <span style={{ color: colors.primary, fontWeight: '500', fontSize: '14px' }}>
                Automated social media & Google Business posting
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '16px' }}>✅</span>
              <span style={{ color: colors.primary, fontWeight: '500', fontSize: '14px' }}>
                Citation building to 50+ directories
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '16px' }}>✅</span>
              <span style={{ color: colors.primary, fontWeight: '500', fontSize: '14px' }}>
                Review generation & management system
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '16px' }}>✅</span>
              <span style={{ color: colors.primary, fontWeight: '500', fontSize: '14px' }}>
                Technical SEO fixes (schema, speed, etc.)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ color: colors.success, fontWeight: 'bold', fontSize: '16px' }}>✅</span>
              <span style={{ color: colors.primary, fontWeight: '500', fontSize: '14px' }}>
                Monthly performance reports & optimization
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
          color: 'white',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: colors.danger,
            color: 'white',
            padding: '4px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '700',
            animation: 'pulse 2s infinite'
          }}>
            Limited Time Offer
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <div style={{ 
              fontSize: '16px', 
              textDecoration: 'line-through', 
              opacity: '0.7',
              marginBottom: '8px'
            }}>
              $3,000
            </div>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              $500 <span style={{ fontSize: '20px', fontWeight: '400' }}>/month</span>
            </div>
            <div style={{ 
              fontSize: '16px', 
              color: colors.success,
              fontWeight: '600'
            }}>
              Save $2,500/month when you act today
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div style={{
          background: '#f7fafc',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <p style={{ 
            fontSize: '14px', 
            fontStyle: 'italic', 
            color: '#666',
            margin: '0 0 8px 0'
          }}>
            "The AI interview found customer problems I never thought to write about. Now we're getting calls from people who found our blog posts."
          </p>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: colors.primary 
          }}>
            - Mike Johnson, Johnson HVAC
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '16px', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '24px'
        }}>
          <button 
            onClick={onClose}
            style={{
              background: 'white',
              border: `2px solid ${colors.lightGray}`,
              padding: '14px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#666',
              fontWeight: '500',
              fontSize: '16px',
              transition: 'all 0.2s ease',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#ccc';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = colors.lightGray;
              e.target.style.color = '#666';
            }}
          >
            Maybe Later
          </button>
          
          <button 
            onClick={handleUpgradeClick}
            style={{
              background: `linear-gradient(135deg, ${colors.primary} 0%, #1a2b38 100%)`,
              color: 'white',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '16px',
              boxShadow: `0 4px 20px rgba(42, 59, 74, 0.3)`,
              transition: 'all 0.2s ease',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 6px 30px rgba(42, 59, 74, 0.4)`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 4px 20px rgba(42, 59, 74, 0.3)`;
            }}
          >
            🚀 Fix My Marketing Now →
          </button>
        </div>

        {/* Urgency Section */}
        <div style={{
          textAlign: 'center',
          padding: '16px',
          background: '#fef2f2',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: colors.danger,
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            ⏰ This offer expires in 24 hours
          </div>
          <div style={{ 
            fontSize: '12px', 
            color: '#666'
          }}>
            Only 2 spots left for {data.location.split(',')[0]} businesses
          </div>
        </div>

        {/* Guarantee */}
        <div style={{
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #eee'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#666',
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <span>✅ 30-Day Money Back Guarantee</span>
            <span>✅ Cancel Anytime</span>
            <span>✅ Setup in 48 Hours</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.05); }
          100% { transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default UpgradePopup;