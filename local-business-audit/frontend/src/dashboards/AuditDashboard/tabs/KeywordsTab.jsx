import React from 'react';
import { Search, Target, MapPin, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";

// Your exact color scheme
const colors = {
  primary: "#2A3B4A",
  lightGray: "#F0F0F0", 
  white: "#FFFFFF",
  success: "#10B981",
  danger: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6"
};

// Your exact MetricCard component
const MetricCard = ({ title, value, subtitle, icon: Icon, color, progress }) => (
  <div style={{
    background: colors.white,
    padding: "20px",
    borderRadius: "12px",
    border: `1px solid ${colors.lightGray}`,
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
    transition: "all 0.2s ease"
  }}>
    <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
      <Icon size={24} color={color} />
    </div>
    <div style={{ fontSize: "24px", fontWeight: "700", color: colors.primary, marginBottom: "4px" }}>
      {value}
    </div>
    <div style={{ fontSize: "14px", color: colors.primary, fontWeight: "600", marginBottom: "4px" }}>
      {title}
    </div>
    <div style={{ fontSize: "12px", color: "#666" }}>
      {subtitle}
    </div>
    {progress !== undefined && (
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
            transition: "width 0.3s ease"
          }} />
        </div>
      </div>
    )}
  </div>
);

// Your exact StatusBadge component
const StatusBadge = ({ status, children }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'excellent': return { bg: '#DEF7EC', text: '#047857', border: '#10B981' };
      case 'good': return { bg: '#DBEAFE', text: '#1D4ED8', border: '#3B82F6' };
      case 'warning': return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
      case 'critical': return { bg: '#FEE2E2', text: '#B91C1C', border: '#EF4444' };
      default: return { bg: colors.lightGray, text: '#666', border: '#D1D5DB' };
    }
  };
  
  const statusColors = getStatusColors();
  
  return (
    <span style={{
      padding: "6px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: "600",
      backgroundColor: statusColors.bg,
      color: statusColors.text,
      border: `1px solid ${statusColors.border}`,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)"
    }}>
      {children}
    </span>
  );
};

// Progress Bar component (matching your style)
const ProgressBar = ({ value, showLabel = true }) => (
  <div style={{ marginBottom: "16px" }}>
    {showLabel && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontWeight: "600", color: colors.primary }}>Progress</span>
        <span style={{ fontWeight: "600", color: colors.primary }}>{value}%</span>
      </div>
    )}
    <div style={{ width: "100%", backgroundColor: colors.lightGray, borderRadius: "6px", height: "8px", overflow: "hidden" }}>
      <div 
        style={{
          height: "100%",
          borderRadius: "6px",
          transition: "width 1s ease",
          width: `${value}%`,
          backgroundColor: value >= 80 ? colors.success : value >= 60 ? colors.warning : colors.danger
        }}
      />
    </div>
  </div>
);

// Comprehensive sample data
const comprehensiveData = {
  keywordPerformance: {
    totalTrackedKeywords: 15,
    primaryKeyword: "Carpenter",
    topRankingKeywords: [
      { keyword: "basement finishing Utah", searchVolume: 390, competition: "MEDIUM", cpc: 10.59 },
      { keyword: "basement finishing Draper", searchVolume: 70, competition: "LOW" },
      { keyword: "basement finishing Lehi", searchVolume: 70, competition: "LOW" },
      { keyword: "finish carpentry Utah", searchVolume: 20, competition: "MEDIUM" },
      { keyword: "Carpenter Eagle Mountain Utah", searchVolume: 0, competition: "LOW" },
      { keyword: "basement finishing Eagle Mountain", searchVolume: 0, competition: "LOW" },
      { keyword: "custom carpentry Eagle Mountain", searchVolume: 0, competition: "LOW" }
    ],
    zeroVolumeKeywords: [
      "Carpenter Eagle Mountain Utah",
      "basement finishing Eagle Mountain", 
      "custom carpentry Eagle Mountain",
      "custom carpentry Utah",
      "finish carpentry Eagle Mountain"
    ],
    totalMonthlyVolume: 620,
    highestVolumeKeyword: "basement finishing Utah"
  },
  localContentScore: 10,
  currentRank: 1,
  businessName: "Eagle Mountain Carpenter"
};

const ComprehensiveKeywordsTab = ({ data = comprehensiveData }) => {
  // Enhanced calculations
  const totalVolume = data.keywordPerformance?.topRankingKeywords?.reduce((sum, kw) => sum + (kw.searchVolume || 0), 0) || 620;
  const zeroVolumeCount = data.keywordPerformance?.zeroVolumeKeywords?.length || 5;
  const highVolumeKeywords = data.keywordPerformance?.topRankingKeywords?.filter(kw => kw.searchVolume > 50) || [];
  const progressScore = Math.min(100, (totalVolume / 1000) * 100);

  // Keyword categories
  const keywordCategories = {
    highIntent: [
      "basement finishing Eagle Mountain",
      "custom carpentry Eagle Mountain", 
      "Carpenter near me",
      "best Carpenter Eagle Mountain",
      "home renovation Eagle Mountain"
    ],
    highVolume: data.keywordPerformance?.topRankingKeywords?.filter(kw => kw.searchVolume > 50) || [],
    missing: [
      "kitchen remodeling Eagle Mountain",
      "bathroom renovation Eagle Mountain", 
      "built-in cabinetry Eagle Mountain",
      "deck construction Eagle Mountain"
    ],
    avoid: [
      { term: "services", reason: "Too generic, lacks location specificity" },
      { term: "finishing construction", reason: "Confusing, needs clarification" },
      { term: "experts", reason: "Too broad without context" }
    ]
  };

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700", 
          marginBottom: "24px",
          color: colors.primary,
        }}>
          🔍 Keyword Performance & Local SEO Analysis
        </h2>

        {/* Executive summary */}
        <div style={{
          background: colors.lightGray,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
          borderLeft: `4px solid ${colors.primary}`,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)"
        }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
            <strong>Keyword Discovery:</strong> Analysis reveals "Carpenter" + location terms show 0 search volume, but service-specific keywords have real demand. "Basement finishing Utah" has 390 monthly searches with $10.59 CPC. Total opportunity: {totalVolume}+ monthly searches across Utah markets. Your {data.localContentScore}/100 local SEO score indicates missing "Eagle Mountain" optimization despite being ranked #{data.currentRank || 1}.
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{
          background: colors.white,
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "32px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)"
        }}>
          <ProgressBar value={15} showLabel={true} />
        </div>

        {/* Metrics Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px", 
          marginBottom: "32px",
        }}>
          <MetricCard
            title="Tracked Keywords"
            value={data.keywordPerformance?.totalTrackedKeywords || 0}
            subtitle="Active monitoring"
            icon={Search}
            color={colors.info}
          />
          <MetricCard
            title="Search Volume Found"
            value={`${totalVolume}+`}
            subtitle="Monthly searches"
            icon={TrendingUp}
            color={colors.success}
          />
          <MetricCard
            title="Zero Volume Terms"
            value={zeroVolumeCount}
            subtitle="Avoid these"
            icon={AlertTriangle}
            color={colors.danger}
          />
          <MetricCard
            title="Local SEO Score"
            value={`${data.localContentScore}/100`}
            subtitle="Needs Eagle Mountain"
            icon={MapPin}
            color={colors.danger}
            progress={data.localContentScore}
          />
        </div>

        {/* Major Discovery Section */}
        <div style={{
          background: "#DEF7EC",
          border: `1px solid #A7F3D0`,
          borderLeft: `4px solid ${colors.success}`,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow: "0 3px 12px rgba(16, 185, 129, 0.12), 0 1px 4px rgba(16, 185, 129, 0.08)"
        }}>
          <h3 style={{ color: colors.success, marginBottom: "16px", fontSize: "18px" }}>
            🚀 Major Search Volume Discovery
          </h3>
          
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ color: colors.primary, marginBottom: "12px", fontSize: "16px" }}>
              ✅ High-Volume Keywords Found
            </h4>
            <div style={{ fontSize: "14px", color: colors.primary, marginBottom: "12px" }}>
              <strong>Key Finding:</strong> Service-specific terms have real search demand:
            </div>
            <div style={{ display: "grid", gap: "12px" }}>
              {highVolumeKeywords.slice(0, 4).map((item, index) => (
                <div key={index} style={{
                  padding: "12px",
                  background: colors.white,
                  borderRadius: "8px",
                  border: "1px solid #A7F3D0",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)"
                }}>
                  <div style={{ fontWeight: "600", color: colors.primary, marginBottom: "8px", fontSize: "14px" }}>
                    {item.keyword}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    <StatusBadge status="excellent">
                      {item.searchVolume} searches/mo
                    </StatusBadge>
                    <StatusBadge status={item.competition === 'LOW' ? 'good' : 'warning'}>
                      {item.competition} comp
                    </StatusBadge>
                    {item.cpc && (
                      <StatusBadge status="warning">
                        ${item.cpc} CPC
                      </StatusBadge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Insight Box */}
          <div style={{
            background: "#EBF4FF",
            border: `1px solid #BFDBFE`,
            padding: "16px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(59, 130, 246, 0.08), 0 1px 2px rgba(59, 130, 246, 0.04)"
          }}>
            <h4 style={{ color: colors.info, marginBottom: "8px", fontSize: "14px" }}>
              💡 Strategic Insight
            </h4>
            <p style={{ color: colors.info, fontSize: "14px", margin: 0 }}>
              <strong>Game Changer:</strong> People search for "basement finishing Utah" (390 searches, $10.59 CPC), not "Carpenter Eagle Mountain" (0 searches). Create service-specific pages for Utah, Draper, Lehi, and Bluffdale to capture {totalVolume}+ monthly searches.
            </p>
          </div>
        </div>

        {/* Strategic Keyword Categories */}
        <div style={{
          background: "#EBF4FF",
          border: `1px solid #BFDBFE`,
          borderLeft: `4px solid ${colors.info}`,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow: "0 3px 12px rgba(59, 130, 246, 0.12), 0 1px 4px rgba(59, 130, 246, 0.08)"
        }}>
          <h3 style={{ color: colors.info, marginBottom: "20px", fontSize: "18px" }}>
            🎯 Strategic Keyword Categories
          </h3>
          
          {/* Four Category Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            {/* Lead-Generating Keywords */}
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}`, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)" }}>
              <h4 style={{ color: "#8B5CF6", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
                🧲 Lead-Generating Keywords
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {keywordCategories.highIntent.map((keyword, index) => (
                  <span key={index} style={{
                    background: "#F3E8FF",
                    color: "#7C3AED",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)"
                  }}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* High-Volume Opportunities */}
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}`, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)" }}>
              <h4 style={{ color: colors.success, marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
                🚀 High-Volume Opportunities
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {keywordCategories.highVolume.map((item, index) => (
                  <span key={index} style={{
                    background: "#DEF7EC",
                    color: "#047857",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)"
                  }}>
                    {item.keyword} ({item.searchVolume})
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Service Keywords */}
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}` }}>
              <h4 style={{ color: "#EA580C", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
                🧱 Missing Service Keywords
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {keywordCategories.missing.map((keyword, index) => (
                  <span key={index} style={{
                    background: "#FED7AA",
                    color: "#C2410C",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)"
                  }}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>

            {/* Keywords to Avoid */}
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}` }}>
              <h4 style={{ color: "#6B7280", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>
                ⚠️ Keywords to Avoid
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {keywordCategories.avoid.map((item, index) => (
                  <span key={index} style={{
                    background: colors.lightGray,
                    color: "#4B5563",
                    padding: "4px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)"
                  }}>
                    {item.term}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Current Performance Table */}
        <div style={{
          background: colors.white,
          padding: "24px",
          borderRadius: "12px",
          border: `1px solid ${colors.lightGray}`,
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)"
        }}>
          <h3 style={{ color: colors.primary, marginBottom: "20px" }}>
            📊 Current Website Keywords
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "600px" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Keyword</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Location</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Status</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Volume</th>
                  <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.keywordPerformance?.topRankingKeywords?.map((keyword, index) => (
                  <tr key={index} style={{ borderBottom: `1px solid ${colors.lightGray}` }}>
                    <td style={{ padding: "12px", fontWeight: "600", fontSize: "14px" }}>{keyword.keyword}</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      {keyword.keyword.includes('Utah') ? 'Utah' : 
                       keyword.keyword.includes('Eagle Mountain') ? 'Eagle Mountain' :
                       keyword.keyword.includes('Draper') ? 'Draper' :
                       keyword.keyword.includes('Lehi') ? 'Lehi' : 'Various'}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <StatusBadge status={keyword.searchVolume > 0 ? 'good' : 'critical'}>
                        {keyword.searchVolume > 0 ? 'Opportunity' : 'No Volume'}
                      </StatusBadge>
                    </td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>{keyword.searchVolume} searches</td>
                    <td style={{ padding: "12px", fontSize: "14px" }}>
                      {keyword.searchVolume > 0 ? 'Create page' : 'Avoid'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Search Volume Analysis */}
        <div style={{
          background: "#EBF4FF",
          border: `1px solid #BFDBFE`,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "24px",
          boxShadow: "0 3px 12px rgba(59, 130, 246, 0.12), 0 1px 4px rgba(59, 130, 246, 0.08)"
        }}>
          <h3 style={{ color: colors.info, marginBottom: "16px", fontSize: "18px" }}>
            📊 Search Volume Analysis
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", textAlign: "center" }}>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.info }}>{totalVolume}+</div>
              <div style={{ fontSize: "14px", color: "#6B7280" }}>Monthly Searches</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Available volume</div>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.success }}>${data.keywordPerformance?.topRankingKeywords?.[0]?.cpc || '10.59'}</div>
              <div style={{ fontSize: "14px", color: "#6B7280" }}>Cost Per Click</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>High-value keywords</div>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: "#8B5CF6" }}>{highVolumeKeywords.length}</div>
              <div style={{ fontSize: "14px", color: "#6B7280" }}>High-Volume Terms</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Priority targets</div>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.success }}>{Math.round(progressScore)}%</div>
              <div style={{ fontSize: "14px", color: "#6B7280" }}>Opportunity Score</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Market potential</div>
            </div>
          </div>
        </div>

        {/* Local SEO Warning */}
        {data.localContentScore < 50 && (
          <div style={{
            background: "#FEF3C7",
            border: `1px solid #FDE68A`,
            borderLeft: `4px solid ${colors.warning}`,
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "24px",
            boxShadow: "0 3px 12px rgba(245, 158, 11, 0.12), 0 1px 4px rgba(245, 158, 11, 0.08)"
          }}>
            <h4 style={{ color: colors.warning, marginBottom: "12px" }}>
              ⚠️ Critical Local SEO Opportunity
            </h4>
            <p style={{ margin: "0 0 16px 0", color: "#92400E", fontSize: "14px", lineHeight: "1.5" }}>
              Your local content score is {data.localContentScore}/100. Your website mentions "Utah County, Salt Lake County, Davis County" but lacks Eagle Mountain-specific content. This gap explains why you're missing local searches despite top ranking.
            </p>
            
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontWeight: "600", color: colors.warning, marginBottom: "8px", fontSize: "14px" }}>
                🚀 Quick Wins (Add "Eagle Mountain")
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {["Custom Carpentry Eagle Mountain", "Basement Finishing Eagle Mountain", "Home Renovation Eagle Mountain"].map((term, index) => (
                  <span key={index} style={{
                    background: "#DEF7EC",
                    color: "#047857",
                    padding: "8px 12px", 
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    display: "inline-block",
                    width: "fit-content",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)"
                  }}>
                    {term}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: "600", color: colors.warning, marginBottom: "8px", fontSize: "14px" }}>
                📈 Search Opportunity
              </div>
              <div style={{ fontSize: "14px", color: "#92400E", lineHeight: "1.5" }}>
                Capture {totalVolume}+ monthly searches by optimizing for service-specific keywords and adding Eagle Mountain location targeting.
              </div>
            </div>
          </div>
        )}

        {/* Implementation Strategy */}
        <div style={{
          background: "#DEF7EC",
          border: `1px solid #A7F3D0`,
          borderLeft: `4px solid ${colors.success}`,
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 3px 12px rgba(16, 185, 129, 0.12), 0 1px 4px rgba(16, 185, 129, 0.08)"
        }}>
          <h3 style={{ color: colors.success, marginBottom: "16px", fontSize: "18px" }}>
            📋 Strategic Implementation Plan
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: colors.success, marginBottom: "8px", fontSize: "14px" }}>1. Local SEO Foundation</h4>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0, lineHeight: "1.4" }}>
                Add "Eagle Mountain" to page titles, meta descriptions, and headings. This single change could improve your local content score from {data.localContentScore}/100 to 60+/100.
              </p>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: colors.success, marginBottom: "8px", fontSize: "14px" }}>2. High-Volume Service Pages</h4>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0, lineHeight: "1.4" }}>
                Create dedicated pages for basement finishing in Utah, Draper, and Lehi to capture {totalVolume - (data.keywordPerformance?.topRankingKeywords?.[0]?.searchVolume || 0)}+ monthly searches with proven demand.
              </p>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: colors.success, marginBottom: "8px", fontSize: "14px" }}>3. Technical SEO Enhancement</h4>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0, lineHeight: "1.4" }}>
                Implement LocalBusiness schema markup and ensure NAP consistency across all pages to support keyword optimization efforts.
              </p>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px" }}>
              <h4 style={{ color: colors.success, marginBottom: "8px", fontSize: "14px" }}>4. Content Strategy Focus</h4>
              <p style={{ color: "#6B7280", fontSize: "14px", margin: 0, lineHeight: "1.4" }}>
                Shift from generic "carpenter" terms to service-specific content that matches actual search behavior and intent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveKeywordsTab;