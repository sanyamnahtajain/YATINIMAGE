'use client';

import { useState, useCallback, useRef } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ConfigPanel from '@/components/ConfigPanel';
import PreviewGrid from '@/components/PreviewGrid';
import ProgressOverlay from '@/components/ProgressOverlay';
import styles from './page.module.css';

const DEFAULT_CONFIG = {
  count: 100,
  types: {
    solid: true,
    gradient: true,
    pattern: true,
    pastel: true,
    vibrant: true,
  },
  width: 1000,
  height: 1000,
  padding: 0.08,
  shadow: true,
  placement: 'center',
};

export default function Home() {
  const [step, setStep] = useState(1); // 1: upload, 2: config, 3: results
  const [transparentBlob, setTransparentBlob] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, phase: '' });
  const [isZipping, setIsZipping] = useState(false);
  const cancelRef = useRef(false);

  const handleImageReady = useCallback((blob, file) => {
    setTransparentBlob(blob);
    setOriginalFile(file);
    setStep(2);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!transparentBlob) return;

    cancelRef.current = false;
    setIsGenerating(true);
    setProgress({ current: 0, total: config.count, phase: 'rendering' });
    setGeneratedImages([]);

    try {
      const { generateVariations } = await import('@/utils/imageProcessor');

      const images = await generateVariations(
        transparentBlob,
        config,
        (current, total, phase) => {
          if (cancelRef.current) throw new Error('cancelled');
          setProgress({ current, total, phase });
        }
      );

      if (!cancelRef.current) {
        setGeneratedImages(images);
        setStep(3);
      }
    } catch (err) {
      if (err.message !== 'cancelled') {
        console.error('Generation failed:', err);
        alert('Image generation failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [transparentBlob, config]);

  const handleCancel = useCallback(() => {
    cancelRef.current = true;
    setIsGenerating(false);
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (generatedImages.length === 0) return;

    setIsZipping(true);
    setProgress({ current: 0, total: 100, phase: 'zipping' });

    try {
      const { createZip, downloadBlob } = await import('@/utils/imageProcessor');

      const zipBlob = await createZip(generatedImages, (percent) => {
        setProgress({ current: Math.round(percent), total: 100, phase: 'zipping' });
      });

      downloadBlob(zipBlob, `product-images-${generatedImages.length}-variations.zip`);
    } catch (err) {
      console.error('ZIP creation failed:', err);
      alert('Failed to create ZIP. Please try downloading individual images.');
    } finally {
      setIsZipping(false);
    }
  }, [generatedImages]);

  const handleDownloadOne = useCallback((image) => {
    const url = URL.createObjectURL(image.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image.label.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    // Clean up blob URLs
    generatedImages.forEach((img) => URL.revokeObjectURL(img.url));
    setStep(1);
    setTransparentBlob(null);
    setOriginalFile(null);
    setGeneratedImages([]);
    setConfig(DEFAULT_CONFIG);
  }, [generatedImages]);

  return (
    <main className={styles.main}>
      {/* Hero Header */}
      <header className={styles.hero}>
        <div className={styles.heroGlow} />
        <h1 className={styles.title}>
          <span className={styles.titleGradient}>Product Image</span> Generator
        </h1>
        <p className={styles.subtitle}>
          Upload once. Generate 100s of unique product images with different backgrounds.
          <br />
          <span className={styles.subtitleHighlight}>Perfect for Meesho & e-commerce vendors.</span>
        </p>
      </header>

      {/* Step Indicator */}
      <div className={styles.steps}>
        {[
          { num: 1, label: 'Upload', icon: '📤' },
          { num: 2, label: 'Configure', icon: '⚙️' },
          { num: 3, label: 'Download', icon: '📦' },
        ].map((s) => (
          <div
            key={s.num}
            className={`${styles.stepItem} ${step >= s.num ? styles.stepActive : ''} ${step === s.num ? styles.stepCurrent : ''}`}
          >
            <div className={styles.stepDot}>
              {step > s.num ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 7L6 9L10 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <span>{s.icon}</span>
              )}
            </div>
            <span className={styles.stepLabel}>{s.label}</span>
            {s.num < 3 && <div className={styles.stepLine} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Step 1: Upload */}
        {step >= 1 && (
          <section className={`${styles.sectionCard} ${step === 1 ? styles.sectionActive : styles.sectionDone}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {step > 1 ? '✅' : '1.'} Upload Product Image
              </h2>
              {step > 1 && (
                <span className={styles.doneTag}>
                  {originalFile?.name}
                </span>
              )}
            </div>
            {step === 1 && (
              <ImageUploader onImageReady={handleImageReady} disabled={false} />
            )}
          </section>
        )}

        {/* Step 2: Configure */}
        {step >= 2 && (
          <section className={`${styles.sectionCard} ${step === 2 ? styles.sectionActive : step > 2 ? styles.sectionDone : ''}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                {step > 2 ? '✅' : '2.'} Configure Variations
              </h2>
            </div>
            {step === 2 && (
              <>
                <ConfigPanel config={config} onChange={setConfig} disabled={isGenerating} />
                <div className={styles.generateActions}>
                  <button className={styles.generateBtn} onClick={handleGenerate} disabled={isGenerating} id="generate-btn">
                    <span className={styles.generateIcon}>⚡</span>
                    Generate {config.count} Variations
                  </button>
                  <button className={styles.backBtn} onClick={() => setStep(1)} id="back-to-upload">
                    ← Back to Upload
                  </button>
                </div>
              </>
            )}
          </section>
        )}

        {/* Step 3: Results */}
        {step === 3 && generatedImages.length > 0 && (
          <section className={`${styles.sectionCard} ${styles.sectionActive}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>3. Your Images</h2>
              <div className={styles.resultActions}>
                <button className={styles.downloadAllBtn} onClick={handleDownloadAll} disabled={isZipping} id="download-all-btn">
                  <span>📦</span>
                  {isZipping ? 'Creating ZIP...' : `Download All (${generatedImages.length} images)`}
                </button>
                <button className={styles.regenerateBtn} onClick={() => setStep(2)} id="regenerate-btn">
                  🔄 Regenerate
                </button>
                <button className={styles.resetBtn} onClick={handleReset} id="reset-btn">
                  🗑️ Start Over
                </button>
              </div>
            </div>
            <PreviewGrid images={generatedImages} onDownloadOne={handleDownloadOne} />
          </section>
        )}
      </div>

      {/* Progress Overlay */}
      {(isGenerating || isZipping) && (
        <ProgressOverlay
          current={progress.current}
          total={progress.total}
          phase={progress.phase}
          onCancel={isGenerating ? handleCancel : null}
        />
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Built for Meesho vendors • All processing happens in your browser • Your images never leave your device</p>
      </footer>
    </main>
  );
}
