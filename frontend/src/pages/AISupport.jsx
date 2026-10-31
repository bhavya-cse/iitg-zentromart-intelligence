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
  ArrowRight,
  Info,
  Clock,
  Package,
  CheckCircle2,
  Lock,
  Unlock,
  Bot,
  User,
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
  'Can I return an opened pack of earbuds after 3 days?',
  'Check items and status for order ORD-1002',
  'What is the delivery cutoff for Bangalore (560001)?',
];

export function AISupport({ onNavigateToVoice }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [errorBanner, setErrorBanner] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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
        content: response.reply || response.content || 'I have checked our enterprise system records.',
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
    if (window.confirm('Clear current conversational session?')) {
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
      {/* Left Session Drawer / Prompt Catalog (Linear Style) */}
      <div
        className="chat-sidebar"
        style={{
          width: '310px',
          borderRight: '1px solid var(--border-card)',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem 1.25rem',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleNewConversation}
          className="btn-primary"
          style={{ width: '100%', marginBottom: '1.5rem', justifyContent: 'center' }}
        >
          <Plus size={16} />
          <span>New Support Session</span>
        </button>

        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--subtle-text)',
            marginBottom: '0.75rem',
          }}
        >
          Suggested Inquiries
        </span>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              style={{
                textAlign: 'left',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--light-bg)',
                border: '1px solid var(--border-light)',
                fontSize: '0.82rem',
                color: 'var(--primary-indigo)',
                lineHeight: 1.4,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--soft-violet-subtle)';
                e.currentTarget.style.borderColor = 'rgba(114, 62, 207, 0.3)';
                e.currentTarget.style.color = 'var(--accent-violet)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--light-bg)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--primary-indigo)';
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Corporate Precedence Notice Card */}
        <div
          style={{
            marginTop: 'auto',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--soft-violet-subtle)',
            border: '1px solid rgba(114, 62, 207, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <Sparkles size={14} color="#723ECF" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
              Policy Precedence Active
            </span>
          </div>
          <p style={{ fontSize: '0.72rem', color: 'var(--muted-text)', lineHeight: 1.5 }}>
            Grounding priority: Current policies (v4) &gt; Agent guides &gt; Help docs &gt; FAQs.
          </p>
        </div>
      </div>

      {/* Main Conversational Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {/* Chat Header Actions */}
        <div
          style={{
            height: '52px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid var(--border-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              className="pulse-indicator"
              style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--success)' }}
            />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
              ZentroMart Grounded Assistant
            </span>
            <span className="badge badge-violet" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
              Multi-Turn RAG v4
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {messages.length > 1 && (
              <>
                <button
                  onClick={handleRegenerate}
                  className="btn-ghost"
                  title="Regenerate last response"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
                >
                  <RotateCcw size={13} />
                  <span>Regenerate</span>
                </button>
                <button
                  onClick={handleClearConversation}
                  className="btn-ghost"
                  title="Clear conversation"
                  style={{ fontSize: '0.78rem', padding: '4px 8px' }}
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
              padding: '0.75rem 2rem',
              backgroundColor: 'var(--error-subtle)',
              borderBottom: '1px solid var(--error-border)',
              color: 'var(--error)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <ShieldAlert size={16} />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Message Stream */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '2rem 2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === 'user';

            return (
              <div
                key={msg.id}
                className="animate-slide-up"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '880px',
                  width: '100%',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                }}
              >
                {/* Speaker Header with Avatar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.4rem',
                    fontSize: '0.74rem',
                    color: 'var(--muted-text)',
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: 'var(--radius-xs)',
                      background: isUser
                        ? 'var(--primary-indigo)'
                        : 'linear-gradient(135deg, #17143F 0%, #723ECF 100%)',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isUser ? <User size={11} /> : <Bot size={11} />}
                  </div>
                  <span style={{ fontWeight: 700, color: isUser ? 'var(--primary-indigo)' : 'var(--accent-violet)' }}>
                    {isUser ? 'Customer' : 'ZentroMart Assistant'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Bubble Container */}
                <div
                  style={{
                    backgroundColor: isUser ? 'var(--primary-indigo)' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--body-text)',
                    padding: '1.15rem 1.35rem',
                    borderRadius: isUser ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                    border: isUser ? 'none' : '1px solid var(--border-card)',
                    boxShadow: isUser ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                    fontSize: '0.94rem',
                    lineHeight: 1.65,
                    maxWidth: '100%',
                    position: 'relative',
                  }}
                >
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                  {/* Verified Order Banner */}
                  {msg.order_info && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--surface-subtle)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, color: 'var(--primary-indigo)', fontSize: '0.84rem' }}>
                          Order #{msg.order_info.order_id} Verified
                        </span>
                        <span className="badge badge-success">Authenticated</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                        Status: <strong style={{ color: 'var(--primary-indigo)' }}>{msg.order_info.status}</strong> • Expected: {msg.order_info.promised_delivery_date || msg.order_info.delivery_date || 'N/A'}
                      </div>
                    </div>
                  )}

                  {/* Human Escalation Ticket Banner */}
                  {msg.ticket_info && (
                    <div
                      style={{
                        marginTop: '1rem',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--warning-subtle)',
                        border: '1px solid var(--warning-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, color: 'var(--warning)', fontSize: '0.84rem' }}>
                          Human Intervention Ticket Registered #{msg.ticket_info.ticket_id}
                        </span>
                        <span className="badge badge-warning">Escalated</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--body-text)' }}>
                        {msg.ticket_info.summary}
                      </div>
                    </div>
                  )}

                  {/* Expandable Evidence Drawer */}
                  {msg.sources && msg.sources.length > 0 && (
                    <EvidenceDrawer sources={msg.sources} />
                  )}

                  {/* Actions Footer */}
                  {!isUser && msg.id !== 'intro' && (
                    <div
                      style={{
                        marginTop: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '0.45rem',
                        borderTop: '1px solid var(--border-light)',
                        paddingTop: '0.55rem',
                      }}
                    >
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="btn-ghost"
                        style={{ fontSize: '0.74rem', padding: '2px 8px' }}
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check size={13} color="#21865B" /> : <Copy size={13} />}
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
                  padding: '0.75rem 1.15rem',
                  borderRadius: '10px 10px 10px 2px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-card)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <span
                  className="pulse-indicator"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-violet)',
                  }}
                />
                <span
                  className="pulse-indicator"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#9D68FF',
                    animationDelay: '0.2s',
                  }}
                />
                <span
                  className="pulse-indicator"
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--border-medium)',
                    animationDelay: '0.4s',
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginLeft: '6px', fontWeight: 600 }}>
                  Retrieving authoritative policy evidence...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Message Composer Area */}
        <div
          style={{
            padding: '1.25rem 2.5rem 1.75rem',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--border-card)',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--light-bg)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              padding: '0.45rem 0.65rem 0.45rem 1.15rem',
              transition: 'border-color var(--transition-fast)',
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask an enterprise customer support inquiry (e.g. return window, order status)..."
              disabled={isTyping}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                padding: '0.5rem 0',
                fontSize: '0.94rem',
                color: 'var(--primary-indigo)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onNavigateToVoice}
                title="Open Voice Studio (Gnani.ai Speech)"
                className="btn-ghost"
                style={{
                  padding: '7px',
                  borderRadius: 'var(--radius-xs)',
                  color: 'var(--muted-text)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-card)',
                }}
              >
                <Mic size={16} />
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim() || isTyping}
                className="btn-primary"
                style={{
                  padding: '0.55rem 1.15rem',
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
              marginTop: '0.65rem',
              fontSize: '0.74rem',
              color: 'var(--muted-text)',
            }}
          >
            <span>Ask one question at a time. The assistant cites official company policy documents.</span>
            <span>Customer verification strictly enforced for order details</span>
          </div>
        </div>
      </div>
    </div>
  );
}
