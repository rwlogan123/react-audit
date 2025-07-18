// File: src/dashboards/ClientDashboard/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import DashboardHeader from '../../components/shared/DashboardHeader';
import TabNavigation from '../../components/shared/TabNavigation';
import BlogPostsTab from './tabs/BlogPostsTab';
import OverviewTab from './tabs/OverviewTab';
// Only import existing tabs for now
import SocialMediaTab from './tabs/SocialMediaTab';
import EmailSequenceTab from './tabs/EmailSequenceTab';
import WebsiteTab from './tabs/WebsiteTab';
import ReviewsTab from './tabs/ReviewsTab';
import CitationsTab from './tabs/CitationsTab';
import AdsTab from './tabs/AdsTab';
import ServiceAreasTab from './tabs/ServiceAreasTab';
import PublishingTab from './tabs/PublishingTab';
import { contentApi } from '../../api/contentApi';

const ClientDashboard = () => {
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byType: []
  });
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState(null);

  // Business information
  const businessInfo = {
    name: "Eagle Mountain Remodeling",
    location: "Eagle Mountain, UT"
  };

  const userPlan = {
    tier: 'professional',
    projectStatus: {
      websiteComplete: false,
      contentApproved: false,
      adsActive: true,
      citationsOngoing: true,
      reviewsActive: true
    }
  };

  const user = {
    name: "Demo Client"
  };

  // Fetch stats when businessId changes
  useEffect(() => {
    if (businessId) {
      fetchStats();
    }
  }, [businessId]);

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching stats for businessId:', businessId);
      const response = await contentApi.getContentStatus(businessId);
      console.log('📊 Stats response:', response);
      
      // Handle the response properly
      setStats(response || {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        byType: []
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set default stats on error
      setStats({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        byType: []
      });
    }
  };

  const handleGenerateTest = async () => {
    try {
      setLoading(true);
      const response = await contentApi.generateTestContent();
      
      if (response.success) {
        const newBusinessId = response.businessId || 'demo-business';
        setBusinessId(newBusinessId);
        alert('Test content generated successfully! The dashboard will now load the data.');
        
        setTimeout(() => {
          fetchStats();
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to generate test content:', error);
      alert('Failed to generate test content. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contentId) => {
    try {
      await contentApi.approveContent(contentId);
      fetchStats();
    } catch (error) {
      console.error('Failed to approve content:', error);
    }
  };

  const handleReject = async (contentId, feedback) => {
    try {
      await contentApi.rejectContent(contentId, feedback);
      fetchStats();
    } catch (error) {
      console.error('Failed to reject content:', error);
    }
  };

  const handleMetricClick = (metricId) => {
    console.log('Metric clicked:', metricId);
    switch (metricId) {
      case 'pending':
        setFilter('pending');
        setActiveTab('blog');
        break;
      case 'approved':
        setFilter('approved');
        setActiveTab('blog');
        break;
      case 'rejected':
        setFilter('rejected');
        setActiveTab('blog');
        break;
      default:
        setFilter('all');
        setActiveTab('blog');
    }
  };

  // Build metrics for header - with safe fallbacks
  const metrics = [
    {
      id: "total",
      title: "Total Content",
      value: stats?.total || 0,
      subtitle: "Ready for review",
      status: "info",
    },
    {
      id: "pending",
      title: "Pending Review",
      value: stats?.pending || 0,
      subtitle: "Awaiting your approval",
      status: "warning",
    },
    {
      id: "approved",
      title: "Approved",
      value: stats?.approved || 0,
      subtitle: "Ready to publish",
      status: "success",
    },
    {
      id: "rejected",
      title: "Needs Revision",
      value: stats?.rejected || 0,
      subtitle: "Feedback provided",
      status: "danger",
    }
  ];

  // Build tabs dynamically based on stats - with safe fallbacks
  const tabs = [
    { id: "overview", label: "Overview", emoji: "📊" },
    { id: "blog", label: "Blog Posts", emoji: "📝", count: stats.byType?.find(t => t._id === 'blog')?.count || 0 },
    { id: "social", label: "Social Media", emoji: "📱", count: stats.byType?.find(t => t._id === 'social')?.count || 0 },
    { id: "email", label: "Email Sequence", emoji: "✉️", count: stats.byType?.find(t => t._id === 'email')?.count || 0 },
    { id: "website", label: "Website", emoji: "🌐", badge: "Setup" },
    { id: "service-areas", label: "Service Areas", emoji: "📍", badge: "Active" },
    { id: "schedule", label: "Publishing", emoji: "📅" },
    { id: "citations", label: "Citations", emoji: "📋", badge: "Active" },
    { id: "reviews", label: "Reviews", emoji: "⭐", badge: "3 new" },
    { id: "ads", label: "Advertising", emoji: "💰", badge: "Active" }
  ];

  const renderTabContent = () => {
    // Show placeholder if no business ID
    if (!businessId && activeTab !== 'overview') {
      return (
        <div style={{ padding: "40px 20px", textAlign: "center" }}>
          <div style={{
            background: '#E1E1E1',
            padding: "40px",
            borderRadius: "12px",
            maxWidth: "600px",
            margin: "20px auto"
          }}>
            <p>Please generate test content first using the button in the header.</p>
          </div>
        </div>
      );
    }

    // Common props to pass to all tabs
    const commonProps = {
      businessId,
      filter,
      onApprove: handleApprove,
      onReject: handleReject
    };

    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            businessName={businessInfo.name}
            location={businessInfo.location}
            userPlan={userPlan}
            stats={stats}
            onSetFilter={setFilter}
            onSetActiveTab={setActiveTab}
          />
        );
      
      case 'blog':
        return (
          <BlogPostsTab 
            businessId={businessId}
            filter={filter}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        );

      case 'social':
        return <SocialMediaTab {...commonProps} />;

      case 'email':
        return <EmailSequenceTab {...commonProps} />;

      case 'website':
        return <WebsiteTab {...commonProps} />;

      case 'reviews':
        return <ReviewsTab {...commonProps} />;

      case 'citations':
        return <CitationsTab {...commonProps} />;

      case 'ads':
        return <AdsTab {...commonProps} />;

      case 'service-areas':
        return <ServiceAreasTab {...commonProps} />;

      case 'schedule':
        return <PublishingTab {...commonProps} />;
      
      default:
        return (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <h2>{tabs.find(tab => tab.id === activeTab)?.emoji} {tabs.find(tab => tab.id === activeTab)?.label}</h2>
            <p>Content for {activeTab} tab coming soon...</p>
            <div style={{
              background: '#E1E1E1',
              padding: "20px",
              borderRadius: "12px",
              marginTop: "20px",
            }}>
              <p>This tab is being developed. Check back soon!</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: "100vh",
      background: "#f8fafc",
    }}>
      {/* Header with Metrics */}
      <DashboardHeader
        title="Content Review Portal"
        subtitle="Client Dashboard"
        businessName={businessInfo.name}
        location={businessInfo.location}
        metrics={metrics}
        user={user}
        userPlan={userPlan}
        onMetricClick={handleMetricClick}
        onGenerateTest={handleGenerateTest}
        loading={loading}
        logoText="BRANDAIDE"
      />
      
      {/* Tab Navigation */}
      <TabNavigation 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      {/* Tab Content */}
      {renderTabContent()}

      {/* Status Bar for Development */}
      <div style={{
        padding: '20px',
        textAlign: 'center',
        background: '#f8fafc',
        borderTop: '1px solid #E1E1E1'
      }}>
        <p style={{ color: '#666', margin: 0 }}>
          Current: Filter = <strong>{filter}</strong> | Tab = <strong>{activeTab}</strong> | 
          Business ID = <strong>{businessId || 'Not set'}</strong>
        </p>
      </div>
      
      {/* Footer */}
      <div style={{
        background: '#2A3B4A',
        color: 'white',
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", opacity: "0.8" }}>
          © 2024 BRANDAIDE - Content Management Platform
        </div>
      </div>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .metric-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ClientDashboard;