import { useId, useState } from 'react';
import styles from './PDFViewer.module.css';

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
  author: string;
  year: number;
}

export function PDFViewer({ pdfUrl, title, author, year }: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <section className={styles.pdfViewerContainer} aria-labelledby={titleId} aria-describedby={descriptionId}>
      <div className={styles.pdfHeader}>
        <h3 id={titleId} className={styles.pdfTitle}>Read the Complete Thesis</h3>
        <p id={descriptionId} className={styles.pdfDescription}>
          {title} by {author} ({year})
        </p>
        <div className={styles.copyrightNotice}>
          <p><strong>© {year} {author}. All rights reserved.</strong></p>
          <p>This work is protected by copyright law. Unauthorized reproduction, distribution, or display is prohibited.</p>
          <p>For permissions or inquiries, please contact the author directly.</p>
        </div>
      </div>
      
      <div className={styles.pdfWrapper}>
        {isLoading && (
          <div className={styles.pdfLoading} role="status" aria-live="polite">
            <p>Loading thesis document…</p>
          </div>
        )}
        <object
          data={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          type="application/pdf"
          className={styles.pdfFrame}
          aria-label={`${title} thesis PDF by ${author}`}
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        >
          <div className={styles.pdfFallback}>
            <p>
              This browser cannot display the PDF inline. Open the thesis in a new tab to read it with the browser PDF
              viewer.
            </p>
            <a href={pdfUrl} className={styles.inlinePdfLink} target="_blank" rel="noopener noreferrer">
              Open Thesis PDF
            </a>
          </div>
        </object>
      </div>
      
      <div className={styles.pdfFooter}>
        <p className={styles.downloadInfo}>
          <strong>Note:</strong> This thesis is provided for academic and research purposes only. 
          Please respect the author's copyright and intellectual property rights.
        </p>
        <a
          href={pdfUrl}
          className={styles.openButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open Thesis PDF
        </a>
        <a 
          href={pdfUrl} 
          download={`McCartney_Thesis_${year}.pdf`}
          className={styles.downloadButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Thesis PDF
        </a>
      </div>
    </section>
  );
}
