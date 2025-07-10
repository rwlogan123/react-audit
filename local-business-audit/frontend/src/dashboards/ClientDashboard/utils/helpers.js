// src/dashboards/ClientDashboard/utils/helpers.js
// Helper functions for Client Dashboard

import { TAB_CONFIG, CONTENT_STATUS_MAPPING } from './constants';

// Generate mock content data for development/testing
export const generateMockContent = (businessId, businessName, location) => {
  const types = ['blog', 'social', 'email'];
  const platforms = ['Facebook', 'Instagram', 'LinkedIn'];
  
  return Array.from({ length: 48 }, (_, i) => ({
    id: `content-${i}`,
    businessId,
    type: i < 10 ? 'blog' : i < 40 ? 'social' : 'email',
    status: i < 35 ? 'pending' : i < 42 ? 'approved' : 'rejected',
    title: i < 10 
      ? `How to Choose the Right Basement Finishing Contractor in ${location.split(',')[0]}` 
      : i < 40 
        ? `Check out our latest project! 🏠✨` 
        : `Welcome to ${businessName}!`,
    content: i < 10 
      ? `Choosing the right basement finishing contractor in ${location} requires careful consideration of several factors. From licensing and insurance to experience with local building codes, there are many important aspects to evaluate. Our team at ${businessName} has been serving the ${location} area for over 10 years, completing hundreds of successful basement transformations.`
      : i < 40 
        ? `Looking to transform your basement into the perfect family space? 🏠 Our expert team at ${businessName} just completed this stunning renovation in ${location.split(',')[0]}! From design to final touches, we handle everything. Ready to see what we can do for your home? Call us today for your free consultation! #BasementRemodel #${location.split(',')[0]}Contractors #HomeImprovement`
        : `Welcome to ${businessName}! Thank you for your interest in our basement finishing services. We're excited to help you transform your basement into the perfect space for your family. Over the next few days, you'll receive helpful tips and insights about the basement finishing process.`,
    platform: i >= 10 && i < 40 ? platforms[(i - 10) % 3] : null,
    keywords: i < 10 ? ['basement finishing', location.split(',')[0].toLowerCase(), 'contractors', 'home improvement', 'remodeling'] : [],
    scheduledFor: null,
    feedback: i >= 42 ? 'Please make the tone more conversational and add specific examples of recent projects in our area.' : null,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    updatedAt: i >= 42 ? new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000) : null,
    wordCount: i < 10 ? Math.floor(Math.random() * 500) + 800 : i < 40 ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 200) + 150,
    seoScore: i < 10 ? Math.floor(Math.random() * 30) + 70 : null,
    revisionCount: i >= 42 ? Math.floor(Math.random() * 2) + 1 : 0,
    approvedBy: i >= 35 && i < 42 ? 'Client' : null,
    approvedAt: i >= 35 && i < 42 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null,
    rejectedBy: i >= 42 ? 'Client' : null,
    rejectedAt: i >= 42 ? new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) : null
  }));
};

// Build dynamic tabs based on plan features and project status
export const buildTabs = (planFeatures, projectStatus, content) => {
  return TAB_CONFIG.filter(tab => {
    // Always show overview
    if (tab.alwaysShow) return true;
    
    // Check if plan includes this feature
    if (tab.requiresFeature && !planFeatures[tab.requiresFeature]) return false;
    
    // Add dynamic counts for content tabs
    if (tab.id === 'blog-posts') {
      tab.count = content.filter(c => c.type === 'blog').length;
    } else if (tab.id === 'social-media') {
      tab.count = content.filter(c => c.type === 'social').length;
    } else if (tab.id === 'email-sequence') {
      tab.count = content.filter(c => c.type === 'email').length;
    }
    
    // Add status badges for project features
    if (tab.id === 'website') {
      tab.badge = projectStatus.websiteComplete ? "Complete" : "In Progress";
      tab.badgeStatus = projectStatus.websiteComplete ? "excellent" : "warning";
    } else if (tab.id === 'ads') {
      tab.badge = projectStatus.adsActive ? "Active" : "Paused";
      tab.badgeStatus = projectStatus.adsActive ? "excellent" : "warning";
    } else if (tab.id === 'citations') {
      tab.badge = projectStatus.citationsOngoing ? "Active" : null;
      tab.badgeStatus = "excellent";
    } else if (tab.id === 'reviews') {
      tab.badge = "3 new";
      tab.badgeStatus = "good";
    }
    
    return true;
  });
};

// Calculate content statistics
export const calculateStats = (content) => {
  return content.reduce((acc, item) => {
    acc.total++;
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, { total: 0, pending: 0, approved: 0, rejected: 0, published: 0, scheduled: 0 });
};

// Map content status to your existing StatusBadge format
export const getStatusBadgeStatus = (contentStatus) => {
  return CONTENT_STATUS_MAPPING[contentStatus] || 'warning';
};

// Format content creation date
export const formatContentDate = (date) => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const contentDate = new Date(date);
  const diffInHours = Math.floor((now - contentDate) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  if (diffInHours < 48) return 'Yesterday';
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return contentDate.toLocaleDateString();
};

// Get content preview text
export const getContentPreview = (content, maxLength = 150) => {
  if (!content) return '';
  return content.length > maxLength 
    ? content.substring(0, maxLength) + '...'
    : content;
};

// Get estimated reading time for blog posts
export const getReadingTime = (wordCount) => {
  if (!wordCount) return null;
  
  const wordsPerMinute = 200; // Average reading speed
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  
  return minutes === 1 ? '1 min read' : `${minutes} min read`;
};

// Get content type emoji
export const getContentTypeEmoji = (type) => {
  const emojiMap = {
    blog: '📝',
    social: '📱',
    email: '✉️'
  };
  return emojiMap[type] || '📄';
};

// Format numbers with commas
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
};