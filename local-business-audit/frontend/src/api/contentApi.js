// src/api/contentApi.js
// SIMPLE VERSION - Direct API calls, no proxy bullshit

const API_BASE = 'https://musical-winner-jj9x456wxp79h5p9g-5000.app.github.dev/api';

console.log('🔗 API Base URL:', API_BASE);

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  
  console.log(`🌐 Making API call: ${options.method || 'GET'} ${url}`);
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };
  
  try {
    const response = await fetch(url, config);
    
    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Success:', data);
    return data;
  } catch (error) {
    console.error('❌ API Call Failed:', {
      endpoint,
      url,
      error: error.message
    });
    throw error;
  }
}

// Export the contentApi object to match your existing code
export const contentApi = {
  // Get all content for a business
  getBusinessContent: async (businessId, filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiCall(`/content/business/${businessId}?${params}`);
  },

  // Get content status/metrics
  getContentStatus: async (businessId) => {
    console.log(`📊 Getting content status for business: ${businessId}`);
    return apiCall(`/content/status/${businessId}`);
  },

  // Approve content
  approveContent: async (contentId) => {
    console.log(`✅ Approving content: ${contentId}`);
    return apiCall(`/content/${contentId}/approve`, {
      method: 'POST'
    });
  },

  // Reject content
  rejectContent: async (contentId, feedback) => {
    console.log(`❌ Rejecting content: ${contentId}`);
    return apiCall(`/content/${contentId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ feedback })
    });
  },

  // Bulk approve
  bulkApprove: async (contentIds) => {
    console.log(`✅ Bulk approving ${contentIds.length} items`);
    return apiCall('/content/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ contentIds })
    });
  },

  // Generate test content
  generateTestContent: async () => {
    console.log('🧪 Generating test content...');
    return apiCall('/content/test-generation', {
      method: 'POST'
    });
  }
};

// Also export individual functions for backward compatibility
export async function generateTestContent() {
  return contentApi.generateTestContent();
}

export async function getBusinessContent(businessId, options = {}) {
  return contentApi.getBusinessContent(businessId, options);
}

export async function getContentStatus(businessId) {
  return contentApi.getContentStatus(businessId);
}

export async function approveContent(contentId) {
  return contentApi.approveContent(contentId);
}

export async function rejectContent(contentId, feedback) {
  return contentApi.rejectContent(contentId, feedback);
}

export async function bulkApproveContent(contentIds) {
  return contentApi.bulkApprove(contentIds);
}

// Health check endpoint
export async function checkApiHealth() {
  console.log('🏥 Checking API health...');
  return apiCall('/health');
}