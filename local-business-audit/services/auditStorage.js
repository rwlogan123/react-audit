const database = require('./database');

class AuditStorageService {
  constructor() {
    this.collectionName = 'audits';
  }

  getCollection() {
    return database.getDb().collection(this.collectionName);
  }

  /**
   * Save a complete audit report
   */
  async saveAudit(businessData, auditResults) {
    try {
      const audit = {
        // Business Information - Use normalized businessId if provided
        businessId: businessData.businessId || businessData.place_id || businessData.name.toLowerCase().replace(/\s+/g, '-'),
        businessData: {
          name: businessData.name,
          address: businessData.address,
          phone: businessData.phone,
          website: businessData.website,
          placeId: businessData.place_id,
          location: businessData.location,
          ipAddress: businessData.ipAddress // Store IP address for rate limiting
        },
        
        // Audit Metadata
        createdAt: new Date(),
        version: '1.0',
        
        // Scores and Metrics
        scores: {
          visibility: auditResults.summary?.overallScore || 0,
          completeness: auditResults.summary?.completenessScore || 0,
          performance: auditResults.pagespeed?.score || 0,
          review: auditResults.summary?.averageRating || 0
        },
        
        // Service Results
        services: {
          website: auditResults.website || null,
          competitors: auditResults.competitors || [],
          citations: auditResults.citations || [],
          pagespeed: auditResults.pagespeed || null,
          schema: auditResults.schema || null,
          reviews: auditResults.reviews || null,
          keywords: auditResults.keywords || null
        },
        
        // Recommendations and Tasks
        recommendations: auditResults.recommendations || [],
        tasks: auditResults.tasks || [],
        
        // Summary
        summary: auditResults.summary || {},
        
        // Set expiration date (1 year from now)
        expireAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      };

      const result = await this.getCollection().insertOne(audit);
      
      console.log(`✅ Audit saved for ${businessData.name} with ID: ${result.insertedId}`);
      
      return {
        success: true,
        auditId: result.insertedId,
        audit: audit
      };
    } catch (error) {
      console.error('❌ Error saving audit:', error);
      throw error;
    }
  }

  /**
   * Get audit history for a business
   */
  async getAuditHistory(businessId, limit = 10) {
    try {
      const audits = await this.getCollection()
        .find({ businessId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      return audits;
    } catch (error) {
      console.error('❌ Error fetching audit history:', error);
      throw error;
    }
  }

  /**
   * Get a single audit by ID
   */
  async getAuditById(auditId) {
    try {
      const { ObjectId } = require('mongodb');
      const audit = await this.getCollection().findOne({ 
        _id: new ObjectId(auditId) 
      });
      
      return audit;
    } catch (error) {
      console.error('❌ Error fetching audit:', error);
      throw error;
    }
  }

  /**
   * Get latest audit for a business
   */
  async getLatestAudit(businessId) {
    try {
      const audit = await this.getCollection()
        .findOne({ businessId }, { sort: { createdAt: -1 } });
      
      return audit;
    } catch (error) {
      console.error('❌ Error fetching latest audit:', error);
      throw error;
    }
  }

  /**
   * Search audits by business name
   */
  async searchAudits(searchTerm, limit = 20) {
    try {
      const audits = await this.getCollection()
        .find({
          'businessData.name': { 
            $regex: searchTerm, 
            $options: 'i' 
          }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      return audits;
    } catch (error) {
      console.error('❌ Error searching audits:', error);
      throw error;
    }
  }

  /**
   * Get audits by IP address within a time window
   */
  async getAuditsByIP(ipAddress, timeWindowMs) {
    try {
      const cutoffDate = new Date(Date.now() - timeWindowMs);
      
      const audits = await this.getCollection()
        .find({
          'businessData.ipAddress': ipAddress,
          createdAt: { $gte: cutoffDate }
        })
        .sort({ createdAt: -1 })
        .toArray();
      
      return audits;
    } catch (error) {
      console.error('❌ Error fetching audits by IP:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats() {
    try {
      const stats = await this.getCollection().aggregate([
        {
          $group: {
            _id: null,
            totalAudits: { $sum: 1 },
            avgVisibilityScore: { $avg: '$scores.visibility' },
            avgCompletenessScore: { $avg: '$scores.completeness' },
            avgPerformanceScore: { $avg: '$scores.performance' },
            uniqueBusinesses: { $addToSet: '$businessId' }
          }
        },
        {
          $project: {
            _id: 0,
            totalAudits: 1,
            avgVisibilityScore: { $round: ['$avgVisibilityScore', 1] },
            avgCompletenessScore: { $round: ['$avgCompletenessScore', 1] },
            avgPerformanceScore: { $round: ['$avgPerformanceScore', 1] },
            uniqueBusinessCount: { $size: '$uniqueBusinesses' }
          }
        }
      ]).toArray();
      
      return stats[0] || {
        totalAudits: 0,
        avgVisibilityScore: 0,
        avgCompletenessScore: 0,
        avgPerformanceScore: 0,
        uniqueBusinessCount: 0
      };
    } catch (error) {
      console.error('❌ Error getting audit stats:', error);
      throw error;
    }
  }

  /**
   * Delete old audits (manual cleanup if needed)
   */
  async deleteOldAudits(daysOld = 365) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
      const result = await this.getCollection().deleteMany({
        createdAt: { $lt: cutoffDate }
      });
      
      console.log(`🗑️ Deleted ${result.deletedCount} audits older than ${daysOld} days`);
      
      return result.deletedCount;
    } catch (error) {
      console.error('❌ Error deleting old audits:', error);
      throw error;
    }
  }
}

module.exports = new AuditStorageService();