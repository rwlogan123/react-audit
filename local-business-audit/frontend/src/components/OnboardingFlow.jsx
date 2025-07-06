// frontend/src/components/OnboardingFlow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './OnboardingFlow.css'; // You'll need to create this

const OnboardingFlow = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Initialize conversation
    initializeConversation();
  }, [conversationId]);

  const initializeConversation = async () => {
    try {
      const response = await fetch(`/api/onboarding/start/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      const data = await response.json();
      setMessages([{
        role: 'assistant',
        content: data.welcomeMessage || "Hi! I'm your AI marketing assistant. I'm going to ask you a few questions about your business to create the perfect marketing strategy. This will take about 15-20 minutes. Ready to get started?"
      }]);
    } catch (error) {
      console.error('Error initializing conversation:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/onboarding/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          conversationId,
          message: userMessage
        })
      });

      const data = await response.json();
      
      // Add AI response
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);

      // Update progress
      setProgress(data.progress || 0);

      // Check if conversation is complete
      if (data.complete) {
        setConversationComplete(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I had trouble processing that. Could you please try again?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-flow">
      <div className="onboarding-container">
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-text">{progress}% Complete</p>
        </div>

        {/* Chat Interface */}
        <div className="chat-section">
          <div className="chat-header">
            <h2>Let's Build Your Marketing Strategy</h2>
            <p>Answer honestly - the better we understand your business, the better results you'll get</p>
          </div>

          <div className="messages-container">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.role}`}
              >
                {message.role === 'assistant' && (
                  <div className="avatar">🤖</div>
                )}
                <div className="message-content">
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message assistant">
                <div className="avatar">🤖</div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {conversationComplete && (
              <div className="completion-message">
                <h3>🎉 Excellent! We have everything we need.</h3>
                <p>Redirecting you to your dashboard...</p>
              </div>
            )}
          </div>

          {/* Input Form */}
          {!conversationComplete && (
            <form onSubmit={sendMessage} className="input-form">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your answer here..."
                disabled={isLoading}
                autoFocus
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isLoading}
              >
                Send
              </button>
            </form>
          )}
        </div>

        {/* Tips Sidebar */}
        <div className="tips-sidebar">
          <h3>💡 Tips for Best Results</h3>
          <ul>
            <li>Be specific about your target customers</li>
            <li>Share what makes you different from competitors</li>
            <li>Tell us about your biggest challenges</li>
            <li>Mention any seasonal trends in your business</li>
          </ul>

          <div className="support-box">
            <h4>Need Help?</h4>
            <p>Chat with support or call</p>
            <a href="tel:1-800-XXX-XXXX">1-800-XXX-XXXX</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow;