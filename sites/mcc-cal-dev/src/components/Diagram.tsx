import type { DiagramSpec } from '@/content/types';
import styles from './Diagram.module.css';

interface DiagramProps {
  spec: DiagramSpec;
}

/**
 * A vertical flow diagram, drawn in HTML rather than SVG.
 *
 * HTML means the node labels are real text: selectable, translatable, reflowing on
 * narrow screens, and readable by a screen reader without a parallel description
 * going stale. `spec.description` still covers the flow itself, which is the part
 * the markup cannot convey.
 */
export default function Diagram({ spec }: DiagramProps) {
  return (
    <figure className={styles.figure}>
      <div className={styles.flow} role="img" aria-label={spec.description}>
        {spec.nodes.map((node, i) => {
          const edgeLabel = spec.edgeLabels?.[i] ?? null;
          const isLast = i === spec.nodes.length - 1;

          return (
            <div className={styles.step} key={node.id}>
              <div className={styles.node}>
                <span className={styles.nodeLabel}>{node.label}</span>
                {node.note && <span className={`${styles.nodeNote} meta`}>{node.note}</span>}
              </div>

              {!isLast && (
                <div className={styles.edge} aria-hidden="true">
                  <span className={styles.arrow}>↓</span>
                  {edgeLabel && <span className={`${styles.edgeLabel} meta`}>{edgeLabel}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </figure>
  );
}
