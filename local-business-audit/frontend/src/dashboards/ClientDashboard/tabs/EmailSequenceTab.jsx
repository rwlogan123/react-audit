import React, { useState, useEffect } from 'react';

// Colors configuration
const colors = {
  primary: "#2A3B4A",
  white: "#FFFFFF",
  lightGray: "#E1E1E1",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

// StatusBadge component
const StatusBadge = ({ status, children }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', color: '#D97706', label: 'Pending Review' };
      case 'approved':
        return { bg: '#D1FAE5', color: '#065F46', label: 'Approved' };
      case 'rejected':
        return { bg: '#FEE2E2', color: '#991B1B', label: 'Needs Revision' };
      default:
        return { bg: colors.lightGray, color: '#666', label: status };
    }
  };

  const style = getStatusStyle();
  
  return (
    <span style={{
      background: style.bg,
      color: style.color,
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      display: 'inline-block'
    }}>
      {children || style.label}
    </span>
  );
};

// Email Content Card Component
const EmailContentCard = ({ item, isSelected, onToggleSelect, onApprove, onReject, sequencePosition }) => {
  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderLeft: `4px solid ${
        item.status === 'approved' ? colors.success :
        item.status === 'rejected' ? colors.danger :
        colors.warning
      }`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            {item.status === 'pending' && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={onToggleSelect}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            )}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: colors.warning,
              color: colors.white,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              {sequencePosition}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: colors.primary, margin: 0 }}>
                Email {sequencePosition}: {item.emailType}
              </h3>
              <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>
                {item.triggerDescription}
              </p>
            </div>
          </div>
          
          {/* Email Preview */}
          <div style={{
            background: '#F9FAFB',
            border: `1px solid ${colors.lightGray}`,
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Subject Line:</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>
                {item.subject}
              </div>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Preview Text:</div>
              <p style={{ color: colors.primary, margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
                {item.previewText}
              </p>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Content Preview:</div>
              <p style={{ color: '#777', margin: 0, fontSize: '13px', lineHeight: '1.4' }}>
                {item.content.substring(0, 200)}...
              </p>
            </div>
          </div>
          
          {/* Metadata */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#666' }}>
            <span>📧 {item.content.length} characters</span>
            <span>🎯 CTA: {item.cta}</span>
            <span>⏱️ {item.triggerDelay}</span>
            <span>📅 {new Date(item.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Feedback */}
          {item.feedback && (
            <div style={{
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              fontSize: '13px',
              color: '#92400E'
            }}>
              <strong>Revision Request:</strong> {item.feedback}
            </div>
          )}
        </div>
        
        <StatusBadge status={item.status} />
      </div>

      {/* Action Buttons */}
      {item.status === 'pending' && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: `1px solid ${colors.lightGray}`
        }}>
          <button
            onClick={() => onApprove(item.id)}
            style={{
              background: colors.success,
              color: colors.white,
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            ✅ Approve
          </button>
          <button
            onClick={() => onReject(item.id)}
            style={{
              background: colors.white,
              color: colors.danger,
              border: `2px solid ${colors.danger}`,
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.danger;
              e.target.style.color = colors.white;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = colors.white;
              e.target.style.color = colors.danger;
            }}
          >
            ✏️ Request Changes
          </button>
          <button
            style={{
              background: colors.white,
              color: '#666',
              border: `2px solid ${colors.lightGray}`,
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#999';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = colors.lightGray;
            }}
          >
            👁️ Preview
          </button>
        </div>
      )}
    </div>
  );
};

// Sequence Progress Component
const SequenceProgress = ({ emails }) => {
  const totalEmails = emails.length;
  const approvedEmails = emails.filter(e => e.status === 'approved').length;
  const pendingEmails = emails.filter(e => e.status === 'pending').length;
  const rejectedEmails = emails.filter(e => e.status === 'rejected').length;

  const progressPercentage = (approvedEmails / totalEmails) * 100;
  const isSequenceReady = approvedEmails === totalEmails;

  return (
    <div style={{
      background: colors.white,
      border: `1px solid ${colors.lightGray}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.primary, marginBottom: '16px' }}>
        📧 Email Sequence Progress
      </h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>Automation Readiness</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>
            {approvedEmails}/{totalEmails} emails approved
          </span>
        </div>
        <div style={{ width: '100%', height: '12px', background: colors.lightGray, borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{
            width: `${progressPercentage}%`,
            height: '100%',
            background: isSequenceReady ? colors.success : colors.warning,
            borderRadius: '6px',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.success }}>{approvedEmails}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Approved</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.warning }}>{pendingEmails}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Pending</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: colors.danger }}>{rejectedEmails}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>Revisions</div>
        </div>
      </div>

      {isSequenceReady ? (
        <div style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>🚀</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.success }}>
              Sequence Ready for Automation!
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              All emails approved and ready to be set up in your email platform
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>⏳</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.warning }}>
              {pendingEmails + rejectedEmails} emails need attention
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Approve all emails to activate the automated sequence
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main EmailSequenceTab component
const EmailSequenceTab = ({ 
  businessName = "Sample Business",
  location = "Eagle Mountain, UT",
  content = [],
  onApprove = () => {},
  onReject = () => {},
  onBulkApprove = () => {}
}) => {
  const [filter, setFilter] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate mock email sequence content
  const generateMockEmailContent = () => {
    const emailSequence = [
      {
        id: 'email-1',
        emailType: 'Welcome Email',
        triggerDescription: 'Sent immediately after form submission',
        triggerDelay: 'Immediately',
        subject: `Welcome to ${businessName}! Your Free Consultation Awaits`,
        previewText: 'Thank you for your interest in transforming your space...',
        content: `Hi there!\n\nThank you for reaching out to ${businessName}. We're excited about the opportunity to help transform your space into something truly special.\n\nAs ${location.split(',')[0]}'s premier home improvement contractor, we've helped hundreds of families create the homes of their dreams...`,
        cta: 'Schedule Free Consultation',
        status: 'approved'
      },
      {
        id: 'email-2',
        emailType: 'Educational Content',
        triggerDescription: 'Sent 2 days after welcome email',
        triggerDelay: '2 days',
        subject: '5 Things to Consider Before Starting Your Home Renovation',
        previewText: 'Avoid costly mistakes with these expert tips...',
        content: `Planning a home renovation project? Here are 5 crucial things you should consider before breaking ground:\n\n1. Set a realistic budget (and add 20% for unexpected costs)\n2. Obtain proper permits\n3. Choose the right contractor...`,
        cta: 'Download Planning Guide',
        status: 'pending'
      },
      {
        id: 'email-3',
        emailType: 'Social Proof',
        triggerDescription: 'Sent 5 days after welcome email',
        triggerDelay: '5 days',
        subject: 'See How We Transformed Sarah\'s Basement in Eagle Mountain',
        previewText: 'From dark storage space to family entertainment center...',
        content: `Meet Sarah from ${location.split(',')[0]}. Like many homeowners, she had a basement that was just collecting dust and storage boxes.\n\nAfter working with our team, her basement became the heart of her home...`,
        cta: 'View Project Gallery',
        status: 'pending'
      },
      {
        id: 'email-4',
        emailType: 'Limited Time Offer',
        triggerDescription: 'Sent 7 days after welcome email',
        triggerDelay: '7 days',
        subject: 'Limited Time: Free Design Consultation (Save $500)',
        previewText: 'This month only - complimentary design consultation...',
        content: `This month only, we're offering a complimentary design consultation worth $500 to new clients.\n\nDuring this consultation, our design team will:\n- Create initial concept sketches\n- Provide material recommendations...`,
        cta: 'Claim Free Consultation',
        status: 'rejected',
        feedback: 'The urgency feels too pushy. Can we make this more consultative and less sales-heavy?'
      },
      {
        id: 'email-5',
        emailType: 'Final Follow-up',
        triggerDescription: 'Sent 14 days after welcome email',
        triggerDelay: '14 days',
        subject: 'Ready to Start Your Project? We\'re Here to Help',
        previewText: 'No pressure - just here when you\'re ready...',
        content: `Hi again!\n\nWe know choosing the right contractor for your home improvement project is a big decision. There's no rush - we're here when you're ready.\n\nIf you have any questions about the process...`,
        cta: 'Ask a Question',
        status: 'pending'
      }
    ];

    return emailSequence.map((email, index) => ({
      ...email,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      sequencePosition: index + 1
    }));
  };

  const [emailContent, setEmailContent] = useState([]);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setEmailContent(content.length > 0 ? content.filter(c => c.type === 'email') : generateMockEmailContent());
      setLoading(false);
    }, 500);
  }, [content]);

  const filteredContent = emailContent.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const handleToggleSelect = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBulkApprove = () => {
    const updatedContent = emailContent.map(item => 
      selectedItems.includes(item.id) ? { ...item, status: 'approved' } : item
    );
    setEmailContent(updatedContent);
    setSelectedItems([]);
    onBulkApprove(selectedItems);
  };

  const handleApprove = (itemId) => {
    const updatedContent = emailContent.map(item => 
      item.id === itemId ? { ...item, status: 'approved' } : item
    );
    setEmailContent(updatedContent);
    onApprove(itemId);
  };

  const handleReject = (itemId) => {
    // In real implementation, this would open a feedback modal
    const feedback = prompt('Please provide feedback for revision:');
    if (feedback) {
      const updatedContent = emailContent.map(item => 
        item.id === itemId ? { ...item, status: 'rejected', feedback } : item
      );
      setEmailContent(updatedContent);
      onReject(itemId, feedback);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `4px solid ${colors.primary}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }} />
        <p style={{ color: colors.primary }}>Loading email sequence...</p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Sequence Progress */}
      <SequenceProgress emails={emailContent} />

      {/* Bulk Actions Bar */}
      {selectedItems.length > 0 && (
        <div style={{
          background: colors.primary,
          color: colors.white,
          padding: '16px 20px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: '600' }}>
            {selectedItems.length} emails selected
          </span>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleBulkApprove}
              style={{
                background: colors.success,
                color: colors.white,
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Approve All Selected
            </button>
            <button
              onClick={() => setSelectedItems([])}
              style={{
                background: 'transparent',
                color: colors.white,
                border: `1px solid ${colors.white}`,
                padding: '8px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div style={{
        background: colors.white,
        border: `1px solid ${colors.lightGray}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: filter === 'all' ? colors.primary : colors.lightGray,
            color: filter === 'all' ? colors.white : '#666',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          All Emails ({emailContent.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: filter === 'pending' ? colors.warning : colors.lightGray,
            color: filter === 'pending' ? colors.white : '#666',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Pending ({emailContent.filter(c => c.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: filter === 'approved' ? colors.success : colors.lightGray,
            color: filter === 'approved' ? colors.white : '#666',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Approved ({emailContent.filter(c => c.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: filter === 'rejected' ? colors.danger : colors.lightGray,
            color: filter === 'rejected' ? colors.white : '#666',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Needs Revision ({emailContent.filter(c => c.status === 'rejected').length})
        </button>
      </div>

      {/* Content List */}
      {filteredContent.map((item, index) => (
        <EmailContentCard 
          key={item.id} 
          item={item}
          sequencePosition={item.sequencePosition}
          isSelected={selectedItems.includes(item.id)}
          onToggleSelect={() => handleToggleSelect(item.id)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}

      {filteredContent.length === 0 && (
        <div style={{
          background: colors.white,
          border: `1px solid ${colors.lightGray}`,
          borderRadius: '12px',
          padding: '60px 20px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#666', fontSize: '16px' }}>
            No {filter !== 'all' ? filter : ''} emails found.
          </p>
        </div>
      )}

      {/* Sequence Information */}
      <div style={{
        background: '#EBF8FF',
        border: '1px solid #BEE3F8',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '32px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: colors.info, marginBottom: '12px' }}>
          📚 About This Email Sequence
        </h3>
        <p style={{ color: colors.primary, marginBottom: '16px' }}>
          This 5-email nurture sequence is designed to convert website visitors into qualified leads and ultimately customers.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Sequence Duration:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>14 days total</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Target Audience:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Website form submissions</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Expected Conversion:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>15-25% to consultation</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: colors.primary }}>Integration:</div>
            <div style={{ fontSize: '13px', color: '#666' }}>Ready for automation</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo wrapper
const EmailSequenceTabDemo = () => {
  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      minHeight: "100vh",
      background: "#f8fafc",
    }}>
      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <h1>✉️ Email Sequence Tab Component</h1>
        <p style={{ opacity: 0.8 }}>Email campaign approval workflow with sequence tracking</p>
      </div>

      <EmailSequenceTab 
        businessName="Eagle Mountain Remodeling"
        location="Eagle Mountain, UT"
        onApprove={(id) => console.log('Approved:', id)}
        onReject={(id, feedback) => console.log('Rejected:', id, feedback)}
        onBulkApprove={(ids) => console.log('Bulk approved:', ids)}
      />

      <div style={{
        background: colors.primary,
        color: colors.white,
        padding: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "14px", opacity: "0.8" }}>
          Ready for: src/dashboards/ClientDashboard/tabs/EmailSequenceTab.jsx
        </div>
      </div>
    </div>
  );
};

export default EmailSequenceTab;