import React, { useEffect, useRef } from 'react';

export function WaveformVisualizer({ isRecording = false, isPlaying = false, height = 50 }) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numBars = 40;
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
          // Dynamic live acoustic capture waveform
          const sinVal = Math.sin(phase + i * 0.32) * Math.cos(phase * 0.75 + i * 0.18);
          const noise = Math.random() * 0.3;
          barHeight = Math.max(6, Math.min(h - 4, (Math.abs(sinVal) + noise) * (h * 0.9)));
        } else if (isPlaying) {
          // Rhythmic waveform during Gnani audio playback
          const waveVal = Math.sin(phase * 1.6 + i * 0.42);
          barHeight = Math.max(6, Math.min(h - 6, Math.abs(waveVal) * (h * 0.8)));
        } else {
          // Resting clean enterprise ambient state
          barHeight = 5 + Math.sin(i * 0.28) * 3;
        }

        const x = i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        ctx.fillStyle = isRecording
          ? '#D13438' // Recording Crimson Alert
          : isPlaying
          ? '#0066FF' // Enterprise Electric Blue
          : 'rgba(255, 255, 255, 0.35)'; // Crisp subtle acoustic chamber idle

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 2, 2]);
        ctx.fill();
      }

      phase += 0.13;
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
      width={360}
      height={height}
      style={{
        display: 'block',
        width: '100%',
        maxWidth: '380px',
        height: `${height}px`,
      }}
    />
  );
}
