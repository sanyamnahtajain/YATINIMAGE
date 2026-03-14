'use client';

import { useState, useMemo } from 'react';
import styles from './PreviewGrid.module.css';

const PAGE_SIZE = 50;

export default function PreviewGrid({ images, onDownloadOne }) {
  const [page, setPage] = useState(0);
  const [enlargedIdx, setEnlargedIdx] = useState(null);

  const totalPages = Math.ceil(images.length / PAGE_SIZE);
  const visibleImages = useMemo(
    () => images.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE),
    [images, page]
  );

  if (images.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          Generated Variations
          <span className={styles.badge}>{images.length}</span>
        </h3>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              id="prev-page"
            >
              ← Prev
            </button>
            <span className={styles.pageInfo}>
              {page + 1} / {totalPages}
            </span>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              id="next-page"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {visibleImages.map((img) => (
          <div
            key={img.index}
            className={styles.card}
            onClick={() => setEnlargedIdx(img.index)}
          >
            <img
              src={img.url}
              alt={img.label}
              className={styles.thumb}
              loading="lazy"
            />
            <div className={styles.cardOverlay}>
              <span className={styles.cardLabel}>{img.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {enlargedIdx !== null && (
        <div className={styles.lightbox} onClick={() => setEnlargedIdx(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <img
              src={images[enlargedIdx]?.url}
              alt={images[enlargedIdx]?.label}
              className={styles.lightboxImg}
            />
            <div className={styles.lightboxActions}>
              <span className={styles.lightboxLabel}>{images[enlargedIdx]?.label}</span>
              <button
                className={styles.lightboxDownload}
                onClick={() => onDownloadOne(images[enlargedIdx])}
                id="download-single"
              >
                Download
              </button>
            </div>
            <button
              className={styles.lightboxClose}
              onClick={() => setEnlargedIdx(null)}
              id="close-lightbox"
            >
              ✕
            </button>
            <div className={styles.lightboxNav}>
              <button
                disabled={enlargedIdx === 0}
                onClick={() => setEnlargedIdx(enlargedIdx - 1)}
                className={styles.navBtn}
              >
                ‹
              </button>
              <button
                disabled={enlargedIdx >= images.length - 1}
                onClick={() => setEnlargedIdx(enlargedIdx + 1)}
                className={styles.navBtn}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
