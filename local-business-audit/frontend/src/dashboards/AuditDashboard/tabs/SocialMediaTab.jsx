import React from 'react';
import { Share2, TrendingUp, ThumbsUp, Camera, Target, Clock, Users, Calendar, DollarSign, Video, Linkedin, Youtube, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

// Your exact color scheme
const colors = {
  primary: "#2A3B4A",
  lightGray: "#F5F5F5", 
  white: "#FFFFFF",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6"
};

// Your MetricCard component with enhanced features and proper shadow hierarchy
const MetricCard = ({ title, value, subtitle, icon: Icon, color, progress, trend, performance }) => {
  return (
    <div style={{
      background: colors.white,
      padding: "20px",
      borderRadius: "12px",
      border: `1px solid ${colors.lightGray}`,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Primary elements
      textAlign: "center",
      position: "relative",
      transition: "all 0.3s ease",
      cursor: "default"
    }}>
      {Icon && <Icon size={24} style={{ color, marginBottom: "12px" }} />}
      <div style={{ fontSize: "24px", fontWeight: "700", color: colors.primary, marginBottom: "4px" }}>
        {value}
      </div>
      <div style={{ fontSize: "14px", fontWeight: "600", color: colors.primary, marginBottom: "4px" }}>
        {title}
      </div>
      <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: trend ? "8px" : "0" }}>
        {subtitle}
      </div>
      {trend && (
        <div style={{ marginBottom: progress !== undefined ? "12px" : "0" }}>
          <span style={{
            fontSize: "10px",
            fontWeight: "600",
            padding: "4px 8px",
            borderRadius: "12px",
            backgroundColor: trend.includes('↗') ? '#F0FDF4' : trend.includes('↓') ? '#FEF2F2' : '#FFFBEB',
            color: trend.includes('↗') ? '#166534' : trend.includes('↓') ? '#991B1B' : '#92400E',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)' // Micro elements
          }}>
            {trend}
          </span>
        </div>
      )}
      {progress !== undefined && (
        <div style={{ marginTop: "12px" }}>
          <div style={{ width: "100%", height: "6px", backgroundColor: "#E5E7EB", borderRadius: "3px", overflow: "hidden" }}>
            <div style={{ 
              width: `${progress}%`, 
              height: "100%", 
              backgroundColor: color,
              transition: "width 0.3s ease"
            }} />
          </div>
        </div>
      )}
      {performance && (
        <div style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          fontSize: "10px",
          fontWeight: "600",
          padding: "2px 6px",
          borderRadius: "8px",
          backgroundColor: performance === 'excellent' ? '#F0FDF4' : performance === 'good' ? '#F0FDF4' : performance === 'warning' ? '#FFFBEB' : '#FEF2F2',
          color: performance === 'excellent' ? '#166534' : performance === 'good' ? '#166534' : performance === 'warning' ? '#92400E' : '#991B1B',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)' // Micro elements
        }}>
          {performance.toUpperCase()}
        </div>
      )}
    </div>
  );
};

// Your StatusBadge component
const StatusBadge = ({ status, children }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'excellent': return { bg: '#F0FDF4', text: '#166534', border: '#10B981' };
      case 'good': return { bg: '#F0FDF4', text: '#166534', border: '#10B981' };
      case 'warning': return { bg: '#FFFBEB', text: '#92400E', border: '#F59E0B' };
      case 'critical': return { bg: '#FEF2F2', text: '#991B1B', border: '#EF4444' };
      default: return { bg: '#F9FAFB', text: '#374151', border: '#6B7280' };
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
      border: `1px solid ${statusColors.border}`
    }}>
      {children}
    </span>
  );
};

// Alert Box component matching your style
const AlertBox = ({ type, title, children }) => {
  const typeStyles = {
    danger: { bg: '#FEF2F2', border: colors.danger, color: colors.danger },
    opportunity: { bg: '#EBF8FF', border: colors.info, color: colors.info },
    consequence: { bg: '#FEF2F2', border: colors.danger, color: colors.danger }
  };

  const style = typeStyles[type] || typeStyles.danger;

  return (
    <div style={{
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderLeft: `4px solid ${style.border}`,
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px"
    }}>
      <strong style={{ color: style.color, fontSize: "16px" }}>{title}</strong>
      <div style={{ marginTop: "8px", color: colors.primary, lineHeight: "1.6" }}>
        {children}
      </div>
    </div>
  );
};

// Progress Bar component
const ProgressBar = ({ value, className, showLabel = true, label = "Progress" }) => (
  <div style={{ marginBottom: "24px" }}>
    {showLabel && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <span style={{ fontWeight: "600", color: colors.primary }}>{label}</span>
        <span style={{ fontWeight: "600", color: colors.primary }}>{value}%</span>
      </div>
    )}
    <div style={{ width: "100%", height: "12px", backgroundColor: "#E5E7EB", borderRadius: "6px", overflow: "hidden" }}>
      <div style={{ 
        width: `${value}%`, 
        height: "100%", 
        backgroundColor: value >= 80 ? colors.success : value >= 60 ? colors.warning : colors.danger,
        transition: "width 1s ease"
      }} />
    </div>
  </div>
);

// Enhanced sample data with all comprehensive details
const comprehensiveData = {
  socialMediaAnalysis: {
    socialScore: 50,
    platforms: ["facebook", "instagram"],
    facebook: "https://www.facebook.com/lmfinishing",
    instagram: "https://www.instagram.com/lmfinishing",
    linkedin: null,
    youtube: null
  },
  businessName: "LM Finishing",
  currentPresence: {
    instagram: {
      handle: "@lm.fconstruction",
      followers: 247,
      posts: 23,
      lastActivity: "2 weeks ago",
      status: "ACTIVE"
    },
    facebook: {
      handle: "LM Finishing",
      status: "ACTIVE"
    }
  },
  missingPlatforms: [
    {
      platform: "YouTube",
      importance: "High - Project showcases & tutorials",
      impact: "Video engagement",
      difficulty: "Medium (2 hours)",
      priority: "HIGH"
    },
    {
      platform: "LinkedIn Company", 
      importance: "Medium - B2B & commercial clients",
      impact: "Professional network",
      difficulty: "Easy (45 min)",
      priority: "MEDIUM"
    }
  ]
};

// Comprehensive SocialMediaTab component with full original content
const SocialMediaTab = ({ data }) => {
  const socialData = data.socialMediaAnalysis || {};
  const activePlatforms = socialData.platforms?.length || 0;
  const totalTargetPlatforms = 4;
  const socialScore = socialData.socialScore || 0;
  
  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "24px",
          color: colors.primary,
        }}>
          📱 Social Media Presence Analysis
        </h2>

        {/* Executive Summary */}
        <div style={{
          background: colors.lightGray,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
          borderLeft: `4px solid ${colors.primary}`,
        }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
            <strong>Social Media Reality Check:</strong> You have {activePlatforms === 2 ? 'Facebook and Instagram profiles active' : 'limited social presence'} ({socialScore}/100 social score) but are missing from LinkedIn and YouTube. Your social presence shows moderate coverage with {activePlatforms} of {totalTargetPlatforms} recommended platforms. Most successful contractors maintain active profiles across 3-4 platforms to maximize local visibility and trust-building opportunities.
          </p>
        </div>

        {/* Progress Visualization */}
        <ProgressBar 
          value={socialScore} 
          label="Social Media Coverage"
          showLabel={true}
        />

        {/* Key Performance Metrics */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}>
          <MetricCard
            title="Active Platforms"
            value={activePlatforms}
            subtitle={`Target: ${totalTargetPlatforms} platforms minimum`}
            icon={Share2}
            color={colors.info}
            trend="↓ Need 2 more"
            performance={activePlatforms >= 3 ? 'good' : 'warning'}
          />
          <MetricCard
            title="Instagram Followers"
            value={data.currentPresence?.instagram?.followers || "0"}
            subtitle="Good for local contractor"
            icon={Camera}
            color={colors.success}
            trend="→ Growing slowly"
            performance="good"
          />
          <MetricCard
            title="Instagram Posts"
            value={data.currentPresence?.instagram?.posts || "0"}
            subtitle="Post 2-3x per week"
            icon={TrendingUp}
            color={colors.warning}
            trend="→ Post more"
            performance="warning"
          />
          <MetricCard
            title="Last Activity"
            value="2 weeks"
            subtitle="Should be weekly"
            icon={Clock}
            color={colors.danger}
            trend="↓ Too long"
            performance="critical"
          />
        </div>

        {/* Current Social Media Accounts - Detailed Cards */}
        <div style={{
          background: colors.white,
          padding: "24px",
          borderRadius: "12px",
          border: `1px solid ${colors.lightGray}`,
          marginBottom: "32px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" // Primary elements
        }}>
          <h3 style={{ color: colors.primary, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
            📱 Current Social Media Accounts
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}>
            {/* Instagram - Active */}
            <div style={{
              background: colors.white,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)" // Secondary elements
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <Camera size={20} style={{ color: colors.success }} />
                <span style={{ fontWeight: "600", fontSize: "16px" }}>Instagram</span>
                <StatusBadge status="excellent">✅ ACTIVE</StatusBadge>
              </div>
              <div style={{ fontSize: "14px", color: colors.info, marginBottom: "12px" }}>
                @lm.fconstruction
              </div>
              <ul style={{ fontSize: "12px", margin: 0, padding: 0, listStyle: "none", lineHeight: "1.8" }}>
                <li>• Followers: <strong>247</strong></li>
                <li>• Posts: <strong>23</strong></li>
                <li>• Last Activity: <strong>2 weeks ago</strong></li>
              </ul>
            </div>

            {/* Facebook Business */}
            <div style={{
              background: colors.white,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)" // Secondary elements
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <ThumbsUp size={20} style={{ color: socialData.facebook ? colors.success : colors.danger }} />
                <span style={{ fontWeight: "600", fontSize: "16px" }}>Facebook Business</span>
                <StatusBadge status={socialData.facebook ? "excellent" : "critical"}>
                  {socialData.facebook ? '✅ ACTIVE' : '❌ MISSING'}
                </StatusBadge>
              </div>
              <div style={{ fontSize: "14px", color: socialData.facebook ? colors.info : colors.danger, marginBottom: "12px" }}>
                {socialData.facebook ? 'LM Finishing' : 'Not created'}
              </div>
              <ul style={{ fontSize: "12px", margin: 0, padding: 0, listStyle: "none", lineHeight: "1.8" }}>
                <li>• Platform Type: <strong>Local business discovery</strong></li>
                <li>• Setup Time: <strong>30 minutes</strong></li>
                <li>• Priority: <strong>{socialData.facebook ? 'ACTIVE' : 'CRITICAL'}</strong></li>
              </ul>
            </div>

            {/* YouTube - Missing */}
            <div style={{
              background: colors.white,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)" // Secondary elements
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <Video size={20} style={{ color: colors.danger }} />
                <span style={{ fontWeight: "600", fontSize: "16px" }}>YouTube</span>
                <StatusBadge status="critical">❌ MISSING</StatusBadge>
              </div>
              <div style={{ fontSize: "14px", color: colors.danger, marginBottom: "12px" }}>
                Not created
              </div>
              <ul style={{ fontSize: "12px", margin: 0, padding: 0, listStyle: "none", lineHeight: "1.8" }}>
                <li>• Content Type: <strong>Video showcases build credibility</strong></li>
                <li>• Setup Time: <strong>2 hours</strong></li>
                <li>• Priority: <strong>HIGH</strong></li>
              </ul>
            </div>

            {/* LinkedIn Company - Missing */}
            <div style={{
              background: colors.white,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)" // Secondary elements
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                <Linkedin size={20} style={{ color: colors.warning }} />
                <span style={{ fontWeight: "600", fontSize: "16px" }}>LinkedIn Company</span>
                <StatusBadge status="warning">❌ MISSING</StatusBadge>
              </div>
              <div style={{ fontSize: "14px", color: colors.danger, marginBottom: "12px" }}>
                Not created
              </div>
              <ul style={{ fontSize: "12px", margin: 0, padding: 0, listStyle: "none", lineHeight: "1.8" }}>
                <li>• Network Type: <strong>Professional & B2B connections</strong></li>
                <li>• Setup Time: <strong>45 minutes</strong></li>
                <li>• Priority: <strong>MEDIUM</strong></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Platform Opportunity Analysis Table */}
        <div style={{
          background: colors.white,
          borderRadius: "12px",
          border: `1px solid ${colors.lightGray}`,
          overflow: "hidden",
          marginBottom: "32px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" // Primary elements
        }}>
          <div style={{ padding: "20px 24px", borderBottom: `1px solid ${colors.lightGray}` }}>
            <h3 style={{ color: colors.primary, margin: 0, fontSize: "18px", fontWeight: "600" }}>
              📊 Platform Opportunity Analysis
            </h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead style={{ background: colors.lightGray }}>
                <tr>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Platform</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Importance for Contractors</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Platform Focus</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Setup Difficulty</th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", color: colors.primary, fontSize: "14px" }}>Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: `1px solid #F3F4F6` }}>
                  <td style={{ padding: "12px 16px", fontWeight: "600", fontSize: "14px" }}>Facebook Business</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Critical - Local discovery & reviews</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Local business discovery</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Easy (30 min)</td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status={socialData.facebook ? "excellent" : "critical"}>
                      {socialData.facebook ? "ACTIVE" : "CRITICAL"}
                    </StatusBadge>
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid #F3F4F6` }}>
                  <td style={{ padding: "12px 16px", fontWeight: "600", fontSize: "14px" }}>YouTube</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>High - Project showcases & tutorials</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Video showcase platform</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Medium (2 hours)</td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status="warning">HIGH</StatusBadge>
                  </td>
                </tr>
                <tr style={{ borderBottom: `1px solid #F3F4F6` }}>
                  <td style={{ padding: "12px 16px", fontWeight: "600", fontSize: "14px" }}>LinkedIn Company</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Medium - B2B & commercial clients</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Professional networking</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Easy (45 min)</td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status="warning">MEDIUM</StatusBadge>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "12px 16px", fontWeight: "600", fontSize: "14px" }}>TikTok</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Growing - Younger homeowners</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Emerging platform audience</td>
                  <td style={{ padding: "12px 16px", fontSize: "14px" }}>Hard (ongoing content)</td>
                  <td style={{ padding: "12px 16px" }}>
                    <StatusBadge status="good">LOW</StatusBadge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Missing Visibility Alert */}
        <AlertBox type="consequence" title="🚨 Missing Digital Visibility:">
          Without Facebook Business, you're missing a major platform where many local customers discover contractors. Active social media profiles help establish credibility and showcase your work. Facebook integrates directly with Google Business Profile and local search results.
        </AlertBox>

        {/* Platform-Specific Strategy Recommendations */}
        <div style={{
          background: "#EBF8FF",
          border: `1px solid ${colors.info}`,
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "32px"
        }}>
          <h3 style={{ color: colors.info, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
            🎯 Platform-Specific Strategy Recommendations
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px"
          }}>
            {/* Facebook Strategy */}
            <div style={{
              background: colors.white,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)" // Secondary elements
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <ThumbsUp size={20} style={{ color: colors.danger }} />
                <h4 style={{ color: colors.danger, margin: 0, fontSize: "16px", fontWeight: "600" }}>📘 Facebook Business</h4>
                <StatusBadge status={socialData.facebook ? "excellent" : "critical"}>
                  {socialData.facebook ? 'ACTIVE' : 'CRITICAL'}
                </StatusBadge>
              </div>
              <div style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "12px" }}>
                <div><strong>Setup Time:</strong> 30 minutes</div>
                <div><strong>Platform Type:</strong> Local business discovery</div>
                <div><strong>Content Strategy:</strong> Post project photos weekly, respond to reviews</div>
              </div>
              <div style={{
                background: "#FEF2F2",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                lineHeight: "1.5"
              }}>
                <strong style={{ color: colors.danger }}>Why Critical:</strong> Facebook is a primary platform for local business discovery. Local contractors benefit from Facebook's integration with reviews and local search features.
              </div>
            </div>

            {/* YouTube Strategy */}
            <div style={{
              background: colors.white,
              padding: "20px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)" // Secondary elements
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <Video size={20} style={{ color: colors.warning }} />
                <h4 style={{ color: colors.warning, margin: 0, fontSize: "16px", fontWeight: "600" }}>📺 YouTube</h4>
                <StatusBadge status="warning">HIGH</StatusBadge>
              </div>
              <div style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "12px" }}>
                <div><strong>Setup Time:</strong> 2 hours</div>
                <div><strong>Content Type:</strong> Video showcases build credibility</div>
                <div><strong>Content Strategy:</strong> Before/after videos, time-lapse construction</div>
              </div>
              <div style={{
                background: "#FFFBEB",
                padding: "12px",
                borderRadius: "8px",
                fontSize: "12px",
                lineHeight: "1.5"
              }}>
                <strong style={{ color: colors.warning }}>Why Important:</strong> Video content builds credibility and showcases work quality. Homeowners often research project examples before hiring contractors.
              </div>
            </div>
          </div>
        </div>

        {/* Content Calendar Recommendations */}
        <div style={{
          background: "#F3E8FF",
          border: `1px solid #A855F7`,
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "32px"
        }}>
          <h3 style={{ color: "#7C3AED", marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
            📅 Social Media Content Calendar
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px"
          }}>
            <div style={{
              background: colors.white,
              padding: "16px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)" // Small elements
            }}>
              <h4 style={{ color: "#7C3AED", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>📝 Weekly Content Plan</h4>
              <ul style={{ fontSize: "12px", margin: 0, padding: "0 0 0 16px", lineHeight: "1.6" }}>
                <li><strong>Monday:</strong> Project progress photos</li>
                <li><strong>Wednesday:</strong> Before/after transformations</li>
                <li><strong>Friday:</strong> Behind-the-scenes content</li>
                <li><strong>Weekend:</strong> Customer testimonials</li>
              </ul>
            </div>
            
            <div style={{
              background: colors.white,
              padding: "16px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)" // Small elements
            }}>
              <h4 style={{ color: "#7C3AED", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>🎬 Content Types That Work</h4>
              <ul style={{ fontSize: "12px", margin: 0, padding: "0 0 0 16px", lineHeight: "1.6" }}>
                <li>Time-lapse construction videos</li>
                <li>Tool reviews and tips</li>
                <li>Customer testimonial videos</li>
                <li>Problem-solving tutorials</li>
                <li>Local community involvement</li>
              </ul>
            </div>
            
            <div style={{
              background: colors.white,
              padding: "16px",
              borderRadius: "12px",
              border: `1px solid ${colors.lightGray}`,
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)" // Small elements
            }}>
              <h4 style={{ color: "#7C3AED", marginBottom: "12px", fontSize: "14px", fontWeight: "600" }}>🎯 Hashtag Strategy</h4>
              <ul style={{ fontSize: "12px", margin: 0, padding: "0 0 0 16px", lineHeight: "1.6" }}>
                <li><strong>Location:</strong> #EagleMountain #UtahCarpenter</li>
                <li><strong>Services:</strong> #CustomCarpentry #BasementFinishing</li>
                <li><strong>Industry:</strong> #Contractor #HomeImprovement</li>
                <li><strong>Local:</strong> #UtahCounty #SaltLakeCity</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Platform Coverage Assessment */}
        <div style={{
          background: "#F0FDF4",
          border: `1px solid ${colors.success}`,
          borderRadius: "12px",
          padding: "24px"
        }}>
          <h3 style={{ color: colors.success, marginBottom: "20px", fontSize: "18px", fontWeight: "600" }}>
            📊 Social Media Coverage Assessment
          </h3>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
            textAlign: "center"
          }}>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}`, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.success }}>4</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Target Platforms</div>
              <div style={{ fontSize: "10px", color: "#9CA3AF" }}>Recommended coverage</div>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}`, boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)" }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.success }}>4</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Hours Setup Time</div>
              <div style={{ fontSize: "10px", color: "#9CA3AF" }}>One-time investment</div>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}` }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.success }}>3-5</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Hours per Week</div>
              <div style={{ fontSize: "10px", color: "#9CA3AF" }}>Ongoing maintenance</div>
            </div>
            <div style={{ background: colors.white, padding: "16px", borderRadius: "8px", border: `1px solid ${colors.lightGray}` }}>
              <div style={{ fontSize: "24px", fontWeight: "700", color: colors.success }}>2-3</div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>Weeks Setup Time</div>
              <div style={{ fontSize: "10px", color: "#9CA3AF" }}>Time to establish presence</div>
            </div>
          </div>

          <div style={{
            background: "#DCFCE7",
            padding: "16px",
            borderRadius: "8px",
            border: `1px solid ${colors.success}`
          }}>
            <h4 style={{ color: colors.success, margin: "0 0 12px 0", fontSize: "14px", fontWeight: "600" }}>
              🎯 Implementation Strategy (Week 1):
            </h4>
            <ol style={{ margin: 0, padding: "0 0 0 20px", fontSize: "12px", color: colors.success, lineHeight: "1.6" }}>
              <li>Set up Facebook Business page (30 minutes)</li>
              <li>Connect to Google Business Profile (10 minutes)</li>
              <li>Post 5 recent project photos with location hashtags (20 minutes)</li>
              <li>Join 3 local community Facebook groups (15 minutes)</li>
              <li>Schedule LinkedIn Company page setup for Week 2</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render with comprehensive sample data
export default () => <SocialMediaTab data={comprehensiveData} />;