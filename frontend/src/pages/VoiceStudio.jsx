import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Play,
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
  Activity,
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
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.45rem' }}>
            <Radio size={13} />
            <span>Multilingual Voice Operations • Official Gnani.ai SDK</span>
          </div>
          <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
            Voice Studio
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.96rem', maxWidth: '700px' }}>
            Enterprise speech pipeline powered exclusively by Gnani STT and TTS clients across 10 Indian languages.
          </p>
        </div>

        {/* 10 Indian Languages Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--corp-navy)', fontSize: '0.84rem', fontWeight: 700 }}>
            <Globe size={18} color="#0066FF" />
            <span>Acoustic Language:</span>
          </div>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.88rem',
              color: 'var(--corp-navy)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)',
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

      {/* API Key Missing State */}
      {!isGnaniConfigured && (
        <div
          className="zm-card"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FEF3D6',
            border: '1px solid rgba(180, 83, 9, 0.3)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1.25rem',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#B45309',
              flexShrink: 0,
              border: '1px solid rgba(180, 83, 9, 0.25)',
            }}
          >
            <Key size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#78350F', marginBottom: '0.25rem' }}>
              Gnani.ai Official SDK Integration Ready
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#92400E', lineHeight: 1.55 }}>
              The official <code>gnani-vachana</code> Python client is installed with STT (<code>GnaniSTTClient</code>) and TTS (<code>GnaniTTSClient</code>, <code>timbre-v2.5</code>). Configure your <code>GNANI_API_KEY</code> in <strong>Settings</strong> or <code>.env</code> to stream speech audio. In accordance with platform guidelines, simulated voice responses are prohibited.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {voiceError && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--error-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(209, 52, 56, 0.25)',
            color: 'var(--error)',
            fontSize: '0.86rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            marginBottom: '1.75rem',
          }}
        >
          <AlertCircle size={16} />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Main Voice Console */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', marginBottom: '2.25rem' }}>
        {/* Left: Deep Navy Acoustic Control Chamber */}
        <div
          className="zm-card-navy"
          style={{
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '420px',
            position: 'relative',
          }}
        >
          <div
            style={{
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.65)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1.25rem',
              fontWeight: 700,
            }}
          >
            {isRecording ? 'Capturing Acoustic Input...' : 'Acoustic Control Chamber'}
          </div>

          {/* Recording Timer */}
          <div
            style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: isRecording ? '#FF6B74' : '#FFFFFF',
              marginBottom: '1.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            {formatTimer(recordDuration)}
          </div>

          {/* Waveform Visualization */}
          <div style={{ width: '100%', maxWidth: '380px', marginBottom: '1.75rem' }}>
            <WaveformVisualizer isRecording={isRecording} isPlaying={isPlayingResponse} height={54} />
          </div>

          {/* Big Record Control Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={isProcessing}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-blue)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(0, 102, 255, 0.45)',
                  transition: 'transform 0.15s ease',
                }}
                title="Start Recording Speech"
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Mic size={30} />
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--error)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 25px rgba(209, 52, 56, 0.5)',
                  animation: 'pulse-recording 1.2s infinite ease-in-out',
                }}
                title="Stop Recording"
              >
                <MicOff size={30} />
              </button>
            )}

            {audioBlob && !isRecording && (
              <button
                onClick={() => handleProcessVoice()}
                disabled={isProcessing}
                className="btn-blue"
                style={{ padding: '0.65rem 1.35rem' }}
              >
                {isProcessing ? 'Processing via Gnani...' : 'Run Pipeline'}
              </button>
            )}
          </div>

          {/* Workflow Sequence */}
          <div
            style={{
              fontSize: '0.74rem',
              color: 'rgba(255, 255, 255, 0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 600,
            }}
          >
            <span>Customer Speaks</span>
            <span>→</span>
            <span style={{ color: '#0066FF' }}>Gnani STT</span>
            <span>→</span>
            <span>LLM + RAG</span>
            <span>→</span>
            <span style={{ color: '#0066FF' }}>Gnani TTS</span>
          </div>

          {/* Direct Input Field */}
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            }}
          >
            <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.65)', marginBottom: '0.5rem', fontWeight: 600 }}>
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
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  fontSize: '0.86rem',
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProcessVoice(null, manualQuery);
                }}
              />
              <button
                onClick={() => handleProcessVoice(null, manualQuery)}
                disabled={isProcessing || !manualQuery.trim()}
                className="btn-blue"
                style={{ padding: '0.5rem 0.95rem', fontSize: '0.82rem' }}
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Transcription & AI Spoken Output Preview */}
        <div className="zm-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.2rem' }}>Pipeline Telemetry</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                Live Interaction Preview
              </h2>
            </div>
            {currentResult && (
              <span className="badge badge-success">Completed</span>
            )}
          </div>

          {currentResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem', flex: 1 }}>
              {/* STT Transcript */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                  Speech-to-Text Transcript (Gnani STT)
                </div>
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-slate)',
                    border: '1px solid var(--border-light)',
                    fontSize: '0.92rem',
                    color: 'var(--corp-navy)',
                    fontFamily: selectedLang === 'hi' ? 'var(--font-indic)' : 'var(--font-body)',
                    fontWeight: 600,
                  }}
                >
                  "{currentResult.transcript || 'Speech transcription...'}"
                </div>
              </div>

              {/* AI Grounded Response */}
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                  Grounded Enterprise Response
                </div>
                <div
                  style={{
                    padding: '1rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-blue-subtle)',
                    border: '1px solid rgba(0, 102, 255, 0.2)',
                    fontSize: '0.92rem',
                    color: 'var(--corp-navy)',
                    lineHeight: 1.6,
                    fontFamily: selectedLang === 'hi' ? 'var(--font-indic)' : 'var(--font-body)',
                  }}
                >
                  {currentResult.response_text}
                </div>
              </div>

              {/* RAG Evidence cited */}
              {currentResult.sources && currentResult.sources.length > 0 && (
                <EvidenceDrawer sources={currentResult.sources} />
              )}

              {/* Audio Playback Controls */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '1.15rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-light)',
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Volume2 size={16} color="#0066FF" />
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                      Gnani TTS Spoken Synthesis
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', fontFamily: 'var(--font-mono)' }}>
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
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2.5rem' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--accent-blue-subtle)',
                  color: 'var(--accent-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  border: '1px solid rgba(0, 102, 255, 0.2)',
                }}
              >
                <Mic size={24} />
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--corp-navy)', marginBottom: '0.4rem' }}>
                Awaiting Acoustic Capture
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--muted-text)', maxWidth: '340px', lineHeight: 1.55 }}>
                Record speech in any of the 10 supported Indian languages or enter an inquiry to test the Gnani cloud pipeline.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Turn History */}
      {sessionTurns.length > 0 && (
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div className="eyebrow" style={{ marginBottom: '0.25rem' }}>Session Audit</div>
          <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--corp-navy)', marginBottom: '1.25rem' }}>
            Voice Studio Turn History
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {sessionTurns.map((turn, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem 1.15rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-neutral)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="badge badge-blue">{turn.language?.toUpperCase() || 'HI'}</span>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                      "{turn.transcript || 'Speech input'}"
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--body-text)', lineHeight: 1.5 }}>
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
                    style={{ fontSize: '0.78rem', padding: '5px 10px', marginLeft: '1.25rem' }}
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
