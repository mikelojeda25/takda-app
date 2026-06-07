import { useEffect, useRef } from "react";

export default function AlarmRing({ alarm, onDismiss }) {
  const audioRef = useRef(null);

  useEffect(() => {
    // Create audio context for alarm sound
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    let stopped = false;

    const ring = () => {
      if (stopped) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(660, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    };

    ring();
    const interval = setInterval(ring, 600);

    return () => {
      stopped = true;
      clearInterval(interval);
      ctx.close();
    };
  }, []);

  return (
    <div className="ring-overlay">
      <div className="ring-card">
        <div className="ring-icon">
          <img src="/alarm-fred.png" alt="takda" className="ring-icon-image" />
        </div>
        <div className="ring-time">{alarm.time}</div>
        <h2 className="ring-title">{alarm.title}</h2>
        {alarm.description && <p className="ring-desc">{alarm.description}</p>}
        <p className="ring-creator">Set by {alarm.creatorName}</p>
        <button className="ring-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
