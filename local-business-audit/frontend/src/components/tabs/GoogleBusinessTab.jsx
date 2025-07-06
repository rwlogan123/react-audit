import React from 'react';
import { CheckCircle, Star, Camera, TrendingUp, AlertTriangle, Clock, Users, Eye, MapPin } from 'lucide-react';

const GoogleBusinessTab = ({ data }) => {
  // Color scheme
  const colors = {
    primary: "#2A3B4A",
    success: "#16A34A", 
    warning: "#F59E0B",
    danger: "#DC2626",
    info: "#3B82F6",
    white: "#FFFFFF",
    lightGray: "#F0F0F0"
  };

  // Styling constants
  const styles = {
    card: {
      background: colors.white,
      borderRadius: "12px",
      border: `1px solid ${colors.lightGray}`,
      boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)",
      transition: "box-shadow 0.3s ease, transform 0.2s ease"
    },
    alertBox: {
      background: colors.lightGray,
      borderRadius: "12px",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
    },
    majorCard: {
      background: colors.white,
      borderRadius: "12px",
      border: `1px solid ${colors.lightGray}`,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
    },
    gridResponsive: {
      display: "grid",
      gap: "20px"
    }
  };

  // Enhanced data with fallbacks
  const auditData = {
    businessName: data?.businessName || "LM Finishing and Construction",
    completenessScore: data?.completenessScore || 92,
    rating: data?.rating || 5,
    reviewCount: data?.reviewCount || 21,
    photoCount: data?.photoCount || 29,
    currentRank: data?.currentRank || 1,
    competitors: data?.competitors || [
      { name: "LM Finishing and Construction", rating: 5, reviews: 21, photos: 29, rank: 1, isYou: true },
      { name: "GCR Millworks Finish Carpentry", rating: 5, reviews: 75, photos: 216, rank: 2, threat: "HIGH" },
      { name: "New Springs Construction LLC", rating: 4.8, reviews: 26, photos: 51, rank: 3, threat: "MEDIUM" },
      { name: "Portugal Woodworks LLC", rating: 5, reviews: 19, photos: 142, rank: 4, threat: "MEDIUM" },
      { name: "HQ Finish Carpentry", rating: 4.8, reviews: 19, photos: 29, rank: 5, threat: "LOW" },
      { name: "Alpine Custom Finishing", rating: 4.7, reviews: 35, photos: 68, rank: 6, threat: "MEDIUM" }
    ],
    workingHours: {
      start: data?.workingHours?.start || "7am",
      end: data?.workingHours?.end || "6pm", 
      days: data?.workingHours?.days || "Mon-Fri",
      totalHours: data?.workingHours?.totalHours || 11
    },
    postsActivity: {
      lastPost: data?.postsActivity?.lastPost || data?.lastPost || "3 months ago",
      totalPosts: data?.postsActivity?.totalPosts || data?.totalPosts || 0,
      recommended: data?.postsActivity?.recommended || "Weekly"
    }
  };

  // Performance calculations
  const competitorMetrics = auditData.competitors?.filter(c => !c.isYou) || [];
  const avgCompetitorReviews = Math.round(competitorMetrics.reduce((sum, c) => sum + c.reviews, 0) / competitorMetrics.length) || 15;
  const avgCompetitorRating = (competitorMetrics.reduce((sum, c) => sum + c.rating, 0) / competitorMetrics.length).toFixed(1) || 4.4;
  const avgCompetitorPhotos = Math.round(competitorMetrics.reduce((sum, c) => sum + c.photos, 0) / competitorMetrics.length) || 110;
  
  // Metric Cards Component
  const MetricCard = ({ title, value, subtitle, icon: Icon, color, progress, trend }) => (
    <div 
      style={{
        ...styles.card,
        padding: "20px",
        textAlign: "center",
        cursor: "default"
      }}
      className="metric-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div style={{ fontSize: "24px", fontWeight: "700", color: colors.primary, marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: colors.primary, marginBottom: "4px" }}>
        {title}
      </div>
      <div style={{ fontSize: "12px", color: "#666", marginBottom: trend ? "8px" : "0" }}>
        {subtitle}
      </div>
      {trend && (
        <div style={{
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "600",
          backgroundColor: trend.includes('↗') || trend.includes('Above') || trend.includes('Excellent') ? '#dcfce7' : 
                          trend.includes('↓') || trend.includes('Below') || trend.includes('Critical') ? '#fef2f2' : '#fef3c7',
          color: trend.includes('↗') || trend.includes('Above') || trend.includes('Excellent') ? colors.success : 
                 trend.includes('↓') || trend.includes('Below') || trend.includes('Critical') ? colors.danger : colors.warning
        }}>
          {trend}
        </div>
      )}
      {progress && (
        <div style={{ marginTop: "12px" }}>
          <div style={{ 
            width: "100%", 
            height: "6px", 
            backgroundColor: colors.lightGray, 
            borderRadius: "3px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${progress}%`,
              height: "100%",
              backgroundColor: color,
              transition: "width 1s ease"
            }} />
          </div>
        </div>
      )}
    </div>
  );

  // Status Badge Component
  const StatusBadge = ({ status, children, compact = false }) => {
    const getColors = () => {
      switch (status) {
        case 'excellent': return { bg: colors.white, text: colors.success, border: colors.success };
        case 'good': return { bg: colors.white, text: colors.success, border: colors.success };
        case 'warning': return { bg: colors.white, text: colors.warning, border: colors.warning };
        case 'critical': return { bg: colors.white, text: colors.danger, border: colors.danger };
        default: return { bg: colors.white, text: '#666', border: '#666' };
      }
    };
    
    const colorScheme = getColors();
    return (
      <span style={{
        padding: compact ? "2px 6px" : "4px 12px",
        borderRadius: "16px",
        fontSize: compact ? "10px" : "12px",
        fontWeight: "600",
        backgroundColor: colorScheme.bg,
        color: colorScheme.text,
        border: `2px solid ${colorScheme.border}`,
        whiteSpace: "nowrap"
      }}>
        {children}
      </span>
    );
  };

  // Progress Bar Component
  const ProgressBar = ({ value, label, showPercentage = true }) => (
    <div style={{ marginBottom: "20px" }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: "600", color: colors.primary }}>{label}</span>
          {showPercentage && <span style={{ fontSize: "16px", fontWeight: "600", color: colors.primary }}>{value}%</span>}
        </div>
      )}
      <div style={{
        width: "100%",
        height: "12px",
        backgroundColor: colors.lightGray,
        borderRadius: "6px",
        overflow: "hidden"
      }}>
        <div style={{
          width: `${value}%`,
          height: "100%",
          backgroundColor: value >= 80 ? colors.success : value >= 60 ? colors.warning : colors.danger,
          transition: "width 1.5s ease"
        }} />
      </div>
    </div>
  );

  // Competitor Card Component
  const CompetitorCard = ({ competitor, showRank = false }) => (
    <div 
      style={{
        ...styles.card,
        padding: "16px",
        marginBottom: "12px",
        backgroundColor: competitor.isYou ? colors.lightGray : colors.white
      }}
      className="competitor-card"
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 1px 3px -1px rgba(0, 0, 0, 0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
            {showRank && (
              <span style={{
                backgroundColor: colors.info,
                color: colors.white,
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                #{competitor.rank}
              </span>
            )}
            <h4 style={{ 
              margin: 0, 
              fontSize: "16px", 
              fontWeight: "600", 
              color: colors.primary,
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {competitor.name}{competitor.isYou ? ' (You)' : ''}
            </h4>
          </div>
          <div className="competitor-stats">
            <span>⭐ {competitor.rating}</span>
            <span>📝 {competitor.reviews}</span>
            <span>📷 {competitor.photos}</span>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <StatusBadge 
            status={
              competitor.isYou ? 'excellent' :
              competitor.threat === 'HIGH' ? 'critical' :
              competitor.threat === 'MEDIUM' ? 'warning' : 'good'
            }
            compact={true}
          >
            {competitor.isYou ? '🏆 You' :
             competitor.threat === 'HIGH' ? '🚨 High' :
             competitor.threat === 'MEDIUM' ? '⚠️ Med' :
             '📊 Low'}
          </StatusBadge>
        </div>
      </div>
    </div>
  );

  // Performance Comparison Component
  const PerformanceComparison = ({ title, yourValue, average, label, isHigherBetter = true }) => (
    <div style={{
      ...styles.card,
      padding: "20px"
    }}>
      <h4 style={{ color: colors.primary, marginBottom: "16px", fontSize: "16px", fontWeight: "600" }}>{title}</h4>
      <div style={{ fontSize: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: colors.primary }}>Your {label}:</span>
          <span style={{ fontWeight: "600", color: colors.success }}>{yourValue}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ color: colors.primary }}>Competitor Average:</span>
          <span style={{ fontWeight: "600", color: "#666" }}>{average}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: colors.primary }}>Difference:</span>
          <span style={{
            fontWeight: "600",
            color: isHigherBetter ? 
              (yourValue >= average ? colors.success : colors.danger) :
              (yourValue <= average ? colors.success : colors.danger)
          }}>
            {isHigherBetter ? 
              `${yourValue >= average ? '+' : ''}${yourValue - average}` :
              `${yourValue <= average ? '-' : '+'}${Math.abs(yourValue - average)}`
            } {yourValue >= average === isHigherBetter ? 'ahead' : 'behind'}
          </span>
        </div>
      </div>
    </div>
  );

  // Alert Box Component
  const AlertBox = ({ type, title, children, borderColor }) => (
    <div style={{
      ...styles.alertBox,
      padding: "20px",
      marginBottom: "24px",
      borderLeft: `4px solid ${borderColor}`
    }}>
      {title && <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: colors.primary }}>{title}</p>}
      <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
        {children}
      </p>
    </div>
  );

  // Section Card Component
  const SectionCard = ({ title, children, className = "" }) => (
    <div style={{
      ...styles.majorCard,
      padding: "24px",
      marginBottom: "24px"
    }} className={className}>
      <h3 style={{ color: colors.primary, marginBottom: "20px", fontSize: "20px" }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .metric-grid { grid-template-columns: 1fr 1fr !important; gap: 12px !important; }
          .two-col-grid { grid-template-columns: 1fr !important; gap: 12px !important; }
          .competitor-stats { display: flex; gap: 8px; font-size: 12px; color: #666; flex-wrap: wrap; }
          .metric-card { padding: 16px !important; }
          .competitor-card { padding: 12px !important; margin-bottom: 8px !important; }
        }
        @media (min-width: 481px) {
          .metric-grid { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
          .two-col-grid { grid-template-columns: 1fr 1fr; }
          .competitor-stats { display: flex; gap: 16px; font-size: 14px; color: #666; }
        }
      `}</style>
      
      <div style={{ padding: "40px 20px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "700",
            marginBottom: "24px",
            color: colors.primary,
          }}>
            📍 Google Business Profile Performance
          </h2>

          {/* Executive Summary */}
          <AlertBox borderColor={colors.primary}>
            <strong>Profile Performance Summary:</strong> Your {auditData.rating}⭐ rating with {auditData.reviewCount} reviews places you among top performers. 
            With {auditData.photoCount} photos uploaded and {auditData.completenessScore}% profile completeness, you're well-positioned but missing 
            posting activity ({auditData.postsActivity.lastPost} since last update). Your early {auditData.workingHours.start} start time gives you a competitive edge over most contractors.
          </AlertBox>

          {/* Progress Bar */}
          <ProgressBar value={auditData.completenessScore} label="Profile Completeness" />

          {/* Metric Cards */}
          <div className="metric-grid" style={{ ...styles.gridResponsive, marginBottom: "32px" }}>
            <MetricCard
              title="Review Count"
              value={auditData.reviewCount}
              subtitle={`Average: ${avgCompetitorReviews} reviews`}
              icon={Star}
              color={auditData.reviewCount >= avgCompetitorReviews ? colors.success : colors.warning}
              trend={auditData.reviewCount >= avgCompetitorReviews ? "↗ Above average" : "↓ Below average"}
              performance={Math.round((auditData.reviewCount / avgCompetitorReviews) * 100)}
            />
            <MetricCard
              title="Photo Count"
              value={auditData.photoCount}
              subtitle={`Target: ${avgCompetitorPhotos} photos`}
              icon={Camera}
              color={auditData.photoCount >= avgCompetitorPhotos ? colors.success : colors.warning}
              trend={auditData.photoCount >= avgCompetitorPhotos ? "↗ Good coverage" : "→ Need more"}
            />
            <MetricCard
              title="Google Posts"
              value={auditData.postsActivity.totalPosts}
              subtitle="Post weekly for visibility"
              icon={TrendingUp}
              color={colors.danger}
              trend="↓ None posted"
            />
            <MetricCard
              title="Profile Score"
              value={`${auditData.completenessScore}%`}
              subtitle="Completeness rating"
              icon={CheckCircle}
              color={auditData.completenessScore >= 90 ? colors.success : colors.warning}
              trend={auditData.completenessScore >= 90 ? "↗ Excellent" : "→ Good"}
              progress={auditData.completenessScore}
            />
          </div>

          {/* Competitive Position Alert */}
          <AlertBox borderColor={colors.info}>
            <strong>📊 Your Competitive Position:</strong> Your {auditData.rating}⭐ rating ties you for top position, but volume-focused competitors are building authority through 
            higher review counts and extensive photo galleries. Your perfect rating is your strongest differentiator - leverage this advantage by increasing posting frequency and highlighting your Eagle Mountain expertise to maintain market leadership.
          </AlertBox>

          {/* Performance Analysis */}
          <SectionCard title="📈 Detailed Performance Analysis">
            <div className="two-col-grid" style={{ ...styles.gridResponsive, marginBottom: "20px" }}>
              <PerformanceComparison 
                title="📝 Review Performance"
                yourValue={auditData.reviewCount}
                average={avgCompetitorReviews}
                label="Reviews"
              />
              <PerformanceComparison 
                title="⭐ Rating Performance"
                yourValue={auditData.rating}
                average={parseFloat(avgCompetitorRating)}
                label="Rating"
              />
            </div>

            <div style={{ ...styles.alertBox, padding: "16px", marginBottom: "16px", borderLeft: `4px solid ${colors.info}` }}>
              <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>🔍 Key Performance Insights</h4>
              <div style={{ fontSize: "14px", lineHeight: "1.6", color: colors.primary }}>
                <div style={{ marginBottom: "8px" }}>✓ Perfect {auditData.rating}⭐ rating maintains {(auditData.rating - avgCompetitorRating).toFixed(1)} point advantage over {avgCompetitorRating}⭐ competitor average</div>
                <div style={{ marginBottom: "8px" }}>→ Review count of {auditData.reviewCount} is {Math.abs(auditData.reviewCount - avgCompetitorReviews)} {auditData.reviewCount >= avgCompetitorReviews ? 'above' : 'below'} the {avgCompetitorReviews} competitor average</div>
                <div>! Photo count needs improvement: {auditData.photoCount} vs {avgCompetitorPhotos} average (add {Math.max(0, avgCompetitorPhotos - auditData.photoCount)} photos for optimal coverage)</div>
              </div>
            </div>

            <div style={{ ...styles.alertBox, padding: "16px", borderLeft: `4px solid ${colors.warning}` }}>
              <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>🎯 Priority Actions</h4>
              <div style={{ fontSize: "14px", lineHeight: "1.6", color: colors.primary }}>
                <div style={{ marginBottom: "8px" }}>1. <strong>Start weekly posting</strong> - Last update was {auditData.postsActivity.lastPost}, regular posts boost visibility</div>
                <div style={{ marginBottom: "8px" }}>2. <strong>Add {Math.max(0, avgCompetitorPhotos - auditData.photoCount)} more photos</strong> - Target {avgCompetitorPhotos} total to match top performers</div>
                <div>3. <strong>Maintain perfect rating</strong> - Your {auditData.rating}⭐ rating is a key competitive advantage</div>
              </div>
            </div>
          </SectionCard>

          {/* Competitors */}
          <SectionCard title="🏆 Top 6 Competitor Comparison">
            <div className="two-col-grid" style={{ ...styles.gridResponsive, marginBottom: "20px" }}>
              {auditData.competitors?.slice(0, 6).map((competitor, index) => (
                <CompetitorCard key={index} competitor={competitor} showRank={true} />
              ))}
            </div>

            <div style={{ ...styles.alertBox, padding: "16px", borderLeft: `4px solid ${colors.info}` }}>
              <h4 style={{ color: colors.primary, marginBottom: "16px", fontSize: "16px" }}>📊 Market Position Summary</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", textAlign: "center" }}>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: colors.success }}>#1</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>Current Rank</div>
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: colors.info }}>{auditData.rating}⭐</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>Perfect Rating</div>
                </div>
                <div>
                  <div style={{ fontSize: "24px", fontWeight: "700", color: colors.warning }}>2</div>
                  <div style={{ fontSize: "14px", color: "#666" }}>High Threats</div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Working Hours */}
          <SectionCard title="🕐 Working Hours Competitive Advantage">
            <div className="two-col-grid" style={{ ...styles.gridResponsive, marginBottom: "20px" }}>
              <div style={{ ...styles.alertBox, padding: "20px", borderLeft: `4px solid ${colors.success}` }}>
                <h4 style={{ color: colors.primary, marginBottom: "16px", fontSize: "16px" }}>Your Schedule Benefits</h4>
                <div style={{ fontSize: "14px", color: colors.primary }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <StatusBadge status="excellent">{auditData.workingHours.start} Start</StatusBadge>
                    <span>2 hours before most competitors</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                    <StatusBadge status="good">{auditData.workingHours.totalHours} Hours/Day</StatusBadge>
                    <span>Full business day coverage</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <StatusBadge status="warning">{auditData.workingHours.days}</StatusBadge>
                    <span>Focused weekday service</span>
                  </div>
                </div>
              </div>
              
              <div style={{ ...styles.alertBox, padding: "20px", borderLeft: `4px solid ${colors.info}` }}>
                <h4 style={{ color: colors.primary, marginBottom: "16px", fontSize: "16px" }}>Competitor Analysis</h4>
                <div style={{ fontSize: "14px", color: colors.primary }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span>Early starters (7am):</span>
                    <StatusBadge status="excellent">4 businesses</StatusBadge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span>Weekend workers:</span>
                    <StatusBadge status="warning">6 competitors</StatusBadge>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>Extended hours:</span>
                    <StatusBadge status="good">2 competitors</StatusBadge>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ ...styles.alertBox, padding: "16px", borderLeft: `4px solid ${colors.success}` }}>
              <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>💡 Strategic Opportunity</h4>
              <p style={{ color: colors.primary, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                <strong>Early Bird Advantage:</strong> Your {auditData.workingHours.start} start captures time-sensitive projects before competitors. 
                <strong> Weekend Expansion Opportunity:</strong> 6 competitors work weekends - consider selective weekend availability for premium projects.
                <strong> After-Hours Gap:</strong> Extended-hour competitors capture emergency work opportunities.
              </p>
            </div>
          </SectionCard>

          {/* Strategic Recommendations */}
          <SectionCard title="📋 Strategic Recommendations">
            <div className="two-col-grid" style={styles.gridResponsive}>
              <div style={{ ...styles.alertBox, padding: "20px", borderLeft: `4px solid ${colors.success}` }}>
                <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>1. Leverage Rating Advantage</h4>
                <p style={{ color: colors.primary, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                  Your perfect {auditData.rating}⭐ rating is your strongest asset. Highlight this in posts and encourage satisfied customers to mention your quality work in reviews.
                </p>
              </div>
              <div style={{ ...styles.alertBox, padding: "20px", borderLeft: `4px solid ${colors.warning}` }}>
                <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>2. Increase Photo Portfolio</h4>
                <p style={{ color: colors.primary, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                  Add {Math.max(0, avgCompetitorPhotos - auditData.photoCount)} more photos to reach the {avgCompetitorPhotos}-photo benchmark. Focus on before/after shots and process documentation.
                </p>
              </div>
              <div style={{ ...styles.alertBox, padding: "20px", borderLeft: `4px solid ${colors.info}` }}>
                <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>3. Establish Posting Routine</h4>
                <p style={{ color: colors.primary, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                  Create a weekly posting schedule featuring project updates, tips, and Eagle Mountain-specific content to maintain visibility in local searches.
                </p>
              </div>
              <div style={{ ...styles.alertBox, padding: "20px", borderLeft: `4px solid ${colors.success}` }}>
                <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>4. Maximize Early Hours Advantage</h4>
                <p style={{ color: colors.primary, fontSize: "14px", lineHeight: "1.6", margin: 0 }}>
                  Promote your {auditData.workingHours.start} availability in posts and on your profile. Many homeowners prefer early-starting contractors for less disruptive work schedules.
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Profile Strengths & Opportunities */}
          <div className="two-col-grid" style={styles.gridResponsive}>
            <div style={{ ...styles.card, padding: "24px" }}>
              <h3 style={{ color: colors.primary, marginBottom: "16px" }}>Profile Strengths</h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle size={16} style={{ color: colors.success }} />
                  <span>Perfect {auditData.rating}⭐ rating</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle size={16} style={{ color: colors.success }} />
                  <span>{auditData.reviewCount} customer reviews</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle size={16} style={{ color: colors.success }} />
                  <span>{auditData.photoCount} photos uploaded</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <CheckCircle size={16} style={{ color: colors.success }} />
                  <span>Verified business information</span>
                </div>
              </div>
            </div>

            <div style={{ ...styles.card, padding: "24px" }}>
              <h3 style={{ color: colors.primary, marginBottom: "16px" }}>Optimization Opportunities</h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <AlertTriangle size={16} style={{ color: colors.warning }} />
                  <span>Start weekly posting routine</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <AlertTriangle size={16} style={{ color: colors.warning }} />
                  <span>Add {Math.max(0, avgCompetitorPhotos - auditData.photoCount)} more photos</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <AlertTriangle size={16} style={{ color: colors.warning }} />
                  <span>Encourage more reviews</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <AlertTriangle size={16} style={{ color: colors.warning }} />
                  <span>Add FAQ section</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GoogleBusinessTab;