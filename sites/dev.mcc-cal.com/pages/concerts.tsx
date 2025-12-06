import Layout from '../components/Layout/Layout';
import { fetchManifest, getImageUrl, type Manifest } from '../utils/api-client';
import { GetServerSideProps } from 'next';
import Image from 'next/image';
import { useState } from 'react';

interface ConcertsPageProps {
  manifest: Manifest;
  error?: string;
}

export const getServerSideProps: GetServerSideProps<ConcertsPageProps> = async () => {
  try {
    const manifest = await fetchManifest('concert');
    return {
      props: { manifest },
    };
  } catch (error) {
    console.error('Failed to fetch concert manifest:', error);
    return {
      props: {
        manifest: { totalImages: 0 },
        error: 'Failed to load concert data',
      },
    };
  }
};

const ConcertsPage = ({ manifest, error }: ConcertsPageProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedBand, setSelectedBand] = useState<string | null>(null);

  if (error) {
    return (
      <Layout>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Concert Photography</h1>
          <p style={{ color: '#e74c3c' }}>{error}</p>
        </div>
      </Layout>
    );
  }

  const bands = manifest.bands || [];
  const filteredBands = selectedBand
    ? bands.filter(b => b.bandName === selectedBand)
    : bands;

  const allImages = filteredBands.flatMap(band =>
    band.concerts.flatMap(concert =>
      concert.images.map(img => ({
        ...img,
        bandName: band.bandName,
        concertDate: concert.date,
      }))
    )
  );

  return (
    <Layout>
      <section style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold' }}>
          Concert Photography
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          {manifest.totalImages} images across {bands.length} artists
        </p>

        {/* Band Filter */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedBand(null)}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '0.25rem',
              background: !selectedBand ? '#333' : 'white',
              color: !selectedBand ? 'white' : '#333',
              cursor: 'pointer',
            }}
          >
            All Bands
          </button>
          {bands.map(band => (
            <button
              key={band.bandName}
              onClick={() => setSelectedBand(band.bandName)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '0.25rem',
                background: selectedBand === band.bandName ? '#333' : 'white',
                color: selectedBand === band.bandName ? 'white' : '#333',
                cursor: 'pointer',
              }}
            >
              {band.bandName}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {allImages.map((img, idx) => (
            <div
              key={`${img.bandName}-${img.filename}`}
              style={{ cursor: 'pointer', position: 'relative', aspectRatio: '3/2' }}
              onClick={() => setLightboxIndex(idx)}
            >
              <Image
                src={getImageUrl(img.url)}
                alt={`${img.bandName} concert photo`}
                fill
                style={{ objectFit: 'cover', borderRadius: '0.5rem' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: 'white',
                  padding: '1rem',
                  borderRadius: '0 0 0.5rem 0.5rem',
                }}
              >
                <p style={{ fontWeight: 'bold', margin: 0 }}>{img.bandName}</p>
                <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.9 }}>
                  {img.concertDate}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Lightbox */}
        {lightboxIndex !== null && allImages[lightboxIndex] && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'white',
                border: 'none',
                width: '3rem',
                height: '3rem',
                borderRadius: '50%',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
              <Image
                src={getImageUrl(allImages[lightboxIndex].url)}
                alt={`${allImages[lightboxIndex].bandName} concert`}
                width={1200}
                height={800}
                style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
              />
            </div>
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  background: 'white',
                  border: 'none',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ‹
              </button>
            )}
            {lightboxIndex < allImages.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'white',
                  border: 'none',
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ›
              </button>
            )}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default ConcertsPage;
