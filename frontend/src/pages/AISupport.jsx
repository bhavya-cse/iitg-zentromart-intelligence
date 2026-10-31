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
        height: 'calc(100vh - 72px)',
        backgroundColor: 'var(--bg-neutral)',
      }}
    >
      {/* Left Session Drawer / Prompt Catalog */}
      <div
        style={{
          width: '300px',
          borderRight: '1px solid var(--border-light)',
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

        <div className="eyebrow" style={{ marginBottom: '0.85rem' }}>
          Suggested Inquiries
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
          {SAMPLE_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              style={{
                textAlign: 'left',
                padding: '0.75rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-neutral)',
                border: '1px solid var(--border-light)',
                fontSize: '0.82rem',
                color: 'var(--corp-navy)',
                lineHeight: 1.4,
                fontWeight: 600,
                transition: 'all 140ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-blue-subtle)';
                e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-neutral)';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Corporate Precedence Notice */}
        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <Sparkles size={14} color="#0066FF" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
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
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#0E703C' }} />
            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
              ZentroMart Grounded Assistant
            </span>
            <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
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
              borderBottom: '1px solid rgba(209, 52, 56, 0.2)',
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
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '880px',
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
                    marginBottom: '0.4rem',
                    fontSize: '0.74rem',
                    color: 'var(--muted-text)',
                  }}
                >
                  <span style={{ fontWeight: 700, color: isUser ? 'var(--corp-navy)' : 'var(--accent-blue)' }}>
                    {isUser ? 'Customer' : 'ZentroMart Assistant'}
                  </span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Bubble Container */}
                <div
                  style={{
                    backgroundColor: isUser ? 'var(--corp-navy)' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--body-text)',
                    padding: '1.15rem 1.35rem',
                    borderRadius: isUser ? '8px 8px 1px 8px' : '8px 8px 8px 1px',
                    border: isUser ? 'none' : '1px solid var(--border-light)',
                    boxShadow: isUser ? '0 4px 14px rgba(0, 18, 46, 0.15)' : 'var(--shadow-xs)',
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
                        backgroundColor: 'var(--bg-slate)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, color: 'var(--corp-navy)', fontSize: '0.84rem' }}>
                          Order #{msg.order_info.order_id} Verified
                        </span>
                        <span className="badge badge-success">Authenticated</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                        Status: <strong style={{ color: 'var(--corp-navy)' }}>{msg.order_info.status}</strong> • Expected: {msg.order_info.promised_delivery_date || msg.order_info.delivery_date || 'N/A'}
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
                        border: '1px solid rgba(180, 83, 9, 0.25)',
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
                        {copiedId === msg.id ? <Check size={13} color="#0E703C" /> : <Copy size={13} />}
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
                  borderRadius: '8px 8px 8px 1px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#0066FF',
                    animation: 'pulse-recording 1.2s infinite ease-in-out',
                  }}
                />
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#0052CC',
                    animation: 'pulse-recording 1.2s 0.2s infinite ease-in-out',
                  }}
                />
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#CBD5E1',
                    animation: 'pulse-recording 1.2s 0.4s infinite ease-in-out',
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
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-neutral)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              padding: '0.45rem 0.65rem 0.45rem 1.15rem',
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
                color: 'var(--corp-navy)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={onNavigateToVoice}
                title="Open Voice Studio (Gnani.ai Speech)"
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  color: 'var(--muted-text)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-blue)')}
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
