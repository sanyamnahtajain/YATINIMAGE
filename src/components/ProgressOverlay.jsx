'use client';

import styles from './ProgressOverlay.module.css';

export default function ProgressOverlay({ current, total, phase, onCancel }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  const phaseLabels = {
    rendering: 'Generating image',
    zipping: 'Creating ZIP file',
  };

  const phaseLabel = phaseLabels[phase] || 'Processing';

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.pulseRing}>
          <div className={styles.percentCircle}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="6"
              />
              <circle
                cx="60" cy="60" r="52"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - percent / 100)}`}
                transform="rotate(-90 60 60)"
                className={styles.progressArc}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <span className={styles.percentText}>{percent}%</span>
          </div>
        </div>

        <div className={styles.info}>
          <p className={styles.phaseText}>
            {phaseLabel} <span className={styles.counter}>{current}/{total}</span>
          </p>
          <p className={styles.subText}>
            {phase === 'rendering'
              ? 'Creating unique backgrounds for your product...'
              : 'Packaging your images for download...'}
          </p>
        </div>

        {onCancel && (
          <button className={styles.cancelBtn} onClick={onCancel} id="cancel-generation">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
