import React, { useState } from 'react';

// BRANDAIDE color scheme
const colors = {
  primary: '#2A3B4A',
  white: '#FFFFFF',
  lightGray: '#E1E1E1',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444'
};

// Sample data for testing - replace with your actual data structure
const sampleData = {
  businessName: "LM Finishing and Construction",
  currentRank: 1,
  rating: 5.0,
  reviewCount: 21,
  photoCount: 29,
  competitors: [
    { title: "Gearhart Custom Carpentry", rating: 5, reviewCount: 1, photoCount: 6, domain: "gearhartcustomcarpentryllc.com" },
    { title: "Finished Appeal Carpentry", rating: 4.2, reviewCount: 12, photoCount: 14, domain: "www.finishedappealcarpentry.com" },
    { title: "Oikos Prime Finish Carpentry LLC", rating: 5, reviewCount: 8, photoCount: 8 },
    { title: "Farmhouse Carpentry, LLC", rating: 5, reviewCount: 2, photoCount: 12, domain: "www.farmhousecarpentryllc.com" },
    { title: "Portugal Woodworks LLC", rating: 5, reviewCount: 19, photoCount: 142, domain: "portugalwoodworks.com" },
    { title: "New Springs Construction LLC", rating: 4.8, reviewCount: 26, photoCount: 51, domain: "newspringsconstruction.com" },
    { title: "Barnett Carpentry", rating: 5, reviewCount: 9, photoCount: 86, domain: "instagram.com" },
    { title: "GCR Millworks Finish Carpentry", rating: 5, reviewCount: 75, photoCount: 216, domain: "www.gcrmillworks.com" }
  ]
};

// Your existing shared components (recreated for preview)
const MetricCard = ({ title, value, description, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'danger': return colors.danger;
      default: return colors.primary;
    }
  };

  return (
    <div style={{
      background: colors.white,
      padding: '20px',
      borderRadius: '12px',
      border: `2px solid ${getStatusColor()}`,
      textAlign: 'center',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
    }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: colors.primary,
        margin: '0 0 8px 0'
      }}>
        {title}
      </h3>
      <div style={{
        fontSize: '24px',
        fontWeight: '700',
        color: getStatusColor(),
        margin: '0 0 8px 0'
      }}>
        {value}
      </div>
      <p style={{
        fontSize: '12px',
        color: '#666',
        margin: 0
      }}>
        {description}
      </p>
    </div>
  );
};

// Reusable styles object
const styles = {
  container: {
    padding: '40px 20px',
    background: '#F8F9FA',
    minHeight: '100vh'
  },
  maxWidth: {
    maxWidth: '1200px',
    margin: '0 auto'
  },
  pageHeader: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '24px',
    color: colors.primary
  },
  executiveSummary: {
    background: colors.lightGray,
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '32px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
  summaryText: {
    margin: 0,
    fontSize: '16px',
    lineHeight: '1.6',
    color: colors.primary
  },
  primarySection: {
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
  },
  sectionHeader: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 20px 0'
  },
  grid2x2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '24px'
  },
  competitorCard: {
    background: colors.white,
    padding: '20px',
    borderRadius: '12px',
    border: `1px solid ${colors.warning}`,
    position: 'relative',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
  },
  rankBadge: {
    position: 'absolute',
    top: '-8px',
    right: '16px',
    background: colors.warning,
    color: colors.white,
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
  },
  competitorName: {
    fontSize: '16px',
    fontWeight: '600',
    color: colors.primary,
    margin: '0 0 12px 0',
    paddingRight: '60px'
  },
  competitorStats: {
    fontSize: '14px',
    color: colors.success,
    fontWeight: '600',
    marginBottom: '12px'
  },
  competitorMeta: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '8px'
  },
  photoAnalysis: {
    background: colors.white,
    border: `1px solid ${colors.warning}`,
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)'
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    textAlign: 'center'
  },
  photoMetric: {
    fontSize: '24px',
    fontWeight: '700'
  },
  photoLabel: {
    fontSize: '12px',
    color: '#666'
  },
  photoPercentage: {
    fontSize: '12px'
  },
  button: {
    background: colors.primary,
    color: colors.white,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '800px'
  },
  tableHeader: {
    background: colors.lightGray,
    padding: '16px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.primary
  },
  tableRow: {
    borderBottom: '1px solid #E5E7EB'
  },
  tableCell: {
    padding: '16px',
    fontSize: '14px'
  },
  pillBadge: {
    padding: '6px 18px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'inline-block',
    textAlign: 'center',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    color: colors.white
  }
};

const CompetitorsTab = ({ data = sampleData }) => {
  const [showAllCompetitors, setShowAllCompetitors] = useState(false);

  // Use sample data if no data provided, with safe fallbacks
  const safeData = {
    businessName: data?.businessName || sampleData.businessName,
    currentRank: data?.currentRank || sampleData.currentRank,
    rating: data?.rating || sampleData.rating,
    reviewCount: data?.reviewCount || sampleData.reviewCount,
    photoCount: data?.photoCount || sampleData.photoCount,
    competitors: data?.competitors || sampleData.competitors
  };

  const competitors = safeData.competitors || [];
  const totalCompetitors = competitors.length;
  
  // Calculate competitive metrics dynamically
  const avgCompetitorRating = competitors.length > 0 
    ? competitors.reduce((sum, comp) => sum + (comp.rating || 0), 0) / competitors.length 
    : 0;
  const avgCompetitorReviews = competitors.length > 0 
    ? competitors.reduce((sum, comp) => sum + (comp.reviewCount || 0), 0) / competitors.length 
    : 0;
  const avgCompetitorPhotos = competitors.length > 0 
    ? competitors.reduce((sum, comp) => sum + (comp.photoCount || 0), 0) / competitors.length 
    : 0;
  
  // Dynamic website percentage calculation
  const competitorsWithWebsites = competitors.filter(comp => comp.domain && comp.domain.trim()).length;
  const websitePercentage = competitors.length > 0 
    ? Math.round((competitorsWithWebsites / competitors.length) * 100) 
    : 0;
  
  // Dynamic threat calculation based on data distribution
  const allReviews = competitors.map(c => c.reviewCount || 0).sort((a, b) => b - a);
  const allPhotos = competitors.map(c => c.photoCount || 0).sort((a, b) => b - a);
  
  // Calculate dynamic thresholds (75th percentile for high threat)
  const reviewThreshold75 = allReviews[Math.floor(allReviews.length * 0.25)] || safeData.reviewCount;
  const photoThreshold75 = allPhotos[Math.floor(allPhotos.length * 0.25)] || safeData.photoCount;
  
  // Find threats based on dynamic thresholds
  const highThreats = competitors.filter(comp => 
    (comp.reviewCount || 0) > safeData.reviewCount || 
    (comp.rating || 0) > safeData.rating ||
    (comp.reviewCount || 0) > reviewThreshold75 ||
    (comp.photoCount || 0) > photoThreshold75
  );
  
  const yourRatingAdvantage = safeData.rating - avgCompetitorRating;
  const yourReviewPosition = competitors.filter(comp => (comp.reviewCount || 0) > safeData.reviewCount).length + 1;
  const yourPhotoPosition = competitors.filter(comp => (comp.photoCount || 0) > safeData.photoCount).length + 1;

  // Map competitors to consistent format with dynamic threat levels
  const mappedCompetitors = competitors.map((comp, index) => {
    const reviews = comp.reviewCount || 0;
    const photos = comp.photoCount || 0;
    const rating = comp.rating || 0;
    
    // Dynamic threat assessment
    let threat = "LOW";
    if (reviews > reviewThreshold75 || photos > photoThreshold75 || 
        reviews > safeData.reviewCount || rating > safeData.rating) {
      threat = "HIGH";
    } else if (reviews > avgCompetitorReviews || photos > avgCompetitorPhotos || 
               rating >= safeData.rating * 0.9) {
      threat = "MEDIUM";
    }
    
    return {
      rank: index + 2,
      name: comp.title || comp.name || 'Unknown Business',
      reviews,
      rating,
      photos,
      threat,
      isHighThreat: threat === "HIGH",
      domain: comp.domain,
      phone: comp.phone,
      hours: "Hours vary"
    };
  });

  // Calculate photo metrics dynamically
  const allCompetitorPhotos = mappedCompetitors.map(c => c.photos).sort((a, b) => b - a);
  const topCompetitorPhotos = allCompetitorPhotos[0] || 0;
  const yourPhotos = safeData.photoCount;
  
  // Dynamic photo gap calculation
  const photosNeededForAverage = Math.max(0, Math.ceil(avgCompetitorPhotos - yourPhotos));

  // Dynamic market position calculations
  const ratingPosition = competitors.filter(comp => (comp.rating || 0) > safeData.rating).length + 1;
  const ratingPositionText = ratingPosition === 1 ? "1st" : 
                            ratingPosition === 2 ? "2nd" : 
                            ratingPosition === 3 ? "3rd" : 
                            `${ratingPosition}th`;

  // Market metrics - now fully dynamic
  const marketMetrics = [
    {
      title: "Rating Position",
      value: ratingPositionText,
      description: `of ${totalCompetitors + 1} businesses`,
      status: ratingPosition <= 2 ? "success" : ratingPosition <= 4 ? "warning" : "danger"
    },
    {
      title: "Digital Presence", 
      value: `${websitePercentage}%`,
      description: `${competitorsWithWebsites}/${totalCompetitors} competitors have websites`,
      status: websitePercentage >= 70 ? "success" : websitePercentage >= 50 ? "warning" : "danger"
    },
    {
      title: "High Threats",
      value: highThreats.length,
      description: `of ${totalCompetitors} competitors requiring attention`,
      status: highThreats.length <= Math.ceil(totalCompetitors * 0.2) ? "success" : 
              highThreats.length <= Math.ceil(totalCompetitors * 0.4) ? "warning" : "danger"
    },
    {
      title: "Review Position",
      value: `#${yourReviewPosition}`,
      description: `out of ${totalCompetitors + 1} by review count`,
      status: yourReviewPosition <= 3 ? "success" : yourReviewPosition <= 5 ? "warning" : "danger"
    }
  ];

  // Dynamic top threats count (show top 25% or minimum 4)
  const topThreatsToShow = Math.max(4, Math.ceil(totalCompetitors * 0.25));

  // Render competitor card component
  const CompetitorCard = ({ competitor, index }) => (
    <div style={styles.competitorCard}>
      <div style={styles.rankBadge}>
        #{competitor.rank}
      </div>
      <h4 style={styles.competitorName}>
        {competitor.name}
      </h4>
      <div style={styles.competitorStats}>
        {competitor.rating ? `${competitor.rating}⭐` : 'No rating'} • {competitor.reviews} reviews • {competitor.photos} photos
      </div>
      {competitor.domain && (
        <div style={styles.competitorMeta}>
          Domain: {competitor.domain}
        </div>
      )}
      <div style={styles.competitorMeta}>
        {competitor.hours}
      </div>
    </div>
  );

  // Render pill badge helper
  const renderPillBadge = (content, bgColor, minWidth = '60px') => (
    <span style={{
      ...styles.pillBadge,
      background: bgColor,
      minWidth
    }}>
      {content}
    </span>
  );

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        
        {/* Page Header */}
        <h2 style={styles.pageHeader}>
          🏆 Competitor Analysis ({totalCompetitors} Competitors)
        </h2>

        {/* Executive Summary - Dynamic */}
        <div style={styles.executiveSummary}>
          <p style={styles.summaryText}>
            <strong>Your Competitive Position:</strong> You rank #{safeData.currentRank} with a {safeData.rating}⭐ rating and {safeData.reviewCount} reviews. 
            Out of {totalCompetitors} competitors analyzed, {highThreats.length} pose high threats due to superior metrics. 
            Market averages: {avgCompetitorRating.toFixed(1)}⭐ rating, {Math.round(avgCompetitorReviews)} reviews, {Math.round(avgCompetitorPhotos)} photos.
            {websitePercentage}% of competitors have websites.
          </p>
        </div>

        {/* Market Structure Analysis */}
        <div style={{
          ...styles.primarySection,
          background: '#EBF8FF',
          border: `1px solid #3B82F6`
        }}>
          <h3 style={{
            ...styles.sectionHeader,
            color: '#1E40AF'
          }}>
            📊 Market Structure Analysis
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {marketMetrics.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                description={metric.description}
                status={metric.status}
              />
            ))}
          </div>
        </div>

        {/* Top Threats Section - Dynamic count */}
        <div style={{
          ...styles.primarySection,
          background: '#FEF3C7',
          border: `1px solid ${colors.warning}`
        }}>
          <h3 style={{
            ...styles.sectionHeader,
            color: colors.warning
          }}>
            🔥 Top Threats (Ranks #2-#{topThreatsToShow + 1})
          </h3>
          
          <div style={styles.grid2x2}>
            {mappedCompetitors.slice(0, topThreatsToShow).map((competitor, index) => (
              <CompetitorCard key={index} competitor={competitor} index={index} />
            ))}
          </div>

          {/* Photo Competition Analysis - Dynamic */}
          <div style={styles.photoAnalysis}>
            <h4 style={{
              ...styles.sectionHeader,
              fontSize: '16px',
              color: colors.warning,
              margin: '0 0 16px 0'
            }}>
              📸 Photo Competition Analysis
            </h4>
            <div style={styles.photoGrid}>
              <div>
                <div style={{
                  ...styles.photoMetric,
                  color: colors.danger
                }}>
                  {topCompetitorPhotos}
                </div>
                <div style={styles.photoLabel}>Top Competitor Photos</div>
                <div style={{
                  ...styles.photoPercentage,
                  color: colors.danger
                }}>
                  {topCompetitorPhotos > 0 && yourPhotos > 0 ? `+${Math.round(((topCompetitorPhotos - yourPhotos) / yourPhotos) * 100)}% vs You` : 'No data'}
                </div>
              </div>
              <div>
                <div style={{
                  ...styles.photoMetric,
                  color: colors.warning
                }}>
                  {Math.round(avgCompetitorPhotos)}
                </div>
                <div style={styles.photoLabel}>Market Average</div>
                <div style={{
                  ...styles.photoPercentage,
                  color: colors.warning
                }}>
                  {avgCompetitorPhotos > yourPhotos ? `+${Math.round(((avgCompetitorPhotos - yourPhotos) / yourPhotos) * 100)}% vs You` : 
                   yourPhotos > avgCompetitorPhotos ? `You're +${Math.round(((yourPhotos - avgCompetitorPhotos) / avgCompetitorPhotos) * 100)}% above avg` : 'At average'}
                </div>
              </div>
              <div>
                <div style={{
                  ...styles.photoMetric,
                  color: colors.success
                }}>
                  {yourPhotos}
                </div>
                <div style={styles.photoLabel}>Your Photos</div>
                <div style={{
                  ...styles.photoPercentage,
                  color: yourPhotos >= avgCompetitorPhotos ? colors.success : '#666'
                }}>
                  {photosNeededForAverage > 0 ? `Need +${photosNeededForAverage} for market avg` : 'Above market average'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show/Hide All Competitors Button */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <button 
            onClick={() => setShowAllCompetitors(!showAllCompetitors)}
            style={styles.button}
            onMouseOver={(e) => e.target.style.opacity = '0.9'}
            onMouseOut={(e) => e.target.style.opacity = '1'}
          >
            {showAllCompetitors ? '📋 Hide Competitor Details' : `📊 Show All ${totalCompetitors} Competitors`}
          </button>
        </div>

        {/* Performance Comparison Table - Dynamic row count */}
        <div style={{
          ...styles.primarySection,
          background: colors.white,
          overflowX: 'auto'
        }}>
          <h3 style={styles.sectionHeader}>
            📋 Performance Comparison (Top {Math.min(6, totalCompetitors + 1)})
          </h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>Rank</th>
                <th style={styles.tableHeader}>Business</th>
                <th style={styles.tableHeader}>Rating</th>
                <th style={styles.tableHeader}>Reviews</th>
                <th style={styles.tableHeader}>Photos</th>
                <th style={styles.tableHeader}>Competitive Advantage</th>
              </tr>
            </thead>
            <tbody>
              {/* Your Business Row */}
              <tr style={{
                ...styles.tableRow,
                background: '#D1FAE5'
              }}>
                <td style={styles.tableCell}>
                  {renderPillBadge('#1', colors.success)}
                </td>
                <td style={{...styles.tableCell, fontWeight: '600'}}>
                  {safeData.businessName}
                </td>
                <td style={styles.tableCell}>
                  {renderPillBadge(`${safeData.rating}⭐`, colors.success, '70px')}
                </td>
                <td style={styles.tableCell}>{safeData.reviewCount}</td>
                <td style={styles.tableCell}>{safeData.photoCount}</td>
                <td style={styles.tableCell}>
                  {ratingPosition === 1 ? 'Perfect rating leader' : 
                   yourReviewPosition <= 3 ? 'Top review performer' :
                   yourPhotoPosition <= 3 ? 'Strong photo presence' :
                   'Market position established'}
                </td>
              </tr>
              
              {/* Competitor Rows - Dynamic count */}
              {mappedCompetitors.slice(0, Math.min(5, totalCompetitors)).map((comp, index) => (
                <tr key={index} style={styles.tableRow}>
                  <td style={styles.tableCell}>
                    {renderPillBadge(`#${comp.rank}`, colors.primary)}
                  </td>
                  <td style={{...styles.tableCell, fontWeight: '600'}}>
                    {comp.name}
                  </td>
                  <td style={styles.tableCell}>
                    {renderPillBadge(
                      comp.rating ? `${comp.rating}⭐` : 'No rating',
                      comp.rating >= 4.8 ? colors.success : comp.rating >= 4.5 ? colors.warning : colors.danger,
                      '70px'
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {comp.reviews}
                    {comp.reviews !== safeData.reviewCount && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: comp.reviews > safeData.reviewCount ? colors.danger : colors.success
                      }}>
                        ({comp.reviews > safeData.reviewCount ? '+' : ''}{Math.round(((comp.reviews - safeData.reviewCount) / Math.max(safeData.reviewCount, 1)) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    {comp.photos}
                    {comp.photos !== yourPhotos && (
                      <span style={{
                        marginLeft: '8px',
                        fontSize: '12px',
                        color: comp.photos > yourPhotos ? colors.danger : colors.success
                      }}>
                        ({comp.photos > yourPhotos ? '+' : ''}{Math.round(((comp.photos - yourPhotos) / Math.max(yourPhotos, 1)) * 100)}%)
                      </span>
                    )}
                  </td>
                  <td style={{...styles.tableCell, fontSize: '12px'}}>
                    {comp.threat === 'HIGH' ? 'High competitive threat' :
                     comp.threat === 'MEDIUM' ? 'Moderate competition' :
                     comp.reviews > safeData.reviewCount ? `+${Math.round(((comp.reviews - safeData.reviewCount) / Math.max(safeData.reviewCount, 1)) * 100)}% reviews` :
                     comp.photos > yourPhotos ? `+${Math.round(((comp.photos - yourPhotos) / Math.max(yourPhotos, 1)) * 100)}% photos` :
                     "Lower performance"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Strategic Insights - Dynamic */}
        <div style={{
          ...styles.primarySection,
          background: '#EBF8FF',
          border: `1px solid #3B82F6`
        }}>
          <h3 style={{
            ...styles.sectionHeader,
            color: '#1E40AF'
          }}>
            🎯 Key Competitive Insights
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1E40AF', 
                margin: '0 0 8px 0'
              }}>
                Your Advantages
              </h4>
              <ul style={{ fontSize: '14px', margin: 0, paddingLeft: '16px', lineHeight: '1.5' }}>
                <li>Rank #{safeData.currentRank} market position</li>
                <li>{safeData.rating}⭐ rating ({yourRatingAdvantage > 0 ? `+${yourRatingAdvantage.toFixed(1)}` : yourRatingAdvantage.toFixed(1)} vs avg)</li>
                <li>{safeData.reviewCount} reviews (#{yourReviewPosition} position)</li>
                <li>{safeData.photoCount} photos (#{yourPhotoPosition} position)</li>
                {websitePercentage < 60 && <li>Digital presence opportunity vs {websitePercentage}% competitor rate</li>}
              </ul>
            </div>
            <div>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1E40AF', 
                margin: '0 0 8px 0'
              }}>
                Market Landscape
              </h4>
              <ul style={{ fontSize: '14px', margin: 0, paddingLeft: '16px', lineHeight: '1.5' }}>
                <li>{highThreats.length}/{totalCompetitors} high-threat competitors identified</li>
                <li>Market averages: {avgCompetitorRating.toFixed(1)}⭐, {Math.round(avgCompetitorReviews)} reviews</li>
                <li>{competitorsWithWebsites}/{totalCompetitors} competitors have websites ({websitePercentage}%)</li>
                <li>Photo competition: {Math.round(avgCompetitorPhotos)} average, {topCompetitorPhotos} top performer</li>
              </ul>
            </div>
            <div>
              <h4 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#1E40AF', 
                margin: '0 0 8px 0'
              }}>
                Strategic Priorities
              </h4>
              <ul style={{ fontSize: '14px', margin: 0, paddingLeft: '16px', lineHeight: '1.5' }}>
                <li>Monitor {highThreats.length} high-threat competitor activities</li>
                <li>Maintain {safeData.rating}⭐ rating excellence</li>
                {photosNeededForAverage > 0 && <li>Consider adding {photosNeededForAverage}+ photos to reach market average</li>}
                {yourReviewPosition > 3 && <li>Review acquisition strategy to improve #{yourReviewPosition} position</li>}
                <li>Leverage current ranking advantage in marketing</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompetitorsTab;