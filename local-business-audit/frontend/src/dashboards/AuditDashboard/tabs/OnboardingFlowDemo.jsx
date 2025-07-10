import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const OnboardingFlowDemo = () => {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  // Get business info from session (from audit)
  const auditData = JSON.parse(sessionStorage.getItem('auditResults') || '{}');
  const businessInfo = JSON.parse(sessionStorage.getItem('businessInfo') || '{}');
  
  // Check if we have audit data
  const hasAuditData = businessInfo.businessName && businessInfo.businessName !== '';

  // Build dynamic questions based on whether we have audit data
  const buildQuestions = () => {
    const questions = [];
    
    // Welcome message changes based on audit data
    if (hasAuditData) {
      questions.push({
        id: 'welcome',
        type: 'message',
        text: `Hi ${businessInfo.contactInfo?.firstName || 'there'}! 👋 I'm Sarah, your AI content strategist. I see you just completed an audit for ${businessInfo.businessName} in ${businessInfo.location || 'your area'}.`,
        followUp: "Let me confirm a few details before we dive into creating content that brings in real customers. Ready?",
        skipInput: true,
        options: ["Let's do this! 🚀", "I'm ready"]
      });

      // Confirm business name and type
      if (businessInfo.businessName && businessInfo.businessType) {
        questions.push({
          id: 'confirm_business',
          type: 'message',
          text: `Your business: ${businessInfo.businessName} (${businessInfo.businessType})`,
          followUp: "Is this correct?",
          skipInput: true,
          options: ["✅ Yes, that's correct", "✏️ Let me update this"],
          handleOption: (option) => {
            if (option === "✏️ Let me update this") {
              return {
                id: 'update_business',
                type: 'question',
                text: "What's the correct business name and type?",
                placeholder: "E.g., Smith Plumbing - Licensed Plumber",
                validation: (a) => a.length > 5,
                errorMessage: "Please enter your business name and type."
              };
            }
            return null;
          }
        });
      }

      // Confirm services
      if (businessInfo.primaryServices || auditData.data?.primaryServices) {
        const services = businessInfo.primaryServices || auditData.data?.primaryServices;
        questions.push({
          id: 'confirm_services',
          type: 'message',
          text: `Your primary services: ${services}`,
          followUp: "Is this complete and accurate?",
          skipInput: true,
          options: ["✅ Yes, exactly right", "✏️ I need to update this"],
          handleOption: (option) => {
            if (option === "✏️ I need to update this") {
              return {
                id: 'update_services',
                type: 'question',
                text: "Please list all your services, especially the most profitable ones:",
                placeholder: "E.g., Kitchen remodeling (biggest revenue), bathroom finishing, custom carpentry...",
                validation: (a) => a.length > 20,
                errorMessage: "Please list your services."
              };
            }
            return null;
          }
        });
      }

      // Confirm location/service area
      if (businessInfo.location || businessInfo.serviceAreas) {
        questions.push({
          id: 'confirm_location',
          type: 'message',
          text: `Location: ${businessInfo.location || 'Not specified'}\nService areas: ${businessInfo.serviceAreas || auditData.data?.serviceAreas || 'Not specified'}`,
          followUp: "Are these your complete service areas?",
          skipInput: true,
          options: ["✅ That's complete", "➕ Add more areas", "✏️ Update all areas"],
          handleOption: (option) => {
            if (option === "➕ Add more areas" || option === "✏️ Update all areas") {
              return {
                id: 'update_areas',
                type: 'question',
                text: "What areas do you serve? List all cities/regions:",
                placeholder: "E.g., Based in Denver, serving Lakewood, Aurora, and Littleton within 25 miles...",
                validation: (a) => a.length > 10,
                errorMessage: "Please list your service areas."
              };
            }
            return null;
          }
        });
      }

      // Confirm marketing goals/challenges
      if (businessInfo.primaryGoal || businessInfo.marketingChallenges) {
        const challenges = Array.isArray(businessInfo.marketingChallenges) 
          ? businessInfo.marketingChallenges.join(', ') 
          : 'Not specified';
        
        questions.push({
          id: 'confirm_goals',
          type: 'message',
          text: `Your main goal: ${businessInfo.primaryGoal || 'Not specified'}\n\nTop challenges:\n${challenges}`,
          followUp: "Does this still reflect your priorities?",
          skipInput: true,
          options: ["✅ Yes, exactly", "🔄 My priorities have changed"]
        });
      }
    } else {
      // No audit data - start fresh
      questions.push({
        id: 'welcome',
        type: 'message',
        text: `Hi there! 👋 I'm Sarah, your AI content strategist. I'm going to ask you a few questions about your business to create content that brings in real customers.`,
        followUp: "This will take 5–7 minutes. Ready to start?",
        skipInput: true,
        options: ["Let's do this! 🚀", "I'm ready"]
      });

      // Ask for business basics if we don't have them
      questions.push({
        id: 'business_basics',
        type: 'question',
        text: "First, what's your business name and what type of work do you do?",
        placeholder: "E.g., ABC Plumbing - We're licensed plumbers specializing in residential repairs",
        validation: (a) => a.length > 10,
        errorMessage: "Please tell us your business name and type."
      });

      questions.push({
        id: 'services_offered',
        type: 'question',
        text: "What services do you offer, and which ones bring in the most revenue?",
        placeholder: "E.g., Emergency plumbing (biggest revenue), water heater install, drain cleaning...",
        validation: (a) => a.length > 20,
        errorMessage: "Please list your main services."
      });

      questions.push({
        id: 'service_area',
        type: 'question',
        text: "What city are you based in, and which surrounding areas do you serve?",
        placeholder: "E.g., Based in Denver, serving Lakewood, Aurora, and Littleton within 25 miles...",
        validation: (a) => a.length > 10,
        errorMessage: "Please enter your city and service areas."
      });
    }

    // Now add the core content questions (same for everyone)
    
    // 🎯 CUSTOMER REALITY (PAIN POINTS)
    questions.push({
      id: 'customer_type',
      type: 'question',
      text: "Who are your *actual* customers? What kind of people call you most often?",
      placeholder: "E.g., Busy parents with plumbing emergencies, retired homeowners doing renovations, property managers...",
      validation: (a) => a.length > 20,
      errorMessage: "Please describe your typical customers in more detail."
    });

    questions.push({
      id: 'top_problems',
      type: 'question',
      text: "What are the top 5–10 problems your customers are dealing with when they call you?",
      placeholder: "E.g., 1) Toilet won't stop running, 2) No hot water, 3) Basement flooding, 4) Clogged drain, 5) Water bill too high...",
      validation: (a) => a.length > 50,
      errorMessage: "Please list at least 5 specific problems customers have."
    });

    questions.push({
      id: 'why_you',
      type: 'question',
      text: "Why do people choose YOU instead of calling someone cheaper or trying DIY?",
      placeholder: "E.g., We answer the phone 24/7, show up on time, explain everything clearly, no surprise charges, clean up completely...",
      validation: (a) => a.length > 30,
      errorMessage: "Please explain what customers say about why they chose you."
    });

    // 🧠 BUSINESS POSITIONING
    questions.push({
      id: 'common_questions',
      type: 'question',
      text: "What do potential customers ALWAYS ask before hiring you? List 3–5 questions.",
      placeholder: "E.g., How much will this cost? Can you come today? Do you warranty your work? Are you licensed?",
      validation: (a) => a.length > 30,
      errorMessage: "Please list at least 3 common customer questions."
    });

    questions.push({
      id: 'misunderstandings',
      type: 'question',
      text: "What do customers usually MISUNDERSTAND about your service or pricing?",
      placeholder: "E.g., They think all plumbers charge the same, or that the cheapest quote is the best deal, or that permits aren't necessary...",
      validation: (a) => a.length > 30,
      errorMessage: "Please share at least one common misconception."
    });

    // 📖 MEMORABLE PROJECT (Better than "best story")
    questions.push({
      id: 'memorable_project_intro',
      type: 'message',
      text: "Let's talk about a real project that shows what you're all about.",
      followUp: "Think of a job that was memorable - maybe challenging, emotional, or had a great outcome.",
      skipInput: true,
      options: ["Got one in mind 💭"]
    });

    questions.push({
      id: 'memorable_project',
      type: 'question',
      text: "What made this project memorable? Don't worry about it being 'perfect' - just real.",
      placeholder: "E.g., Single mom's water heater died before her daughter's birthday party. We rushed over, installed a new one same day. She was so relieved she almost cried.",
      validation: (a) => a.length > 50,
      errorMessage: "Please share more details about what made this project memorable."
    });

    questions.push({
      id: 'project_before_after',
      type: 'question',
      text: "What was the situation BEFORE you arrived vs AFTER you finished?",
      placeholder: "E.g., BEFORE: No hot water for 3 days, kids couldn't bathe, mom stressed. AFTER: Hot water working, mom relaxed, kids happy, plus we showed her how to maintain it.",
      validation: (a) => a.length > 40,
      errorMessage: "Try describing the before and after transformation."
    });

    // 🚀 PSO FRAMEWORK QUESTIONS
    questions.push({
      id: 'pso_intro',
      type: 'message',
      text: "Great stories! Now let's get specific about content that converts visitors into calls.",
      followUp: "I need to understand exactly how you solve urgent problems.",
      skipInput: true,
      options: ["Let's continue"]
    });

    questions.push({
      id: 'urgent_problems',
      type: 'question',
      text: "List 5-10 URGENT problems that make people call you RIGHT NOW (not next week):",
      placeholder: "E.g., 1) Toilet overflowing, 2) No heat in winter, 3) Pipe burst, 4) Sewage backup, 5) No hot water, 6) Electrical sparking...",
      validation: (a) => a.length > 50,
      errorMessage: "Please list at least 5 urgent problems that can't wait."
    });

    questions.push({
      id: 'solution_speed',
      type: 'question',
      text: "For those urgent problems - what exactly do you do to solve them FAST?",
      placeholder: "E.g., Answer phones 24/7, arrive within 2 hours, stock common parts on truck, can do temporary fixes to stop damage...",
      validation: (a) => a.length > 30,
      errorMessage: "Tell us specifically how you handle urgent calls."
    });

    questions.push({
      id: 'easy_next_step',
      type: 'question',
      text: "When someone finds you online with an urgent problem, what's the EASIEST way to reach you?",
      placeholder: "E.g., Call or text 24/7, send photos for quick quote, online booking for non-emergency, emergency hotline...",
      validation: (a) => a.length > 20,
      errorMessage: "Please describe how customers can easily contact you."
    });

    questions.push({
      id: 'emergency_vs_planned',
      type: 'question',
      text: "What % of your work is emergency/urgent vs planned projects?",
      placeholder: "E.g., 70% emergency repairs, 30% planned renovations",
      validation: (a) => a.length > 5,
      errorMessage: "Please estimate the split (e.g., 60/40)."
    });

    // 🎨 CONTENT PREFERENCES
    questions.push({
      id: 'educational_topics',
      type: 'question',
      text: "If you could teach customers ONE thing to save them money/hassle, what would it be?",
      placeholder: "E.g., How to shut off water in emergency, why annual maintenance matters, signs your water heater is dying...",
      validation: (a) => a.length > 20,
      errorMessage: "Please share one important tip for customers."
    });

    questions.push({
      id: 'tone',
      type: 'message',
      text: "Perfect! Last question: How should your content sound?",
      followUp: "Pick the tone that matches how you talk to customers:",
      skipInput: true,
      options: [
        "Professional & Authoritative 👔",
        "Friendly & Approachable 😊",
        "Expert but Down-to-Earth 🤝",
        "Casual & Conversational 💬"
      ]
    });

    // ✅ CLOSING
    questions.push({
      id: 'complete',
      type: 'message',
      text: `Excellent work${businessInfo.contactInfo?.firstName ? ', ' + businessInfo.contactInfo.firstName : ''}! I have everything I need.`,
      followUp: `We'll create content that shows ${businessInfo.businessName || 'your business'} as THE obvious choice when people need help. Your content library will be ready within 24 hours!`,
      skipInput: true,
      isFinal: true
    });

    return questions;
  };

  const questions = buildQuestions();

  // Colors matching your brand
  const colors = {
    primary: "#2A3B4A",
    secondary: "#10B981",
    white: "#FFFFFF",
    gray: "#F3F4F6",
    lightGray: "#E5E7EB",
    text: "#1F2937",
    textLight: "#6B7280",
  };

  useEffect(() => {
    // Start with welcome message
    const firstQuestion = questions[0];
    setMessages([{
      type: 'ai',
      text: firstQuestion.text,
      followUp: firstQuestion.followUp,
      options: firstQuestion.options
    }]);
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() && !questions[currentQuestion].skipInput) return;

    const question = questions[currentQuestion];
    
    // Validate input if required
    if (question.validation && !question.validation(inputValue)) {
      alert(question.errorMessage);
      return;
    }

    // Add user message
    const newMessages = [...messages, {
      type: 'user',
      text: inputValue
    }];
    setMessages(newMessages);

    // Store response
    const newResponses = {
      ...responses,
      [question.id]: inputValue
    };
    setResponses(newResponses);

    // Clear input
    setInputValue('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate AI typing delay
    setTimeout(() => {
      setIsTyping(false);
      
      // Handle dynamic questions (for confirmations that lead to updates)
      if (question.handleOption && question.handleOption(inputValue)) {
        const dynamicQuestion = question.handleOption(inputValue);
        setMessages([...newMessages, {
          type: 'ai',
          text: dynamicQuestion.text,
          placeholder: dynamicQuestion.placeholder
        }]);
        // Don't advance the question counter, we're inserting a dynamic question
        return;
      }
      
      // Move to next question
      const nextIndex = currentQuestion + 1;
      if (nextIndex < questions.length) {
        const nextQuestion = questions[nextIndex];
        setCurrentQuestion(nextIndex);
        
        // Add AI message
        setMessages([...newMessages, {
          type: 'ai',
          text: nextQuestion.text,
          followUp: nextQuestion.followUp,
          options: nextQuestion.options
        }]);

        // Check if this is the final message
        if (nextQuestion.isFinal) {
          setIsComplete(true);
          saveAndProceed(newResponses);
        }
      }
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleOptionClick = (option) => {
    setInputValue(option);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const saveAndProceed = (allResponses) => {
    // Combine audit data with new responses
    const onboardingData = {
      auditData: auditData.data || {},
      businessInfo,
      responses: allResponses,
      completedAt: new Date().toISOString()
    };
    
    sessionStorage.setItem('onboardingData', JSON.stringify(onboardingData));
    
    // In real app, send to backend/GHL here
    console.log('Onboarding complete:', onboardingData);
    
    // Redirect to review page or dashboard
    setTimeout(() => {
      // If you have the review page set up:
      // navigate('/onboarding-review');
      // Otherwise:
      navigate('/dashboard');
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Calculate progress including dynamic questions
  const totalQuestions = questions.filter(q => q.type === 'question').length;
  const answeredQuestions = Object.keys(responses).filter(key => 
    questions.find(q => q.id === key && q.type === 'question')
  ).length;
  const progress = Math.round((answeredQuestions / totalQuestions) * 100);

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.gray,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        background: colors.white,
        borderBottom: `1px solid ${colors.lightGray}`,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: colors.primary,
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: colors.white,
            fontWeight: 'bold',
            fontSize: '18px',
          }}>
            B
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: '700',
              color: colors.text 
            }}>
              AI Content Interview
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: colors.textLight 
            }}>
              {hasAuditData ? 'Personalizing for ' + businessInfo.businessName : 'Creating your content strategy'}
            </p>
          </div>
        </div>
        
        {/* Progress indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          color: colors.textLight,
        }}>
          <span>{progress}% Complete</span>
          <div style={{
            width: '100px',
            height: '6px',
            background: colors.lightGray,
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: colors.secondary,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        maxWidth: '800px',
        width: '100%',
        margin: '0 auto',
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div style={{
              maxWidth: '70%',
              background: message.type === 'user' ? colors.primary : colors.white,
              color: message.type === 'user' ? colors.white : colors.text,
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}>
              <p style={{ margin: 0, lineHeight: '1.5', whiteSpace: 'pre-line' }}>{message.text}</p>
              
              {message.followUp && (
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '14px',
                  opacity: 0.9,
                  whiteSpace: 'pre-line'
                }}>
                  {message.followUp}
                </p>
              )}
              
              {message.placeholder && (
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '13px',
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}>
                  {message.placeholder}
                </p>
              )}
              
              {message.options && (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '12px',
                }}>
                  {message.options.map((option, optIndex) => (
                    <button
                      key={optIndex}
                      onClick={() => handleOptionClick(option)}
                      style={{
                        background: colors.gray,
                        color: colors.text,
                        border: `1px solid ${colors.lightGray}`,
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = colors.secondary;
                        e.target.style.color = colors.white;
                        e.target.style.borderColor = colors.secondary;
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = colors.gray;
                        e.target.style.color = colors.text;
                        e.target.style.borderColor = colors.lightGray;
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: colors.textLight,
            fontSize: '14px',
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              <span style={{ animation: 'bounce 1.4s infinite' }}>•</span>
              <span style={{ animation: 'bounce 1.4s infinite 0.2s' }}>•</span>
              <span style={{ animation: 'bounce 1.4s infinite 0.4s' }}>•</span>
            </div>
            Sarah is typing...
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete && !questions[currentQuestion]?.skipInput && (
        <div style={{
          background: colors.white,
          borderTop: `1px solid ${colors.lightGray}`,
          padding: '20px',
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            gap: '12px',
          }}>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={questions[currentQuestion]?.placeholder || "Type your answer here..."}
              style={{
                flex: 1,
                padding: '12px',
                border: `1px solid ${colors.lightGray}`,
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'none',
                minHeight: '60px',
                maxHeight: '120px',
                fontFamily: 'inherit',
              }}
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={{
                background: inputValue.trim() ? colors.secondary : colors.lightGray,
                color: colors.white,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
              }}
            >
              Send →
            </button>
          </div>
        </div>
      )}

      {/* Completion State */}
      {isComplete && (
        <div style={{
          background: colors.white,
          borderTop: `1px solid ${colors.lightGray}`,
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto',
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px',
            }}>
              🎉
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: colors.text,
              marginBottom: '8px',
            }}>
              Interview Complete!
            </h2>
            <p style={{
              fontSize: '16px',
              color: colors.textLight,
              marginBottom: '20px',
            }}>
              We're creating your personalized content library...
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: colors.secondary,
              fontSize: '14px',
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: `2px solid ${colors.secondary}`,
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              Redirecting to your dashboard...
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-10px); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OnboardingFlowDemo;