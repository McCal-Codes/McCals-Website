import type { ReactNode } from 'react';
import { Layout } from '@/components';
import { imageUrl } from '@/components/portfolio';
import { Link } from 'react-router-dom';
import { usePageMeta } from '@/hooks/usePageMeta';
import styles from './letting-me-go.module.css';
import fightPolarized from '@/assets/bfa-thesis/fight-polarized.webp';
import voteRallyPolarized from '@/assets/bfa-thesis/vote-rally-polarized.webp';
import exhibitionInstall01 from '@/assets/bfa-thesis/exhibition-01.webp';
import exhibitionInstall02 from '@/assets/bfa-thesis/exhibition-02.webp';

const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://mcc-cal.com').replace(/\/$/, '');

/** Exhibition WebP: bundled from `src/assets/bfa-thesis/` so hero and gallery always resolve in dev and production. */
const EXHIBITION_IMAGES: {
  id: string;
  src: string;
  alt: string;
  sceneCaption: string;
  gallery: { large?: boolean; centered?: boolean };
  field: { kicker: string; title: string; body: string[] };
}[] = [
  {
    id: 'work-fight',
    src: fightPolarized,
    alt: 'Polarized graphic of overlapping 2024 campaign signs reading FIGHT and a dense outdoor rally crowd in red, white and blue.',
    sceneCaption:
      'A polarized graphic shows overlapping campaign signs, including wording that reads "FIGHT," and a tightly packed crowd rendered in red, white and blue at an outdoor rally. The work was printed large for Letting Me Go at Artists Image Resource in Pittsburgh.',
    gallery: { large: true },
    field: {
      kicker: 'Work',
      title: 'Wall piece',
      body: [
        'Shown large and repeated on the wall at AIR as part of this exhibition.',
      ],
    },
  },
  {
    id: 'work-vote',
    src: voteRallyPolarized,
    alt: 'Polarized graphic of arena bleachers filled with people, VOTE letter cards, bunting and campaign signs at an indoor rally.',
    sceneCaption:
      'A polarized graphic shows spectators in arena seating holding large letters that spell "VOTE" beneath red, white and blue bunting, with additional campaign signs visible in the crowd at an indoor event. The work was printed large for Letting Me Go at Artists Image Resource in Pittsburgh.',
    gallery: {},
    field: {
      kicker: 'Work',
      title: 'Wall piece',
      body: [
        'Shown large and repeated on the wall at AIR as part of this exhibition.',
      ],
    },
  },
  {
    id: 'ex01',
    src: exhibitionInstall01,
    alt: 'Installation view of Letting Me Go prints on a white gallery wall at Artists Image Resource, Pittsburgh.',
    sceneCaption:
      'Prints from Letting Me Go hang on a gallery wall at Artists Image Resource in Pittsburgh, with floor and trim visible in the installation view.',
    gallery: {},
    field: {
      kicker: 'Install',
      title: 'In the room',
      body: ['Documentation of the hang at Artists Image Resource.'],
    },
  },
  {
    id: 'ex02',
    src: exhibitionInstall02,
    alt: 'Installation view of a row of Letting Me Go prints along one gallery wall under lights.',
    sceneCaption:
      'Several works from Letting Me Go run in a line along one wall, lit by gallery track lighting, at Artists Image Resource in Pittsburgh.',
    gallery: {},
    field: {
      kicker: 'Install',
      title: 'Along the wall',
      body: ['Documentation of the hang at Artists Image Resource.'],
    },
  },
];

/** Campaign trail frames from the thesis fieldwork; URLs via `imageUrl.journalism` (local / jsDelivr). */
const TRAIL_IMAGES: {
  id: string;
  folderPath: string;
  filename: string;
  src?: string;
  alt: string;
  sceneCaption: string;
  gallery: { large?: boolean; centered?: boolean };
  field: { kicker: string; title: string; body: string[] };
}[] = [
  {
    id: 'butler',
    folderPath: 'Politics/trump-returns-butler',
    filename: '051024_Trump_Returns_Butler_PA_CAL2649.webp',
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
    alt:
      'Minnesota Gov. Tim Walz moves through a crowd of supporters at a campaign rally in Erie, Pa.',
    sceneCaption:
      'Minnesota Gov. Tim Walz moves through a tight crowd of supporters Sept. 5, 2024, at a campaign rally at the Highmark Amphitheater in Erie, Pa. People press in from all sides, several holding up phones to record as late-day light cuts across faces in the foreground. (Photo by Caleb McCartney)',
    gallery: {},
    field: {
      kicker: 'Erie',
      title: 'Filed at 3 a.m.',
      body: [],
    },
  },
  {
    id: 'press-pen',
    folderPath: 'Politics/jdvance-johnstown',
    filename: '241012_JD Vance in Johnstown_CAL3630.webp',
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

function trailPhoto(id: (typeof TRAIL_IMAGES)[number]['id']) {
  const frame = TRAIL_IMAGES.find((t) => t.id === id);
  if (!frame) throw new Error(`Unknown trail frame: ${id}`);
  return {
    src: frame.src ?? imageUrl.journalism(frame.folderPath, frame.filename),
    alt: frame.alt,
  };
}

function ProseInlinePhoto({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className={styles.proseInlineFigure}>
      <div className={styles.proseInlineImgWrap}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
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
const BLOG_LINKS = [...WRITING_NOT_THESIS, ...BLOG_LINKS_OTHER];

/** Web-stable references for works cited or paraphrased in the short text below (not a formal bibliography). */
const SOURCES_CONTEXT: { label: string; href: string; detail: string }[] = [
  {
    label: 'Citing Jung’s Collected Works (CW)',
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
      'English trans. Richard Howard, Hill and Wang. Summarizes Barthes’s terms studium and punctum and his use of Kafka’s remark on photography (via Gustav Janouch).',
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
];

/** APA 7 reference list (same edition as the thesis). Titles in italics per style manual. */
const APA_REFERENCES: ReactNode[] = [
  <>
    Barthes, R. (1981). <em>Camera lucida: Reflections on photography</em> (R. Howard, Trans.). Hill and Wang. (Original
    work published 1980)
  </>,
  <>Berger, J. (1972). <em>Ways of seeing</em>. British Broadcasting Corporation; Penguin Books.</>,
  <>
    Jung, C. G. (1966). <em>The practice of psychotherapy</em> (R. F. C. Hull, Trans.). Princeton University Press.
    (Original work published 1954)
  </>,
  <>
    Postman, N. (1985). <em>Amusing ourselves to death: Public discourse in the age of show business</em>. Viking.
  </>,
];

const LettingMeGoPage = () => {
  const heroImageUrl = EXHIBITION_IMAGES[0].src;
  const ogImageUrl = `${SITE_URL}${EXHIBITION_IMAGES[1].src}`;

  usePageMeta({
    title: 'Letting Me Go | Thesis & Exhibition | Caleb McCartney',
    description:
      'Understanding the Noise Of Today’s Political Climate: BFA thesis and AIR exhibition on political anxiety, Jung’s shadow, the “firehose” of campaign coverage, and performance versus reality in American politics.',
    canonical: `${SITE_URL}/letting-me-go`,
    og: {
      type: 'website',
      title: 'Letting Me Go | Caleb McCartney',
      description:
        'Thesis and exhibition: political anxiety, shadow and projection, photojournalism, and the line between spectacle and truth.',
      image: ogImageUrl,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Letting Me Go | Caleb McCartney',
      description:
        'Thesis and exhibition: political anxiety, photojournalism, and performance versus reality.',
      image: ogImageUrl,
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: 'Letting Me Go',
      alternateName: 'Understanding the Noise Of Today’s Political Climate',
      url: `${SITE_URL}/letting-me-go`,
      description:
        'BFA photography thesis and exhibition examining political anxiety through Carl Jung’s shadow, campaign-trail photojournalism, install documentation at AIR, and the tension between performance and reality.',
      creator: {
        '@type': 'Person',
        name: 'Caleb McCartney',
        url: `${SITE_URL}/about`,
      },
    },
  });

  return (
    <Layout>
      <div className={styles.lmgoRoot}>
        <header className={styles.hero}>
          <img
            className={styles.heroBackdrop}
            src={heroImageUrl}
            alt=""
            decoding="async"
            fetchPriority="high"
            aria-hidden
          />
          <div className={styles.heroInner}>
            <p className={styles.kicker}>Thesis · Exhibition · 2025</p>
            <h1 className={styles.title}>Letting Me Go</h1>
            <p className={styles.thesisTitle}>
              Understanding the Noise Of Today’s Political Climate
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
          <section className={styles.section} aria-labelledby="what-this-was">
            <p className={styles.sectionLabel}>I</p>
            <h2 id="what-this-was" className={styles.sectionTitle}>
              What this was
            </h2>
            <p className={styles.body}>
              This capstone paired a written thesis with a mounted show at AIR under one question: what does it feel like
              to live inside today’s political noise? The work moves between theory and field, between Jung’s (1966) account
              of what we disown in ourselves and the rallies where those dynamics become visible: Tim Walz in Erie, Trump
              returning
              to Butler, and every other stop where belief, performance, and fear shared the same air.
            </p>
            <p className={styles.body}>
              The photographs are not illustrations of a paper. They are evidence from events where policy talk sits next
              to raw emotion, where the story is as psychological as it is electoral.
            </p>
          </section>

          <hr className={styles.rule} aria-hidden="true" />

          <section className={styles.section} aria-labelledby="shadow-projection">
            <p className={styles.sectionLabel}>II</p>
            <h2 id="shadow-projection" className={styles.sectionTitle}>
              Shadow and projection
            </h2>
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
          </section>

          <hr className={styles.rule} aria-hidden="true" />

          <section className={styles.section} aria-labelledby="firehose">
            <p className={styles.sectionLabel}>III</p>
            <h2 id="firehose" className={styles.sectionTitle}>
              The firehose I call political photojournalism
            </h2>
            <p className={styles.subhead}>Experiencing the firehose</p>
            <p className={styles.body}>
              Barthes (1981), quoting Kafka (via Janouch), gives the line: “We photograph things in order to drive them out
              of our minds.” That is close to how the camera functions for me in political spaces: the chaos is unmanageable
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
          </section>

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
              The photograph in{' '}
              <a href="#trail-erie-photo" className={styles.link}>
                Along the trail
              </a>{' '}
              is Gov. Tim Walz in Erie on Sept. 5, 2024 — a different assignment from another Erie night that still lives in
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
              <strong>Letting Me Go</strong> lived as a mounted show at{' '}
              <a href="https://www.artistsimageresource.org/" target="_blank" rel="noopener noreferrer">
                Artists Image Resource
              </a>
              , Pittsburgh. The first two images are the large polarized rally works that were repeated on the wall; the
              last two are install documentation. Captions below stay descriptive and neutral.
            </p>
          </div>
          <div className={styles.gallery}>
            {EXHIBITION_IMAGES.map(({ id, src, alt, sceneCaption, gallery, field }) => (
              <figure
                key={id}
                className={`${styles.galleryFigure} ${gallery.large ? styles.galleryFigureLarge : ''} ${gallery.centered ? styles.galleryFigureCentered : ''}`.trim()}
              >
                <div className={styles.galleryImgWrap}>
                  <img src={src} alt={alt} loading="lazy" decoding="async" />
                </div>
                <figcaption className={styles.galleryFigcaption}>
                  <span className={styles.galleryFigcaptionKicker}>{field.kicker}</span>
                  <span className={styles.galleryFigcaptionTitle}>{field.title}</span>
                  <p className={styles.gallerySceneCaption}>{sceneCaption}</p>
                  <p className={styles.galleryCredit}>Photo by Caleb McCartney</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className={styles.fieldNotesSection} aria-labelledby="field-notes-heading">
          <div className={styles.fieldNotesInner}>
            <p className={styles.sectionLabel}>Notebook</p>
            <h2 id="field-notes-heading" className={styles.fieldNotesTitle}>
              Field notes
            </h2>
            <p className={styles.fieldNotesLead}>
              Short notes for the works and install views in{' '}
              <a href="#exhibition-gallery-heading" className={styles.link}>
                Exhibition at AIR
              </a>
              .
            </p>
            <div className={styles.fieldNotesGrid}>
              {EXHIBITION_IMAGES.map((frame) => (
                <article key={frame.id} className={styles.fieldNoteCard}>
                  <p className={styles.fieldNoteKicker}>{frame.field.kicker}</p>
                  <h3 className={styles.fieldNoteCardTitle}>{frame.field.title}</h3>
                  {frame.field.body.map((p, i) => (
                    <p key={`${frame.id}-${i}`} className={styles.fieldNoteBody}>
                      {p}
                    </p>
                  ))}
                </article>
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
              Straight photojournalism from the same 2024 stretch as the thesis: Butler, Erie, and Johnstown. These are not
              the polarized wall pieces in{' '}
              <a href="#exhibition-gallery-heading" className={styles.link}>
                Exhibition at AIR
              </a>
              ; they are field images—access, a filing night, and the view from the press pen—with captions drawn from what
              is in each frame.
            </p>
          </div>
          <div className={styles.gallery}>
            {TRAIL_IMAGES.map(({ id, folderPath, filename, src, alt, sceneCaption, gallery, field }) => (
              <figure
                key={id}
                id={id === 'erie-night' ? 'trail-erie-photo' : undefined}
                className={`${styles.galleryFigure} ${gallery.large ? styles.galleryFigureLarge : ''} ${gallery.centered ? styles.galleryFigureCentered : ''}`.trim()}
              >
                <div className={styles.galleryImgWrap}>
                  <img
                    src={src ?? imageUrl.journalism(folderPath, filename)}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className={styles.galleryFigcaption}>
                  <span className={styles.galleryFigcaptionKicker}>{field.kicker}</span>
                  <span className={styles.galleryFigcaptionTitle}>{field.title}</span>
                  <p className={styles.gallerySceneCaption}>{sceneCaption}</p>
                  <p className={styles.galleryCredit}>Photo by Caleb McCartney</p>
                </figcaption>
              </figure>
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
              Short notes for the three trail photographs in{' '}
              <a href="#along-the-trail-heading" className={styles.link}>
                Along the trail
              </a>
              .
            </p>
            <div className={styles.fieldNotesGrid}>
              {TRAIL_IMAGES.map((frame) => (
                <article key={frame.id} className={styles.fieldNoteCard}>
                  <p className={styles.fieldNoteKicker}>{frame.field.kicker}</p>
                  <h3 className={styles.fieldNoteCardTitle}>{frame.field.title}</h3>
                  {frame.id === 'erie-night' ? (
                    <p className={styles.fieldNoteBody}>
                      This frame is Walz in Erie on Sept. 5, 2024. The longer story of another Erie night — after Kamala
                      Harris’s rally — is in{' '}
                      <a href="#the-experience" className={styles.link}>
                        The experience
                      </a>{' '}
                      above: sick on the drive, sleep in the car, home around 3 a.m., pictures to the editor anyway. The same
                      photograph appears in{' '}
                      <a href="#trail-erie-photo" className={styles.link}>
                        Along the trail
                      </a>
                      .
                    </p>
                  ) : (
                    frame.field.body.map((p, i) => (
                      <p key={`${frame.id}-${i}`} className={styles.fieldNoteBody}>
                        {p}
                      </p>
                    ))
                  )}
                </article>
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
              The written thesis (<em>Understanding the Noise Of Today’s Political Climate</em>) will be linked in{' '}
              <a href="#publication" className={styles.link}>
                Publication
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
                The full thesis PDF will be linked here when it is published. This page holds a short version of the
                argument, install documentation and wall works from the AIR show, trail photographs on this page, and the
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
              {APA_REFERENCES.map((entry, i) => (
                <li key={i} className={styles.referenceEntry}>
                  {entry}
                </li>
              ))}
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

export default LettingMeGoPage;
