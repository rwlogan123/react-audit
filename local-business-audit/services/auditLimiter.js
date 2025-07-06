// services/auditLimiter.js
// ULTRA-STRICT: 1 audit per IP per 24 hours + permanent business blocking

const auditStorage = require('./auditStorage');

class AuditLimiterService {
  constructor() {
    // Admin key for bypassing limits (store in environment variable)
    this.adminKey = process.env.AUDIT_ADMIN_KEY || 'your-secret-admin-key-here';
    
    // Time window for rate limiting (24 hours)
    this.rateLimitWindow = 24 * 60 * 60 * 1000; // milliseconds
    
    // STRICT: Only 1 audit per IP per 24 hours
    this.maxAuditsPerIP = 1;
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
   * Check if a business has already been audited - PERMANENT BLOCK
   */
  async hasExistingAudit(businessName, location) {
    try {
      const businessId = this.normalizeBusinessId(businessName, location);
      
      // Check for ANY existing audits - no time limit, no IP consideration
      const existingAudits = await auditStorage.getAuditHistory(businessId, 1);
      
      if (existingAudits && existingAudits.length > 0) {
        return {
          hasAudit: true,
          lastAuditDate: existingAudits[0].createdAt,
          auditId: existingAudits[0]._id,
          visibilityScore: existingAudits[0].data?.visibilityScore || 'N/A',
          message: 'This business has already been audited.',
          salesMessage: 'Ready to improve your visibility score? Schedule a free consultation to discuss your personalized SEO strategy.',
          contactRequired: true
        };
      }
      
      return { hasAudit: false };
    } catch (error) {
      console.error('Error checking existing audit:', error);
      // On error, be restrictive (fail closed, not open)
      return { 
        hasAudit: true,
        message: 'Unable to verify audit status. Please contact support.',
        contactRequired: true
      };
    }
  }

  /**
   * Check if an IP address is rate limited - STRICT: 1 per 24 hours
   */
  async checkIPRateLimit(ipAddress) {
    try {
      // Get ANY audits from this IP in the last 24 hours
      const recentAudits = await auditStorage.getAuditsByIP(ipAddress, this.rateLimitWindow);
      
      // STRICT: Even 1 audit blocks the IP for 24 hours
      if (recentAudits && recentAudits.length >= this.maxAuditsPerIP) {
        const hoursRemaining = Math.ceil((recentAudits[0].createdAt.getTime() + this.rateLimitWindow - Date.now()) / (1000 * 60 * 60));
        
        return {
          isLimited: true,
          message: `You've already used your free audit today. Try again in ${hoursRemaining} hours.`,
          salesMessage: 'Need to audit another business? Contact us for immediate access and professional SEO services.',
          resetTime: new Date(recentAudits[0].createdAt.getTime() + this.rateLimitWindow),
          hoursRemaining: hoursRemaining,
          contactRequired: true
        };
      }
      
      return { isLimited: false };
    } catch (error) {
      console.error('Error checking IP rate limit:', error);
      // On error, be restrictive
      return { 
        isLimited: true,
        message: 'Unable to verify audit limits. Please contact support.',
        contactRequired: true
      };
    }
  }

  /**
   * Check if audit should be allowed - ULTRA STRICT VERSION
   */
  async canRunAudit(businessName, location, ipAddress, adminKey = null) {
    // Admin bypass - only YOU can override limits
    if (adminKey && adminKey === this.adminKey) {
      console.log('🔑 Admin override - allowing audit');
      return {
        allowed: true,
        isAdmin: true,
        message: 'Admin access granted'
      };
    }

    // FIRST CHECK: Has this business EVER been audited (from ANY IP)?
    const existingAudit = await this.hasExistingAudit(businessName, location);
    if (existingAudit.hasAudit) {
      console.log(`🚫 Business permanently blocked: ${businessName}`);
      return {
        allowed: false,
        reason: 'duplicate',
        ...existingAudit
      };
    }

    // SECOND CHECK: Has this IP audited ANYTHING in the last 24 hours?
    const ipLimit = await this.checkIPRateLimit(ipAddress);
    if (ipLimit.isLimited) {
      console.log(`🚫 IP blocked for 24 hours: ${ipAddress}`);
      return {
        allowed: false,
        reason: 'rate_limit',
        ...ipLimit
      };
    }

    // Both checks passed - audit allowed
    console.log(`✅ Audit approved for ${businessName} from IP ${ipAddress}`);
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
   * Log audit attempt for monitoring and lead tracking
   */
  async logAuditAttempt(businessName, location, ipAddress, allowed, reason = null) {
    const logEntry = {
      timestamp: new Date(),
      businessName,
      location,
      ipAddress,
      allowed,
      reason,
      businessId: this.normalizeBusinessId(businessName, location),
      // Track blocked attempts as leads
      isLead: !allowed && (reason === 'duplicate' || reason === 'rate_limit')
    };
    
    console.log('📊 Audit attempt:', {
      business: businessName,
      ip: ipAddress,
      allowed: allowed ? '✅' : '❌',
      reason: reason || 'first_audit'
    });
    
    // If it's a blocked attempt, it's a warm lead!
    if (logEntry.isLead) {
      console.log('🔥 HOT LEAD DETECTED:', {
        business: businessName,
        reason: reason === 'duplicate' ? 'Business trying to re-audit' : 'IP trying multiple audits',
        ip: ipAddress,
        action: 'Follow up for sales opportunity!'
      });
    }
  }
}

module.exports = new AuditLimiterService();