// paymentService.js - Stripe Payment Processing Service
// Location: /services/shared/paymentService.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../../models/Payment');
const emailService = require('./emailService');

class PaymentService {
  /**
   * Create a Stripe customer for a business
   */
  async createCustomer(businessData) {
    try {
      const customer = await stripe.customers.create({
        email: businessData.email,
        name: businessData.businessName,
        phone: businessData.phone,
        metadata: {
          auditId: businessData.auditId,
          businessType: businessData.businessType
        }
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer profile');
    }
  }

  /**
   * Create a payment intent for one-time setup fee
   */
  async createPaymentIntent(amount, customerId, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        customer: customerId,
        metadata: {
          ...metadata,
          type: 'setup_fee'
        },
        payment_method_types: ['card'],
        setup_future_usage: 'off_session' // Save card for subscription
      });

      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  /**
   * Create a subscription after setup fee is paid
   */
  async createSubscription(customerId, priceId, paymentMethodId) {
    try {
      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });

      // Create subscription starting next month
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        expand: ['latest_invoice.payment_intent'],
        billing_cycle_anchor: this.getNextMonthTimestamp(),
        prorate: false,
        metadata: {
          type: 'local_brand_builder'
        }
      });

      return subscription;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  /**
   * Handle successful payment webhook
   */
  async handlePaymentSuccess(paymentIntent) {
    try {
      // Find payment record
      const payment = await Payment.findOne({ 
        stripePaymentIntentId: paymentIntent.id 
      });

      if (!payment) {
        console.error('Payment record not found for:', paymentIntent.id);
        return;
      }

      // Update payment status
      payment.status = 'completed';
      payment.paidAt = new Date();
      payment.stripePaymentMethodId = paymentIntent.payment_method;
      await payment.save();

      // Create subscription if this was a setup fee
      if (paymentIntent.metadata.type === 'setup_fee') {
        const subscription = await this.createSubscription(
          payment.stripeCustomerId,
          this.getPriceIdForPlan(payment.plan),
          paymentIntent.payment_method
        );

        payment.stripeSubscriptionId = subscription.id;
        payment.subscriptionStatus = 'active';
        await payment.save();
      }

      // Send confirmation email
      await emailService.sendPaymentConfirmation(payment);

      // Trigger onboarding
      await this.triggerOnboarding(payment);

      return payment;
    } catch (error) {
      console.error('Error handling payment success:', error);
      throw error;
    }
  }

  /**
   * Handle subscription webhook events
   */
  async handleSubscriptionUpdate(subscription) {
    try {
      const payment = await Payment.findOne({ 
        stripeSubscriptionId: subscription.id 
      });

      if (!payment) {
        console.error('Payment record not found for subscription:', subscription.id);
        return;
      }

      payment.subscriptionStatus = subscription.status;
      
      if (subscription.status === 'active') {
        payment.nextBillingDate = new Date(subscription.current_period_end * 1000);
      }

      await payment.save();

      // Send appropriate email based on status
      if (subscription.status === 'past_due') {
        await emailService.sendPaymentFailedEmail(payment);
      } else if (subscription.status === 'canceled') {
        await emailService.sendCancellationEmail(payment);
      }

      return payment;
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw error;
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.update(
        subscriptionId,
        { cancel_at_period_end: true }
      );

      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get Stripe price ID based on plan
   */
  getPriceIdForPlan(plan) {
    const priceMap = {
      'standard': process.env.STRIPE_PRICE_STANDARD,
      'professional': process.env.STRIPE_PRICE_PROFESSIONAL,
      'premium': process.env.STRIPE_PRICE_PREMIUM
    };

    return priceMap[plan] || priceMap['standard'];
  }

  /**
   * Get first day of next month as timestamp
   */
  getNextMonthTimestamp() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.floor(nextMonth.getTime() / 1000);
  }

  /**
   * Trigger onboarding process after payment
   */
  async triggerOnboarding(payment) {
    try {
      // This will be implemented when onboardingManager.js is ready
      console.log('Triggering onboarding for payment:', payment._id);
      
      // For now, just update the payment record
      payment.onboardingStatus = 'pending';
      await payment.save();

      // TODO: Call onboardingManager.initiateOnboarding(payment)
    } catch (error) {
      console.error('Error triggering onboarding:', error);
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(payload, signature) {
    try {
      return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Webhook signature validation failed:', error);
      throw new Error('Invalid webhook signature');
    }
  }

  /**
   * Get customer portal URL for billing management
   */
  async createCustomerPortalSession(customerId, returnUrl) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });

      return session.url;
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }
}

module.exports = new PaymentService();