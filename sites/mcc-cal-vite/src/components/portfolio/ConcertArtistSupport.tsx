import { useMemo, useState, type FC } from 'react';

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
    <section className={`pf-artist-support${open ? ' pf-artist-support--open' : ''}`}>
      <button
        type="button"
        className="pf-artist-support__toggle"
        aria-expanded={open}
        aria-controls="concert-artist-support-panel"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? 'Hide Artist Links' : 'Support the Artists'}
      </button>

      {open && (
        <div
          id="concert-artist-support-panel"
          className="pf-artist-support__panel"
          role="region"
          aria-label="Support the artists"
        >
          <div className="pf-artist-support__panel-header">
            <div>
              <h2 className="pf-artist-support__title">Support the Artists</h2>
              <p className="pf-artist-support__intro">
                Open each artist on Spotify. Embedded previews appear when a Spotify artist ID is
                already mapped from the original widget.
              </p>
            </div>

            <button
              type="button"
              className="pf-artist-support__close"
              aria-label="Close artist support panel"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>

          <ul className="pf-artist-support__list">
            {artists.map((artist) => {
              const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(artist.displayName)}`;

              return (
                <li key={artist.displayName} className="pf-artist-support__item">
                  <div className="pf-artist-support__item-header">
                    <div className="pf-artist-support__meta">
                      <h3 className="pf-artist-support__name">{artist.displayName}</h3>
                      {artist.dateDisplay && (
                        <p className="pf-artist-support__date">{artist.dateDisplay}</p>
                      )}
                    </div>

                    <a
                      className="pf-artist-support__link"
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </a>
                  </div>

                  {artist.spotifyArtistId ? (
                    <iframe
                      className="pf-artist-support__embed"
                      src={`https://open.spotify.com/embed/artist/${encodeURIComponent(artist.spotifyArtistId)}?utm_source=generator&theme=0`}
                      title={`Spotify player for ${artist.displayName}`}
                      loading="lazy"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    />
                  ) : (
                    <div className="pf-artist-support__placeholder">
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
