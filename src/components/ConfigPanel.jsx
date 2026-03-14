'use client';

import { useState } from 'react';
import styles from './ConfigPanel.module.css';

const DIMENSION_PRESETS = [
  { label: '800 × 800', w: 800, h: 800 },
  { label: '1000 × 1000', w: 1000, h: 1000 },
  { label: '1200 × 1200', w: 1200, h: 1200 },
  { label: '1500 × 1500', w: 1500, h: 1500 },
];

const BG_TYPES = [
  { key: 'solid', label: 'Solid Colors', icon: '🎨', desc: 'Clean single-color backgrounds' },
  { key: 'gradient', label: 'Gradients', icon: '🌈', desc: 'Linear & radial gradients' },
  { key: 'pattern', label: 'Patterns', icon: '◈', desc: 'Dots, stripes, chevrons, waves' },
  { key: 'pastel', label: 'Pastel', icon: '🍬', desc: 'Soft pastel tones' },
  { key: 'vibrant', label: 'Vibrant', icon: '⚡', desc: 'Bold, saturated colors' },
];

export default function ConfigPanel({ config, onChange, disabled }) {
  const handleTypeToggle = (key) => {
    const newTypes = { ...config.types, [key]: !config.types[key] };
    // Ensure at least one type is selected
    const anySelected = Object.values(newTypes).some(Boolean);
    if (!anySelected) return;
    onChange({ ...config, types: newTypes });
  };

  const handleCountChange = (val) => {
    const count = Math.max(10, Math.min(500, parseInt(val) || 10));
    onChange({ ...config, count });
  };

  const handleDimensionSelect = (preset) => {
    onChange({ ...config, width: preset.w, height: preset.h });
  };

  return (
    <div className={`${styles.panel} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📐</span>
          Number of Variations
        </h3>
        <div className={styles.countControl}>
          <input
            type="range"
            min="10"
            max="500"
            step="10"
            value={config.count}
            onChange={(e) => handleCountChange(e.target.value)}
            className={styles.slider}
            id="variation-count-slider"
          />
          <div className={styles.countInput}>
            <input
              type="number"
              min="10"
              max="500"
              value={config.count}
              onChange={(e) => handleCountChange(e.target.value)}
              className={styles.numberInput}
              id="variation-count-input"
            />
            <span className={styles.countLabel}>images</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>🎯</span>
          Background Types
        </h3>
        <div className={styles.typeGrid}>
          {BG_TYPES.map((type) => (
            <button
              key={type.key}
              className={`${styles.typeCard} ${config.types[type.key] ? styles.typeActive : ''}`}
              onClick={() => handleTypeToggle(type.key)}
              id={`bg-type-${type.key}`}
            >
              <span className={styles.typeIcon}>{type.icon}</span>
              <span className={styles.typeLabel}>{type.label}</span>
              <span className={styles.typeDesc}>{type.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📏</span>
          Output Dimensions
        </h3>
        <div className={styles.dimensionGrid}>
          {DIMENSION_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={`${styles.dimBtn} ${config.width === preset.w && config.height === preset.h ? styles.dimActive : ''}`}
              onClick={() => handleDimensionSelect(preset)}
              id={`dim-${preset.w}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>⚙️</span>
          Options
        </h3>
        <div className={styles.optionsList}>
          <label className={styles.optionItem} htmlFor="option-shadow">
            <span className={styles.optionLabel}>Drop Shadow</span>
            <div className={styles.toggle}>
              <input
                type="checkbox"
                checked={config.shadow}
                onChange={(e) => onChange({ ...config, shadow: e.target.checked })}
                id="option-shadow"
              />
              <span className={styles.toggleSlider}></span>
            </div>
          </label>
          <label className={styles.optionItem} htmlFor="option-placement">
            <span className={styles.optionLabel}>Placement</span>
            <select
              value={config.placement}
              onChange={(e) => onChange({ ...config, placement: e.target.value })}
              className={styles.select}
              id="option-placement"
            >
              <option value="center">Center</option>
              <option value="center-bottom">Center Bottom</option>
            </select>
          </label>
          <label className={styles.optionItem} htmlFor="option-padding">
            <span className={styles.optionLabel}>Padding</span>
            <select
              value={config.padding}
              onChange={(e) => onChange({ ...config, padding: parseFloat(e.target.value) })}
              className={styles.select}
              id="option-padding"
            >
              <option value="0.04">Small (4%)</option>
              <option value="0.08">Medium (8%)</option>
              <option value="0.12">Large (12%)</option>
              <option value="0.18">Extra Large (18%)</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
