import { useState, useEffect } from 'react';
import { Layout } from '@/components';
import { imageUrl } from '@/components/portfolio';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import { PDFViewer } from '@/components/PDFViewer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GalleryFigure } from '@/components/one-nation/GalleryFigure';
import { FieldNoteCard } from '@/components/one-nation/FieldNoteCard';
import { ProseSection } from '@/components/one-nation/ProseSection';
import { ThemedLink } from '@/components/one-nation/ThemedLink';
import type { DisplayImage, TrailImage, ProseInlinePhotoProps } from '@/types/one-nation';
import styles from './one-nation-divided.module.css';

// Simple SVG placeholder as data URI - always available, no 404 risk
const FALLBACK_IMAGE_SRC = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 600%22%3E%3Crect fill=%22%23e5e7eb%22 width=%22800%22 height=%22600%22/%3E%3Ctext fill=%22%239ca3af%22 font-family=%22sans-serif%22 font-size=%2224%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22%3EImage not available%3C/text%3E%3C/svg%3E';

// Cache fallback image data to avoid recreating on every lookup miss
const FALLBACK_IMAGE_DATA = {
  src: FALLBACK_IMAGE_SRC,
  width: 800,
  height: 600,
  alt: 'Image not available',
};

function validateSiteUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Only allow https protocol and specific allowed domains
    if (parsed.protocol !== 'https:') {
      console.warn('SITE_URL must use https protocol, falling back to default');
      return 'https://mcc-cal.com';
    }
    return url.replace(/\/$/, '');
  } catch {
    console.warn('Invalid SITE_URL, falling back to default');
    return 'https://mcc-cal.com';
  }
}

const SITE_URL = validateSiteUrl(import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com');
const EXHIBITION_YEAR = 2026;
const EXHIBITION_DATE = 'April 7, 2026';
const EXHIBITION_IMAGE_BASE = '/images/bfa-thesis/exhibition-show/webp';
const PROSE_IMAGE_SIZES = '(min-width: 768px) 640px, calc(100vw - 2.5rem)';
const GALLERY_IMAGE_SIZES = '(min-width: 1120px) 1100px, (min-width: 700px) 50vw, calc(100vw - 2.5rem)';

const HERO_IMAGE = {
  src: `${EXHIBITION_IMAGE_BASE}/one-nation-divided-hero.webp`,
  width: 2400,
  height: 1597,
};

/** Exhibition photographs from the actual show at Artists Image Resource (AIR), Pittsburgh. **/
const EXHIBITION_IMAGES: DisplayImage[] = [
  {
    id: 'show-01',
    src: `${EXHIBITION_IMAGE_BASE}/2026-04-07_Letting it Go Exibition Thesis Show_CAL2622.webp`,
    width: 3000,
    height: 2000,
    alt: 'Caleb McCartney stands with his grandparents next to political artwork installations during the One Nation Divided exhibition opening at Artists Image Resource.',
    sceneCaption:
      `Caleb McCartney, who is 5 feet 10 inches tall, stands with his grandparents beside 30-by-30-inch works from One Nation Divided at Artists Image Resource in Pittsburgh, ${EXHIBITION_DATE}. The photograph shows the physical scale of the pieces in relation to the artist and his family. (Photo by Caleb McCartney)`,
    gallery: { large: true },
    field: {
      kicker: 'Personal',
      title: 'Generations',
      body: [
        'The family portrait gives the work a body scale: 30-by-30-inch pieces beside me at 5 feet 10 inches, with my grandparents standing in the same room as the finished thesis.',
      ],
    },
  },
  {
    id: 'show-02',
    src: `${EXHIBITION_IMAGE_BASE}/2026-04-07_Letting it Go Exibition Thesis Show_CAL2677.webp`,
    width: 3000,
    height: 2000,
    alt: 'Large 30" by 30" political artwork mounted on white gallery wall with bold text and imagery, part of the One Nation Divided exhibition.',
    sceneCaption:
      `A 30" by 30" work from One Nation Divided displayed at Artists Image Resource in Pittsburgh, ${EXHIBITION_DATE}. The large format allows the layered political imagery to command attention and space. (Photo by Caleb McCartney)`,
    gallery: { large: true },
    field: {
      kicker: 'Work',
      title: 'Large format',
      body: [
        'At 30" by 30", these pieces demand physical space, refusing to be scrolled past or minimized like social media content.',
      ],
    },
  },
  {
    id: 'show-03',
    src: `${EXHIBITION_IMAGE_BASE}/one-nation-divided-artist-statement.webp`,
    width: 1600,
    height: 1421,
    alt: 'Cropped view of Caleb McCartney’s One Nation Divided artist statement mounted on a gallery wall.',
    sceneCaption:
      `Artist statement detail displayed at One Nation Divided exhibition, Artists Image Resource, Pittsburgh, ${EXHIBITION_DATE}. The statement contextualizes the photographic work within the broader thesis research, and the full text appears as readable HTML on this page. (Photo by Caleb McCartney)`,
    gallery: { centered: true },
    field: {
      kicker: 'Statement',
      title: 'Artist statement',
      body: [
        'The gallery photograph preserves the installation context, while the page text makes the statement readable, searchable, and accessible.',
      ],
    },
  },
  {
    id: 'show-04',
    src: `${EXHIBITION_IMAGE_BASE}/2026-04-07_Letting it Go Exibition Thesis Show_CAL2715.webp`,
    width: 3000,
    height: 2000,
    alt: 'Series of smaller framed political portraits showing individual candidates, displayed as part of the One Nation Divided exhibition.',
    sceneCaption:
      `Smaller candidate portraits from One Nation Divided at Artists Image Resource, Pittsburgh, ${EXHIBITION_DATE}. These intimate frames suggest that political figures are not everything—they exist because of people, not the other way around. (Photo by Caleb McCartney)`,
    gallery: {},
    field: {
      kicker: 'Context',
      title: 'Not everything',
      body: [
        'These smaller frames show candidates as they are: people shaped by movements, not movements shaped by individuals. The size matters.',
      ],
    },
  },
  {
    id: 'show-05',
    src: `${EXHIBITION_IMAGE_BASE}/one-nation-divided-show-05.webp`,
    width: 2200,
    height: 1464,
    alt: 'Close view of a polarized political graphic with campaign imagery and overlapping text.',
    sceneCaption:
      `A polarized political graphic from One Nation Divided is shown at Artists Image Resource in Pittsburgh, ${EXHIBITION_DATE}. The image compresses campaign imagery, text and color into one visual field. (Photo by Caleb McCartney)`,
    gallery: {},
    field: {
      kicker: 'Work',
      title: 'Visual technique',
      body: [
        'The treatment lets competing details remain visible at the same time, which mirrors the thesis argument about noise and projection.',
      ],
    },
  },
  {
    id: 'show-06',
    src: `${EXHIBITION_IMAGE_BASE}/one-nation-divided-show-06.webp`,
    width: 2200,
    height: 1464,
    alt: 'Gallery wall with polarized political works arranged in a linear sequence.',
    sceneCaption:
      `Works from One Nation Divided are arranged in sequence along a gallery wall at Artists Image Resource in Pittsburgh, ${EXHIBITION_DATE}. (Photo by Caleb McCartney)`,
    gallery: {},
    field: {
      kicker: 'Installation',
      title: 'Sequential arrangement',
      body: [
        'The wall sequence gives the page a readable structure, moving from the room to the individual works.',
      ],
    },
  },
  {
    id: 'show-07',
    src: `${EXHIBITION_IMAGE_BASE}/one-nation-divided-show-07.webp`,
    width: 2200,
    height: 1464,
    alt: 'Visitors discuss works during the One Nation Divided exhibition opening at Artists Image Resource.',
    sceneCaption:
      `Visitors talk near works from One Nation Divided during the opening at Artists Image Resource in Pittsburgh, ${EXHIBITION_DATE}. (Photo by Caleb McCartney)`,
    gallery: { centered: true },
    field: {
      kicker: 'Opening',
      title: 'Audience engagement',
      body: [
        'The opening gave the work a social life, with viewers bringing their own assumptions into the room.',
      ],
    },
  },
  {
    id: 'show-08',
    src: `${EXHIBITION_IMAGE_BASE}/one-nation-divided-show-08.webp`,
    width: 2200,
    height: 1464,
    alt: 'Final exhibition wall with political graphics installed under gallery lighting and visitors in the background.',
    sceneCaption:
      `The final wall of One Nation Divided is installed under gallery lighting at Artists Image Resource in Pittsburgh, ${EXHIBITION_DATE}, with visitors in the background. (Photo by Caleb McCartney)`,
    gallery: { large: true },
    field: {
      kicker: 'Installation',
      title: 'Final presentation',
      body: [
        'The final wall closes the exhibition section with the works held in their finished public setting.',
      ],
    },
  },
];

const TRAIL_IMAGES: TrailImage[] = [
  {
    id: 'butler',
    folderPath: 'Politics/trump-returns-butler',
    filename: '051024_Trump_Returns_Butler_PA_CAL2649.webp',
    width: 6166,
    height: 4625,
    alt:
      'Republican presidential nominee Donald Trump at an outdoor campaign rally in Butler, Pa., surrounded by supporters and security.',
    sceneCaption:
      'Republican presidential nominee Donald Trump appears Oct. 5, 2024, at a campaign rally in Butler, Pa., as supporters and security cluster near the stage area in late-day light. (Photo by Caleb McCartney)',
    gallery: {},
    field: {
      kicker: 'Butler',
      title: 'Three calls, two sides',
      body: [
        'It took three well-timed phone calls. The last contact got me in with the person who organized for one side. The other side needed more convincing. I put in the effort.',
      ],
    },
  },
  {
    id: 'erie-night',
    folderPath: 'Politics/tim-walz-erie',
    filename: '050924_Tim_Walz_Erie_PA.png',
    width: 1024,
    height: 683,
    alt:
      'Minnesota Gov. Tim Walz moves through a crowd of supporters at a campaign rally in Erie, Pa.',
    sceneCaption:
      'Minnesota Gov. Tim Walz moves through a tight crowd of supporters Sept. 5, 2024, at a campaign rally at the Highmark Amphitheater in Erie, Pa. People press in from all sides, several holding up phones to record as late-day light cuts across faces in the foreground. (Photo by Caleb McCartney)',
    gallery: {},
    field: {
      kicker: 'Erie',
      title: 'Filed at 3 a.m.',
      body: [
        'This frame is Walz in Erie on Sept. 5, 2024. The longer memory of another Erie night is the filing deadline, the drive home, and the body finally forcing me to stop.',
      ],
    },
  },
  {
    id: 'obama-pitt-campus',
    folderPath: 'Politics/obama-speaks-pitt',
    filename: '101024_Obama Speaks at Pittsburgh_CAL3017.jpg',
    width: 1080,
    height: 720,
    alt:
      'Supporters wait behind metal barricades near a Pitt sign before a campaign rally at the University of Pittsburgh in Pittsburgh, Pa.',
    sceneCaption:
      'Supporters wait outside a campaign rally with former President Barack Obama Oct. 10, 2024, at the University of Pittsburgh in Pittsburgh, Pa. The campus setting placed the assignment inside the everyday movement of students, city traffic, and campaign logistics. (Photo by Caleb McCartney)',
    gallery: {},
    field: {
      kicker: 'Pittsburgh',
      title: 'Campus approach',
      body: [
        'The Pitt event began before the podium. The line, barricades, campus signs, and credentials all became part of the photographable story before Obama walked onstage.',
      ],
    },
  },
  {
    id: 'obama-pitt-pit',
    folderPath: 'Politics/obama-speaks-pitt',
    filename: '101024_Obama Speaks at Pittsburgh_CAL3364.jpg',
    width: 1080,
    height: 720,
    alt:
      'Former President Barack Obama smiles from a campaign podium with a Harris-Walz sign and a crowd behind him at the University of Pittsburgh in Pittsburgh, Pa.',
    sceneCaption:
      'Former President Barack Obama smiles from the stage during a campaign rally Oct. 10, 2024, at the University of Pittsburgh in Pittsburgh, Pa. The frame was made from the photographer pit as campaign staging, teleprompter glass, and crowd response converged in one view. (Photo by Caleb McCartney)',
    gallery: { large: true },
    field: {
      kicker: 'Pittsburgh',
      title: 'From the pit',
      body: [
        'Getting into the photographer pit with the other photographers changed the scale of the work. It was close, crowded, timed, and professional in a way that made the campaign trail feel immediate.',
      ],
    },
  },
  {
    id: 'obama-pitt-crowd',
    folderPath: 'Politics/obama-speaks-pitt',
    filename: '101024_Obama Speaks at Pittsburgh_CAL5978.jpg',
    width: 1080,
    height: 721,
    alt:
      'Supporters cheer during a campaign rally with former President Barack Obama at the University of Pittsburgh in Pittsburgh, Pa.',
    sceneCaption:
      'Supporters cheer during a campaign rally with former President Barack Obama Oct. 10, 2024, at the University of Pittsburgh in Pittsburgh, Pa. Faces, phones, campaign buttons, and local sports gear fold national politics into a specific Pittsburgh crowd. (Photo by Caleb McCartney)',
    gallery: {},
    field: {
      kicker: 'Pittsburgh',
      title: 'Crowd response',
      body: [
        'The pit gave me access to the stage, but the crowd still carried the event. The reaction shots show politics as shared atmosphere, not just a speaker behind a microphone.',
      ],
    },
  },
  {
    id: 'press-pen',
    folderPath: 'Politics/jdvance-johnstown',
    filename: '241012_JD Vance in Johnstown_CAL3630.webp',
    width: 1080,
    height: 720,
    alt:
      'Republican vice presidential nominee J.D. Vance speaks at a campaign podium with a raised finger; a U.S. flag and bleachers of supporters are behind him in Johnstown, Pa.',
    sceneCaption:
      'Republican vice presidential nominee J.D. Vance speaks Oct. 12, 2024, in Johnstown, Pa., with one hand raised at a podium branded for the Trump-Vance ticket. A large U.S. flag hangs behind him while supporters fill the bleachers, with heads and shoulders in the foreground emphasizing the view from inside the press area.',
    gallery: { large: true },
    field: {
      kicker: 'Johnstown',
      title: 'What the feed smooths out',
      body: [
        'From the pen you watch the choreography everyone shares online, only you are close enough to see when the smile holds a beat too long or the crowd noise does not match the clip.',
      ],
    },
  },
];

const ARTIST_STATEMENT = {
  name: 'Caleb McCartney',
  title: 'One Nation Divided',
  body: [
    'Today’s politics feel like a constant tug-of-war between hope and fear, where everyone is desperate for change, yet fractures keep growing. I stand amid these tensions, pointing my lens at moments of raw energy—justice, power, and recognition.',
    'Photographing them isn’t just about documentation; it’s where I wrestle with my anxieties, guided by Carl Jung’s idea of the “shadow.” I notice a collective longing in those quiet moments between speeches, when silence lingers, and we can finally let go of our debates—if only for a second. We all want something more, even though we chase it in scattered ways.',
    'Over time, this process has forced me to see the fragile seams that bind us together and break us apart. Through my work, I’m trying to capture not just the slogans or the cheers but the more profound questions about who we are and why we’re so uneasy in this fractured yet hopeful landscape.',
  ],
};

// Create lookup map for performance optimization
const TRAIL_IMAGE_MAP = new Map(
  TRAIL_IMAGES.map(img => [img.id, img])
);

function trailPhoto(id: TrailImage['id']) {
  const frame = TRAIL_IMAGE_MAP.get(id);
  if (!frame) {
    // Log to console only in development
    if (import.meta.env.DEV) {
      console.error(`Unknown trail frame: ${id}`);
    }
    // Return cached fallback image data (data URI - always available)
    return {
      ...FALLBACK_IMAGE_DATA,
      alt: `Image not available: ${id}`,
    };
  }
  return {
    src: frame.src ?? imageUrl.journalism(frame.folderPath, frame.filename),
    width: frame.width,
    height: frame.height,
    alt: frame.alt,
  };
}

function ProseInlinePhoto({
  src,
  width,
  height,
  alt,
  caption,
}: ProseInlinePhotoProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <figure className={styles.proseInlineFigure}>
      <div className={styles.proseInlineImgWrap}>
        {!isLoaded && (
          <div
            style={{
              width: '100%',
              aspectRatio: width && height ? `${width}/${height}` : '16/9',
              background: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              fontSize: '14px',
            }}
          >
            Loading image...
          </div>
        )}
        <img
          src={src}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
          sizes={PROSE_IMAGE_SIZES}
          onLoad={() => setIsLoaded(true)}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            position: isLoaded ? 'relative' : 'absolute',
            visibility: isLoaded ? 'visible' : 'hidden',
          }}
        />
      </div>
      <figcaption className={styles.proseInlineCaption}>{caption}</figcaption>
    </figure>
  );
}

/** Open prompts for the reader: no party, no score, no correct answer */
const READER_QUESTIONS: string[] = [
  'When you see a campaign photograph online, what do you assume happened before and after the frame?',
  'What sits outside the edge of the frame, in the picture, and in the argument you are rehearsing in your head?',
  'If you slowed your news intake for one week, what would you be afraid of missing? Is that fear about information, or about identity?',
  'Can you describe a position you oppose in language its holders would recognize as fair?',
  'What changes if you treat an image as a question instead of proof?',
  'Who benefits when you are completely sure you are right?',
  'When was the last time you changed your mind in public, and what did it cost you?',
];

/** Personal writing from a different project, not part of the BFA thesis or this capstone */
const WRITING_NOT_THESIS: { slug: string; label: string }[] = [
  { slug: 'fear-of-emotion', label: 'Fear of emotion' },
  { slug: 'living-breathing-dying', label: 'Living, breathing, dying' },
  { slug: 'all-i-hear-is-the-deafening-silence', label: 'All I hear is the deafening silence' },
  { slug: 'a-conversation-with-myself', label: 'A conversation with myself' },
  { slug: 'body-remembers', label: 'The body remembers' },
];

/** Other blog essays (not framed as thesis material) */
const BLOG_LINKS_OTHER: { slug: string; label: string }[] = [
  { slug: 'the-capitalist-contradiction', label: 'The capitalist contradiction' },
  { slug: 'in-the-shadow-of-loss', label: 'In the shadow of loss' },
];

/** Combined list (not-from-thesis entries first). Use for iteration or any reference to `BLOG_LINKS`. */
const BLOG_LINKS: { slug: string; label: string }[] = [...WRITING_NOT_THESIS, ...BLOG_LINKS_OTHER];

/** Web-stable references for works cited or paraphrased in the short text below (not a formal bibliography). */
const SOURCES_CONTEXT: { label: string; href: string; detail: string }[] = [
  {
    label: 'Citing Jung\'s Collected Works (CW)',
    href: 'https://www.pacifica.edu/student-services/graduate-research-library/citing-collected-works-c-g-jung/',
    detail:
      'Pacifica Graduate Institute library guide: standard paragraph references for the Bollingen / Princeton Collected Works, including CW 16 (The Practice of Psychotherapy).',
  },
  {
    label: 'Society of Analytical Psychology: The Jungian shadow',
    href: 'https://www.thesap.org.uk/articles-on-jungian-psychology-2/about-analysis-and-therapy/the-shadow/',
    detail:
      'Clinical introduction to shadow and projection in Jungian analysis (secondary, practitioner-oriented).',
  },
  {
    label: 'Roland Barthes, Camera Lucida (1980)',
    href: 'https://en.wikipedia.org/wiki/Camera_Lucida_(book)',
    detail:
      'English trans. Richard Howard, Hill and Wang. Summarizes Barthes\'s terms studium and punctum and his use of Kafka\'s remark on photography (via Gustav Janouch).',
  },
  {
    label: 'Neil Postman, Amusing Ourselves to Death (1985)',
    href: 'https://en.wikipedia.org/wiki/Amusing_Ourselves_to_Death',
    detail: 'Public discourse in the age of television: politics, news, and entertainment as show business.',
  },
  {
    label: 'John Berger, Ways of Seeing (1972)',
    href: 'https://www.ways-of-seeing.com/ch1',
    detail:
      'Chapter 1 of the book tied to the BBC series. Includes the line on looking at the relation between things and ourselves.',
  },
  {
    label: 'American Flag Color Symbolism',
    href: 'https://www.britannica.com/topic/Why-Is-the-US-Flag-Red-White-and-Blue',
    detail:
      'Britannica: Historical context of U.S. flag colors, Charles Thomson\'s 1782 interpretation (white=purity, red=valor, blue=vigilance/justice).',
  },
  {
    label: 'American Flag HEX Codes',
    href: 'https://www.colorwithleo.com/what-hex-codes-are-the-american-flag-colors/',
    detail:
      'Technical specifications: #B22234 (Old Glory Red), #FFFFFF (White), #3C3B6E (Old Glory Blue) for digital rendering of flag colors.',
  },
  {
    label: 'Richard Hamilton, Pop Art Pioneer (1956)',
    href: 'https://smarthistory.org/richard-hamilton-just-what-is-it/',
    detail:
      'SmartHistory: Hamilton\'s 1956 collage as first Pop Art work, celebrating and critiquing consumer culture and the American Dream.',
  },
  {
    label: 'Pop Art and Nuclear Anxiety',
    href: 'https://digitalcommons.memphis.edu/cgi/viewcontent.cgi?article=2904&context=etd',
    detail:
      'Academic thesis: Pop art (Warhol, Lichtenstein, Wesselmann) as manifestation of postwar nuclear anxieties and American Dream propaganda.',
  },
];

const OneNationDividedPage = () => {
  usePageMeta({
    title: 'One Nation Divided (Letting Me Go) | Thesis & Exhibition | Caleb McCartney',
    description:
      'Understanding the Noise of Today’s Political Climate: BFA thesis and Letting Me Go exhibition at Artists Image Resource on political anxiety, Jung’s shadow, campaign coverage, and performance versus reality in American politics.',
    canonical: `${SITE_URL}/letting-me-go`,
    og: {
      type: 'website',
      title: 'One Nation Divided (Letting Me Go) | Caleb McCartney',
      description: 'Thesis and exhibition: political anxiety, shadow and projection, photojournalism, and the line between spectacle and truth.',
      image: `${SITE_URL}${HERO_IMAGE.src}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'One Nation Divided (Letting Me Go) | Caleb McCartney',
      description: 'Thesis and exhibition: political anxiety, photojournalism, and performance versus reality.',
      image: `${SITE_URL}${HERO_IMAGE.src}`,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: 'One Nation Divided',
      alternateName: ['Letting Me Go', 'Understanding the Noise of Today’s Political Climate'],
      url: `${SITE_URL}/letting-me-go`,
      image: `${SITE_URL}${HERO_IMAGE.src}`,
      dateCreated: EXHIBITION_YEAR,
      locationCreated: {
        '@type': 'Place',
        name: 'Artists Image Resource',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pittsburgh',
          addressRegion: 'PA',
          addressCountry: 'US',
        },
      },
      description:
        'BFA photography thesis and exhibition examining political anxiety through Carl Jung’s shadow, campaign-trail photojournalism, install documentation at AIR, and the tension between performance and reality.',
      creator: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
        sameAs: ['https://www.linkedin.com/in/calebmccartney/', 'https://www.instagram.com/calebmccartney/'],
      },
    },
  });

  // Add body class for nav styling on this page only
  useEffect(() => {
    document.body.classList.add('lmgo-active');
    return () => {
      document.body.classList.remove('lmgo-active');
    };
  }, []);

  return (
    <Layout>
      <div className={styles.lmgoRoot}>
        <header className={styles.hero}>
          <img
            className={styles.heroBackdrop}
            src={HERO_IMAGE.src}
            width={HERO_IMAGE.width}
            height={HERO_IMAGE.height}
            alt="One Nation Divided exhibition at Artists Image Resource, Pittsburgh - political artwork installations by Caleb McCartney"
            decoding="async"
            fetchPriority="high"
            sizes="100vw"
            aria-hidden="true"
          />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>Thesis · Exhibition · {EXHIBITION_YEAR}</p>
            <h1 className={styles.title}>One Nation Divided</h1>
            <p className={styles.subtitle}>Letting Me Go</p>
            <p className={styles.thesisTitle}>
              Understanding the Noise of Today’s Political Climate
            </p>
            <p className={styles.venue}>
              BFA Photography, Point Park University · Exhibition at Artists Image Resource (AIR), Pittsburgh
            </p>
          </div>
        </header>

        <div className={styles.epigraphWrap}>
          <blockquote className={styles.epigraph} cite={`${SITE_URL}/letting-me-go`}>
            The shadow is, as Jung wrote, “the thing a person has no wish to be.” It is the side of us we rarely show
            others, yet it profoundly influences how we interact with the world.
            <cite>
              Carl Jung, <em>The Practice of Psychotherapy</em> (CW 16), §470, in “The Psychology of the Transference”
              (standard English ed., Bollingen / Princeton University Press). In the thesis this is cited in running text as
              (Jung, 1966, para. 470), with the full entry in the References list.
            </cite>
          </blockquote>
        </div>

        <div className={`${styles.epigraphWrap} pt-0`}>
          <div className={styles.abstractBox}>
            <p className={styles.abstractLabel}>Abstract</p>
            <p className={styles.abstractText}>
              Political anxiety has intensified as ideological divisions deepen, turning engagement into an emotional
              battleground. Beyond policy, politics has become a space where identity, fear, and belonging intersect, where
              people defend beliefs as extensions of themselves, so that opposition feels like a direct threat.
            </p>
            <p className={styles.abstractText}>
              In the thesis I examine that anxiety through Jung’s (1966) account of the shadow: how individuals and groups
              project suppressed fears onto adversaries, and how the collective shadow helps explain polarization that goes
              deeper than ideology. Through photojournalism on the campaign trail, I trace the tension between performance
              and reality: photography as documentation and as a way to ask what drives us when the crowd goes quiet.
            </p>
          </div>
        </div>

        <div className={`${styles.epigraphWrap} pt-0`}>
          <aside className={styles.questionsBlock} aria-labelledby="reader-questions-heading">
            <p className={styles.questionsLabel}>For you</p>
            <h2 id="reader-questions-heading" className={styles.questionsTitle}>
              Questions
            </h2>
            <p className={styles.questionsPreface}>
              This piece is not a lecture. I am not grading your answers. If anything here is useful, it is as a mirror. Hold
              it lightly.
            </p>
            <ul className={styles.questionsList}>
              {READER_QUESTIONS.map((q) => (
                <li key={q} className={styles.questionItem}>
                  {q}
                </li>
              ))}
            </ul>
            <p className={styles.questionsFootnote}>
              There are no correct answers here. The work stays open on purpose.
            </p>
          </aside>
        </div>

        <div className={styles.prose}>
          <ProseSection label="I" title="What this was" headingId="what-this-was">
            <p className={styles.body}>
              This capstone paired a written thesis with a mounted show at AIR under one question: what does it feel like
              to live inside today's political noise? The work moves between theory and field, between Jung's (1966) account
              of what we disown in ourselves and the rallies where those dynamics become visible: Tim Walz in Erie, Trump
              returning
              to Butler, and every other stop where belief, performance, and fear shared the same air.
            </p>
            <p className={styles.body}>
              The photographs are not illustrations of a paper. They are evidence from events where policy talk sits next
              to raw emotion, where the story is as psychological as it is electoral.
            </p>
          </ProseSection>

          <hr className={styles.rule} aria-hidden="true" />

          <ProseSection label="II" title="Shadow and projection" headingId="shadow-projection">
            <p className={styles.body}>
              In Jungian accounts of the shadow, projection is the habit of locating in other people what we will not
              acknowledge in ourselves (Jung, 1966). On a political level that move becomes collective: groups disown their
              flaws and cast them onto an enemy, and disagreement hardens into a refusal to look inward.
            </p>
            <p className={styles.body}>
              From behind the camera I have watched celebrations crack: the surface of unity giving way to fear and
              resentment. In those breaks, performance slips, and a different energy shows up: not joy, but the need for
              control. Conspiracy narratives can offer that control, not because they are always true, but because they
              rewrite reality so people do not have to face what scares them.
            </p>
            <p className={styles.body}>
              When projection runs the room, empathy thins. The other side is not only wrong: they are dangerous. The
              thesis names that pattern so we can talk about what happens before policy is even on the table.
            </p>
          </ProseSection>

          <hr className={styles.rule} aria-hidden="true" />

          <ProseSection label="III" title="The firehose I call political photojournalism" headingId="firehose">
            <p className={styles.subhead}>Experiencing the firehose</p>
            <p className={styles.body}>
              Barthes (1981), quoting Kafka (via Janouch), gives the line: "We photograph things in order to drive them out
              of our minds." That is close to how the camera functions for me in political spaces: the chaos is unmanageable
              without a frame. Barthes (1981) contrasts the <em>studium</em>, the culturally legible layer of an image, with
              the <em>punctum</em>, the accidental detail that pierces a viewer. On the trail, the studium is everywhere: the
              rehearsed smile, the timed applause, the gesture repeated for the jumbotron.
            </p>
            <ProseInlinePhoto
              {...trailPhoto('erie-night')}
              caption="Minnesota Gov. Tim Walz moves through a packed group of supporters at a campaign rally Sept. 5, 2024, at the Highmark Amphitheater in Erie, Pa., as attendees lean in and raise phones to record. (Photo by Caleb McCartney)"
            />
            <p className={styles.body}>
              The punctum is different: the detail that breaks through predictability, the unguarded face, the uneasy
              audience member, the doubt that flashes and disappears. Those moments pull me back to the shadow, the
              vulnerabilities we share and often refuse to admit.
            </p>
            <p className={styles.body}>
              Barthes (1981) argues that to see a photograph clearly it can help to look away, to let the image work in
              silence. I read that as permission to revisit what I could not fully process in real time. The lens becomes a
              way to hold the noise still long enough to listen.
            </p>
          </ProseSection>

          <hr className={styles.rule} aria-hidden="true" />

          <section className={styles.section} aria-labelledby="performance-reality">
            <p className={styles.sectionLabel}>IV</p>
            <h2 id="performance-reality" className={styles.sectionTitle}>
              Performance versus reality
            </h2>
            <ProseInlinePhoto
              {...trailPhoto('butler')}
              caption="Republican presidential nominee Donald Trump appears at a campaign rally Oct. 5, 2024, in Butler, Pa., with supporters and security gathered close to the stage area. In this compressed space, performance and crowd response collapse into one shared spectacle. (Photo by Caleb McCartney)"
            />
            <p className={styles.body}>
              Postman (1985) argues in <em>Amusing Ourselves to Death: Public Discourse in the Age of Show Business</em> that
              when politics is staged through television’s entertainment logic, the product is often the <em>appearance</em>{' '}
              of competence and candor rather than their substance. From the press pen I watch that choreography: a smile
              held for the screen, a chant cut for a clip, light cues that make slogans feel like sunrise.
            </p>
            <p className={styles.body}>
              Berger (1972) writes in chapter 1 of <em>Ways of Seeing</em>, “We never look at just one thing; we are always
              looking at the relation between things and ourselves.” Every frame I choose, wide or tight, declares what
              matters. More than once I have reached for the cleaner crop that flatters the campaign storyboard while a messier
              truth (someone yawning, a guard exhausted) sat just outside the edge of the frame.
            </p>
            <p className={styles.body}>
              Then comes the feeding frenzy: cameras pivot toward outrage, substance evaporates into meme, and the shutter
              becomes an ethical dial: echo rumor or stay grounded in what can be verified. The thesis asks what we are
              buying when we buy the spectacle, and what it costs when desire is trained on fear.
            </p>
            <ProseInlinePhoto
              src={imageUrl.journalism(
                'Politics/trump-returns-butler',
                '051024 Caleb McCartney_Trump Returns to Butler PA_CAL2672.webp'
              )}
              width={6573}
              height={4382}
              alt="Republican presidential nominee Donald Trump waves to the crowd during a campaign rally Oct. 5, 2024, in Butler, Pa., with a white bandage on his ear."
              caption="Republican presidential nominee Donald Trump waves to the crowd during a campaign rally Oct. 5, 2024, in Butler, Pa., with a white bandage on his ear. (Photo by Caleb McCartney)"
            />
          </section>

          <hr className={styles.rule} aria-hidden="true" />

          <section className={styles.section} aria-labelledby="the-experience">
            <p className={styles.sectionLabel}>V</p>
            <h2 id="the-experience" className={styles.sectionTitle}>
              The experience
            </h2>
            <p className={styles.body}>
              At the end of the day, this was my experience: long days in crowds and spin rooms, deadlines that did not care
              how tired you were, and a thesis that asked me to be honest about anger, fear, and belonging while I was still
              in the middle of covering them. It was a hell of an experience, in the best and hardest sense, and it changed
              how I see both politics and the camera.
            </p>
            <p className={styles.body}>
              Photographing former President Barack Obama at the University of Pittsburgh became one of those moments where
              the assignment felt bigger than the frame. Getting into the photographer pit with the other photographers meant
              working inside the same compressed rhythm: hold position, watch the stage, watch the crowd, file the clean
              frame, and still look for the human detail that did not feel manufactured.
            </p>
            <p className={styles.body}>
              The photograph in{' '}
              <a href="#trail-erie-photo" className={styles.link}>
                Along the trail
              </a>{' '}
              is Gov. Tim Walz in Erie on Sept. 5, 2024, a different assignment from another Erie night that still lives in
              my body: after Kamala Harris’s rally in Erie, I was moving constantly, trying to hit tight deadlines on photos
              from the event. I got sick on the drive back (body finally giving in) and pulled over to sleep in my car on the
              side of the highway. I was exhausted, but I was also determined to deliver. I made it home around 3 a.m., filed
              the pictures to my editor, and then shut down. The job got done. I felt like I was shutting down while I did
              it. The body had already been asking for something else.
            </p>
            <p className={styles.body}>
              There were moments after a photograph when I hesitated, wondering how an image would be misread, including
              whether a portrait of exhaustion would be weaponized as weakness. That fear lingers because many people are trained to
              retaliate before they pause to see a human being.
            </p>
          </section>
        </div>

        <section className={styles.gallerySection} aria-labelledby="exhibition-gallery-heading">
          <div className={styles.galleryHeader}>
            <p className={styles.sectionLabel}>VI</p>
            <h2 id="exhibition-gallery-heading" className={styles.sectionTitle}>
              Exhibition at AIR
            </h2>
            <p className={styles.galleryIntro}>
              <strong>One Nation Divided</strong> was the BFA thesis exhibition at{' '}
              <a href="https://www.artistsimageresource.org/" target="_blank" rel="noopener noreferrer">
                Artists Image Resource
              </a>
              , Pittsburgh. The show was titled <strong>Letting Me Go</strong>. These photographs document the exhibition installation and selected works from the show. Captions below stay descriptive and neutral.
            </p>
          </div>
          <section className={styles.artistStatementPanel} aria-labelledby="artist-statement-heading">
            <p className={styles.artistStatementLabel}>Artist Statement</p>
            <h3 id="artist-statement-heading" className={styles.artistStatementName}>
              {ARTIST_STATEMENT.name}
            </h3>
            <p className={styles.artistStatementWork}>{ARTIST_STATEMENT.title}</p>
            <div className={styles.artistStatementBody}>
              {ARTIST_STATEMENT.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className={styles.artistStatementNote}>
                The color palette in the polarized images deliberately embodies the hex codes of the American flag—specifically #B22234 (Old Glory Red), #FFFFFF (White), and #3C3B6E (Old Glory Blue)—referencing both national symbolism and a collective nostalgia for the "good ol' times" of the nuclear family. These colors, while not officially assigned meaning when the flag was adopted in 1777, have come to represent valor, purity, and vigilance (Charles Thomson, 1782, as cited in Britannica). Drawing from the tritone and pop art aesthetic that emerged in the 1950s-60s—an era when artists like Warhol and Lichtenstein appropriated consumer imagery while grappling with underlying nuclear anxieties—this work becomes my interpretation of a shared cultural longing. As art historians note, Pop art both celebrated and critiqued the American Dream, presenting "commodity as both subject and object" while exposing underlying ideological frameworks in mass media (Hamilton, 1956; Pop art thesis, 2024). This piece channels that abrupt visual energy into something that speaks for itself.
              </p>
            </div>
          </section>
          <div className={styles.gallery}>
            {EXHIBITION_IMAGES.map(({ id, src, width, height, alt, sceneCaption, gallery, field }) => (
              <GalleryFigure
                key={id}
                id={id}
                src={src}
                width={width}
                height={height}
                alt={alt}
                sceneCaption={sceneCaption}
                gallery={gallery}
                field={field}
                sizes={GALLERY_IMAGE_SIZES}
              />
            ))}
          </div>
        </section>

        <section id="thesis-pdf" aria-label="Complete thesis PDF">
          <ErrorBoundary
            fallback={
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                <p>Unable to load the thesis PDF viewer. You can download the thesis directly:</p>
                <a
                  href="/thesis.pdf"
                  download
                  style={{
                    display: 'inline-block',
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background: '#007bff',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Download Thesis PDF
                </a>
              </div>
            }
          >
            <PDFViewer
              pdfUrl="/thesis.pdf"
              title="Understanding the Noise of Today's Political Climate"
              author="Caleb McCartney"
              year={EXHIBITION_YEAR}
            />
          </ErrorBoundary>
        </section>

        <section className={styles.fieldNotesSection} aria-labelledby="field-notes-heading">
          <div className={styles.fieldNotesInner}>
            <p className={styles.sectionLabel}>Notebook</p>
            <h2 id="field-notes-heading" className={styles.fieldNotesTitle}>
              Field notes
            </h2>
            <p className={styles.fieldNotesLead}>
              Short notes for the works and install views in{' '}
              <ThemedLink href="#exhibition-gallery-heading">
                Exhibition at AIR
              </ThemedLink>
              .
            </p>
            <div className={styles.fieldNotesGrid}>
              {EXHIBITION_IMAGES.map((frame) => (
                <FieldNoteCard
                  key={frame.id}
                  id={frame.id}
                  kicker={frame.field.kicker}
                  title={frame.field.title}
                  body={frame.field.body}
                />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.gallerySection} aria-labelledby="along-the-trail-heading">
          <div className={styles.galleryHeader}>
            <p className={styles.sectionLabel}>VII</p>
            <h2 id="along-the-trail-heading" className={styles.sectionTitle}>
              Along the trail
            </h2>
            <p className={styles.galleryIntro}>
              Straight photojournalism from the same 2024 stretch as the thesis: Butler, Erie, Pittsburgh, and Johnstown.
              These are not the polarized wall pieces in{' '}
              <ThemedLink href="#exhibition-gallery-heading">
                Exhibition at AIR
              </ThemedLink>
              ; they are field images: access, a filing night, the Obama event at Pitt, and the view from the press pen, with
              captions drawn from what is in each frame.
            </p>
          </div>
          <div className={styles.gallery}>
            {TRAIL_IMAGES.map(({ id, folderPath, filename, src, width, height, alt, sceneCaption, gallery, field }) => (
              <GalleryFigure
                key={id}
                id={id}
                src={src ?? imageUrl.journalism(folderPath, filename)}
                width={width}
                height={height}
                alt={alt}
                sceneCaption={sceneCaption}
                gallery={gallery}
                field={field}
                sizes={GALLERY_IMAGE_SIZES}
                figureId={id === 'erie-night' ? 'trail-erie-photo' : undefined}
              />
            ))}
          </div>
        </section>

        <section className={styles.fieldNotesSection} aria-labelledby="trail-notes-heading">
          <div className={styles.fieldNotesInner}>
            <p className={styles.sectionLabel}>Notebook</p>
            <h2 id="trail-notes-heading" className={styles.fieldNotesTitle}>
              Trail notes
            </h2>
            <p className={styles.fieldNotesLead}>
              Short notes for the trail photographs in{' '}
              <ThemedLink href="#along-the-trail-heading">
                Along the trail
              </ThemedLink>
              .
            </p>
            <div className={styles.fieldNotesGrid}>
              {TRAIL_IMAGES.map((frame) => (
                <FieldNoteCard
                  key={frame.id}
                  id={frame.id}
                  kicker={frame.field.kicker}
                  title={frame.field.title}
                  body={frame.field.body}
                />
              ))}
            </div>
          </div>
        </section>

        <div className={styles.epigraphWrap}>
          <blockquote className={styles.pullQuoteAlt}>
            The way forward is not in more noise, but in more gentleness, not in passivity, but in presence. Artists and
            journalists walk a tightrope: document the anxiety honestly without feeding it; create space for reflection
            without dictating what should be seen; offer images not as weapons, but as mirrors.
            <cite>From the thesis conclusion</cite>
          </blockquote>
        </div>

        <div className={styles.prose}>
          <section className={styles.section} aria-labelledby="photojournalism">
            <p className={styles.sectionLabel}>VIII</p>
            <h2 id="photojournalism" className={styles.sectionTitle}>
              Related photojournalism
            </h2>
            <p className={styles.body}>
              The project draws on the same campaign trail work as my{' '}
              <Link to="/journalism" className={styles.link}>
                photojournalism portfolio
              </Link>
              , including rallies, candidates, and the moments when the crowd becomes the story.
            </p>
          </section>

          <hr className={styles.rule} aria-hidden="true" />

          <section className={styles.section} aria-labelledby="writing-project">
            <p className={styles.sectionLabel}>IX</p>
            <h2 id="writing-project" className={styles.sectionTitle}>
              Writing
            </h2>
            <p className={`${styles.body} mb-5`}>
              The written thesis (<em>Understanding the Noise of Today’s Political Climate</em>) is embedded in{' '}
              <a href="#thesis-pdf" className={styles.link}>
                Read the Complete Thesis
              </a>{' '}
              when it is available. The pieces in{' '}
              <a href="#more-writings" className={styles.link}>
                More from my writings
              </a>{' '}
              are separate: they come from the blog, not the thesis manuscript.
            </p>

            <div className={styles.moreWritings} id="more-writings" aria-labelledby="more-writings-heading">
              <h3 id="more-writings-heading" className={styles.moreWritingsTitle}>
                More from my writings
              </h3>
              <p className={styles.moreWritingsLead}>
                Essays and posts from my site that are not part of this capstone paper.
              </p>
              <ul className={styles.blogList}>
                {BLOG_LINKS.map(({ slug, label }) => (
                  <li key={slug} className={styles.blogItem}>
                    <Link to={`/blog/${slug}`} className={`${styles.link} ${styles.blogItemLink}`}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="publication">
            <p className={styles.sectionLabel}>X</p>
            <h2 id="publication" className={styles.sectionTitle}>
              Publication
            </h2>
            <div className={styles.publication}>
              <p className={styles.body}>
                The full thesis PDF is embedded above and available to download. This page holds a short version of the
                argument, installation documentation and wall works from the AIR show, trail photographs on this page, and the
                broader photojournalism portfolio; pieces under{' '}
                <a href="#more-writings" className={styles.link}>
                  More from my writings
                </a>{' '}
                belong to other work, not the capstone paper.
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="sources-context-heading">
            <p className={styles.sectionLabel}>Reading</p>
            <h2 id="sources-context-heading" className={styles.sectionTitle}>
              Sources and context
            </h2>
            <p className={styles.body}>
              The thesis follows <strong>APA Style (7th ed.)</strong>: <strong>author–date citations in the text</strong> and
              a <strong>References</strong> list. Per APA, <strong>footnotes or endnotes are not used for routine sources</strong>;
              they are reserved for a small set of cases such as <strong>copyright attribution for figures</strong> and brief{' '}
              <strong>content notes</strong> when needed (American Psychological Association, 2020).
            </p>
            <p className={styles.body}>
              This page only sketches the argument. The links below are open-web starting points (overviews, library guides,
              and Berger chapter 1 in authorized online form). The References box matches what is named in the sections above.
            </p>
            <ul className={styles.sourcesList}>
              {SOURCES_CONTEXT.map(({ label, href, detail }) => (
                <li key={href} className={styles.sourcesItem}>
                  <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
                    {label}
                  </a>
                  <span className={styles.sourcesDetail}> {detail}</span>
                </li>
              ))}
            </ul>
            <h3 className={styles.referencesApaHeading}>References</h3>
            <ul className={styles.referencesApaList}>
              <li className={styles.referenceEntry}>
                Barthes, R. (1981). <em>Camera lucida: Reflections on photography</em> (R. Howard, Trans.). Hill and Wang. (Original
                work published 1980)
              </li>
              <li className={styles.referenceEntry}>
                Berger, J. (1972). <em>Ways of seeing</em>. British Broadcasting Corporation; Penguin Books.
              </li>
              <li className={styles.referenceEntry}>
                Jung, C. G. (1966). <em>The practice of psychotherapy</em> (R. F. C. Hull, Trans.). Princeton University Press.
                (Original work published 1954)
              </li>
              <li className={styles.referenceEntry}>
                Postman, N. (1985). <em>Amusing ourselves to death: Public discourse in the age of show business</em>. Viking.
              </li>
            </ul>
            <p className={styles.referencesApaNote}>
              <strong>APA manual cited above:</strong> American Psychological Association. (2020).{' '}
              <em>Publication Manual of the American Psychological Association</em> (7th ed.). American Psychological
              Association.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default OneNationDividedPage;
