'use client';

import { useCallback, useState, useRef } from 'react';
import styles from './ImageUploader.module.css';

export default function ImageUploader({ onImageReady, disabled }) {
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, removing, done, error
  const [progress, setProgress] = useState(0);
  const [skipBgRemoval, setSkipBgRemoval] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Skip background removal if user says it's already done
    if (skipBgRemoval) {
      setStatus('done');
      setProgress(100);
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      onImageReady(blob, file);
      return;
    }

    setStatus('removing');
    setProgress(0);

    try {
      const { removeBackground } = await import('@/utils/imageProcessor');
      const transparentBlob = await removeBackground(file, (p) => {
        setProgress(Math.round(p * 100));
      });

      setStatus('done');
      setProgress(100);
      onImageReady(transparentBlob, file);
    } catch (err) {
      console.error('Background removal failed:', err);
      setStatus('error');
      // Fallback: use original image
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      onImageReady(blob, file);
    }
  }, [onImageReady, skipBgRemoval]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    processFile(file);
  }, [processFile]);

  const handleClick = useCallback(() => {
    if (!disabled) fileInputRef.current?.click();
  }, [disabled]);

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dragover : ''} ${disabled ? styles.disabled : ''} ${status === 'done' ? styles.done : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileSelect}
          className={styles.hiddenInput}
          id="image-upload"
        />

        {preview ? (
          <div className={styles.previewContainer}>
            <img src={preview} alt="Product preview" className={styles.preview} />
            {status === 'removing' && (
              <div className={styles.processingOverlay}>
                <div className={styles.spinner} />
                <p className={styles.processingText}>Removing background...</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <span className={styles.progressPercent}>{progress}%</span>
              </div>
            )}
            {status === 'done' && (
              <div className={styles.successBadge}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 10L9 12L13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Background Removed
              </div>
            )}
            {status === 'error' && (
              <div className={styles.errorBadge}>
                Using original image (BG removal failed)
              </div>
            )}
          </div>
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.uploadIcon}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M24 32V16M24 16L18 22M24 16L30 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 32L8 36C8 38.2091 9.79086 40 12 40L36 40C38.2091 40 40 38.2091 40 36V32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className={styles.mainText}>Drop your product image here</p>
            <p className={styles.subText}>or click to browse • PNG, JPG, WEBP</p>
          </div>
        )}
      </div>

      <label className={styles.skipCheckbox} htmlFor="skip-bg-removal" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          id="skip-bg-removal"
          checked={skipBgRemoval}
          onChange={(e) => setSkipBgRemoval(e.target.checked)}
        />
        <span className={styles.checkmark} />
        <span>Background already removed (skip removal)</span>
      </label>

      {preview && status === 'done' && (
        <button
          className={styles.changeBtn}
          onClick={(e) => {
            e.stopPropagation();
            setPreview(null);
            setStatus('idle');
            setProgress(0);
          }}
        >
          Change Image
        </button>
      )}
    </div>
  );
}

