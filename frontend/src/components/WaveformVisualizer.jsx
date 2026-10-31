import React, { useEffect, useRef } from 'react';

export function WaveformVisualizer({ isRecording = false, isPlaying = false, height = 54 }) {
  const canvasRef = useRef(null);
  const animFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const numBars = 44;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      const barWidth = 3.5;
      const gap = (width - numBars * barWidth) / (numBars - 1);

      for (let i = 0; i < numBars; i++) {
        let barHeight = 6;

        if (isRecording) {
          // Dynamic live acoustic capture waveform with organic harmonic oscillation
          const sinVal = Math.sin(phase + i * 0.32) * Math.cos(phase * 0.75 + i * 0.18);
          const noise = Math.random() * 0.28;
          barHeight = Math.max(6, Math.min(h - 4, (Math.abs(sinVal) + noise) * (h * 0.92)));
        } else if (isPlaying) {
          // Rhythmic harmonic waveform during Gnani audio playback
          const waveVal = Math.sin(phase * 1.8 + i * 0.38) * Math.cos(phase * 0.6 + i * 0.15);
          barHeight = Math.max(6, Math.min(h - 6, Math.abs(waveVal) * (h * 0.85)));
        } else {
          // Resting clean enterprise ambient state
          barHeight = 6 + Math.sin(i * 0.28) * 3;
        }

        const x = i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        if (isRecording) {
          // Gradient from recording red to violet
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#FF5C77');
          grad.addColorStop(1, '#C94C59');
          ctx.fillStyle = grad;
        } else if (isPlaying) {
          // Electric violet gradient
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#9D68FF');
          grad.addColorStop(1, '#723ECF');
          ctx.fillStyle = grad;
        } else {
          // Resting subtle lilac in dark cockpit
          ctx.fillStyle = 'rgba(237, 231, 250, 0.4)';
        }

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 2, 2]);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }

      phase += 0.14;
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
      width={380}
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
