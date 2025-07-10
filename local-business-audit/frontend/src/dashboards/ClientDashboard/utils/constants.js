// src/dashboards/ClientDashboard/utils/constants.js
// Client-specific constants (extends your existing shared/colors.js)

import { colors } from "../../../components/shared/colors";

// Re-export your existing colors for consistency
export { colors };

// Plan Features Configuration
export const PLAN_FEATURES = {
  starter: {
    content: true,
    website: true,
    citations: true,
    reviews: false,
    serviceAreas: false,
    ads: false,
    publishing: true,
    monthlyContent: 15, // 5 blog + 10 social
    citationQuota: 10
  },
  professional: {
    content: true,
    website: true,
    citations: true,
    reviews: true,
    serviceAreas: true,
    ads: false,
    publishing: true,
    monthlyContent: 45, // 10 blog + 30 social + 5 email
    citationQuota: 20
  },
  premium: {
    content: true,
    website: true,
    citations: true,
    reviews: true,
    serviceAreas: true,
    ads: true,
    publishing: true,
    monthlyContent: 60, // 15 blog + 40 social + 5 email
    citationQuota: 30,
    adsManagement: true,
    prioritySupport: true
  }
};

// Content Status (maps to your existing StatusBadge statuses)
export const CONTENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved', 
  REJECTED: 'rejected',
  PUBLISHED: 'published',
  SCHEDULED: 'scheduled'
};

// Status mapping for your existing StatusBadge component
export const CONTENT_STATUS_MAPPING = {
  pending: 'warning',     // Maps to your yellow warning style
  approved: 'good',       // Maps to your blue good style  
  rejected: 'critical',   // Maps to your red critical style
  published: 'excellent', // Maps to your green excellent style
  scheduled: 'good'       // Maps to your blue good style
};

// Tab Configuration for Client Dashboard
export const TAB_CONFIG = [
  {
    id: 'overview',
    label: 'Overview',
    emoji: '📊',
    alwaysShow: true,
    description: 'Your content package summary'
  },
  {
    id: 'blog-posts',
    label: 'Blog Posts',
    emoji: '📝',
    requiresFeature: 'content',
    description: 'SEO-optimized blog content'
  },
  {
    id: 'social-media',
    label: 'Social Media',
    emoji: '📱',
    requiresFeature: 'content',
    description: 'Platform-ready social posts'
  },
  {
    id: 'email-sequence',
    label: 'Email Sequence',
    emoji: '✉️',
    requiresFeature: 'content',
    description: 'Automated email nurture campaign'
  },
  {
    id: 'website',
    label: 'Website',
    emoji: '🌐',
    requiresFeature: 'website',
    description: 'Website development progress'
  },
  {
    id: 'service-areas',
    label: 'Service Areas',
    emoji: '📍',
    requiresFeature: 'serviceAreas',
    description: 'Local landing pages'
  },
  {
    id: 'ads',
    label: 'Advertising',
    emoji: '💰',
    requiresFeature: 'ads',
    description: 'Paid advertising performance'
  },
  {
    id: 'publishing',
    label: 'Publishing',
    emoji: '📅',
    requiresFeature: 'publishing',
    description: 'Content calendar & scheduling'
  },
  {
    id: 'citations',
    label: 'Citations',
    emoji: '📋',
    requiresFeature: 'citations',
    description: 'Directory listings management'
  },
  {
    id: 'reviews',
    label: 'Reviews',
    emoji: '⭐',
    requiresFeature: 'reviews',
    description: 'Review monitoring & responses'
  }
];

// Success Messages
export const SUCCESS_MESSAGES = {
  contentApproved: 'Content approved successfully! It will be published according to your schedule.',
  contentRejected: 'Feedback submitted successfully. Our team will revise the content.',
  bulkApproved: 'Multiple items approved successfully!',
  settingsSaved: 'Settings saved successfully.'
};

// Error Messages  
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your connection and try again.',
  unauthorized: 'Your session has expired. Please log in again.',
  notFound: 'Content not found. It may have been moved or deleted.',
  server: 'Server error. Our team has been notified. Please try again later.',
  validation: 'Please check your input and try again.'
};