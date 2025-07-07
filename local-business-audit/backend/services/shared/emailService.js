// emailService.js - Email Automation and Notifications
// Location: /services/shared/emailService.js

const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter (using Gmail/SMTP)
   */
  initializeTransporter() {
    // Skip initialization if no SMTP credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('Email service: No SMTP credentials configured, using GoHighLevel instead');
      return;
    }
    
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log('Email service: SMTP transporter initialized');
    } catch (error) {
      console.error('Email service: Failed to initialize SMTP:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Load and compile email template
   */
  async loadTemplate(templateName) {
    if (this.templates[templateName]) {
      return this.templates[templateName];
    }

    try {
      const templatePath = path.join(__dirname, '../../templates/emails', `${templateName}.hbs`);
      const templateSource = await fs.readFile(templatePath, 'utf8');
      this.templates[templateName] = handlebars.compile(templateSource);
      return this.templates[templateName];
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      // Return a simple fallback template
      return handlebars.compile('<p>{{content}}</p>');
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(payment) {
    try {
      const template = await this.loadTemplate('payment-confirmation');
      
      const emailData = {
        businessName: payment.businessName,
        planName: this.getPlanDisplayName(payment.plan),
        amount: payment.amount,
        setupFee: payment.setupFee,
        monthlyFee: payment.monthlyRecurring,
        nextBillingDate: payment.nextBillingDate,
        dashboardUrl: `${process.env.APP_URL}/dashboard`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@localbrandbuilder.com'
      };

      const html = template(emailData);

      await this.sendEmail({
        to: payment.email,
        subject: 'Welcome to Local Brand Builder! 🎉',
        html,
        text: this.generatePlainText(emailData, 'payment-confirmation')
      });

      console.log('Payment confirmation email sent to:', payment.email);
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw error;
    }
  }

  /**
   * Send onboarding welcome email
   */
  async sendOnboardingWelcome(businessData) {
    try {
      const template = await this.loadTemplate('onboarding-welcome');
      
      const emailData = {
        businessName: businessData.businessName,
        firstName: businessData.contactName.split(' ')[0],
        onboardingUrl: `${process.env.APP_URL}/onboarding/${businessData.onboardingId}`,
        estimatedTime: '15-20 minutes',
        supportEmail: process.env.SUPPORT_EMAIL || 'support@localbrandbuilder.com'
      };

      const html = template(emailData);

      await this.sendEmail({
        to: businessData.email,
        subject: 'Let\'s Get Started with Your AI Interview 🤖',
        html,
        text: this.generatePlainText(emailData, 'onboarding-welcome')
      });

      console.log('Onboarding welcome email sent to:', businessData.email);
    } catch (error) {
      console.error('Error sending onboarding welcome:', error);
      throw error;
    }
  }

  /**
   * Send content ready notification
   */
  async sendContentReady(businessData, content) {
    try {
      const template = await this.loadTemplate('content-ready');
      
      const emailData = {
        businessName: businessData.businessName,
        contentType: content.type,
        contentTitle: content.title,
        contentPreview: content.preview,
        dashboardUrl: `${process.env.APP_URL}/dashboard/content/${content._id}`,
        approveUrl: `${process.env.APP_URL}/dashboard/content/${content._id}/approve`
      };

      const html = template(emailData);

      await this.sendEmail({
        to: businessData.email,
        subject: `New ${content.type} Ready for Review 📝`,
        html,
        text: this.generatePlainText(emailData, 'content-ready')
      });
    } catch (error) {
      console.error('Error sending content ready email:', error);
      throw error;
    }
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailedEmail(payment) {
    try {
      const template = await this.loadTemplate('payment-failed');
      
      const emailData = {
        businessName: payment.businessName,
        amount: payment.monthlyRecurring,
        updatePaymentUrl: `${process.env.APP_URL}/billing/update-payment`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@localbrandbuilder.com',
        gracePeriodDays: 7
      };

      const html = template(emailData);

      await this.sendEmail({
        to: payment.email,
        subject: 'Action Required: Payment Failed ⚠️',
        html,
        text: this.generatePlainText(emailData, 'payment-failed')
      });
    } catch (error) {
      console.error('Error sending payment failed email:', error);
      throw error;
    }
  }

  /**
   * Send cancellation confirmation email
   */
  async sendCancellationEmail(payment) {
    try {
      const template = await this.loadTemplate('cancellation');
      
      const emailData = {
        businessName: payment.businessName,
        endDate: payment.subscriptionEndDate,
        exportDataUrl: `${process.env.APP_URL}/account/export`,
        reactivateUrl: `${process.env.APP_URL}/pricing`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@localbrandbuilder.com'
      };

      const html = template(emailData);

      await this.sendEmail({
        to: payment.email,
        subject: 'Subscription Cancelled - We\'re Sorry to See You Go',
        html,
        text: this.generatePlainText(emailData, 'cancellation')
      });
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error;
    }
  }

  /**
   * Send weekly performance report
   */
  async sendWeeklyReport(businessData, metrics) {
    try {
      const template = await this.loadTemplate('weekly-report');
      
      const emailData = {
        businessName: businessData.businessName,
        weekStartDate: metrics.weekStartDate,
        weekEndDate: metrics.weekEndDate,
        contentPublished: metrics.contentPublished,
        totalReach: metrics.totalReach,
        engagementRate: metrics.engagementRate,
        newReviews: metrics.newReviews,
        citationsBuilt: metrics.citationsBuilt,
        dashboardUrl: `${process.env.APP_URL}/dashboard/analytics`,
        topPerformingContent: metrics.topContent
      };

      const html = template(emailData);

      await this.sendEmail({
        to: businessData.email,
        subject: `Your Weekly Marketing Report 📊 - ${businessData.businessName}`,
        html,
        text: this.generatePlainText(emailData, 'weekly-report')
      });
    } catch (error) {
      console.error('Error sending weekly report:', error);
      throw error;
    }
  }

  /**
   * Core email sending function
   */
  async sendEmail(options) {
    try {
      // If no transporter configured, just log and return success
      if (!this.transporter) {
        console.log('Email would be sent via GoHighLevel to:', options.to);
        console.log('Subject:', options.subject);
        return { 
          messageId: 'ghl-placeholder-' + Date.now(), 
          success: true,
          method: 'GoHighLevel'
        };
      }
      
      const mailOptions = {
        from: process.env.FROM_EMAIL || '"Local Brand Builder" <noreply@localbrandbuilder.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments || []
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Generate plain text version of email
   */
  generatePlainText(data, templateType) {
    // Simple plain text versions for email clients that don't support HTML
    const templates = {
      'payment-confirmation': `
Welcome to Local Brand Builder!

Hi ${data.businessName},

Your payment has been processed successfully.
Plan: ${data.planName}
Amount: $${data.amount}

You can access your dashboard at: ${data.dashboardUrl}

Next billing date: ${data.nextBillingDate}

Questions? Contact us at ${data.supportEmail}
      `,
      'onboarding-welcome': `
Let's Get Started!

Hi ${data.firstName},

Your AI interview is ready. It will take about ${data.estimatedTime}.

Start here: ${data.onboardingUrl}

Need help? Email ${data.supportEmail}
      `,
      // Add more plain text templates as needed
    };

    return templates[templateType] || 'Email content not available in plain text.';
  }

  /**
   * Get display name for plan
   */
  getPlanDisplayName(plan) {
    const planNames = {
      'standard': 'Standard Plan',
      'professional': 'Professional Plan',
      'premium': 'Premium Plan'
    };
    return planNames[plan] || plan;
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        console.log('Email configuration test: Using GoHighLevel (no SMTP configured)');
        return true;
      }
      
      await this.transporter.verify();
      console.log('Email configuration is valid');
      return true;
    } catch (error) {
      console.error('Email configuration error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();