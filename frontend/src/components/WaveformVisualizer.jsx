import React, { useEffect, useRef } from 'react';

export function WaveformVisualizer({ isRecording = false, isPlaying = false, height = 48 }) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numBars = 36;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const barWidth = 3;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      for (let i = 0; i < numBars; i++) {
        let barHeight = 6;

        if (isRecording) {
          // Dynamic active waveform during recording
          const sinVal = Math.sin(phase + i * 0.35) * Math.cos(phase * 0.7 + i * 0.2);
          const noise = Math.random() * 0.25;
          barHeight = Math.max(6, Math.min(h - 4, (Math.abs(sinVal) + noise) * (h * 0.85)));
        } else if (isPlaying) {
          // Rhythmic waveform during audio playback
          const waveVal = Math.sin(phase * 1.5 + i * 0.45);
          barHeight = Math.max(6, Math.min(h - 6, Math.abs(waveVal) * (h * 0.75)));
        } else {
          // Resting gentle ambient state
          barHeight = 4 + Math.sin(i * 0.3) * 2;
        }

        const x = i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        ctx.fillStyle = isRecording
          ? '#C94C59' // Recording red
          : isPlaying
          ? '#9D68FF' // Playback purple
          : 'rgba(237, 231, 250, 0.25)'; // Idle

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 2, 2]);
        ctx.fill();
      }

      phase += 0.12;
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isRecording, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={height}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '360px',
        height: `${height}px`,
      }}
    />
  );
}
