import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Trash2 } from 'lucide-react';
import { generateChatResponse } from '../utils/chatbot';

export const Chatbot = ({ dashboardData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [{ role: 'assistant', content: 'Hello! I am your dashboard AI. Ask me anything about the ISS or the latest news.' }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages.slice(-30)));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const responseText = await generateChatResponse(userMsg.content, dashboardData, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error connecting to my brain. Please ensure VITE_AI_TOKEN is set correctly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: 'Chat history cleared. How can I help you today?' }]);
  };

  return (
    <>
      <button 
        className="chat-fab"
        style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', 
          width: '60px', height: '60px', borderRadius: '30px', 
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.3s'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {isOpen && (
        <div className="chat-window" style={{ 
          position: 'fixed', bottom: '6rem', right: '2rem', 
          width: '350px', height: '500px', 
          background: 'var(--bg-secondary)', borderRadius: '20px',
          zIndex: 100,
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <div className="chat-header" style={{ 
            padding: '1.25rem 1rem', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} /> Dashboard AI
            </h3>
            <button className="btn-icon" style={{ color: 'white' }} onClick={clearChat} title="Clear Chat">
              <Trash2 size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ 
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '0.75rem 1rem', borderRadius: '12px',
                maxWidth: '85%', fontSize: '0.9rem',
                borderBottomRightRadius: msg.role === 'user' ? 0 : '12px',
                borderBottomLeftRadius: msg.role === 'assistant' ? 0 : '12px',
              }}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={{ 
                alignSelf: 'flex-start', background: 'var(--bg-primary)', 
                padding: '0.75rem 1rem', borderRadius: '12px',
                borderBottomLeftRadius: 0, display: 'flex', gap: '4px'
              }}>
                <span className="typing-dot" style={{ animation: 'bounce 1s infinite' }}>.</span>
                <span className="typing-dot" style={{ animation: 'bounce 1s infinite 0.2s' }}>.</span>
                <span className="typing-dot" style={{ animation: 'bounce 1s infinite 0.4s' }}>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about ISS or News..."
              style={{ 
                flex: 1, padding: '0.75rem', borderRadius: '8px', 
                border: '1px solid var(--border-color)', background: 'var(--bg-primary)',
                color: 'var(--text-primary)', outline: 'none'
              }}
            />
            <button className="btn btn-primary" style={{ padding: '0.75rem' }} onClick={handleSend}>
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}} />
    </>
  );
};
