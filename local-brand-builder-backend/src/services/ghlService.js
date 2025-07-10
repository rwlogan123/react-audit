const axios = require('axios');

class GHLService {
  constructor() {
    this.apiKey = process.env.GHL_API_KEY;
    this.locationId = process.env.GHL_LOCATION_ID;
    this.baseUrl = 'https://services.leadconnectorhq.com';
  }

  async createContact(data) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/contacts/v1/contact`,
        {
          locationId: this.locationId,
          email: data.email,
          name: data.businessName,
          customField: {
            audit_completed: true,
            audit_date: new Date().toISOString(),
            visibility_score: data.visibilityScore,
            local_seo_score: data.localSeoScore
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('GHL API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateContact(contactId, data) {
    // Update existing contact
    try {
      const response = await axios.put(
        `${this.baseUrl}/contacts/v1/contact/${contactId}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Version': '2021-07-28'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('GHL Update Error:', error);
      throw error;
    }
  }
}

module.exports = new GHLService();
