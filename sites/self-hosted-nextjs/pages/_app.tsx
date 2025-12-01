import '../styles/globals.css';
import '../styles/nav.css';
import '../styles/footer.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
