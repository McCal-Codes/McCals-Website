/// <reference types="vite/client" />

// Vercel exposes these to Vite builds. Declared so reading them is typed.
interface ImportMetaEnv {
  /** production, preview or development. */
  readonly VITE_VERCEL_ENV?: string;
  /** The commit a deployment was built from. Previews read photographs at this ref. */
  readonly VITE_VERCEL_GIT_COMMIT_SHA?: string;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.css' {
  const css: string;
  export default css;
}

declare module '*.webp' {
  const src: string;
  export default src;
}
