// services/auditLimiter.js
// Prevents audit abuse while allowing admin overrides

const auditStorage = require('./auditStorage');

class AuditLimiterService {
  constructor() {
    // Admin key for bypassing limits (store in environment variable)
    this.adminKey = process.env.AUDIT_ADMIN_KEY || 'your-secret-admin-key-here';
    
    // Time window for rate limiting (24 hours)
    this.rateLimitWindow = 24 * 60 * 60 * 1000; // milliseconds
    
    // Max audits per IP in time window
    this.maxAuditsPerIP = 3;
  }

  /**
   * Normalize business identifier for consistent checking
   */
  normalizeBusinessId(businessName, location) {
    // Create a consistent ID from business name and location
    const normalized = `${businessName}-${location}`
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();
    return normalized;
  }

  /**
   * Check if a business has already been audited
   */
  async hasExistingAudit(businessName, location) {
    try {
      const businessId = this.normalizeBusinessId(businessName, location);
      
      // Check for existing audits
      const existingAudits = await auditStorage.getAuditHistory(businessId, 1);
      
      if (existingAudits && existingAudits.length > 0) {
        return {
          hasAudit: true,
          lastAuditDate: existingAudits[0].createdAt,
          auditId: existingAudits[0]._id,
          message: 'This business has already been audited. Contact us for a comprehensive SEO analysis.'
        };
      }
      
      return { hasAudit: false };
    } catch (error) {
      console.error('Error checking existing audit:', error);
      // On error, allow the audit to proceed
      return { hasAudit: false };
    }
  }

  /**
   * Check if an IP address is rate limited
   */
  async checkIPRateLimit(ipAddress) {
    try {
      // Get recent audits from this IP
      const recentAudits = await auditStorage.getAuditsByIP(ipAddress, this.rateLimitWindow);
      
      if (recentAudits && recentAudits.length >= this.maxAuditsPerIP) {
        return {
          isLimited: true,
          message: `You've reached the maximum number of audits (${this.maxAuditsPerIP}) in 24 hours. Please try again later.`,
          resetTime: new Date(recentAudits[0].createdAt.getTime() + this.rateLimitWindow)
        };
      }
      
      return { isLimited: false };
    } catch (error) {
      console.error('Error checking IP rate limit:', error);
      // On error, allow the audit to proceed
      return { isLimited: false };
    }
  }

  /**
   * Check if audit should be allowed
   */
  async canRunAudit(businessName, location, ipAddress, adminKey = null) {
    // Admin bypass
    if (adminKey && adminKey === this.adminKey) {
      return {
        allowed: true,
        isAdmin: true,
        message: 'Admin access granted'
      };
    }

    // Check if business already audited
    const existingAudit = await this.hasExistingAudit(businessName, location);
    if (existingAudit.hasAudit) {
      return {
        allowed: false,
        reason: 'duplicate',
        ...existingAudit
      };
    }

    // Check IP rate limit
    const ipLimit = await this.checkIPRateLimit(ipAddress);
    if (ipLimit.isLimited) {
      return {
        allowed: false,
        reason: 'rate_limit',
        ...ipLimit
      };
    }

    return {
      allowed: true,
      message: 'Audit approved'
    };
  }

  /**
   * Generate a one-time audit token for special cases
   */
  generateAuditToken(businessName, location, expiresIn = 3600000) { // 1 hour default
    const crypto = require('crypto');
    const data = {
      businessName,
      location,
      expires: Date.now() + expiresIn,
      nonce: crypto.randomBytes(16).toString('hex')
    };
    
    // Create a signed token
    const token = Buffer.from(JSON.stringify(data)).toString('base64');
    const signature = crypto
      .createHmac('sha256', this.adminKey)
      .update(token)
      .digest('hex');
    
    return `${token}.${signature}`;
  }

  /**
   * Verify a one-time audit token
   */
  verifyAuditToken(token) {
    try {
      const crypto = require('crypto');
      const [data, signature] = token.split('.');
      
      // Verify signature
      const expectedSignature = crypto
        .createHmac('sha256', this.adminKey)
        .update(data)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return { valid: false, reason: 'Invalid signature' };
      }
      
      // Decode and check expiration
      const decoded = JSON.parse(Buffer.from(data, 'base64').toString());
      
      if (Date.now() > decoded.expires) {
        return { valid: false, reason: 'Token expired' };
      }
      
      return {
        valid: true,
        businessName: decoded.businessName,
        location: decoded.location
      };
    } catch (error) {
      return { valid: false, reason: 'Invalid token format' };
    }
  }

  /**
   * Log audit attempt for monitoring
   */
  async logAuditAttempt(businessName, location, ipAddress, allowed, reason = null) {
    const logEntry = {
      timestamp: new Date(),
      businessName,
      location,
      ipAddress,
      allowed,
      reason,
      businessId: this.normalizeBusinessId(businessName, location)
    };
    
    // You could save this to a separate collection for analytics
    console.log('Audit attempt:', logEntry);
  }
}

module.exports = new AuditLimiterService();