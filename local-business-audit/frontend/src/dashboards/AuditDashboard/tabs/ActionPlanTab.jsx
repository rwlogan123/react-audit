import React, { useState, useMemo } from 'react';
import { Target, AlertTriangle, Clock, Zap, Calendar, TrendingUp, Users, DollarSign, CheckCircle, Circle, Timer, Wrench, FileText } from 'lucide-react';

// Your app's exact color scheme
const colors = {
  primary: "#2A3B4A",
  lightGray: "#F5F5F5", 
  white: "#FFFFFF",
  success: "#16a34a",
  danger: "#dc2626",
  warning: "#d97706",
  info: "#2563eb"
};

// Shadow hierarchy constants
const shadows = {
  primary: "0 2px 8px rgba(0, 0, 0, 0.1)",
  secondary: "0 2px 6px rgba(0, 0, 0, 0.1)",
  small: "0 1px 3px rgba(0, 0, 0, 0.1)",
  micro: "0 1px 2px rgba(0, 0, 0, 0.1)"
};

// Reusable style objects
const styles = {
  card: {
    background: colors.white,
    borderRadius: "12px",
    border: `1px solid ${colors.lightGray}`
  },
  smallCard: {
    background: colors.white,
    borderRadius: "8px",
    border: `1px solid ${colors.lightGray}`
  },
  sectionContainer: {
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "32px"
  },
  gridResponsive: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px"
  }
};

// Utility functions
const utils = {
  getWeekTasks: (data, weekKey) => data?.weeks?.[weekKey]?.tasks || [],
  getAllTasks: (data) => {
    const weeks = data?.weeks || {};
    return [
      ...utils.getWeekTasks(data, 'week1'),
      ...utils.getWeekTasks(data, 'week2'),
      ...utils.getWeekTasks(data, 'week34')
    ];
  },
  calculateProgress: (tasks, checkedTasks) => {
    return tasks.length > 0 ? Math.round((checkedTasks.size / tasks.length) * 100) : 0;
  },
  getHighImpactTasks: (tasks) => {
    return tasks.filter(task => task.priority === 'HIGH' || task.priority === 'CRITICAL');
  }
};

// MetricCard Component
const MetricCard = ({ title, value, subtitle, icon: Icon, color, progress }) => (
  <div style={{
    background: colors.white,
    borderRadius: "12px",
    border: `1px solid ${colors.lightGray}`,
    boxShadow: shadows.secondary,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    minWidth: "0"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <Icon size={16} style={{ color, flexShrink: 0 }} />
      <span style={{ 
        fontSize: "12px", 
        color: "#666",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}>{title}</span>
    </div>
    <div style={{ 
      fontSize: "20px", 
      fontWeight: "700", 
      color: colors.primary,
      lineHeight: "1.1"
    }}>
      {value}
    </div>
    <div style={{ 
      fontSize: "11px", 
      color: "#666",
      lineHeight: "1.2"
    }}>{subtitle}</div>
    {progress !== undefined && (
      <div style={{ width: "100%", height: "3px", background: "#f3f4f6", borderRadius: "2px" }}>
        <div style={{
          width: `${progress}%`,
          height: "100%",
          background: color,
          borderRadius: "2px",
          transition: "width 0.3s ease"
        }} />
      </div>
    )}
  </div>
);

// StatusBadge Component
const StatusBadge = ({ status, children }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'critical':
        return 'bg-white text-red-600 border border-red-600';
      case 'warning':
        return 'bg-white text-yellow-600 border border-yellow-600';
      case 'good':
        return 'bg-white text-green-600 border border-green-600';
      case 'week1':
        return 'bg-white text-green-600 border border-green-600';
      case 'week2':
        return 'bg-white text-blue-600 border border-blue-600';
      case 'week34':
        return 'bg-white text-purple-600 border border-purple-600';
      default:
        return 'bg-white text-gray-600 border border-gray-600';
    }
  };

  return (
    <span className={`px-3 py-2 rounded-full text-sm font-semibold ${getStatusColors()}`}>
      {children}
    </span>
  );
};

// ProgressBar Component
const ProgressBar = ({ value, color, showLabel = true }) => (
  <div>
    {showLabel && (
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
        <span style={{ fontWeight: "600" }}>Progress</span>
        <span style={{ fontWeight: "600" }}>{value}%</span>
      </div>
    )}
    <div style={{ width: "100%", height: "8px", background: "#f3f4f6", borderRadius: "4px" }}>
      <div style={{
        width: `${value}%`,
        height: "100%",
        background: color,
        borderRadius: "4px",
        transition: "width 0.5s ease"
      }} />
    </div>
  </div>
);

// TaskCard Component
const TaskCard = ({ task, isChecked, onToggle, weekKey, progressColor }) => (
  <div style={{
    background: colors.white,
    borderRadius: "8px",
    border: `1px solid ${colors.lightGray}`,
    boxShadow: shadows.micro,
    padding: "16px",
    display: "flex",
    alignItems: "flex-start",
    gap: "12px"
  }}>
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onToggle}
      aria-label={`Mark "${task.task}" as complete`}
      style={{ marginTop: "4px", accentColor: progressColor }}
    />
    <div style={{ flex: 1 }}>
      <div style={{
        fontWeight: "600",
        color: colors.primary,
        marginBottom: "6px",
        fontSize: "14px"
      }}>
        {task.task}
      </div>
      <div style={{
        fontSize: "13px",
        color: "#666",
        marginBottom: "8px",
        lineHeight: "1.4"
      }}>
        {task.description}
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gap: "8px",
        fontSize: "11px",
        background: "#f9fafb",
        padding: "6px",
        borderRadius: "4px"
      }}>
        <span><strong>Impact:</strong> {task.impact}</span>
        <span><strong>Time:</strong> {task.timeEstimate}</span>
        <span><strong>Difficulty:</strong> {task.difficulty}</span>
      </div>
    </div>
    <StatusBadge status={weekKey}>
      {task.priority}
    </StatusBadge>
  </div>
);

// WeekSummaryCard Component
const WeekSummaryCard = ({ title, description, primaryFocus, estimatedTime, impactScore }) => (
  <div style={{
    background: colors.white,
    borderRadius: "8px",
    border: `1px solid ${colors.lightGray}`,
    boxShadow: shadows.small,
    padding: "16px",
    marginBottom: "16px"
  }}>
    <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
      {description}
    </p>
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "12px",
      fontSize: "12px"
    }}>
      <div><strong>Focus:</strong> {primaryFocus}</div>
      <div><strong>Time:</strong> {estimatedTime}</div>
      <div><strong>Impact:</strong> {impactScore}/100</div>
    </div>
  </div>
);

// WeekDescriptionBox Component
const WeekDescriptionBox = ({ bgColor, borderColor, children }) => (
  <div style={{
    background: bgColor,
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "16px",
    border: `1px solid ${borderColor}`,
    boxShadow: shadows.micro,
  }}>
    {children}
  </div>
);

// WeekCard Component
const WeekCard = ({ weekKey, weekData, bgColor, borderColor, badgeColor, progressColor, checkedTasks, toggleTask, weekProgress }) => (
  <div style={{
    background: bgColor,
    border: `1px solid ${borderColor}`,
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: shadows.secondary,
  }}>
    {/* Week Header */}
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
      <div style={{
        background: badgeColor,
        color: colors.white,
        borderRadius: "50%",
        width: "32px",
        height: "32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "700",
        fontSize: "14px"
      }}>
        {weekKey === 'week1' ? '1' : weekKey === 'week2' ? '2' : '3-4'}
      </div>
      <h3 style={{ fontSize: "18px", fontWeight: "700", color: colors.primary, margin: 0 }}>
        {weekData.title}
      </h3>
    </div>

    {/* Week Summary */}
    <WeekSummaryCard {...weekData} />

    {/* Week Progress */}
    <div style={{ marginBottom: "20px" }}>
      <ProgressBar value={weekProgress} color={progressColor} />
    </div>

    {/* Tasks */}
    <div style={{ display: "grid", gap: "12px" }}>
      {weekData.tasks?.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          isChecked={checkedTasks.has(task.id)}
          onToggle={() => toggleTask(task.id)}
          weekKey={weekKey}
          progressColor={progressColor}
        />
      ))}
    </div>
  </div>
);

// FilterButtons Component
const FilterButtons = ({ activeWeek, setActiveWeek }) => {
  const filterOptions = [
    { key: 'all', label: 'All Weeks', icon: Calendar },
    { key: 'week1', label: 'Week 1: Foundation', icon: Zap },
    { key: 'week2', label: 'Week 2: Technical', icon: Wrench },
    { key: 'week34', label: 'Week 3-4: Content', icon: FileText }
  ];

  return (
    <div style={{
      display: "flex",
      gap: "8px",
      marginBottom: "24px",
      flexWrap: "wrap"
    }}>
      {filterOptions.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => setActiveWeek(key)}
          style={{
            background: activeWeek === key ? colors.primary : colors.white,
            color: activeWeek === key ? colors.white : colors.primary,
            border: `1px solid ${colors.primary}`,
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            transition: "all 0.2s ease",
            boxShadow: activeWeek === key ? shadows.secondary : shadows.micro
          }}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
};

// ProgressDashboard Component
const ProgressDashboard = ({ data, checkedTasks, completionRate, highImpactCompleted, totalHighImpactTasks }) => (
  <div style={{
    background: "#f0f9ff",
    border: `1px solid ${colors.info}40`,
    borderLeft: `4px solid ${colors.info}`,
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "32px",
    boxShadow: shadows.primary
  }}>
    <h3 style={{
      color: colors.info,
      marginBottom: "20px",
      fontSize: "18px",
      fontWeight: "700",
      textAlign: "center"
    }}>
      📊 Implementation Progress Dashboard
    </h3>
    
    {/* Metrics Grid */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      gap: "12px",
      marginBottom: "24px"
    }}>
      <MetricCard
        title="Plan Completion"
        value={`${completionRate}%`}
        subtitle={`${checkedTasks.size}/${utils.getAllTasks(data).length} tasks`}
        icon={Target}
        color={colors.success}
        progress={completionRate}
      />
      <MetricCard
        title="High-Impact Tasks"
        value={`${highImpactCompleted}/${totalHighImpactTasks}`}
        subtitle="Priority items completed"
        icon={AlertTriangle}
        color={colors.danger}
      />
      <MetricCard
        title="Visibility Impact"
        value="High"
        subtitle="Search presence boost"
        icon={TrendingUp}
        color={colors.success}
      />
      <MetricCard
        title="Time to Results"
        value="2-3 weeks"
        subtitle="Initial improvements"
        icon={Timer}
        color={colors.info}
      />
    </div>

    {/* Projected Results */}
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      padding: "16px",
      borderRadius: "8px",
      boxShadow: shadows.micro
    }}>
      <h4 style={{
        color: colors.primary,
        marginBottom: "12px",
        fontSize: "16px",
        fontWeight: "600",
        textAlign: "center"
      }}>
        📈 Projected Results Upon Completion
      </h4>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
        gap: "8px",
        textAlign: "center",
        fontSize: "11px"
      }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: colors.success }}>100%</div>
          <div style={{ color: "#666", fontSize: "10px" }}>NAP Consistency</div>
          <div style={{ fontSize: "9px", color: colors.success }}>From 40%</div>
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: colors.info }}>85%</div>
          <div style={{ color: "#666", fontSize: "10px" }}>Directory Coverage</div>
          <div style={{ fontSize: "9px", color: colors.info }}>From 40%</div>
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: colors.warning }}>+42%</div>
          <div style={{ color: "#666", fontSize: "10px" }}>Visibility Increase</div>
          <div style={{ fontSize: "9px", color: colors.warning }}>Search presence</div>
        </div>
        <div>
          <div style={{ fontSize: "16px", fontWeight: "700", color: colors.primary }}>Improved</div>
          <div style={{ color: "#666", fontSize: "10px" }}>Local Visibility</div>
          <div style={{ fontSize: "9px", color: colors.primary }}>Search presence</div>
        </div>
      </div>
    </div>
  </div>
);

// WeekSection Component
const WeekSection = ({ weekKey, weekData, checkedTasks, toggleTask }) => {
  const getWeekColors = (weekKey) => {
    switch (weekKey) {
      case 'week1':
        return {
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0',
          badgeColor: colors.success,
          progressColor: colors.success,
          descBgColor: "#f0fdf4",
          descBorderColor: `${colors.success}20`
        };
      case 'week2':
        return {
          bgColor: '#f0f9ff',
          borderColor: '#bfdbfe',
          badgeColor: colors.info,
          progressColor: colors.info,
          descBgColor: "#fffbeb",
          descBorderColor: `${colors.warning}20`
        };
      default:
        return {
          bgColor: '#faf5ff',
          borderColor: '#e9d5ff',
          badgeColor: '#a855f7',
          progressColor: '#a855f7',
          descBgColor: "#f0fdf4",
          descBorderColor: `${colors.success}20`
        };
    }
  };

  const colors_week = getWeekColors(weekKey);
  const weekTasks = weekData.tasks || [];
  const weekProgress = utils.calculateProgress(weekTasks, new Set(weekTasks.filter(task => checkedTasks.has(task.id)).map(task => task.id)));

  return (
    <WeekCard
      weekKey={weekKey}
      weekData={weekData}
      {...colors_week}
      checkedTasks={checkedTasks}
      toggleTask={toggleTask}
      weekProgress={weekProgress}
    />
  );
};

// InfoSection Component
const InfoSection = ({ title, bgColor, borderColor, shadow, children }) => (
  <div style={{
    background: bgColor,
    border: `1px solid ${borderColor}`,
    borderLeft: `4px solid ${borderColor.replace('40', '')}`,
    ...styles.sectionContainer,
    boxShadow: shadow,
    marginBottom: "24px"
  }}>
    <h4 style={{ color: borderColor.replace('40', ''), marginBottom: "16px", fontWeight: "700" }}>
      {title}
    </h4>
    {children}
  </div>
);

// Main Component
const ComprehensiveActionPlanTab = ({ data }) => {
  const [checkedTasks, setCheckedTasks] = useState(new Set());
  const [activeWeek, setActiveWeek] = useState('all');

  // Memoized calculations for performance
  const taskMetrics = useMemo(() => {
    const allTasks = utils.getAllTasks(data);
    const highImpactTasks = utils.getHighImpactTasks(allTasks);
    const completionRate = utils.calculateProgress(allTasks, checkedTasks);
    const highImpactCompleted = highImpactTasks.filter(task => checkedTasks.has(task.id)).length;

    return {
      allTasks,
      highImpactTasks,
      completionRate,
      highImpactCompleted,
      totalHighImpactTasks: highImpactTasks.length
    };
  }, [data, checkedTasks]);

  const toggleTask = (taskId) => {
    setCheckedTasks(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(taskId)) {
        newChecked.delete(taskId);
      } else {
        newChecked.add(taskId);
      }
      return newChecked;
    });
  };

  const getFilteredWeeks = () => {
    const weeks = data?.weeks || {};
    switch (activeWeek) {
      case 'week1': return { week1: weeks.week1 };
      case 'week2': return { week2: weeks.week2 };
      case 'week34': return { week34: weeks.week34 };
      default: return weeks;
    }
  };

  // Error boundary
  if (!data) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <p>Loading action plan...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <h2 style={{
          fontSize: "24px",
          fontWeight: "700",
          marginBottom: "24px",
          color: colors.primary,
        }}>
          ✅ 30-Day Digital Optimization Action Plan
        </h2>

        {/* Executive Summary */}
        <div style={{
          background: colors.lightGray,
          borderLeft: `4px solid ${colors.primary}`,
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "32px",
          boxShadow: shadows.primary
        }}>
          <p style={{ margin: 0, lineHeight: "1.6", color: colors.primary }}>
            <strong>Implementation Strategy:</strong> This comprehensive plan targets the highest-impact changes first, 
            focusing on local SEO foundation in Week 1, technical implementation in Week 2, and content strategy in 
            Weeks 3-4. Each task includes time estimates, difficulty levels, and expected impact. The complete plan 
            addresses critical gaps and requires 26-33 total hours spread across 30 days.
          </p>
        </div>

        {/* Progress Dashboard */}
        <ProgressDashboard
          data={data}
          checkedTasks={checkedTasks}
          completionRate={taskMetrics.completionRate}
          highImpactCompleted={taskMetrics.highImpactCompleted}
          totalHighImpactTasks={taskMetrics.totalHighImpactTasks}
        />

        {/* Week Filter */}
        <FilterButtons activeWeek={activeWeek} setActiveWeek={setActiveWeek} />

        {/* Weekly Implementation Plans */}
        {Object.entries(getFilteredWeeks()).map(([weekKey, weekData]) => (
          weekData && (
            <WeekSection
              key={weekKey}
              weekKey={weekKey}
              weekData={weekData}
              checkedTasks={checkedTasks}
              toggleTask={toggleTask}
            />
          )
        ))}

        {/* Implementation Resources */}
        <InfoSection
          title="📅 Implementation Timeline & Resources"
          bgColor="#fefce8"
          borderColor={`${colors.warning}40`}
          shadow={shadows.primary}
        >
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "16px"
          }}>
            <div>
              <h5 style={{ color: colors.primary, marginBottom: "8px", fontSize: "14px" }}>
                🗓️ Weekly Breakdown
              </h5>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", lineHeight: "1.5" }}>
                <li><strong>Week 1:</strong> Local SEO foundation (6-8 hours)</li>
                <li><strong>Week 2:</strong> Technical implementation (8-10 hours)</li>
                <li><strong>Week 3-4:</strong> Content & authority building (12-15 hours)</li>
              </ul>
            </div>
            <div>
              <h5 style={{ color: colors.primary, marginBottom: "8px", fontSize: "14px" }}>
                🎯 Success Metrics
              </h5>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "13px", lineHeight: "1.5" }}>
                <li>Google Business Profile views & calls</li>
                <li>Local search ranking improvements</li>
                <li>Website traffic from Eagle Mountain</li>
                <li>Citation consistency score</li>
              </ul>
            </div>
          </div>
        </InfoSection>

        {/* Pro Tips */}
        <InfoSection
          title="💡 Strategic Implementation Tips"
          bgColor={colors.info + "20"}
          borderColor={`${colors.info}40`}
          shadow={shadows.primary}
        >
          <ul style={{ margin: 0, paddingLeft: "20px", color: colors.primary, lineHeight: "1.6", fontSize: "14px" }}>
            <li>Complete Week 1 tasks first - they provide the foundation for everything else</li>
            <li>Set aside 2-3 hours per week to work through action items consistently</li>
            <li>Track Google Business Profile views and calls to measure impact</li>
            <li>Focus on high-priority and critical tasks first for maximum impact</li>
            <li>Results typically begin showing within 2-3 weeks of implementation</li>
            <li>Track progress through Google Business Profile metrics and search visibility</li>
          </ul>
        </InfoSection>
      </div>
    </div>
  );
};

// Sample data for testing
const comprehensiveData = {
  weeks: {
    week1: {
      title: "Week 1: Quick Wins & Foundation",
      description: "High-impact changes requiring minimal effort but delivering maximum results",
      impactScore: 85,
      estimatedTime: "6-8 hours",
      primaryFocus: "Local SEO optimization and NAP consistency fixes",
      tasks: [
        {
          id: 'title-update',
          task: 'Update website title to include "Eagle Mountain"',
          description: 'Change title to "Eagle Mountain Carpenter | Custom Carpentry & Finishing | LM Finishing and Construction"',
          impact: 'Local SEO boost: 10/100 → 60+/100',
          priority: 'CRITICAL',
          timeEstimate: '30 minutes',
          difficulty: 'Easy'
        },
        {
          id: 'gbp-description',
          task: 'Optimize Google Business Profile description',
          description: 'Add "Eagle Mountain\'s premier carpenter and finishing contractor" to description',
          impact: 'Enhanced local relevance',
          priority: 'HIGH',
          timeEstimate: '15 minutes',
          difficulty: 'Easy'
        },
        {
          id: 'headings-update',
          task: 'Add location to website headings',
          description: 'Include "Eagle Mountain" in H1 and H2 headings across main pages',
          impact: 'Better search relevance',
          priority: 'HIGH',
          timeEstimate: '45 minutes',
          difficulty: 'Easy'
        },
        {
          id: 'phone-consistency',
          task: 'Standardize phone number across all platforms',
          description: 'Ensure +1385-500-8437 appears consistently on all citations',
          impact: 'Improved NAP consistency',
          priority: 'CRITICAL',
          timeEstimate: '2 hours',
          difficulty: 'Medium'
        },
        {
          id: 'address-display',
          task: 'Add address to website footer',
          description: 'Display "1760 E Fall St, Eagle Mountain, UT 84005" prominently on website',
          impact: 'Local trust signals',
          priority: 'MEDIUM',
          timeEstimate: '20 minutes',
          difficulty: 'Easy'
        }
      ]
    },
    week2: {
      title: "Week 2: Technical Implementation",
      description: "Directory creation and technical SEO improvements",
      impactScore: 75,
      estimatedTime: "8-10 hours",
      primaryFocus: "Missing directory coverage and schema markup",
      tasks: [
        {
          id: 'apple-maps',
          task: 'Create Apple Maps business listing',
          description: 'Register business on Apple Maps Connect (15% of local searches)',
          impact: 'Expanded search visibility',
          priority: 'HIGH',
          timeEstimate: '1 hour',
          difficulty: 'Medium'
        },
        {
          id: 'bing-places',
          task: 'Set up Bing Places listing',
          description: 'Create complete business profile on Bing (20% of searches)',
          impact: 'Additional directory presence',
          priority: 'HIGH',
          timeEstimate: '45 minutes',
          difficulty: 'Easy'
        },
        {
          id: 'homeadvisor',
          task: 'Register on HomeAdvisor',
          description: 'Complete profile setup on highest-volume platform for contractors',
          impact: 'Industry-specific visibility',
          priority: 'CRITICAL',
          timeEstimate: '2 hours',
          difficulty: 'Medium'
        },
        {
          id: 'schema-markup',
          task: 'Implement LocalBusiness schema markup',
          description: 'Add structured data to help search engines understand business info',
          impact: 'Rich snippets + ranking boost',
          priority: 'HIGH',
          timeEstimate: '3 hours',
          difficulty: 'Hard'
        }
      ]
    },
    week34: {
      title: "Week 3-4: Content & Authority Building",
      description: "Service page creation and ongoing optimization strategy",
      impactScore: 80,
      estimatedTime: "12-15 hours",
      primaryFocus: "Content marketing and long-term authority building",
      tasks: [
        {
          id: 'service-landing-page',
          task: 'Create "Eagle Mountain Carpentry Services" page',
          description: 'Dedicated landing page targeting local carpentry searches',
          impact: 'Capture local service searches',
          priority: 'HIGH',
          timeEstimate: '4 hours',
          difficulty: 'Medium'
        },
        {
          id: 'basement-finishing-page',
          task: 'Create "Basement Finishing Eagle Mountain" service page',
          description: 'Target high-value basement finishing searches (390+ monthly volume)',
          impact: 'Basement finishing search visibility',
          priority: 'HIGH',
          timeEstimate: '3 hours',
          difficulty: 'Medium'
        },
        {
          id: 'review-schema',
          task: 'Add review schema markup',
          description: 'Display 5.0⭐ rating in search results',
          impact: 'Rich snippets for reviews',
          priority: 'MEDIUM',
          timeEstimate: '2 hours',
          difficulty: 'Hard'
        },
        {
          id: 'google-posts-routine',
          task: 'Establish weekly Google Business posts',
          description: 'Share project updates and tips with Eagle Mountain keywords',
          impact: 'Ongoing local visibility',
          priority: 'MEDIUM',
          timeEstimate: '1 hour/week',
          difficulty: 'Easy'
        },
        {
          id: 'citation-cleanup',
          task: 'Complete citation NAP cleanup',
          description: 'Fix remaining inconsistencies across all 6 existing directory listings',
          impact: 'NAP consistency: 40% → 100%',
          priority: 'HIGH',
          timeEstimate: '3 hours',
          difficulty: 'Medium'
        }
      ]
    }
  }
};

export default () => <ComprehensiveActionPlanTab data={comprehensiveData} />;