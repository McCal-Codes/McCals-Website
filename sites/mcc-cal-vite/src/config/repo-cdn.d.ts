export interface CdnEnv {
  VITE_VERCEL_ENV?: string;
  VITE_VERCEL_GIT_COMMIT_SHA?: string;
  VERCEL_ENV?: string;
  VERCEL_GIT_COMMIT_SHA?: string;
}

export const REPO_CDN_ORIGIN: string;
export const PRODUCTION_REF: string;
export const OPTIMIZABLE_CDN_PATHNAME: string;
export function resolveCdnRef(env?: CdnEnv): string;
export function repoCdnBase(env?: CdnEnv): string;
export function isOptimizableCdnUrl(url: string): boolean;
