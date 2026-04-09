import Layout from '@/components/Layout/Layout';
import styles from '@/styles/comingSoon.module.css';

interface ComingSoonProps {
  title: string;
}

export const ComingSoon = ({ title }: ComingSoonProps) => {
  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.card}>
          <span className={styles.badge}>Coming Soon</span>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.description}>
            As I am migrating my site to Vite and TypeScript, some pages may not be fully converted.
            Check back soon for the complete experience.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default ComingSoon;
