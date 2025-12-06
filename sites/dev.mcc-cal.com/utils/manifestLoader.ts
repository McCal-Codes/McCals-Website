export async function loadManifest<T>(path: string, remoteUrl?: string): Promise<T> {
  const url = remoteUrl || path;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load manifest');
  return res.json();
}
