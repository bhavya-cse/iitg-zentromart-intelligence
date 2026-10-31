import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Key,
  ShieldCheck,
  Server,
  Save,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
  RefreshCw,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';

export function Settings() {
  const [settings, setSettings] = useState({
    gnani_api_key: '',
    gemini_api_key: '',
    gnani_tts_model: 'timbre-v2.5',
    reference_date: '2026-10-20',
    dataset_path: 'Capstone_Project_Dataset_FTTT_2026',
    temperature: 0.1,
  });
  const [health, setHealth] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const fetchSettings = async () => {
    try {
      const [sRes, hRes] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getHealth().catch(() => null),
      ]);
      if (sRes) setSettings((prev) => ({ ...prev, ...sRes }));
      if (hRes) setHealth(hRes);
    } catch (e) {
      // quiet
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      fetchSettings();
    } catch (err) {
      setSaveError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-body">
      {/* Title */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="badge badge-violet">VoiceOps Administration</span>
          <span className="badge badge-muted">System v2026.1</span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
          Platform Settings & Credentials
        </h1>
        <p style={{ color: 'var(--muted-text)', fontSize: '0.94rem' }}>
          Configure API credentials, Gnani voice parameters, reference dates, and dataset locations.
        </p>
      </div>

      {saveSuccess && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--success-subtle)',
            border: '1px solid rgba(33, 134, 91, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--success)',
            fontSize: '0.86rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={16} />
          <span>Configuration saved successfully. Engine updated.</span>
        </div>
      )}

      {saveError && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--error-subtle)',
            border: '1px solid rgba(201, 76, 89, 0.25)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--error)',
            fontSize: '0.86rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Credentials Section */}
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Key size={18} color="#723ECF" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
              API Keys & Engine Credentials
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                Gnani.ai API Key (GNANI_API_KEY)
              </label>
              <input
                type="password"
                value={settings.gnani_api_key}
                onChange={(e) => setSettings({ ...settings, gnani_api_key: e.target.value })}
                placeholder={settings.gnani_api_key_masked ? '••••••••••••••••' : 'Enter Gnani.ai API Key'}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
                Required for live Gnani STT and TTS voice synthesis. Never exposed to browser clients.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                Gemini / LLM API Key (GEMINI_API_KEY)
              </label>
              <input
                type="password"
                value={settings.gemini_api_key}
                onChange={(e) => setSettings({ ...settings, gemini_api_key: e.target.value })}
                placeholder={settings.gemini_api_key_masked ? '••••••••••••••••' : 'Enter Gemini API Key'}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
                Powers conversational intelligence and reasoning.
              </span>
            </div>
          </div>
        </div>

        {/* Voice & Synthesis Parameters */}
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Radio size={18} color="#723ECF" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
              Gnani Voice & Acoustic Parameters
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                Gnani TTS Model
              </label>
              <select
                value={settings.gnani_tts_model}
                onChange={(e) => setSettings({ ...settings, gnani_tts_model: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.88rem',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="timbre-v2.5">timbre-v2.5 (Standard Production)</option>
                <option value="timbre-v3.0">timbre-v3.0 (High-Fidelity Expressive)</option>
              </select>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
                Official supported documented Gnani TTS models.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                LLM Temperature (Policy Grounding)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.0"
                max="1.0"
                value={settings.temperature}
                onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.88rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
                Low temperature (0.1) enforces strict policy compliance without creative hallucination.
              </span>
            </div>
          </div>
        </div>

        {/* Operational & Capstone Dataset Defaults */}
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Clock size={18} color="#723ECF" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
              VoiceOps 2026 Dataset & Calendar Rules
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                Reference System Date
              </label>
              <input
                type="text"
                value={settings.reference_date}
                readOnly
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  backgroundColor: 'var(--light-bg)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                  color: 'var(--primary-indigo)',
                  fontWeight: 700,
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
                Fixed to 20 October 2026 per VoiceOps Capstone specification.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                Dataset Directory Path
              </label>
              <input
                type="text"
                value={settings.dataset_path}
                onChange={(e) => setSettings({ ...settings, dataset_path: e.target.value })}
                placeholder="Capstone_Project_Dataset_FTTT_2026"
                style={{
                  width: '100%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-medium)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.88rem',
                }}
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '4px', display: 'block' }}>
                Relative to workspace root or absolute path.
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingBottom: '2rem' }}>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.94rem' }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
