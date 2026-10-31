import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  Sparkles,
  ShieldAlert,
  User,
  ArrowRight,
  ExternalLink,
  Info,
  Clock,
  Package,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { EvidenceDrawer } from '../components/EvidenceDrawer';

const INITIAL_MESSAGE = {
  id: 'intro',
  role: 'assistant',
  content:
    "Hello! Welcome to ZentroMart. I'm your AI support assistant. I can help you with orders, deliveries, returns, refunds and more. How may I help you today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  sources: [],
};

const SAMPLE_QUERIES = [
  'What is your return policy for open-box electronics?',
  'Can I return an item after 10 days?',
  'Check status for order ORD-1002',
  'What is the delivery cutoff for Bangalore (560001)?',
];

export function AISupport({ onNavigateToVoice }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load prior sessions if any
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const hist = await api.getChatHistory();
        if (hist && hist.sessions) {
          setConversationHistory(hist.sessions);
        }
      } catch (err) {
        // graceful silent fallback
      }
    };
    loadHistory();
  }, []);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || isTyping) return;

    setErrorBanner(null);
    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Build conversation context
      const chatContext = messages
        .filter((m) => m.id !== 'intro')
        .map((m) => ({ role: m.role, content: m.content }));
      chatContext.push({ role: 'user', content: text });

      const response = await api.sendChatMessage({
        message: text,
        context: chatContext,
        session_id: activeSessionId,
      });

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response.reply || response.content || 'I have checked our system records.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.sources || [],
        order_info: response.order_info || null,
        ticket_info: response.ticket_info || null,
        tool_calls: response.tool_calls || [],
        escalated: response.escalated || false,
      };

      if (response.session_id) {
        setActiveSessionId(response.session_id);
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorBanner(err.message || 'Unable to connect to AI Support engine.');
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            "I'm experiencing a momentary connection issue with the central knowledge service. Please try again or rephrase your request.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewConversation = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveSessionId(null);
    setErrorBanner(null);
  };

  const handleClearConversation = () => {
    if (window.confirm('Clear current conversation history?')) {
      handleNewConversation();
    }
  };

  const handleRegenerate = () => {
    if (messages.length < 2) return;
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;
    const actualIndex = messages.length - 1 - lastUserIndex;
    const lastUserMsg = messages[actualIndex];
    setMessages((prev) => prev.slice(0, actualIndex));
    handleSendMessage(lastUserMsg.content);
  };

  return (
    <div
      style={{
        display: 'flex',
        height: 'calc(100vh - 70px)',
        backgroundColor: 'var(--light-bg)',
      }}
    >
      {/* Left Session Drawer / Quick Reference */}
      <div
        style={{
          width: '280px',
          borderRight: '1px solid var(--border-light)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.25rem 1rem',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleNewConversation}
          className="btn-primary"
          style={{ width: '100%', marginBottom: '1.25rem' }}
        >
          <Plus size={16} />
          <span>New Conversation</span>
        </button>

        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
          Suggested Inquiries
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              style={{
                textAlign: 'left',
                padding: '0.6rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--light-bg)',
                border: '1px solid var(--border-light)',
                fontSize: '0.78rem',
                color: 'var(--body-text)',
                lineHeight: 1.35,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--soft-violet-subtle)';
                e.currentTarget.style.borderColor = 'var(--soft-violet)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--light-bg)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={14} color="#723ECF" />
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
              Policy Precedence Active
            </span>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted-text)', lineHeight: 1.4 }}>
            Grounding priority: Current policies (v4) &gt; Agent guides &gt; Help docs &gt; FAQs.
          </p>
        </div>
      </div>

      {/* Main Conversational Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Chat Header Actions */}
        <div
          style={{
            height: '48px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#21865B' }} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
              ZentroMart Intelligence Assistant
            </span>
            <span className="badge badge-violet" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
              Multi-Turn RAG
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {messages.length > 1 && (
              <>
                <button
                  onClick={handleRegenerate}
                  className="btn-ghost"
                  title="Regenerate last response"
                  style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                >
                  <RotateCcw size={13} />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={handleClearConversation}
                  className="btn-ghost"
                  title="Clear conversation"
                  style={{ fontSize: '0.76rem', padding: '4px 8px' }}
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error Banner if any */}
        {errorBanner && (
          <div
            style={{
              padding: '0.65rem 1.5rem',
              backgroundColor: 'var(--error-subtle)',
              borderBottom: '1px solid rgba(201, 76, 89, 0.2)',
              color: 'var(--error)',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldAlert size={15} />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '850px',
                  width: '100%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Speaker Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    marginBottom: '0.35rem',
                    fontSize: '0.72rem',
                    color: 'var(--muted-text)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: isUser ? 'var(--primary-indigo)' : '#723ECF' }}>
                    {isUser ? 'Customer' : 'ZentroMart Assistant'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Bubble Container */}
                <div
                  style={{
                    backgroundColor: isUser ? '#17143F' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--body-text)',
                    padding: '1rem 1.25rem',
                    borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    border: isUser ? 'none' : '1px solid var(--border-light)',
                    boxShadow: isUser ? '0 4px 14px rgba(23, 20, 63, 0.2)' : 'var(--shadow-xs)',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    maxWidth: '100%',
                    position: 'relative',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                  {/* Order verification / lookup banner if attached */}
                  {msg.order_info && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--light-bg)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        color: 'var(--body-text)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary-indigo)', fontSize: '0.8rem' }}>
                          Order #{msg.order_info.order_id} Verified
                        </span>
                        <span className="badge badge-success">Authenticated</span>
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--muted-text)' }}>
                        Status: <strong>{msg.order_info.status}</strong> • Expected: {msg.order_info.delivery_date || 'N/A'}
                      </div>
                    </div>
                  )}

                  {/* Support ticket escalation banner if ticket was created */}
                  {msg.ticket_info && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--warning-subtle)',
                        border: '1px solid rgba(214, 154, 53, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '0.8rem' }}>
                          Human Intervention Ticket Created #{msg.ticket_info.ticket_id}
                        </span>
                        <span className="badge badge-warning">Escalated</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--body-text)' }}>
                        {msg.ticket_info.summary}
                      </div>
                    </div>
                  )}

                  {/* Refined Expandable Evidence Drawer */}
                  {msg.sources && msg.sources.length > 0 && (
                    <EvidenceDrawer sources={msg.sources} />
                  )}

                  {/* Bubble Actions Footer */}
                  {!isUser && msg.id !== 'intro' && (
                    <div
                      style={{
                        marginTop: '0.65rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.35rem',
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: '0.45rem',
                      }}
                    >
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="btn-ghost"
                        style={{ fontSize: '0.72rem', padding: '2px 6px' }}
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check size={12} color="#21865B" /> : <Copy size={12} />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
              <div
                style={{
                  padding: '0.65rem 1rem',
                  borderRadius: '14px 14px 14px 2px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#723ECF',
                    animation: 'pulse-recording 1.2s infinite ease-in-out',
                  }}
                />
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#9D68FF',
                    animation: 'pulse-recording 1.2s 0.2s infinite ease-in-out',
                  }}
                />
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#CDC8DE',
                    animation: 'pulse-recording 1.2s 0.4s infinite ease-in-out',
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)', marginLeft: '6px' }}>
                  Retrieving policy evidence...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer Area */}
        <div
          style={{
            padding: '1rem 2rem 1.5rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--light-bg)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              padding: '0.35rem 0.5rem 0.35rem 1rem',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a customer support question (e.g. return window, order status)..."
              disabled={isTyping}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                padding: '0.5rem 0',
                fontSize: '0.92rem',
                color: 'var(--body-text)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <button
                type="button"
                onClick={onNavigateToVoice}
                title="Open Voice Studio (Gnani.ai Speech)"
                style={{
                  padding: '7px',
                  borderRadius: '6px',
                  color: 'var(--muted-text)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#723ECF')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-text)')}
              >
                <Mic size={17} />
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="btn-primary"
                style={{
                  padding: '0.55rem 0.95rem',
                  opacity: !inputText.trim() || isTyping ? 0.6 : 1,
                }}
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.45rem',
              fontSize: '0.72rem',
              color: 'var(--muted-text)',
            }}
          >
            <span>Ask one question at a time. The assistant cites official company policy documents.</span>
            <span>Customer verification enforced for order details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
