import { useMemo, useState, type FC } from 'react';
import { portfolioStyles } from './index';

interface ConcertBandSummary {
  bandName: string;
  dateDisplay?: string;
  concertDate?: { iso?: string };
}

interface SupportArtist {
  displayName: string;
  dateDisplay?: string;
  latestIso?: string;
  spotifyArtistId?: string;
}

interface ConcertArtistSupportProps {
  bands: ConcertBandSummary[];
}

const SPOTIFY_ARTIST_MAP: Record<string, string> = {
  Horseburner: '6yQwlVvYdvOdzTkFGJCtzf',
  'Star Viper': '1hTGL0YIhETlizymMG0h1G',
};

const NORMALIZED_SPOTIFY_ARTIST_MAP = Object.fromEntries(
  Object.entries(SPOTIFY_ARTIST_MAP).map(([name, id]) => [name.trim().toLowerCase(), id]),
);

function buildSupportArtists(bands: ConcertBandSummary[]): SupportArtist[] {
  const uniqueArtists = new Map<string, SupportArtist>();

  for (const band of bands) {
    const displayName = band.bandName?.trim();
    if (!displayName) continue;

    const key = displayName.toLowerCase();
    const latestIso = band.concertDate?.iso ?? '';
    const previous = uniqueArtists.get(key);

    if (!previous || latestIso > (previous.latestIso ?? '')) {
      uniqueArtists.set(key, {
        displayName,
        dateDisplay: band.dateDisplay,
        latestIso,
        spotifyArtistId: NORMALIZED_SPOTIFY_ARTIST_MAP[key],
      });
    }
  }

  return Array.from(uniqueArtists.values()).sort((left, right) => {
    if (left.latestIso && right.latestIso && left.latestIso !== right.latestIso) {
      return left.latestIso > right.latestIso ? -1 : 1;
    }

    return left.displayName.localeCompare(right.displayName, undefined, {
      sensitivity: 'base',
    });
  });
}

const ConcertArtistSupport: FC<ConcertArtistSupportProps> = ({ bands }) => {
  const [open, setOpen] = useState(false);
  const artists = useMemo(() => buildSupportArtists(bands), [bands]);

  if (artists.length === 0) return null;

  return (
    <section className={`${portfolioStyles.pfArtistSupport}${open ? ` ${portfolioStyles.pfArtistSupportOpen}` : ''}`}>
      <button
        type="button"
        className={portfolioStyles.pfArtistSupportToggle}
        aria-expanded={open}
        aria-controls="concert-artist-support-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? 'Hide Artist Links' : 'Support the Artists'}
      </button>

      {open && (
        <div
          id="concert-artist-support-panel"
          className={portfolioStyles.pfArtistSupportPanel}
          role="region"
          aria-label="Support the artists"
        >
          <div className={portfolioStyles.pfArtistSupportPanelHeader}>
            <div>
              <h2 className={portfolioStyles.pfArtistSupportTitle}>Support the Artists</h2>
              <p className={portfolioStyles.pfArtistSupportIntro}>
                Open each artist on Spotify. Embedded previews appear when a Spotify artist ID is
                already mapped from the original widget.
              </p>
            </div>

            <button
              type="button"
              className={portfolioStyles.pfArtistSupportClose}
              aria-label="Close artist support panel"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          <ul className={portfolioStyles.pfArtistSupportList}>
            {artists.map((artist) => {
              const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(artist.displayName)}`;

              return (
                <li key={artist.displayName} className={portfolioStyles.pfArtistSupportItem}>
                  <div className={portfolioStyles.pfArtistSupportItemHeader}>
                    <div className={portfolioStyles.pfArtistSupportMeta}>
                      <h3 className={portfolioStyles.pfArtistSupportName}>{artist.displayName}</h3>
                      {artist.dateDisplay && (
                        <p className={portfolioStyles.pfArtistSupportDate}>{artist.dateDisplay}</p>
                      )}
                    </div>

                    <a
                      className={portfolioStyles.pfArtistSupportLink}
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </a>
                  </div>

                  {artist.spotifyArtistId ? (
                    <iframe
                      className={portfolioStyles.pfArtistSupportEmbed}
                      src={`https://open.spotify.com/embed/artist/${encodeURIComponent(artist.spotifyArtistId)}?utm_source=generator&theme=0`}
                      title={`Spotify player for ${artist.displayName}`}
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    />
                  ) : (
                    <div className={portfolioStyles.pfArtistSupportPlaceholder}>
                      No embedded Spotify preview is mapped yet. Use Open to search the artist.
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
};

export default ConcertArtistSupport;
