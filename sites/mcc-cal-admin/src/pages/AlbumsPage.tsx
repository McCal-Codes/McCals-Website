import { useCallback, useEffect, useRef, useState } from 'react';
import SectionCard from '@/components/SectionCard';
import StatusBadge from '@/components/StatusBadge';

const PORTFOLIO_TYPES = ['journalism', 'concert', 'portrait', 'events', 'nature'] as const;
type PortfolioType = (typeof PORTFOLIO_TYPES)[number];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 50;
const UPLOAD_CONCURRENCY = 4;

type FileStatus = 'pending' | 'uploading' | 'success' | 'error';

interface UploadItem {
  id: string;
  file: File;
  status: FileStatus;
  error?: string;
  storagePath?: string;
}

interface PresignFileResult {
  filename: string;
  ok: boolean;
  storagePath?: string;
  uploadUrl?: string;
  contentType?: string;
  error?: string;
}

interface PresignResponse {
  ok: boolean;
  data?: { files: PresignFileResult[] };
  error?: string;
}

interface CompleteResponse {
  ok: boolean;
  data?: { inserted: number; skipped: Array<{ storagePath?: string; error: string }> };
  error?: string;
}

interface AlbumSummary {
  portfolioType: string;
  collectionName: string;
  count: number;
}

interface AlbumsListResponse {
  ok: boolean;
  data?: AlbumSummary[];
  error?: string;
}

interface AlbumImage {
  id: string;
  storage_path: string;
  filename: string;
  alt_text: string | null;
  caption: string | null;
  tags: string[] | null;
  is_featured: boolean;
  sort_order: number;
}

interface AlbumImagesResponse {
  ok: boolean;
  data?: { images: AlbumImage[] };
  error?: string;
}

function extOf(filename: string) {
  const match = /\.[a-z0-9]+$/i.exec(filename);
  return match ? match[0].toLowerCase() : '';
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function withConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  const queue = [...items];
  const runners = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      if (item === undefined) return;
      await worker(item);
    }
  });
  await Promise.all(runners);
}

function UploadTab() {
  const [portfolioType, setPortfolioType] = useState<PortfolioType>('journalism');
  const [collectionName, setCollectionName] = useState('');
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const incoming = Array.from(fileList);

    setItems((prev) => {
      const next = [...prev];
      for (const file of incoming) {
        if (next.length >= MAX_FILES) break;
        const ext = extOf(file.name);
        let error: string | undefined;
        if (!ALLOWED_EXTENSIONS.includes(ext)) error = 'Unsupported file type';
        else if (file.size > MAX_FILE_SIZE_BYTES) error = 'File exceeds 25MB';

        next.push({
          id: `${file.name}-${file.size}-${next.length}-${Date.now()}`,
          file,
          status: error ? 'error' : 'pending',
          error,
        });
      }
      return next;
    });
  }, []);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const resetForCollection = () => {
    setItems([]);
    setFormError(null);
  };

  const canSubmit =
    !submitting && collectionName.trim().length > 0 && items.some((item) => item.status === 'pending');

  const handleSubmit = async () => {
    setFormError(null);
    const pending = items.filter((item) => item.status === 'pending');
    if (!pending.length) return;

    setSubmitting(true);
    setItems((prev) => prev.map((item) => (item.status === 'pending' ? { ...item, status: 'uploading' } : item)));

    try {
      const presignRes = await fetch('/api/admin/albums/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioType,
          collectionName: collectionName.trim(),
          files: pending.map((item) => ({
            filename: item.file.name,
            size: item.file.size,
            contentType: item.file.type,
          })),
        }),
      });
      const presignJson = (await presignRes.json()) as PresignResponse;

      if (!presignRes.ok || !presignJson.ok || !presignJson.data) {
        throw new Error(presignJson.error || 'Failed to presign upload');
      }

      // Results are returned in the same order as the files we sent.
      const results = presignJson.data.files;
      const succeeded: string[] = [];

      await withConcurrency(
        pending.map((item, index) => ({ item, presigned: results[index] })),
        UPLOAD_CONCURRENCY,
        async ({ item, presigned }) => {
          if (!presigned?.ok || !presigned.uploadUrl || !presigned.storagePath) {
            setItems((prev) =>
              prev.map((entry) =>
                entry.id === item.id
                  ? { ...entry, status: 'error', error: presigned?.error ?? 'Could not get an upload URL' }
                  : entry,
              ),
            );
            return;
          }

          try {
            const putRes = await fetch(presigned.uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': presigned.contentType || item.file.type || 'application/octet-stream' },
              body: item.file,
            });
            if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

            succeeded.push(presigned.storagePath);
            setItems((prev) =>
              prev.map((entry) =>
                entry.id === item.id ? { ...entry, status: 'success', storagePath: presigned.storagePath } : entry,
              ),
            );
          } catch (err) {
            setItems((prev) =>
              prev.map((entry) =>
                entry.id === item.id
                  ? { ...entry, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
                  : entry,
              ),
            );
          }
        },
      );

      if (succeeded.length) {
        const completeRes = await fetch('/api/admin/albums/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioType,
            collectionName: collectionName.trim(),
            images: succeeded.map((storagePath) => ({ storagePath })),
          }),
        });
        const completeJson = (await completeRes.json()) as CompleteResponse;

        if (!completeRes.ok || !completeJson.ok) {
          setFormError(completeJson.error || 'Uploaded, but failed to save album metadata');
        } else if (completeJson.data?.skipped?.length) {
          const skippedPaths = new Set(completeJson.data.skipped.map((entry) => entry.storagePath));
          setItems((prev) =>
            prev.map((entry) =>
              entry.storagePath && skippedPaths.has(entry.storagePath)
                ? { ...entry, status: 'error', error: 'Could not confirm this file uploaded' }
                : entry,
            ),
          );
        }
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Upload failed');
      setItems((prev) =>
        prev.map((item) => (item.status === 'uploading' ? { ...item, status: 'error', error: 'Upload failed' } : item)),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionCard title="Upload a new album" eyebrow="Photos go straight to R2 and Supabase">
      <div className="form-row">
        <label className="form-field">
          <span className="form-field__label">Portfolio</span>
          <select value={portfolioType} onChange={(event) => setPortfolioType(event.target.value as PortfolioType)}>
            {PORTFOLIO_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="form-field__label">Collection name</span>
          <input
            type="text"
            value={collectionName}
            onChange={(event) => setCollectionName(event.target.value)}
            placeholder="e.g. Steel Strike 2026"
          />
        </label>
      </div>

      <div
        className={`dropzone${isDragging ? ' is-active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <p>Drag and drop images here, or click to choose files</p>
        <p className="upload-file-row__size">JPEG, PNG, or WebP · up to 25MB each · {MAX_FILES} files max</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {items.length > 0 ? (
        <div className="upload-file-list">
          {items.map((item) => (
            <div key={item.id} className="upload-file-row">
              <div>
                <p className="upload-file-row__name">{item.file.name}</p>
                <p className="upload-file-row__size">{formatBytes(item.file.size)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {item.status === 'pending' && <StatusBadge tone="pending" label="Pending" />}
                {item.status === 'uploading' && <StatusBadge tone="pending" label="Uploading" />}
                {item.status === 'success' && <StatusBadge tone="success" label="Uploaded" />}
                {item.status === 'error' && <StatusBadge tone="error" label={item.error ?? 'Error'} />}
                {item.status !== 'uploading' && (
                  <button type="button" className="button-link button-link--ghost" onClick={() => removeItem(item.id)}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {formError ? <p className="inline-error">{formError}</p> : null}

      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button type="button" className="button-link" disabled={!canSubmit} onClick={handleSubmit}>
          {submitting ? 'Uploading…' : 'Upload'}
        </button>
        <button type="button" className="button-link button-link--ghost" onClick={resetForCollection} disabled={submitting}>
          Clear
        </button>
      </div>
    </SectionCard>
  );
}

interface EditableFields {
  caption: string;
  alt_text: string;
  tags: string;
  is_featured: boolean;
}

function toEditableFields(image: AlbumImage): EditableFields {
  return {
    caption: image.caption ?? '',
    alt_text: image.alt_text ?? '',
    tags: (image.tags ?? []).join(', '),
    is_featured: image.is_featured,
  };
}

function ImageEditCard({
  image,
  publicUrlBase,
  onSave,
}: {
  image: AlbumImage;
  publicUrlBase: string;
  onSave: (fields: Partial<Pick<AlbumImage, 'caption' | 'alt_text' | 'tags' | 'is_featured'>>) => Promise<boolean>;
}) {
  const [fields, setFields] = useState<EditableFields>(() => toEditableFields(image));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFields(toEditableFields(image));
  }, [image]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    const ok = await onSave({
      caption: fields.caption.trim() || null!,
      alt_text: fields.alt_text.trim() || null!,
      tags: fields.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_featured: fields.is_featured,
    });
    setSaving(false);
    setSaved(ok);
  };

  return (
    <div className="image-card">
      <img className="image-card__thumb" src={`${publicUrlBase}/${image.storage_path}`} alt={fields.alt_text || image.filename} loading="lazy" />
      <p className="upload-file-row__size">{image.filename}</p>
      <div className="image-card__fields">
        <input
          type="text"
          placeholder="Caption"
          value={fields.caption}
          onChange={(event) => setFields((prev) => ({ ...prev, caption: event.target.value }))}
        />
        <input
          type="text"
          placeholder="Alt text"
          value={fields.alt_text}
          onChange={(event) => setFields((prev) => ({ ...prev, alt_text: event.target.value }))}
        />
        <input
          type="text"
          placeholder="Tags, comma separated"
          value={fields.tags}
          onChange={(event) => setFields((prev) => ({ ...prev, tags: event.target.value }))}
        />
        <div className="image-card__row">
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={fields.is_featured}
              onChange={(event) => setFields((prev) => ({ ...prev, is_featured: event.target.checked }))}
            />
            Featured
          </label>
          <button type="button" className="button-link button-link--ghost" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageTab({ publicUrlBase }: { publicUrlBase: string }) {
  const [albums, setAlbums] = useState<AlbumSummary[] | null>(null);
  const [albumsError, setAlbumsError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AlbumSummary | null>(null);
  const [images, setImages] = useState<AlbumImage[] | null>(null);
  const [imagesError, setImagesError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetch('/api/admin/albums')
      .then((res) => res.json() as Promise<AlbumsListResponse>)
      .then((json) => {
        if (!active) return;
        if (!json.ok || !json.data) throw new Error(json.error || 'Failed to load albums');
        setAlbums(json.data);
      })
      .catch((err) => {
        if (!active) return;
        setAlbumsError(err instanceof Error ? err.message : 'Failed to load albums');
      });

    return () => {
      active = false;
    };
  }, []);

  const openAlbum = async (album: AlbumSummary) => {
    setSelected(album);
    setImages(null);
    setImagesError(null);

    try {
      const res = await fetch(
        `/api/admin/albums/${encodeURIComponent(album.portfolioType)}/${encodeURIComponent(album.collectionName)}`,
      );
      const json = (await res.json()) as AlbumImagesResponse;
      if (!res.ok || !json.ok || !json.data) throw new Error(json.error || 'Failed to load album');
      setImages(json.data.images);
    } catch (err) {
      setImagesError(err instanceof Error ? err.message : 'Failed to load album');
    }
  };

  const saveImage = async (
    image: AlbumImage,
    fields: Partial<Pick<AlbumImage, 'caption' | 'alt_text' | 'tags' | 'is_featured'>>,
  ) => {
    try {
      const res = await fetch(`/api/admin/albums/images/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save');

      setImages((prev) => (prev ? prev.map((entry) => (entry.id === image.id ? { ...entry, ...fields } : entry)) : prev));
      return true;
    } catch {
      return false;
    }
  };

  return (
    <SectionCard title="Manage existing albums" eyebrow="Edit caption, alt text, tags, and featured status">
      {albumsError ? <p className="inline-error">{albumsError}</p> : null}

      {!selected ? (
        albums === null ? (
          <p className="upload-file-row__size">Loading albums…</p>
        ) : albums.length === 0 ? (
          <p className="upload-file-row__size">No albums yet — upload one from the Upload tab.</p>
        ) : (
          <div className="album-grid">
            {albums.map((album) => (
              <button
                key={`${album.portfolioType}-${album.collectionName}`}
                type="button"
                className="album-tile"
                onClick={() => openAlbum(album)}
              >
                <span className="upload-file-row__size">{album.portfolioType}</span>
                <strong>{album.collectionName}</strong>
                <span className="album-tile__count">{album.count} images</span>
              </button>
            ))}
          </div>
        )
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <button type="button" className="button-link button-link--ghost" onClick={() => setSelected(null)}>
            ← Back to albums
          </button>
          <h3>
            {selected.collectionName} <span className="upload-file-row__size">({selected.portfolioType})</span>
          </h3>

          {imagesError ? <p className="inline-error">{imagesError}</p> : null}

          {images === null ? (
            <p className="upload-file-row__size">Loading images…</p>
          ) : (
            <div className="image-grid">
              {images.map((image) => (
                <ImageEditCard
                  key={image.id}
                  image={image}
                  publicUrlBase={publicUrlBase}
                  onSave={(fields) => saveImage(image, fields)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}

export default function AlbumsPage() {
  const [tab, setTab] = useState<'upload' | 'manage'>('upload');
  // Vite inlines import.meta.env.VITE_* at build time; falls back to empty
  // so broken image srcs are obvious rather than silently pointing at "undefined".
  const publicUrlBase = (import.meta.env.VITE_R2_PUBLIC_URL || '').replace(/\/$/, '');

  return (
    <div className="page-grid">
      <div className="tab-strip">
        <button
          type="button"
          className={`tab-strip__button${tab === 'upload' ? ' is-active' : ''}`}
          onClick={() => setTab('upload')}
        >
          Upload
        </button>
        <button
          type="button"
          className={`tab-strip__button${tab === 'manage' ? ' is-active' : ''}`}
          onClick={() => setTab('manage')}
        >
          Manage
        </button>
      </div>

      {tab === 'upload' ? <UploadTab /> : <ManageTab publicUrlBase={publicUrlBase} />}
    </div>
  );
}
