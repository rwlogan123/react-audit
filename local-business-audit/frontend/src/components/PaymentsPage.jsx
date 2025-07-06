// frontend/src/components/PaymentPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import './PaymentPage.css'; // You'll need to create this

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Payment form component
const CheckoutForm = ({ auditData, selectedPlan, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    try {
      // Create payment intent on backend
      const response = await fetch('/api/payment/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          plan: selectedPlan,
          auditId: auditData?.auditId,
          businessName: auditData?.businessName,
          email: event.target.email.value,
          phone: event.target.phone.value
        })
      });

      const { clientSecret, paymentId } = await response.json();

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: event.target.name.value,
            email: event.target.email.value,
            phone: event.target.phone.value
          }
        }
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else {
        setSucceeded(true);
        // Store payment info for onboarding
        sessionStorage.setItem('paymentId', paymentId);
        
        // Redirect to onboarding after short delay
        setTimeout(() => {
          navigate(`/onboarding/${paymentId}`);
        }, 2000);
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          defaultValue={auditData?.contactName || ''}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          defaultValue={auditData?.email || ''}
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          required
          defaultValue={auditData?.phone || ''}
        />
      </div>

      <div className="form-group">
        <label htmlFor="card">Credit Card</label>
        <div className="card-element-wrapper">
          <CardElement id="card" options={cardElementOptions} />
        </div>
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      {succeeded && (
        <div className="success-message">
          ✓ Payment successful! Redirecting to your onboarding...
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing || succeeded}
        className="submit-button"
      >
        {processing ? 'Processing...' : `Pay $${amount} + Start Setup`}
      </button>

      <p className="security-note">
        🔒 Your payment information is secure and encrypted
      </p>
    </form>
  );
};

// Main payment page component
const PaymentPage = () => {
  const [auditData, setAuditData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const navigate = useNavigate();

  useEffect(() => {
    // Get audit data and selected plan from sessionStorage
    const storedAuditData = sessionStorage.getItem('auditData');
    const storedPlan = sessionStorage.getItem('selectedPlan');
    
    if (storedAuditData) {
      setAuditData(JSON.parse(storedAuditData));
    }
    
    if (storedPlan) {
      setSelectedPlan(storedPlan);
    }
  }, []);

  const planDetails = {
    standard: { name: 'Standard', price: 2997, setup: 997 },
    professional: { name: 'Professional', price: 3997, setup: 997 },
    premium: { name: 'Premium', price: 5997, setup: 1497 }
  };

  const plan = planDetails[selectedPlan];
  const totalDueToday = plan.setup;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="payment-header">
          <button className="back-button" onClick={() => navigate('/upgrade')}>
            ← Back
          </button>
          <h1>Complete Your Order</h1>
        </div>

        <div className="payment-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="business-info">
              <h3>{auditData?.businessName || 'Your Business'}</h3>
              <p>{auditData?.city}, {auditData?.state}</p>
            </div>
            
            <div className="plan-details">
              <h3>{plan.name} Plan</h3>
              <div className="price-breakdown">
                <div className="price-line">
                  <span>One-time setup fee:</span>
                  <span>${plan.setup}</span>
                </div>
                <div className="price-line">
                  <span>Monthly subscription (starts in 30 days):</span>
                  <span>${plan.price}/mo</span>
                </div>
                <div className="price-line total">
                  <span>Due Today:</span>
                  <span>${totalDueToday}</span>
                </div>
              </div>
            </div>

            <div className="included-features">
              <h4>What's Included:</h4>
              <ul>
                <li>✓ AI onboarding interview</li>
                <li>✓ Custom content strategy</li>
                <li>✓ First month of content creation</li>
                <li>✓ Platform setup & integration</li>
                <li>✓ Dedicated success manager</li>
              </ul>
            </div>

            <div className="guarantee-box">
              <h4>30-Day Money-Back Guarantee</h4>
              <p>If you're not completely satisfied within 30 days, get a full refund. No questions asked.</p>
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-form-section">
            <h2>Payment Information</h2>
            <Elements stripe={stripePromise}>
              <CheckoutForm 
                auditData={auditData} 
                selectedPlan={selectedPlan}
                amount={totalDueToday}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;