// frontend/src/components/LandingPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import './LandingPage.css'; // You'll need to create this

const LandingPage = () => {
  const navigate = useNavigate();
  const [businessData, setBusinessData] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('professional');

  useEffect(() => {
    // Get business data from sessionStorage (passed from audit/popup)
    const storedData = sessionStorage.getItem('businessData');
    if (storedData) {
      setBusinessData(JSON.parse(storedData));
    }
  }, []);

  const handleGetStarted = (plan) => {
    setSelectedPlan(plan);
    // Store selected plan
    sessionStorage.setItem('selectedPlan', plan);
    // Navigate to payment
    navigate('/payment');
  };

  // Extract problems from business data
  const getProblems = () => {
    if (!businessData) return [];
    
    const problems = [];
    
    if (businessData.localContentScore < 50) {
      problems.push({
        title: "Missing Local SEO",
        description: `Your local SEO score is only ${businessData.localContentScore}/100`,
        impact: "Losing 50+ customers/month to competitors"
      });
    }
    
    if (businessData.pagespeedAnalysis?.desktopScore < 60) {
      problems.push({
        title: "Slow Website Speed",
        description: `Website speed score is ${businessData.pagespeedAnalysis.desktopScore}/100`,
        impact: "73% of mobile users leave slow sites"
      });
    }
    
    if (businessData.socialMediaAnalysis?.socialScore < 60) {
      problems.push({
        title: "Weak Social Presence",
        description: `Social media score is only ${businessData.socialMediaAnalysis.socialScore}/100`,
        impact: "Competitors getting 3x more engagement"
      });
    }
    
    if (businessData.citationAnalysis?.citationCompletionRate < 60) {
      problems.push({
        title: "Missing from Directories",
        description: `Only listed on ${businessData.citationAnalysis.citationCompletionRate}% of key directories`,
        impact: "Invisible to 40% of local searches"
      });
    }
    
    return problems;
  };

  const problems = getProblems();

  const plans = [
    {
      id: 'standard',
      name: 'Standard',
      price: 2997,
      originalPrice: 5997,
      features: [
        '15 SEO-optimized blog posts/month',
        'Social media content for 2 platforms',
        'Basic review management',
        'Monthly performance reports',
        'Email support'
      ],
      highlighted: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 3997,
      originalPrice: 6997,
      features: [
        '30 SEO-optimized blog posts/month',
        'Social media content for 4 platforms',
        'Advanced review management',
        'Citation building (50/month)',
        'Weekly performance reports',
        'Priority phone support',
        'Competitor tracking'
      ],
      highlighted: true,
      badge: 'MOST POPULAR'
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 5997,
      originalPrice: 8997,
      features: [
        '60 SEO-optimized blog posts/month',
        'Social media content for 6 platforms',
        'White-glove review management',
        'Citation building (100/month)',
        'Daily performance reports',
        'Dedicated account manager',
        'Custom content strategy',
        'Video content creation'
      ],
      highlighted: false
    }
  ];

  // Inline styles (since CSS file might not exist yet)
  const styles = {
    landingPage: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#333',
      lineHeight: '1.6'
    },
    hero: {
      background: 'linear-gradient(135deg, #2A3B4A 0%, #1a2b38 100%)',
      color: 'white',
      padding: '80px 20px',
      textAlign: 'center'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px'
    },
    h1: {
      fontSize: '48px',
      marginBottom: '20px',
      fontWeight: '700'
    },
    subtitle: {
      fontSize: '20px',
      marginBottom: '40px',
      opacity: '0.9'
    },
    heroStats: {
      display: 'flex',
      justifyContent: 'center',
      gap: '40px',
      flexWrap: 'wrap',
      marginTop: '40px'
    },
    stat: {
      textAlign: 'center'
    },
    number: {
      display: 'block',
      fontSize: '36px',
      fontWeight: '700',
      marginBottom: '8px'
    },
    label: {
      fontSize: '14px',
      opacity: '0.8'
    },
    section: {
      padding: '80px 20px'
    },
    sectionTitle: {
      fontSize: '36px',
      textAlign: 'center',
      marginBottom: '40px',
      color: '#2A3B4A'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '30px'
    },
    card: {
      background: 'white',
      padding: '30px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    pricingCard: {
      background: 'white',
      padding: '40px 30px',
      borderRadius: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      position: 'relative',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    },
    highlighted: {
      transform: 'scale(1.05)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    },
    badge: {
      position: 'absolute',
      top: '-12px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#10B981',
      color: 'white',
      padding: '4px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    price: {
      textAlign: 'center',
      marginBottom: '30px'
    },
    ctaButton: {
      display: 'block',
      width: '100%',
      padding: '16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    primaryButton: {
      background: '#10B981',
      color: 'white'
    },
    secondaryButton: {
      background: 'white',
      color: '#2A3B4A',
      border: '2px solid #E1E1E1'
    }
  };

  return (
    <div style={styles.landingPage}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.container}>
          <h1 style={styles.h1}>
            Stop Losing Customers to Your Competition
          </h1>
          <p style={styles.subtitle}>
            {businessData ? (
              <>We found {problems.length} critical issues hurting {businessData.businessName}'s online presence</>
            ) : (
              <>Transform your local business with AI-powered marketing that actually works</>
            )}
          </p>
          <div style={styles.heroStats}>
            <div style={styles.stat}>
              <span style={styles.number}>73%</span>
              <span style={styles.label}>Average increase in leads</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.number}>4.8★</span>
              <span style={styles.label}>Average Google rating improvement</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.number}>156%</span>
              <span style={styles.label}>Average ROI in 6 months</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Agitation */}
      {problems.length > 0 && (
        <section style={{...styles.section, background: '#f8fafc'}}>
          <div style={styles.container}>
            <h2 style={styles.sectionTitle}>Here's What's Costing You Customers Right Now:</h2>
            <div style={styles.grid}>
              {problems.map((problem, index) => (
                <div key={index} style={styles.card}>
                  <div style={{ fontSize: '24px', marginBottom: '16px' }}>⚠️</div>
                  <h3 style={{ marginBottom: '12px', color: '#2A3B4A' }}>{problem.title}</h3>
                  <p style={{ marginBottom: '12px', color: '#666' }}>{problem.description}</p>
                  <span style={{ color: '#EF4444', fontWeight: '600', fontSize: '14px' }}>{problem.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Solution Section */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Your Complete Marketing Department in One Platform</h2>
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ marginBottom: '12px' }}>AI Content Creation</h3>
              <p style={{ color: '#666' }}>Fresh, SEO-optimized content published automatically to dominate local search</p>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
              <h3 style={{ marginBottom: '12px' }}>Review Management</h3>
              <p style={{ color: '#666' }}>Get more 5-star reviews and respond to all feedback automatically</p>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📍</div>
              <h3 style={{ marginBottom: '12px' }}>Citation Building</h3>
              <p style={{ color: '#666' }}>List your business on 100+ directories to boost local rankings</p>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📱</div>
              <h3 style={{ marginBottom: '12px' }}>Social Media Autopilot</h3>
              <p style={{ color: '#666' }}>Engaging posts published daily across all major platforms</p>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ marginBottom: '12px' }}>Real-Time Analytics</h3>
              <p style={{ color: '#666' }}>Track leads, rankings, and ROI with our executive dashboard</p>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ marginBottom: '12px' }}>Competitor Tracking</h3>
              <p style={{ color: '#666' }}>Stay ahead by monitoring and outperforming your competition</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{...styles.section, background: '#f8fafc'}} id="pricing">
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Choose Your Growth Plan</h2>
          <p style={{ textAlign: 'center', marginBottom: '40px', fontSize: '18px', color: '#666' }}>
            Limited Time: Save $3,000/month on all plans
          </p>
          <div style={styles.grid}>
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                style={{
                  ...styles.pricingCard,
                  ...(plan.highlighted ? styles.highlighted : {})
                }}
              >
                {plan.badge && <span style={styles.badge}>{plan.badge}</span>}
                <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px' }}>{plan.name}</h3>
                <div style={styles.price}>
                  <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '18px' }}>${plan.originalPrice}</span>
                  <span style={{ display: 'block', fontSize: '48px', fontWeight: '700', color: '#2A3B4A' }}>${plan.price}</span>
                  <span style={{ color: '#666' }}>/month</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '30px' }}>
                  {plan.features.map((feature, index) => (
                    <li key={index} style={{ padding: '8px 0', display: 'flex', alignItems: 'start' }}>
                      <span style={{ color: '#10B981', marginRight: '8px' }}>✓</span>
                      <span style={{ color: '#666' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button 
                  style={{
                    ...styles.ctaButton,
                    ...(plan.highlighted ? styles.primaryButton : styles.secondaryButton)
                  }}
                  onClick={() => handleGetStarted(plan.id)}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Get Started →
                </button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <p style={{ color: '#666' }}>🛡️ 30-Day Money-Back Guarantee • No Setup Fees • Cancel Anytime</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={styles.section}>
        <div style={styles.container}>
          <h2 style={styles.sectionTitle}>Join 500+ Local Businesses Growing with Local Brand Builder</h2>
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={{ fontSize: '20px', marginBottom: '16px', color: '#F59E0B' }}>★★★★★</div>
              <p style={{ marginBottom: '16px', fontStyle: 'italic' }}>"Our phone hasn't stopped ringing since we started. We've had to hire 2 new technicians!"</p>
              <cite style={{ color: '#666', fontStyle: 'normal' }}>- Mike Johnson, Johnson's HVAC</cite>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '20px', marginBottom: '16px', color: '#F59E0B' }}>★★★★★</div>
              <p style={{ marginBottom: '16px', fontStyle: 'italic' }}>"From page 5 to #1 on Google in 60 days. Our revenue is up 156% year over year."</p>
              <cite style={{ color: '#666', fontStyle: 'normal' }}>- Sarah Chen, Chen Plumbing Solutions</cite>
            </div>
            <div style={styles.card}>
              <div style={{ fontSize: '20px', marginBottom: '16px', color: '#F59E0B' }}>★★★★★</div>
              <p style={{ marginBottom: '16px', fontStyle: 'italic' }}>"The AI content is incredible. It sounds exactly like us but better. Worth every penny."</p>
              <cite style={{ color: '#666', fontStyle: 'normal' }}>- David Martinez, Premier Roofing Co</cite>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{...styles.hero, padding: '60px 20px'}}>
        <div style={styles.container}>
          <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>Ready to Dominate Your Local Market?</h2>
          <p style={{ fontSize: '18px', marginBottom: '30px' }}>Join the 500+ businesses already crushing their competition</p>
          <button 
            style={{
              ...styles.ctaButton,
              ...styles.primaryButton,
              width: 'auto',
              padding: '20px 40px',
              fontSize: '20px',
              display: 'inline-block'
            }}
            onClick={() => handleGetStarted('professional')}
          >
            Start Growing Today →
          </button>
          <p style={{ marginTop: '20px', fontSize: '14px', opacity: '0.9' }}>
            ⏰ Special pricing expires in 24 hours • Only 2 spots left for {businessData?.location?.split(',')[0] || 'your area'}
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;