import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Globe,
  Radio,
  FileText,
  Key,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { WaveformVisualizer } from '../components/WaveformVisualizer';
import { EvidenceDrawer } from '../components/EvidenceDrawer';

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: 'IN' },
  { code: 'en', name: 'English', native: 'English', flag: 'IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: 'IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: 'IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: 'IN' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: 'IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: 'IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: 'IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: 'IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: 'IN' },
];

export function VoiceStudio() {
  const [selectedLang, setSelectedLang] = useState('hi');
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlayingResponse, setIsPlayingResponse] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);
  const [sessionTurns, setSessionTurns] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  const [manualQuery, setManualQuery] = useState('');
  const [voiceError, setVoiceError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);

  // Probe backend Gnani setup
  useEffect(() => {
    const checkVoiceHealth = async () => {
      try {
        const h = await api.getHealth();
        setHealthStatus(h);
      } catch (e) {
        // quiet fallback
      }
    };
    checkVoiceHealth();
  }, []);

  // Timer effect during recording
  useEffect(() => {
    if (isRecording) {
      setRecordDuration(0);
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    setVoiceError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setVoiceError('Microphone access denied or unavailable in this browser session.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleProcessVoice = async (blobToUse = null, textOverride = null) => {
    const blob = blobToUse || audioBlob;
    const textQuery = textOverride || manualQuery.trim();

    if (!blob && !textQuery) {
      setVoiceError('Please record your voice or type an inquiry to synthesize.');
      return;
    }

    setIsProcessing(true);
    setVoiceError(null);

    const formData = new FormData();
    formData.append('language', selectedLang);
    if (blob) {
      formData.append('audio', blob, 'customer_input.webm');
    }
    if (textQuery) {
      formData.append('text_input', textQuery);
    }

    try {
      const response = await api.processVoice(formData);
      setCurrentResult(response);
      setSessionTurns((prev) => [response, ...prev]);

      // If audio URL is returned, autoplay or prepare
      if (response.audio_url && audioPlayerRef.current) {
        audioPlayerRef.current.src = response.audio_url;
        audioPlayerRef.current.play().catch(() => {});
      }
      setAudioBlob(null);
      setManualQuery('');
    } catch (err) {
      setVoiceError(err.message || 'Gnani voice pipeline processing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isGnaniConfigured = healthStatus?.gnani_configured;

  return (
    <div className="page-body">
      {/* Studio Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-violet">
              <Radio size={12} /> Gnani.ai Official Pipeline
            </span>
            <span className={`badge ${isGnaniConfigured ? 'badge-success' : 'badge-warning'}`}>
              {isGnaniConfigured ? 'Gnani STT & TTS Online' : 'GNANI_API_KEY Required'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            Voice Studio
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.94rem' }}>
            Multilingual customer voice support powered exclusively by Gnani STT & TTS clients.
          </p>
        </div>

        {/* 10 Indian Languages Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Globe size={18} color="#723ECF" />
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            style={{
              padding: '0.55rem 0.95rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.88rem',
              color: 'var(--primary-indigo)',
              cursor: 'pointer',
            }}
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.name} — {l.native}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* API Key Missing Notification State */}
      {!isGnaniConfigured && (
        <div
          className="zm-card"
          style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: '#FCF5E8',
            border: '1px solid rgba(214, 154, 53, 0.35)',
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#D69A35',
              flexShrink: 0,
              border: '1px solid rgba(214, 154, 53, 0.3)',
            }}
          >
            <Key size={18} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#875C0B', marginBottom: '0.2rem' }}>
              Gnani.ai Official SDK Integration Ready
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#664708', lineHeight: 1.5 }}>
              The official <code>gnani-vachana</code> Python client is installed with STT (<code>GnaniSTTClient</code>) and TTS (<code>GnaniTTSClient</code>, <code>timbre-v2.5</code>). To process live audio requests with the Gnani cloud service, add your <code>GNANI_API_KEY</code> in the <strong>Settings</strong> page or in your local <code>.env</code> file. In accordance with platform guidelines, fake voice responses are never simulated.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {voiceError && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: 'var(--error-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(201, 76, 89, 0.25)',
            color: 'var(--error)',
            fontSize: '0.84rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.5rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Main Studio Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Left: Recording & Synthesis Console */}
        <div className="zm-card-dark" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '380px' }}>
          <div style={{ fontSize: '0.78rem', color: 'rgba(237, 231, 250, 0.65)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem', fontWeight: 600 }}>
            {isRecording ? 'Capturing Audio Input...' : 'Voice Interaction Console'}
          </div>

          {/* Recording Timer */}
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: isRecording ? '#FF6B74' : '#FFFFFF',
              marginBottom: '1rem',
            }}
          >
            {formatTimer(recordDuration)}
          </div>

          {/* Live Waveform Visualization */}
          <div style={{ width: '100%', maxWidth: '340px', marginBottom: '1.5rem' }}>
            <WaveformVisualizer isRecording={isRecording} isPlaying={isPlayingResponse} height={52} />
          </div>

          {/* Big Record Control Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#723ECF',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(114, 62, 207, 0.5)',
                  transition: 'transform 0.15s ease',
                }}
                title="Start Recording Speech"
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.94)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Mic size={28} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#C94C59',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(201, 76, 89, 0.5)',
                  animation: 'pulse-recording 1.2s infinite ease-in-out',
                }}
                title="Stop Recording"
              >
                <MicOff size={28} />
              </button>
            )}

            {/* If audio blob ready, process button */}
            {audioBlob && !isRecording && (
              <button
                onClick={() => handleProcessVoice()}
                disabled={isProcessing}
                className="btn-primary"
                style={{
                  backgroundColor: '#21865B',
                  boxShadow: '0 4px 14px rgba(33, 134, 91, 0.4)',
                }}
              >
                {isProcessing ? 'Processing via Gnani...' : 'Run Pipeline'}
              </button>
            )}
          </div>

          {/* Workflow Status Pill */}
          <div
            style={{
              fontSize: '0.74rem',
              color: 'rgba(237, 231, 250, 0.75)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Customer Speaks</span>
            <span>→</span>
            <span>Gnani STT</span>
            <span>→</span>
            <span>LLM + RAG</span>
            <span>→</span>
            <span>Gnani TTS</span>
          </div>

          {/* Direct Speech Synthesis Text Sandbox (allows testing multilingual TTS directly) */}
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              marginTop: '1.75rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'rgba(237, 231, 250, 0.6)', marginBottom: '0.45rem' }}>
              Or type customer query for direct pipeline execution:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="e.g. क्या मैं 10 दिन बाद सामान वापस कर सकता हूँ?"
                style={{
                  flex: 1,
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '0.84rem',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProcessVoice(null, manualQuery);
                }}
              />
              <button
                onClick={() => handleProcessVoice(null, manualQuery)}
                disabled={isProcessing || !manualQuery.trim()}
                className="btn-primary"
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
              >
                <Send size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Transcription & AI Spoken Response Preview */}
        <div className="zm-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
              Live Interaction Preview
            </h2>
            {currentResult && (
              <span className="badge badge-success">Completed</span>
            )}
          </div>

          {currentResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
              {/* STT Transcript */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Speech-to-Text Transcript (Gnani STT)
                </div>
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--light-bg)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.88rem',
                    color: 'var(--body-text)',
                    fontFamily: selectedLang === 'hi' ? 'var(--font-indic)' : 'var(--font-body)',
                  }}
                >
                  "{currentResult.transcript || 'Speech transcription...'}"
                </div>
              </div>

              {/* AI Grounded Response */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  AI Grounded Response
                </div>
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--soft-violet-subtle)',
                    border: '1px solid rgba(114, 62, 207, 0.15)',
                    fontSize: '0.9rem',
                    color: 'var(--primary-indigo)',
                    lineHeight: 1.55,
                    fontFamily: selectedLang === 'hi' ? 'var(--font-indic)' : 'var(--font-body)',
                  }}
                >
                  {currentResult.response_text}
                </div>
              </div>

              {/* RAG Evidence cited if present */}
              {currentResult.sources && currentResult.sources.length > 0 && (
                <EvidenceDrawer sources={currentResult.sources} />
              )}

              {/* Audio Playback Controls */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Volume2 size={16} color="#723ECF" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
                      Gnani TTS Spoken Output
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>
                    Model: timbre-v2.5
                  </span>
                </div>

                <audio
                  ref={audioPlayerRef}
                  controls
                  style={{ width: '100%', height: '36px' }}
                  onPlay={() => setIsPlayingResponse(true)}
                  onPause={() => setIsPlayingResponse(false)}
                  onEnded={() => setIsPlayingResponse(false)}
                />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--soft-violet)',
                  color: 'var(--primary-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Mic size={22} />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                Awaiting Voice Interaction
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', maxWidth: '320px', lineHeight: 1.45 }}>
                Click the microphone button to speak in any of the 10 supported Indian languages or type a sample inquiry.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation Turn History */}
      {sessionTurns.length > 0 && (
        <div className="zm-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '1rem' }}>
            Voice Studio Interaction History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sessionTurns.map((turn, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--light-bg)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-violet">{turn.language?.toUpperCase() || 'HI'}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
                      "{turn.transcript || 'Speech input'}"
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--body-text)', lineHeight: 1.4 }}>
                    {turn.response_text}
                  </div>
                </div>
                {turn.audio_url && (
                  <button
                    onClick={() => {
                      if (audioPlayerRef.current) {
                        audioPlayerRef.current.src = turn.audio_url;
                        audioPlayerRef.current.play();
                      }
                    }}
                    className="btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '4px 8px', marginLeft: '1rem' }}
                  >
                    <Play size={12} />
                    <span>Replay</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
